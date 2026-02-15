# Development Notes

## SQLite ExperimentalWarning during build

- You may see `ExperimentalWarning: SQLite is an experimental feature...` when running `pnpm build`.
- Source: Node.js `node:sqlite` module used by Conjoin lead/event storage (`/Users/msleox/Documents/conjoin/web/lib/leads.ts` and `/Users/msleox/Documents/conjoin/web/lib/event-log.ts`).
- To trace warning origin locally:
  - `NODE_OPTIONS=\"--trace-warnings\" pnpm build`
  - or `pnpm build:trace-warnings`
- CI/Vercel build logs suppress this warning noise via `--no-warnings` (build-only), while errors still fail builds.

## npm Unknown env config warnings

- Warning examples:
  - `npm warn Unknown env config "npm-globalconfig"`
  - `npm warn Unknown env config "verify-deps-before-run"`
  - `npm warn Unknown env config "_jsr-registry"`
- Cause: these were emitted when build scripts invoked `npm` directly, and `npm` consumed inherited env/config keys that are not valid in modern npm.
- Fix in this repo:
  - Build/audit scripts no longer shell through `npm`.
  - `/Users/msleox/Documents/conjoin/web/scripts/run-build.mjs` runs the audit script directly via `node`, then runs `next build`.
  - `dev:4310` / `start:4310` use `pnpm port:free` instead of `npm run ...`.

## Caching policy (edge/CDN)

- Configured in `/Users/msleox/Documents/conjoin/web/next.config.ts`.
- `_next/static/*`: `public, max-age=31536000, immutable`
- Public pages (non-admin/non-api): `public, s-maxage=3600, stale-while-revalidate=86400`
- `sitemap.xml`: `public, s-maxage=3600, stale-while-revalidate=86400`
- `robots.txt`: `public, s-maxage=86400, stale-while-revalidate=86400`
- `api/*`, `admin/*`, `crm/*`: `no-store`

## Lighthouse CI gate

- Config: `/Users/msleox/Documents/conjoin/web/lighthouserc.json`
- Local run: `pnpm perf:check`
- Routes audited:
  - `/`
  - `/brands`
  - `/solutions/workspace`
  - `/contact`
  - `/request-quote`
- Budgets:
  - performance >= 0.85
  - accessibility >= 0.90
  - best-practices >= 0.90
  - SEO >= 0.90

## Playwright E2E

- Config: `/Users/msleox/Documents/conjoin/web/playwright.config.ts`
- Tests: `/Users/msleox/Documents/conjoin/web/tests/e2e/site.spec.ts`
- Install browser: `pnpm e2e:install`
- Run suite: `pnpm e2e`

## Web Vitals RUM + error logging toggles

- Client metric reporter: `/Users/msleox/Documents/conjoin/web/app/components/WebVitalsReporter.tsx`
- API endpoint: `/Users/msleox/Documents/conjoin/web/app/api/rum/route.ts`
- Storage: `/Users/msleox/Documents/conjoin/web/data/rum-events.json`
  - Rotation: keep last 7 days and max 5000 events
- Dev summary page: `/dev/rum`
- Optional script: `pnpm rum:check`
- Error logging toggle:
  - `SENTRY_DSN` (Sentry envelope mode)
  - `ERROR_LOG_DSN` (generic webhook mode)
  - If neither is set, error capture is no-op beyond server logs.
