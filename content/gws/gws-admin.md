---
title: "Google Workspace admin"
category: GWS
order: 1
summary: "Admin console essentials: OUs, 2SV enforcement, sharing controls, context-aware access and investigations."
tags: ["google workspace", "admin console", "2sv", "security"]
updated: 2026-10-16
---
## Where things live (admin.google.com)
| Need | Path |
|---|---|
| Users, suspend, reset | Directory → Users |
| Org units (policy targeting) | Directory → Organizational units |
| 2-Step Verification | Security → Authentication → 2-step verification |
| SSO with Okta | Security → Authentication → SSO with third-party IdP |
| Drive sharing | Apps → Google Workspace → Drive and Docs → Sharing settings |
| Third-party app access (OAuth) | Security → Access and data control → API controls |
| Context-Aware Access | Security → Access and data control → Context-Aware Access |
| Endpoint management | Devices → Mobile & endpoints |
| Audit logs | Reporting → Audit and investigation |
| Security investigation tool | Security → Security center → Investigation tool (Enterprise) |

## Security baseline
1. **Enforce 2SV** for everyone, security keys/passkeys for admins. Give a new-user enrollment period (e.g. 1 week).
2. **Separate admin accounts**: daily account has no admin role.
3. **External sharing**: warn when sharing outside, default link sharing to *Restricted*, allowlist trusted domains if needed.
4. **API controls**: block unconfigured third-party apps, mark known apps *Trusted*. Review **App access** for apps with Drive/Gmail scopes.
5. **Less secure apps / legacy auth** off.
6. **Alert center** on: suspicious login, leaked password, government-backed attack, admin privilege changes.

## Offboarding in the console
Suspend (blocks sign-in, keeps data) → reset sign-in cookies → revoke app-specific passwords and OAuth tokens (user → Security) → transfer Drive data (Apps → Drive → Transfer ownership, or **Data transfer** in Account) → set email forwarding/delegation or convert to group → remove from groups → after retention, delete (deletion offers data transfer too). Licence frees on delete, not suspend (unless archived user licence).

## Investigation queries (Reporting → Audit and investigation)
- **Login log**: event = *Failed login* / *Suspicious login*, filter by actor.
- **Drive log**: visibility change to *Public on the web* or *External*; downloads by one user in the last 7 days (data-exfil check before a leaver goes).
- **OAuth log**: new apps authorized with Gmail scopes.
- **Admin log**: role assignments, setting changes.

## Gotchas
- Settings inherit down the OU tree; a child OU override shows as *Overridden*. Check where a setting is set before changing it.
- Groups can be used for policy targeting too (config groups) — handy for pilots without moving OUs.
- With Okta SSO, keep the super admins **outside** the SSO profile so you can still sign in if Okta fails.
