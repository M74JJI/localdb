# Phase 8 — API Authorization

## Goal

Ensure LocalDB Hub management routes require a valid authenticated session.

## Public routes

- `GET /health`
- `GET /api/system/health`
- `GET /api/setup/status`
- `POST /api/setup/initialize`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Protected routes

- templates
- instances
- instance actions
- backups
- restores
- jobs
- secret reveal

## Current scope

This phase is admin-only. User roles exist in the data model, but RBAC granularity comes later.
