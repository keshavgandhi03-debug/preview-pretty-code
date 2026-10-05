import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, RotateCcw, Download, Calendar, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { REPORT_RANGES, CAMPAIGN_LIST, PROGRAM_LIST, TEAMS } from "@/lib/reports-data.js";
import { COUNSELLORS } from "@/lib/crm-data";

function MultiSelect({ label, options, selected, onChange, locked = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const text = selected.length === 0 ? `All ${label}` : selected.length === 1 ? selected[0] : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={locked}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md border border-input bg-card px-3 text-xs font-medium text-foreground",
          "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          locked && "cursor-not-allowed opacity-70",
          selected.length > 0 && "border-primary/40 bg-primary/5",
        )}
      >
        {text}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      </button>
      {open && (
        <div role="listbox" aria-label={label} className="absolute left-0 z-40 mt-1 max-h-64 w-56 overflow-y-auto rounded-lg border border-border bg-card p-1.5 shadow-lg">
          <div className="mb-1 flex items-center justify-between px-2 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
            {selected.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="text-[10px] font-semibold text-primary hover:underline">
                Clear
              </button>
            )}
          </div>
          {options.map((o) => {
            const active = selected.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => toggle(o.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded border", active ? "border-primary bg-primary text-primary-foreground" : "border-input")}>
                  {active && <Check className="h-3 w-3" aria-hidden="true" />}
                </span>
                <span className="truncate">{o.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ReportFilterBar({ filters, onChange, onReset, onExport, autoRefresh, onAutoRefreshChange, lockedCounsellor }) {
  const range = REPORT_RANGES.find((r) => r.id === filters.range) || REPORT_RANGES[2];
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="sticky top-0 z-30 -mx-6 -mt-6 mb-6 border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelect
          label="Counsellors"
          options={COUNSELLORS.map((c) => ({ id: c, label: c }))}
          selected={lockedCounsellor ? [lockedCounsellor] : filters.counsellors}
          onChange={(v) => set({ counsellors: v })}
          locked={Boolean(lockedCounsellor)}
        />
        <MultiSelect
          label="Teams"
          options={TEAMS.map((t) => ({ id: t.id, label: t.name }))}
          selected={filters.teams}
          onChange={(v) => set({ teams: v })}
        />
        <MultiSelect
          label="Campaigns"
          options={CAMPAIGN_LIST.map((c) => ({ id: c, label: c }))}
          selected={filters.campaigns}
          onChange={(v) => set({ campaigns: v })}
        />
        <MultiSelect
          label="Programs"
          options={PROGRAM_LIST.map((p) => ({ id: p, label: p }))}
          selected={filters.programs}
          onChange={(v) => set({ programs: v })}
        />

        <div className="relative">
          <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <select
            aria-label="Date range"
            value={filters.range}
            onChange={(e) => set({ range: e.target.value })}
            className="h-9 appearance-none rounded-md border border-input bg-card pl-8 pr-8 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {REPORT_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>

        {filters.range === "custom" && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              aria-label="From date"
              value={filters.from}
              onChange={(e) => set({ from: e.target.value })}
              className="h-9 rounded-md border border-input bg-card px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="date"
              aria-label="To date"
              value={filters.to}
              onChange={(e) => set({ to: e.target.value })}
              className="h-9 rounded-md border border-input bg-card px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAutoRefreshChange(!autoRefresh)}
            aria-pressed={autoRefresh}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              autoRefresh ? "border-primary/40 bg-primary/5 text-primary" : "border-input bg-card text-muted-foreground hover:bg-muted/60",
            )}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", autoRefresh && "animate-[spin_3s_linear_infinite]")} aria-hidden="true" />
            Auto-refresh
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs font-medium text-muted-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground" aria-live="polite">
        Showing: <span className="font-medium text-foreground">{range.label}</span>
        {filters.range === "custom" && filters.from && ` · ${filters.from} → ${filters.to || "today"}`}
      </div>
    </div>
  );
}
