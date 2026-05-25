import type { EngineType } from "@localdb-hub/shared";
export { buildConnectionStrings } from "./connection-strings";

export type TemplateCategory =
  | "sql"
  | "document"
  | "cache"
  | "search"
  | "analytics"
  | "graph"
  | "queue"
  | "object-storage"
  | "embedded";

export type ExposeMode = "INTERNAL_ONLY" | "LOCAL_ONLY" | "LAN";

export type DatabaseTemplate = {
  engine: EngineType;
  displayName: string;
  category: TemplateCategory;
  versions: string[];
  defaultVersion: string;
  image?: string;
  defaultPort?: number;
  fallbackPortRange?: [number, number];
  internalPorts: number[];
  connectionUrlExamples: string[];
  defaultResources: {
    memoryMb: number;
    cpus: number;
  };
  warnings?: string[];
};

export const tierOneTemplates: DatabaseTemplate[] = [
  {
    engine: "postgres",
    displayName: "PostgreSQL",
    category: "sql",
    versions: ["16", "17", "latest"],
    defaultVersion: "16",
    image: "postgres:16",
    defaultPort: 5432,
    fallbackPortRange: [15432, 15499],
    internalPorts: [5432],
    connectionUrlExamples: [
      "postgresql://user:password@host:5432/database",
      "postgresql://user:password@host:5432/database?schema=public"
    ],
    defaultResources: { memoryMb: 1024, cpus: 1 }
  },
  {
    engine: "mysql",
    displayName: "MySQL",
    category: "sql",
    versions: ["8", "latest"],
    defaultVersion: "8",
    image: "mysql:8",
    defaultPort: 3306,
    fallbackPortRange: [13306, 13399],
    internalPorts: [3306],
    connectionUrlExamples: ["mysql://user:password@host:3306/database"],
    defaultResources: { memoryMb: 1024, cpus: 1 }
  },
  {
    engine: "mariadb",
    displayName: "MariaDB",
    category: "sql",
    versions: ["11", "latest"],
    defaultVersion: "11",
    image: "mariadb:11",
    defaultPort: 3306,
    fallbackPortRange: [13406, 13499],
    internalPorts: [3306],
    connectionUrlExamples: ["mysql://user:password@host:3306/database"],
    defaultResources: { memoryMb: 1024, cpus: 1 }
  },
  {
    engine: "mongodb",
    displayName: "MongoDB",
    category: "document",
    versions: ["7", "8", "latest"],
    defaultVersion: "7",
    image: "mongo:7",
    defaultPort: 27017,
    fallbackPortRange: [27018, 27099],
    internalPorts: [27017],
    connectionUrlExamples: ["mongodb://user:password@host:27017/database"],
    defaultResources: { memoryMb: 1024, cpus: 1 }
  },
  {
    engine: "redis",
    displayName: "Redis",
    category: "cache",
    versions: ["7", "latest"],
    defaultVersion: "7",
    image: "redis:7",
    defaultPort: 6379,
    fallbackPortRange: [16379, 16399],
    internalPorts: [6379],
    connectionUrlExamples: ["redis://:password@host:6379"],
    defaultResources: { memoryMb: 256, cpus: 0.5 }
  },
  {
    engine: "sqlite",
    displayName: "SQLite",
    category: "embedded",
    versions: ["3"],
    defaultVersion: "3",
    internalPorts: [],
    connectionUrlExamples: ["file:/opt/localdb-hub/data/sqlite/database.sqlite"],
    defaultResources: { memoryMb: 64, cpus: 0.1 }
  }
];

export function getTemplate(engine: EngineType) {
  return tierOneTemplates.find((template) => template.engine === engine);
}
