---
title: "Joiner / Mover / Leaver runbook"
category: GRC
order: 1
summary: "Step-by-step onboarding, role change and offboarding across Okta, Google, Microsoft and devices."
tags: ["onboarding", "offboarding", "jml", "runbook", "leaver"]
updated: 2026-10-16
---
## Joiner (target: productive on day one, zero IT touch)
1. HR system creates the worker → Okta profile is mastered from HR (or created manually with department, title, manager, start date).
2. Group rules place the user in `dept-*` and `role-*` groups → app assignments follow.
3. SCIM creates accounts in Google Workspace / M365 / Slack / others.
4. Laptop: serial assigned in ABM to Jamf (or Autopilot for Windows) → shipped to the user.
5. Day one: user activates Okta, enrolls phishing-resistant MFA, opens the laptop → PreStage/Autopilot enrolls → profiles, EDR, apps install.
6. Verify: device compliant in Jamf/Intune, Okta Device Trust shows managed, user can reach core apps.
7. Close the ticket with links to the evidence (Okta event, Jamf record).

## Mover
1. HR changes department/title → Okta attributes update.
2. Group rules move the user; **confirm old-role access was removed**, not just new access added.
3. Manually granted access from the old role: review and remove.
4. Note the change and approver on the ticket.

## Leaver (target: cut off within 1 hour of HR notice)
| # | Step | Where |
|---|---|---|
| 1 | Deactivate user (kills sessions, triggers SCIM deprovisioning) | Okta |
| 2 | Clear sessions + revoke tokens | Okta / `gam user X deprovision` / `Revoke-MgUserSignInSession` |
| 3 | Suspend / block sign-in | Google Workspace, Entra (if not fully federated) |
| 4 | Remove from groups, reassign owned resources | Google, M365, Slack |
| 5 | Transfer Drive / OneDrive data to manager | GAM data transfer, OneDrive access delegation |
| 6 | Mail: forward or delegate, auto-reply | Google / Exchange |
| 7 | Lock or wipe devices; collect hardware | Jamf / Intune |
| 8 | Apps **without SCIM**: remove manually | Check your non-SCIM app list |
| 9 | Shared credentials they knew: rotate | Password manager, break-glass if needed |
| 10 | Record timestamps of each step | Ticket — this is the audit evidence |

**Involuntary exit**: do steps 1–3 *while* the meeting happens, coordinated with HR.

## Weekly hygiene
- Orphan check: active accounts in apps with no active Okta user.
- Stale accounts: no sign-in for 90 days.
- Devices not checked in for 14+ days.
