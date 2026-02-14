# Launch Ready Checklist (Final 60 Minutes)

## 1) Domain and SSL
- Confirm DNS points to production host.
- Confirm HTTPS certificate is valid and auto-renew is active.
- Verify apex + `www` redirect behavior.
- Ensure `ADMIN_PASSWORD` is set before opening `/admin/login`.

## 2) Crawl and Indexing
- Open `/robots.txt` and confirm `200`.
- Open `/sitemap.xml` and confirm `200`.
- Verify no accidental `noindex` on public pages.
- Submit sitemap in Google Search Console and Bing Webmaster Tools.

## 3) Analytics and Attribution (Placeholder-Safe)
- Confirm UTM params persist into `/request-quote`.
- Run one test URL:
  - `?utm_source=google&utm_medium=cpc&utm_campaign=launch-m365`
- Confirm lead row captures:
  - source
  - utm_source / utm_medium / utm_campaign
  - pagePath / referrer

## 4) Lead Funnel Checks
- Submit one Microsoft test lead.
- Submit one Seqrite test lead.
- Confirm both appear in `/admin/leads`.
- Confirm assignment, status, priority, and note save correctly.
- Confirm CSV export works.

## 5) WhatsApp Workflow Checks
- Click floating WhatsApp CTA.
- Click WhatsApp button from `/thank-you`.
- Click “WhatsApp customer” from `/admin/leads`.
- Verify prefilled text is corporate and requirement-aware.

## 6) SLA and Ops Checks
- Mark one lead as contacted and verify:
  - `firstContactAt`
  - `firstContactBy`
  - `lastContactedAt`
- Check `/admin/agents` counters update.
- Check `/admin/scoreboard` leads today + SLA KPI.

## 7) Performance Sanity
- Open home page and confirm no blocking console errors.
- Verify no layout overflow on mobile.
- Confirm key pages load quickly:
  - `/`
  - `/microsoft`
  - `/seqrite`
  - `/request-quote`
  - `/campaigns/*`

## 8) Health and Runtime
- Confirm `/health` returns `200`.
- Confirm admin auth prompts as expected.
- Final run:
  - `npm run lint`
  - `npm run build`
  - `PORT=4310 npm run dev`
