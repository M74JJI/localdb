# Phase 6 — Encrypted Secrets

## Goal

Replace development plaintext secret storage with local encryption.

## Storage

Secrets are encrypted using AES-256-GCM.

Development key:

```txt
./storage/config/master.key
```

Production key:

```txt
/opt/localdb-hub/config/master.key
```

## Compatibility

Old values starting with:

```txt
dev-plaintext:
```

are still readable so existing development records do not break.

New values use:

```txt
ldh-v1:<iv>:<tag>:<ciphertext>
```

## Audit

Secret reveal endpoint creates an `INSTANCE_SECRETS_REVEALED` audit event.

## Important future hardening

- Require authenticated admin for reveal.
- Add confirmation step.
- Add optional one-time reveal mode.
- Add master key rotation workflow.
