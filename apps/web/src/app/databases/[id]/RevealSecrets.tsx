"use client";

import { useState } from "react";
import { SecretValue } from "@/components/ui/SecretValue";
import { browserApiGet } from "@/lib/client-api";

type Secret = { id: string; name: string; value: string | null };

export function RevealSecrets({ instanceId }: { instanceId: string }) {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [error, setError] = useState("");

  async function reveal() {
    setError("");

    try {
      const result = await browserApiGet<{ secrets: Secret[] }>(`/api/instances/${instanceId}/secrets`);
      setSecrets(result.secrets);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown error");
    }
  }

  return (
    <div className="app-card mt-5 p-6">
      <h2 className="text-xl font-semibold">Secrets</h2>
      <p className="mt-1 text-sm" style={{ color: "var(--app-text-muted)" }}>Credential reveals are audited.</p>
      <button onClick={reveal} className="app-button app-button-secondary mt-4">Reveal credentials</button>

      {secrets.length ? (
        <div className="mt-4 grid gap-3">
          {secrets.map((secret) => (
            <div key={secret.id}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text-subtle)" }}>{secret.name}</p>
              <SecretValue value={secret.value ?? ""} />
            </div>
          ))}
        </div>
      ) : null}

      {error ? <div className="app-card-muted mt-4 p-3 text-sm" style={{ color: "var(--app-danger)" }}>{error}</div> : null}
    </div>
  );
}
