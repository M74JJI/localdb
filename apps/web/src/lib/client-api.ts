function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function isLocalhostUrl(value: string) {
  return value.includes("://localhost") || value.includes("://127.0.0.1");
}

export function getBrowserApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (typeof window === "undefined") {
    return configured ? trimTrailingSlash(configured) : "";
  }

  if (configured && !isLocalhostUrl(configured)) {
    return trimTrailingSlash(configured);
  }

  const protocol = window.location.protocol || "http:";
  const host = window.location.hostname;

  return `${protocol}//${host}:4000`;
}

function buildUrl(path: string) {
  const baseUrl = getBrowserApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export async function browserApiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });

  return parseResponse<T>(response);
}

export async function browserApiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return parseResponse<T>(response);
}
