import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: process.env.LOCALDB_HUB_DATABASE_URL ?? "file:../../storage/metadata/localdb-hub.sqlite"
  }
});
