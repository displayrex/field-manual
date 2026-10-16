---
title: "Apple Business Manager & ADE"
category: MDM
order: 3
summary: "Device assignment, MDM server tokens, Managed Apple IDs and VPP apps in ABM."
tags: ["apple business manager", "abm", "ade", "dep", "vpp", "apns"]
updated: 2026-10-16
---
## What ABM does
- **Automated Device Enrollment (ADE)**: Macs/iPhones bought from Apple or an authorized reseller show up in ABM by serial. You assign them to an MDM server, and they enroll during Setup Assistant. No touching.
- **Apps and Books**: buy licenses (free apps too) and assign through MDM, no Apple ID needed on the device.
- **Managed Apple Accounts**: federate with Google Workspace or Entra ID so accounts are created on sign-in.

## The three tokens to track (expire yearly)
| Token | Where renewed | If it expires |
|---|---|---|
| **APNs push certificate** | identity.apple.com + Jamf (Settings → Global → Push Certificates) | Jamf can't talk to any device. **Renew with the same Apple ID**, or every device must re-enroll |
| **ADE server token** (.p7m) | ABM → Preferences → your MDM server → Download token | New devices don't get assigned settings |
| **VPP / Apps and Books token** (.vpptoken) | ABM → Preferences → Payments and Billing | App installs and updates stop |

Put all three renewal dates in a shared calendar with a 30-day warning.

## Assign new devices
ABM → Devices → filter by order number or serial → **Edit MDM Server** → choose Jamf. Or set a **default MDM server** per device type so every new device goes straight to Jamf.
Then in Jamf, the device appears under the ADE instance and gets the PreStage that matches its scope.

## Adding a device not bought through Apple
**Apple Configurator for iPhone** can add Macs (and Configurator on a Mac can add iOS devices) to ABM. A 30-day provisional period applies, during which the user can remove it.

## Release a device (sale, return, recycle)
1. Wipe it via MDM.
2. ABM → device → **Release device**. Otherwise **Activation Lock** and ADE will follow it to the new owner.

## Troubleshooting enrollment
- Device skipped Remote Management screen: it was set up before assignment. Erase and reinstall, or run `sudo profiles renew -type enrollment` on a Mac.
- Check what the device sees: `sudo profiles show -type enrollment`.
