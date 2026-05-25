import Link from "next/link";
import { apiGet } from "@/lib/api";

type JobDetail = {
  id: string;
  type: string;
  status: string;
  progress: number;
  message: string | null;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  logs: Array<{
    id: string;
    level: string;
    message: string;
    createdAt: string;
  }>;
  instance: {
    id: string;
    name: string;
    engine: string;
  } | null;
};

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await apiGet<{ job: JobDetail }>(`/api/jobs/${id}`);
  const job = data.job;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-50">
      <section className="mx-auto max-w-5xl">
        <Link href="/jobs" className="text-sm text-cyan-300">← Back to jobs</Link>

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{job.type}</p>
          <h1 className="mt-3 text-3xl font-semibold">{job.status}</h1>
          <p className="mt-2 text-zinc-400">{job.message ?? "No message"}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Info label="Progress" value={`${job.progress}%`} />
          <Info label="Started" value={job.startedAt ? new Date(job.startedAt).toLocaleString() : "-"} />
          <Info label="Finished" value={job.finishedAt ? new Date(job.finishedAt).toLocaleString() : "-"} />
        </div>

        {job.errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/40 p-5 text-red-200">
            {job.errorMessage}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Logs</h2>
          <div className="mt-4 grid gap-3">
            {job.logs.length === 0 ? (
              <p className="text-zinc-500">No logs yet.</p>
            ) : (
              job.logs.map((log) => (
                <div key={log.id} className="rounded-xl bg-black p-4 font-mono text-xs">
                  <span className="text-zinc-500">{new Date(log.createdAt).toLocaleString()} </span>
                  <span className="text-cyan-300">[{log.level}] </span>
                  <span className="text-zinc-200">{log.message}</span>
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 break-words font-mono text-sm text-zinc-100">{value}</p>
    </div>
  );
}
