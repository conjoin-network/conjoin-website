# GO-LIVE REPORT

Date: 13 Feb 2026  
Project: ConjoinNetwork.com (Phase-1 V1.0)  
Environment: Local dev on `http://127.0.0.1:4310`

## 1) What Was Checked

- Build/lint stability
- Public route availability and indexability
- Quote lead flow correctness (Microsoft, Seqrite, Cisco)
- Admin lead visibility and RBAC-gated access
- Core SEO signals (robots, sitemap, canonical, metadata, JSON-LD)
- Security defaults (headers, admin noindex, no-store on admin paths)
- OEM/disclaimer compliance checks

## 2) Commands Run

```bash
npm run lint
npm run build
lsof -ti :4310 | xargs kill -9 2>/dev/null || true
PORT=4310 npm run dev
npm run qa:smoke
```

Additional QA commands:

```bash
curl -sI http://127.0.0.1:4310/
curl -sI http://127.0.0.1:4310/admin/login
curl -s http://127.0.0.1:4310/robots.txt
curl -s http://127.0.0.1:4310/sitemap.xml
```

## 3) Results

### A. Build and Route Health

- `npm run lint` passed.
- `npm run build` passed.
- Smoke routes returned `200`:
  - `/`
  - `/brands`
  - `/knowledge`
  - `/search`
  - `/request-quote`
  - `/thank-you`
  - `/microsoft`
  - `/seqrite`
  - `/cisco`
  - `/locations/chandigarh`
  - `/sitemap.xml`
  - `/robots.txt`

### B. Lead Flow QA (End-to-End)

Submitted 3 RFQs to `/api/quote`:

1. Microsoft: `LD-20260213-5995` (`200`)
2. Seqrite: `LD-20260213-8187` (`200`)
3. Cisco: `LD-20260213-3569` (`200`)

Verification:

- `/thank-you` rendered request summary and WhatsApp CTA with prefilled message.
- Admin API visibility check succeeded after login:
  - `ADMIN_TEST:PASS leads=5 found=3/3`

### C. SEO Checklist Status

- `robots.txt` reachable and crawl-friendly.
- `robots.txt` disallows admin only:
  - `/admin/`
  - `/api/admin/`
- `sitemap.xml` reachable and includes key routes:
  - campaigns, Microsoft, Seqrite, Cisco, brands, locations, knowledge.
- Canonical tags present on key pages (e.g. `/request-quote`, `/microsoft`, `/locations/chandigarh`).
- Unique title/description present on key pages.
- Organization JSON-LD present sitewide.
- LocalBusiness JSON-LD present on `/locations/*`.
- No `noindex` on public routes; admin routes/pages are `noindex,nofollow`.

### D. Security Hardening Status

Global headers present:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy-Report-Only` baseline

Admin protections:

- `/admin/*` and `/api/admin/*` protected by login/session.
- Admin pages carry `robots` noindex/nofollow.
- Admin responses include cache deterrence (`no-store`, `pragma no-cache`).
- Confidentiality warning visible in admin UI.

Cookie/session defaults:

- `httpOnly`
- `sameSite=lax`
- `secure` in production

Validation/safety:

- Zod validation active on `/api/quote` and `/api/admin/login`.
- No user-supplied rich HTML rendering path used for lead content.

### E. Compliance Status

- Partner/trademark disclaimer present.
- OEM wording safety preserved (no spec rewriting in this pass).
- No distributor naming introduced.

## 4) Lighthouse Summary (Mobile/Desktop)

Attempted local Lighthouse CLI:

```bash
npx -y lighthouse --version
```

Result: blocked by network restriction in this environment (`ENOTFOUND registry.npmjs.org`), so automated Lighthouse scoring could not be executed from terminal here.

Action for final pre-launch (host machine with Chrome/DevTools):

1. Open DevTools Lighthouse on mobile + desktop for:
   - `/`
   - `/request-quote`
   - `/search`
2. Record scores for Performance/Accessibility/Best Practices/SEO.
3. Save snapshots in release notes.

## 5) Issues Found and Fixes

1. Admin access needed strict noindex/no-cache behavior:
   - Verified metadata robots and admin no-store headers.
2. Lead-flow visibility needed proof in admin:
   - Verified by authenticated admin API read and lead ID match.
3. SEO route consistency:
   - Verified robots + sitemap + canonical and JSON-LD presence.

## 6) Files Changed (`git diff --name-only`)

```text
.env.example
README.md
app/admin/agents/page.tsx
app/admin/leads/AdminLeadsClient.tsx
app/admin/leads/page.tsx
app/admin/page.tsx
app/admin/scoreboard/page.tsx
app/api/admin/leads/[id]/route.ts
app/api/admin/leads/export/route.ts
app/api/quote/route.ts
app/components/MainNav.tsx
app/globals.css
app/layout.tsx
app/page.tsx
app/request-quote/RequestQuoteWizard.tsx
docs/LAUNCH-READY-CHECKLIST.md
docs/V1-LAUNCH-NOTES.md
lib/admin-auth.ts
lib/leads.ts
lib/quote-catalog.ts
middleware.ts
next.config.ts
package-lock.json
package.json
```

Additional new file in this pass:

```text
docs/GO-LIVE-REPORT.md
```

## 7) Go-Live Verdict

`GO LIVE READY` for Phase-1 core flow (Microsoft + Seqrite + Cisco RFQ, admin visibility, SEO/indexing, security defaults), with one final pre-launch action: capture Lighthouse scores from a Chrome-enabled environment.

## 8) Official Email Finalization (13 Feb 2026)

- Public sales email standardized to `sales@conjoinnetwork.com`.
- Support email standardized to `support@conjoinnetwork.com`.
- Leads routing mailbox standardized to `leads@conjoinnetwork.com`.
- Removed legacy typo domain occurrences across docs/config/runtime files.

Updated surfaces:

- Header + mobile nav contact links: sales (primary), support (secondary)
- Footer contact block: sales (primary), support (secondary)
- RFQ wizard + campaign pages: urgent help line with sales/support emails
- Thank-you page: confirmation copy + sales contact line
- Lead notification routing: queue + SMTP destination now point to leads mailbox
- JSON-LD: Organization + LocalBusiness contact points include sales/support/leads

Files touched in this email consistency pass:

- `.env.example`
- `README.md`
- `app/layout.tsx`
- `app/components/MobileNavMenu.tsx`
- `app/request-quote/RequestQuoteWizard.tsx`
- `app/thank-you/page.tsx`
- `app/campaigns/microsoft-365/page.tsx`
- `app/campaigns/seqrite-endpoint/page.tsx`
- `app/campaigns/cisco-security/page.tsx`
- `app/locations/[slug]/page.tsx`
- `app/api/quote/route.ts`
- `app/api/lead/route.ts`
- `lib/contact.ts`
- `lib/email.ts`
- `lib/whatsapp.ts`
- `data/message-queue.json`

## 9) Go-Live Contact + Email QA Pass (14 Feb 2026)

### Website updates

- Removed GST/GSTIN display from public UI.
- Restored header search action as an icon button on desktop and mobile.
- Footer upgraded with production contact block and expanded site links:
  - Products, Brands, Categories, Locations, Compare, Request Quote, Contact
  - Privacy Policy, Terms, Refund Policy, Sitemap
- Added legal routes for footer links:
  - `/privacy-policy`
  - `/terms`
  - `/refund-policy`
- Schema updated to include address + phone numbers from shared contact constants:
  - Organization JSON-LD (sitewide)
  - LocalBusiness JSON-LD (`/contact`, `/locations/*`)

### Email QA system

- Added shared email branding + signature source:
  - `lib/emailBrand.ts`
  - `lib/emailSignature.ts`
- Added standardized premium templates:
  - `lib/emailTemplates.ts`
- Updated lead notification delivery to use branded HTML templates with consistent sender identity:
  - From: `Conjoin Leads Desk`
  - Reply-To: `leads@conjoinnetwork.com`
- Added customer confirmation email after RFQ submit (in addition to internal lead email).
- Added dev-only preview route:
  - `/dev/email-preview` (disabled in production)
  - Template switcher for `triggeredBy` (`user` / `admin` / `system`)
  - Copy HTML button for each template

### Email template subjects (finalized)

- Internal lead alert: `[Lead <leadId>] <brand> • <category> • <tier>`
- Customer RFQ confirmation: `We received your quote request - <brand> | Conjoin Leads Desk`
- Security/auth template: `<title> | Conjoin Security`
- Contact acknowledgement: `Contact request received | Conjoin Leads Desk`

### Files changed in this pass

- `app/layout.tsx`
- `app/contact/page.tsx`
- `app/locations/[slug]/page.tsx`
- `app/privacy-policy/page.tsx`
- `app/terms/page.tsx`
- `app/refund-policy/page.tsx`
- `app/dev/email-preview/page.tsx`
- `app/dev/email-preview/EmailPreviewClient.tsx`
- `app/api/lead/route.ts`
- `lib/contact.ts`
- `lib/site-index.ts`
- `lib/email.ts`
- `lib/messaging/index.ts`
- `lib/emailBrand.ts`
- `lib/emailSignature.ts`
- `lib/emailTemplates.ts`
- `scripts/audit-forbidden-strings.mjs`

## 10) Mobile Polish + RFQ Blocker Fix (14 Feb 2026)

### What was fixed

- RFQ step-1 brand selector rebuilt with quick chips (`Microsoft`, `Seqrite`) and combobox listbox behavior.
- Brand selection now uses pointer-safe option handling (`onPointerDown`) so selection does not get lost on input blur.
- Keyboard controls added for brand picker (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).
- Step navigation updated so `Next` is explicitly enabled once required step data is selected.
- Product registry expanded for Microsoft and Seqrite RFQ paths:
  - Microsoft additions: `Exchange Online`, `Teams Phone`.
  - Seqrite additions: `Email Security`, `Gateway / UTM`, `Cloud Security`.
- Mobile nav updated to full-screen drawer with lock-scroll and clean spacing.
- Floating WhatsApp CTA now respects safe-area bottom and auto-hides near footer to avoid overlap.
- Middleware deprecation warning removed by moving `middleware.ts` logic to `proxy.ts`.
- README updated with a quick `4310` port reset command.

### QA summary

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
- `npm run qa:smoke` ✅
- E2E lead flow simulation:
  - Microsoft RFQ submit ✅
  - Seqrite RFQ submit ✅
  - Admin login + lead visibility ✅
  - Lead status update (`/api/admin/leads/:id`, `/api/admin/leads/status`) ✅
  - CSV export (`/api/admin/leads/export`) ✅
  - WhatsApp send/webhook fallback (missing env) returns graceful `503` message ✅

## 11) Go-Live Morning Pass (14 Feb 2026)

### Homepage first-impression upgrades

- Added a premium homepage hero carousel (`/`) with:
  - 4 slides
  - autoplay every `2000ms`
  - infinite loop
  - fade transition
  - pause on hover (desktop)
  - pause while swiping (mobile)
  - dot indicators + desktop-only prev/next arrows
- Added stable hero height and fixed image dimensions to avoid CLS.
- Kept heading hierarchy SEO-safe (`h1` + structured sections).

### UI polish and mobile safety

- Header surface moved to variable-driven background for better readability in light/dark color schemes.
- Mobile menu sheet updated to token-based surface colors.
- Floating WhatsApp button adjusted with safe-area right/bottom offsets and larger request-quote route offset to avoid CTA overlap.
- Reduced motion load on mobile:
  - disabled hero breathing animation on small screens
  - disabled CTA pulse and reveal effects on small screens

### API and messaging hardening

- `/api/quote`:
  - explicit invalid JSON handling (`400`)
  - existing Zod validation + rate limit + honeypot retained
- `/api/lead`:
  - existing Zod validation + rate limit + honeypot retained
- Email fallback:
  - non-throwing SMTP behavior
  - clear dev warnings (`EMAIL_NOT_CONFIGURED`, `EMAIL_FALLBACK_QUEUE`)
  - no runtime 500 from missing optional email envs

### Known limits (current release)

- Rate limiting is in-memory and instance-local (works for single instance, not distributed globally).
- Message queue is file-based (`data/message-queue.json`) and local to deployment instance.
- WhatsApp provider remains optional and defaults to no-op unless enabled with provider credentials.
- Lighthouse report still requires browser-side run (DevTools) in network-enabled environment.

### Final QA commands

```bash
pnpm lint
pnpm typecheck
pnpm build
lsof -ti :4310 | xargs kill -9 2>/dev/null || true
PORT=4310 pnpm start
```

### Vercel deployment steps (quick)

1. Import repository `conjoin-network/conjoin-website` in Vercel.
2. Framework preset: Next.js (`build`: `pnpm build`, `start`: `pnpm start`).
3. Set required environment variables (`SMTP_*`, `MAIL_FROM`, `LEADS_EMAIL`, `ADMIN_PASSWORD`).
4. Add optional integrations (`WHATSAPP_*`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_URL`).
5. Add domains (`conjoinnetwork.com`, `www.conjoinnetwork.com`) and verify DNS.
6. Deploy and run post-deploy checks:
   - `/`, `/request-quote`, `/contact`, `/thank-you`
   - `/robots.txt`, `/sitemap.xml`
   - one test quote and one test contact lead.

## 11) GitHub + Vercel Handoff

- GitHub repository: `https://github.com/conjoin-network/conjoin-website.git`
- Branch for deployment: `main`
- Vercel project name: `conjoin-website`
- Vercel deployed URL: `https://conjoin-website.vercel.app` (custom domain target: `https://conjoinnetwork.com`)

### Environment Variables

Required for lead notifications:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM` (recommended)
- `LEADS_EMAIL` (defaults to `leads@conjoinnetwork.com` if missing)

Required for admin access:

- `ADMIN_PASSWORD`

Optional integrations (graceful fallback if not set):

- `WHATSAPP_PROVIDER` (`enabled` to activate send flow; otherwise no-op logs only)
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_URL`

Runtime behavior if env is missing:

- `/api/quote` and `/api/lead` validate payloads with Zod and return structured `400` on missing required fields.
- Honeypot (`website`) traps bot submissions and responds safely without creating user-facing errors.
- Rate limits return `429` with `Retry-After`.
- If lead notifications are enforced (`REQUIRE_LEAD_NOTIFICATIONS=true`) but SMTP is incomplete, API returns `503` with user-facing message: "Service temporarily unavailable. Please try again shortly."

### DNS Setup for `conjoinnetwork.com`

1. Apex domain (`conjoinnetwork.com`):
   - Add `A` record to Vercel target (`76.76.21.21`) or use provider-specific Vercel instructions.
2. `www` subdomain:
   - Add `CNAME` record to `cname.vercel-dns.com`.
3. In Vercel project domains:
   - Add both `conjoinnetwork.com` and `www.conjoinnetwork.com`.
   - Set preferred canonical host (recommend apex).
4. Enable HTTPS (automatic via Vercel once DNS propagates).

### Post-Deploy QA Checklist

- Open public routes and verify 200:
  - `/`, `/request-quote`, `/contact`, `/thank-you`, `/microsoft`, `/seqrite`, `/cisco`
- Verify `robots.txt` and `sitemap.xml` are publicly reachable.
- Submit one test from `/request-quote` and one from `/contact`.
- Confirm both leads appear in `/admin/leads`.
- Confirm lead email destination is `leads@conjoinnetwork.com`.
- Confirm WhatsApp CTA link prefill renders correctly.
- Verify mobile header/menu/search on Android + iPhone viewports.

## 13) Butter Smooth IA Pass (14 Feb 2026)

### What changed

- Added design-system foundation:
  - `lib/brand/tokens.ts`
  - `lib/brand/themes.ts`
- Added service-line data model:
  - `lib/solutions-data.ts`
- Added new routes:
  - `/solutions`
  - `/solutions/workspace`
  - `/solutions/secure`
  - `/solutions/network`
  - `/solutions/vision`
  - `/solutions/access`
  - `/commercial`
- Rebuilt homepage IA for one-glance flow:
  - concise hero with 2 CTAs
  - lightweight 3-second carousel with play/pause + dots + arrows
  - five themed service cards
  - discover/design/deliver section
  - trust metrics + testimonials
- Updated navigation, site index, and sitemap for new IA.
- Extended smoke QA checks to validate:
  - service-card markers and badge-first DOM order
  - carousel control markers
  - themed solution page markers.

### Spot-check URLs

- `/`
- `/solutions`
- `/solutions/workspace`
- `/solutions/secure`
- `/solutions/vision`
- `/commercial`
- `/request-quote`

### Performance note

- No heavy animation dependencies added.
- Carousel built with React state + CSS transitions only.
- Motion limited to transform/opacity transitions and reduced-motion-safe behavior.

### Deploy steps for Vercel

1. Import `conjoin-network/conjoin-website`.
2. Build command: `pnpm build`.
3. Start command: `pnpm start`.
4. Configure env vars from `.env.example`.
5. Attach domains and verify `robots.txt` + `sitemap.xml`.
6. Submit one RFQ and one contact lead as post-deploy checks.

## 14) Final Go-Live Publish Status (14 Feb 2026)

- Branch used for release: `main`
- Go-live commit hash: `b1dbe56`
- Commit message: `go-live: v1`

### Build and startup status

- `pnpm install` ✅
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `node scripts/audit-forbidden-strings.mjs` ✅
- `pnpm build` ✅
- `PORT=4310 pnpm start` ✅ (boot verified with HTTP `200`)

### Remaining manual steps for Manod

1. Fix local GitHub auth for write access to `conjoin-network/conjoin-website`.
2. Run push from `/Users/msleox/Documents/conjoin/web`:
   - `git push -u origin main`
3. In Vercel UI:
   - New Project -> Import `conjoin-network/conjoin-website`
   - Confirm Next.js auto-detection
   - Install command: `pnpm install`
   - Build command: `pnpm build`
4. Add env vars from `.env.example` placeholders.
5. Add domains:
   - `conjoinnetwork.com`
   - `www.conjoinnetwork.com`
6. Update DNS:
   - apex `A` -> `76.76.21.21` (or Vercel-provided target)
   - `www` `CNAME` -> `cname.vercel-dns.com`
7. Post-deploy verify:
   - `/`, `/request-quote`, `/contact`, `/robots.txt`, `/sitemap.xml`

## 15) Final Pre-Go-Live UI + QA Pass (14 Feb 2026)

### UI fixes completed

- Floating WhatsApp CTA adjusted for mobile safe areas:
  - anchored right with stronger bottom offsets
  - raised on form routes
  - lifted near footer to avoid overlap
  - hidden while mobile menu is open
- Header cleanup:
  - removed blur-heavy look from top bar
  - softened search icon button surface/shadow
  - increased logo size on mobile and desktop for better first visibility
- Mobile menu + footer:
  - drawer set to full `100dvh` with safe-area bottom padding
  - footer given extra mobile bottom padding so floating CTA never covers links
- Design consistency:
  - primary button style unified to gradient `#2563EB → #1E40AF`
  - card radius/shadow made more consistent through shared card surface rules
- Carousel pause control overlap:
  - desktop pause control remains at top
  - mobile pause control moved to bottom-left to avoid content overlap

### Request Quote flow validation

- Step 1 brand selection now resolves reliably:
  - quick chips for Microsoft/Seqrite remain primary
  - typed input resolves by exact or prefix match
  - `Next` enables as soon as valid brand is resolved
- Product options remain brand-filtered in Step 2.
- Live summary remains synced through all steps.

### API/CRM validation completed

- RFQ submit tests:
  - Microsoft + Business Premium: `200 OK`, lead created (`LD-20260214-8892`)
  - Seqrite + Endpoint Security: `200 OK`, lead created (`LD-20260214-3800`)
- Admin workflow:
  - login success (`/api/admin/login`)
  - lead list visible (`/api/admin/leads`)
  - status patch persisted (`/api/admin/leads/[id]`)
- WhatsApp webhook fallback:
  - returns `503` with clear message when verify token is not configured (graceful behavior)

### Route and link QA

- Smoke checks passed (`npm run qa:smoke`).
- Internal-link crawl checked `79` links with `0` failures.
- Final route checks returned `200`:
  - `/`, `/brands`, `/knowledge`, `/search`, `/request-quote`, `/thank-you`
  - `/microsoft`, `/seqrite`, `/cisco`
  - `/campaigns/microsoft-365`, `/campaigns/seqrite-endpoint`, `/campaigns/cisco-security`
  - `/locations/chandigarh`, `/sitemap.xml`, `/robots.txt`

### Commands executed in this pass

```bash
npm run lint
npm run typecheck
npm run build
npm run qa:smoke
PORT=4310 npm run dev
```

## 16) Final Go-Live Hardening Run (14 Feb 2026)

### Quote wizard + mobile fixes

- Fixed brand selection reliability on `/request-quote`:
  - quick select chips prioritize Microsoft and Seqrite
  - typed brand input resolves by exact/prefix match
  - no dead-click issue on dropdown options
- Added step-specific validation copy:
  - clear messages when brand/product/quantity/deployment/contact fields are missing
- Added stronger visual progress:
  - step labels rendered with active state and completed states
- Added sticky action row on mobile so `Back`/`Next`/`Submit` remains visible while scrolling.
- Header/search cleanup:
  - removed heavy search button underlay around logo area
  - cleaner white top bar look
  - logo sizing improved for mobile and desktop readability
- Floating WhatsApp overlap hardening:
  - safe-area aware offsets
  - lifted near footer and hidden when mobile menu is open
  - prevents footer/menu link obstruction.

### End-to-end lead QA completed

1. Microsoft RFQ (`/api/quote`):
   - Payload: Business Premium, 25 users, Chandigarh
   - Result: `200`, lead created `LD-20260214-1178`
   - Visible in admin: ✅
2. Seqrite RFQ (`/api/quote`):
   - Payload: Endpoint Security, 100 endpoints, Mohali
   - Result: `200`, lead created `LD-20260214-4694`
   - Visible in admin: ✅
3. Generic procurement (`/api/lead` via contact flow):
   - Payload: contact lead, requirement + users
   - Result: `200`, lead created `LD-20260214-5579`
   - Visible in admin: ✅

Admin status persistence:

- Updated lead status through `/api/admin/leads/[id]` to `QUOTED`.
- Re-fetch verified persisted status + note in lead timeline.

### QA automation updates

- Added `/scripts/qa-golive.mjs` for broader go-live checks:
  - desktop + mobile user-agent route checks
  - runtime error marker scan in HTML
  - key route health for quote/search/brand/location/SEO endpoints
- Added npm scripts:
  - `npm run port:free`
  - `npm run dev:4310`
  - `npm run start:4310`
  - `npm run qa:golive`

### URLs tested in this run

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

### Remaining known issues

- None blocking for quote flow, mobile header, or go-live lead capture.

## 17) Hero Slider Go-Live Design Hardening (14 Feb 2026)

### UI hardening completed

- Removed hero slider pause controls entirely (desktop + mobile).
- Hero slider remains auto-play and loops every 2 seconds.
- Kept arrow navigation as clean desktop controls.
- Tightened homepage hero spacing to remove top-heavy empty area.
- Added subtle gradient/pattern wash behind carousel panel to avoid flat white surfaces.
- Replaced empty secure slide body with structured product clarity cards under:
  - **Security and Resilience Operations**
  - **Endpoint Protection** (EDR/XDR, Device Control, Policy Enforcement)
  - **Email Security** (Anti-Phishing, SPF/DKIM/DMARC, Microsoft 365 Protection)
  - **Backup & Recovery** (M365 Backup, Endpoint Backup, Disaster Recovery)
- Product clarity cards are responsive (3-column desktop, stacked mobile) with:
  - soft border
  - light shadow
  - subtle hover lift

### Stability and UX checks

- Verified no layout shift introduced in hero (fixed carousel height kept).
- Confirmed no overlap between floating WhatsApp CTA, footer links, and mobile menu.
- Confirmed `Next` flow in quote wizard remains visible and sticky on mobile.

### Final end-to-end lead checks after this hardening

- Microsoft RFQ: `200`, created `LD-20260214-1210`, visible in admin.
- Seqrite RFQ: `200`, created `LD-20260214-7929`, visible in admin.
- Generic procurement lead (`/api/lead`): `200`, created `LD-20260214-9792`, visible in admin.
- Admin status persistence check: `PATCH /api/admin/leads/[id]` -> `QUOTED` saved.

### URLs validated

- `/`
- `/request-quote`
- `/search`
- `/brands`
- `/microsoft`
- `/seqrite`
- `/cisco`
- `/contact`
- `/thank-you`
- `/locations/chandigarh`
- `/robots.txt`
- `/sitemap.xml`
