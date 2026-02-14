# Go-Live Checklist (ConjoinNetwork Phase-1)

## Domain & Security
- [ ] Production domain points to active deployment (`conjoinnetwork.com`)
- [ ] SSL certificate valid for apex + www (if used)
- [ ] `NEXT_PUBLIC_SITE_URL` set to `https://conjoinnetwork.com`
- [ ] Owner credentials set (`OWNER_USER` / `OWNER_PASS`)
- [ ] Optional role credentials set (`MANAGER_*`, `AGENT_*`, `SUPPORT_*`)
- [ ] `ADMIN_SESSION_SECRET` set in production

## Indexing
- [ ] `https://conjoinnetwork.com/robots.txt` returns 200
- [ ] `https://conjoinnetwork.com/sitemap.xml` returns 200
- [ ] `/admin/` disallowed in robots and admin pages return noindex meta
- [ ] Search Console sitemap submitted
- [ ] Bing Webmaster sitemap submitted

## Analytics & Conversion Tracking (Placeholder Ready)
- [ ] GA4 property created and placeholder script plan approved
- [ ] Conversion events TODO documented (`rfq_submit`, `whatsapp_click`, `call_click`)
- [ ] UTM parameters visible in `/admin/leads` for campaign traffic

## Core Route Smoke Check
- [ ] `/`
- [ ] `/brands`
- [ ] `/categories`
- [ ] `/knowledge`
- [ ] `/search`
- [ ] `/request-quote`
- [ ] `/thank-you`
- [ ] `/microsoft`
- [ ] `/seqrite`
- [ ] `/cisco`
- [ ] `/campaigns/microsoft-365`
- [ ] `/campaigns/seqrite-endpoint`
- [ ] `/campaigns/cisco-security`
- [ ] All `/brands/<slug>` routes return 200
- [ ] All `/categories/<slug>` routes return 200
- [ ] `/brands` shows all tiles as LIVE

## Lead Flow Validation
- [ ] Submit RFQ from each campaign page
- [ ] Verify lead saved in `data/leads.json`
- [ ] Verify `QUOTE_LEAD` server log appears
- [ ] Verify thank-you page shows lead context
- [ ] Verify WhatsApp prefill contains brand, city and requirement
- [ ] Verify admin can assign/status-update from `/admin/leads`

## UX QA (Mobile + Desktop)
- [ ] Hero above fold is concise (headline, subhead, 2 CTAs, trust bullets)
- [ ] No long paragraph walls in top sections
- [ ] Buttons/links have hover and keyboard focus states
- [ ] Navigation active state is visible
- [ ] No overflow or broken layout on 360px mobile width

## Compliance QA
- [ ] Trademark/partner disclaimer visible in footer
- [ ] Disclaimer present on campaign/brand/product pages
- [ ] No distributor mentions or implied OEM affiliation claims
- [ ] No unsourced OEM specs or invented inclusions
