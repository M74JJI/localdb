import type { ReactNode } from "react";

export function DataTable({ columns, children }: { columns: string[]; children: ReactNode }) {
  return (
    <div className="app-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="app-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
