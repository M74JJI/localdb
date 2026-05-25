# LocalDB Hub — Phase 22 Linux Typecheck Field Fix

## Problem

Linux typecheck fails in `apps/web/src/app/databases/new/page.tsx` because `exactOptionalPropertyTypes` rejects explicit `undefined` for the `Field` component's `error` prop.

## Fix

Change the `Field` prop type from:

```ts
error?: string;
help?: string;
```

to:

```ts
error?: string | undefined;
help?: string | undefined;
```

## Apply

```bash
cd ~/localdb-test/localdb-hub-foundation
unzip -o /path/to/localdb-hub-phase22-linux-typecheck-field-fix.zip
bun run typecheck
bun run build
```
