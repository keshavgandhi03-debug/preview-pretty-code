import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, ShieldCheck } from "lucide-react";
import { SettingsCard, Field, ToggleRow, ReadOnlyNotice } from "@/components/settings/settings-ui";
import { updateSettings, initialsOf } from "@/lib/settings-store";

const LANGS = ["English", "Hindi", "Marathi", "Tamil", "Telugu"];
const TIMEZONES = ["Asia/Kolkata (IST)", "Asia/Dubai (GST)", "Europe/London (GMT)", "America/New_York (EST)"];
const CODES = ["+91", "+971", "+44", "+1"];

const isPrivileged = (role) => role === "Admin" || role === "Super Admin";

export function UserProfileSettings({ settings, role }) {
  const privileged = isPrivileged(role);
  const [form, setForm] = useState(settings.profile);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [otp, setOtp] = useState(null); // { field, value, code }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setNotif = (k, v) => setForm((f) => ({ ...f, notifications: { ...f.notifications, [k]: v } }));

  const verified = {
    email: form.email === settings.profile.email,
    phone: form.phone === settings.profile.phone,
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length !== 10) e.phone = "Enter a 10-digit mobile number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const startOtp = (field) => {
    const value = field === "email" ? form.email : form.phone;
    if (field === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return toast.error("Enter a valid email first.");
    if (field === "phone" && value.replace(/\D/g, "").length !== 10) return toast.error("Enter a valid mobile number first.");
    setOtp({ field, value, code: "" });
    toast.success(`Verification code sent to ${value}`);
  };

  const confirmOtp = () => {
    if ((otp.code || "").replace(/\D/g, "").length !== 6) return toast.error("Enter the 6-digit code.");
    updateSettings((s) => ({ profile: { ...s.profile, [otp.field]: otp.value } }));
    setOtp(null);
    toast.success("Verified and updated");
  };

  const onSave = async () => {
    if (!validate()) return toast.error("Please fix the highlighted fields.");
    if (!verified.email) return toast.error("Verify your new email with OTP before saving.");
    if (!verified.phone) return toast.error("Verify your new phone number with OTP before saving.");
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    updateSettings((s) => ({ profile: { ...s.profile, ...form } }));
    setSaving(false);
    toast.success("Profile updated");
  };

  const onPicture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB.");
    const reader = new FileReader();
    reader.onload = () => set("picture", String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {!privileged ? <ReadOnlyNotice>Role, team, reporting manager and employee ID are managed by your administrator.</ReadOnlyNotice> : null}

      <SettingsCard title="Profile picture" description="Shown in the sidebar, team dashboards and call logs.">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-muted text-sm font-semibold text-muted-foreground">
            {form.picture ? (
              <img src={form.picture} alt="Profile picture" className="h-full w-full object-cover" />
            ) : (
              initialsOf(`${form.firstName} ${form.lastName}`)
            )}
          </div>
          <div className="space-y-1.5">
            <label className="inline-flex">
              <input type="file" accept="image/*" className="hidden" onChange={onPicture} />
              <Button type="button" variant="outline" size="sm" onClick={(e) => e.currentTarget.previousSibling?.click?.()}>
                <span className="inline-flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Upload photo</span>
              </Button>
            </label>
            {form.picture ? (
              <Button type="button" variant="ghost" size="sm" className="ml-2" onClick={() => set("picture", "")}>Remove</Button>
            ) : null}
            <p className="text-[11px] text-muted-foreground">Square PNG or JPG, up to 5 MB.</p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Personal information" description="Contact changes require OTP verification.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required error={errors.firstName} htmlFor="p-first">
            <Input id="p-first" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
          </Field>
          <Field label="Last name" required error={errors.lastName} htmlFor="p-last">
            <Input id="p-last" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </Field>
          <Field label="Display name" htmlFor="p-display">
            <Input id="p-display" value={form.displayName} onChange={(e) => set("displayName", e.target.value)} />
          </Field>
          <Field label="Employee ID" hint={privileged ? undefined : "Managed by admin"} htmlFor="p-emp">
            <Input id="p-emp" value={form.employeeId} disabled={!privileged} onChange={(e) => set("employeeId", e.target.value)} />
          </Field>

          <Field
            label="Email address"
            required
            error={errors.email}
            className="sm:col-span-2"
            htmlFor="p-email"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Input id="p-email" type="email" className="max-w-sm" value={form.email} onChange={(e) => set("email", e.target.value)} />
              {verified.email ? (
                <Badge variant="secondary" className="gap-1 text-[10px]"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => startOtp("email")}>Verify with OTP</Button>
              )}
            </div>
          </Field>

          <Field label="Mobile number" required error={errors.phone} className="sm:col-span-2" htmlFor="p-phone">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={form.countryCode} onValueChange={(v) => set("countryCode", v)}>
                <SelectTrigger className="h-9 w-24"><SelectValue /></SelectTrigger>
                <SelectContent>{CODES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Input id="p-phone" className="max-w-[200px]" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              {verified.phone ? (
                <Badge variant="secondary" className="gap-1 text-[10px]"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => startOtp("phone")}>Verify with OTP</Button>
              )}
            </div>
          </Field>

          <Field label="Designation" htmlFor="p-desig">
            <Input id="p-desig" value={form.designation} disabled={!privileged} onChange={(e) => set("designation", e.target.value)} />
          </Field>
          <Field label="Department" htmlFor="p-dept">
            <Input id="p-dept" value={form.department} disabled={!privileged} onChange={(e) => set("department", e.target.value)} />
          </Field>
          <Field label="Role" hint="Read-only" htmlFor="p-role">
            <Input id="p-role" value={form.role} disabled readOnly />
          </Field>
          <Field label="Team" hint="Read-only" htmlFor="p-team">
            <Input id="p-team" value={form.team} disabled readOnly />
          </Field>
          <Field label="Reporting manager" hint="Read-only" htmlFor="p-mgr">
            <Input id="p-mgr" value={form.reportsTo} disabled readOnly />
          </Field>
          <Field label="Language">
            <Select value={form.language} onValueChange={(v) => set("language", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Timezone" className="sm:col-span-2">
            <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{TIMEZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
      </SettingsCard>

      <SettingsCard title="Notifications" description="Where you want lead and follow-up alerts.">
        <div className="divide-y divide-border">
          <ToggleRow label="Email alerts">
            <Switch checked={form.notifications.email} onCheckedChange={(v) => setNotif("email", v)} />
          </ToggleRow>
          <ToggleRow label="WhatsApp alerts">
            <Switch checked={form.notifications.whatsapp} onCheckedChange={(v) => setNotif("whatsapp", v)} />
          </ToggleRow>
          <ToggleRow label="Push notifications">
            <Switch checked={form.notifications.push} onCheckedChange={(v) => setNotif("push", v)} />
          </ToggleRow>
          <ToggleRow label="Follow-up reminders" hint="Alert me before a scheduled follow-up">
            <Switch checked={form.notifications.followUpReminders} onCheckedChange={(v) => setNotif("followUpReminders", v)} />
          </ToggleRow>
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
      </div>

      <Dialog open={!!otp} onOpenChange={(v) => !v && setOtp(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Verify {otp?.field === "email" ? "email address" : "mobile number"}</DialogTitle>
            <DialogDescription>Enter the 6-digit code sent to {otp?.value}.</DialogDescription>
          </DialogHeader>
          <Field label="Verification code" htmlFor="otp-code">
            <Input id="otp-code" inputMode="numeric" maxLength={6} placeholder="123456"
              value={otp?.code || ""} onChange={(e) => setOtp((o) => ({ ...o, code: e.target.value }))} />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOtp(null)}>Cancel</Button>
            <Button onClick={confirmOtp}>Verify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
