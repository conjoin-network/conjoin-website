# RFQ Revenue Dummy QA Report

Generated: 2026-02-15T04:52:57.811Z
Base URL: http://127.0.0.1:4310

## API Scenarios

| Scenario | Description | Result | HTTP | RFQ ID | Message |
| --- | --- | --- | --- | --- | --- |
| S1 | Microsoft 365 - Chandigarh - This Week | PASS | 200 | LD-20260215-4530 | - |
| S2 | Seqrite endpoint - Mohali - This Month | PASS | 200 | LD-20260215-6582 | - |
| S3 | CCTV / Surveillance - Panchkula - Urgent | PASS | 200 | LD-20260215-2950 | - |
| S4 | Optional fields empty (notes blank) should submit | PASS | 200 | LD-20260215-5977 | - |
| S6 | Large notes text (500+ chars) should submit | PASS | 200 | LD-20260215-1623 | - |

## Scenario 5 (Client validation, no API call)

- Result: **PASS**
- API quote calls: 0
- Notice: Complete name, company, email, phone and city before submit.

## Admin verification

- Admin login status: 200
- Leads list status: 200
- Found 5/5 new RFQ IDs in CRM list
- RFQ IDs: LD-20260215-4530, LD-20260215-6582, LD-20260215-2950, LD-20260215-5977, LD-20260215-1623

## Admin assignment + status workflow

- Result: **PASS**
- Lead ID: LD-20260215-4530
- Assign PATCH status: 200
- Quoted PATCH status: 200
- Persisted status: QUOTED
- Persisted assignee: Nidhi

## Persistence after restart

- Pending (run `node scripts/qa-rfq-persistence-check.mjs` after restart)
