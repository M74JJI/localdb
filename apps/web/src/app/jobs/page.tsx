import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiGet } from "@/lib/server-api";
import { requireUser } from "@/lib/auth";
import { JobsTable, type JobRow } from "./JobsTable";

export default async function JobsPage() {
  await requireUser();
  const data = await apiGet<{ jobs: JobRow[] }>("/api/jobs").catch(() => ({ jobs: [] }));

  return (
    <AppShell>
      <PageHeader eyebrow="Queue" title="Operation jobs" description="Background operations processed by the worker." />
      <JobsTable jobs={data.jobs} />
    </AppShell>
  );
}
