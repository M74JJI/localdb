import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiGet } from "@/lib/server-api";
import { requireUser } from "@/lib/auth";

type Diagnostics = {
  generatedAt: string;
  runtime: {
    paths: Array<{ path: string; exists: boolean; type: string }>;
    masterKey: { path: string; exists: boolean; type: string };
  };
  docker: { ok: boolean; skipped?: boolean; version: string | null; error?: string | null };
  templates: { tierOneCount: number; engines: string[] };
  metadataDb: { ok: boolean; error: string | null };
  counts?: Record<string, number>;
};

export default async function SystemPage() {
  await requireUser();
  const diagnostics = await apiGet<Diagnostics>("/api/system/diagnostics");

  return (
    <AppShell>
      <PageHeader eyebrow="System" title="Runtime diagnostics" description={`Generated ${new Date(diagnostics.generatedAt).toLocaleString()}.`} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Metadata database" value={<StatusBadge status={diagnostics.metadataDb.ok ? "ok" : "error"} />} helper={diagnostics.metadataDb.error ?? "SQLite metadata database reachable."} />
        <MetricCard label="Docker engine" value={<StatusBadge status={diagnostics.docker.ok ? "ok" : diagnostics.docker.skipped ? "skipped" : "error"} />} helper={diagnostics.docker.ok ? diagnostics.docker.version : diagnostics.docker.error ?? "Disabled in Windows mode."} />
        <MetricCard label="Master key" value={<StatusBadge status={diagnostics.runtime.masterKey.exists ? "ok" : "missing"} />} helper={diagnostics.runtime.masterKey.path} />
        <MetricCard label="Templates" value={diagnostics.templates.tierOneCount} helper={diagnostics.templates.engines.join(", ")} />
      </div>

      {diagnostics.counts ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(diagnostics.counts).map(([key, value]) => <MetricCard key={key} label={key} value={value} />)}
        </div>
      ) : null}

      <section className="app-card mt-6 p-5">
        <h2 className="text-xl font-semibold">Runtime paths</h2>
        <div className="mt-4 grid gap-2">
          {diagnostics.runtime.paths.map((item) => (
            <div key={item.path} className="app-card-muted flex flex-wrap items-center gap-3 p-3">
              <StatusBadge status={item.exists ? "ok" : "missing"} label={item.exists ? "OK" : "Missing"} />
              <span className="app-kbd">{item.type}</span>
              <span className="min-w-0 break-all font-mono text-xs" style={{ color: "var(--app-text-muted)" }}>{item.path}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
