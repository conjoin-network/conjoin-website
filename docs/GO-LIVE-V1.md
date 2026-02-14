# GO-LIVE V1 (Microsoft + Seqrite Lead Engine)

## What Is Live
- Microsoft + Seqrite quote wizard at `/request-quote` with brand-aware steps.
- Strict field behavior:
  - Microsoft path: product family + plan + `Users / Seats`.
  - Seqrite path: product + conditional deployment + `Endpoints` (+ servers only when applicable).
  - Cisco/other path: requirement category + simple requirement detail fields.
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
