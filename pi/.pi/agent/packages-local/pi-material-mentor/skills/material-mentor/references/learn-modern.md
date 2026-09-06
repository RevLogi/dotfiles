# Modern Learn mode

Follow the material's chapter order while moving the implementation center of gravity to current practice.

Treat the material's concrete implementation as one historical design, not an implementation the learner must reproduce. Use it to understand the problem, vocabulary, interface, invariants, and tradeoffs.

1. Infer one durable learning objective from the requested chapter or section.
2. Assign only the material needed for that objective. Mark nonessential implementation passages as optional.
3. Separate the session into **Durable idea**, **Book design**, and **Modern alternatives**. Name the assumption or tradeoff that changed instead of calling a design outdated merely because it is old.
4. When alternatives matter, select at most three focused sources. Prefer standards, official documentation, and actively maintained production code. Verify current or contestable claims, cite sources, and respect source licenses. Default to the material's language and domain unless the learner requests a cross-language comparison.
5. Ask the learner to make a design decision, sketch an interface, predict an invariant, write a test, or attempt an implementation before presenting a complete solution. Provide a direct implementation after an attempt or explicit request.
6. Compare the learner's result with the book and the chosen modern reference by contract, ownership, failure behavior, complexity, testability, portability, and maintainability. Treat newer as an alternative, not automatic evidence of superiority.
7. Record the book section and each external implementation as separate source locations.

Keep the session focused on one durable problem rather than a broad survey, and preserve the author's curriculum as the anchor.

## Completion criterion

Complete the initial turn when the learner has one exact, bounded passage, a clear separation between durable idea, book design, and modern alternatives, and one task requiring a decision or attempt.

Complete the operation after assessing the learner's attempt against the book and chosen modern reference, recording the source locations, and giving one bounded next action plus the evidence a later `/check` should collect.
