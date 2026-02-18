# Conjoin Technical SEO Checklist

Last updated: 2026-02-18

## Crawl and host controls
- `PASS` Primary canonical host: `https://conjoinnetwork.com` via metadata + non-`www` normalization in `lib/seo.ts`.
- `PASS` `www` to apex redirect rule added in `next.config.ts` (`redirects` host matcher).
- `PASS` Public crawl allowed in `/robots.txt`; restricted paths only: `/admin/`, `/api/admin/`, `/ui-kit`.
- `PASS` `sitemap.xml` referenced in `/robots.txt` as `https://conjoinnetwork.com/sitemap.xml`.

## Sitemap quality
- `PASS` Dynamic sitemap route at `/sitemap.xml` returns `200`.
- `PASS` Important routes included:
  - `/`
  - `/contact`
  - `/request-quote`
  - `/microsoft-365-chandigarh`
  - `/seqrite-chandigarh`
  - New local intent pages:
    - `/microsoft-365-reseller-chandigarh`
    - `/microsoft-365-business-basic-chandigarh`
    - `/microsoft-365-business-standard-chandigarh`
    - `/microsoft-365-business-premium-chandigarh`
    - `/endpoint-security-chandigarh`
    - `/endpoint-security-panchkula`
    - `/endpoint-security-mohali`
    - `/it-procurement-chandigarh`
- `PASS` `lastmod` emitted in ISO format from `app/sitemap.ts`.

## Canonical and metadata integrity
- `PASS` `metadataBase` set in `/app/layout.tsx`.
- `PASS` Canonical emitted via `buildMetadata(...)` for public pages.
- `PASS` Public pages do not set `noindex`.
- `PASS` Admin/dev pages remain controlled with `robots` settings in route metadata.

## Structured data
- `PASS` Sitewide JSON-LD in `/app/layout.tsx`:
  - `Organization`
  - `WebSite` (+ SearchAction)
  - `LocalBusiness`
- `PASS` Page-level JSON-LD:
  - `FAQPage` on quote + service pages
  - `BreadcrumbList` on content/category/service routes
  - `Service` schema on service landing pages
- `PASS` Telephone normalized to single format (`+91 9466663015`) from `/config/site.ts`.

## Performance and crawl safety
- `PASS` Cache headers configured in `/next.config.ts`:
  - immutable for `/_next/static/*`
  - SWR policy for public pages and sitemap/robots
  - `no-store` for API/admin/CRM
- `PASS` Security headers present (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- `PASS` GTM/GA loaded `afterInteractive` in `/app/layout.tsx` (no render-blocking injection on first paint).

## Validation commands
- `pnpm typecheck`
- `pnpm build`
- `(lsof -ti :4310 | xargs kill -9 2>/dev/null || true) && PORT=4310 pnpm start`
- `curl -I http://127.0.0.1:4310/robots.txt`
- `curl -I http://127.0.0.1:4310/sitemap.xml`
- `curl -s http://127.0.0.1:4310/api/health`

## Search Console hygiene (manual owner actions)
- Keep only the active sitemap: `https://conjoinnetwork.com/sitemap.xml`.
- Remove or ignore old sitemap paths from previous platforms if still listed.
- URL inspect and request indexing for:
  - `/microsoft-365-reseller-chandigarh`
  - `/endpoint-security-chandigarh`
  - `/it-procurement-chandigarh`
