import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const OptionSchema = Type.Object({
  label: Type.String({ description: "Short answer label" }),
  description: Type.Optional(Type.String({ description: "Optional explanation shown with the label" })),
});

const AskUserParams = Type.Object({
  question: Type.String({ description: "One question to ask the learner" }),
  options: Type.Optional(Type.Array(OptionSchema, { description: "Optional choices; omit for a free response" })),
  allowOther: Type.Optional(Type.Boolean({ description: "Allow a custom response when choices are provided" })),
});

export default function askUser(pi: ExtensionAPI) {
  pi.registerTool({
    name: "ask_user",
    label: "Ask learner",
    description:
      "Ask one blocking question and wait for the user's answer. Use for low-load multiple-choice checks as well as retrieval questions and predictions.",
    promptSnippet: "Ask one blocking free-response or multiple-choice learning question",
    promptGuidelines: [
      "Use ask_user for one learning question at a time and wait for the answer before assessing or teaching.",
      "Do not reveal the answer inside an ask_user question, option label, or option description.",
      "In material-mentor Check mode, provide exactly three mutually exclusive options and set allowOther to false.",
    ],
    parameters: AskUserParams,
    executionMode: "sequential",

    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      if (ctx.mode !== "tui") {
        return {
          content: [
            {
              type: "text",
              text: `Interactive UI is unavailable. Ask this question in chat and stop: ${params.question}`,
            },
          ],
          details: { cancelled: true, reason: "no-tui" },
        };
      }

      const options = params.options ?? [];

      if (options.length === 0) {
        const answer = await ctx.ui.editor(params.question, "");
        if (answer === undefined) {
          return {
            content: [{ type: "text", text: "The user cancelled the question." }],
            details: { cancelled: true },
          };
        }

        return {
          content: [{ type: "text", text: `User answered:\n${answer.trim() || "(blank)"}` }],
          details: { cancelled: false, answer: answer.trim(), custom: true },
        };
      }

      const allowOther = params.allowOther !== false;
      const labels = options.map((option) =>
        option.description ? `${option.label} — ${option.description}` : option.label,
      );
      const otherLabel = "Write my own answer";
      const choice = await ctx.ui.select(params.question, allowOther ? [...labels, otherLabel] : labels);

      if (choice === undefined) {
        return {
          content: [{ type: "text", text: "The user cancelled the question." }],
          details: { cancelled: true },
        };
      }

      if (allowOther && choice === otherLabel) {
        const answer = await ctx.ui.editor("Your answer", "");
        if (answer === undefined) {
          return {
            content: [{ type: "text", text: "The user cancelled the question." }],
            details: { cancelled: true },
          };
        }

        return {
          content: [{ type: "text", text: `User answered:\n${answer.trim() || "(blank)"}` }],
          details: { cancelled: false, answer: answer.trim(), custom: true },
        };
      }

      const selectedIndex = labels.indexOf(choice);
      const selected = options[selectedIndex];
      return {
        content: [{ type: "text", text: `User selected: ${selected.label}` }],
        details: {
          cancelled: false,
          answer: selected.label,
          optionIndex: selectedIndex,
          custom: false,
        },
      };
    },
  });
}
