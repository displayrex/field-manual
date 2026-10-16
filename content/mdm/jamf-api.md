---
title: "Jamf Pro API"
category: MDM
order: 2
summary: "Token auth, common endpoints and a Python template for the Jamf Pro and Classic APIs."
tags: ["jamf", "api", "python", "automation"]
updated: 2026-10-16
---
## Two APIs
- **Jamf Pro API** (`/api/...`), JSON, modern. Swagger at `https://<you>.jamfcloud.com/api/doc`.
- **Classic API** (`/JSSResource/...`), XML/JSON, older but still needed for some objects (policies, some groups).

## Auth (API client, recommended)
Settings → System → **API roles and clients**. Create a role with only the privileges needed, then a client → client ID + secret.
```bash
JAMF=https://yourorg.jamfcloud.com
TOKEN=$(curl -s -X POST "$JAMF/api/oauth/token" \
  -d grant_type=client_credentials -d client_id="$CID" -d client_secret="$CSECRET" | jq -r .access_token)
H="Authorization: Bearer $TOKEN"
```
Token lifetime is set on the API client (`expires_in` in the response). Refresh it before long jobs.

## Common calls
```bash
# Computer inventory with selected sections
curl -s -H "$H" "$JAMF/api/v1/computers-inventory?section=GENERAL&section=HARDWARE&page-size=100&page=0"

# Find by serial
curl -s -H "$H" -G "$JAMF/api/v1/computers-inventory" \
  --data-urlencode 'filter=hardware.serialNumber=="C02XXXXX"'

# Send MDM commands (lock / erase / restart etc.)
curl -s -X POST -H "$H" -H 'Content-Type: application/json' "$JAMF/api/v2/mdm/commands" \
  -d '{"clientData":[{"managementId":"<mgmt-id>"}],"commandData":{"commandType":"DEVICE_LOCK","pin":"123456"}}'

# FileVault recovery key
curl -s -H "$H" "$JAMF/api/v1/computers-inventory/<id>/filevault"

# Classic: smart group members
curl -s -H "$H" -H 'Accept: application/json' "$JAMF/JSSResource/computergroups/name/FileVault%20not%20enabled"
```

## Python: paginate inventory
```python
import os, requests
J = "https://yourorg.jamfcloud.com"
tok = requests.post(f"{J}/api/oauth/token", data={
    "grant_type":"client_credentials","client_id":os.environ["CID"],"client_secret":os.environ["CSECRET"]}).json()["access_token"]
S = requests.Session(); S.headers["Authorization"] = f"Bearer {tok}"

page = 0
while True:
    r = S.get(f"{J}/api/v1/computers-inventory",
              params={"section":["GENERAL","OPERATING_SYSTEM"],"page":page,"page-size":200}).json()
    for c in r["results"]:
        print(c["general"]["name"], c["operatingSystem"]["version"], c["general"]["lastContactTime"])
    page += 1
    if page * 200 >= r["totalCount"]: break
```

## Tips
- `managementId` (for MDM commands) is in the GENERAL section of inventory.
- Least privilege: a reporting client gets *Read Computers* only.
- Store secrets in a vault or environment variables, never in the script or the Git repo.
