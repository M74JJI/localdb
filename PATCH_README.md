# LocalDB Hub — Phase 21 Shell + Professional Tables UX

## Fixes

- Authenticated application pages use the shared `AppShell`, so the sidebar is visible consistently.
- `/databases/new` now uses the main app shell.
- `/databases/[id]` now uses the main app shell.
- Tables now feel like real admin-console tables:
  - Search
  - Page size selector
  - Pagination
  - Result counts
  - Previous/Next controls
  - Empty filtered state
- Adds client table components for:
  - Databases
  - Jobs
  - Backups
  - Audit log

## Apply

```powershell
cd C:\Users\MohamedHajji\Desktop\localdb-hub-foundation\localdb-hub-foundation
Expand-Archive -Force C:\Path\To\localdb-hub-phase21-shell-tables-ux.zip .
Remove-Item -Recurse -Force .\apps\web\.next -ErrorAction SilentlyContinue
bun run typecheck
bun run build
bun run dev:web
```

Hard refresh:

```txt
Ctrl + F5
```

## Note

Login, setup, and public landing intentionally do not use the sidebar.
All authenticated console pages should.
