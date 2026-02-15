# Conjoin Operations Runbook

## Workspace Guard

- Always run commands from: `/Users/msleox/Documents/conjoin/web`
- Never run on port `3000` for this project.
- Standard local port: `4310`

## Dev (Port 4310)

```bash
lsof -ti :4310 | xargs kill -9 2>/dev/null || true
cd /Users/msleox/Documents/conjoin/web
pnpm install
PORT=4310 pnpm dev
```

## Build

```bash
cd /Users/msleox/Documents/conjoin/web
pnpm build
```

## Start (Production Mode, Port 4310)

```bash
lsof -ti :4310 | xargs kill -9 2>/dev/null || true
cd /Users/msleox/Documents/conjoin/web
PORT=4310 pnpm start
```

## Notes

- If Next.js reports root/cwd mismatch, verify `pwd` is `/Users/msleox/Documents/conjoin/web`.
- Keep all app routes/components under repo-relative paths only (no absolute-path fragments in `src/` or `app/`).
