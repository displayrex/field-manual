---
title: "Networking: VLAN, VPN, DNS, DHCP, firewall"
category: ZTNA
order: 3
summary: "Quick reference for network troubleshooting and coordinating changes with network teams."
tags: ["vlan", "vpn", "dns", "dhcp", "firewall", "networking", "troubleshooting"]
updated: 2026-10-16
---
## Troubleshoot bottom-up
1. **Link**: cable/Wi-Fi associated? `ifconfig` / `ipconfig /all`
2. **IP**: got a DHCP lease? `169.254.x.x` = no DHCP response
3. **Gateway**: `ping <default gateway>`
4. **DNS**: `nslookup app.company.com` / `dig app.company.com +short`
5. **Path**: `traceroute` / `tracert`
6. **Port**: `nc -vz host 443` (Mac) / `Test-NetConnection host -Port 443` (Windows)
7. **App**: `curl -v https://host`

## DNS
| Record | Use |
|---|---|
| A / AAAA | Name → IPv4 / IPv6 |
| CNAME | Alias to another name |
| MX | Mail servers |
| TXT | SPF, DKIM, DMARC, domain verification (Google, Okta, Zoom) |
| SRV | Service location (AD `_ldap._tcp`) |
```bash
dig company.com TXT +short
dig @1.1.1.1 app.company.com          # ask a specific resolver
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder   # macOS flush
ipconfig /flushdns                      # Windows flush
```
Email auth: SPF `v=spf1 include:_spf.google.com ~all`, DKIM from Workspace admin, DMARC `v=DMARC1; p=quarantine; rua=mailto:dmarc@company.com`.

## DHCP
DORA: Discover → Offer → Request → Acknowledge. Know: scope, lease time, reservations (printers, servers), options (003 router, 006 DNS). `ipconfig /release` + `/renew`; Mac: `sudo ipconfig set en0 DHCP`.

## VLANs
- Segment by trust: **Corp**, **Guest** (internet only), **IoT/Printers**, **Servers**, **Management**.
- Access port = one untagged VLAN; trunk = multiple tagged (802.1Q).
- Inter-VLAN traffic goes through a router/firewall; that's where you enforce rules.
- 802.1X with certificates (deployed by Jamf/Intune) can place devices on the right VLAN automatically.

## VPN
- **Full tunnel** = all traffic through VPN; **split tunnel** = only corporate subnets.
- Common issues: overlapping subnets (home router uses same 10.x/192.168.x range), MTU, DNS not using VPN resolvers, expired client cert.
- Zero Trust direction: replace network VPN with per-app access (Cloudflare Access) where you can.

## Firewall change request template
```text
Source:        VLAN 20 Corp (10.20.0.0/16)
Destination:   10.50.0.15 (wiki server)
Port/Proto:    TCP 443
Direction:     inbound to servers
Justification: Internal wiki access for staff, ticket CHG0012345
Duration:      permanent / until <date>
Owner:         Rex Hector
Rollback:      remove rule ID <n>
```
Ask for **least privilege**: specific source, destination and port, never `any/any`.
