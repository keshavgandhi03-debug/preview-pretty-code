import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Eye, Phone, CalendarClock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LeadDetailModal } from "@/components/lead-detail-modal";
import { LEADS, FEEDBACK_STATUSES, CLIENTS } from "@/lib/crm-data";
import { RelativeTime } from "@/components/relative-time";
import { rangeBounds, DATE_RANGES } from "@/lib/lead-filters";
import { useFollowupOverrides, useDispositionOverrides, applyFollowups } from "@/lib/lead-activity-store";
import { DISPOSITION_TO_FLOW } from "@/lib/disposition-flow-config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Leads — CollegeWollege CRM" },
      { name: "description", content: "Browse every lead with filters for disposition, assigned date and follow-up status." },
      { property: "og:title", content: "Leads — CollegeWollege CRM" },
      { property: "og:description", content: "Filter leads by disposition, date and follow-up, and open any lead to call or update it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeadsPage,
});

const FOLLOWUP_FILTERS = [
  { id: "all", label: "All leads" },
  { id: "scheduled", label: "Has follow-up" },
  { id: "overdue", label: "Overdue" },
  { id: "today", label: "Due today" },
  { id: "none", label: "No follow-up" },
];

const TONE = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
};

const clientName = (id) => CLIENTS.find((c) => c.id === id)?.name || id;

/** Disposition label saved through the flow → feedback taxonomy id. */
const savedFeedbackId = (primary) => {
  if (!primary) return undefined;
  const flow = DISPOSITION_TO_FLOW[primary];
  const direct = FEEDBACK_STATUSES.find(
    (f) => f.id === flow || f.label.toLowerCase() === String(primary).toLowerCase(),
  );
  return direct?.id;
};

function LeadsPage() {
  const followups = useFollowupOverrides();
  const dispositions = useDispositionOverrides();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [range, setRange] = useState("month");
  const [followupFilter, setFollowupFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  // Filtering depends on the current time, so only compute it after hydration
  // to keep the server and client markup identical.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const leads = useMemo(() => {
    if (!hydrated) return [];
    const merged = applyFollowups(LEADS, followups).map((l) => {
      const saved = dispositions[l.id];
      if (!saved) return l;
      const fb = savedFeedbackId(saved.primaryDisposition);
      return {
        ...l,
        feedback: fb || l.feedback,
        substatus: saved.subpoint || l.substatus,
        lastContact: saved.savedAt || l.lastContact,
        savedThroughFlow: true,
      };
    });

    const bounds = rangeBounds(range);
    const now = new Date();
    const needle = q.trim().toLowerCase();

    return merged
      .filter((l) => {
        if (status && l.feedback !== status) return false;
        if (bounds) {
          const t = new Date(l.assignedDate).getTime();
          if (t < bounds[0].getTime() || t > bounds[1].getTime()) return false;
        }
        const fu = l.nextFollowup ? new Date(l.nextFollowup) : null;
        if (followupFilter === "scheduled" && !fu) return false;
        if (followupFilter === "none" && fu) return false;
        if (followupFilter === "overdue" && (!fu || fu >= now)) return false;
        if (followupFilter === "today" && (!fu || fu.toDateString() !== now.toDateString())) return false;
        if (needle && ![l.name, l.cwid, l.mobile, l.email].some((v) => String(v || "").toLowerCase().includes(needle)))
          return false;
        return true;
      })
      .sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact));
  }, [hydrated, followups, dispositions, q, status, range, followupFilter]);

  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(leads.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const rows = leads.slice((safePage - 1) * pageSize, safePage * pageSize);

  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const openLead = (l) => { setSelected(l); setOpen(true); };

  return (
    <AppShell>
      <div className="space-y-4 p-4 sm:p-6">
        <header>
          <h1 className="text-lg font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {leads.length.toLocaleString()} leads · filter by disposition, assigned date and follow-up
          </p>
        </header>

        <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-medium text-muted-foreground">
            Search
            <span className="relative mt-1 block">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => reset(setQ)(e.target.value)}
                placeholder="Name, CWID, mobile, email"
                className="h-9 w-full rounded-md border border-input bg-background pl-7 pr-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </span>
          </label>

          <label className="text-xs font-medium text-muted-foreground">
            Disposition
            <select
              value={status}
              onChange={(e) => reset(setStatus)(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All dispositions</option>
              {FEEDBACK_STATUSES.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-muted-foreground">
            Assigned date
            <select
              value={range}
              onChange={(e) => reset(setRange)(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {DATE_RANGES.filter((r) => r.id !== "custom").map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
              <option value="all">All time</option>
            </select>
          </label>

          <label className="text-xs font-medium text-muted-foreground">
            Follow-up
            <select
              value={followupFilter}
              onChange={(e) => reset(setFollowupFilter)(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {FOLLOWUP_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="rounded-xl border border-border bg-card">
          {rows.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">No leads match these filters.</p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 font-semibold">Lead</th>
                    <th className="px-4 py-2.5 font-semibold">Program</th>
                    <th className="px-4 py-2.5 font-semibold">Disposition</th>
                    <th className="px-4 py-2.5 font-semibold">Follow-up</th>
                    <th className="px-4 py-2.5 font-semibold">Last activity</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => {
                    const fb = FEEDBACK_STATUSES.find((f) => f.id === l.feedback);
                    return (
                      <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{l.name}</span>
                            {l.savedThroughFlow ? (
                              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                Updated
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{clientName(l.clientId)} · {l.counsellor}</div>
                        </td>
                        <td className="px-4 py-2.5 text-xs">{l.program}</td>
                        <td className="px-4 py-2.5">
                          {fb ? (
                            <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", TONE[fb.tone])}>
                              {fb.label}
                            </span>
                          ) : null}
                          <div className="mt-1 text-[11px] text-muted-foreground">{l.substatus}</div>
                        </td>
                        <td className="px-4 py-2.5 text-xs">
                          {l.nextFollowup ? (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <CalendarClock className="h-3 w-3" />
                              {new Date(l.nextFollowup).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          <RelativeTime value={l.lastContact} />
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openLead(l)}
                              className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-[11px] font-medium hover:bg-accent"
                            >
                              <Eye className="h-3 w-3" /> Open
                            </button>
                            <a
                              href={`tel:${String(l.mobile).replace(/\s/g, "")}`}
                              aria-label={`Call ${l.name}`}
                              className="inline-flex items-center rounded-md border border-input p-1.5 hover:bg-accent"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t border-border p-3">
            <p className="text-xs text-muted-foreground">Page {safePage} of {pageCount}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                className="rounded-md border border-input px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-accent"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={safePage >= pageCount}
                onClick={() => setPage(safePage + 1)}
                className="rounded-md border border-input px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-accent"
              >
                Next
              </button>
            </div>
          </nav>
        </section>
      </div>

      <LeadDetailModal lead={selected} open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}
