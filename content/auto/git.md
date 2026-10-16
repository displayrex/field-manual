---
title: "Git reference"
category: AUTO
order: 1
summary: "Daily Git commands, branching workflow, fixing mistakes, and keeping secrets out of repos."
tags: ["git", "github", "version control", "branching"]
updated: 2026-10-16
---
## Daily loop
```bash
git status                       # what changed
git switch main && git pull      # start from latest
git switch -c feat/okta-report   # new branch
git add -p                       # stage hunk by hunk (review as you go)
git commit -m "Add Okta inactive-user report"
git push -u origin feat/okta-report
gh pr create --fill              # open a PR with the GitHub CLI
```

## Looking around
```bash
git log --oneline --graph --decorate -20
git diff                 # unstaged changes
git diff --staged        # what will be committed
git show <sha>           # one commit
git blame path/file.py   # who changed each line
git log -S "SSWS" --oneline   # commits that added/removed a string
```

## Undo table
| Situation | Command |
|---|---|
| Discard changes to a file | `git restore file` |
| Unstage a file | `git restore --staged file` |
| Fix the last commit message / add a forgotten file | `git add file && git commit --amend` |
| Undo last commit, keep changes | `git reset --soft HEAD~1` |
| Undo a pushed commit safely | `git revert <sha>` |
| Lost a commit after reset | `git reflog` → `git switch -c rescue <sha>` |
| Park work temporarily | `git stash push -m "wip"` → `git stash pop` |

## Staying current with main
```bash
git fetch origin
git rebase origin/main     # replay your commits on top (clean history)
# on conflict: edit files → git add <file> → git rebase --continue   (or --abort)
git push --force-with-lease   # only on your own branch, after a rebase
```

## Secrets
- Never commit tokens. Use `.env` + `.gitignore`, or a secrets manager.
- If one slips in: **rotate the secret first** (assume it's compromised), then clean history with `git filter-repo` and force-push.
- Add a pre-commit secret scanner (`gitleaks`, `trufflehog`) and turn on GitHub secret scanning + push protection.

## Config worth setting
```bash
git config --global user.name "Your Name"
git config --global user.email you@example.com
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global alias.lg "log --oneline --graph --decorate"
```

## Repo layout for admin scripts
```text
it-automation/
  okta/        jamf/        gam/        intune/
  lib/         # shared helpers (auth, pagination, logging)
  .env.example # variable names, no values
  README.md    # what each script does, how to run, who owns it
```
