---
title: "ServiceNow"
category: OPS
order: 2
summary: "Navigating incidents, requests and changes, list filters, and the essentials of ITIL workflow."
tags: ["servicenow", "itsm", "incident", "change", "itil"]
updated: 2026-10-16
---
## Records and prefixes
| Prefix | Record | Purpose |
|---|---|---|
| INC | Incident | Something broke; restore service |
| REQ / RITM / SCTASK | Request / Requested item / Catalog task | Something asked for (access, hardware) |
| CHG | Change | Planned change to production |
| PRB | Problem | Root cause of repeated incidents |
| KB | Knowledge article | How-to / fix |

## Navigation tricks
- Filter navigator: type `incident.list`, `sc_req_item.list`, `change_request.list` and press Enter.
- `incident.do` opens a new form; `.LIST` (caps) opens the list in a new tab.
- Breadcrumb filters: right-click a value → *Show matching* / *Filter out*.
- Save a list filter as a **favorite** (star) and add columns via the gear icon.
- Encoded query: build a filter → right-click the breadcrumb → *Copy query* → reuse in reports/API.

## Useful list filters
```text
assigned_to=javascript:gs.getUserID()^active=true
assignment_group=<IT Endpoint>^state!=6^state!=7   (exclude resolved/closed)
sys_created_on>=javascript:gs.beginningOfLast30Days()
priority<=2^active=true
```

## Incident flow
New → In Progress → On Hold (awaiting caller/vendor) → Resolved (with resolution code + notes) → Closed (auto after N days).
Priority = **Impact × Urgency**. Write work notes (internal) vs additional comments (customer-visible) deliberately.

## Change types
| Type | Approval | Example |
|---|---|---|
| Standard | Pre-approved template | Add user to app group |
| Normal | CAB / manager approval | New Conditional Access policy |
| Emergency | Expedited, reviewed after | Revoke compromised token org-wide |
A normal change record needs: description, justification, risk, **implementation plan**, **backout plan**, **test plan**, schedule window. Same structure as your runbooks.

## REST API (Table API)
```bash
curl -s -u "$SN_USER:$SN_PASS" -H "Accept: application/json" \
  "https://<instance>.service-now.com/api/now/table/incident?sysparm_query=active=true^priority=1&sysparm_fields=number,short_description&sysparm_limit=20"
```
