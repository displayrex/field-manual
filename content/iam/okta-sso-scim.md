---
title: "SSO & SCIM: onboarding an app"
category: IAM
order: 2
summary: "Wiring a SaaS app to Okta with SAML or OIDC, then turning on SCIM provisioning."
tags: ["okta", "saml", "oidc", "scim", "sso", "provisioning"]
updated: 2026-10-16
---
## Pick the protocol
| Protocol | When | You exchange |
|---|---|---|
| **SAML 2.0** | Most enterprise SaaS | ACS URL, Entity ID/Audience, IdP metadata (SSO URL, issuer, X.509 cert) |
| **OIDC** | Modern / custom apps, mobile | Client ID, client secret, redirect URI, issuer `https://<org>.okta.com` |
| **SWA** | No federation support | Okta stores the password. Last resort |

Check the **Okta Integration Network (OIN)** first: Applications → Browse App Catalog. OIN apps have prebuilt SAML and often SCIM.

## SAML setup, step by step
1. In the vendor's admin: find SSO settings and note the **ACS URL** and **Entity ID**.
2. Okta: Applications → Create App Integration → SAML 2.0 (or the OIN app).
3. Paste ACS URL as *Single sign-on URL*, Entity ID as *Audience URI*.
4. **Name ID format**: EmailAddress; Application username: Email (unless the vendor wants something else).
5. Add attribute statements the vendor needs (`firstName`, `lastName`, `email`, groups).
6. Copy Okta's **Metadata URL** (or SSO URL + certificate) into the vendor.
7. Assign a **pilot group**, test with a non-admin account in a private window.
8. Test both flows: **SP-initiated** (start at the app) and **IdP-initiated** (start at the Okta dashboard).
9. Only then enforce SSO in the vendor and remove local passwords. Keep one local break-glass admin in the vendor if it allows it.

## Debugging SAML
- Use the **SAML-tracer** browser extension to read the assertion.
- Check: Audience matches Entity ID exactly, ACS URL matches (trailing slash matters), clock skew, certificate not expired, NameID is what the app expects.
- Okta System Log: `eventType eq "user.authentication.sso"` for the app.

## SCIM provisioning
1. App → **Provisioning** tab → Configure API Integration → enter the vendor's SCIM base URL + bearer token.
2. **To App**: enable *Create Users*, *Update User Attributes*, *Deactivate Users*.
3. Map attributes under *Attribute Mappings*. Check `userName` matches the SAML NameID.
4. **Push Groups** if the app uses groups for roles.
5. Test: assign a test user → confirm created in the app → unassign → confirm deactivated.

SCIM is what makes offboarding automatic. An app with SSO but no SCIM is a leaver risk: the account stays alive in the app. Track these on a list and remove accounts manually or with the app's API.

## Certificate rotation
Okta SAML signing certs last 10 years by default, but vendors sometimes demand rotation. Generate a new cert in the app's Sign On tab, give the vendor the new metadata, then activate it. Schedule this during a quiet window.
