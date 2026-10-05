import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { ReportCard, StatTile, Meter, DataTable, StatusPill } from "./shared.jsx";
import {
  callSummary, feedbackBreakdown, hourlyOutcomes, feedbackMeta,
  fmtDuration, fmtNum, fmtPct, fmtDateTime, deltaPct,
} from "@/lib/reports-data.js";

const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" };
const tooltipStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

export function CallReport({ calls, prevCalls }) {
  const sum = useMemo(() => callSummary(calls), [calls]);
  const prev = useMemo(() => callSummary(prevCalls), [prevCalls]);
  const fb = useMemo(() => feedbackBreakdown(calls.filter((c) => c.status === "connected")), [calls]);
  const hourly = useMemo(() => hourlyOutcomes(calls), [calls]);

  const tiles = [
    { label: "Total Calls", value: fmtNum(sum.total), delta: deltaPct(sum.total, prev.total) },
    { label: "Outgoing", value: fmtNum(sum.outgoing), delta: deltaPct(sum.outgoing, prev.outgoing) },
    { label: "Incoming", value: fmtNum(sum.incoming), delta: deltaPct(sum.incoming, prev.incoming) },
    { label: "Answered", value: fmtNum(sum.answered), delta: deltaPct(sum.answered, prev.answered) },
    { label: "Missed", value: fmtNum(sum.missed), delta: deltaPct(sum.missed, prev.missed), invert: true },
    { label: "Rejected", value: fmtNum(sum.rejected), delta: deltaPct(sum.rejected, prev.rejected), invert: true },
    { label: "Answer Rate", value: fmtPct(sum.answerRate), delta: deltaPct(sum.answerRate, prev.answerRate) },
    { label: "Total Talk Time", value: fmtDuration(sum.talkSec), delta: deltaPct(sum.talkSec, prev.talkSec) },
    { label: "Avg Talk Time", value: fmtDuration(sum.avgTalkSec), delta: deltaPct(sum.avgTalkSec, prev.avgTalkSec) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => <StatTile key={t.label} {...t} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ReportCard title="Call outcome distribution" subtitle="Share of answered calls by feedback">
          <div className="flex flex-col gap-4 2xl:flex-row">
            <div className="h-56 w-full 2xl:w-56 2xl:shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fb.filter((f) => f.count > 0)} dataKey="count" nameKey="label" innerRadius={52} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                    {fb.filter((f) => f.count > 0).map((f) => <Cell key={f.id} fill={f.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 overflow-y-auto">
              {fb.map((f) => (
                <li key={f.id} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: f.color }} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-xs text-foreground">{f.label}</span>
                  <span className="w-12 text-right text-xs font-semibold tabular-nums">{f.count}</span>
                  <span className="w-14 text-right text-[11px] tabular-nums text-muted-foreground">{fmtPct(f.pct)}</span>
                  <Meter value={f.pct * 2.2} color={f.color} className="hidden w-16 xl:block" />
                </li>
              ))}
            </ul>
          </div>
        </ReportCard>

        <ReportCard title="Hourly call outcomes" subtitle="Connected vs missed vs rejected, by hour">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="connected" name="Connected" stackId="a" fill="var(--interested)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="missed" name="Missed" stackId="a" fill="var(--warm)" />
              <Bar dataKey="rejected" name="Rejected" stackId="a" fill="var(--destructive)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>
      </div>

      <ReportCard title="Recent calls" subtitle="Latest 15 calls in the selected period">
        <DataTable
          rowKey={(r) => r.id}
          columns={[
            { key: "id", label: "Call ID" },
            { key: "ts", label: "Date & Time", render: (r) => fmtDateTime(r.ts) },
            { key: "leadName", label: "Lead" },
            { key: "counsellor", label: "Counsellor" },
            { key: "campaign", label: "Campaign" },
            { key: "type", label: "Type", render: (r) => <span className="capitalize">{r.type}</span> },
            {
              key: "status", label: "Outcome",
              render: (r) => (
                <StatusPill color={r.status === "connected" ? "var(--interested)" : r.status === "missed" ? "var(--warm)" : "var(--destructive)"}>
                  {r.status === "connected" ? "Connected" : r.status === "missed" ? "Missed" : "Rejected"}
                </StatusPill>
              ),
            },
            { key: "durationSec", label: "Duration", align: "right", render: (r) => fmtDuration(r.durationSec) },
            { key: "feedback", label: "Feedback", render: (r) => feedbackMeta(r.feedback)?.label || r.feedback },
            { key: "substatus", label: "Substatus" },
          ]}
          rows={calls.slice(0, 15)}
        />
      </ReportCard>
    </div>
  );
}
