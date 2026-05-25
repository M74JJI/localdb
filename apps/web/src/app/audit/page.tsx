import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiGet } from "@/lib/server-api";
import { requireUser } from "@/lib/auth";
import { AuditTable, type AuditRow } from "./AuditTable";

export default async function AuditPage() {
  await requireUser();
  const data = await apiGet<{ events: AuditRow[] }>("/api/audit").catch(() => ({ events: [] }));

  return (
    <AppShell>
      <PageHeader eyebrow="Audit" title="Security activity" description="Sensitive operations such as login, database creation, secret reveal, backup, and restore are recorded here." />
      <AuditTable events={data.events} />
    </AppShell>
  );
}
