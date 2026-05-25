"use client";
import { useState } from "react";
import { browserApiPost } from "@/lib/client-api";
export function RestoreAction({ backupId }: { backupId: string }) {
  const [message, setMessage] = useState("");
  async function restore() {
    setMessage("");
    try { const result = await browserApiPost(`/api/backups/${backupId}/restore`, {}); setMessage(JSON.stringify(result, null, 2)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unknown error"); }
  }
  return <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-xl font-semibold">Restore</h2><p className="mt-2 text-sm text-zinc-400">This queues a restore job.</p><button onClick={restore} className="mt-4 rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950">Restore backup</button>{message ? <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-zinc-300">{message}</pre> : null}</div>;
}
