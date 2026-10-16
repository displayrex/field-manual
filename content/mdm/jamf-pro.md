---
title: "Jamf Pro: core building blocks"
category: MDM
order: 1
summary: "Smart groups, policies, configuration profiles, extension attributes, PreStage and patching in Jamf Pro."
tags: ["jamf", "macos", "mdm", "smart groups", "policies", "profiles"]
updated: 2026-10-16
---
## The mental model
**Inventory** (what the Mac reports) → **Smart Groups** (who matches a rule) → **Scope** → **Policies** (run things) and **Configuration Profiles** (enforce settings).

| Object | Delivered by | Use for |
|---|---|---|
| Configuration Profile | MDM / APNs, instant | Settings Apple exposes: FileVault, firewall, Wi-Fi, PPPC, restrictions, SSO extension, OS update rules |
| Policy | Jamf agent check-in (default every 15 min) | Installing packages, running scripts, inventory updates, Self Service items |
| Extension Attribute | Inventory update | Custom data: script that prints `<result>value</result>` |
| Smart Group | Re-evaluated at each inventory | Dynamic targeting and compliance views |
| Static Group | Manual | Pilots, exceptions |

## Policy triggers
`Recurring Check-in`, `Enrollment Complete`, `Login`, `Startup`, `Network State Change`, `Custom` (run with `sudo jamf policy -event <name>`), and **Self Service**.
Execution frequency: Once per computer, Once per user per computer, Ongoing, Once every day/week/month.

## Useful Smart Groups (criteria)
| Group | Criteria |
|---|---|
| FileVault not enabled | *FileVault 2 Status* is not *All Partitions Encrypted* |
| OS out of date | *Operating System Version* less than `15.6` (update each release) |
| Stale devices | *Last Check-in* more than x days ago `14` |
| Missing EDR | *Application Title* does not have `Falcon.app` (or your EA) |
| No recovery key escrowed | *FileVault 2 Individual Key Validation* is not *Valid* |

## Extension attribute template
```bash
#!/bin/zsh
# Reports whether the macOS firewall is on
state=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null)
if [[ $state == *"enabled"* ]]; then echo "<result>On</result>"; else echo "<result>Off</result>"; fi
```

## Agent commands on a Mac
```bash
sudo jamf policy                 # run check-in policies now
sudo jamf policy -event install-office
sudo jamf recon                  # send inventory now
sudo jamf manage                 # re-apply management framework
sudo profiles show -type configuration   # list installed profiles
sudo profiles status -type enrollment    # MDM + ADE enrollment state
sudo log show --last 1h --predicate 'subsystem == "com.apple.ManagedClient"'
tail -f /var/log/jamf.log
```

## PreStage Enrollment (zero-touch)
Computers → PreStage Enrollments. Set: require authentication (Okta via Jamf Connect or enrollment customization), make MDM profile non-removable, skip Setup Assistant panes, account settings (local admin managed, user as standard), and the profiles to install during enrollment. Scope by serial numbers assigned from ABM.

## Patching
- **App Installers** (Jamf's curated catalog) for common apps: auto-updates with deadlines.
- **Patch Management** titles for reporting and policies for other software.
- macOS updates: use **Declarative Device Management** software update enforcement (Blueprints / DDM) with a deadline, not old-style "softwareupdate" scripts.

## Gotchas
- Profiles are instant; policies wait for check-in. If a user is waiting, use a profile or ask them to run Self Service.
- **PPPC (Privacy Preferences) profiles** must be installed before the app that needs them, or the user gets prompts.
- Removing a Mac from a profile's scope removes the profile. Watch out with exclusions on FileVault and restrictions.
