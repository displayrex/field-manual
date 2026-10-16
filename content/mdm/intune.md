---
title: "Microsoft Intune"
category: MDM
order: 4
summary: "Compliance policies, configuration profiles, app deployment, Autopilot and remediation in Intune."
tags: ["intune", "windows", "autopilot", "compliance", "mdm"]
updated: 2026-10-16
---
## Where things live (intune.microsoft.com)
| Need | Path |
|---|---|
| Compliance policies | Devices → Compliance |
| Configuration (settings catalog) | Devices → Configuration |
| Windows Update rings / feature updates | Devices → Windows updates |
| Apps | Apps → All apps |
| Autopilot | Devices → Enrollment → Windows Autopilot |
| Scripts & Remediations | Devices → Scripts and remediations |
| Encryption (BitLocker) | Endpoint security → Disk encryption |

## Compliance baseline (Windows)
- BitLocker required, Secure Boot required, TPM required
- Minimum OS version, firewall on, Defender antivirus on and up to date
- Password / Windows Hello required
- Mark non-compliant after a short grace period (e.g. 1 day), then Conditional Access blocks sensitive apps.

## Autopilot (zero-touch Windows)
1. Hardware hash uploaded by OEM/reseller, or captured with `Get-WindowsAutopilotInfo -Online`.
2. Device assigned to a group (dynamic group on `ZTDID` or group tag).
3. Deployment profile (User-driven, Entra joined) + Enrollment Status Page blocking until required apps install.
4. User signs in out of the box → enrolls → policies and apps apply.

## Apps
- **Win32 (.intunewin)**: wrap with `IntuneWinAppUtil.exe -c src -s setup.exe -o out`. Needs install/uninstall commands and a **detection rule** (file, registry, or script).
- **Microsoft Store (new)** and **Microsoft 365 Apps** are built-in app types.
- Assign as **Required** to device groups for baseline apps, **Available** to user groups for self-service (Company Portal).

## Remediations (detect + fix scripts)
Detection script exits `1` when there's a problem → remediation script runs. Exit `0` = fine.
```powershell
# Detect: is the local admin "support" account present?
if (Get-LocalUser -Name support -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }
```

## Troubleshooting on a device
- Settings → Accounts → Access work or school → Info → **Sync**.
- Logs: `C:\ProgramData\Microsoft\IntuneManagementExtension\Logs\IntuneManagementExtension.log`
- MDM diagnostic report: `mdmdiagnosticstool.exe -out C:\temp\mdm`
- `dsregcmd /status` shows Entra join state and PRT.
