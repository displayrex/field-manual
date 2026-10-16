---
title: "Bash/zsh for Mac admin"
category: AUTO
order: 3
summary: "Shell patterns for Jamf scripts: running as the logged-in user, defaults, launchd, profiles and logging."
tags: ["bash", "zsh", "macos", "jamf scripts", "launchd"]
updated: 2026-10-16
---
## Jamf script parameters
Jamf passes `$1` mount point, `$2` computer name, `$3` username, and **`$4`–`$11`** are your custom parameters (label them in the script's Options tab).
```zsh
#!/bin/zsh
appName="${4:-Google Chrome}"
```

## Get the logged-in user (reliable)
```zsh
currentUser=$(echo "show State:/Users/ConsoleUser" | scutil | awk '/Name :/ && ! /loginwindow/ { print $3 }')
uid=$(id -u "$currentUser")
# Run something as that user (scripts run as root)
launchctl asuser "$uid" sudo -u "$currentUser" open -a "Self Service"
```

## defaults & plists
```zsh
defaults read /Library/Preferences/com.apple.loginwindow
sudo defaults write /Library/Preferences/com.apple.loginwindow LoginwindowText "Property of Company"
/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "/Applications/Slack.app/Contents/Info.plist"
```
For settings that must stick, prefer a **configuration profile** over `defaults write`.

## System checks
```zsh
sw_vers -productVersion                 # macOS version
fdesetup status                         # FileVault
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
csrutil status                          # SIP
system_profiler SPHardwareDataType | awk '/Serial/ {print $4}'
softwareupdate --list
pkgutil --pkgs | grep -i falcon         # installed package receipts
sudo profiles show -type configuration
```

## launchd (run on schedule / at boot)
```xml
<!-- /Library/LaunchDaemons/com.company.cleanup.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.company.cleanup</string>
  <key>ProgramArguments</key><array><string>/usr/local/bin/cleanup.sh</string></array>
  <key>StartInterval</key><integer>86400</integer>
  <key>RunAtLoad</key><true/>
</dict></plist>
```
```zsh
sudo chown root:wheel /Library/LaunchDaemons/com.company.cleanup.plist
sudo chmod 644 /Library/LaunchDaemons/com.company.cleanup.plist
sudo launchctl bootstrap system /Library/LaunchDaemons/com.company.cleanup.plist
sudo launchctl bootout system/com.company.cleanup
```

## Script hygiene
```zsh
set -euo pipefail                        # bash; in zsh use: setopt errexit nounset pipefail
log(){ echo "$(date '+%F %T') [myscript] $*" | tee -a /var/log/company-scripts.log; }
trap 'log "failed at line $LINENO"' ERR
```
- Exit `0` for success so Jamf logs it as completed; non-zero shows as failed.
- Test locally with `sudo zsh -x script.sh` (trace mode).
- User prompts: `osascript -e 'display dialog "Restart now?" buttons {"Later","Restart"}'`, or swiftDialog for nicer UI.
