# Pi Anki English

A local Pi package for turning English words, phrases, collocations, idioms,
and source sentences into reviewed Anki notes. It owns the `Pi English` note
model, the `English::Inbox` deck default, duplicate checks, preview, confirmed
writes, corrections, and review counts.

It does not read course state or depend on `pi-material-mentor`. AnkiConnect
must be available on a loopback address for Anki operations.

## Development

```bash
npm ci
npm run check
```
