# Conjoin QA Go-Live Checklist

Date: 14 Feb 2026  
Project root: `/Users/msleox/Documents/conjoin/web`  
Dev port: `4310`

## Environment

- `pnpm i` completed
- Dev server confirmed on `http://localhost:4310`
- Forbidden strings/build checks already wired (`audit:forbidden`)

## Viewport Matrix (mobile-first)

Checked with mobile/desktop user-agent sweeps and route coverage:

- Mobile widths targeted: `360`, `375`, `390`, `414`
- Tablet width targeted: `768`, `1024`
- Desktop width targeted: `1440`

Notes:
- Route health and runtime checks were executed for mobile + desktop profiles through `qa:golive`.
- No route-level runtime error markers found.

## Route Health

Validated `200` responses:

- `/`
- `/search`
- `/brands`
- `/microsoft`
- `/seqrite`
- `/cisco`
- `/locations/chandigarh`
- `/request-quote`
- `/thank-you`
- `/contact`
- `/robots.txt`
- `/sitemap.xml`

Internal crawl summary:

- `109` internal links checked
- `0` broken links

## UX/Flow Checklist

### A) Home + navigation
- Header/menu links resolve without 404.
- Mobile menu opens/closes reliably.
- Mobile menu locks body scroll and closes on route change.

### B) Search UI
- Search input focused style and spacing normalized.
- Result groups render correctly (Brands/Products/Locations/Knowledge).
- Empty state renders with clear text.

### C) Quote form UX
- Step 1 brand selection (Microsoft/Seqrite quick chips) is reliably clickable/tappable.
- Step progress is visible and clear.
- `Next`/`Submit` CTA remains visible on mobile via sticky action row.
- Step-specific validation messages shown when required fields are missing.

### D) WhatsApp CTA
- Floating WhatsApp CTA uses safe-area offsets.
- CTA repositions near footer and hides while mobile menu is open.
- No overlap with sticky form actions/footer links in configured layout.

### E) CRM simulation

Lead journeys executed:

1. Microsoft RFQ (`/api/quote`) -> lead created
2. Seqrite RFQ (`/api/quote`) -> lead created
3. Generic procurement (`/api/lead`) -> lead created

Admin verification:

- `/api/admin/login` success
- `/api/admin/leads` shows all created leads
- Assignment/status/note update persisted (`assignedTo=Girish`, `status=IN_PROGRESS`, note saved)
- Persistence verified after fresh admin login session

### F) Accessibility basics
- Icon-only buttons include `aria-label` (search/menu/slider arrows).
- Focus styles visible on interactive controls.

## API/Webhook Behavior

- WhatsApp webhook GET/POST returns graceful `503` with clear message when `WHATSAPP_VERIFY_TOKEN` is not configured.
- No uncaught API errors observed during lead submission/update tests.

## Commands Run

```bash
pnpm i
pnpm dev -- --port 4310   # equivalent used: PORT=4310 pnpm dev
npm run qa:smoke
npm run qa:golive
pnpm build
PORT=4310 pnpm start
```

## Result

- Go-live stabilization QA completed.
- Core conversion path (quote + lead capture + admin update) is stable.
