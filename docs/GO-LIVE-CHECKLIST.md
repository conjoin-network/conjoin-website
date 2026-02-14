# Conjoin Go-Live Checklist (Makhan Pass)

Date: 2026-02-14  
Repo: `/Users/msleox/Documents/conjoin/web`  
Port: `4310`

## Baseline

- [x] PASS: Working directory guard (`scripts/ensure-workdir.sh`) blocks non-conjoin paths.
- [x] PASS: Port cleanup command verified (`lsof -ti :4310 | xargs kill -9 2>/dev/null || true`).
- [x] PASS: Dependencies installed (`pnpm i`).

## P0 Stabilization

- [x] PASS: Responsive logo sizing updated (desktop and mobile ranges tuned).
- [x] PASS: Mobile drawer safe-area top padding added.
- [x] PASS: iOS-safe body scroll locking implemented with scroll restore.
- [x] PASS: Floating WhatsApp uses computed bottom offset variable and footer/form avoidance.
- [x] PASS: Search sticky offset aligned to header height with shared CSS vars.
- [x] PASS: Lead storage fail-safe added for serverless (`LEAD_STORAGE_MODE` + `ALLOW_EPHEMERAL_LEADS` guard).
- [x] PASS: `.env*` ignored, documented in README.
- [x] PASS: `data/leads.json` sanitized for production (emptied).

## Lead + CRM Flow

- [x] PASS: Microsoft RFQ submission -> lead creation -> admin list visibility.
- [x] PASS: Seqrite RFQ submission -> lead creation -> admin list visibility.
- [x] PASS: Admin assignment/status/note persistence verified after refresh.

## Route/Health Sweep

- [x] PASS: `/, /brands, /knowledge, /search, /request-quote, /thank-you`
- [x] PASS: `/microsoft, /seqrite, /cisco`
- [x] PASS: `/campaigns/microsoft-365, /campaigns/seqrite-endpoint, /campaigns/cisco-security`
- [x] PASS: `/locations/chandigarh, /sitemap.xml, /robots.txt`

## Build Gates

- [x] PASS: `pnpm run lint`
- [x] PASS: `pnpm run typecheck`
- [x] PASS: `pnpm run build`
- [x] PASS: `pnpm run qa:smoke`
- [x] PASS: `pnpm run qa:golive`
- [x] PASS: `PORT=4310 pnpm start`

## Remaining Risk Blockers

- [ ] BLOCKER (deployment-dependent): serverless hosts need durable lead storage (DB/KV/volume).  
  Current guard returns service-unavailable when unsafe storage is detected, to avoid silent lead loss.
