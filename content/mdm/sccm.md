---
title: "SCCM / Configuration Manager"
category: MDM
order: 5
summary: "Collections, application and software update deployment, and client troubleshooting in ConfigMgr."
tags: ["sccm", "configmgr", "mecm", "windows", "patching"]
updated: 2026-10-16
---
## Core objects
| Object | What it is |
|---|---|
| **Collection** | Group of devices/users. Query-based (dynamic), direct (static), include/exclude rules |
| **Application** | Modern deployment type with detection method, requirements, supersedence |
| **Package/Program** | Legacy script-style deployment |
| **Software Update Group** | Bundle of patches deployed to a collection |
| **Task Sequence** | OS deployment or multi-step installs |
| **Boundary / Boundary Group** | IP/AD-site ranges that decide which DP a client uses |
| **Maintenance Window** | When required deployments/reboots may run |

## Query-based collection (WQL)
```sql
select SMS_R_SYSTEM.ResourceID, SMS_R_SYSTEM.Name from SMS_R_System
inner join SMS_G_System_OPERATING_SYSTEM on SMS_G_System_OPERATING_SYSTEM.ResourceId = SMS_R_System.ResourceId
where SMS_G_System_OPERATING_SYSTEM.Caption like "%Windows 11%"
```

## Deploy an app
1. Software Library → Applications → Create Application (MSI auto-fills detection; for EXE add a detection rule).
2. **Distribute Content** to distribution points.
3. Deploy → collection → *Available* (Software Center) or *Required* (with deadline).
4. Monitor → Deployments → status per device.

## Patching cycle (Patch Tuesday)
1. Software Updates → All Software Updates → sync (or ADR runs automatically).
2. **Automatic Deployment Rule**: e.g. Product = Windows 11, Classification = Security/Critical, Released = last 1 month → new SUG each month.
3. Deploy to **Pilot** collection day 0–2 → **Broad** with a 7-day deadline.
4. Report: Monitoring → Reports → *Software Updates - A Compliance*.

## Client troubleshooting
- Control Panel → **Configuration Manager** → Actions → *Machine Policy Retrieval & Evaluation Cycle*.
- Logs: `C:\Windows\CCM\Logs` — read with **CMTrace**.
| Log | For |
|---|---|
| `AppEnforce.log` | App install command and exit code |
| `AppDiscovery.log` | Detection method results |
| `WUAHandler.log` / `UpdatesDeployment.log` | Patching |
| `PolicyAgent.log` | Policy download |
| `LocationServices.log` | Boundary / DP / management point |
| `ccmsetup.log` | Client install |
```powershell
Invoke-WmiMethod -Namespace root\ccm -Class SMS_Client -Name TriggerSchedule "{00000000-0000-0000-0000-000000000021}"  # machine policy
```

## Co-management with Intune
Enable co-management, then slide workloads (compliance, Windows Update, apps…) to Intune one at a time with a pilot collection.
