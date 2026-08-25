"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Logo } from "@/components/ui/primitives";
import { api } from "@/lib/api-client";
import type { DashboardView, User } from "@/lib/domain";

const DiscoveryIsland = dynamic(
  () =>
    import("@/features/discovery/discovery-island").then(
      (module) => module.DiscoveryIsland,
    ),
  { loading: FeatureLoader },
);
const MemberCheckInsIsland = dynamic(
  () =>
    import("@/features/check-ins/member-check-ins-island").then(
      (module) => module.MemberCheckInsIsland,
    ),
  { loading: FeatureLoader },
);
const AdminCheckInsIsland = dynamic(
  () =>
    import("@/features/check-ins/admin-check-ins-island").then(
      (module) => module.AdminCheckInsIsland,
    ),
  { loading: FeatureLoader },
);
const AdminGymsIsland = dynamic(
  () =>
    import("@/features/gyms/admin-gyms-island").then(
      (module) => module.AdminGymsIsland,
    ),
  { loading: FeatureLoader },
);

export function DashboardIsland({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [view, setView] = useState<DashboardView>("discover");

  async function logout() {
    await api("/sessions/logout", { method: "POST" }).catch(() => undefined);
    localStorage.removeItem("accessToken");
    onLogout();
  }

  return (
    <div className="app-shell">
      <aside>
        <Logo />
        <Navigation view={view} setView={setView} role={user.role} />
        <Profile user={user} logout={logout} />
      </aside>
      <header>
        <Logo />
        <div className="avatar">{user.name[0]}</div>
      </header>
      <main className="content">
        {view === "discover" && <DiscoveryIsland user={user} />}{" "}
        {view === "history" &&
          (user.role === "ADMIN" ? (
            <AdminCheckInsIsland />
          ) : (
            <MemberCheckInsIsland />
          ))}{" "}
        {view === "manage" && user.role === "ADMIN" && <AdminGymsIsland />}
      </main>
      <div className="mobile-nav">
        <Navigation view={view} setView={setView} role={user.role} />
        <button onClick={logout}>
          <Icon name="logout" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}

function Navigation({
  view,
  setView,
  role,
}: {
  view: DashboardView;
  setView: (view: DashboardView) => void;
  role: User["role"];
}) {
  const items: Array<[DashboardView, IconName, string]> = [
    ["discover", "search", "Descobrir"],
    ["history", "clock", role === "ADMIN" ? "Check-ins" : "Jornada"],
  ];
  if (role === "ADMIN") items.push(["manage", "building", "Academias"]);
  return (
    <nav>
      {items.map(([itemView, icon, title]) => (
        <button
          key={itemView}
          className={view === itemView ? "active" : ""}
          onClick={() => setView(itemView)}
        >
          <Icon name={icon} />
          <span>{title}</span>
        </button>
      ))}
    </nav>
  );
}

function Profile({ user, logout }: { user: User; logout: () => void }) {
  return (
    <div className="profile">
      <div className="avatar">{user.name[0]}</div>
      <div>
        <strong>{user.name}</strong>
        <span>{user.email}</span>
      </div>
      <button onClick={logout} aria-label="Sair">
        <Icon name="logout" />
      </button>
    </div>
  );
}

function FeatureLoader() {
  return <div className="loader" />;
}
