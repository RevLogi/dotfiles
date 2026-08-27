import { describe, expect, test } from "bun:test";

import {
  DEFAULT_DECK,
  ENGLISH_MODEL,
  createEnglishNote,
  deduplicateEntries,
  htmlToText,
  resolveAnkiEndpoint,
  sanitizeTag,
  textToHtml,
} from "../anki/core.ts";

describe("Anki connection safety", () => {
  test.each([
    [undefined, "http://127.0.0.1:8765/"],
    ["http://localhost:8765", "http://localhost:8765/"],
    ["http://[::1]:8765", "http://[::1]:8765/"],
  ])("accepts loopback endpoint %s", (input, expected) => {
    expect(resolveAnkiEndpoint(input)).toBe(expected);
  });

  test.each(["https://127.0.0.1:8765", "http://192.168.1.20:8765", "http://anki.example.com"])(
    "rejects endpoint %s",
    (input) => {
      expect(() => resolveAnkiEndpoint(input)).toThrow("localhost or a loopback address");
    },
  );
});

describe("English note construction", () => {
  test("escapes learner content and builds the dedicated model", () => {
    const note = createEnglishNote(
      {
        expression: "fumble the bag",
        meaning: "lose an opportunity",
        context: "I <really> fumbled the bag.",
        collocations: ["completely fumble the bag", "don't fumble the bag"],
        type: "idiom",
        tags: ["YouTube clip", "bad/tag"],
      },
      undefined,
      "2026-08-22",
    );

    expect(note.deckName).toBe(DEFAULT_DECK);
    expect(note.modelName).toBe(ENGLISH_MODEL);
    expect(note.fields.Context).toBe("I &lt;really&gt; fumbled the bag.");
    expect(note.fields.Collocations).toContain("<br>");
    expect(note.fields.Added).toBe("2026-08-22");
    expect(note.tags).toContain("type::idiom");
    expect(note.tags).toContain("YouTube_clip");
    expect(note.options.allowDuplicate).toBe(false);
  });

  test("requires the two core fields", () => {
    expect(() => createEnglishNote({ expression: "", meaning: "meaning" })).toThrow("non-empty expression");
    expect(() => createEnglishNote({ expression: "undue", meaning: "" })).toThrow("concise meaning");
  });

  test("deduplicates expressions case-insensitively", () => {
    const entries = deduplicateEntries([
      { expression: "Undue", meaning: "too much" },
      { expression: " undue ", meaning: "duplicate" },
      { expression: "innocuous", meaning: "harmless" },
    ]);
    expect(entries.map((entry) => entry.expression)).toEqual(["Undue", "innocuous"]);
  });
});

describe("Anki field formatting", () => {
  test("round-trips basic escaped text", () => {
    const source = `less < more & "quoted"\nsecond line`;
    expect(htmlToText(textToHtml(source))).toBe(source);
  });

  test.each([
    ["YouTube video", "YouTube_video"],
    [" type::idiom ", "type::idiom"],
    ["", undefined],
  ])("sanitizes tag %s", (input, expected) => {
    expect(sanitizeTag(input)).toBe(expected);
  });
});
