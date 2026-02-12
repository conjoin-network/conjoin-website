# Ops Lead SLA (Phase-1)

## Response Target
- First response target: **15 minutes** during business hours.
- Channels:
  - WhatsApp first
  - Email summary follow-up

## Assignment Rules
- Zeena: Enterprise
- Rimpy: Dealer
- Nidhi: End Customer
- Bharat: Local Installation
- Pardeep: Local Installation

## Status Workflow
1. `NEW`
2. `IN_PROGRESS`
3. `QUOTED`
4. `WON` or `LOST`

## Priority Policy
- `HOT`: decision window today/urgent closure.
- `WARM`: active conversation this week.
- `COLD`: early stage or delayed timeline.

## Mandatory Admin Actions Per Lead
1. Assign owner.
2. Set status.
3. Set priority.
4. Set next follow-up datetime.
5. Add activity note for each meaningful interaction.

## Contact Logging
- Use **Mark as contacted** in `/admin/leads` immediately after first response.
- This captures:
  - `firstContactAt`
  - `firstContactBy`
  - `lastContactedAt`

## Escalation Matrix
- If no response in 15 minutes:
  - escalate to available management owner.
- If lead is `HOT` and unassigned:
  - assign immediately before end of current session.
- If quote blocked by missing scope:
  - send clarification request the same day and note it in timeline.

## Compliance Note
- Use only official/compliance-ready quote language.
- Do not send non-approved pricing or speculative OEM claims.
