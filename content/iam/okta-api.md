---
title: "Okta API & automation"
category: IAM
order: 3
summary: "Calling the Okta Management API with curl and Python: auth, filters, pagination, rate limits."
tags: ["okta", "api", "python", "curl", "automation"]
updated: 2026-10-16
---
## Auth
- **API token** (quick): Security → API → Tokens. Header: `Authorization: SSWS <token>`.
- **OAuth 2.0 service app** (preferred for production): scoped (`okta.users.read`, etc.), uses a private-key JWT, no admin-bound token.

## curl essentials
```bash
OKTA=https://yourorg.okta.com
H="Authorization: SSWS $OKTA_TOKEN"

# Find a user
curl -s -H "$H" "$OKTA/api/v1/users/jane@company.com" | jq '{id,status,profile:.profile.login}'

# Search users (SCIM-style filter)
curl -s -H "$H" -G "$OKTA/api/v1/users" \
  --data-urlencode 'search=profile.department eq "Finance" and status eq "ACTIVE"'

# Deactivate (leaver)
curl -s -X POST -H "$H" "$OKTA/api/v1/users/$UID/lifecycle/deactivate"

# Clear sessions
curl -s -X DELETE -H "$H" "$OKTA/api/v1/users/$UID/sessions?oauthTokens=true"

# Group members
curl -s -H "$H" "$OKTA/api/v1/groups/$GID/users?limit=200"

# System Log since a time
curl -s -H "$H" -G "$OKTA/api/v1/logs" \
  --data-urlencode 'since=2026-10-01T00:00:00Z' \
  --data-urlencode 'filter=eventType eq "user.lifecycle.deactivate"'
```

## Pagination
Okta pages with the `Link` header (`rel="next"`). Always follow it — never assume one page.

```python
import os, requests
S = requests.Session()
S.headers["Authorization"] = f"SSWS {os.environ['OKTA_TOKEN']}"
BASE = "https://yourorg.okta.com"

def paged(url, params=None):
    while url:
        r = S.get(url, params=params); r.raise_for_status()
        yield from r.json()
        url = r.links.get("next", {}).get("url"); params = None

# Users who haven't signed in for 90 days
import datetime as dt
cut = dt.datetime.utcnow() - dt.timedelta(days=90)
for u in paged(f"{BASE}/api/v1/users", {"filter": 'status eq "ACTIVE"', "limit": 200}):
    last = u.get("lastLogin")
    if not last or dt.datetime.fromisoformat(last.rstrip("Z")) < cut:
        print(u["profile"]["login"], last)
```

## Rate limits
Read `X-Rate-Limit-Remaining` and `X-Rate-Limit-Reset` (epoch seconds). On HTTP 429, sleep until reset. Limits are per endpoint per minute.

## Terraform (config as code)
The `okta/okta` provider manages groups, group rules, apps and policies. Good for reviewable changes: PR → plan → apply.
