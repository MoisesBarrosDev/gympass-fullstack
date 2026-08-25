"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/primitives";
import { api } from "@/lib/api-client";
import type { User } from "@/lib/domain";
import { AuthIsland } from "@/features/auth/auth-island";
import { DashboardIsland } from "@/features/dashboard/dashboard-island";

export function GympassApplication() {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        if (!localStorage.getItem("accessToken")) return;
        setUser(await api<User>("/me"));
      } catch {
        localStorage.removeItem("accessToken");
      } finally {
        setBooting(false);
      }
    }
    restoreSession();
  }, []);

  if (booting)
    return (
      <div className="splash">
        <Logo />
      </div>
    );
  if (!user) return <AuthIsland onAuthenticated={setUser} />;
  return <DashboardIsland user={user} onLogout={() => setUser(null)} />;
}
