---
title: "Zero Trust model & policy rollout"
category: ZTNA
order: 1
summary: "NIST 800-207 in practice, the signals you use, and a safe rollout checklist for any access policy."
tags: ["zero trust", "nist 800-207", "policy", "rollout", "break-glass"]
updated: 2026-10-16
---
## NIST SP 800-207 mapped to your stack
| Component | Job | Your tools |
|---|---|---|
| Policy Engine / Administrator | Decides allow / deny / step-up | Okta authentication policies, Entra Conditional Access, Cloudflare Access policies |
| Policy Enforcement Point | Enforces the decision at the resource | Okta sign-in, SAML/OIDC in each app, Cloudflare Access proxy, WARP |
| Signals | Feed the decision | Identity + group, MFA strength, device managed/compliant (Jamf, Intune, EDR), location, risk, time |
| Logging | Prove it and detect misuse | Okta System Log, Entra sign-ins, Cloudflare logs → Splunk |

Principles: never trust the network; verify every request; least privilege; assume breach; continuously re-evaluate.

## Policy change checklist
1. **Write the intent in one sentence.** "Only managed, compliant devices with phishing-resistant MFA reach finance apps."
2. **List who's affected** and who's excluded (break-glass, service accounts). Get the list from logs, not guesses.
3. **Report-only / audit mode first** where the platform supports it (Entra report-only, Okta preview via policy simulation, Cloudflare in log mode).
4. **Pilot group** (IT + volunteers) for a few days.
5. **Communicate**: what changes, when, what users must do, where to get help.
6. **Staged rollout** by department, with a named rollback step.
7. **Monitor** denies in logs for a week. Fix false positives.
8. **Document** the change: ticket, before/after config, approver. That's your audit evidence.

## Break-glass accounts
- At least two, cloud-only, not tied to a person, excluded from all conditional policies.
- Long random passwords + hardware keys, stored in a safe or split custody.
- Alert on every use. Test them quarterly.

## Phishing-resistant MFA ladder
SMS/voice → TOTP → push → **number-matching push** → **Okta FastPass / Windows Hello / passkeys / FIDO2 keys** (phishing-resistant). Push admins to the top first.
