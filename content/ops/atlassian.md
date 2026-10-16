---
title: "Atlassian: Jira, JSM, Confluence, Rovo"
category: OPS
order: 1
summary: "Admin essentials for Jira Service Management queues and SLAs, JQL, automation, Confluence spaces and Rovo."
tags: ["jira", "jira service management", "jsm", "confluence", "rovo", "jql", "automation"]
updated: 2026-10-16
---
## Admin locations
| Need | Where |
|---|---|
| Users, groups, SSO, SCIM | admin.atlassian.com → Directory / Security (SSO needs **Atlassian Guard**) |
| Product access | admin.atlassian.com → Products / Groups |
| JSM request types, queues, SLAs | Project settings (service project) |
| Automation | Project settings → Automation (or global: Settings → System → Automation) |
| Confluence space permissions | Space settings → Permissions |
| Rovo | admin.atlassian.com → Rovo / AI settings, connectors |

## Okta → Atlassian
Verify your domain → Atlassian Guard → **Identity providers** → add Okta (SAML) → **user provisioning** (SCIM) from Okta. Product access then follows synced groups (e.g. `app-jira-users` → Jira).

## JSM setup checklist
1. **Request types** with simple customer-facing names ("Get access to an app", "Laptop problem", "New hire setup").
2. **Portal groups** to organize them.
3. **Queues** for agents: *Unassigned*, *My open*, *Breaching SLA*, *Access requests*.
4. **SLAs**: Time to first response, Time to resolution, with calendars and goals by priority.
5. **Approvals** on access requests (approver = manager field or app owner group).
6. **Knowledge base**: link a Confluence space so suggested articles deflect tickets.

## JQL you'll reuse
```sql
project = IT AND status not in (Done, Closed) AND assignee is EMPTY ORDER BY created ASC
project = IT AND "Request Type" = "Get access to an app" AND created >= -30d
project = IT AND "Time to resolution" = breached()
project = IT AND resolved >= startOfMonth(-1) AND resolved < startOfMonth()
assignee = currentUser() AND statusCategory != Done
text ~ "vpn" AND created >= -7d
```

## Automation recipes
- **Auto-triage**: When issue created → if summary contains "password|locked" → set request type + assign to L1 + comment KB link.
- **Access request**: When approved → Send web request to Okta API (add user to group) → comment and resolve. Store the token as a secret.
- **Stale pending**: Scheduled daily → JQL `status = "Waiting for customer" AND updated <= -5d` → comment reminder; after 10 days resolve.
- Smart values: `{{issue.reporter.emailAddress}}`, `{{issue.customfield_10050}}`, `{{now.format("yyyy-MM-dd")}}`.

## Confluence
- Space per team; **runbooks** as page templates; labels for search (`runbook`, `okta`, `jamf`).
- Permissions: space-level groups, page restrictions only when needed.
- Archive stale pages yearly; owner listed at the top of every runbook.

## Rovo
Atlassian's AI layer: search across Jira/Confluence and connected apps, chat, and **agents**. For service desks, use it to suggest KB articles, summarize tickets, and draft replies. Check its permissions follow the user's product access, and review connectors before enabling.
