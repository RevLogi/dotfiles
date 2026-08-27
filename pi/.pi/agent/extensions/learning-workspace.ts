import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";

const STATUS_KEY = "learning-workspace";
const COURSE_FILE = "COURSE.md";
const MATERIAL_DIR = "material";

let materialWriteEnabled = false;

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function findCourseRoot(start: string): string | undefined {
  let current = resolve(start);

  for (let depth = 0; depth < 8; depth += 1) {
    if (existsSync(resolve(current, COURSE_FILE)) && isDirectory(resolve(current, MATERIAL_DIR))) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return undefined;
}

function extractSection(markdown: string, heading: string): string {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === `## ${heading}`.toLowerCase());
  if (start < 0) return "(not recorded)";

  const collected: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) break;
    collected.push(lines[index]);
  }
  return collected.join("\n").trim() || "(not recorded)";
}

function displayTitle(courseRoot: string): string {
  try {
    const firstLine = readFileSync(resolve(courseRoot, COURSE_FILE), "utf8").split("\n", 1)[0];
    return firstLine.replace(/^#\s+/, "").trim() || basename(courseRoot);
  } catch {
    return basename(courseRoot);
  }
}

export function isInside(path: string, parent: string): boolean {
  const relation = relative(parent, path);
  return relation === "" || (!relation.startsWith(`..${sep}`) && relation !== ".." && !isAbsolute(relation));
}

function resolveToolPath(path: string, cwd: string): string {
  return isAbsolute(path) ? resolve(path) : resolve(cwd, path);
}

export function bashMayWriteMaterial(command: string, courseRoot: string, cwd: string): boolean {
  const materialRoot = resolve(courseRoot, MATERIAL_DIR);
  const relativeMaterialRoot = relative(cwd, materialRoot);
  const mutationPatterns = [
    /\b(?:cp|mv|rm|mkdir|touch|install|truncate)\b/i,
    /\btee\b/i,
    /\bsed\b[^\n;]*(?:\s-i|--in-place)/i,
    /(?:^|[^<])>{1,2}(?!=)/,
  ];

  return command.split(/&&|\|\||[;\n]/).some((segment) => {
    const mentionsMaterial =
      segment.includes(materialRoot) ||
      (relativeMaterialRoot !== "." && segment.includes(relativeMaterialRoot)) ||
      /(?:^|[\s"'=])(?:\.\/)?material(?:\/|[\s"'=]|$)/i.test(segment);

    return mentionsMaterial && mutationPatterns.some((pattern) => pattern.test(segment));
  });
}

function updateStatus(ctx: ExtensionContext): void {
  const courseRoot = findCourseRoot(ctx.cwd);
  if (!courseRoot) {
    ctx.ui.setStatus(STATUS_KEY, undefined);
    return;
  }

  const suffix = materialWriteEnabled ? " · material write" : "";
  ctx.ui.setStatus(
    STATUS_KEY,
    ctx.ui.theme.fg("accent", `📚 ${displayTitle(courseRoot)}${suffix}`),
  );
}

export default function learningWorkspace(pi: ExtensionAPI) {
  pi.registerCommand("course-status", {
    description: "Show the active course position and next action",
    handler: async (_args, ctx) => {
      const courseRoot = findCourseRoot(ctx.cwd);
      if (!courseRoot) {
        ctx.ui.notify("No course workspace found. Start Pi in or below a directory containing COURSE.md and material/.", "warning");
        return;
      }

      const course = readFileSync(resolve(courseRoot, COURSE_FILE), "utf8");
      const current = extractSection(course, "Current position");
      const next = extractSection(course, "Next");
      ctx.ui.notify(`${displayTitle(courseRoot)}\n\nCurrent position\n${current}\n\nNext\n${next}`, "info");
    },
  });

  pi.registerCommand("material-write", {
    description: "Temporarily allow or block writes under the active course material/ directory",
    getArgumentCompletions(prefix) {
      const actions = ["on", "off", "status"];
      const matches = actions
        .filter((action) => action.startsWith(prefix.trim().toLowerCase()))
        .map((action) => ({ value: action, label: action }));
      return matches.length > 0 ? matches : null;
    },
    handler: async (args, ctx) => {
      const action = args.trim().toLowerCase() || "status";
      if (action === "on") materialWriteEnabled = true;
      else if (action === "off") materialWriteEnabled = false;
      else if (action !== "status") {
        ctx.ui.notify("Usage: /material-write [on|off|status]", "warning");
        return;
      }

      updateStatus(ctx);
      ctx.ui.notify(
        materialWriteEnabled
          ? "Material writes are allowed for this Pi session. Turn them off after importing or reorganizing sources."
          : "Material writes are blocked. COURSE.md, PROGRESS.md, QUESTIONS.md, CONCEPTS.md, and sessions/ remain writable.",
        materialWriteEnabled ? "warning" : "info",
      );
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    materialWriteEnabled = false;
    updateStatus(ctx);
  });

  pi.on("before_agent_start", async (event, ctx) => {
    const courseRoot = findCourseRoot(ctx.cwd);
    if (!courseRoot) return undefined;

    updateStatus(ctx);
    return {
      systemPrompt:
        event.systemPrompt +
        `\n\n## Active learning workspace\n` +
        `The course root is ${courseRoot}. Treat COURSE.md, PROGRESS.md, QUESTIONS.md, CONCEPTS.md, and sessions/ as structured persistent learning state. Read only the state and source slices needed for the current request. Treat material/ as source evidence, not agent-authored notes, and do not modify it unless the learner explicitly enables /material-write on for an import or maintenance task. Record only demonstrated learning; never infer mastery from exposure or multiple-choice recognition alone.`,
    };
  });

  pi.on("tool_call", async (event, ctx) => {
    if (materialWriteEnabled) return undefined;

    const courseRoot = findCourseRoot(ctx.cwd);
    if (!courseRoot) return undefined;
    const materialRoot = resolve(courseRoot, MATERIAL_DIR);

    if ((event.toolName === "write" || event.toolName === "edit") && typeof event.input.path === "string") {
      const target = resolveToolPath(event.input.path, ctx.cwd);
      if (isInside(target, materialRoot)) {
        return {
          block: true,
          reason: `Primary material is protected: ${target}. Run /material-write on only when the learner explicitly wants to import or maintain source material.`,
        };
      }
    }

    if (event.toolName === "bash" && typeof event.input.command === "string") {
      if (bashMayWriteMaterial(event.input.command, courseRoot, ctx.cwd)) {
        return {
          block: true,
          reason: "This shell command may modify the protected material/ directory. Run /material-write on only for an explicit source import or maintenance task.",
        };
      }
    }

    return undefined;
  });
}
