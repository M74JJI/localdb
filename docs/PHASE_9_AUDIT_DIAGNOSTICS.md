# Phase 9 — Audit + Diagnostics

## Goal

Add operational visibility for a self-hosted appliance.

## Added APIs

- `GET /api/audit`
- `GET /api/system/diagnostics`
- `GET /api/system/events`

## Added UI

- `/audit`
- `/system`

## Diagnostics include

- runtime paths
- master key status
- metadata DB status
- Docker status
- template catalog
- counts
- recent failed jobs
- recent audit events

## Why it matters

Before adding more heavy Docker operations, the operator needs clear visibility into local state, failures, and sensitive actions.
