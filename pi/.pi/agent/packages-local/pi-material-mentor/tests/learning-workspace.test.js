import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";

import { bashMayWriteMaterial, isInside } from "../extensions/learning-workspace.ts";

describe("learning workspace guard", () => {
  const courseRoot = "/tmp/course";
  const materialRoot = resolve(courseRoot, "material");

  test("recognizes paths inside material", () => {
    expect(isInside(resolve(materialRoot, "chapter.md"), materialRoot)).toBe(true);
    expect(isInside(resolve(courseRoot, "COURSE.md"), materialRoot)).toBe(false);
  });

  test.each([
    "cp notes.md material/chapter.md",
    "sed -i '' s/old/new/ material/chapter.md",
    "printf text > material/chapter.md",
  ])("blocks likely material mutation: %s", (command) => {
    expect(bashMayWriteMaterial(command, courseRoot, courseRoot)).toBe(true);
  });

  test.each([
    "rg concept material",
    "sed -n '1,20p' material/chapter.md",
    "cat material/chapter.md",
  ])("allows material reads: %s", (command) => {
    expect(bashMayWriteMaterial(command, courseRoot, courseRoot)).toBe(false);
  });
});
