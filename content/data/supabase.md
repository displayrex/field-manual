---
title: "Supabase"
category: DATA
order: 1
summary: "Projects, auth, Row Level Security, the JS client, and the CLI for migrations and Edge Functions."
tags: ["supabase", "postgres", "rls", "auth", "edge functions"]
updated: 2026-10-16
---
## What's in a project
Postgres database · **Auth** (email, OAuth, SAML SSO on paid plans) · auto-generated **REST (PostgREST)** and Realtime APIs · **Storage** buckets · **Edge Functions** (Deno).
Keys: **anon/publishable** key (safe in browsers, limited by RLS) and **service_role/secret** key (bypasses RLS — server only, never in a frontend or Git).

## Row Level Security (the important part)
Every table exposed to the API needs RLS on, or anyone with the anon key can read it.
```sql
alter table notes enable row level security;

create policy "owners read" on notes for select
  using ( auth.uid() = user_id );
create policy "owners write" on notes for insert
  with check ( auth.uid() = user_id );
create policy "owners update" on notes for update
  using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );
```
Test: Dashboard → **Advisors → Security** flags tables without RLS.

## JS client
```js
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

await supabase.auth.signInWithOtp({ email: 'me@company.com' })   // magic link
const { data, error } = await supabase.from('notes').select('id,title').order('created_at', { ascending:false })
await supabase.from('notes').insert({ title: 'Jamf notes', user_id: (await supabase.auth.getUser()).data.user.id })
```

## CLI workflow
```bash
brew install supabase/tap/supabase   # or run any command as: npx supabase <cmd>
supabase login
supabase init
supabase link --project-ref <ref>
supabase start                       # local stack in Docker
supabase migration new add_notes     # writes supabase/migrations/<ts>_add_notes.sql
supabase db reset                    # re-run migrations locally
supabase db push                     # apply migrations to the linked project
supabase gen types typescript --linked > types.ts
supabase functions new okta-webhook
supabase functions deploy okta-webhook
supabase secrets set OKTA_TOKEN=...
```

## Admin habits
- Keep schema in migrations in Git, not dashboard clicks.
- Separate projects (or branches) for dev and prod.
- Turn on **Point-in-Time Recovery** for prod if the data matters.
- Rotate keys if a service key ever leaks.
