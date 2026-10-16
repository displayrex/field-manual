---
title: "Cloudflare Zero Trust"
category: ZTNA
order: 2
summary: "Access applications, Tunnels, WARP client, device posture and Gateway policies."
tags: ["cloudflare", "ztna", "access", "tunnel", "warp", "gateway"]
updated: 2026-10-16
---
## Pieces
| Piece | What it does |
|---|---|
| **Access** | Identity-aware proxy in front of apps (replaces VPN for web, SSH, RDP) |
| **Tunnel** (`cloudflared`) | Outbound-only connector from your network to Cloudflare. No inbound firewall holes |
| **WARP client** | Device agent: sends traffic to Gateway, provides device identity and posture |
| **Gateway** | DNS / HTTP / network filtering and policies |
| **Device posture** | Checks from WARP or integrations (Intune, CrowdStrike, Jamf via service-to-service) |

Dashboard: one.dash.cloudflare.com.

## Connect Okta as IdP
Settings → Authentication → Login methods → Add → Okta (OIDC). Create the OIDC app in Okta with redirect `https://<team>.cloudflareaccess.com/cdn-cgi/access/callback`. Enable the **groups** claim so policies can use Okta groups.

## Publish an internal app with a Tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create corp-tunnel
cloudflared tunnel route dns corp-tunnel wiki.company.com
# ~/.cloudflared/config.yml
#   tunnel: <TUNNEL-UUID>
#   credentials-file: /root/.cloudflared/<TUNNEL-UUID>.json
#   ingress:
#     - hostname: wiki.company.com
#       service: http://10.0.0.15:8080
#     - service: http_status:404
cloudflared tunnel run corp-tunnel
sudo cloudflared service install   # run as a service
```
Most teams now create **remotely managed tunnels** in the dashboard (Networks → Tunnels) and install with one token command.

## Access application policy
Access → Applications → Add → Self-hosted → hostname `wiki.company.com`.
Policy example: **Allow** — Include: Okta group `dept-engineering`; Require: Device posture `Jamf compliant` + `WARP connected`.
Remember: **Include** = OR, **Require** = AND, **Exclude** = NOT.

## WARP deployment
- Mac: deploy the package + a configuration profile with `organization`, `auto_connect`, `service_mode` through Jamf.
- Windows: MSI via Intune with `ORGANIZATION=<team>`.
- Enable **device enrollment rules** so only Okta users in allowed groups can enroll.

## Troubleshooting
- `warp-cli status` / `warp-cli settings` on the device.
- Access → Logs to see which policy allowed or blocked.
- `cloudflared tunnel info corp-tunnel` to check connectors.
