import { useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { ReportCard, StatTile } from "./shared.jsx";
import { LeadsReport } from "./leads-report.jsx";
import {
  callTrendSeries, leadTrendSeries, activitySeries, activitySummary, callSummary,
  hourlyOutcomes, fmtNum, fmtPct, fmtDuration,
} from "@/lib/reports-data.js";

const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" };
const tooltipStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

const GROUPS = [
  { id: "hour", label: "Hour" },
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

function GroupToggle({ value, onChange, allowHour = false }) {
  return (
    <div role="group" aria-label="Group by" className="inline-flex rounded-md border border-input bg-card p-0.5">
      {GROUPS.filter((g) => allowHour || g.id !== "hour").map((g) => (
        <button
          key={g.id}
          type="button"
          aria-pressed={value === g.id}
          onClick={() => onChange(g.id)}
          className={cn(
            "rounded px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === g.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

export function TrendsReport({ calls, leads, bounds }) {
  const [subTab, setSubTab] = useState("calls");
  const [groupBy, setGroupBy] = useState("day");

  const callSeries = useMemo(() => callTrendSeries(calls, groupBy, bounds), [calls, groupBy, bounds]);
  const leadSeries = useMemo(() => leadTrendSeries(leads, calls, bounds), [leads, calls, bounds]);
  const actSeries = useMemo(() => activitySeries(calls, bounds), [calls, bounds]);
  const actSum = useMemo(() => activitySummary(calls), [calls]);
  const callSum = useMemo(() => callSummary(calls), [calls]);
  const peakHours = useMemo(
    () => [...hourlyOutcomes(calls)].sort((a, b) => b.connected - a.connected),
    [calls],
  );

  const tabs = [
    { id: "calls", label: "Calls Trend" },
    { id: "leads", label: "Leads Trend" },
    { id: "activity", label: "Activity Trend" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Trend type" className="inline-flex rounded-lg border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={subTab === t.id}
              onClick={() => setSubTab(t.id)}
              className={cn(
                "rounded-md px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                subTab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {subTab === "calls" && <GroupToggle value={groupBy} onChange={setGroupBy} allowHour />}
      </div>

      {subTab === "calls" && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
          <StatTile label="Total Calls" value={fmtNum(callSum.total)} />
          <StatTile label="Incoming" value={fmtNum(callSum.incoming)} />
          <StatTile label="Outgoing" value={fmtNum(callSum.outgoing)} />
          <StatTile label="Connected" value={fmtNum(callSum.answered)} />
          <StatTile label="Missed" value={fmtNum(callSum.missed)} />
          <StatTile label="Rejected" value={fmtNum(callSum.rejected)} />
          <StatTile label="Total Talk Time" value={fmtDuration(callSum.talkSec)} />
          <StatTile label="Connection Rate" value={fmtPct(callSum.answerRate)} />
        </div>
      )}

      {subTab === "calls" && (
        <ReportCard title="Call volume over time" subtitle={`Grouped by ${groupBy}`}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={callSeries}>
              <defs>
                <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="total" name="Total" stroke="var(--primary)" strokeWidth={2.5} fill="url(#tg1)" />
              <Line type="monotone" dataKey="connected" name="Connected" stroke="var(--interested)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ReportCard>
      )}

      {subTab === "calls" && (
        <ReportCard title="Peak calling hours" subtitle="Hours generating the most connected calls">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="connected" name="Connected" fill="var(--interested)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>
      )}

      {subTab === "leads" && <LeadsReport leads={leads} calls={calls} bounds={bounds} />}

      {subTab === "leads" && (
        <ReportCard title="Lead flow over time" subtitle="Created, contacted and interested per day">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={leadSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="created" name="Created" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="contacted" name="Contacted" fill="var(--followup)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="interested" name="Interested" fill="var(--interested)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>
      )}

      {subTab === "activity" && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatTile label="Feedback Updated" value={fmtNum(actSum.feedbackUpdated)} />
            <StatTile label="Feedback Pending" value={fmtNum(actSum.feedbackPending)} />
            <StatTile label="Follow-ups Scheduled" value={fmtNum(actSum.fuScheduled)} />
            <StatTile label="Follow-ups Completed" value={fmtNum(actSum.fuCompleted)} />
            <StatTile label="Notes Added" value={fmtNum(actSum.notes)} />
            <StatTile label="Links Shared" value={fmtNum(actSum.links)} />
          </div>
          <ReportCard title="Daily activity" subtitle="Counsellor activity counts per day">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={actSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="feedback" name="Feedback" stroke="var(--primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fuScheduled" name="F/U Scheduled" stroke="var(--followup)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fuCompleted" name="F/U Completed" stroke="var(--interested)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="notes" name="Notes" stroke="var(--warm)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="links" name="Links" stroke="var(--cold)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ReportCard>
        </>
      )}
    </div>
  );
}
