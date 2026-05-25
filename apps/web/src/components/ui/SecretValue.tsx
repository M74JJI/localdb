"use client";

import { useState } from "react";
import { CopyButton } from "./CopyButton";

function mask(value: string) {
  try {
    const url = new URL(value);
    if (url.password) url.password = "••••••••";
    return url.toString();
  } catch {
    return value.replace(/:(?:[^:@/]+)@/g, ":••••••••@");
  }
}

export function SecretValue({ value }: { value: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-start">
      <code className="app-code min-w-0 flex-1 break-all px-3 py-2 text-xs leading-5">
        {revealed ? value : mask(value)}
      </code>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={() => setRevealed((current) => !current)} className="app-button app-button-secondary">
          {revealed ? "Hide" : "Reveal"}
        </button>
        <CopyButton value={value} />
      </div>
    </div>
  );
}
