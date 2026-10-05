import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Palette, UserRound, Users, GitBranch, CreditCard, Upload, RefreshCw, FilePenLine, Archive } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth";
import { useSettings } from "@/lib/settings-store";
import { OrganizationSettings } from "@/components/settings/organization-settings";
import { CustomizationSettings } from "@/components/settings/customization-settings";
import { UserProfileSettings } from "@/components/settings/user-profile-settings";
import { TeamsSettings } from "@/components/settings/teams-settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CollegeWollege Counsellor Panel" },
      { name: "description", content: "Manage organization, calling statuses, profile, teams and workspace preferences." },
      { property: "og:title", content: "Settings — CollegeWollege Counsellor Panel" },
      { property: "og:description", content: "Manage organization, calling statuses, profile, teams and workspace preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const MENU = [
  ["organization", "Organization", Building2],
  ["customization", "Customization", Palette],
  ["profile", "User Profile", UserRound],
  ["teams", "Teams", Users],
  ["distribution", "Lead Distribution", GitBranch],
  ["subscription", "Subscription", CreditCard],
  ["import", "Lead Import", Upload],
  ["update", "Lead Update", FilePenLine],
  ["restore", "Lead Restore", Archive],
];

function SettingsPage() {
  const { user } = useSession();
  const settings = useSettings();
  const role = user?.role || settings.profile.role;
  const [section, setSection] = useState("organization");
  const current = MENU.find(([id]) => id === section) || MENU[0];

  return (
    <AppShell title="Settings" breadcrumbs={[{ label: "Home", to: "/" }, { label: "Settings" }]}>
      <div className="flex min-h-full flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-border bg-muted/20 p-3 lg:w-56 lg:border-b-0 lg:border-r lg:p-4">
          <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Settings</div>
          <nav aria-label="Settings sections" className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {MENU.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setSection(id)} aria-current={section === id ? "page" : undefined} className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors ${section === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{label}</span></button>)}
          </nav>
        </aside>
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace settings</p><h2 className="mt-1 text-xl font-semibold tracking-tight">{current[1]}</h2><p className="mt-1 text-sm text-muted-foreground">{section === "organization" ? "Keep your organization details and calling rules up to date." : section === "customization" ? "Control the outcomes counsellors use while working leads." : section === "profile" ? "Manage your personal details and notification preferences." : section === "teams" ? "Manage counsellors, team ownership and distribution." : "This settings area is ready for a future workflow."}</p></div><Badge variant="outline" className="text-[10px]">{role}</Badge>
          </div>
          {section === "organization" ? <OrganizationSettings settings={settings} role={role} /> : null}
          {section === "customization" ? <CustomizationSettings settings={settings} role={role} /> : null}
          {section === "profile" ? <UserProfileSettings settings={settings} role={role} /> : null}
          {section === "teams" ? <TeamsSettings settings={settings} role={role} /> : null}
          {!['organization', 'customization', 'profile', 'teams'].includes(section) ? <ComingSoon label={current[1]} /> : null}
        </div>
      </div>
    </AppShell>
  );
}

function ComingSoon({ label }) {
  return <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center"><div><RefreshCw className="mx-auto h-6 w-6 text-muted-foreground" /><h3 className="mt-3 text-sm font-semibold">{label} is not configured yet</h3><p className="mt-1 max-w-sm text-xs text-muted-foreground">This option stays visible while its workflow is prepared. Your existing lead data is unchanged.</p></div></div>;
}