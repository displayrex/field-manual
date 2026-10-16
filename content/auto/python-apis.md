---
title: "Python for admin APIs"
category: AUTO
order: 4
summary: "A reusable pattern for SaaS admin APIs: sessions, retries, pagination, CSV output and safe dry runs."
tags: ["python", "requests", "api", "automation", "csv"]
updated: 2026-10-16
---
## Environment
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install requests python-dotenv
pip freeze > requirements.txt
```

## Reusable client
```python
import os, time, csv, logging, requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

def session(auth_header: str) -> requests.Session:
    s = requests.Session()
    s.headers.update({"Authorization": auth_header, "Accept": "application/json"})
    retry = Retry(total=5, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504],
                  respect_retry_after_header=True, allowed_methods=None)
    s.mount("https://", HTTPAdapter(max_retries=retry))
    return s

def paged_link(s, url, params=None):
    # Okta/GitHub style: next page in the Link header
    while url:
        r = s.get(url, params=params, timeout=30); r.raise_for_status()
        yield from r.json()
        url, params = r.links.get("next", {}).get("url"), None

def write_csv(path, rows, fields):
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader(); w.writerows(rows)
```

## Dry-run pattern for anything that changes data
```python
import argparse
p = argparse.ArgumentParser()
p.add_argument("--apply", action="store_true", help="actually make changes")
args = p.parse_args()

for user in targets:
    if args.apply:
        s.post(f"{BASE}/api/v1/users/{user['id']}/lifecycle/deactivate").raise_for_status()
        logging.info("deactivated %s", user["profile"]["login"])
    else:
        logging.info("[dry-run] would deactivate %s", user["profile"]["login"])
```
Default to dry run. Make `--apply` the deliberate step.

## Pagination styles you'll meet
| API | Style |
|---|---|
| Okta, GitHub | `Link` header, `rel="next"` |
| Microsoft Graph | `@odata.nextLink` in the body |
| Jamf Pro API | `page` + `page-size`, stop at `totalCount` |
| Google APIs | `nextPageToken` in body → `pageToken` param |
| Slack | `response_metadata.next_cursor` |

## Tips
- Put secrets in `.env` (git-ignored) or a vault; ship `.env.example`.
- Log every change with who/what/when — it doubles as audit evidence.
- `jq` on the command line for quick JSON: `cat out.json | jq '.[] | select(.status=="ACTIVE") | .profile.login'`.
