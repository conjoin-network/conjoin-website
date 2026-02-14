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
- CRM-lite dashboard at `/admin/leads` (password login + cookie session)
- Role-ready admin session with `OWNER`, `MANAGER`, `AGENT`, `SUPPORT`
- Management dashboards:
  - `/admin/leads`
  - `/admin/agents`
  - `/admin/scoreboard`
  - `/admin/messages`

## Environment Variables
Create `.env.local`:

```env
# Portal login for /admin/* and /api/admin/*
OWNER_USER="owner"
OWNER_PASS="change-me"
OWNER_NAME="Owner"

MANAGER_USER=""
MANAGER_PASS=""
MANAGER_NAME="Manager"
MANAGER_CAN_EXPORT="false"

AGENT_USER="agent"
AGENT_PASS="change-me"
AGENT_NAME="Girish"
AGENT_ASSIGNEE="Girish"

SUPPORT_USER="support"
SUPPORT_PASS="change-me"
SUPPORT_NAME="Kiran"
SUPPORT_ASSIGNEE="Kiran"

ADMIN_SESSION_SECRET=""
ADMIN_ACTOR_LABEL="Management"

# Canonical domain
NEXT_PUBLIC_SITE_URL="https://conjoinnetwork.com"

# Contact emails
NEXT_PUBLIC_SALES_EMAIL="sales@conjoinnetwork.com"
NEXT_PUBLIC_SUPPORT_EMAIL="support@conjoinnetwork.com"
SALES_EMAIL="sales@conjoinnetwork.com"
SUPPORT_EMAIL="support@conjoinnetwork.com"
LEADS_EMAIL="leads@conjoinnetwork.com"
OPTIONAL_PERSONAL_EMAIL="manod@conjoinnetwork.com"

# Optional agent WhatsApp routing
AGENT_WHATSAPP_ZEENA=""
AGENT_WHATSAPP_NIDHI=""
AGENT_WHATSAPP_RIMPY=""
AGENT_WHATSAPP_BHARAT=""
AGENT_WHATSAPP_PARDEEP=""
AGENT_WHATSAPP_GIRISH=""
AGENT_WHATSAPP_KIRAN=""

# Optional SMTP for lead notifications (if unset, lead save still works)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
MAIL_FROM="sales@conjoinnetwork.com"

# Optional WhatsApp API skeleton config
WHATSAPP_VERIFY_TOKEN=""
WHATSAPP_PROVIDER=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
```

## Run Locally (Port 4310)

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run dev:4310
```

Open [http://localhost:4310](http://localhost:4310).

### QA Note
Run go-live checks while local server is running:

```bash
npm run qa:smoke
npm run qa:golive
```

### Stable Dev Fallback
If you hit the React Client Manifest/Turbopack dev crash, run:

```bash
PORT=4310 npm run dev:stable
```

Optional cleanup before retrying:

```bash
rm -rf .next
```

### Production-mode local check

```bash
npm run start:4310
```

## Compliance Notes
- Conjoin is a reseller/partner.
- Product names/logos belong to their owners.
- Specs/inclusions are OEM-sourced and may change.
- Final licensing is governed by OEM terms.

## Admin Login
- Open `/admin/login`
- Enter role credentials (`OWNER`, `MANAGER`, `AGENT`, `SUPPORT`).
- Role behavior:
  - `OWNER`: all leads + assignment + export
  - `MANAGER`: all leads + assignment (export optional via `MANAGER_CAN_EXPORT`)
  - `AGENT`: assigned leads only, no export
  - `SUPPORT`: assigned leads only, no export
- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.

## Security Notes
- HTTPS is enforced by production hosting/edge (for example Vercel/Cloudflare). Local development runs on `http://localhost:4310`.
- Admin pages are non-indexable and robots-disallowed (`/admin/*`).
- Security headers are enabled globally (`nosniff`, `referrer-policy`, `permissions-policy`) with CSP in report-only mode.
