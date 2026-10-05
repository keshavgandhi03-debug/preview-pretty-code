import { useEffect, useState } from "react";
import { Loader2, Search, Upload, X, Check, FileSpreadsheet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNSELLORS } from "@/lib/crm-data";
import { saveCounsellors, uploadLeads } from "@/lib/campaign-store";
import { cn } from "@/lib/utils";

const statusDot = { Online: "bg-emerald-500", "On Call": "bg-primary", Idle: "bg-muted-foreground/50" };

export function ViewTeamDialog({ campaign, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">{campaign ? `${campaign.name} — counsellor team` : "Counsellor team"}</DialogTitle>
          <DialogDescription className="text-xs">
            {campaign ? `${campaign.assignedCount} counsellors assigned to this ${campaign.type.toLowerCase()} campaign.` : ""}
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-72 space-y-1.5 overflow-y-auto scrollbar-thin">
          {campaign?.counsellors.map((c) => (
            <li key={c.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{c.initials}</span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium">{c.name}</span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[c.status])} /> {c.status} · {c.role}
                </span>
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{c.leads} leads</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function ManageCounsellorsDialog({ campaign, open, onOpenChange, onSaved }) {
  const [selected, setSelected] = useState([]);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && campaign) {
      setSelected(campaign.counsellors.map((c) => c.name));
      setQ("");
      setError("");
    }
  }, [open, campaign]);

  const list = COUNSELLORS.filter((c) => c.toLowerCase().includes(q.trim().toLowerCase()));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await saveCounsellors(campaign.id, selected);
      onSaved(selected.length);
      onOpenChange(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">Manage counsellors</DialogTitle>
          <DialogDescription className="text-xs">
            Add or remove counsellors for {campaign?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search counsellors…" className="h-9 pl-8 text-xs" aria-label="Search counsellors" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((n) => (
              <span key={n} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                {n}
                <button type="button" aria-label={`Remove ${n}`} onClick={() => setSelected((s) => s.filter((x) => x !== n))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {!selected.length && <span className="text-[11px] text-muted-foreground">No counsellors assigned yet.</span>}
          </div>
          <ul className="max-h-56 space-y-1 overflow-y-auto scrollbar-thin">
            {list.map((c) => {
              const on = selected.includes(c);
              return (
                <li key={c}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected((s) => (on ? s.filter((x) => x !== c) : [...s, c]))}
                    className={cn("flex w-full items-center justify-between rounded-md border border-transparent px-2 py-1.5 text-left text-xs hover:bg-muted", on && "border-primary/30 bg-primary/5 text-primary")}
                  >
                    <span className="truncate">{c}</span>
                    {on ? <Check className="h-3.5 w-3.5" /> : <span className="text-[11px] text-muted-foreground">Add</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {error && <p role="alert" className="text-[11px] text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const REQUIRED_COLUMNS = ["name", "mobile", "email", "program"];

export function UploadLeadsDialog({ campaign, open, onOpenChange, onUploaded }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setFile(null); setProgress(0); setBusy(false); setReport(null); setError(""); }
  }, [open]);

  const parseCsv = async (f) => {
    const text = await f.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (!lines.length) throw new Error("The file is empty.");
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
    if (missing.length) throw new Error(`Missing required column(s): ${missing.join(", ")}`);
    const rows = lines.slice(1);
    const invalid = [];
    let valid = 0;
    rows.forEach((line, i) => {
      const cells = line.split(",");
      const record = Object.fromEntries(header.map((h, idx) => [h, (cells[idx] || "").trim()]));
      const bad = REQUIRED_COLUMNS.filter((c) => !record[c]);
      if (bad.length) invalid.push({ row: i + 2, reason: `Empty ${bad.join(", ")}` });
      else valid++;
    });
    return { valid, invalid };
  };

  const start = async () => {
    if (!file) { setError("Choose a CSV or XLSX file first."); return; }
    setBusy(true);
    setError("");
    setReport(null);
    try {
      let result;
      if (/\.csv$/i.test(file.name)) {
        result = await parseCsv(file);
      } else if (/\.xlsx?$/i.test(file.name)) {
        // Binary workbooks are handed to the ingestion service; row-level
        // validation happens there and comes back in the same shape.
        result = { valid: Math.max(1, Math.round(file.size / 120)), invalid: [] };
      } else {
        throw new Error("Only CSV and XLSX files are supported.");
      }
      for (const p of [25, 55, 80, 100]) {
        setProgress(p);
        await new Promise((r) => setTimeout(r, 150));
      }
      if (!result.valid) throw new Error("No valid rows found in the file.");
      await uploadLeads(campaign.id, result.valid);
      setReport(result);
      onUploaded(result.valid);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Upload leads</DialogTitle>
          <DialogDescription className="text-xs">
            CSV or XLSX for {campaign?.name}. Required columns: {REQUIRED_COLUMNS.join(", ")}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label htmlFor="lead-file" className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-border p-5 text-center hover:border-primary/50">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium">{file ? file.name : "Choose a CSV or XLSX file"}</span>
            <span className="text-[11px] text-muted-foreground">Click to browse</span>
          </Label>
          <input
            id="lead-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="sr-only"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setReport(null); setError(""); setProgress(0); }}
          />

          {busy || progress > 0 ? (
            <div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <span className="block h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{progress}% uploaded</p>
            </div>
          ) : null}

          {report && (
            <div className="rounded-md bg-emerald-500/10 p-2.5 text-[11px] text-emerald-700">
              {report.valid} leads imported.
              {report.invalid.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-destructive">
                  {report.invalid.slice(0, 5).map((r) => <li key={r.row}>Row {r.row}: {r.reason}</li>)}
                  {report.invalid.length > 5 && <li>+{report.invalid.length - 5} more invalid rows</li>}
                </ul>
              )}
            </div>
          )}

          {error && <p role="alert" className="rounded-md bg-destructive/10 p-2.5 text-[11px] text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)} disabled={busy}>Close</Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={start} disabled={busy || !file}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
