import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiGet } from "@/lib/server-api";
import { requireUser } from "@/lib/auth";
import { DatabasesTable, type DatabaseRow } from "./DatabasesTable";

export default async function DatabasesPage() {
  await requireUser();
  const data = await apiGet<{ instances: DatabaseRow[] }>("/api/instances").catch(() => ({ instances: [] }));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Inventory"
        title="Database instances"
        description="SQLite files and Docker-backed databases managed by this local control plane."
        actions={<Link href="/databases/new" className="app-button app-button-primary">Create database</Link>}
      />

      <DatabasesTable instances={data.instances} />
    </AppShell>
  );
}
