---
title: "Firebase"
category: DATA
order: 3
summary: "Firestore data model, security rules, Auth and the CLI for deploying rules and functions."
tags: ["firebase", "firestore", "security rules", "auth"]
updated: 2026-10-16
---
## Pieces
**Firestore** (document database: collections → documents → subcollections) · **Auth** (email, Google, SAML/OIDC with Identity Platform) · **Cloud Functions** · **Hosting** · **Storage**.

## Security rules (Firestore)
Rules are the only thing standing between the web client and your data.
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /kb/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;   // custom claim
    }
  }
}
```
Never ship `allow read, write: if true;`. Test in the **Rules Playground** or the emulator.

## Web client
```js
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore'
const db = getFirestore(initializeApp(firebaseConfig))
const q = query(collection(db, 'devices'), where('compliant', '==', false))
const snap = await getDocs(q); snap.forEach(d => console.log(d.id, d.data()))
await setDoc(doc(db, 'devices', 'C02XXXX'), { compliant: true }, { merge: true })
```

## Admin SDK (server/scripts) — set a custom claim
```js
import admin from 'firebase-admin'
admin.initializeApp()
await admin.auth().setCustomUserClaims(uid, { admin: true })
```

## CLI
```bash
npm i -g firebase-tools
firebase login
firebase init firestore functions hosting
firebase emulators:start
firebase deploy --only firestore:rules
firebase deploy --only functions
```

## Firestore vs Supabase
| | Firestore | Supabase |
|---|---|---|
| Model | Documents | Relational (Postgres) |
| Access control | Security rules | Row Level Security (SQL) |
| Queries | Simple, indexed | Full SQL, joins |
| Best for | Mobile/realtime apps | Reporting, relational data |
