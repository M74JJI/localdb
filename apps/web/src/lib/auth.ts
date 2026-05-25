import { redirect } from "next/navigation";
import { apiGet } from "./server-api";

export type CurrentUser = { id: string; email: string; role: string };

export async function getCurrentUser() {
  const data = await apiGet<{ user: CurrentUser | null }>("/api/auth/me").catch(() => ({ user: null }));
  return data.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getSetupStatus() {
  return apiGet<{ initialized: boolean; metadataDbReady: boolean }>("/api/setup/status").catch(() => ({
    initialized: false,
    metadataDbReady: false
  }));
}
