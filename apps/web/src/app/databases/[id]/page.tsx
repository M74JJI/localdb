import Link from "next/link";
import { SecretValue } from "@/components/ui/SecretValue";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiGet } from "@/lib/server-api";
import { requireUser } from "@/lib/auth";
import { InstanceActions } from "./InstanceActions";
import { RevealSecrets } from "./RevealSecrets";

type Instance = {
  id: string;
  name: string;
  engine: string;
  version: string;
  status: string;
  host: string | null;
  primaryPort: number | null;
  databaseName: string | null;
  username: string | null;
  exposeMode: string;
  containerName: string | null;
  volumeName: string | null;
  dockerImage: string | null;
};

type ConnectionStringsResponse = { connectionStrings: Record<string, string>; warning?: string };

export default async function InstanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const instanceData = await apiGet<{ instance: Instance }>(`/api/instances/${id}`);
  const connectionData = await apiGet<ConnectionStringsResponse>(`/api/instances/${id}/connection-strings`).catch(() => ({ connectionStrings: {} }));
  const instance = instanceData.instance;

  return (
    <main className="app-shell min-h-screen px-4 py-6 md:px-6">
      <section className="mx-auto max-w-6xl">
        <Link href="/databases" className="text-sm font-medium" style={{ color: "var(--app-primary)" }}>← Back to databases</Link>

        <div className="app-card mt-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--app-text-subtle)" }}>{instance.engine}:{instance.version}</p>
              <h1 className="mt-1 text-3xl font-semibold">{instance.name}</h1>
            </div>
            <StatusBadge status={instance.status} />
          </div>

          {instance.status === "WAITING_DOCKER" ? (
            <div className="app-card-muted mt-5 p-4 text-sm leading-6" style={{ color: "var(--app-text-muted)" }}>
              This instance is queued for Docker execution. On Windows this is expected. It will run after deployment to Debian/Ubuntu with Docker enabled.
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Info label="Host" value={instance.host ?? "-"} />
          <Info label="Port" value={String(instance.primaryPort ?? "-")} />
          <Info label="Database" value={instance.databaseName ?? "-"} />
          <Info label="Username" value={instance.username ?? "-"} />
          <Info label="Expose mode" value={instance.exposeMode} />
          <Info label="Image" value={instance.dockerImage ?? "-"} />
          <Info label="Container" value={instance.containerName ?? "-"} />
          <Info label="Volume" value={instance.volumeName ?? "-"} />
        </div>

        <InstanceActions instanceId={instance.id} />
        <RevealSecrets instanceId={instance.id} />

        <div className="app-card mt-5 p-6">
          <h2 className="text-xl font-semibold">Connection strings</h2>
          <div className="mt-4 grid gap-3">
            {Object.keys(connectionData.connectionStrings).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>No connection strings available.</p>
            ) : (
              Object.entries(connectionData.connectionStrings).map(([key, value]) => (
                <div key={key}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text-subtle)" }}>{key}</p>
                  <SecretValue value={value} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text-subtle)" }}>{label}</p>
      <p className="mt-1 break-words font-mono text-sm">{value}</p>
    </div>
  );
}
