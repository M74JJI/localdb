"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SecretValue } from "@/components/ui/SecretValue";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { browserApiPost } from "@/lib/client-api";

const engines = ["sqlite", "postgres", "mysql", "mariadb", "mongodb", "redis"] as const;

function defaultVersion(engine: string) {
  if (engine === "sqlite") return "3";
  if (engine === "mysql") return "8";
  if (engine === "mariadb") return "11";
  if (engine === "mongodb") return "7";
  if (engine === "redis") return "7";
  return "16";
}

type CreateResponse = {
  instance?: { id: string; name: string; engine: string; status: string };
  job?: { id: string; type: string; status: string; message: string | null };
  connectionStrings?: Record<string, string>;
};

type FormErrors = Partial<Record<"name" | "databaseName" | "username", string>>;

function validate(name: string, databaseName: string, username: string): FormErrors {
  const errors: FormErrors = {};

  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{2,47}$/.test(name)) {
    errors.name = "Use 3-48 characters. Start with a letter or number. Use letters, numbers, and hyphens only.";
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]{1,62}$/.test(databaseName)) {
    errors.databaseName = "Use 2-63 characters. Start with a letter or underscore. Use letters, numbers, and underscores.";
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]{1,62}$/.test(username)) {
    errors.username = "Use 2-63 characters. Start with a letter or underscore. Use letters, numbers, and underscores.";
  }

  return errors;
}

export default function NewDatabasePage() {
  const [engine, setEngine] = useState<(typeof engines)[number]>("sqlite");
  const [name, setName] = useState("test-sqlite");
  const [databaseName, setDatabaseName] = useState("test_sqlite");
  const [username, setUsername] = useState("test_user");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<CreateResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => validate(name, databaseName, username), [name, databaseName, username]);
  const hasErrors = Object.keys(errors).length > 0;

  function changeEngine(next: (typeof engines)[number]) {
    setEngine(next);
    setName(next === "sqlite" ? "test-sqlite" : `test-${next}`);
    setDatabaseName(next === "sqlite" ? "test_sqlite" : `test_${next}`);
    setUsername(next === "redis" ? "default_user" : "test_user");
    setTouched({});
    setResult(null);
    setError("");
  }

  async function createInstance() {
    setTouched({ name: true, databaseName: true, username: true });
    setError("");
    setResult(null);

    if (hasErrors) {
      setError("Fix the highlighted fields before creating the database.");
      return;
    }

    setLoading(true);

    try {
      const response = await browserApiPost<CreateResponse>("/api/instances", {
        engine,
        version: defaultVersion(engine),
        name,
        databaseName,
        username,
        passwordMode: "auto",
        portMode: "auto",
        exposeMode: "LOCAL_ONLY",
        memoryLimitMb: engine === "redis" ? 256 : 1024,
        cpuLimit: engine === "redis" ? 0.5 : 1
      });
      setResult(response);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl">
        <Link href="/databases" className="text-sm font-medium" style={{ color: "var(--app-primary)" }}>← Back to databases</Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="app-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--app-text-subtle)" }}>Provisioning</p>
            <h1 className="mt-1 text-3xl font-semibold">Create database</h1>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--app-text-muted)" }}>
              Create a managed local database record and queue the required worker operation.
            </p>

            <div className="mt-6 grid gap-5">
              <Field label="Engine" help="SQLite is created locally. Container engines require Docker mode.">
                <select value={engine} onChange={(event) => changeEngine(event.target.value as typeof engine)} className="app-select">
                  {engines.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>

              <Field label="Instance name" help="Used for display, jobs, and container naming." error={touched.name ? errors.name : undefined}>
                <input value={name} onBlur={() => setTouched((state) => ({ ...state, name: true }))} onChange={(event) => setName(event.target.value)} className="app-input" aria-invalid={Boolean(touched.name && errors.name)} placeholder="test-postgres" />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Database name" error={touched.databaseName ? errors.databaseName : undefined}>
                  <input value={databaseName} onBlur={() => setTouched((state) => ({ ...state, databaseName: true }))} onChange={(event) => setDatabaseName(event.target.value)} className="app-input" aria-invalid={Boolean(touched.databaseName && errors.databaseName)} placeholder="app_db" />
                </Field>

                <Field label="Username" error={touched.username ? errors.username : undefined}>
                  <input value={username} onBlur={() => setTouched((state) => ({ ...state, username: true }))} onChange={(event) => setUsername(event.target.value)} className="app-input" aria-invalid={Boolean(touched.username && errors.username)} placeholder="app_user" />
                </Field>
              </div>

              <div className="flex flex-wrap gap-2 border-t pt-5 app-divider">
                <button onClick={createInstance} disabled={loading} className="app-button app-button-primary">
                  {loading ? "Creating job..." : "Create database"}
                </button>
                <Link href="/databases" className="app-button app-button-secondary">Cancel</Link>
              </div>
            </div>
          </div>

          <aside className="app-card p-5">
            <h2 className="font-semibold">Execution model</h2>
            <div className="mt-4 grid gap-3">
              <InfoBox title="SQLite" text="Created immediately as a local file. Recommended for Windows validation." />
              <InfoBox title="Container engines" text="PostgreSQL, MySQL, MariaDB, MongoDB, and Redis wait for Docker-enabled execution." />
            </div>
          </aside>
        </div>

        {error ? <div className="app-card mt-5 p-4 text-sm" style={{ color: "var(--app-danger)" }}>{error}</div> : null}

        {result ? (
          <div className="app-card mt-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Database request accepted</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--app-text-muted)" }}>{result.job?.message ?? "Worker job created."}</p>
              </div>
              {result.job?.status ? <StatusBadge status={result.job.status} /> : null}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Summary label="Instance" value={result.instance?.name ?? "-"} />
              <Summary label="Engine" value={result.instance?.engine ?? "-"} />
              <Summary label="Job" value={result.job?.type ?? "-"} />
            </div>

            {result.connectionStrings ? (
              <div className="mt-6">
                <h3 className="font-semibold">Connection strings</h3>
                <div className="mt-3 grid gap-3">
                  {Object.entries(result.connectionStrings).map(([key, value]) => (
                    <div key={key}>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text-subtle)" }}>{key}</p>
                      <SecretValue value={value} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}

function Field({ label, help, error, children }: { label: string; help?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="app-label">{label}</span>
      <div className="mt-2">{children}</div>
      {help ? <p className="app-help">{help}</p> : null}
      {error ? <p className="app-error">{error}</p> : null}
    </label>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="app-card-muted p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-5" style={{ color: "var(--app-text-muted)" }}>{text}</p>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-card-muted p-3">
      <p className="text-xs" style={{ color: "var(--app-text-subtle)" }}>{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
