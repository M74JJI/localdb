"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TablePagination, TableToolbar } from "@/components/ui/TableToolbar";

export type DatabaseRow = {
  id: string;
  name: string;
  engine: string;
  version: string;
  status: string;
  host: string | null;
  primaryPort: number | null;
  databaseName: string | null;
  username: string | null;
};

function rowText(row: DatabaseRow) {
  return [
    row.name,
    row.engine,
    row.version,
    row.status,
    row.host,
    row.primaryPort,
    row.databaseName,
    row.username
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function DatabasesTable({ instances }: { instances: DatabaseRow[] }) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return instances;
    return instances.filter((row) => rowText(row).includes(query));
  }, [instances, search]);

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

  if (instances.length === 0) {
    return (
      <EmptyState
        title="No database instances"
        description="Create a SQLite database to validate the local workflow."
        action={<Link href="/databases/new" className="app-button app-button-primary">Create first database</Link>}
      />
    );
  }

  return (
    <>
      <TableToolbar
        search={search}
        onSearchChange={updateSearch}
        pageSize={pageSize}
        onPageSizeChange={updatePageSize}
        totalRows={instances.length}
        filteredRows={filtered.length}
        placeholder="Search databases by name, engine, status, host, database, or user..."
      />

      {filtered.length === 0 ? (
        <EmptyState title="No matching databases" description="Change the search query or clear the search field." />
      ) : (
        <>
          <DataTable columns={["Instance", "Engine", "Status", "Endpoint", "Database", "User"]}>
            {rows.map((instance) => (
              <tr key={instance.id}>
                <td>
                  <Link href={`/databases/${instance.id}` as any} className="font-semibold" style={{ color: "var(--app-primary)" }}>
                    {instance.name}
                  </Link>
                </td>
                <td><span className="app-kbd">{instance.engine}:{instance.version}</span></td>
                <td><StatusBadge status={instance.status} /></td>
                <td className="font-mono text-xs" style={{ color: "var(--app-text-muted)" }}>
                  {instance.host ?? "-"}{instance.primaryPort ? `:${instance.primaryPort}` : ""}
                </td>
                <td>{instance.databaseName ?? "-"}</td>
                <td style={{ color: "var(--app-text-muted)" }}>{instance.username ?? "-"}</td>
              </tr>
            ))}
          </DataTable>

          <TablePagination
            page={safePage}
            totalPages={totalPages}
            start={start}
            end={end}
            filteredRows={filtered.length}
            onPageChange={setPage}
          />
        </>
      )}
    </>
  );
}
