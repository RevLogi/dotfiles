import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";

import { classifyDangerousCommand } from "../bash-guard.ts";
import { bashMayWriteMaterial, isInside } from "../learning-workspace.ts";

describe("bash guard", () => {
  test.each([
    ["sudo brew update", "privileged command"],
    ["rm -rf build", "file deletion"],
    ["git reset --hard HEAD~1", "destructive Git operation"],
    ["find . -name '*.tmp' -delete", "recursive find deletion"],
    ["dd if=image.iso of=/dev/disk4", "raw device or file overwrite"],
  ])("classifies %s", (command, reason) => {
    expect(classifyDangerousCommand(command)).toBe(reason);
  });

  test.each(["git status", "npm test", "rmatrix", "printf 'rm -rf /'"])("allows %s", (command) => {
    expect(classifyDangerousCommand(command)).toBeUndefined();
  });
});

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
