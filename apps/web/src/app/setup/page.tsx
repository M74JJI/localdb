"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { browserApiGet, browserApiPost, getBrowserApiBaseUrl } from "@/lib/client-api";

type SetupStatus = { initialized: boolean; metadataDbReady: boolean; error?: string };

export default function SetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [email, setEmail] = useState("admin@local.test");
  const [password, setPassword] = useState("ChangeMe123!");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState("");

  useEffect(() => {
    setApiBaseUrl(getBrowserApiBaseUrl());

    browserApiGet<SetupStatus>("/api/setup/status")
      .then(setStatus)
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "Failed to load setup status");
      });
  }, []);

  async function initialize() {
    setLoading(true);
    setMessage("");

    try {
      await browserApiPost("/api/setup/initialize", { email, password });
      router.push("/login");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unknown setup error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell grid min-h-screen place-items-center px-4 py-10">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <section className="w-full max-w-lg">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--app-text-subtle)" }}>First run</p>
          <h1 className="mt-2 text-3xl font-semibold">Initialize LocalDB Hub</h1>
        </div>

        <div className="app-card p-6">
          <div className="app-card-muted mb-5 grid gap-2 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm" style={{ color: "var(--app-text-muted)" }}>Setup status</span>
              <span className="text-sm font-semibold">{status ? (status.initialized ? "Initialized" : "Ready") : message ? "Unavailable" : "Checking..."}</span>
            </div>
            {apiBaseUrl ? (
              <p className="break-all font-mono text-xs" style={{ color: "var(--app-text-subtle)" }}>
                API: {apiBaseUrl}
              </p>
            ) : null}
          </div>

          <label className="app-label" htmlFor="email">Admin email</label>
          <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} className="app-input mt-2" />

          <label className="app-label mt-4" htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="app-input mt-2" />

          <button onClick={initialize} disabled={loading || status?.initialized} className="app-button app-button-primary mt-5 w-full">
            {loading ? "Creating..." : "Create admin account"}
          </button>

          <Link href="/login" className="mt-4 block text-center text-sm font-medium" style={{ color: "var(--app-primary)" }}>
            Already initialized? Sign in
          </Link>
        </div>

        {message ? <div className="app-card mt-4 p-3 text-sm" style={{ color: "var(--app-danger)" }}>{message}</div> : null}
      </section>
    </main>
  );
}
