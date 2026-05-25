type Tone = "success" | "warning" | "danger" | "info" | "neutral";

function toneForStatus(status: string): Tone {
  const value = status.toUpperCase();

  if (["OK", "READY", "RUNNING", "SUCCEEDED", "RESTORED"].includes(value)) return "success";
  if (["WAITING_DOCKER", "QUEUED", "PENDING", "BACKING_UP", "RESTORING", "STARTING", "HEALTHCHECKING", "PULLING_IMAGE"].includes(value)) return "warning";
  if (["FAILED", "ERROR", "MISSING", "DELETED"].includes(value)) return "danger";
  if (["STOPPED", "SKIPPED", "DISABLED"].includes(value)) return "neutral";
  return "info";
}

const styles: Record<Tone, React.CSSProperties> = {
  success: {
    color: "var(--app-success)",
    background: "color-mix(in srgb, var(--app-success) 11%, transparent)",
    borderColor: "color-mix(in srgb, var(--app-success) 32%, var(--app-border))"
  },
  warning: {
    color: "var(--app-warning)",
    background: "color-mix(in srgb, var(--app-warning) 12%, transparent)",
    borderColor: "color-mix(in srgb, var(--app-warning) 38%, var(--app-border))"
  },
  danger: {
    color: "var(--app-danger)",
    background: "color-mix(in srgb, var(--app-danger) 11%, transparent)",
    borderColor: "color-mix(in srgb, var(--app-danger) 34%, var(--app-border))"
  },
  info: {
    color: "var(--app-info)",
    background: "color-mix(in srgb, var(--app-info) 11%, transparent)",
    borderColor: "color-mix(in srgb, var(--app-info) 32%, var(--app-border))"
  },
  neutral: {
    color: "var(--app-text-muted)",
    background: "var(--app-surface-subtle)",
    borderColor: "var(--app-border)"
  }
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = toneForStatus(status);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={styles[tone]}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? status.replaceAll("_", " ")}
    </span>
  );
}
