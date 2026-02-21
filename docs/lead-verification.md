# Conjoin Lead Verification (CRM + GA4/Google Ads)

## Scope verified
- Landing forms:
  - `/microsoft-365-chandigarh#lead-form`
  - `/seqrite-chandigarh#lead-form`
  - `/contact`
  - `/request-quote`
- Success criterion: frontend treats any `2xx` (`response.ok`) as success and redirects to `/thank-you`.

## Conversion events on successful submit
- Conversion firing is centralized in `trackLeadConversion()` (`/Users/msleox/Documents/conjoin/web/lib/ads.ts`).
- Trigger point: `/thank-you` page load via `/Users/msleox/Documents/conjoin/web/app/thank-you/ThankYouTracking.tsx`.
- Event emitted:
  - `generate_lead` (GA4/Google Tag data layer and gtag event)
- Optional direct Google Ads conversion:
  - enabled only when `NEXT_PUBLIC_ADS_CONVERSION_MODE=direct`
  - uses `send_to` from `NEXT_PUBLIC_GOOGLE_ADS_ID` + `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`
- Double-count prevention:
  - default mode keeps GA4 key-event import workflow (no direct Ads conversion event unless explicitly enabled).

## Lead storage source of truth
- Lead writes:
  - `/api/leads` -> `createCrmLead()` -> `CrmLead`
  - `/api/quote` -> `createCrmLead()` -> `CrmLead`
- Admin reads:
  - `/api/admin/leads` -> `listCrmLeads()` -> `CrmLead`
- Admin CSV export:
  - `/api/admin/leads/export` -> `listCrmLeads()` -> `CrmLead`

Result: write/read/export now use the same model (`CrmLead`).

## Success-only behavior checks
- Contact and landing forms (`ContactLeadForm`) call `/api/leads`.
  - Success check: `response.ok`
  - Redirect: `/thank-you?formSource=...&leadId=...` (if available)
- Quote wizard (`RequestQuoteWizard`) calls `/api/quote`.
  - Success check: `response.ok`
  - Redirect: `/thank-you?formSource=request-quote&leadId=...`
- Thank-you/conversion does not trigger on failed API responses.

## Attribution capture and persistence
- Captured at form submit:
  - `gclid`, `gbraid`, `wbraid`
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
  - `landing_page`, `referrer`
- Stored in CRM:
  - Native columns where available: UTM fields + `gclid` + `pageUrl`
  - Extended attribution metadata (`landing_page`, `referrer`, `gbraid`, `wbraid`) appended in a structured marker in `notes`, then normalized back for admin/export views.

## Server logging added (safe; no PII values)
- Lead save success logs include:
  - `leadId`, `createdAt`, `pagePath`, `hasGclid` (Y/N), `hasUtmSource` (Y/N)
- Lead save failure logs include:
  - `requestId`, error name/message, DB configured Y/N, environment

## Mismatches found and fixed
1. Contact form source was hardcoded to `/contact` on all landing pages.
   - Fixed: source/page path now uses actual pathname.
2. Quote API saved `gclid` from `utmTerm` by mistake.
   - Fixed: `gclid` now reads `payload.gclid`.
3. Attribution fields `gbraid/wbraid/landing_page/referrer` were not consistently persisted.
   - Fixed: standardized capture + storage + normalization.
4. Conversion handling was split across forms and thank-you.
   - Fixed: centralized lead conversion in `trackLeadConversion()` on thank-you.

## Why Google Ads shows conversions but not phone/email
- Google Ads and GA4 conversion reports are event-level analytics, not CRM records.
- PII (phone/email/name) is not exposed in Ads conversion tables.
- To see lead contact details, use:
  - Admin UI: `/admin/leads`
  - CSV export: `/api/admin/leads/export`
  - Internal lead-notification email inbox (if SMTP configured)

## Tag Assistant verification notes
1. Open the site with Tag Assistant.
2. Submit a lead form successfully (must return `2xx`).
3. Confirm `generate_lead` appears after redirect to `/thank-you`.
4. Confirm conversion is counted once per lead submit flow.
