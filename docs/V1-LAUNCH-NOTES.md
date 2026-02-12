# ConjoinNetwork Phase-1 V1.0 Launch Notes

## What's Live Now
- Corporate one-screen UX for key routes (`/`, `/microsoft*`, `/seqrite*`, `/cisco*`, `/products/*`, `/locations/*`, `/request-quote`, `/search`)
- Homepage hero aligned for procurement users with concise trust bullets and CTA flow
- Subtle enterprise motion only (soft hero gradient, gentle card hover, section reveal)
- Campaign landing pages:
  - `/campaigns/microsoft-365`
  - `/campaigns/seqrite-endpoint`
  - `/campaigns/cisco-security`
- Brand-aware Request Quote wizard at `/request-quote`:
  - Microsoft: Users/Seats terminology only
  - Seqrite: Deployment + Endpoints/Servers terminology only
  - Cisco/Other vendors: Requirement type + Users + Sites/Locations + optional budget range
- Lead intake API at `/api/quote` with file-backed storage in `data/leads.json`, server log line `QUOTE_LEAD`, and attribution fields (`utm_source`, `utm_campaign`, `utm_medium`, `sourcePage`, `pagePath`, `referrer`)
- Lead Ops Dashboard (management):
  - `/admin` (console home)
  - `/admin/leads` (status/priority/assignment/follow-up/notes + WhatsApp actions)
  - `/admin/agents` (agent counters: New, In-Progress, Won, touched today)
  - `/admin/scoreboard` (leads today, SLA met %, by brand/source/agent)
  - `/admin/messages` (message queue read-only)
- Thank-you confirmation flow at `/thank-you` with WhatsApp continuation CTA
- Uptime check endpoint: `/health`
- Sitewide WhatsApp CTA (floating + footer) using prefilled procurement message template
- Search and indexing framework:
  - `/search`
  - `/brands` + `/brands/[slug]`
  - `/knowledge` + `/knowledge/[slug]`
  - `/products` + `/products/[slug]`
  - `/locations` + `/locations/[slug]`

## What's Coming Soon
- Expanded brand content under `/brands/*` remains SEO-safe and non-spec until official matrices are published
- Knowledge placeholder articles are live and indexable:
  - `/knowledge/microsoft-licensing-basics`
  - `/knowledge/m365-business-vs-enterprise`
  - `/knowledge/edr-vs-antivirus`
  - `/knowledge/procurement-tco-checklist`
  - `/knowledge/renewal-management-best-practices`
  - `/knowledge/security-compliance-rfp-template`
  - `/knowledge/chandigarh-it-procurement-guide`
  - `/knowledge/cloud-migration-risk-mitigation`

## Lead Flow
- Search -> Brand/Page -> Request Quote -> `/api/quote` -> `/thank-you` -> WhatsApp follow-up

## Compliance Notes
- All product names, logos, and brands are trademarks of their respective owners.
- Specifications and inclusions shown are sourced from OEM documentation and may change.
- Final licensing and terms are governed by the OEM.
- Conjoin Network operates as a reseller/partner; no affiliation is implied beyond authorized sales/channel relationships.
- Where detailed inclusions are uncertain, wording remains generic as: "Official inclusions as per OEM".

## Stability Notes
- Dev script uses webpack (`npm run dev`) to reduce Turbopack manifest instability.
- Stable fallback script available: `npm run dev:stable`
- `next.config.ts` includes `allowedDevOrigins` for localhost and LAN preview on port 4310.

## Env Vars Needed for Lead Ops
- `ADMIN_USER`
- `ADMIN_PASS`
- `NEXT_PUBLIC_WHATSAPP_URL` (defaults to `https://wa.me/919466663015`)
- Optional agent routing:
  - `AGENT_WHATSAPP_ZEENA`
  - `AGENT_WHATSAPP_NIDHI`
  - `AGENT_WHATSAPP_RIMPY`
  - `AGENT_WHATSAPP_BHARAT`
  - `AGENT_WHATSAPP_PARDEEP`
