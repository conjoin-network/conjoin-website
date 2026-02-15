# Development Notes

## SQLite ExperimentalWarning during build

- You may see `ExperimentalWarning: SQLite is an experimental feature...` when running `pnpm build`.
- Source: Node.js `node:sqlite` module used by Conjoin lead/event storage (`/Users/msleox/Documents/conjoin/web/lib/leads.ts` and `/Users/msleox/Documents/conjoin/web/lib/event-log.ts`).
- To trace warning origin locally:
  - `NODE_OPTIONS=\"--trace-warnings\" pnpm build`
  - or `pnpm build:trace-warnings`
- CI/Vercel build logs suppress this warning noise via `--no-warnings` (build-only), while errors still fail builds.
