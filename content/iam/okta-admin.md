---
title: "Okta: daily admin"
category: IAM
order: 1
summary: "Users, groups, app assignment, policies and System Log queries in the Okta Admin Console."
tags: ["okta", "users", "groups", "system log", "policies"]
updated: 2026-10-16
---
## Where things live
| Need | Admin Console path |
|---|---|
| Users, status, reset MFA | Directory → People |
| Groups and group rules | Directory → Groups (rules on the **Rules** tab) |
| Profile attributes / mappings | Directory → Profile Editor / Profile Sources |
| App integrations | Applications → Applications |
| Sign-on and MFA policy | Security → Authentication Policies, Global Session Policy, Authenticators |
| Device assurance | Security → Device Integrations / Device assurance policies |
| Admin roles | Security → Administrators |
| Audit trail | Reports → System Log |
| Workflows | Workflow → Okta Workflows |

## User lifecycle states
`STAGED` → `PROVISIONED` (activation email pending) → `ACTIVE` → `SUSPENDED` / `DEPROVISIONED` (deactivated). Other states: `LOCKED_OUT`, `PASSWORD_EXPIRED`, `RECOVERY`.

- **Deactivate** kills all sessions and fires deprovisioning to SCIM apps. It's the first step for any leaver.
- **Suspend** blocks sign-in but does not deprovision apps. Use it for leave of absence.
- **Delete** only works on deactivated users and is permanent. Keep deactivated users for audit history.

## Common tasks
**Reset MFA for a locked-out user**: People → user → **Reset Authenticators** → pick the factor(s). Verify identity out of band (video call, manager confirmation) before you do it, and note the ticket number.

**Clear sessions after a suspected compromise**: People → user → **More actions → Clear user sessions** (tick "Also revoke Okta-issued tokens"). Then reset password and authenticators.

**Assign an app by group (always prefer this)**: Applications → app → Assignments → Assign → Assign to Groups. Never assign individuals unless it's temporary, because individual assignments become orphaned access.

**Group rule example**: `user.department == "Finance" AND user.employeeType == "Full-Time"` → adds to `app-netsuite-users`.

## Group naming convention
`<type>-<system>-<role>` — e.g. `app-slack-users`, `app-aws-admins`, `role-finance`, `dept-engineering`, `policy-mfa-pilot`. It keeps search, rules and access reviews readable.

## System Log filters (copy into the search bar)
```text
eventType eq "user.session.start" and outcome.result eq "FAILURE"
eventType eq "user.lifecycle.deactivate"
eventType eq "user.mfa.factor.reset_all"
eventType sw "system.api_token"
eventType eq "policy.evaluate_sign_on" and outcome.result eq "DENY"
actor.alternateId eq "jane@company.com"
eventType eq "group.user_membership.add" and target.displayName eq "app-aws-admins"
eventType eq "security.threat.detected"
```
Tip: open any event, expand **Actor / Client / Target**, and click a value to add it as a filter.

## Gotchas
- Policies evaluate **top-down, first match wins**. A broad rule above a strict one silently overrides it.
- Always keep a **break-glass super admin** excluded from every new policy, with a hardware key stored offline.
- API tokens inherit the creating admin's permissions and expire after 30 days unused. Create them from a dedicated service account, or use OAuth service apps.
