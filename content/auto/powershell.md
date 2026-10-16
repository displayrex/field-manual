---
title: "PowerShell essentials"
category: AUTO
order: 2
summary: "Syntax, pipelines, objects, error handling, CSV and REST patterns for Windows and Microsoft 365 admin."
tags: ["powershell", "windows", "scripting", "rest"]
updated: 2026-10-16
---
## Find your way
```powershell
Get-Command *user*            # find cmdlets
Get-Help Get-LocalUser -Examples
Get-Process | Get-Member      # what properties does this object have?
$PSVersionTable.PSVersion     # 5.1 (Windows PowerShell) vs 7.x (pwsh)
```

## Pipeline patterns
```powershell
Get-Service | Where-Object Status -eq 'Stopped' | Select-Object Name, StartType
Get-ChildItem C:\Logs -Recurse -Filter *.log | Where-Object LastWriteTime -lt (Get-Date).AddDays(-30) | Remove-Item -WhatIf
Import-Csv users.csv | ForEach-Object { "$($_.Email) -> $($_.Department)" }
Get-LocalUser | Export-Csv local-users.csv -NoTypeInformation
```
`-WhatIf` previews destructive actions. Use it every time first.

## Script skeleton
```powershell
[CmdletBinding(SupportsShouldProcess)]
param(
  [Parameter(Mandatory)][string]$CsvPath,
  [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
Start-Transcript -Path "$env:TEMP\$(Get-Date -f yyyyMMdd-HHmm)-run.log"
try {
  foreach ($row in Import-Csv $CsvPath) {
    if ($PSCmdlet.ShouldProcess($row.Email, 'Disable')) {
      # action here
    }
  }
} catch {
  Write-Error "Failed: $($_.Exception.Message)"; exit 1
} finally { Stop-Transcript }
```

## REST calls
```powershell
$h = @{ Authorization = "SSWS $env:OKTA_TOKEN"; Accept = 'application/json' }
$users = Invoke-RestMethod -Uri "https://yourorg.okta.com/api/v1/users?limit=200" -Headers $h
$users | Select-Object @{n='login';e={$_.profile.login}}, status

# Follow pagination (PS 7+)
$url = "https://yourorg.okta.com/api/v1/users?limit=200"; $all = @()
while ($url) {
  $r = Invoke-WebRequest -Uri $url -Headers $h
  $all += ($r.Content | ConvertFrom-Json)
  $url = ($r.RelationLink.next)
}
```

## Handy one-liners
```powershell
Test-NetConnection login.company.com -Port 443
Get-WinEvent -LogName Security -MaxEvents 50 | Where-Object Id -eq 4625   # failed logons
Get-BitLockerVolume | Select MountPoint, ProtectionStatus, EncryptionPercentage
manage-bde -protectors -get C:     # BitLocker recovery key ID
gpresult /r                        # applied GPOs
```
