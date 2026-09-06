# Pi Material Mentor

A local Pi package for material-first courses. It provides the
`material-mentor` and `youtube-transcript` skills, six learning prompts,
interactive questions, course-state injection, and material write protection.

Course data remains outside this package in ordinary Markdown files. See
[`docs/usage.md`](docs/usage.md) for the workflow and state ownership rules.

## Development

```bash
npm ci
npm run check
```

The optional CII PDF importer has separate Python dependencies under
`tools/cii-import/`.
