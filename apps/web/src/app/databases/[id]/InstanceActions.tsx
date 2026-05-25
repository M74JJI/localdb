"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { browserApiPost } from "@/lib/client-api";

const actions = [
  { label: "Start", path: "start" },
  { label: "Stop", path: "stop" },
  { label: "Restart", path: "restart" },
  { label: "Backup", path: "backup", special: "backup" },
  { label: "Delete container", path: "delete-container", danger: true }
];

type Result = { job?: { type: string; status: string; message: string | null } };

export function InstanceActions({ instanceId }: { instanceId: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function runAction(path: string, special?: string) {
    setError("");
    setResult(null);

    try {
      const endpoint = special === "backup" ? `/api/instances/${instanceId}/backup` : `/api/instances/${instanceId}/${path}`;
      setResult(await browserApiPost<Result>(endpoint, {}));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown error");
    }
  }

  return (
    <div className="app-card mt-5 p-6">
      <h2 className="text-xl font-semibold">Actions</h2>
      <p className="mt-1 text-sm" style={{ color: "var(--app-text-muted)" }}>Actions create background jobs processed by the worker.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => runAction(action.path, action.special)}
            className={action.danger ? "app-button app-button-danger" : action.special ? "app-button app-button-primary" : "app-button app-button-secondary"}
          >
            {action.label}
          </button>
        ))}
      </div>

      {result?.job ? (
        <div className="app-card-muted mt-4 flex flex-wrap items-center gap-3 p-3 text-sm">
          <span style={{ color: "var(--app-text-muted)" }}>Queued</span>
          <span className="font-mono">{result.job.type}</span>
          <StatusBadge status={result.job.status} />
        </div>
      ) : null}

      {error ? <div className="app-card-muted mt-4 p-3 text-sm" style={{ color: "var(--app-danger)" }}>{error}</div> : null}
    </div>
  );
}
