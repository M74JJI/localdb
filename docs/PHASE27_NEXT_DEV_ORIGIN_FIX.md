# Phase 27 Next.js Dev Origin Fix

Next.js dev mode blocks cross-origin access to development resources by default.

When the web app runs inside Ubuntu but is opened from Windows through the VM IP:

```txt
http://192.168.133.131:3000
```

Next may block:

```txt
/_next/webpack-hmr
```

The fix is to configure:

```ts
allowedDevOrigins
```

in:

```txt
apps/web/next.config.ts
```

This is a development-only issue. Production builds do not use the webpack HMR endpoint.
