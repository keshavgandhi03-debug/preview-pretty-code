import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth";
import { ReportFilterBar } from "@/components/reports/report-filters.jsx";
import { CallReport } from "@/components/reports/call-report.jsx";
import { UserReport } from "@/components/reports/user-report.jsx";
import { TrendsReport } from "@/components/reports/trends-report.jsx";
import {
  EMPTY_REPORT_FILTERS, filterCalls, filterLeadsByScope, reportRangeBounds,
  previousBounds, toCsv, downloadCsv, fmtDate, fmtTime, fmtDuration, feedbackMeta,
} from "@/lib/reports-data.js";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — CollegeWollege CRM" },
      { name: "description", content: "Call feedback, counsellor performance and trend analytics built from live calling activity." },
      { property: "og:title", content: "Reports & Analytics — CollegeWollege CRM" },
      { property: "og:description", content: "Call feedback, counsellor performance and trend analytics for admissions calling teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

const TABS = [
  { id: "call", label: "Call Feedback Report" },
  { id: "user", label: "User Performance Report" },
  { id: "trends", label: "Trends & Analytics" },
];

const CSV_COLUMNS = [
  { key: "date", label: "Call Date", value: (c) => fmtDate(c.ts) },
  { key: "time", label: "Call Time", value: (c) => fmtTime(c.ts) },
  { key: "lead", label: "Lead Name", value: (c) => c.leadName },
  { key: "mobile", label: "Mobile", value: (c) => c.mobile },
  { key: "counsellor", label: "Counsellor", value: (c) => c.counsellor },
  { key: "campaign", label: "Campaign", value: (c) => c.campaign },
  { key: "program", label: "Program", value: (c) => c.program },
  { key: "type", label: "Call Type", value: (c) => c.type },
  { key: "status", label: "Call Status", value: (c) => c.status },
  { key: "duration", label: "Duration", value: (c) => fmtDuration(c.durationSec) },
  { key: "feedback", label: "Feedback", value: (c) => feedbackMeta(c.feedback)?.label ?? "—" },
  { key: "sub", label: "Sub-status", value: (c) => c.substatus ?? "—" },
  { key: "notes", label: "Notes", value: (c) => c.note ?? "" },
  { key: "followUp", label: "Next Follow-up", value: (c) => (c.nextFollowup ? `${fmtDate(c.nextFollowup)} ${fmtTime(c.nextFollowup)}` : "") },
];

function Skeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-muted/50" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-border bg-muted/40" />
      <div className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />
    </div>
  );
}

function ReportsPage() {
  const { user } = useSession();
  const isCounsellor = user?.role === "Counsellor" && user?.name !== "Keshav Gandhi";
  const lockedCounsellor = isCounsellor ? user.name : null;

  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState("call");
  const [filters, setFilters] = useState(EMPTY_REPORT_FILTERS);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const scoped = useMemo(
    () => (lockedCounsellor ? { ...filters, counsellors: [lockedCounsellor] } : filters),
    [filters, lockedCounsellor],
  );

  const data = useMemo(() => {
    if (!hydrated) return null;
    void tick;
    const bounds = reportRangeBounds(scoped.range, scoped.from, scoped.to);
    const prev = previousBounds(bounds);
    const calls = filterCalls(scoped);
    const prevCalls = prev
      ? filterCalls({ ...scoped, range: "custom", from: prev[0].toISOString().slice(0, 10), to: prev[1].toISOString().slice(0, 10) })
      : [];
    return { bounds, calls, prevCalls, leads: filterLeadsByScope(scoped) };
  }, [hydrated, scoped, tick]);

  const onExport = () => {
    if (!data || data.calls.length === 0) {
      toast.error("Nothing to export for the selected filters.");
      return;
    }
    downloadCsv(`call-report-${scoped.range}.csv`, toCsv(data.calls, CSV_COLUMNS));
    toast.success(`Exported ${data.calls.length} call records.`);
  };

  return (
    <AppShell title="Reports & Analytics" breadcrumbs={[{ label: "Home", to: "/" }, { label: "Reports" }]}>
      <div className="p-6">
        <ReportFilterBar
          filters={filters}
          onChange={setFilters}
          onReset={() => { setFilters(EMPTY_REPORT_FILTERS); toast.success("Filters reset."); }}
          onExport={onExport}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          lockedCounsellor={lockedCounsellor}
        />

        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-semibold text-foreground">Counsellor calling analytics</h1>
            <p className="text-xs text-muted-foreground">
              Built from feedback captured by executives during calling.
              {lockedCounsellor && " Showing your own activity only."}
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="call" className="mt-4">
            {!data ? <Skeleton /> : <CallReport calls={data.calls} prevCalls={data.prevCalls} />}
          </TabsContent>

          <TabsContent value="user" className="mt-4">
            {!data ? <Skeleton /> : <UserReport calls={data.calls} leads={data.leads} filters={scoped} />}
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            {!data ? <Skeleton /> : <TrendsReport calls={data.calls} leads={data.leads} bounds={data.bounds} />}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
