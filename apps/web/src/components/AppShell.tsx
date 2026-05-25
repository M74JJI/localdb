import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { SidebarNav, MobileNav } from "./SidebarNav";
import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-shell">
      <div className="flex min-h-screen">
        <aside className="app-sidebar hidden w-[272px] shrink-0 px-4 py-4 lg:block">
          <Link href="/dashboard" className="app-card block p-4">
            <div className="flex items-center gap-3">
              <div
                className="grid h-9 w-9 place-items-center rounded-lg text-sm font-bold"
                style={{ background: "var(--app-primary)", color: "var(--app-primary-text)" }}
              >
                DB
              </div>
              <div>
                <p className="font-semibold">LocalDB Hub</p>
                <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                  Database control plane
                </p>
              </div>
            </div>
          </Link>

          <SidebarNav />

          <div className="app-card mt-5 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text-subtle)" }}>
                Runtime mode
              </span>
              <span className="app-kbd">Windows</span>
            </div>
            <p className="mt-3 text-xs leading-5" style={{ color: "var(--app-text-muted)" }}>
              SQLite is executed locally. Container-backed databases are queued until Docker mode is enabled on Linux.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="app-topbar sticky top-0 z-20">
            <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-4 md:px-6">
              <Link href="/dashboard" className="font-semibold lg:hidden">
                LocalDB Hub
              </Link>

              <div className="hidden text-sm lg:block" style={{ color: "var(--app-text-muted)" }}>
                Manage local development databases, credentials, jobs, and backups.
              </div>

              <div className="flex items-center gap-2">
                <Link href="/databases/new" className="app-button app-button-primary hidden md:inline-flex">
                  New database
                </Link>
                <ThemeToggle />
                <LogoutButton />
              </div>

              <div className="w-full lg:hidden">
                <MobileNav />
              </div>
            </div>
          </header>

          <div className="px-4 py-6 md:px-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
