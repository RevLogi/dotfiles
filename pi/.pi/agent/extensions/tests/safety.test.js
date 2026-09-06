import { describe, expect, test } from "bun:test";

import { classifyDangerousCommand } from "../bash-guard.ts";

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
