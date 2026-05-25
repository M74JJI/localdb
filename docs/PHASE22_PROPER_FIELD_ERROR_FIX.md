# Phase 22 Proper Field Error Fix

The correct fix is at the JSX call site.

Before:

```tsx
error={touched.name ? errors.name : undefined}
```

After:

```tsx
error={touched.name ? (errors.name ?? "") : ""}
```

This avoids explicit `undefined` with `exactOptionalPropertyTypes: true`.
