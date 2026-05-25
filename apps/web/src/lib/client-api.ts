export function getBrowserApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

export async function browserApiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getBrowserApiBaseUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function browserApiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getBrowserApiBaseUrl()}${path}`, {
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}
