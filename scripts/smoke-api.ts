const baseUrl = process.env.LOCALDB_HUB_SMOKE_API_URL ?? "http://localhost:4000";

async function request(path: string) {
  const response = await fetch(`${baseUrl}${path}`);
  const text = await response.text();
  let json: unknown = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: response.status, json };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

console.log(`[smoke-api] Testing ${baseUrl}`);
const health = await request("/health");
assert(health.status === 200, `/health expected 200, got ${health.status}`);
console.log("[smoke-api] /health ok");
const system = await request("/api/system/health");
assert(system.status === 200, `/api/system/health expected 200, got ${system.status}`);
console.log("[smoke-api] /api/system/health ok");
const setup = await request("/api/setup/status");
assert(setup.status === 200, `/api/setup/status expected 200, got ${setup.status}`);
console.log("[smoke-api] /api/setup/status ok");
const protectedRoute = await request("/api/instances");
assert(protectedRoute.status === 401, `/api/instances unauthenticated expected 401, got ${protectedRoute.status}`);
console.log("[smoke-api] protected route rejects unauthenticated requests");
console.log("[smoke-api] PASS");
