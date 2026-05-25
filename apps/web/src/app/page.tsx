import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { apiGet } from "@/lib/server-api";

type SetupStatus = { initialized: boolean; metadataDbReady: boolean };
type MeResponse = { user: { id: string; email: string; role: string } | null };

export default async function HomePage() {
  const setup = await apiGet<SetupStatus>("/api/setup/status").catch(() => null);
  const me = await apiGet<MeResponse>("/api/auth/me").catch(() => ({ user: null }));
  const href = !setup?.initialized ? "/setup" : me.user ? "/dashboard" : "/login";

  return (
    <main className="app-shell grid min-h-screen place-items-center px-4 py-10">
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>
      <section className="w-full max-w-5xl">
        <div className="app-card p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--app-text-subtle)" }}>
            LocalDB Hub
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Database environments for local development.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7" style={{ color: "var(--app-text-muted)" }}>
            Provision local databases, manage connection details, track background operations, and maintain recoverable backups from a single control plane.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={href} className="app-button app-button-primary">Open console</Link>
            <Link href="/system" className="app-button app-button-secondary">System status</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
