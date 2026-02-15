# Phase 2 Migration Notes

## Scope
- Introduces Prisma schema foundation for enterprise catalog + CRM entities.
- Adds platform seed script to populate brand/product/article/agent catalog tables.
- Keeps Phase-1 lead flow runtime stable on existing API contracts.

## New Data Foundations
- Prisma schema: `/Users/msleox/Documents/conjoin/web/prisma/schema.prisma`
  - Models: `Brand`, `Product`, `Lead`, `Agent`, `Article`
  - Includes indexes for lead pipeline, product lookup, and article publishing.
- Platform catalog source: `/Users/msleox/Documents/conjoin/web/lib/platform-catalog.ts`
- Seeder: `/Users/msleox/Documents/conjoin/web/scripts/seed.ts`

## Migration Steps (safe order)
1. Backup current DB:
```bash
cp /Users/msleox/Documents/conjoin/web/data/crm-leads.sqlite /Users/msleox/Documents/conjoin/web/data/crm-leads.sqlite.bak
```
2. Ensure env:
```bash
DATABASE_URL="file:./data/platform.db"
LEAD_DB_PATH="./data/crm-leads.sqlite"
```
3. Generate Prisma client and migrate (when Prisma packages are installed):
```bash
npx prisma generate
npx prisma migrate dev --name phase2_platform_foundation
```
4. Seed catalog tables:
```bash
npm run seed:platform
```
5. Validate app:
```bash
npm run lint
npm run typecheck
npm run build
```

## Rollback Plan
1. Revert code to previous commit/tag.
2. Restore DB backup:
```bash
mv /Users/msleox/Documents/conjoin/web/data/crm-leads.sqlite.bak /Users/msleox/Documents/conjoin/web/data/crm-leads.sqlite
```
3. Restart app:
```bash
npm run port:free
PORT=4310 npm run dev
```

## Notes
- Phase-2 keeps existing RFQ endpoint contracts unchanged.
- File-based lead persistence remains for local/VPS; for serverless production, configure durable DB before disabling fallback safeguards.
