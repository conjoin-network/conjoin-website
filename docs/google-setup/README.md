# Google Search Console + Google Ads Setup (ConjoinNetwork)

This folder contains automation scaffolding for Google setup in this repo.

## What is automated

- GCP project bootstrap commands (scripted) with API enablement:
  - Search Console API
  - Site Verification API
  - Google Ads API
- Search Console flow automation:
  - generate DNS TXT verification token
  - write exact DNS record lines to `search-console-verify.txt`
  - request site verification (after DNS)
  - submit sitemap
  - write status JSON
- Google Ads scaffold generation (campaign/ad group/ad JSON blueprint, no billing mutation)
- Scheduled GitHub Action for sitemap resubmission + GSC status check

## Scripts

- `bash scripts/google/setup-gcp.sh`
- `node scripts/google/gsc-automation.mjs`
- `node scripts/google/ads-scaffold.mjs`
- `node scripts/google/gsc-monitor.mjs`

## Required env (when running API calls)

- `GOOGLE_OAUTH_ACCESS_TOKEN` (OAuth access token with GSC + Site Verification scopes)
- `GSC_SITE_URL` (default: `https://conjoinnetwork.com`)
- `GSC_DNS_VERIFIED=true` (set only after TXT record is added)

Optional for future Ads API mutations:
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CUSTOMER_ID`
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID`

## One-step verification completion

After DNS TXT is added from `search-console-verify.txt`, run:

```bash
GSC_DNS_VERIFIED=true GOOGLE_OAUTH_ACCESS_TOKEN=<token> node scripts/google/gsc-automation.mjs
```

This will request site verification and submit sitemap.

## Security

- Service account JSON keys are expected in `docs/google-setup/keys/*.json`.
- Key files are gitignored.
- Never commit real credentials.
