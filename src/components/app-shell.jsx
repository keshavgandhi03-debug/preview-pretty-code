import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Megaphone, BellRing, BarChart3, Trophy,
  Bell, Settings, ChevronRight, Users, Menu, X, LogOut, GitBranch, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth";

import logoUrl from "@/assets/collegewollege-logo.png";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/follow-ups", label: "Follow-ups", icon: BellRing },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/pipeline", label: "Pipeline", icon: GitBranch },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/team", label: "Team", icon: Trophy },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/admin", label: "Admin Panel", icon: Shield },
];

function SidebarContent({ pathname, user, onNavigate }) {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border bg-brand-deep px-4">
        <img src={logoUrl} alt="CollegeWollege" className="h-8 w-auto shrink-0" />
        <div className="border-l border-white/15 pl-2.5 leading-tight">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--brand-yellow)]">Counsellor</div>
          <div className="text-[11px] text-white/70">Panel</div>
        </div>
      </div>

      <nav aria-label="Main navigation" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 scrollbar-thin">
        <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/50">Workspace</div>
        {NAV.map((n) => {
          const active = n.exact ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + "/");
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{n.label}</span>
              {active ? <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--brand-yellow)] text-xs font-semibold text-[color:var(--brand-deep)]">
            {user?.initials || "KG"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.name || "Keshav Gandhi"}</div>
            <div className="flex items-center gap-1 text-[11px] text-sidebar-foreground/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online · {user?.role || "Counsellor"}
            </div>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={async () => { await signOut(); navigate({ to: "/login", replace: true }); }}
            className="rounded-md p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export function AppShell({ children, title, breadcrumbs, headerActions }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { ready, user } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login", replace: true });
  }, [ready, user, navigate]);

  if (ready && !user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-md p-1.5 text-white/70 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent pathname={pathname} user={user} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="rounded-md p-2 hover:bg-muted lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            {breadcrumbs ? (
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {breadcrumbs.map((b, i) => (
                  <span key={`${b.label}-${i}`} className="flex items-center gap-1.5">
                    {b.to ? <Link to={b.to} className="hover:text-foreground">{b.label}</Link> : <span>{b.label}</span>}
                    {i < breadcrumbs.length - 1 ? <ChevronRight className="h-3 w-3" /> : null}
                  </span>
                ))}
              </nav>
            ) : null}
            {title ? <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">{title}</h1> : null}
          </div>

          {headerActions}

          <button className="relative rounded-md p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <div className="hidden items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 md:flex">
            <Users className="h-3.5 w-3.5" /> 6 counsellors live
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
