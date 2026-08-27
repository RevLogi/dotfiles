export const DEFAULT_DECK = "English::Inbox";
export const ENGLISH_MODEL = "Pi English";
export const ENGLISH_FIELDS = [
  "Expression",
  "Context",
  "Meaning",
  "Chinese",
  "Collocations",
  "Usage",
  "Example",
  "Source",
  "Added",
] as const;

const REQUEST_TIMEOUT_MS = 8000;

type AnkiResponse<T> = {
  result: T | null;
  error: string | null;
};

export type EnglishEntry = {
  expression: string;
  meaning: string;
  context?: string;
  chinese?: string;
  collocations?: string[];
  usage?: string;
  example?: string;
  source?: string;
  type?: "word" | "phrase" | "idiom" | "collocation";
  tags?: string[];
};

export type AnkiNote = {
  deckName: string;
  modelName: string;
  fields: Record<string, string>;
  options: {
    allowDuplicate: false;
    duplicateScope: "collection";
    duplicateScopeOptions: {
      checkAllModels: false;
    };
  };
  tags: string[];
};

export function nonEmpty(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function textToHtml(value: string | undefined): string {
  return nonEmpty(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replace(/\r?\n/g, "<br>");
}

export function htmlToText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .trim();
}

export function sanitizeTag(value: string): string | undefined {
  const tag = value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}_:-]/gu, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
  return tag || undefined;
}

function localDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function deduplicateEntries(entries: EnglishEntry[]): EnglishEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = entry.expression.trim().toLocaleLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function createEnglishNote(
  entry: EnglishEntry,
  deckName = DEFAULT_DECK,
  added = localDate(),
): AnkiNote {
  const expression = nonEmpty(entry.expression);
  const meaning = nonEmpty(entry.meaning);
  if (!expression) throw new Error("Every English entry needs a non-empty expression.");
  if (!meaning) throw new Error(`English entry '${expression}' needs a concise meaning.`);

  const tags = [
    "pi::english",
    `type::${entry.type ?? "word"}`,
    ...((entry.tags ?? []).map(sanitizeTag).filter(Boolean) as string[]),
  ];

  return {
    deckName: nonEmpty(deckName) || DEFAULT_DECK,
    modelName: ENGLISH_MODEL,
    fields: {
      Expression: textToHtml(expression),
      Context: textToHtml(entry.context),
      Meaning: textToHtml(meaning),
      Chinese: textToHtml(entry.chinese),
      Collocations: textToHtml(entry.collocations?.map((item) => item.trim()).filter(Boolean).join("\n")),
      Usage: textToHtml(entry.usage),
      Example: textToHtml(entry.example),
      Source: textToHtml(entry.source),
      Added: textToHtml(added),
    },
    options: {
      allowDuplicate: false,
      duplicateScope: "collection",
      duplicateScopeOptions: { checkAllModels: false },
    },
    tags: [...new Set(tags)],
  };
}

export function resolveAnkiEndpoint(raw = process.env.ANKI_CONNECT_URL): string {
  const endpoint = new URL(raw?.trim() || "http://127.0.0.1:8765");
  const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
  if (endpoint.protocol !== "http:" || !loopbackHosts.has(endpoint.hostname)) {
    throw new Error("ANKI_CONNECT_URL must use plain HTTP on localhost or a loopback address.");
  }
  endpoint.pathname = endpoint.pathname.replace(/\/$/, "") || "/";
  endpoint.search = "";
  endpoint.hash = "";
  return endpoint.toString();
}

export async function invokeAnki<T>(
  action: string,
  params: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });

  try {
    const key = process.env.ANKI_CONNECT_KEY;
    const response = await fetch(resolveAnkiEndpoint(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, version: 6, params, ...(key ? { key } : {}) }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`AnkiConnect returned HTTP ${response.status}.`);

    const payload = (await response.json()) as Partial<AnkiResponse<T>> | null;
    if (typeof payload !== "object" || payload === null || !("result" in payload) || !("error" in payload)) {
      throw new Error("AnkiConnect returned an unexpected response.");
    }
    if (payload.error) throw new Error(payload.error);
    return payload.result as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("AnkiConnect request timed out. Make sure desktop Anki is open.");
    }
    if (error instanceof TypeError) {
      throw new Error("Cannot reach AnkiConnect. Open desktop Anki and verify add-on 2055492159 is installed.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
