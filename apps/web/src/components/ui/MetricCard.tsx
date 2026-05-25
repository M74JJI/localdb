import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  helper
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
}) {
  return (
    <div className="app-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text-subtle)" }}>
        {label}
      </p>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {helper ? (
        <div className="mt-2 text-sm leading-5" style={{ color: "var(--app-text-muted)" }}>
          {helper}
        </div>
      ) : null}
    </div>
  );
}
