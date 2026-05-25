import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiGet } from "@/lib/server-api";
import { requireUser } from "@/lib/auth";

type Health = { status: string; metadataDb: string; docker: string; templates: number };
type Instance = { id: string; name: string; engine: string; status: string };
type Job = { id: string; type: string; status: string; message: string | null };

export default async function DashboardPage() {
  await requireUser();

  const [health, instancesData, jobsData] = await Promise.all([
    apiGet<Health>("/api/system/health").catch(() => null),
    apiGet<{ instances: Instance[] }>("/api/instances").catch(() => ({ instances: [] })),
    apiGet<{ jobs: Job[] }>("/api/jobs").catch(() => ({ jobs: [] }))
  ]);

  const running = instancesData.instances.filter((item) => item.status === "RUNNING").length;
  const waitingDocker = jobsData.jobs.filter((item) => item.status === "WAITING_DOCKER").length;
  const failedJobs = jobsData.jobs.filter((item) => item.status === "FAILED").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Overview"
        title="Database operations"
        description="Operational status for local databases, queued jobs, and runtime services."
        actions={<Link href="/databases/new" className="app-button app-button-primary">Create database</Link>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="System" value={<StatusBadge status={health?.status ?? "unknown"} />} helper={health?.metadataDb ?? "Metadata status unavailable."} />
        <MetricCard label="Running databases" value={running} helper={`${instancesData.instances.length} total records`} />
        <MetricCard label="Waiting for Docker" value={waitingDocker} helper="Container databases queued for Linux/Docker execution." />
        <MetricCard label="Failed jobs" value={failedJobs} helper={failedJobs ? "Review the job queue." : "No failed operations."} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="app-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent databases</h2>
            <Link href="/databases" className="text-sm font-medium" style={{ color: "var(--app-primary)" }}>View all</Link>
          </div>
          <div className="mt-4 grid gap-2">
            {instancesData.instances.slice(0, 5).map((instance) => (
              <Link key={instance.id} href={`/databases/${instance.id}` as any} className="app-card-muted block p-3 hover:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{instance.name}</p>
                    <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>{instance.engine}</p>
                  </div>
                  <StatusBadge status={instance.status} />
                </div>
              </Link>
            ))}
            {instancesData.instances.length === 0 ? <p className="py-6 text-center text-sm" style={{ color: "var(--app-text-muted)" }}>No databases have been created.</p> : null}
          </div>
        </section>

        <section className="app-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent jobs</h2>
            <Link href="/jobs" className="text-sm font-medium" style={{ color: "var(--app-primary)" }}>View all</Link>
          </div>
          <div className="mt-4 grid gap-2">
            {jobsData.jobs.slice(0, 5).map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}` as any} className="app-card-muted block p-3 hover:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm">{job.type}</p>
                    <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>{job.message ?? "No message recorded."}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </Link>
            ))}
            {jobsData.jobs.length === 0 ? <p className="py-6 text-center text-sm" style={{ color: "var(--app-text-muted)" }}>No jobs have been created.</p> : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
