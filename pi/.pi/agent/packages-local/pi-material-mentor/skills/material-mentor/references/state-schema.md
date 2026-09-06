# Learning state contract

Run Pi from one course root. Keep these files visible to Obsidian and portable to other tools.

```text
course-root/
├── COURSE.md
├── PROGRESS.md
├── CONCEPTS.md
├── QUESTIONS.md
├── material/
├── concepts/
└── sessions/
```

## Ownership

| Path | Primary owner | Agent behavior |
|---|---|---|
| `material/` | Human / author | Read-only unless explicitly asked to import or edit material. |
| `COURSE.md` | Shared | Preserve source and goal; update confirmed position and next target. |
| `PROGRESS.md` | Agent | Record mastery only with dated, observable evidence. |
| `QUESTIONS.md` | Shared | Append unresolved questions and parked tangents; never silently delete. |
| `CONCEPTS.md` | Shared | Maintain a sparse map of links, not prose notes. |
| `concepts/` | Learner | Create or rewrite a note only on explicit request. |
| `sessions/` | Agent | Save compact learning state, never a transcript. |

## Mastery vocabulary

- `not-started`: no evidence yet.
- `developing`: recognized or explained with hints; evidence is partial.
- `solid`: independently explained and successfully predicted or applied.
- `review`: previously solid but due for retrieval, or contradicted by recent evidence.

Avoid percentages. Record exactly what the learner did and what remains uncertain.

Multiple-choice checks provide recognition evidence. Even a fully correct `/check` remains
`developing` unless the same concept is supported by independent explanation or authentic
application. Independently solved discussion/homework problems and proofs, or verified design,
implementation, testing, and transfer work, may support `solid` when the evidence is specific.

## When to write

Write state at a natural checkpoint after a completed check or review, a learner-confirmed position change, an intentionally parked exploration branch, or an explicitly ended session. Keep it compact:

- Update `COURSE.md` only for a confirmed current position or next target.
- Update `PROGRESS.md` with status, dated evidence, and source location.
- Append unresolved or intentionally deferred branches to `QUESTIONS.md`.
- Update `CONCEPTS.md` only with small links between encountered concepts.
- Create or update `sessions/YYYY-MM-DD.md` with material read, demonstrated understanding, misconceptions corrected, weak points, and the next action.

Use only the learner's demonstrated understanding as evidence. Leave uncertain claims unrecorded. Preserve learner-authored text, and leave `PROGRESS.md` unchanged when there is no observable evidence. Never write a polished replacement textbook or create a concept note on the learner's behalf.

## Evidence row

Use the table in `PROGRESS.md`:

```markdown
| Concept | Status | Evidence | Source | Last checked |
|---|---|---|---|---|
| Ownership of stored values | developing | Distinguished list-node ownership; still missed caller-owned values in a lifetime scenario. | `material/ch05.md` §5.4 | 2026-08-18 |
```

Merge evidence for the same concept instead of creating near-duplicate rows. Keep evidence to one or two concrete sentences.

## Session note

Use `sessions/YYYY-MM-DD.md`. If multiple sessions occur on one date, append a new `## Session HH:MM` section.

```markdown
# 2026-08-18

## Material

- `material/ch05.md` §5.1–§5.4

## Demonstrated

- Explained why the representation is opaque without hints.

## Fixed

- Previously assumed `List_push` copied the stored value.

## Still developing

- Lifetime of caller-owned values.

## Parked

- Compare intrusive and non-intrusive lists.

## Next

- Read §5.5 and trace the destroy callback contract.
```

Omit empty sections. Preserve any learner-written text already in the file.
