---
title: "Microsoft Graph PowerShell"
category: IAM
order: 5
summary: "Quick commands for users, groups, devices and sign-ins with the Microsoft.Graph module."
tags: ["powershell", "graph", "entra", "intune"]
updated: 2026-10-16
---
## Setup
```powershell
Install-Module Microsoft.Graph -Scope CurrentUser
Connect-MgGraph -Scopes "User.ReadWrite.All","Group.ReadWrite.All","AuditLog.Read.All","DeviceManagementManagedDevices.ReadWrite.All"
Get-MgContext   # who am I, which scopes
```
For unattended scripts: app registration + certificate → `Connect-MgGraph -ClientId $id -TenantId $tid -CertificateThumbprint $thumb`.

## Users
```powershell
Get-MgUser -UserId jane@company.com -Property DisplayName,AccountEnabled,SignInActivity |
  Select DisplayName,AccountEnabled,@{n='LastSignIn';e={$_.SignInActivity.LastSignInDateTime}}

# Disable + revoke sessions (leaver)
Update-MgUser -UserId jane@company.com -AccountEnabled:$false
Revoke-MgUserSignInSession -UserId jane@company.com

# All enabled users, exported
Get-MgUser -All -Filter "accountEnabled eq true" -Property DisplayName,UserPrincipalName,Department |
  Export-Csv users.csv -NoTypeInformation
```

## Groups
```powershell
$g = Get-MgGroup -Filter "displayName eq 'app-salesforce-users'"
Get-MgGroupMember -GroupId $g.Id -All | ForEach-Object { $_.AdditionalProperties.userPrincipalName }
New-MgGroupMember -GroupId $g.Id -DirectoryObjectId (Get-MgUser -UserId jane@company.com).Id
```

## Intune devices
```powershell
Get-MgDeviceManagementManagedDevice -All |
  Where-Object ComplianceState -ne 'compliant' |
  Select DeviceName,UserPrincipalName,OperatingSystem,ComplianceState,LastSyncDateTime

# Remote actions
Sync-MgDeviceManagementManagedDevice -ManagedDeviceId $id
Invoke-MgRetireDeviceManagementManagedDevice -ManagedDeviceId $id   # remove company data
Clear-MgDeviceManagementManagedDevice -ManagedDeviceId $id          # full wipe
```

## Sign-in logs
```powershell
Get-MgAuditLogSignIn -Filter "userPrincipalName eq 'jane@company.com'" -Top 20 |
  Select CreatedDateTime,AppDisplayName,IpAddress,@{n='Error';e={$_.Status.ErrorCode}}
```

## Tips
- `-All` pages automatically. Without it you get the first page only.
- Use `Find-MgGraphCommand -Uri '/users/{id}'` to find the cmdlet for any Graph URL.
- `Invoke-MgGraphRequest -Method GET -Uri 'v1.0/me'` for anything without a cmdlet.
