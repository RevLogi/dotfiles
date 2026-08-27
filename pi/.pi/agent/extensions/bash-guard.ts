import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const STATUS_KEY = "bash-guard";
let enabled = true;

const RISKS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\b(?:sudo|doas)\b/i, reason: "privileged command" },
  {
    pattern: /(?:^|[\n;&|]\s*|\b(?:then|do|xargs)\s+|\b(?:bash|sh|zsh)\s+-c\s+["'])\s*(?:rm|rmdir|unlink)\b/i,
    reason: "file deletion",
  },
  { pattern: /\bfind\b[^\n;]*\s-delete\b/i, reason: "recursive find deletion" },
  {
    pattern: /\bgit\s+(?:reset\s+--hard|clean\b[^\n;]*\s-[^\s;]*f|checkout\s+--|restore\b|branch\s+-D|push\b[^\n;]*--force(?:-with-lease)?)/i,
    reason: "destructive Git operation",
  },
  { pattern: /\b(?:diskutil\s+(?:erase|partition)|mkfs(?:\.\w+)?|shutdown|reboot|halt|poweroff)\b/i, reason: "system or disk operation" },
  { pattern: /\bdd\b[^\n;]*\bof=/i, reason: "raw device or file overwrite" },
  { pattern: /\b(?:chmod|chown)\b[^\n;]*(?:\s-R\b|--recursive\b|\b777\b)/i, reason: "broad permission change" },
  { pattern: /\bkill\s+-9\s+-1\b/i, reason: "kill all accessible processes" },
];

export function classifyDangerousCommand(command: string): string | undefined {
  return RISKS.find(({ pattern }) => pattern.test(command))?.reason;
}

function updateStatus(ctx: ExtensionContext): void {
  ctx.ui.setStatus(
    STATUS_KEY,
    enabled ? ctx.ui.theme.fg("success", "🛡 guard") : ctx.ui.theme.fg("warning", "⚠ guard off"),
  );
}

export default function bashGuard(pi: ExtensionAPI) {
  pi.registerCommand("safety", {
    description: "Enable, disable, or inspect dangerous shell command confirmation",
    getArgumentCompletions(prefix) {
      const actions = ["on", "off", "status"];
      const matches = actions
        .filter((action) => action.startsWith(prefix.trim().toLowerCase()))
        .map((action) => ({ value: action, label: action }));
      return matches.length > 0 ? matches : null;
    },
    handler: async (args, ctx) => {
      const action = args.trim().toLowerCase() || "status";
      if (action === "on") enabled = true;
      else if (action === "off") enabled = false;
      else if (action !== "status") {
        ctx.ui.notify("Usage: /safety [on|off|status]", "warning");
        return;
      }

      updateStatus(ctx);
      ctx.ui.notify(
        enabled
          ? "Dangerous shell commands require confirmation."
          : "Shell safety confirmation is disabled for this Pi session.",
        enabled ? "info" : "warning",
      );
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    enabled = true;
    updateStatus(ctx);
  });

  pi.on("tool_call", async (event, ctx) => {
    if (!enabled || event.toolName !== "bash" || typeof event.input.command !== "string") {
      return undefined;
    }

    const reason = classifyDangerousCommand(event.input.command);
    if (!reason) return undefined;

    if (!ctx.hasUI) {
      return { block: true, reason: `Blocked ${reason}: interactive confirmation is unavailable.` };
    }

    const shown = event.input.command.length > 1200
      ? `${event.input.command.slice(0, 1200)}\n…`
      : event.input.command;
    const choice = await ctx.ui.select(`Potentially destructive shell command (${reason}):\n\n${shown}`, [
      "Cancel",
      "Run once",
    ]);

    if (choice !== "Run once") {
      return { block: true, reason: `Blocked ${reason} by user.` };
    }

    return undefined;
  });
}
