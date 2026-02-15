# Conjoin Phase-3 Pipeline

## Sprint Phases

1. Visibility + Revenue blockers
2. AI inside CRM
3. Automation engine
4. Sales acceleration

## Now / Next / Later

- **Now**: `P1-01`
- **Next**: `P1-02`, `P1-03`, `P2-01`
- **Later**: `P2-02`, `P2-03`, `P3-01`, `P3-02`

## Latest Batch Update

- ✅ Path bug audit re-checked (`src/*Users/msleox*`) and no invalid nested paths found.
- ✅ Go-live UI blockers fixed: logo/tagline authority pass, hero panel contrast, mobile slider clipping guard, hamburger reliability, header micro-polish.
- ✅ QA rerun completed (lint/typecheck/build + smoke + viewport checks + RFQ revenue flow checks).

## Task Board

| ID | Phase | Task | Status | Owner | Priority | Dependencies |
| --- | --- | --- | --- | --- | --- | --- |
| C0 | Cleanup | Remove invalid nested absolute paths under `src/` | DONE | Codex | P0 | - |
| G0-UI-01 | Go-live UI | Logo size + tagline polish | DONE | Codex | P0 | C0 |
| G0-UI-02 | Go-live UI | Hero white panel readability | DONE | Codex | P0 | G0-UI-01 |
| G0-UI-03 | Go-live UI | Mobile hero slider clipping fix | DONE | Codex | P0 | G0-UI-02 |
| G0-NAV-01 | Go-live UI | Mobile hamburger open/close and safe behavior | DONE | Codex | P0 | G0-UI-01 |
| G0-NAV-02 | Go-live UI | Header micro-polish (underline, blur, divider) | DONE | Codex | P0 | G0-NAV-01 |
| A1 | Visibility | Pipeline board in admin | DONE | Codex | P0 | - |
| P0-01 | Revenue Blockers | RFQ submission reliability and persistence | DONE | Codex | P0 | A1 |
| P0-02 | Revenue Blockers | Event log and audit trail foundation | DONE | Codex | P0 | P0-01 |
| P1-01 | AI CRM | AI lead summary in lead detail | DOING | Codex | P1 | P0-02 |
| P1-02 | AI CRM | AI email draft for quote response | TODO | Codex | P1 | P1-01 |
| P1-03 | AI CRM | AI objection reply chips | TODO | Codex | P1 | P1-01 |
| P2-01 | Automation | SLA rules engine and lead tasks | TODO | Codex | P2 | P0-02 |
| P2-02 | Automation | Follow-up sequences + automation runner | TODO | Codex | P2 | P2-01 |
| P2-03 | Automation | Round-robin assignment | TODO | Codex | P2 | P2-01 |
| P3-01 | Sales Acceleration | Quote builder v1 | TODO | Codex | P3 | P2-01 |
| P3-02 | Sales Acceleration | UTM capture and source filtering | TODO | Codex | P3 | P0-01 |
