---
title: "MDM migration to Jamf"
category: MDM
order: 6
summary: "Plan and run a fleet move from another MDM (e.g. Workspace ONE) to Jamf Pro with minimal disruption."
tags: ["jamf", "migration", "mdm", "workspace one", "abm"]
updated: 2026-10-16
---
## Why it's tricky
A Mac can have only one MDM profile. Removing the old one drops its profiles (Wi-Fi, certs, FileVault escrow, PPPC) before the new ones arrive. Plan for that gap.

## Phases
**1. Inventory & parity**
- Export every profile, app, script and compliance rule from the old MDM.
- Rebuild in Jamf: configuration profiles, policies, Smart Groups, PreStage.
- Check items with dependencies: Wi-Fi cert payloads (SCEP/ACME), FileVault (needs key re-escrow), PPPC/system extensions (EDR, Zoom), Kernel/System extension allow lists.

**2. ABM**
- Add Jamf as an MDM server in ABM, upload its token.
- Reassign devices (by serial or order) from the old MDM to Jamf in ABM. This does not move enrolled devices; it controls the next enrollment.

**3. Pilot (IT + 5–10 users)**
Choose the method:
| Method | How | User impact |
|---|---|---|
| **macOS 26+ ABM-based migration** | In ABM, reassign to new MDM and set a migration deadline; macOS prompts and migrates without wipe | Lowest |
| **Migration tool** (e.g. a script/app that removes old MDM then runs `profiles renew -type enrollment`) | Policy from old MDM triggers it | A few clicks, needs admin rights handling |
| **Wipe and re-enroll** | Erase, ADE enrolls into Jamf | Highest, cleanest |

Confirm the ABM-based deadline option exists for your macOS versions before relying on it.

**4. Waves**
Department by department. Communicate dates, what the user will see, and expected 15–30 min.

**5. Verify each device**
- `sudo profiles status -type enrollment` shows Jamf; Jamf inventory present
- FileVault key escrowed (Smart Group: *Individual Key Validation = Valid*)
- EDR running, Wi-Fi connected, Okta Device Trust shows managed

**6. Decommission**
Retire the old MDM only after every serial is checked in to Jamf. Keep its reports for audit.

## Rollback plan
Keep the old MDM tenant live during waves. If a wave fails, pause the reassignment in ABM and re-enroll affected Macs into the old MDM.
