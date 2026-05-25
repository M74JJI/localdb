"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { browserApiPost } from "@/lib/client-api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@local.test");
  const [password, setPassword] = useState("ChangeMe123!");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setMessage("");

    try {
      await browserApiPost("/api/auth/login", { email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unknown login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell grid min-h-screen place-items-center px-4 py-10">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <section className="w-full max-w-md">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--app-text-subtle)" }}>LocalDB Hub</p>
          <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
        </div>

        <div className="app-card p-6">
          <label className="app-label" htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} className="app-input mt-2" />

          <label className="app-label mt-4" htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="app-input mt-2" />

          <button onClick={login} disabled={loading} className="app-button app-button-primary mt-5 w-full">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <Link href="/setup" className="mt-4 block text-center text-sm font-medium" style={{ color: "var(--app-primary)" }}>
            First run setup
          </Link>
        </div>

        {message ? <div className="app-card mt-4 p-3 text-sm" style={{ color: "var(--app-danger)" }}>{message}</div> : null}
      </section>
    </main>
  );
}
