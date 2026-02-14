# GO-LIVE V1 (Microsoft + Seqrite Lead Engine)

## What Is Live
- Microsoft + Seqrite quote wizard at `/request-quote` with strict 5-step brand-aware flow.
- Strict field behavior:
  - Step 1: Choose Brand.
  - Step 2: Choose Product (brand-filtered only).
  - Step 3: Users/Devices.
  - Step 4: Deployment type (`Cloud`, `On-Prem`, `Hybrid`).
  - Step 5: Contact details.
  - Microsoft path uses `Users / Seats` only.
  - Seqrite path uses `Devices / Endpoints` (+ optional servers where applicable).
  - Cisco/Other path stays neutral and category-first.
- Structured product registry now drives valid options:
  - `data/product-registry.json`
  - `lib/product-registry.ts`
  - `lib/quote-catalog.ts`
- Attribution capture on `/api/quote`:
  - `brand`, `category`, `plan`, `deployment`, quantity fields, `city`, `timeline`, `source`, UTM values, `pagePath`, `referrer`.
- Thank-you confirmation at `/thank-you` with WhatsApp continuation CTA.
- Search at `/search` grouped into Brands, Products, Locations, and Knowledge.

## What Is Coming Soon
- Expanded brand-specific playbooks and deeper procurement guides for non-Microsoft/Seqrite brands.
- Detailed quote pathways for additional OEMs as campaign priorities are finalized.

## Exact Lead Flow
1. User lands on brand/product page or campaign page.
2. User opens `/request-quote` (prefilled query params when available).
3. User completes brand-aware wizard with only valid options.
4. Frontend submits to `POST /api/quote`.
5. Lead is saved with attribution and quantity context.
6. User is redirected to `/thank-you` with lead summary.
7. User continues on WhatsApp with prefilled procurement message.

## Admin / Management Note
- Basic lead view exists under `/admin/leads` (password-protected by environment configuration).
- Management can review captured lead details, source attribution, and follow-up context.

## Compliance Confirmation
- No OEM technical specs were altered in this pass.
- Product names and route copy remain procurement-oriented and non-claiming.
- Partner/trademark disclaimer remains in place.

## Vercel Go-Live Steps
1. Import GitHub repo: `conjoin-network/conjoin-website`.
2. Use Next.js defaults with PNPM:
   - Build command: `pnpm build`
   - Start command: `pnpm start`
3. Configure required environment variables:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - `MAIL_FROM`, `LEADS_EMAIL`, `ADMIN_PASSWORD`
4. Configure optional variables:
   - `WHATSAPP_PROVIDER`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`
   - `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_URL`
5. Add and verify domains:
   - `conjoinnetwork.com` (apex)
   - `www.conjoinnetwork.com`

## Known Limits
- In-memory rate limiting is per-instance and not globally shared across multiple regions/instances.
- File-backed lead/message storage is local; production multi-instance deployments should migrate to managed DB/queue.
- If SMTP is missing, lead notifications degrade safely (lead is still saved, warnings logged, no crash).

## Final QA Commands
```bash
pnpm lint
pnpm typecheck
pnpm build
lsof -ti :4310 | xargs kill -9 2>/dev/null || true
PORT=4310 pnpm start
```

## Butter Smooth URLs (Morning Spot Check)
- `/`
- `/solutions`
- `/solutions/workspace`
- `/solutions/secure`
- `/solutions/vision`
- `/commercial`
- `/request-quote`

## UX Notes
- Service lines are modeled as portfolio delivery families (not SaaS plans/SKUs).
- Homepage carousel is lightweight, accessible, and calm (3-second rotation with manual controls).
- Primary navigation remains minimal with request-quote CTA always visible.
