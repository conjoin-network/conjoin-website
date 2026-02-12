# ConjoinNetwork Site (Phase-1 V1.0)

Corporate, procurement-friendly lead engine for Microsoft, Seqrite and multi-brand OEM advisory.

## Live Scope
- One-screen public pages with short, scannable above-the-fold structure
- Brand-aware quote wizard at `/request-quote` (Microsoft / Seqrite / Cisco-Other paths)
- Lead intake API at `/api/quote` with JSON + file storage in `data/leads.json`
- Thank-you flow at `/thank-you` with WhatsApp continuation
- Search index at `/search`
- SEO route network:
  - `/brands`, `/brands/[slug]`
  - `/knowledge`, `/knowledge/[slug]`
  - `/products/[slug]`
  - `/locations/[slug]`
- CRM-lite dashboard at `/admin/leads` (Basic Auth)
- Management dashboards:
  - `/admin/leads`
  - `/admin/agents`
  - `/admin/scoreboard`
  - `/admin/messages`

## Environment Variables
Create `.env.local`:

```env
# Basic Auth for /admin/* and /api/admin/*
ADMIN_USER="admin"
ADMIN_PASS="change-me"

# Canonical domain
NEXT_PUBLIC_SITE_URL="https://conjoinnetwork.com"

# WhatsApp CTA base URL
NEXT_PUBLIC_WHATSAPP_URL="https://wa.me/919466663015"

# Sales emails
NEXT_PUBLIC_SALES_EMAIL="sales@conjoinnewtork.com"
SALES_EMAIL="sales@conjoinnewtork.com"
SALES_EMAIL_FALLBACK="manod1326@gmail.com"

# Optional agent WhatsApp routing
AGENT_WHATSAPP_ZEENA=""
AGENT_WHATSAPP_NIDHI=""
AGENT_WHATSAPP_RIMPY=""
AGENT_WHATSAPP_BHARAT=""
AGENT_WHATSAPP_PARDEEP=""

# Optional SMTP for lead notifications (if unset, lead save still works)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
MAIL_FROM="sales@conjoinnewtork.com"
```

## Run Locally (Port 4310)

```bash
npm ci
npm run lint
npm run build
lsof -ti :4310 | xargs kill -9 2>/dev/null || true
PORT=4310 npm run dev
```

Open [http://localhost:4310](http://localhost:4310).

### Stable Dev Fallback
If you hit the React Client Manifest/Turbopack dev crash, run:

```bash
PORT=4310 npm run dev:stable
```

Optional cleanup before retrying:

```bash
rm -rf .next
```

## Compliance Notes
- Conjoin is a reseller/partner.
- Product names/logos belong to their owners.
- Specs/inclusions are OEM-sourced and may change.
- Final licensing is governed by OEM terms.
