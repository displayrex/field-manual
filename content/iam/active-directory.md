---
title: "Active Directory & Group Policy"
category: IAM
order: 6
summary: "AD users, groups and OUs from PowerShell, plus building, linking and troubleshooting GPOs."
tags: ["active directory", "ad", "gpo", "group policy", "powershell", "windows"]
updated: 2026-10-16
---
## Tools
- **ADUC** (`dsa.msc`) users and computers · **GPMC** (`gpmc.msc`) Group Policy · **ADAC** (`dsac.exe`) incl. Recycle Bin
- PowerShell: `Import-Module ActiveDirectory` (RSAT), `GroupPolicy` module

## Users & groups
```powershell
Get-ADUser jdoe -Properties LastLogonDate,Enabled,MemberOf,PasswordLastSet
New-ADUser -Name "Jane Doe" -SamAccountName jdoe -UserPrincipalName jdoe@corp.com `
  -Path "OU=Staff,DC=corp,DC=com" -AccountPassword (Read-Host -AsSecureString) -Enabled $true
Disable-ADAccount jdoe
Move-ADObject (Get-ADUser jdoe).DistinguishedName -TargetPath "OU=Disabled,DC=corp,DC=com"
Unlock-ADAccount jdoe
Set-ADAccountPassword jdoe -Reset -NewPassword (Read-Host -AsSecureString); Set-ADUser jdoe -ChangePasswordAtLogon $true
Add-ADGroupMember "VPN-Users" -Members jdoe
Get-ADGroupMember "Domain Admins" -Recursive | Select Name,SamAccountName

# Stale accounts (90 days)
Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly | Where Enabled | Select Name,LastLogonDate
# Who's locked out
Search-ADAccount -LockedOut
```

## Offboarding (AD side)
Disable → reset password → remove groups (keep a record) → move to Disabled OU → set description with date + ticket → force Entra sync if hybrid (`Start-ADSyncSyncCycle -PolicyType Delta`).
```powershell
$u = Get-ADUser jdoe -Properties MemberOf
$u.MemberOf | Out-File "C:\Offboard\jdoe-groups.txt"
$u.MemberOf | ForEach-Object { Remove-ADGroupMember $_ -Members jdoe -Confirm:$false }
Set-ADUser jdoe -Description "Disabled 2026-10-16 INC0012345"
```

## Group Policy
- Processing order: **Local → Site → Domain → OU** (LSDOU). Last applied wins; **Enforced** links beat child **Block Inheritance**.
- Computer settings apply at boot, user settings at sign-in; background refresh ~90 min (± 30).
- Target with **security filtering** (Authenticated Users must keep *Read* on the GPO) or **WMI filters** (e.g. `SELECT * FROM Win32_OperatingSystem WHERE Version LIKE "10.%"`).
- Use **Group Policy Preferences** with item-level targeting for drive maps, printers, registry.

## Troubleshooting on a client
```powershell
gpupdate /force
gpresult /r                      # applied GPOs (summary)
gpresult /h C:\temp\gp.html      # full report
rsop.msc
nltest /dsgetdc:corp.com         # which DC am I using
Test-ComputerSecureChannel -Repair
klist purge                      # clear Kerberos tickets after group changes
```
Event Viewer → Applications and Services Logs → Microsoft → Windows → GroupPolicy → Operational.

## Gotchas
- Group membership changes need a new Kerberos ticket: sign out/in or `klist purge`.
- Never edit **Default Domain Policy** beyond password/lockout/Kerberos. Create new GPOs.
- Back up GPOs before changes: `Backup-GPO -All -Path C:\GPOBackup`.
