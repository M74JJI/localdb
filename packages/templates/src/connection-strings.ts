import type { EngineType } from "@localdb-hub/shared";

export type ConnectionStringInput = {
  engine: EngineType;
  host: string;
  port?: number | null;
  databaseName?: string | null;
  username?: string | null;
  password?: string | null;
  sqlitePath?: string | null;
};

function encode(value: string) {
  return encodeURIComponent(value);
}

export function buildConnectionStrings(input: ConnectionStringInput) {
  const username = input.username ? encode(input.username) : "";
  const password = input.password ? encode(input.password) : "";
  const auth = username ? `${username}${password ? `:${password}` : ""}@` : "";
  const host = input.host;
  const port = input.port;
  const db = input.databaseName ?? "";

  switch (input.engine) {
    case "postgres": {
      const base = `postgresql://${auth}${host}:${port ?? 5432}/${db}`;
      return {
        DATABASE_URL: base,
        PRISMA_DATABASE_URL: `${base}?schema=public`,
        JDBC_URL: `jdbc:postgresql://${host}:${port ?? 5432}/${db}`
      };
    }

    case "mysql":
    case "mariadb": {
      return {
        DATABASE_URL: `mysql://${auth}${host}:${port ?? 3306}/${db}`,
        JDBC_URL: `jdbc:mysql://${host}:${port ?? 3306}/${db}`
      };
    }

    case "mongodb": {
      return {
        MONGO_URL: `mongodb://${auth}${host}:${port ?? 27017}/${db}`,
        DATABASE_URL: `mongodb://${auth}${host}:${port ?? 27017}/${db}`
      };
    }

    case "redis": {
      const redisAuth = password ? `:${password}@` : "";
      return {
        REDIS_URL: `redis://${redisAuth}${host}:${port ?? 6379}`
      };
    }

    case "sqlite": {
      const path = input.sqlitePath ?? `/opt/localdb-hub/data/sqlite/${db || "database"}.sqlite`;
      return {
        DATABASE_URL: `file:${path}`,
        SQLITE_PATH: path
      };
    }

    default:
      return {};
  }
}
