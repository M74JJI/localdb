"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  ClipboardList,
  Database,
  FileClock,
  LayoutDashboard,
  Plus,
  Settings
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/databases", label: "Databases", icon: Database },
  { href: "/databases/new", label: "New instance", icon: Plus },
  { href: "/jobs", label: "Jobs", icon: ClipboardList },
  { href: "/backups", label: "Backups", icon: Archive },
  { href: "/audit", label: "Audit log", icon: FileClock },
  { href: "/system", label: "System", icon: Settings }
] as const;

function normalize(pathname: string) {
  if (!pathname || pathname === "/") return "/dashboard";
  return pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
}

function isActiveRoute(rawPathname: string, href: string) {
  const pathname = normalize(rawPathname);

  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (href === "/databases/new") {
    return pathname === "/databases/new";
  }

  if (href === "/databases") {
    return pathname === "/databases" || (pathname.startsWith("/databases/") && pathname !== "/databases/new");
  }

  if (href === "/jobs") {
    return pathname === "/jobs" || pathname.startsWith("/jobs/");
  }

  if (href === "/backups") {
    return pathname === "/backups" || pathname.startsWith("/backups/");
  }

  return pathname === href;
}

export function SidebarNav() {
  const pathname = usePathname() ?? "/dashboard";

  return (
    <nav className="mt-4 grid gap-1" aria-label="Primary navigation">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = isActiveRoute(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="app-nav-link"
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
            style={
              active
                ? {
                    background: "var(--app-primary-soft)",
                    color: "var(--app-primary)",
                    borderColor: "color-mix(in srgb, var(--app-primary) 28%, var(--app-border))",
                    boxShadow: "inset 3px 0 0 var(--app-primary)"
                  }
                : undefined
            }
          >
            <span className="app-nav-icon" aria-hidden="true">
              <Icon />
            </span>
            <span className="app-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname() ?? "/dashboard";
  const compact = nav.slice(0, 5);

  return (
    <nav className="flex max-w-full gap-1 overflow-x-auto lg:hidden" aria-label="Mobile navigation">
      {compact.map((item) => {
        const active = isActiveRoute(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="app-mobile-nav-link"
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
            style={
              active
                ? {
                    background: "var(--app-primary-soft)",
                    color: "var(--app-primary)",
                    borderColor: "color-mix(in srgb, var(--app-primary) 28%, var(--app-border))"
                  }
                : undefined
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
