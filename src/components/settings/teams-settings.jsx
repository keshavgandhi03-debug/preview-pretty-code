import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, RefreshCw, Plus, Pencil, Eye, Users, Phone, Mail, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsCard, Field, EmptyState, StatCard, ConfirmDialog } from "@/components/settings/settings-ui";
import {
  DISTRIBUTION_METHODS, ROLES, memberFullName, initialsOf, saveMember, saveTeam, setMemberStatus, setTeamActive,
} from "@/lib/settings-store";
import { CLIENTS, PROGRAMS } from "@/lib/crm-data";

const MEMBER_STATUSES = ["Active", "Inactive", "Suspended"];
const TEAM_STATUSES = ["Active", "Inactive"];
const emptyMember = (settings) => ({
  firstName: "", lastName: "", phone: "+91 ", email: "", employeeId: "", role: "Counsellor",
  team: settings.teams[0]?.name || "", reportsTo: settings.members[0] ? memberFullName(settings.members[0]) : "",
  status: "Active", callingEnabled: true, liveTracking: true,
});
const emptyTeam = (settings) => ({
  name: "", code: "", description: "", manager: settings.members[0] ? memberFullName(settings.members[0]) : "",
  members: [], campaigns: [], programs: [], regions: [], active: true, distribution: "Round Robin", maxLeads: 100,
});

export function TeamsSettings({ settings, role }) {
  const canEdit = role === "Admin" || role === "Super Admin";
  const [memberQuery, setMemberQuery] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [memberFilters, setMemberFilters] = useState({ team: "all", role: "all", status: "all" });
  const [teamStatus, setTeamStatus] = useState("all");
  const [memberDraft, setMemberDraft] = useState(null);
  const [teamDraft, setTeamDraft] = useState(null);
  const [viewTeam, setViewTeam] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const members = useMemo(() => settings.members.filter((m) => {
    const text = `${memberFullName(m)} ${m.email} ${m.phone}`.toLowerCase();
    return (!memberQuery || text.includes(memberQuery.toLowerCase()))
      && (memberFilters.team === "all" || m.team === memberFilters.team)
      && (memberFilters.role === "all" || m.role === memberFilters.role)
      && (memberFilters.status === "all" || m.status === memberFilters.status);
  }), [settings.members, memberQuery, memberFilters]);

  const teams = useMemo(() => settings.teams.filter((t) =>
    (!teamQuery || `${t.name} ${t.code} ${t.manager}`.toLowerCase().includes(teamQuery.toLowerCase()))
    && (teamStatus === "all" || (t.active ? "Active" : "Inactive") === teamStatus),
  ), [settings.teams, teamQuery, teamStatus]);

  const commitMember = () => {
    if (!memberDraft.firstName.trim() || !memberDraft.lastName.trim() || !memberDraft.email.trim()) {
      toast.error("First name, last name and email are required.");
      return;
    }
    saveMember(memberDraft);
    setMemberDraft(null);
    toast.success(memberDraft.id ? "Member updated" : "Member added");
  };

  const commitTeam = () => {
    if (!teamDraft.name.trim() || !teamDraft.code.trim() || !teamDraft.manager) {
      toast.error("Team name, code and manager are required.");
      return;
    }
    saveTeam(teamDraft);
    setTeamDraft(null);
    toast.success(teamDraft.id ? "Team updated" : "Team created");
  };

  const confirmAction = () => {
    if (!confirm) return;
    if (confirm.kind === "member") setMemberStatus(confirm.id, confirm.next);
    if (confirm.kind === "team") setTeamActive(confirm.id, confirm.next);
    setConfirm(null);
    toast.success("Status updated");
  };

  return (
    <Tabs defaultValue="members" className="space-y-4">
      <TabsList>
        <TabsTrigger value="members">Team Members</TabsTrigger>
        <TabsTrigger value="teams">Teams</TabsTrigger>
      </TabsList>

      <TabsContent value="members" className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total members" value={settings.members.length} />
          <StatCard label="Active" value={settings.members.filter((m) => m.status === "Active").length} tone="green" />
          <StatCard label="Calling enabled" value={settings.members.filter((m) => m.callingEnabled).length} />
          <StatCard label="Teams" value={settings.teams.length} />
        </div>
        <SettingsCard
          title="Team members"
          description="Manage access, calling permissions and reporting relationships."
          action={<Button size="sm" disabled={!canEdit} onClick={() => setMemberDraft(emptyMember(settings))}><Plus className="mr-1 h-3.5 w-3.5" />Add Member</Button>}
        >
          <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px_150px_150px_auto]">
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input aria-label="Search team members" value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} placeholder="Search members…" className="pl-9" /></div>
            <Select value={memberFilters.team} onValueChange={(v) => setMemberFilters({ ...memberFilters, team: v })}><SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger><SelectContent><SelectItem value="all">All teams</SelectItem>{settings.teams.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select>
            <Select value={memberFilters.role} onValueChange={(v) => setMemberFilters({ ...memberFilters, role: v })}><SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
            <Select value={memberFilters.status} onValueChange={(v) => setMemberFilters({ ...memberFilters, status: v })}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{MEMBER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            <Button variant="outline" size="icon" aria-label="Refresh members" onClick={() => { setMemberQuery(""); setMemberFilters({ team: "all", role: "all", status: "all" }); }}><RefreshCw className="h-4 w-4" /></Button>
          </div>
          {members.length === 0 ? <EmptyState title="No members found" hint="Try changing the search or filters." /> : <div className="grid gap-2 lg:grid-cols-2">{members.map((m) => <MemberCard key={m.id} member={m} canEdit={canEdit} onEdit={() => setMemberDraft({ ...m })} onStatus={() => setConfirm({ kind: "member", id: m.id, next: m.status === "Active" ? "Inactive" : "Active", label: memberFullName(m) })} />)}</div>}
        </SettingsCard>
      </TabsContent>

      <TabsContent value="teams" className="space-y-4">
        <SettingsCard title="Teams" description="Organize counsellors and control how leads are distributed." action={<Button size="sm" disabled={!canEdit} onClick={() => setTeamDraft(emptyTeam(settings))}><Plus className="mr-1 h-3.5 w-3.5" />Create Team</Button>}>
          <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input aria-label="Search teams" value={teamQuery} onChange={(e) => setTeamQuery(e.target.value)} placeholder="Search teams…" className="pl-9" /></div><Select value={teamStatus} onValueChange={setTeamStatus}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{TEAM_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          {teams.length === 0 ? <EmptyState title="No teams found" hint="Create a team or adjust the filters." /> : <div className="grid gap-3 lg:grid-cols-2">{teams.map((team) => <TeamCard key={team.id} team={team} canEdit={canEdit} onEdit={() => setTeamDraft({ ...team })} onView={() => setViewTeam(team)} onStatus={() => setConfirm({ kind: "team", id: team.id, next: !team.active, label: team.name })} />)}</div>}
        </SettingsCard>
      </TabsContent>

      <Sheet open={!!memberDraft} onOpenChange={(open) => !open && setMemberDraft(null)}><SheetContent className="w-full overflow-y-auto sm:max-w-md"><SheetHeader><SheetTitle>{memberDraft?.id ? "Edit member" : "Add member"}</SheetTitle><SheetDescription>Set the member's role, team and calling permissions.</SheetDescription></SheetHeader>{memberDraft && <MemberForm draft={memberDraft} setDraft={setMemberDraft} settings={settings} /> }<SheetFooter><Button variant="outline" onClick={() => setMemberDraft(null)}>Cancel</Button><Button onClick={commitMember}>{memberDraft?.id ? "Update Member" : "Add Member"}</Button></SheetFooter></SheetContent></Sheet>
      <Sheet open={!!teamDraft} onOpenChange={(open) => !open && setTeamDraft(null)}><SheetContent className="w-full overflow-y-auto sm:max-w-md"><SheetHeader><SheetTitle>{teamDraft?.id ? "Edit team" : "Create team"}</SheetTitle><SheetDescription>Define ownership, assignments and lead distribution.</SheetDescription></SheetHeader>{teamDraft && <TeamForm draft={teamDraft} setDraft={setTeamDraft} settings={settings} /> }<SheetFooter><Button variant="outline" onClick={() => setTeamDraft(null)}>Cancel</Button><Button onClick={commitTeam}>Save Team</Button></SheetFooter></SheetContent></Sheet>
      <Dialog open={!!viewTeam} onOpenChange={(open) => !open && setViewTeam(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{viewTeam?.name}</DialogTitle><DialogDescription>{viewTeam?.description || "Team performance and membership"}</DialogDescription></DialogHeader>{viewTeam && <TeamDetail team={viewTeam} settings={settings} />}</DialogContent></Dialog>
      <ConfirmDialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)} title={`${confirm?.next === false || confirm?.next === "Inactive" ? "Deactivate" : "Activate"} ${confirm?.label || "this item"}?`} description="Changing a status affects future assignments, while historical records remain unchanged." confirmLabel="Confirm" onConfirm={confirmAction} />
    </Tabs>
  );
}

function MemberCard({ member, canEdit, onEdit, onStatus }) {
  return <article className="rounded-lg border border-border p-3"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">{initialsOf(memberFullName(member))}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{memberFullName(member)}</h3><Badge variant={member.status === "Active" ? "secondary" : "outline"} className="text-[10px]">{member.status}</Badge></div><div className="mt-1 text-[11px] text-muted-foreground">{member.role} · {member.team || "No team"}</div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground"><span><Phone className="mr-1 inline h-3 w-3" />{member.phone}</span><span><Mail className="mr-1 inline h-3 w-3" />{member.email}</span></div><div className="mt-2 text-[11px] text-muted-foreground">Reports to {member.reportsTo || "—"}</div></div><div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canEdit} aria-label={`Edit ${memberFullName(member)}`} onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canEdit} aria-label={`Toggle ${memberFullName(member)} status`} onClick={onStatus}><ShieldCheck className="h-3.5 w-3.5" /></Button></div></div></article>;
}

function TeamCard({ team, canEdit, onEdit, onView, onStatus }) {
  return <article className="rounded-lg border border-border p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{team.name}</h3><Badge variant={team.active ? "secondary" : "outline"} className="text-[10px]">{team.active ? "Active" : "Inactive"}</Badge></div><p className="mt-1 text-[11px] text-muted-foreground">{team.code} · Manager: {team.manager || "—"}</p></div><Users className="h-4 w-4 text-muted-foreground" /></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><Metric value={team.members?.length || 0} label="Members" /><Metric value={team.activeCampaigns || team.campaigns?.length || 0} label="Campaigns" /><Metric value={team.assignedLeads || 0} label="Assigned leads" /></div><div className="mt-4 flex justify-end gap-2"><Button size="sm" variant="outline" onClick={onView}><Eye className="mr-1 h-3.5 w-3.5" />View</Button><Button size="sm" variant="outline" disabled={!canEdit} onClick={onEdit}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button><Button size="sm" variant="ghost" disabled={!canEdit} onClick={onStatus}>{team.active ? "Deactivate" : "Activate"}</Button></div></article>;
}
function Metric({ value, label }) { return <div className="rounded-md bg-muted/60 px-2 py-2"><div className="text-base font-semibold tabular-nums">{value}</div><div className="text-[10px] text-muted-foreground">{label}</div></div>; }
function MemberForm({ draft, setDraft, settings }) { const set = (key, value) => setDraft({ ...draft, [key]: value }); return <div className="space-y-4 px-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="First name" required><Input value={draft.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field><Field label="Last name" required><Input value={draft.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field><Field label="Phone"><Input value={draft.phone} onChange={(e) => set("phone", e.target.value)} /></Field><Field label="Email" required><Input type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} /></Field><Field label="Employee ID"><Input value={draft.employeeId} onChange={(e) => set("employeeId", e.target.value)} /></Field><Field label="Role"><Select value={draft.role} onValueChange={(v) => set("role", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></Field><Field label="Team"><Select value={draft.team || "none"} onValueChange={(v) => set("team", v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No team</SelectItem>{settings.teams.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select></Field><Field label="Reports to"><Select value={draft.reportsTo || "none"} onValueChange={(v) => set("reportsTo", v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No manager</SelectItem>{settings.members.map((m) => <SelectItem key={m.id} value={memberFullName(m)}>{memberFullName(m)}</SelectItem>)}</SelectContent></Select></Field></div><div className="divide-y divide-border"><SettingSwitch label="Active member" checked={draft.status === "Active"} onChange={(v) => set("status", v ? "Active" : "Inactive")} /><SettingSwitch label="Calling enabled" checked={draft.callingEnabled} onChange={(v) => set("callingEnabled", v)} /><SettingSwitch label="Live tracking" checked={draft.liveTracking} onChange={(v) => set("liveTracking", v)} /></div></div>; }
function TeamForm({ draft, setDraft, settings }) { const set = (key, value) => setDraft({ ...draft, [key]: value }); const toggle = (key, value) => set(key, draft[key].includes(value) ? draft[key].filter((x) => x !== value) : [...draft[key], value]); return <div className="space-y-4 px-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Team name" required><Input value={draft.name} onChange={(e) => set("name", e.target.value)} /></Field><Field label="Team code" required><Input value={draft.code} onChange={(e) => set("code", e.target.value.toUpperCase())} maxLength={6} /></Field><Field label="Team manager" required><Select value={draft.manager} onValueChange={(v) => set("manager", v)}><SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger><SelectContent>{settings.members.map((m) => <SelectItem key={m.id} value={memberFullName(m)}>{memberFullName(m)}</SelectItem>)}</SelectContent></Select></Field><Field label="Distribution method"><Select value={draft.distribution} onValueChange={(v) => set("distribution", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DISTRIBUTION_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></Field><Field label="Maximum leads per counsellor"><Input type="number" min="1" value={draft.maxLeads} onChange={(e) => set("maxLeads", Number(e.target.value))} /></Field><Field label="Description" className="sm:col-span-2"><Textarea rows={2} value={draft.description} onChange={(e) => set("description", e.target.value)} /></Field></div><Field label="Select members"><div className="flex flex-wrap gap-2">{settings.members.map((m) => <button key={m.id} type="button" aria-pressed={draft.members.includes(memberFullName(m))} onClick={() => toggle("members", memberFullName(m))} className={`rounded-full border px-2.5 py-1 text-[11px] ${draft.members.includes(memberFullName(m)) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{memberFullName(m)}</button>)}</div></Field><Field label="Assigned campaigns"><div className="flex flex-wrap gap-2">{CLIENTS.slice(0, 6).map((c) => <button key={c.name} type="button" aria-pressed={draft.campaigns.includes(c.name)} onClick={() => toggle("campaigns", c.name)} className={`rounded-full border px-2.5 py-1 text-[11px] ${draft.campaigns.includes(c.name) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{c.name}</button>)}</div></Field><Field label="Assigned programs"><div className="flex flex-wrap gap-2">{PROGRAMS.map((p) => <button key={p} type="button" aria-pressed={draft.programs.includes(p)} onClick={() => toggle("programs", p)} className={`rounded-full border px-2.5 py-1 text-[11px] ${draft.programs.includes(p) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{p}</button>)}</div></Field><SettingSwitch label="Active team" checked={draft.active} onChange={(v) => set("active", v)} /></div>; }
function SettingSwitch({ label, checked, onChange }) { return <div className="flex items-center justify-between gap-4 py-3"><span className="text-sm">{label}</span><Switch checked={checked} onCheckedChange={onChange} /></div>; }
function TeamDetail({ team, settings }) { const teamMembers = settings.members.filter((m) => team.members?.includes(memberFullName(m)) || m.team === team.name); return <div className="space-y-4"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric value={teamMembers.length} label="Members" /><Metric value={team.activeCampaigns || team.campaigns?.length || 0} label="Campaigns" /><Metric value={team.assignedLeads || 0} label="Assigned leads" /><Metric value={`${team.connectRate || 0}%`} label="Connect rate" /></div><div className="grid gap-4 sm:grid-cols-2"><div><div className="mb-2 text-xs font-semibold">Members</div><div className="space-y-2">{teamMembers.length ? teamMembers.map((m) => <div key={m.id} className="flex items-center justify-between rounded-md border border-border px-2.5 py-2 text-xs"><span>{memberFullName(m)}</span><span className="text-muted-foreground">{m.role}</span></div>) : <p className="text-xs text-muted-foreground">No members assigned.</p>}</div></div><div className="space-y-3 text-xs"><div><div className="font-semibold">Manager</div><div className="mt-1 text-muted-foreground">{team.manager || "—"}</div></div><div><div className="font-semibold">Campaigns</div><div className="mt-1 text-muted-foreground">{team.campaigns?.join(", ") || "None"}</div></div><div><div className="font-semibold">Programs and regions</div><div className="mt-1 text-muted-foreground">{team.programs?.join(", ") || "None"} · {team.regions?.join(", ") || "No regions"}</div></div></div></div></div>; }