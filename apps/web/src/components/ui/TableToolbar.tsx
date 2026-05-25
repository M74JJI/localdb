"use client";

export function TableToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  totalRows,
  filteredRows,
  placeholder = "Search..."
}: {
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  totalRows: number;
  filteredRows: number;
  placeholder?: string;
}) {
  return (
    <div className="app-card mb-3 flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="app-input max-w-xl"
          placeholder={placeholder}
          aria-label="Search table"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
          Showing <span className="font-semibold" style={{ color: "var(--app-text)" }}>{filteredRows}</span> of{" "}
          <span className="font-semibold" style={{ color: "var(--app-text)" }}>{totalRows}</span>
        </p>

        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--app-text-muted)" }}>
          Rows
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="app-select w-24"
            aria-label="Rows per page"
          >
            {[10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export function TablePagination({
  page,
  totalPages,
  start,
  end,
  filteredRows,
  onPageChange
}: {
  page: number;
  totalPages: number;
  start: number;
  end: number;
  filteredRows: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
        {filteredRows === 0 ? "No rows" : `Showing ${start + 1}-${end} of ${filteredRows}`}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="app-button app-button-secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>

        <span className="app-kbd">
          Page {totalPages === 0 ? 0 : page} / {totalPages}
        </span>

        <button
          type="button"
          className="app-button app-button-secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
