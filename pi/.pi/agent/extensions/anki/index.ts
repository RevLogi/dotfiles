import type {
  ExtensionAPI,
  ExtensionCommandContext,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import {
  DEFAULT_DECK,
  ENGLISH_FIELDS,
  ENGLISH_MODEL,
  createEnglishNote,
  deduplicateEntries,
  htmlToText,
  invokeAnki,
  nonEmpty,
  textToHtml,
  type EnglishEntry,
} from "./core.js";

const MAX_BATCH_SIZE = 25;
const MAX_SEARCH_RESULTS = 50;
type NoteInfo = {
  noteId: number;
  modelName: string;
  tags: string[];
  fields: Record<string, { value: string; order: number }>;
};

const EnglishEntrySchema = Type.Object({
  expression: Type.String({ description: "Word or expression; becomes the first and duplicate-check field" }),
  meaning: Type.String({ description: "Concise English meaning" }),
  context: Type.Optional(Type.String({ description: "Original sentence or phrase where the expression appeared" })),
  chinese: Type.Optional(Type.String({ description: "Short Chinese gloss when useful" })),
  collocations: Type.Optional(Type.Array(Type.String(), { maxItems: 5 })),
  usage: Type.Optional(Type.String({ description: "Register, grammar, correction, or usage note" })),
  example: Type.Optional(Type.String({ description: "One natural example sentence" })),
  source: Type.Optional(Type.String({ description: "Source title, URL, or location supplied by the learner" })),
  type: Type.Optional(
    Type.Union([
      Type.Literal("word"),
      Type.Literal("phrase"),
      Type.Literal("idiom"),
      Type.Literal("collocation"),
    ]),
  ),
  tags: Type.Optional(Type.Array(Type.String(), { maxItems: 10 })),
});

const EnglishChangesSchema = Type.Object({
  expression: Type.Optional(Type.String()),
  context: Type.Optional(Type.String()),
  meaning: Type.Optional(Type.String()),
  chinese: Type.Optional(Type.String()),
  collocations: Type.Optional(Type.Array(Type.String(), { maxItems: 5 })),
  usage: Type.Optional(Type.String()),
  example: Type.Optional(Type.String()),
  source: Type.Optional(Type.String()),
});

function ensureBatch(entries: EnglishEntry[]): EnglishEntry[] {
  const unique = deduplicateEntries(entries);
  if (unique.length === 0) throw new Error("No non-empty English entries were supplied.");
  if (unique.length > MAX_BATCH_SIZE) {
    throw new Error(`At most ${MAX_BATCH_SIZE} entries can be processed at once.`);
  }
  return unique;
}

function summarizeEntries(entries: EnglishEntry[]): string {
  return entries.map((entry, index) => `${index + 1}. ${entry.expression.trim()} — ${entry.meaning.trim()}`).join("\n");
}

async function getSetupState(signal?: AbortSignal): Promise<{
  apiVersion: number;
  deckExists: boolean;
  modelExists: boolean;
}> {
  const [apiVersion, decks, models] = await Promise.all([
    invokeAnki<number>("version", {}, signal),
    invokeAnki<string[]>("deckNames", {}, signal),
    invokeAnki<string[]>("modelNames", {}, signal),
  ]);
  return {
    apiVersion,
    deckExists: decks.includes(DEFAULT_DECK),
    modelExists: models.includes(ENGLISH_MODEL),
  };
}

async function verifyModel(signal?: AbortSignal): Promise<void> {
  const fields = await invokeAnki<string[]>("modelFieldNames", { modelName: ENGLISH_MODEL }, signal);
  if (fields.join("\0") !== ENGLISH_FIELDS.join("\0")) {
    throw new Error(
      `The existing '${ENGLISH_MODEL}' note type has unexpected fields: ${fields.join(", ")}. Refusing to modify it automatically.`,
    );
  }
}

async function setupEnglish(signal?: AbortSignal): Promise<string[]> {
  const state = await getSetupState(signal);
  const created: string[] = [];

  if (!state.deckExists) {
    await invokeAnki<number>("createDeck", { deck: DEFAULT_DECK }, signal);
    created.push(`deck '${DEFAULT_DECK}'`);
  }

  if (!state.modelExists) {
    await invokeAnki<Record<string, unknown>>(
      "createModel",
      {
        modelName: ENGLISH_MODEL,
        inOrderFields: [...ENGLISH_FIELDS],
        isCloze: false,
        css: `.card {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 19px;
  line-height: 1.5;
  text-align: left;
  color: #202124;
  background: #fafafa;
  max-width: 720px;
  margin: 0 auto;
}
.expression { font-size: 1.55em; font-weight: 650; margin-bottom: .7em; }
.context, .example { color: #3c4043; margin: .7em 0; }
.label { color: #777; font-size: .72em; font-weight: 650; letter-spacing: .06em; text-transform: uppercase; margin-top: 1em; }
.answer { border-top: 1px solid #ddd; margin-top: 1.1em; padding-top: .5em; }
.meta { color: #777; font-size: .72em; margin-top: 1.4em; }
.nightMode .card { color: #e8eaed; background: #202124; }
.nightMode .context, .nightMode .example { color: #bdc1c6; }
.nightMode .answer { border-color: #5f6368; }`,
        cardTemplates: [
          {
            Name: "Recognition",
            Front: `<div class="expression">{{Expression}}</div>
{{#Context}}<div class="context">{{Context}}</div>{{/Context}}`,
            Back: `{{FrontSide}}
<div class="answer">
  <div class="label">Meaning</div><div>{{Meaning}}</div>
  {{#Chinese}}<div class="label">中文</div><div>{{Chinese}}</div>{{/Chinese}}
  {{#Collocations}}<div class="label">Collocations</div><div>{{Collocations}}</div>{{/Collocations}}
  {{#Usage}}<div class="label">Usage</div><div>{{Usage}}</div>{{/Usage}}
  {{#Example}}<div class="label">Example</div><div class="example">{{Example}}</div>{{/Example}}
  <div class="meta">{{Source}}{{#Added}} · {{Added}}{{/Added}}</div>
</div>`,
          },
        ],
      },
      signal,
    );
    created.push(`note type '${ENGLISH_MODEL}'`);
  } else {
    await verifyModel(signal);
  }

  return created;
}

function requireTui(ctx: ExtensionContext): void {
  if (ctx.mode !== "tui") {
    throw new Error("Anki writes require interactive Pi mode so the learner can confirm them.");
  }
}

async function commandSetup(ctx: ExtensionCommandContext): Promise<void> {
  const state = await getSetupState();
  if (state.deckExists && state.modelExists) {
    await verifyModel();
    ctx.ui.notify(`Anki is ready: ${DEFAULT_DECK} · ${ENGLISH_MODEL}`, "info");
    return;
  }

  const ok = await ctx.ui.confirm(
    "Set up English Anki integration?",
    `Create missing resources only:\n• deck: ${DEFAULT_DECK}\n• note type: ${ENGLISH_MODEL}`,
  );
  if (!ok) {
    ctx.ui.notify("Anki setup cancelled.", "warning");
    return;
  }

  const created = await setupEnglish();
  ctx.ui.notify(`Anki setup complete: ${created.join(", ") || "already configured"}.`, "info");
}

export default function ankiExtension(pi: ExtensionAPI) {
  pi.registerCommand("anki-status", {
    description: "Check the local AnkiConnect connection and English card setup",
    handler: async (_args, ctx) => {
      try {
        const state = await getSetupState();
        ctx.ui.notify(
          `AnkiConnect API ${state.apiVersion}\n${DEFAULT_DECK}: ${state.deckExists ? "ready" : "missing"}\n${ENGLISH_MODEL}: ${state.modelExists ? "ready" : "missing"}`,
          state.deckExists && state.modelExists ? "info" : "warning",
        );
      } catch (error) {
        ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
      }
    },
  });

  pi.registerCommand("anki-setup", {
    description: "Create the default English deck and Pi English note type",
    handler: async (_args, ctx) => {
      try {
        await commandSetup(ctx);
      } catch (error) {
        ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
      }
    },
  });

  pi.registerTool({
    name: "anki_status",
    label: "Anki status",
    description: "Check local AnkiConnect and whether the Pi English deck and note type are ready.",
    promptSnippet: "Check local AnkiConnect and English note setup",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, signal) {
      const state = await getSetupState(signal);
      return {
        content: [
          {
            type: "text",
            text: `AnkiConnect API ${state.apiVersion}; deck ${state.deckExists ? "ready" : "missing"}; note type ${state.modelExists ? "ready" : "missing"}.`,
          },
        ],
        details: state,
      };
    },
  });

  pi.registerTool({
    name: "anki_setup_english",
    label: "Set up English Anki",
    description: "Create the missing English::Inbox deck and Pi English note type after interactive confirmation.",
    promptSnippet: "Create the safe default English Anki deck and note type",
    promptGuidelines: [
      "Use anki_setup_english only when anki_status reports that the default English deck or note type is missing.",
    ],
    parameters: Type.Object({}),
    executionMode: "sequential",
    async execute(_toolCallId, _params, signal, _onUpdate, ctx) {
      const state = await getSetupState(signal);
      if (state.deckExists && state.modelExists) {
        await verifyModel(signal);
        return {
          content: [{ type: "text", text: "English Anki integration is already configured." }],
          details: { created: [] },
        };
      }

      requireTui(ctx);
      const ok = await ctx.ui.confirm(
        "Set up English Anki integration?",
        `Create missing resources only:\n• deck: ${DEFAULT_DECK}\n• note type: ${ENGLISH_MODEL}`,
      );
      if (!ok) {
        return {
          content: [{ type: "text", text: "The learner cancelled Anki setup." }],
          details: { cancelled: true },
        };
      }

      const created = await setupEnglish(signal);
      return {
        content: [{ type: "text", text: `Created ${created.join(" and ") || "nothing; setup was already complete"}.` }],
        details: { cancelled: false, created },
      };
    },
  });

  pi.registerTool({
    name: "anki_find_english",
    label: "Find English notes",
    description: `Search notes in the '${ENGLISH_MODEL}' note type. Results are capped at ${MAX_SEARCH_RESULTS}.`,
    promptSnippet: "Search existing Pi English notes without modifying Anki",
    parameters: Type.Object({
      query: Type.Optional(Type.String({ description: "Anki search terms, such as Expression:undue or tag:type::idiom" })),
      deck: Type.Optional(Type.String({ description: `Deck scope; defaults to ${DEFAULT_DECK}` })),
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: MAX_SEARCH_RESULTS, default: 20 })),
    }),
    async execute(_toolCallId, params, signal) {
      const deck = nonEmpty(params.deck) || DEFAULT_DECK;
      const query = `deck:"${deck.replaceAll('"', '\\"')}" note:"${ENGLISH_MODEL}" ${nonEmpty(params.query)}`.trim();
      const ids = await invokeAnki<number[]>("findNotes", { query }, signal);
      const selected = ids.slice(0, params.limit ?? 20);
      const notes = selected.length
        ? await invokeAnki<NoteInfo[]>("notesInfo", { notes: selected }, signal)
        : [];
      const summaries = notes.map((note) => ({
        noteId: note.noteId,
        expression: htmlToText(note.fields.Expression?.value ?? ""),
        meaning: htmlToText(note.fields.Meaning?.value ?? ""),
        context: htmlToText(note.fields.Context?.value ?? "").slice(0, 300),
        tags: note.tags,
      }));
      return {
        content: [
          {
            type: "text",
            text: summaries.length
              ? summaries.map((note) => `${note.noteId}: ${note.expression} — ${note.meaning}`).join("\n")
              : "No matching Pi English notes.",
          },
        ],
        details: { query, totalMatches: ids.length, notes: summaries },
      };
    },
  });

  pi.registerTool({
    name: "anki_add_english",
    label: "Preview/add English notes",
    description:
      "Validate and preview English notes, check Anki duplicates, and optionally add eligible notes after interactive confirmation. Preview is the default.",
    promptSnippet: "Preview and safely add structured English notes to Anki",
    promptGuidelines: [
      "Call anki_add_english with write omitted or false before any write; only call it with write true after the learner approves the preview.",
      "Never claim an Anki note was added unless anki_add_english returns a non-null note ID.",
    ],
    parameters: Type.Object({
      entries: Type.Array(EnglishEntrySchema, { minItems: 1, maxItems: MAX_BATCH_SIZE }),
      deck: Type.Optional(Type.String({ description: `Target deck; defaults to ${DEFAULT_DECK}` })),
      write: Type.Optional(Type.Boolean({ description: "False previews; true requests confirmed insertion", default: false })),
    }),
    executionMode: "sequential",
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const entries = ensureBatch(params.entries);
      const deck = nonEmpty(params.deck) || DEFAULT_DECK;
      const notes = entries.map((entry) => createEnglishNote(entry, deck));
      await verifyModel(signal);
      const eligible = await invokeAnki<boolean[]>("canAddNotes", { notes }, signal);
      const accepted = entries.filter((_entry, index) => eligible[index]);
      const duplicates = entries.filter((_entry, index) => !eligible[index]);
      const preview = summarizeEntries(entries);

      if (!params.write) {
        return {
          content: [
            {
              type: "text",
              text: `Preview for ${deck}:\n${preview}\n\nEligible: ${accepted.length}; duplicate or invalid: ${duplicates.length}.${duplicates.length ? `\nSkipped: ${duplicates.map((entry) => entry.expression).join(", ")}` : ""}`,
            },
          ],
          details: {
            mode: "preview",
            deck,
            entries,
            eligible: accepted.map((entry) => entry.expression),
            skipped: duplicates.map((entry) => entry.expression),
          },
        };
      }

      if (accepted.length === 0) {
        return {
          content: [{ type: "text", text: "Nothing was added; every candidate was a duplicate or invalid." }],
          details: { mode: "write", added: [], skipped: duplicates.map((entry) => entry.expression) },
        };
      }

      requireTui(ctx);
      const ok = await ctx.ui.confirm(
        `Add ${accepted.length} English note${accepted.length === 1 ? "" : "s"} to Anki?`,
        summarizeEntries(accepted),
      );
      if (!ok) {
        return {
          content: [{ type: "text", text: "The learner cancelled the Anki write." }],
          details: { mode: "write", cancelled: true, added: [] },
        };
      }

      const acceptedNotes = notes.filter((_note, index) => eligible[index]);
      const ids = await invokeAnki<Array<number | null>>("addNotes", { notes: acceptedNotes }, signal);
      const added = accepted.map((entry, index) => ({ expression: entry.expression, noteId: ids[index] }));
      return {
        content: [
          {
            type: "text",
            text: `Added ${added.filter((item) => item.noteId !== null).length}/${accepted.length} notes to ${deck}.` +
              (duplicates.length ? ` Skipped duplicates: ${duplicates.map((entry) => entry.expression).join(", ")}.` : ""),
          },
        ],
        details: { mode: "write", cancelled: false, added, skipped: duplicates.map((entry) => entry.expression) },
      };
    },
  });

  pi.registerTool({
    name: "anki_update_english",
    label: "Update English note",
    description: "Update selected fields on one Pi English note after interactive confirmation. Does not delete notes or change scheduling.",
    promptSnippet: "Safely correct fields on one existing Pi English note",
    parameters: Type.Object({
      noteId: Type.Integer({ minimum: 1 }),
      changes: EnglishChangesSchema,
    }),
    executionMode: "sequential",
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const infos = await invokeAnki<NoteInfo[]>("notesInfo", { notes: [params.noteId] }, signal);
      const note = infos[0];
      if (!note) throw new Error(`Anki note ${params.noteId} was not found.`);
      if (note.modelName !== ENGLISH_MODEL) {
        throw new Error(`Anki note ${params.noteId} uses '${note.modelName}', not '${ENGLISH_MODEL}'.`);
      }

      const fieldMap: Record<string, string | string[] | undefined> = {
        Expression: params.changes.expression,
        Context: params.changes.context,
        Meaning: params.changes.meaning,
        Chinese: params.changes.chinese,
        Collocations: params.changes.collocations,
        Usage: params.changes.usage,
        Example: params.changes.example,
        Source: params.changes.source,
      };
      const fields = Object.fromEntries(
        Object.entries(fieldMap)
          .filter(([, value]) => value !== undefined)
          .map(([field, value]) => [field, textToHtml(Array.isArray(value) ? value.join("\n") : value)]),
      );
      if (Object.keys(fields).length === 0) throw new Error("No fields were supplied to update.");

      requireTui(ctx);
      const existing = htmlToText(note.fields.Expression?.value ?? String(params.noteId));
      const ok = await ctx.ui.confirm(
        `Update '${existing}'?`,
        Object.entries(fields).map(([field, value]) => `${field}: ${htmlToText(value) || "(clear)"}`).join("\n"),
      );
      if (!ok) {
        return {
          content: [{ type: "text", text: "The learner cancelled the Anki update." }],
          details: { cancelled: true, noteId: params.noteId },
        };
      }

      await invokeAnki<null>("updateNoteFields", { note: { id: params.noteId, fields } }, signal);
      return {
        content: [{ type: "text", text: `Updated note ${params.noteId}: ${Object.keys(fields).join(", ")}.` }],
        details: { cancelled: false, noteId: params.noteId, fields: Object.keys(fields) },
      };
    },
  });

  pi.registerTool({
    name: "anki_review_stats",
    label: "Anki review stats",
    description: "Read the due-card count for an English deck and the number of cards reviewed today.",
    promptSnippet: "Check English Anki due and reviewed-today counts",
    parameters: Type.Object({
      deck: Type.Optional(Type.String({ description: `Deck scope; defaults to ${DEFAULT_DECK}` })),
    }),
    async execute(_toolCallId, params, signal) {
      const deck = nonEmpty(params.deck) || DEFAULT_DECK;
      const escapedDeck = deck.replaceAll('"', '\\"');
      const [dueCards, reviewedToday] = await Promise.all([
        invokeAnki<number[]>("findCards", { query: `deck:"${escapedDeck}" is:due` }, signal),
        invokeAnki<number>("getNumCardsReviewedToday", {}, signal),
      ]);
      return {
        content: [{ type: "text", text: `${deck}: ${dueCards.length} due; ${reviewedToday} cards reviewed today across Anki.` }],
        details: { deck, due: dueCards.length, reviewedToday },
      };
    },
  });
}
