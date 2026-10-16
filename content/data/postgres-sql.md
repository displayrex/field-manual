---
title: "PostgreSQL & SQL"
category: DATA
order: 2
summary: "SQL patterns, psql commands, roles and grants, indexing and DBVisualizer tips."
tags: ["postgresql", "sql", "psql", "dbvisualizer", "database"]
updated: 2026-10-16
---
## psql
```bash
psql "postgresql://user:pass@host:5432/dbname?sslmode=require"
```
| Command | Does |
|---|---|
| `\l` | list databases |
| `\c db` | connect |
| `\dt` / `\dt schema.*` | list tables |
| `\d table` | describe table |
| `\du` | roles |
| `\x` | expanded output toggle |
| `\timing` | show query time |
| `\copy t to 'out.csv' csv header` | export from client side |

## SQL you use constantly
```sql
select department, count(*) as n
from users where status = 'active'
group by department having count(*) > 5 order by n desc;

-- Join: devices with their owner
select d.serial, d.os_version, u.email
from devices d left join users u on u.id = d.owner_id
where d.last_checkin < now() - interval '14 days';

-- Upsert
insert into users (email, department) values ('jane@co.com','Finance')
on conflict (email) do update set department = excluded.department;

-- Window: latest check-in per device
select distinct on (serial) serial, checked_in_at
from checkins order by serial, checked_in_at desc;

-- JSON field
select payload->>'eventType' as type, count(*) from okta_logs group by 1;
```

## Safe changes
```sql
begin;
update users set status = 'disabled' where email = 'jane@co.com';
-- check the row count reported, then:
commit;   -- or rollback;
```
Always run the `select` with the same `where` before an `update` or `delete`.

## Roles & least privilege
```sql
create role reporting login password '...';
grant connect on database app to reporting;
grant usage on schema public to reporting;
grant select on all tables in schema public to reporting;
alter default privileges in schema public grant select on tables to reporting;
```

## Performance
- `explain analyze <query>` — look for *Seq Scan* on big tables.
- `create index concurrently idx_devices_owner on devices(owner_id);`
- Index columns used in `where`, `join`, `order by`.

## DBVisualizer
- New connection → PostgreSQL → host, port 5432, database, user; enable SSL for cloud DBs (Supabase: use the connection string from Project Settings → Database).
- **SQL Commander** (Ctrl/⌘+Enter runs the statement under the cursor).
- Turn off **Auto Commit** for production connections so changes need an explicit commit.
- Use connection colors/tags (red for prod) and read-only connections where possible.
- Right-click table → *Export* for CSV evidence pulls.
