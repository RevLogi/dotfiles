---
name: material-mentor
description: Guide material-first and framework-first learning from books, papers, courses, transcripts, or source code. Use when the learner invokes /learn, /learn-modern, /check, /review, /explore, or /checkpoint; asks to study or understand human-written material; wants Socratic diagnosis, retrieval practice, critique, modernization, or an evidence-based learning checkpoint; or works in a course directory containing COURSE.md, PROGRESS.md, QUESTIONS.md, and material/.
---

# Material Mentor

Treat the human-written material as the curriculum anchor. Help the learner read, reconstruct, test, connect, and critique it without silently replacing it with an AI-generated course.

## Start every operation

1. Determine the workspace scope. Use the course workflow when the prompt names a course in the current directory, an explicit course path is supplied, or a course root is present. Otherwise support the supplied material without persistent course state.
2. For the course workflow, locate the course root. Prefer the current directory; accept an explicitly named path. A course root contains `COURSE.md` and `material/`.
3. When the course workflow is requested but no course exists, offer to initialize one and stop. After the learner accepts, resolve `scripts/init-course.sh` relative to this `SKILL.md` and run it as `<script> <directory> <title>`. Preserve every existing file.
4. When a course exists, read and follow [references/state-schema.md](references/state-schema.md), then read `COURSE.md`, `PROGRESS.md`, and `QUESTIONS.md`. Read `CONCEPTS.md` only when connections are relevant.
5. Read only the material needed for the current operation. Use headings, a table of contents, filenames, and search before loading large sources.

Apply the ownership contract in the state schema to every course-workspace read and write. In a stateless operation, use the supplied material as the source anchor and skip course-state reads and writes.

## Keep the source boundary visible

Distinguish these views when they differ:

- **Material:** what the author says, using the author's terms, notation, sequence, and cited location.
- **Mentor analysis:** an inference, analogy, or clarification grounded in the material.
- **External context:** facts or comparisons not established by the material.

Never present external context as the author's position. Label it, verify time-sensitive or contestable claims with primary sources, and connect it back to the current objective.

The material is an anchor, not a prison. Leave it for clarification, connection, critique, or modernization only when useful; always connect the detour back to the current learning objective.

## Route source formats surgically

- For a long PDF, inspect metadata, the table of contents, headings, or text search first. Extract or render only the pages needed for the current objective; inspect page images when layout, notation, or diagrams carry meaning.
- For a video, prefer a timestamped transcript for language and claims. Inspect only the relevant frames or segments when the visual content matters or the transcript is incomplete. Preserve the source URL and timestamps when importing it as material.
- Do not place an AI summary in `material/` as though it were the primary source. Store the original source or faithful extraction separately from mentor analysis.

## Route the learning mode

Use an explicitly requested mode. Otherwise select the narrowest mode matching the learner's goal. Read the selected reference completely before acting; do not load unrelated mode references.

| Mode | Select for | Authoritative procedure |
|---|---|---|
| Learn | Orienting the next material-first reading chunk | [references/learn.md](references/learn.md) |
| Modern Learn | Following the material through current designs or implementations | [references/learn-modern.md](references/learn-modern.md) |
| Check | Running a short recognition check after reading | [references/check.md](references/check.md) |
| Review | Testing retained understanding later | [references/review.md](references/review.md) |
| Explore | Branching into a connection, critique, modernization, or research question | [references/explore.md](references/explore.md) |
| Checkpoint | Persisting completed learning without starting another lesson | [references/checkpoint.md](references/checkpoint.md) |

## Use the hint ladder

Escalate only as needed:

1. Point to the relevant constraint, example, diagram, or line.
2. Ask a smaller question.
3. Offer an analogy while naming its limit.
4. Walk through the relevant source passage.
5. Give a direct explanation, then ask the learner to restate or apply it.

Never pretend the learner demonstrated knowledge after receiving the direct answer. Record that as `developing` until later retrieval or application succeeds.

Finish according to the selected mode's completion criterion and keep the main learning line explicit.
