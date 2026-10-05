import { useMemo, useState } from "react";
import { Award, Phone, Clock, Target, CalendarCheck } from "lucide-react";
import { ReportCard, StatTile, Meter, DataTable, Drawer, StatusPill } from "./shared.jsx";
import {
  buildUserPerformance, feedbackBreakdown, fmtDuration, fmtNum, fmtPct, fmtDateTime,
} from "@/lib/reports-data.js";

function fmtLast(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  const h = Math.floor(diff / 3600000);
  return h > 0 ? `${h}h ago` : "Today";
}

export function UserReport({ calls, leads, filters }) {
  const [selected, setSelected] = useState(null);
  const perf = useMemo(() => buildUserPerformance(calls, leads, filters), [calls, leads, filters]);
  const top = useMemo(
    () => perf.reduce((best, u) => (u.interested + u.appStarted > (best?.interested ?? -1) + (best?.appStarted ?? 0) ? u : best), null),
    [perf],
  );
  const totals = useMemo(() => {
    const sum = (k) => perf.reduce((a, u) => a + (Number(u[k]) || 0), 0);
    const connected = sum("connected");
    const talk = sum("talkSec");
    const calls_ = sum("totalCalls");
    return {
      active: perf.length,
      assigned: sum("leadsAssigned"),
      calls: calls_,
      connected,
      interested: sum("interested"),
      fuCompleted: sum("followupsCompleted"),
      avgTalk: connected ? Math.round(talk / connected) : 0,
      connRate: calls_ ? (connected / calls_) * 100 : 0,
    };
  }, [perf]);
  const detail = selected ? perf.find((u) => u.name === selected) : null;
  const detailFb = useMemo(
    () => (selected ? feedbackBreakdown(calls.filter((c) => c.counsellor === selected && c.status === "connected")) : []),
    [calls, selected],
  );

  return (
    <div className="space-y-4">
      {top && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Award className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="text-sm">
            <span className="font-semibold text-foreground">{top.name}</span>
            <span className="text-muted-foreground"> is the top performer this period — </span>
            <span className="font-medium text-foreground">{fmtNum(top.interested)} interested · {fmtNum(top.appStarted)} applications started · {fmtPct(top.conversionRate)} conversion</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
        <StatTile label="Active Counsellors" value={fmtNum(totals.active)} />
        <StatTile label="Leads Assigned" value={fmtNum(totals.assigned)} />
        <StatTile label="Total Calls" value={fmtNum(totals.calls)} />
        <StatTile label="Connected Calls" value={fmtNum(totals.connected)} />
        <StatTile label="Avg Talk Time" value={fmtDuration(totals.avgTalk)} />
        <StatTile label="Follow-ups Done" value={fmtNum(totals.fuCompleted)} />
        <StatTile label="Interested Leads" value={fmtNum(totals.interested)} />
        <StatTile label="Avg Connection Rate" value={fmtPct(totals.connRate)} />
      </div>

      <ReportCard title="Counsellor performance" subtitle="Click a row for the full drill-down">
        <DataTable
          rowKey={(r) => r.name}
          columns={[
            {
              key: "name", label: "Executive",
              render: (r) => (
                <button
                  type="button"
                  onClick={() => setSelected(r.name)}
                  className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {r.name}
                </button>
              ),
            },
            { key: "team", label: "Team" },
            {
              key: "status", label: "Status",
              render: (r) => (
                <StatusPill color={r.status === "Active" ? "var(--interested)" : "var(--muted-foreground)"}>{r.status}</StatusPill>
              ),
            },
            { key: "workingDays", label: "Days", align: "right" },
            { key: "leadsAssigned", label: "Assigned", align: "right" },
            { key: "leadsContacted", label: "Contacted", align: "right" },
            { key: "untouched", label: "Untouched", align: "right" },
            {
              key: "contactRate", label: "Contact %", align: "right",
              render: (r) => (
                <div className="flex items-center justify-end gap-2">
                  <Meter value={r.contactRate} className="w-12" />
                  <span className="tabular-nums">{fmtPct(r.contactRate, 0)}</span>
                </div>
              ),
            },
            { key: "totalCalls", label: "Calls", align: "right" },
            { key: "connected", label: "Connected", align: "right" },
            { key: "connectionPct", label: "Conn. %", align: "right", render: (r) => fmtPct(r.connectionPct, 0) },
            { key: "talkSec", label: "Talk Time", align: "right", render: (r) => fmtDuration(r.talkSec) },
            { key: "avgTalkSec", label: "Avg Talk", align: "right", render: (r) => fmtDuration(r.avgTalkSec) },
            { key: "interested", label: "Interested", align: "right" },
            { key: "appStarted", label: "App Started", align: "right" },
            { key: "conversionRate", label: "Conv. %", align: "right", render: (r) => fmtPct(r.conversionRate) },
            { key: "followupsDue", label: "F/U Due", align: "right" },
            { key: "lastActivity", label: "Last Active", render: (r) => fmtLast(r.lastActivity) },
          ]}
          rows={perf}
        />
      </ReportCard>

      <Drawer
        open={Boolean(detail)}
        onClose={() => setSelected(null)}
        title={detail?.name || ""}
        subtitle={detail ? `${detail.team} · ${detail.status}` : ""}
      >
        {detail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Total Calls" value={fmtNum(detail.totalCalls)} hint={`${detail.incoming} in · ${detail.outgoing} out`} />
              <StatTile label="Connected" value={fmtNum(detail.connected)} hint={fmtPct(detail.connectionPct) + " of outgoing"} />
              <StatTile label="Talk Time" value={fmtDuration(detail.talkSec)} hint={`avg ${fmtDuration(detail.avgTalkSec)}`} />
              <StatTile label="Conversion" value={fmtPct(detail.conversionRate)} hint={`${detail.interested} interested`} />
            </div>

            <section aria-label="Activity breakdown">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Activity</h3>
              <ul className="grid grid-cols-2 gap-2 text-xs">
                {[
                  [Phone, "Feedback updated", detail.feedbackUpdated],
                  [Clock, "Feedback pending", detail.feedbackPending],
                  [CalendarCheck, "Follow-ups scheduled", detail.followupsScheduled],
                  [Target, "Follow-ups completed", detail.followupsCompleted],
                  [Phone, "Notes added", detail.notesAdded],
                  [Target, "Links shared", detail.linksShared],
                ].map(([Icon, label, v]) => (
                  <li key={label} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1 text-muted-foreground">{label}</span>
                    <span className="font-semibold tabular-nums text-foreground">{fmtNum(v)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Feedback breakdown">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Feedback Breakdown</h3>
              <ul className="space-y-2">
                {detailFb.map((f) => (
                  <li key={f.id} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: f.color }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-xs">{f.label}</span>
                    <span className="text-xs font-semibold tabular-nums">{f.count}</span>
                    <Meter value={f.pct * 2.2} color={f.color} className="w-16" />
                  </li>
                ))}
              </ul>
            </section>

            <p className="text-[11px] text-muted-foreground">
              Last activity: {detail.lastActivity ? fmtDateTime(detail.lastActivity) : "—"}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
