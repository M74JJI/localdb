import Link from "next/link";
import { apiGet } from "@/lib/api";
import { RestoreAction } from "./RestoreAction";

type Backup = {
  id: string;
  type: string;
  status: string;
  path: string | null;
  sizeBytes: number | null;
  checksumSha256: string | null;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  instance: {
    id: string;
    name: string;
    engine: string;
  };
};

export default async function BackupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await apiGet<{ backup: Backup }>(`/api/backups/${id}`);
  const backup = data.backup;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-50">
      <section className="mx-auto max-w-5xl">
        <Link href="/backups" className="text-sm text-cyan-300">← Back to backups</Link>

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{backup.instance.engine}</p>
          <h1 className="mt-3 text-3xl font-semibold">{backup.instance.name}</h1>
          <p className="mt-2 font-mono text-cyan-300">{backup.status}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="Type" value={backup.type} />
          <Info label="Path" value={backup.path ?? "-"} />
          <Info label="Size" value={backup.sizeBytes ? `${backup.sizeBytes} bytes` : "-"} />
          <Info label="SHA256" value={backup.checksumSha256 ?? "-"} />
          <Info label="Created" value={new Date(backup.createdAt).toLocaleString()} />
          <Info label="Completed" value={backup.completedAt ? new Date(backup.completedAt).toLocaleString() : "-"} />
        </div>

        {backup.errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/40 p-5 text-red-200">
            {backup.errorMessage}
          </div>
        ) : null}

        <RestoreAction backupId={backup.id} />
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 break-words font-mono text-sm text-zinc-100">{value}</p>
    </div>
  );
}
