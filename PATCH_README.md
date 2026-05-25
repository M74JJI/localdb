# LocalDB Hub — Proper Field Error Fix

## Problem

Build/typecheck fails in:

```txt
apps/web/src/app/databases/new/page.tsx
```

because JSX passes explicit `undefined` to an optional prop:

```tsx
error={touched.name ? errors.name : undefined}
```

With `exactOptionalPropertyTypes: true`, `error?: string` does not accept an explicitly passed `undefined`.

## Proper fix

Do not pass `undefined`. Pass an empty string when there is no visible error:

```tsx
error={touched.name ? (errors.name ?? "") : ""}
```

This preserves behavior because the `Field` component renders the error only when it is truthy.

## Apply

```bash
cd ~/localdb-test/localdb
unzip -o /path/to/localdb-hub-phase22-proper-field-error-fix.zip
bun scripts/fix-field-error-jsx.ts
bun run typecheck
bun run build
```
