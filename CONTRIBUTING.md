# Contributing

Thanks for helping build open MCP infrastructure for Saudi services.

## Adding a new server

1. Copy `packages/wathq` as a template.
2. Keep the structure: `config.ts`, `client.ts`, `schemas.ts`, `mock.ts`, `tools/`, `index.ts`.
3. **Tool names/descriptions in English; returned data in Arabic.**
4. Make every nested field optional — real Saudi API responses are sparse.
5. Ship a `WATHQ_MOCK`-style mock mode so the server runs with no key.
6. Add tests that parse a REAL (sparse) response, not just the fat API examples.

## Ground rules

- Never commit API keys. Keys come from env vars only.
- Don't log returned record data — these are real business/personal records.
- Use `pnpm changeset` to describe version-worthy changes.

## Local dev

```bash
pnpm install
pnpm build
pnpm test
WATHQ_MOCK=true node packages/wathq/dist/index.js
```
