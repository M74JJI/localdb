import type { Instance, InstanceSecret } from "@localdb-hub/db";
import { LOCALDB_HUB_DOCKER_LABELS, LOCALDB_HUB_NETWORK } from "@localdb-hub/docker";
import { decryptSecret } from "@localdb-hub/security";

function unwrapSecret(secrets: InstanceSecret[], name: string) {
  const found = secrets.find((secret) => secret.name === name);

  if (!found) {
    return "";
  }

  return decryptSecret(found.ciphertext);
}

function parseResources(instance: Instance) {
  try {
    return JSON.parse(instance.resourceLimitsJson) as {
      memoryLimitMb?: number;
      cpuLimit?: number;
    };
  } catch {
    return {};
  }
}

function memoryBytes(instance: Instance) {
  const resources = parseResources(instance);
  return Math.max(64, resources.memoryLimitMb ?? 1024) * 1024 * 1024;
}

function nanoCpus(instance: Instance) {
  const resources = parseResources(instance);
  return Math.floor(Math.max(0.1, resources.cpuLimit ?? 1) * 1_000_000_000);
}

function hostIpForExposeMode(exposeMode: string) {
  if (exposeMode === "LOCAL_ONLY") {
    return "127.0.0.1";
  }

  if (exposeMode === "LAN") {
    return "0.0.0.0";
  }

  return undefined;
}

export function buildContainerCreateOptions(instance: Instance, secrets: InstanceSecret[]) {
  if (!instance.containerName) {
    throw new Error("Instance has no container name");
  }

  if (!instance.dockerImage) {
    throw new Error("Instance has no docker image");
  }

  if (!instance.volumeName) {
    throw new Error("Instance has no volume name");
  }

  const password = unwrapSecret(secrets, "password");
  const hostIp = hostIpForExposeMode(instance.exposeMode);
  const labels = {
    [LOCALDB_HUB_DOCKER_LABELS.managed]: "true",
    [LOCALDB_HUB_DOCKER_LABELS.instanceId]: instance.id,
    [LOCALDB_HUB_DOCKER_LABELS.engine]: instance.engine,
    [LOCALDB_HUB_DOCKER_LABELS.name]: instance.name
  };

  const exposedPorts: Record<string, {}> = {};
  const portBindings: Record<string, Array<{ HostIp?: string; HostPort: string }>> = {};

  function bind(internalPort: number, externalPort: number | null) {
    const key = `${internalPort}/tcp`;
    exposedPorts[key] = {};

    if (externalPort && instance.exposeMode !== "INTERNAL_ONLY") {
      portBindings[key] = [
        {
          ...(hostIp ? { HostIp: hostIp } : {}),
          HostPort: String(externalPort)
        }
      ];
    }
  }

  const commonHostConfig: Record<string, unknown> = {
    RestartPolicy: {
      Name: "unless-stopped"
    },
    Memory: memoryBytes(instance),
    NanoCpus: nanoCpus(instance),
    NetworkMode: LOCALDB_HUB_NETWORK
  };

  const commonNetworkingConfig = {
    EndpointsConfig: {
      [LOCALDB_HUB_NETWORK]: {
        Aliases: [instance.containerName, instance.name]
      }
    }
  };

  if (instance.engine === "postgres") {
    bind(5432, instance.primaryPort);

    return {
      name: instance.containerName,
      Image: instance.dockerImage,
      Env: [
        `POSTGRES_DB=${instance.databaseName}`,
        `POSTGRES_USER=${instance.username}`,
        `POSTGRES_PASSWORD=${password}`
      ],
      ExposedPorts: exposedPorts,
      Labels: labels,
      HostConfig: {
        ...commonHostConfig,
        Binds: [`${instance.volumeName}:/var/lib/postgresql/data`],
        PortBindings: portBindings
      },
      NetworkingConfig: commonNetworkingConfig
    };
  }

  if (instance.engine === "mysql") {
    bind(3306, instance.primaryPort);

    return {
      name: instance.containerName,
      Image: instance.dockerImage,
      Env: [
        `MYSQL_DATABASE=${instance.databaseName}`,
        `MYSQL_USER=${instance.username}`,
        `MYSQL_PASSWORD=${password}`,
        `MYSQL_ROOT_PASSWORD=${password}`
      ],
      ExposedPorts: exposedPorts,
      Labels: labels,
      HostConfig: {
        ...commonHostConfig,
        Binds: [`${instance.volumeName}:/var/lib/mysql`],
        PortBindings: portBindings
      },
      NetworkingConfig: commonNetworkingConfig
    };
  }

  if (instance.engine === "mariadb") {
    bind(3306, instance.primaryPort);

    return {
      name: instance.containerName,
      Image: instance.dockerImage,
      Env: [
        `MARIADB_DATABASE=${instance.databaseName}`,
        `MARIADB_USER=${instance.username}`,
        `MARIADB_PASSWORD=${password}`,
        `MARIADB_ROOT_PASSWORD=${password}`
      ],
      ExposedPorts: exposedPorts,
      Labels: labels,
      HostConfig: {
        ...commonHostConfig,
        Binds: [`${instance.volumeName}:/var/lib/mysql`],
        PortBindings: portBindings
      },
      NetworkingConfig: commonNetworkingConfig
    };
  }

  if (instance.engine === "mongodb") {
    bind(27017, instance.primaryPort);

    return {
      name: instance.containerName,
      Image: instance.dockerImage,
      Env: [
        `MONGO_INITDB_DATABASE=${instance.databaseName}`,
        `MONGO_INITDB_ROOT_USERNAME=${instance.username}`,
        `MONGO_INITDB_ROOT_PASSWORD=${password}`
      ],
      ExposedPorts: exposedPorts,
      Labels: labels,
      HostConfig: {
        ...commonHostConfig,
        Binds: [`${instance.volumeName}:/data/db`],
        PortBindings: portBindings
      },
      NetworkingConfig: commonNetworkingConfig
    };
  }

  if (instance.engine === "redis") {
    bind(6379, instance.primaryPort);

    return {
      name: instance.containerName,
      Image: instance.dockerImage,
      Cmd: ["redis-server", "--appendonly", "yes", "--requirepass", password],
      ExposedPorts: exposedPorts,
      Labels: labels,
      HostConfig: {
        ...commonHostConfig,
        Binds: [`${instance.volumeName}:/data`],
        PortBindings: portBindings
      },
      NetworkingConfig: commonNetworkingConfig
    };
  }

  throw new Error(`Container spec not implemented for engine: ${instance.engine}`);
}
