# Docker Types Fix

`dockerode` runtime methods are valid, but some installed type definitions infer weak or wrong return types.

This patch explicitly casts `listNetworks()` to:

```ts
Promise<Array<{ Id?: string; Name?: string }>>
```

so TypeScript understands that `.length` is valid.
