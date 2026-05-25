// Minimal Prisma config kept intentionally import-free.
// Prisma auto-loads this file from the project root.
// Because Prisma config loading skips automatic .env loading, we inject
// the local development SQLite URL here when it is not already set.

process.env.LOCALDB_HUB_DATABASE_URL ??= "file:./storage/metadata/localdb-hub.sqlite";

export default {};
