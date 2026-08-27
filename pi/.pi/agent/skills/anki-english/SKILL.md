---
name: anki-english
description: Turn English words, phrases, collocations, idioms, and source sentences into concise, context-rich Anki notes through the local anki_* tools. Use when the learner asks to capture, organize, preview, add, find, correct, or inspect English vocabulary in Anki; mentions an Anki inbox or daily vocabulary review; or provides a batch of English expressions intended for flashcards.
---

# Anki English

Use Anki as the review system, not as a dumping ground. Preserve the learner's low-friction capture habit while keeping each saved note useful in context.

## Establish the connection

1. Call `anki_status` before the first Anki operation in a session.
2. If the default deck or note type is missing, explain that setup only creates `English::Inbox` and `Pi English`, then call `anki_setup_english`.
3. If AnkiConnect is unreachable, tell the learner to open desktop Anki and verify that add-on `2055492159` is installed. Do not work around this by exposing port 8765 to the network.

## Prepare entries

Transform each captured item into the `anki_add_english` entry shape:

- `expression`: Preserve the useful lexical unit, not necessarily one word. Correct an evidently unnatural expression, but show the correction before saving.
- `context`: Preserve the learner's original sentence when supplied, but directly correct clear spelling, grammar, and collocation errors rather than retaining the erroneous wording. Mention substantive corrections in the preview. Do not invent a source quotation.
- `meaning`: Give one concise English definition matching the supplied context.
- `chinese`: Add a short Chinese gloss when it removes ambiguity; do not turn it into a long translation.
- `collocations`: Include at most three common, useful combinations. Prefer none over speculative combinations.
- `usage`: Record only a useful constraint such as register, grammar, connotation, or a correction.
- `example`: Write one short natural example distinct from the original context. Omit it when the context is already sufficient.
- `source`: Preserve only source information the learner supplied or that is available in the active material.
- `type`: Choose `word`, `phrase`, `idiom`, or `collocation`.
- `tags`: Add only retrieval-relevant tags. Never encode mastery or scheduling state in tags.

Do not create multiple near-identical notes from an expression and each of its collocations. Prefer one note centered on the expression unless the collocation has an independently useful meaning or usage constraint.

## Preview and write

1. Call `anki_add_english` with `write` omitted or `false`.
2. Present a compact preview and explicitly point out corrections, uncertain meanings, and duplicate or invalid entries.
3. Ask one blocking confirmation with `ask_user`. Offer clear choices such as `Add eligible notes`, `Revise`, and `Cancel`; do not permit an open-ended alternative when those three choices cover the decision.
4. Only after `Add eligible notes`, call `anki_add_english` again with the same entries and `write: true`. The extension performs a final native confirmation and duplicate check.
5. Report note IDs returned by the tool and distinguish added, skipped, failed, and cancelled items. Never claim success from a preview.

If the learner explicitly asks only for a preview, stop after step 2. If the learner asks to add immediately, still preview once; keep the explanation brief because the extension will require final confirmation.

## Find and correct

- Use `anki_find_english` before editing an existing note. Narrow by expression, tag, or deck when possible.
- Show the selected note ID and proposed field changes.
- Call `anki_update_english` only after the learner chooses the intended note. The extension requires confirmation and refuses to edit other note types.
- Never use shell commands or raw HTTP requests to delete, reschedule, or bulk-modify Anki data.

## Review status

Use `anki_review_stats` for due and reviewed-today counts. Let Anki control scheduling and let the learner grade their own recall; do not answer cards or infer mastery on their behalf.

## Finish

Summarize what entered Anki, what was skipped, and one next action. Keep raw capture and source material outside Anki when they are not useful review prompts.
