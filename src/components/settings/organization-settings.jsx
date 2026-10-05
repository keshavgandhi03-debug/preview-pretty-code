import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Upload } from "lucide-react";
import { SettingsCard, Field, ToggleRow, ReadOnlyNotice } from "@/components/settings/settings-ui";
import { updateSettings, canEditOrganization, initialsOf } from "@/lib/settings-store";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMEZONES = ["Asia/Kolkata (IST)", "Asia/Dubai (GST)", "Europe/London (GMT)", "America/New_York (EST)"];
const STATES = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana", "Gujarat", "Punjab", "Uttar Pradesh"];

export function OrganizationSettings({ settings, role }) {
  const canEdit = canEditOrganization(role);
  const [form, setForm] = useState(settings.organization);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleDay = (d) =>
    set("workingDays", form.workingDays.includes(d) ? form.workingDays.filter((x) => x !== d) : [...form.workingDays, d]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Organization name is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid business email.";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid contact number.";
    if (form.website && !/^https?:\/\//.test(form.website)) e.website = "Website must start with http:// or https://";
    if (form.callStart >= form.callEnd) e.callEnd = "End time must be after start time.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = async () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateSettings({ organization: form });
    setSaving(false);
    toast.success("Organization settings saved");
  };

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("logo", String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {!canEdit ? <ReadOnlyNotice>Only Admin and Super Admin can edit organization settings.</ReadOnlyNotice> : null}

      <SettingsCard title="Organization profile" description="Branding and contact details used across the counsellor panel.">
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted text-sm font-semibold text-muted-foreground">
            {form.logo ? (
              <img src={form.logo} alt="Organization logo" className="h-full w-full object-cover" />
            ) : (
              initialsOf(form.name || "CW") || <Building2 className="h-5 w-5" />
            )}
          </div>
          <div className="space-y-1.5">
            <label className="inline-flex">
              <input type="file" accept="image/*" className="hidden" onChange={onLogo} disabled={!canEdit} />
              <Button asChild={false} type="button" variant="outline" size="sm" disabled={!canEdit} onClick={(e) => e.currentTarget.previousSibling?.click?.()}>
                <span className="inline-flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Upload logo</span>
              </Button>
            </label>
            <p className="text-[11px] text-muted-foreground">PNG or JPG, up to 5 MB.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Organization name" required error={errors.name} htmlFor="org-name">
            <Input id="org-name" value={form.name} disabled={!canEdit} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Business email" required error={errors.email} htmlFor="org-email">
            <Input id="org-email" type="email" value={form.email} disabled={!canEdit} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Contact number" required error={errors.phone} htmlFor="org-phone">
            <Input id="org-phone" value={form.phone} disabled={!canEdit} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Website" error={errors.website} htmlFor="org-web">
            <Input id="org-web" value={form.website} disabled={!canEdit} onChange={(e) => set("website", e.target.value)} />
          </Field>
          <Field label="Address" className="sm:col-span-2" htmlFor="org-addr">
            <Textarea id="org-addr" rows={2} value={form.address} disabled={!canEdit} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="State">
            <Select value={form.state} disabled={!canEdit} onValueChange={(v) => set("state", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="City" htmlFor="org-city">
            <Input id="org-city" value={form.city} disabled={!canEdit} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Timezone">
            <Select value={form.timezone} disabled={!canEdit} onValueChange={(v) => set("timezone", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{TIMEZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
      </SettingsCard>

      <SettingsCard title="Calling window" description="Working days, calling hours and call compliance rules.">
        <Field label="Working days" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const on = form.workingDays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  disabled={!canEdit}
                  aria-pressed={on}
                  onClick={() => toggleDay(d)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Calling start time" htmlFor="org-start">
            <Input id="org-start" type="time" value={form.callStart} disabled={!canEdit} onChange={(e) => set("callStart", e.target.value)} />
          </Field>
          <Field label="Calling end time" error={errors.callEnd} htmlFor="org-end">
            <Input id="org-end" type="time" value={form.callEnd} disabled={!canEdit} onChange={(e) => set("callEnd", e.target.value)} />
          </Field>
        </div>

        <div className="mt-2 divide-y divide-border">
          <ToggleRow label="Call recording" hint="Record every outbound counselling call">
            <Switch checked={form.callRecording} disabled={!canEdit} onCheckedChange={(v) => set("callRecording", v)} />
          </ToggleRow>
          <ToggleRow label="Mandatory call feedback" hint="Counsellors must submit feedback before the next lead">
            <Switch checked={form.mandatoryFeedback} disabled={!canEdit} onCheckedChange={(v) => set("mandatoryFeedback", v)} />
          </ToggleRow>
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={!canEdit || saving}>{saving ? "Saving…" : "Save Changes"}</Button>
      </div>
    </div>
  );
}
