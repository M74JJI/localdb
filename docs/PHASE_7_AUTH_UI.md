# Phase 7 — Auth UI

## Goal

Make LocalDB Hub usable as a local product with first-run setup and login.

## Added

- `/setup`
- `/login`
- authenticated session cookie support in the web app
- logout button
- app shell navigation
- auth-aware homepage

## API

Existing endpoints are used:

- `GET /api/setup/status`
- `POST /api/setup/initialize`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Current limitations

This phase creates the UI and session flow. Next phase should enforce authorization on sensitive API routes and add route protection redirects.
