"use client";

import { useRouter } from "next/navigation";
import { browserApiPost } from "@/lib/client-api";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await browserApiPost("/api/auth/logout", {});
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={logout} className="app-button app-button-secondary">
      Logout
    </button>
  );
}
