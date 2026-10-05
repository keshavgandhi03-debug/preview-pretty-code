import { useEffect, useMemo, useState } from "react";
import { X, Info, Loader2, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNSELLORS } from "@/lib/crm-data";
import { BUCKETS, LEVELS, MASTER_COURSES, PRIORITIES, assignCampaign, availableLeads } from "@/lib/campaign-store";
import { cn } from "@/lib/utils";

const emptyForm = {
  clientId: "", bucket: "", counsellors: [], leadCount: "", priority: "Medium", level: "", masterCourse: "",
};

function SearchableSelect({ id, value, placeholder, options, onSelect, error }) {
  const [q, setQ] = useState("");
  const filtered = options.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase()));
  const current = options.find((o) => o.value === value);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border bg-card px-3 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            error ? "border-destructive" : "border-input",
          )}
        >
          <span className={cn("truncate", !current && "text-muted-foreground")}>{current ? current.label : placeholder}</span>
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-1">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="mb-1 h-8 text-xs" />
        <div className="max-h-56 overflow-y-auto scrollbar-thin">
          {filtered.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onSelect(o.value)}
              className={cn("flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted", o.value === value && "bg-primary/10 text-primary")}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
          {!filtered.length && <div className="px-2 py-3 text-xs text-muted-foreground">No matches</div>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CounsellorMultiSelect({ value, onChange, error }) {
  const [q, setQ] = useState("");
  const filtered = COUNSELLORS.filter((c) => c.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id="assign-counsellors"
          type="button"
          className={cn(
            "flex min-h-9 w-full items-center justify-between gap-2 rounded-md border bg-card px-3 py-1.5 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            error ? "border-destructive" : "border-input",
          )}
        >
          <span className={cn("truncate", !value.length && "text-muted-foreground")}>
            {value.length ? `${value.length} counsellor${value.length > 1 ? "s" : ""} selected` : "Select counsellor(s)"}
          </span>
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-1">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search counsellors…" className="mb-1 h-8 text-xs" />
        <div className="max-h-56 overflow-y-auto scrollbar-thin">
          {filtered.map((c) => {
            const on = value.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(on ? value.filter((x) => x !== c) : [...value, c])}
                className={cn("flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted", on && "bg-primary/10 text-primary")}
              >
                <span className="truncate">{c}</span>
                {on && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div className="min-w-0 space-y-1">
      <Label htmlFor={htmlFor} className="text-[11px] font-medium">
        {label} <span className="text-destructive">*</span>
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

export function AssignCampaignDrawer({ open, campaigns, preselectId, onClose, onAssigned }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm({ ...emptyForm, clientId: preselectId || "" });
    setErrors({});
    setFailure("");
  }, [open, preselectId]);

  const selected = campaigns.find((c) => c.id === form.clientId);
  const capacity = selected ? availableLeads(selected) : 0;
  const clientOptions = useMemo(() => campaigns.map((c) => ({ value: c.id, label: c.name })), [campaigns]);

  const set = (key, v) => setForm((f) => ({ ...f, [key]: v }));

  const validate = () => {
    const e = {};
    if (!form.clientId) e.clientId = "Select a client.";
    if (!form.bucket) e.bucket = "Select a bucket.";
    if (!form.counsellors.length) e.counsellors = "Select at least one counsellor.";
    const n = Number(form.leadCount);
    if (!form.leadCount || !Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) e.leadCount = "Enter a positive whole number.";
    else if (selected && n > capacity) e.leadCount = `Only ${capacity} leads available in this bucket.`;
    if (!form.priority) e.priority = "Select a priority.";
    if (!form.level) e.level = "Select a level.";
    if (!form.masterCourse) e.masterCourse = "Select a master course.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setFailure("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await assignCampaign({ ...form, leadCount: Number(form.leadCount) });
      onAssigned(res);
    } catch (err) {
      setFailure(err.message || "Assignment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close assignment dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-drawer-title"
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-elevated)]"
      >
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 border-b border-border p-4">

          <div className="min-w-0">
            <h2 id="assign-drawer-title" className="text-sm font-semibold">Assign calling campaign</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Choose the lead group and allocate it to one or more counsellors.
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Client" htmlFor="assign-client" error={errors.clientId}>
                <SearchableSelect id="assign-client" value={form.clientId} placeholder="Select client" options={clientOptions} onSelect={(v) => set("clientId", v)} error={errors.clientId} />
              </Field>
              <Field label="Bucket" htmlFor="assign-bucket" error={errors.bucket}>
                <SearchableSelect id="assign-bucket" value={form.bucket} placeholder="Select bucket" options={BUCKETS.map((b) => ({ value: b, label: b }))} onSelect={(v) => set("bucket", v)} error={errors.bucket} />
              </Field>
            </div>

            <Field label="Counsellor(s)" htmlFor="assign-counsellors" error={errors.counsellors}>
              <CounsellorMultiSelect value={form.counsellors} onChange={(v) => set("counsellors", v)} error={errors.counsellors} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Number of leads" htmlFor="assign-leads" error={errors.leadCount}>
                <Input
                  id="assign-leads"
                  type="number"
                  min={1}
                  max={capacity || undefined}
                  value={form.leadCount}
                  onChange={(e) => set("leadCount", e.target.value)}
                  placeholder="e.g. 250"
                  className={cn("h-9 text-xs", errors.leadCount && "border-destructive")}
                />
                {selected && <p className="text-[10px] text-muted-foreground">{capacity} leads available</p>}
              </Field>
              <Field label="Priority" htmlFor="assign-priority" error={errors.priority}>
                <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                  <SelectTrigger id="assign-priority" className="h-9 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Level" htmlFor="assign-level" error={errors.level}>
                <Select value={form.level} onValueChange={(v) => set("level", v)}>
                  <SelectTrigger id="assign-level" className={cn("h-9 text-xs", errors.level && "border-destructive")}><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Master course" htmlFor="assign-course" error={errors.masterCourse}>
                <SearchableSelect id="assign-course" value={form.masterCourse} placeholder="Select master course" options={MASTER_COURSES.map((m) => ({ value: m, label: m }))} onSelect={(v) => set("masterCourse", v)} error={errors.masterCourse} />
              </Field>
            </div>

            <p className="flex items-start gap-2 rounded-md bg-primary/5 p-2.5 text-[11px] text-primary">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" />
              Leads will be assigned from the selected bucket based on availability.
            </p>

            {failure && (
              <p role="alert" className="rounded-md bg-destructive/10 p-2.5 text-[11px] text-destructive">{failure}</p>
            )}
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-border p-4">
            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" size="sm" className="gap-1.5 text-xs" disabled={submitting}>
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Assign campaign
            </Button>
          </footer>
        </form>
      </div>
    </div>

  );
}
