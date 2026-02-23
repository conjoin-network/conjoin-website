# CRM Subdomain DNS Fix (GoDaddy -> Vercel)

Scope: `crm.conjoinnetwork.com` for CRM gateway routing.

## Recommended DNS configuration

Use one of these two options (do not keep both):

1. **A record**
   - Host: `crm`
   - Type: `A`
   - Value: `76.76.21.21`
   - TTL: `600`

2. **CNAME record** (preferred for Vercel-managed aliasing)
   - Host: `crm`
   - Type: `CNAME`
   - Value: `cname.vercel-dns.com`
   - TTL: `600`

## Remove conflicting records

- Remove any old `A` record for `crm` pointing to `13.234.232.11`.
- Keep only one active route target for `crm`.

## Verification checklist

1. `crm.conjoinnetwork.com` resolves to Vercel edge (`76.76.21.21` or CNAME target).
2. `curl -I https://crm.conjoinnetwork.com` returns HTTP `200`/`3xx` (not connection closed).
3. `https://crm.conjoinnetwork.com/robots.txt` returns:
   - `User-agent: *`
   - `Disallow: /`
