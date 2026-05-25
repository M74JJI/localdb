"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TablePagination, TableToolbar } from "@/components/ui/TableToolbar";

export type BackupRow = {
  id: string;
  type: string;
  status: string;
  sizeBytes: number | null;
  createdAt: string;
  instance: { id: string; name: string; engine: string };
};

function formatBytes(value: number | null) {
  if (value === null || value === undefined) return "-";
  if (value === 0) return "0 bytes";
  if (value < 1024) return `${value} bytes`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function rowText(row: BackupRow) {
  return [row.instance.name, row.instance.engine, row.type, row.status, row.sizeBytes, row.createdAt].filter(Boolean).join(" ").toLowerCase();
}

export function BackupsTable({ backups }: { backups: BackupRow[] }) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return backups;
    return backups.filter((row) => rowText(row).includes(query));
  }, [backups, search]);

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

  if (backups.length === 0) {
    return <EmptyState title="No backups yet" description="Open an instance and run Backup to create a restore point." />;
  }

  return (
    <>
      <TableToolbar
        search={search}
        onSearchChange={updateSearch}
        pageSize={pageSize}
        onPageSizeChange={updatePageSize}
        totalRows={backups.length}
        filteredRows={filtered.length}
        placeholder="Search backups by instance, engine, type, status, or date..."
      />

      {filtered.length === 0 ? (
        <EmptyState title="No matching backups" description="Change the search query or clear the search field." />
      ) : (
        <>
          <DataTable columns={["Instance", "Type", "Status", "Size", "Created"]}>
            {rows.map((backup) => (
              <tr key={backup.id}>
                <td>
                  <Link href={`/backups/${backup.id}` as any} className="font-semibold" style={{ color: "var(--app-primary)" }}>
                    {backup.instance.name}
                  </Link>
                  <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>{backup.instance.engine}</p>
                </td>
                <td className="font-mono text-xs" style={{ color: "var(--app-text-muted)" }}>{backup.type}</td>
                <td><StatusBadge status={backup.status} /></td>
                <td>{formatBytes(backup.sizeBytes)}</td>
                <td className="whitespace-nowrap" style={{ color: "var(--app-text-muted)" }}>{new Date(backup.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </DataTable>

          <TablePagination page={safePage} totalPages={totalPages} start={start} end={end} filteredRows={filtered.length} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
