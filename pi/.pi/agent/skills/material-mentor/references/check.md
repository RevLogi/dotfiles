# Check mode

Run a low-load recognition check that reinforces the material without replacing later practice.

1. Ask two multiple-choice questions by default and at most three total. Begin with recognition rather than a free reconstruction.
2. Ask exactly one blocking question in each learner interaction with `ask_user` when available. Give exactly three mutually exclusive options, set `allowOther` to false, and wait for the answer. Treat the learner's answer as the boundary between question cycles: give feedback before asking the next single question, and never batch questions.
3. Start with the central distinction, then use a tiny prediction, trace, example, or close misconception. Ask a third question only when it resolves meaningful uncertainty.
4. Make distractors plausible and diagnostic. Avoid trivia, tricks, overlapping choices, “all of the above,” answer-length clues, and option descriptions that reveal the answer.
5. After each choice, give two to four concise sentences: state whether it was correct, explain the key distinction, and correct only the most important misconception. Explain an incorrect answer directly without forcing a retry or opening a chain of leading questions.
6. Finish with one reinforced idea, one point still uncertain when applicable, and one authentic practice action from the course, such as a discussion or homework problem, design, test, or implementation task.

Record performance according to the recognition-evidence rules in the shared state contract.

## Completion criterion

Complete each question cycle after one answer and its immediate feedback, then continue with the next single question when needed. Complete the operation when the learner has answered two diagnostic questions, or a third only when needed, and received one concise assessment plus one authentic practice action. Persist any changed evidence according to the state contract.
