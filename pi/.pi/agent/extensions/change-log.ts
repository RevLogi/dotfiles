import {
  isEditToolResult,
  isWriteToolResult,
  type ExtensionAPI,
  type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { isAbsolute, relative, resolve } from "node:path";

const STATUS_KEY = "change-log";
const ENTRY_TYPE = "change-log-state";

interface ChangeEntry {
  path: string;
  kind: "edit" | "write";
  added: number;
  removed: number;
}

interface StoredEntry extends Partial<ChangeEntry> {
  clear?: boolean;
}

const changes = new Map<string, ChangeEntry>();

function countPatch(patch: string | undefined): { added: number; removed: number } {
  if (!patch) return { added: 0, removed: 0 };

  let added = 0;
  let removed = 0;
  for (const line of patch.split("\n")) {
    if (line.startsWith("+") && !line.startsWith("+++")) added += 1;
    else if (line.startsWith("-") && !line.startsWith("---")) removed += 1;
  }
  return { added, removed };
}

function displayPath(path: string, cwd: string): string {
  const absolute = isAbsolute(path) ? resolve(path) : resolve(cwd, path);
  const local = relative(cwd, absolute);
  return local && !local.startsWith("..") ? local : absolute;
}

function mergeChange(entry: ChangeEntry): void {
  const previous = changes.get(entry.path);
  if (!previous) {
    changes.set(entry.path, entry);
    return;
  }

  changes.set(entry.path, {
    path: entry.path,
    kind: entry.kind,
    added: previous.added + entry.added,
    removed: previous.removed + entry.removed,
  });
}

function updateStatus(ctx: ExtensionContext): void {
  if (changes.size === 0) {
    ctx.ui.setStatus(STATUS_KEY, undefined);
    return;
  }
  ctx.ui.setStatus(STATUS_KEY, ctx.ui.theme.fg("accent", `Δ ${changes.size} file${changes.size === 1 ? "" : "s"}`));
}

function renderChanges(): string {
  const entries = [...changes.values()].sort((a, b) => a.path.localeCompare(b.path));
  const visible = entries.slice(0, 20).map((entry) => {
    const action = entry.kind === "write" ? "write" : "edit ";
    return `${action}  ${entry.path}  (+${entry.added}/-${entry.removed})`;
  });
  if (entries.length > visible.length) visible.push(`… and ${entries.length - visible.length} more`);

  return [
    `${entries.length} file${entries.length === 1 ? "" : "s"} changed through Pi's edit/write tools:`,
    "",
    ...visible,
    "",
    "Shell-created changes are not included. Use git diff/status when the workspace is a repository.",
  ].join("\n");
}

export default function changeLog(pi: ExtensionAPI) {
  pi.registerCommand("changes", {
    description: "Show or clear the current session's edit/write file list",
    getArgumentCompletions(prefix) {
      const actions = ["show", "clear"];
      const matches = actions
        .filter((action) => action.startsWith(prefix.trim().toLowerCase()))
        .map((action) => ({ value: action, label: action }));
      return matches.length > 0 ? matches : null;
    },
    handler: async (args, ctx) => {
      const action = args.trim().toLowerCase() || "show";
      if (action === "clear") {
        changes.clear();
        pi.appendEntry<StoredEntry>(ENTRY_TYPE, { clear: true });
        updateStatus(ctx);
        ctx.ui.notify("File change list cleared. Files were not modified.", "info");
        return;
      }
      if (action !== "show") {
        ctx.ui.notify("Usage: /changes [show|clear]", "warning");
        return;
      }
      ctx.ui.notify(changes.size === 0 ? "No edit/write file changes recorded in this session." : renderChanges(), "info");
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    changes.clear();
    for (const entry of ctx.sessionManager.getEntries()) {
      if (entry.type !== "custom" || entry.customType !== ENTRY_TYPE) continue;
      const data = entry.data as StoredEntry | undefined;
      if (!data) continue;
      if (data.clear) {
        changes.clear();
        continue;
      }
      if (
        typeof data.path === "string" &&
        (data.kind === "edit" || data.kind === "write") &&
        typeof data.added === "number" &&
        typeof data.removed === "number"
      ) {
        mergeChange(data as ChangeEntry);
      }
    }
    updateStatus(ctx);
  });

  pi.on("tool_result", async (event, ctx) => {
    if (event.isError || (!isEditToolResult(event) && !isWriteToolResult(event))) return undefined;
    if (typeof event.input.path !== "string") return undefined;

    const path = displayPath(event.input.path, ctx.cwd);
    let added = 0;
    let removed = 0;

    if (isEditToolResult(event)) {
      ({ added, removed } = countPatch(event.details?.patch));
    } else if (typeof event.input.content === "string") {
      added = event.input.content.length === 0 ? 0 : event.input.content.split("\n").length;
    }

    const change: ChangeEntry = { path, kind: event.toolName, added, removed };
    mergeChange(change);
    pi.appendEntry<StoredEntry>(ENTRY_TYPE, change);
    updateStatus(ctx);
    return undefined;
  });
}
