---
title: "Entra ID & Conditional Access"
category: IAM
order: 4
summary: "Microsoft Entra ID essentials: users, groups, enterprise apps, and Conditional Access policy design."
tags: ["entra", "azure ad", "conditional access", "microsoft", "mfa"]
updated: 2026-10-16
---
## Where things live (entra.microsoft.com)
| Need | Path |
|---|---|
| Users / groups | Identity → Users / Groups |
| SSO apps | Identity → Applications → Enterprise applications |
| App registrations (API access) | Identity → Applications → App registrations |
| Conditional Access | Protection → Conditional Access → Policies |
| Authentication methods | Protection → Authentication methods → Policies |
| Sign-in logs | Identity → Monitoring & health → Sign-in logs |
| PIM (just-in-time admin) | Identity governance → Privileged Identity Management |
| Access reviews | Identity governance → Access reviews |

## How Conditional Access works
**Assignments** (who + what + conditions) → **Access controls** (grant or block, session).
All matching policies apply together; **block wins**, and every grant requirement must be met.

## Baseline policy set
1. **Require MFA for all users** — exclude break-glass accounts.
2. **Block legacy authentication** — Conditions → Client apps → Exchange ActiveSync + Other clients → Block.
3. **Require phishing-resistant MFA for admins** — Directory roles → Grant: Require authentication strength.
4. **Require compliant device** for sensitive apps — Grant: Require device to be marked as compliant (from Intune).
5. **Block high sign-in risk** (Entra ID P2) — Conditions → Sign-in risk: High.
6. **Block countries you don't operate in** — named locations.

## Rollout rules
- Create every new policy in **Report-only** mode first. Review in Sign-in logs → the *Conditional Access* / *Report-only* tab for a week.
- Use the **What If** tool (Policies → What If) to test a user + app + device combination.
- Exclude **two break-glass cloud-only accounts** from every policy. Alert on any sign-in by them.

## Troubleshooting a blocked sign-in
Sign-in logs → filter by user → open the failure → **Conditional Access** tab shows which policy applied and what it required. The error code (e.g. `53003` = blocked by CA, `50076` = MFA required) tells you the rest.

## Hybrid notes
- **Entra Connect / Cloud Sync** syncs on-prem AD. Force a delta sync: `Start-ADSyncSyncCycle -PolicyType Delta`.
- Okta as IdP for M365: federate the domain with Okta. Then Okta policy controls sign-in, and Entra CA can still apply after.
