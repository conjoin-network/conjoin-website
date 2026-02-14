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
