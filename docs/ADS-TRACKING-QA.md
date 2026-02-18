# Google Ads + GA4 Tracking QA (ConjoinNetwork)

## IDs
- GA4 Measurement ID: `G-QEC3H4JS1Y`
- Google Ads Conversion ID: `17956533755` (`AW-17956533755`)
- Google Ads Conversion Label: `gN4jCKrqhPsbEPvq_JC`
- Google Ads Account: `507-627-9715`

## GTM Setup (manual in account)
1. Add `Conversion Linker` tag on `All Pages`.
2. Add `Google Ads Conversion Tracking` tag:
   - Conversion ID: `17956533755`
   - Conversion Label: `gN4jCKrqhPsbEPvq_JC`
   - Value: `1`
   - Currency: `INR`
3. Trigger conversion tag on custom event: `lead_submit_success`.

## Website Events (already emitted)
- `lead_submit_success` is pushed to `dataLayer` only after successful lead API response (`2xx` + `ok:true/success:true`).
- Form-specific events:
  - Contact form: `lead_type=contact`, `form_name=contact_lead_form`
  - Quote form: `lead_type=quote`, `form_name=request_quote_wizard`
- Phone/WhatsApp click events:
  - `phone_click`
  - `whatsapp_click`

## Code pointers (owner verification)
- `/app/contact/ContactLeadForm.tsx`
  - Success condition: `response.ok` and payload `ok !== false`.
  - Fires: `trackGaEvent("generate_lead", ...)`, `trackAdsConversion("lead_submit", ...)`, `pushDataLayerEvent("lead_submit_success", ...)`.
- `/app/request-quote/RequestQuoteWizard.tsx`
  - Success condition: `response.ok` for quote submit branch.
  - Fires: quote submit conversion + `lead_submit_success` style event payload.
- `/app/components/AdsTrackedLink.tsx` and `/app/components/OutboundClickTracker.tsx`
  - Click tracking coverage for `tel:`, `mailto:`, and `wa.me` links.

## Regression rule
- Conversion events must never fire on page load.
- Conversion events must never fire on failed API responses.
- Any future form flow changes should preserve success-only trigger behavior.

## GA4 + Ads Linking (manual in account)
1. GA4 Admin -> Product Links -> Google Ads links -> link account `507-627-9715`.
2. Google Ads -> Tools -> Conversions -> Import from GA4 key events.
3. Mark `generate_lead` as a key event in GA4.
4. Ensure auto-tagging is enabled in Google Ads.

## Production QA
1. Open [https://conjoinnetwork.com/contact](https://conjoinnetwork.com/contact), submit a real test lead.
2. Confirm:
   - Lead API success response (`2xx`).
   - `lead_submit_success` appears in Tag Assistant.
   - `generate_lead` appears in GA4 DebugView.
3. Open [https://conjoinnetwork.com/request-quote](https://conjoinnetwork.com/request-quote), submit successful RFQ.
4. Confirm conversion trigger fires once per success.
