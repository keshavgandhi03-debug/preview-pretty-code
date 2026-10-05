import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ReportCard, StatTile, DataTable } from "./shared.jsx";
import { StatusBadge, PriorityDot } from "@/components/status-badge";
import { leadsSummary, leadStageDistribution, fmtNum, deltaPct } from "@/lib/reports-data.js";
import { maskMobile } from "@/lib/crm-data";

const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" };
const tooltipStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

export function LeadsReport({ leads, calls, prevCalls, prevLeadsSummary, bounds }) {
  const sum = useMemo(() => leadsSummary(leads, calls, bounds), [leads, calls, bounds]);
  const stages = useMemo(() => leadStageDistribution(leads), [leads]);

  const tiles = [
    { label: "Leads Assigned", value: fmtNum(sum.assigned), delta: deltaPct(sum.assigned, prevLeadsSummary?.assigned) },
    { label: "Leads Contacted", value: fmtNum(sum.contacted), delta: deltaPct(sum.contacted, prevLeadsSummary?.contacted) },
    { label: "Untouched", value: fmtNum(sum.untouched), delta: deltaPct(sum.untouched, prevLeadsSummary?.untouched), invert: true },
    { label: "Interested", value: fmtNum(sum.interested), delta: deltaPct(sum.interested, prevLeadsSummary?.interested) },
    { label: "Follow-ups Due", value: fmtNum(sum.followupsDue), delta: deltaPct(sum.followupsDue, prevLeadsSummary?.followupsDue), invert: true },
    { label: "Stale (7+ days)", value: fmtNum(sum.stale), delta: deltaPct(sum.stale, prevLeadsSummary?.stale), invert: true },
  ];

  const staleLeads = useMemo(() => {
    const now = Date.now();
    return leads
      .filter((l) => now - new Date(l.lastContact).getTime() > 7 * 86400000)
      .sort((a, b) => new Date(a.lastContact) - new Date(b.lastContact))
      .slice(0, 10);
  }, [leads]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => <StatTile key={t.label} {...t} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ReportCard title="Lead stage distribution" subtitle="Scoped leads by current stage">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stages} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="var(--primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard title="Stale leads needing attention" subtitle="No contact in the last 7 days">
          <DataTable
            dense
            rowKey={(r) => r.id}
            columns={[
              { key: "name", label: "Lead" },
              { key: "mobile", label: "Mobile", render: (r) => maskMobile(r.mobile) },
              { key: "counsellor", label: "Counsellor" },
              { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
              { key: "priority", label: "Priority", render: (r) => <PriorityDot priority={r.priority} /> },
              { key: "lastContact", label: "Last Contact", render: (r) => new Date(r.lastContact).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) },
            ]}
            rows={staleLeads}
            empty="No stale leads in scope. Great job!"
          />
        </ReportCard>
      </div>
    </div>
  );
}
