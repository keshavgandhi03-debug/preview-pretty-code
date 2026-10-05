import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { ArrowDown, ArrowUp, Archive, ChevronDown, ChevronRight, Pencil, Plus, RotateCcw } from "lucide-react";
import { SettingsCard, Field, StatCard, EmptyState, ReadOnlyNotice, ConfirmDialog } from "@/components/settings/settings-ui";
import {
  canManageCustomization, visibleStatuses, statusSummary, saveStatus, toggleStatusActive,
  archiveStatus, restoreStatus, moveStatus, saveSubstatus, toggleSubstatusActive,
  archiveSubstatus, moveSubstatus,
} from "@/lib/settings-store";

const ICONS = ["PhoneOff", "Ban", "CalendarClock", "ThumbsDown", "UserX", "GraduationCap", "School", "Archive"];
const COLORS = ["#f97316", "#ef4444", "#8b5cf6", "#e11d48", "#3b82f6", "#10b981", "#0ea5e9", "#64748b"];

const emptyStatus = () => ({
  name: "", description: "", color: COLORS[0], icon: ICONS[0],
  order: 99, active: true, notesRequired: false, followUpAllowed: false,
});
const emptySub = () => ({
  name: "", description: "", order: 99, active: true,
  notesRequired: false, followUpRequired: false, collegeRequired: false, programRequired: false,
});

export function CustomizationSettings({ settings, role }) {
  const canEdit = canManageCustomization(role);
  const list = useMemo(() => visibleStatuses(settings), [settings]);
  const archived = settings.statuses.filter((s) => s.archived);
  const summary = statusSummary(settings);

  const [open, setOpen] = useState({});
  const [statusDraft, setStatusDraft] = useState(null);
  const [subDraft, setSubDraft] = useState(null); // { statusId, ...sub }
  const [confirm, setConfirm] = useState(null);

  const toggleOpen = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const submitStatus = () => {
    if (!statusDraft.name.trim()) return toast.error("Status name is required.");
    saveStatus(statusDraft);
    setStatusDraft(null);
    toast.success("Status saved — feedback forms and filters updated");
  };

  const submitSub = () => {
    if (!subDraft.name.trim()) return toast.error("Sub-status name is required.");
    const { statusId, ...draft } = subDraft;
    saveSubstatus(statusId, draft);
    setSubDraft(null);
    toast.success("Sub-status saved");
  };

  const askArchive = (payload) => setConfirm(payload);

  const runArchive = () => {
    if (!confirm) return;
    if (confirm.kind === "status") archiveStatus(confirm.id);
    else archiveSubstatus(confirm.statusId, confirm.id);
    setConfirm(null);
    toast.success("Archived — historical records are preserved");
  };

  return (
    <div className="space-y-5">
      {!canEdit ? <ReadOnlyNotice>Only Admin and Super Admin can manage statuses and sub-statuses.</ReadOnlyNotice> : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Statuses" value={summary.total} />
        <StatCard label="Sub-statuses" value={summary.subs} />
        <StatCard label="Active" value={summary.active} tone="green" />
        <StatCard label="Archived" value={summary.archived} tone="amber" />
      </div>

      <SettingsCard
        title="Call feedback statuses"
        description="Reorder, edit or archive statuses. Active items appear in the calling feedback form and lead filters."
        action={
          <Button size="sm" disabled={!canEdit} onClick={() => setStatusDraft(emptyStatus())}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add status
          </Button>
        }
      >
        {list.length === 0 ? (
          <EmptyState title="No statuses yet" hint="Add your first calling outcome." />
        ) : (
          <div className="space-y-2">
            {list.map((s, i) => {
              const subs = s.subs.filter((x) => !x.archived).sort((a, b) => a.order - b.order);
              const expanded = !!open[s.id];
              return (
                <div key={s.id} className="rounded-lg border border-border">
                  <div className="flex flex-wrap items-center gap-2 p-3">
                    <button type="button" onClick={() => toggleOpen(s.id)} aria-expanded={expanded}
                      className="inline-flex items-center gap-2 text-left">
                      {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
                      <span className="text-sm font-medium">{s.name}</span>
                    </button>
                    <Badge variant="secondary" className="text-[10px]">{subs.length} sub</Badge>
                    {s.usedInHistory ? <Badge variant="outline" className="text-[10px]">used in history</Badge> : null}
                    {!s.active ? <Badge variant="outline" className="text-[10px]">inactive</Badge> : null}

                    <div className="ml-auto flex items-center gap-1">
                      <Switch checked={s.active} disabled={!canEdit} onCheckedChange={() => toggleStatusActive(s.id)} aria-label={`Toggle ${s.name}`} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canEdit || i === 0} onClick={() => moveStatus(s.id, -1)} aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canEdit || i === list.length - 1} onClick={() => moveStatus(s.id, 1)} aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canEdit} onClick={() => setStatusDraft({ ...s })} aria-label="Edit status"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={!canEdit}
                        onClick={() => askArchive({ kind: "status", id: s.id, name: s.name, used: s.usedInHistory })} aria-label="Archive status">
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {expanded ? (
                    <div className="border-t border-border bg-muted/40 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sub-statuses</div>
                        <Button size="sm" variant="outline" disabled={!canEdit}
                          onClick={() => setSubDraft({ statusId: s.id, ...emptySub() })}>
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add sub-status
                        </Button>
                      </div>
                      {subs.length === 0 ? (
                        <EmptyState title="No sub-statuses" hint="Add reasons counsellors can pick after this status." />
                      ) : (
                        <ul className="divide-y divide-border rounded-md border border-border bg-card">
                          {subs.map((x, j) => (
                            <li key={x.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                              <span className="text-xs font-medium">{x.name}</span>
                              {x.followUpRequired ? <Badge variant="secondary" className="text-[10px]">follow-up</Badge> : null}
                              {x.usedInHistory ? <Badge variant="outline" className="text-[10px]">in history</Badge> : null}
                              {!x.active ? <Badge variant="outline" className="text-[10px]">inactive</Badge> : null}
                              <div className="ml-auto flex items-center gap-1">
                                <Switch checked={x.active} disabled={!canEdit} onCheckedChange={() => toggleSubstatusActive(s.id, x.id)} aria-label={`Toggle ${x.name}`} />
                                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canEdit || j === 0} onClick={() => moveSubstatus(s.id, x.id, -1)} aria-label="Move up"><ArrowUp className="h-3 w-3" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canEdit || j === subs.length - 1} onClick={() => moveSubstatus(s.id, x.id, 1)} aria-label="Move down"><ArrowDown className="h-3 w-3" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canEdit} onClick={() => setSubDraft({ statusId: s.id, ...x })} aria-label="Edit sub-status"><Pencil className="h-3 w-3" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={!canEdit}
                                  onClick={() => askArchive({ kind: "sub", id: x.id, statusId: s.id, name: x.name, used: x.usedInHistory })} aria-label="Archive sub-status">
                                  <Archive className="h-3 w-3" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>

      {archived.length > 0 ? (
        <SettingsCard title="Archived statuses" description="Hidden from feedback forms, but kept for historical reporting.">
          <ul className="divide-y divide-border">
            {archived.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-xs text-muted-foreground">{s.name}</span>
                <Button size="sm" variant="outline" disabled={!canEdit} onClick={() => restoreStatus(s.id)}>
                  <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
                </Button>
              </li>
            ))}
          </ul>
        </SettingsCard>
      ) : null}

      {/* Status drawer */}
      <Sheet open={!!statusDraft} onOpenChange={(v) => !v && setStatusDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {statusDraft ? (
            <>
              <SheetHeader>
                <SheetTitle>{statusDraft.id ? "Edit status" : "Add status"}</SheetTitle>
                <SheetDescription>Statuses drive the calling feedback form and lead filters.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <Field label="Status name" required htmlFor="st-name">
                  <Input id="st-name" value={statusDraft.name} onChange={(e) => setStatusDraft({ ...statusDraft, name: e.target.value })} />
                </Field>
                <Field label="Description" htmlFor="st-desc">
                  <Textarea id="st-desc" rows={2} value={statusDraft.description} onChange={(e) => setStatusDraft({ ...statusDraft, description: e.target.value })} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Colour">
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((c) => (
                        <button key={c} type="button" aria-label={`Colour ${c}`} onClick={() => setStatusDraft({ ...statusDraft, color: c })}
                          className={`h-7 w-7 rounded-full border-2 ${statusDraft.color === c ? "border-foreground" : "border-transparent"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </Field>
                  <Field label="Icon">
                    <Select value={statusDraft.icon} onValueChange={(v) => setStatusDraft({ ...statusDraft, icon: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{ICONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="divide-y divide-border">
                  <Row label="Active"><Switch checked={statusDraft.active} onCheckedChange={(v) => setStatusDraft({ ...statusDraft, active: v })} /></Row>
                  <Row label="Notes mandatory"><Switch checked={statusDraft.notesRequired} onCheckedChange={(v) => setStatusDraft({ ...statusDraft, notesRequired: v })} /></Row>
                  <Row label="Allow follow-up scheduling"><Switch checked={statusDraft.followUpAllowed} onCheckedChange={(v) => setStatusDraft({ ...statusDraft, followUpAllowed: v })} /></Row>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setStatusDraft(null)}>Cancel</Button>
                <Button onClick={submitStatus}>Save status</Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Sub-status drawer */}
      <Sheet open={!!subDraft} onOpenChange={(v) => !v && setSubDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {subDraft ? (
            <>
              <SheetHeader>
                <SheetTitle>{subDraft.id ? "Edit sub-status" : "Add sub-status"}</SheetTitle>
                <SheetDescription>Shown after the counsellor picks the parent status.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <Field label="Parent status">
                  <Select value={subDraft.statusId} onValueChange={(v) => setSubDraft({ ...subDraft, statusId: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{list.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Sub-status name" required htmlFor="sub-name">
                  <Input id="sub-name" value={subDraft.name} onChange={(e) => setSubDraft({ ...subDraft, name: e.target.value })} />
                </Field>
                <Field label="Description" htmlFor="sub-desc">
                  <Textarea id="sub-desc" rows={2} value={subDraft.description} onChange={(e) => setSubDraft({ ...subDraft, description: e.target.value })} />
                </Field>
                <div className="divide-y divide-border">
                  <Row label="Active"><Switch checked={subDraft.active} onCheckedChange={(v) => setSubDraft({ ...subDraft, active: v })} /></Row>
                  <Row label="Notes mandatory"><Switch checked={subDraft.notesRequired} onCheckedChange={(v) => setSubDraft({ ...subDraft, notesRequired: v })} /></Row>
                  <Row label="Follow-up date required"><Switch checked={subDraft.followUpRequired} onCheckedChange={(v) => setSubDraft({ ...subDraft, followUpRequired: v })} /></Row>
                  <Row label="College required"><Switch checked={subDraft.collegeRequired} onCheckedChange={(v) => setSubDraft({ ...subDraft, collegeRequired: v })} /></Row>
                  <Row label="Program required"><Switch checked={subDraft.programRequired} onCheckedChange={(v) => setSubDraft({ ...subDraft, programRequired: v })} /></Row>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setSubDraft(null)}>Cancel</Button>
                <Button onClick={submitSub}>Save sub-status</Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={`Archive “${confirm?.name || ""}”?`}
        description={
          confirm?.used
            ? "This item is used in call history, so it will be archived instead of deleted. Existing leads keep their record; new feedback forms will no longer show it."
            : "It will be hidden from feedback forms and filters. You can restore it later."
        }
        confirmLabel="Archive"
        destructive
        onConfirm={runArchive}
      />
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
