"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TablePagination, TableToolbar } from "@/components/ui/TableToolbar";

export type JobRow = {
  id: string;
  type: string;
  status: string;
  progress: number;
  message: string | null;
  createdAt: string;
};

function rowText(row: JobRow) {
  return [row.type, row.status, row.progress, row.message, row.createdAt].filter(Boolean).join(" ").toLowerCase();
}

export function JobsTable({ jobs }: { jobs: JobRow[] }) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return jobs;
    return jobs.filter((row) => rowText(row).includes(query));
  }, [jobs, search]);

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

  if (jobs.length === 0) {
    return <EmptyState title="No jobs yet" description="Create a database or backup to generate the first job." />;
  }

  return (
    <>
      <TableToolbar
        search={search}
        onSearchChange={updateSearch}
        pageSize={pageSize}
        onPageSizeChange={updatePageSize}
        totalRows={jobs.length}
        filteredRows={filtered.length}
        placeholder="Search jobs by type, status, message, or date..."
      />

      {filtered.length === 0 ? (
        <EmptyState title="No matching jobs" description="Change the search query or clear the search field." />
      ) : (
        <>
          <DataTable columns={["Type", "Status", "Progress", "Message", "Created"]}>
            {rows.map((job) => (
              <tr key={job.id}>
                <td>
                  <Link href={`/jobs/${job.id}` as any} className="font-mono text-sm" style={{ color: "var(--app-primary)" }}>
                    {job.type}
                  </Link>
                </td>
                <td><StatusBadge status={job.status} /></td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-28 overflow-hidden rounded-full" style={{ background: "var(--app-surface-muted)" }}>
                      <div className="h-full rounded-full" style={{ width: `${job.progress}%`, background: "var(--app-primary)" }} />
                    </div>
                    <span className="font-mono text-xs" style={{ color: "var(--app-text-muted)" }}>{job.progress}%</span>
                  </div>
                </td>
                <td style={{ color: "var(--app-text-muted)" }}>{job.message ?? "-"}</td>
                <td className="whitespace-nowrap" style={{ color: "var(--app-text-muted)" }}>{new Date(job.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </DataTable>

          <TablePagination page={safePage} totalPages={totalPages} start={start} end={end} filteredRows={filtered.length} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
