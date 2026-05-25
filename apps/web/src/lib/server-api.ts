import "server-only";

import { cookies } from "next/headers";

export function getApiBaseUrl() {
  return process.env.LOCALDB_HUB_INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

export async function apiGet<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const init: RequestInit = {
    cache: "no-store"
  };

  if (cookieHeader) {
    init.headers = {
      cookie: cookieHeader
    };
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, init);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
