---
title: "Splunk SPL for identity & endpoint"
category: SIEM
order: 1
summary: "SPL patterns and ready-made searches for Okta, Entra, Google and Jamf logs."
tags: ["splunk", "spl", "siem", "detection", "logs"]
updated: 2026-10-16
---
## SPL shape
`search terms | where/filter | eval new fields | stats/aggregate | sort | table`
Filter as early as possible (index, sourcetype, time) — it's the biggest speed win.

## Core commands
| Command | Example |
|---|---|
| `stats` | `stats count by user, outcome.result` |
| `timechart` | `timechart span=1h count by eventType` |
| `eval` | `eval hour=strftime(_time,"%H")` |
| `where` | `where count > 10` |
| `rex` | `rex field=_raw "user=(?<user>\S+)"` |
| `lookup` | `lookup hr_users.csv email AS user OUTPUT status` |
| `dedup` / `table` / `rename` / `sort -count` | output shaping |
| `iplocation` | `iplocation src_ip` adds City, Country |
| `transaction` | group events into sessions (slow — prefer `stats`) |

## Ready-made searches (Okta add-on field names)
```spl
# Brute force / password spray: one IP, many users failing
index=okta eventType="user.session.start" outcome.result=FAILURE
| stats dc(actor.alternateId) as users count by client.ipAddress
| where users > 10

# MFA fatigue: many push denials for one user
index=okta eventType="user.authentication.auth_via_mfa" outcome.result=FAILURE
| stats count by actor.alternateId | where count >= 5

# Admin privilege granted
index=okta eventType="user.account.privilege.grant"
| table _time actor.alternateId target{}.alternateId debugContext.debugData.privilegeGranted

# Leaver still active? join with HR terminations lookup
index=okta eventType="user.session.start" outcome.result=SUCCESS
| lookup terminated_users.csv email AS actor.alternateId OUTPUT term_date
| where isnotnull(term_date)

# Impossible travel (rough)
index=okta eventType="user.session.start" outcome.result=SUCCESS
| iplocation client.ipAddress
| stats values(Country) as countries dc(Country) as n by actor.alternateId
| where n > 1
```

## Alerts
Save search → **Save As → Alert** → cron schedule (e.g. every 15 min over last 15 min) → trigger when results > 0 → action: email, Slack webhook, or ticket.

## Tips
- `| fieldsummary` shows every field in a sourcetype when you don't know names.
- Use `earliest=-24h latest=now` in the search to override the time picker.
- Build **lookups** for HR roster, break-glass accounts and allowed countries; they make detections precise.
