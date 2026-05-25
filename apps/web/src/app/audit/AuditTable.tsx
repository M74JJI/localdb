"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { TablePagination, TableToolbar } from "@/components/ui/TableToolbar";

export type AuditRow = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadataJson: string;
  createdAt: string;
  actor: { email: string; role: string } | null;
};

function pretty(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value || "{}";
  }
}

function rowText(row: AuditRow) {
  return [
    row.action,
    row.targetType,
    row.targetId,
    row.metadataJson,
    row.createdAt,
    row.actor?.email,
    row.actor?.role
  ].filter(Boolean).join(" ").toLowerCase();
}

export function AuditTable({ events }: { events: AuditRow[] }) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;
    return events.filter((row) => rowText(row).includes(query));
  }, [events, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, filtered.length);
  const rows = filtered.slice(start, end);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updatePageSize(value: number) {
    setPageSize(value);
    setPage(1);
  }

  if (events.length === 0) {
    return <EmptyState title="No audit events yet" description="Security-sensitive actions will appear here." />;
  }

  return (
    <>
      <TableToolbar
        search={search}
        onSearchChange={updateSearch}
        pageSize={pageSize}
        onPageSizeChange={updatePageSize}
        totalRows={events.length}
        filteredRows={filtered.length}
        placeholder="Search audit events by actor, action, target, metadata, or date..."
      />

      {filtered.length === 0 ? (
        <EmptyState title="No matching audit events" description="Change the search query or clear the search field." />
      ) : (
        <>
          <DataTable columns={["Time", "Actor", "Action", "Target", "Metadata"]}>
            {rows.map((event) => (
              <tr key={event.id}>
                <td className="whitespace-nowrap" style={{ color: "var(--app-text-muted)" }}>{new Date(event.createdAt).toLocaleString()}</td>
                <td>{event.actor?.email ?? "system"}</td>
                <td><span className="app-kbd" style={{ color: "var(--app-primary)" }}>{event.action}</span></td>
                <td>
                  <span>{event.targetType ?? "-"}</span>
                  {event.targetId ? <span className="block max-w-48 truncate font-mono text-xs" style={{ color: "var(--app-text-subtle)" }}>{event.targetId}</span> : null}
                </td>
                <td>
                  <pre className="app-code max-w-md overflow-auto p-3 text-xs leading-5">{pretty(event.metadataJson)}</pre>
                </td>
              </tr>
            ))}
          </DataTable>

          <TablePagination page={safePage} totalPages={totalPages} start={start} end={end} filteredRows={filtered.length} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
