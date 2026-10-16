---
title: "Slack & Zoom SSO/SCIM"
category: IAM
order: 7
summary: "Specifics for connecting Slack and Zoom to Okta or Entra: plan requirements, settings and gotchas."
tags: ["slack", "zoom", "sso", "scim", "okta", "saml"]
updated: 2026-10-16
---
## Slack
**Plan**: SAML SSO needs Business+ or Enterprise Grid. SCIM is available on Business+ and Grid.

1. Okta → Browse App Catalog → **Slack** (OIN). Set your workspace subdomain (`company.slack.com`) or Grid org.
2. Slack: **Workspace settings → Authentication → Configure SAML** (Grid: Org dashboard → Security → SSO). Paste Okta's SAML 2.0 Endpoint, Identity Provider Issuer and X.509 cert from the app's *Sign On → View setup instructions*.
3. Test with a pilot user, then set SSO to **Required for all members** (except an owner break-glass, Grid allows exceptions).
4. **SCIM**: Okta app → Provisioning → *Enable API integration* → authenticate with a Slack **Primary Owner** account. Enable create/update/deactivate and **Push Groups** for user groups/channels.

Gotchas
- Deactivating in Okta deactivates the Slack account (SCIM). Guests (single/multi-channel) need the correct user type attribute.
- Changing someone's email in Okta updates Slack only if *Update User Attributes* is on.
- Session duration: set in Slack (*Session duration*) to force re-auth, e.g. 7 days.

## Zoom
**Plan**: SSO needs a paid account with a **vanity URL** (`company.zoom.us`) approved first.

1. Okta → OIN **Zoom** app → enter vanity subdomain.
2. Zoom admin → **Advanced → Single Sign-On**: Sign-in page URL, IdP certificate, Issuer (Entity ID), Binding = HTTP-Redirect; Service Provider Entity ID = `company.zoom.us`.
3. **SAML Response Mapping** in Zoom: map an attribute (e.g. `department` or a group) → License type / role / user group. This auto-licenses users on sign-in.
4. Associated domains: verify your email domain so all users must use SSO.
5. **SCIM**: Zoom Marketplace → build a *Server-to-Server OAuth* or use the Okta Zoom integration's OAuth → enable provisioning.

Gotchas
- Users with existing Zoom accounts on your domain get a prompt to merge/consolidate. Communicate before turning on.
- License counts: auto-assigning Licensed to all can exceed your seats. Map from a group.

## Test script for any SSO app
- [ ] SP-initiated login · [ ] IdP-initiated from Okta dashboard · [ ] new user auto-created (JIT/SCIM)
- [ ] attribute change syncs · [ ] unassign → account deactivated · [ ] admin break-glass still works
