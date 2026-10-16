---
title: "GAM cheat sheet"
category: GWS
order: 2
summary: "GAM / GAM7 commands for bulk Google Workspace administration: users, groups, Drive transfers, reports."
tags: ["gam", "google workspace", "cli", "bulk"]
updated: 2026-10-16
---
## Setup
Install GAM7 from github.com/GAM-team/GAM (follow the install page on its wiki), then `gam create project` → `gam oauth create` → `gam user you@company.com check serviceaccount` and authorize scopes. Config lives in `~/.gam/`.

## Users
```bash
gam info user jane@company.com
gam create user new.hire@company.com firstname New lastname Hire password random changepassword on org "/Staff/Engineering"
gam update user jane@company.com suspended on
gam update user jane@company.com org "/Former Employees"
gam print users fields primaryemail,suspended,lastlogintime,orgunitpath > users.csv
gam print users query "isEnrolledIn2Sv=false" fields primaryemail   # who has no 2SV
```

## Offboard in one go
```bash
U=jane@company.com; M=manager@company.com
gam update user $U suspended on
gam user $U signout                       # kill web sessions
gam user $U deprovision                   # revokes app passwords, backup codes, OAuth tokens
gam create datatransfer $U gdrive $M privacy_level shared,private
gam user $U delete groups                 # remove from all groups
gam user $U forward on $M keep             # optional mail forwarding
```

## Groups
```bash
gam create group app-figma-users@company.com name "Figma users"
gam update group app-figma-users@company.com add member jane@company.com
gam update group team@company.com sync member file members.txt   # make membership match a file
gam print group-members group team@company.com
```

## Drive and sharing
```bash
gam user jane@company.com print filelist query "visibility='anyoneWithLink'" fields id,name,owners
gam user jane@company.com transfer drive manager@company.com
```

## Bulk from CSV
```bash
# CSV columns: email,ou
gam csv moves.csv gam update user ~email org ~ou
```
`~column` pulls a value from each CSV row. Add `gam redirect csv out.csv multiprocess` before print commands to collect output from many users.

## Reports
```bash
gam report login user all start -7d
gam report admin start -30d
gam report drive user jane@company.com event download start -7d
```

## Tips
- Test any bulk command on one user first.
- `gam version` and `gam checkconn` when something feels broken.
