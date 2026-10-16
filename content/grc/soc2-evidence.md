---
title: "SOC 2 / ISO 27001 evidence map"
category: GRC
order: 2
summary: "Which technical setting satisfies which control, and the exact report to pull as proof."
tags: ["soc 2", "iso 27001", "audit", "compliance", "evidence"]
updated: 2026-10-16
---
## Control → setting → evidence
| Control area | SOC 2 (TSC) | ISO 27001:2022 Annex A | Setting | Evidence to pull |
|---|---|---|---|---|
| MFA everywhere | CC6.1 | 5.17, 8.5 | Okta authentication policy requiring MFA | Policy screenshot + Okta MFA enrollment report |
| Provisioning approval | CC6.2 | 5.16, 5.18 | Access requested via ticket, assigned by group | Sample of tickets matched to Okta assignment events |
| Timely deprovisioning | CC6.2, CC6.3 | 5.18 | Okta deactivate + SCIM | HR termination list vs `user.lifecycle.deactivate` timestamps |
| Access reviews | CC6.2, CC6.3 | 5.18 | Quarterly manager review | Signed review export + removal tickets |
| Least privilege admins | CC6.3 | 8.2 | Separate admin accounts, PIM / JIT | Admin role report, PIM activation log |
| Device encryption | CC6.7, CC6.8 | 8.1 | FileVault / BitLocker profiles | Jamf/Intune encryption compliance report |
| Endpoint protection | CC6.8 | 8.7 | EDR deployed via MDM | EDR console coverage vs device inventory |
| Patch management | CC7.1 | 8.8 | OS update enforcement with deadlines | OS version distribution report |
| Logging & monitoring | CC7.2 | 8.15, 8.16 | Logs to Splunk, alerts | Alert definitions + sample triaged alert |
| Change management | CC8.1 | 8.32 | Changes via ticket / PR | PR history with approvals, change tickets |
| Asset inventory | CC6.1 | 5.9 | MDM inventory | Jamf/Intune export with owner |

## How auditors test (Type II)
They sample across the whole period (e.g. 25 leavers out of 12 months) and check each one. One late deprovision is an exception. So automate and keep timestamps.

## Evidence habits
- Save reports with date in the filename: `2026-10-01_okta-mfa-enrollment.csv`.
- Screenshot settings **with the URL and date visible**.
- Keep a folder per control, per quarter.
- Automate the recurring pulls with scripts (Okta API, Jamf API, GAM) on a schedule.
