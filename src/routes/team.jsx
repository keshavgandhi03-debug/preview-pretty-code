import { Fragment, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, LiveStatusBadge, Meter, Ring, SummaryTile } from "@/components/team/team-widgets";
import {
  DATE_RANGES, daysSince, fmtDate, fmtDuration, fmtMinutes,
  getExecCampaigns, getTeamSnapshot, summarize,
} from "@/lib/team-dashboard";
import {
  Users, PhoneCall, Phone, Heart, Flame, Clock, Coffee, XCircle,
  Activity, Radio, Timer, LogIn, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team Lead Dashboard — CollegeWollege CRM" },
      { name: "description", content: "Team lead view: live executive status, campaign-wise calling performance, break utilisation and lead conversion." },
      { property: "og:title", content: "Team Lead Dashboard — CollegeWollege CRM" },
      { property: "og:description", content: "Live agent status, campaign-wise KPIs and productivity for admissions calling teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

function RangeSelect({ value, onChange, className }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9 w-[150px] bg-card text-xs", className)}><SelectValue /></SelectTrigger>
      <SelectContent>
        {DATE_RANGES.map((r) => <SelectItem key={r.id} value={r.id} className="text-xs">{r.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function TeamPage() {
  const [range, setRange] = useState("today");
  const [perfRange, setPerfRange] = useState("today");
  const [tick, setTick] = useState(0);
  const [live, setLive] = useState(true);
  const [openId, setOpenId] = useState(null);

  // Simulated Dialer API stream — swap for a WebSocket subscription later.
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setTick((t) => t + 1), 6000);
    return () => clearInterval(id);
  }, [live]);

  const execs = useMemo(() => getTeamSnapshot(range, tick), [range, tick]);
  const perfExecs = useMemo(() => getTeamSnapshot(perfRange, tick), [perfRange, tick]);
  const s = useMemo(() => summarize(execs), [execs]);

  const rangeLabel = DATE_RANGES.find((r) => r.id === range)?.label ?? "Today";
  const perfLabel = DATE_RANGES.find((r) => r.id === perfRange)?.label ?? "Today";

  return (
    <AppShell title="Team Lead Dashboard" breadcrumbs={[{ label: "Home", to: "/" }, { label: "Team" }]}>
      <div className="sticky top-0 z-20 border-b border-border bg-background/85 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <RangeSelect value={range} onChange={setRange} />
          <button
            type="button"
            onClick={() => setLive((v) => !v)}
            className={cn(
              "ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
              live ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "border-border bg-card text-muted-foreground",
            )}
          >
            <Radio className={cn("h-3.5 w-3.5", live && "animate-pulse")} />
            {live ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Team summary */}
        <section>
          <SectionTitle icon={Activity} title="Team Summary" note={`${rangeLabel} · ${execs.length} executives`} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
            <SummaryTile label="Total Executives" value={s.total} icon={Users} sub={`${s.loggedIn} logged in`} />
            <SummaryTile label="Total Calls" value={s.calls.toLocaleString()} icon={Phone} sub={rangeLabel} />
            <SummaryTile label="Connected" value={s.connected.toLocaleString()} icon={PhoneCall} tone="good" sub={`${s.connectionRate}% connection`} />
            <SummaryTile label="Interested" value={s.interested.toLocaleString()} icon={Heart} tone="good" />
            <SummaryTile label="Positive" value={s.positive.toLocaleString()} icon={Flame} tone="warn" />
            <SummaryTile label="Lost" value={s.lost.toLocaleString()} icon={XCircle} tone="bad" />
            <SummaryTile label="Total Call Minutes" value={s.talkMinutes.toLocaleString()} icon={Timer} sub={fmtDuration(s.talkSeconds)} />
            <SummaryTile label="Avg Talk Time" value={fmtDuration(s.avgTalkSeconds)} icon={Clock} />
            <SummaryTile label="Connection %" value={`${s.connectionRate}%`} icon={Activity} tone="good" />
            <SummaryTile label="In Progress" value={s.inProgress.toLocaleString()} icon={Clock} sub="Follow-up / callback" />
          </div>
        </section>

        {/* Live team activity */}
        <section>
          <SectionTitle icon={Radio} title="Live Team Activity" note="Click an executive to expand campaign-wise performance" />
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="scrollbar-thin max-h-[560px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted/80 text-[10.5px] uppercase tracking-wider text-muted-foreground backdrop-blur">
                  <tr>
                    <Th className="pl-4 text-left">Executive</Th>
                    <Th className="pr-4 text-left">Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {execs.map((e) => {
                    const open = openId === e.id;
                    return (
                      <Fragment key={e.id}>
                        <tr
                          onClick={() => setOpenId(open ? null : e.id)}
                          className="cursor-pointer border-t border-border hover:bg-muted/30"
                        >
                          <td className="py-2.5 pl-4">
                            <div className="flex items-center gap-2.5">
                              <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
                              <Avatar name={e.name} />
                              <div className="leading-tight">
                                <div className="font-medium">{e.name}</div>
                                <div className="text-[11px] text-muted-foreground">TL · {e.teamLead}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4"><LiveStatusBadge status={e.status} /></td>
                        </tr>
                        {open && (
                          <tr className="border-t border-border bg-muted/20">
                            <td colSpan={2} className="px-4 py-3">
                              <CampaignBreakdown exec={e} range={range} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                  {execs.length === 0 && (
                    <tr><td colSpan={2} className="px-4 py-10 text-center text-sm text-muted-foreground">No executives available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Executive performance cards */}
        <section>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <SectionTitle icon={Users} title="Executive Performance" note={`Disposition-backed KPIs · ${perfLabel}`} className="mb-0" />
            <RangeSelect value={perfRange} onChange={setPerfRange} className="ml-auto h-8" />
          </div>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {perfExecs.map((e) => <ExecCard key={e.id} e={e} />)}
          </div>
        </section>

        <p className="pb-2 text-[11px] text-muted-foreground">
          Live agent state, login, call state and break timers stream from the Dialer API; KPI cards derive from Lead Dispositions once mapped.
        </p>
      </div>
    </AppShell>
  );
}

function CampaignBreakdown({ exec, range }) {
  const campaigns = useMemo(() => getExecCampaigns(exec, range), [exec, range]);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-[13px]">
        <thead className="bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <Th className="pl-3 text-left">Campaign</Th>
            <Th>Calls Made</Th>
            <Th>Connected</Th>
            <Th>Interested</Th>
            <Th>Positive</Th>
            <Th>Lost</Th>
            <Th>Total Call Minutes</Th>
            <Th className="pr-3">Avg Talk Time</Th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id} className="border-t border-border">
              <td className="py-2 pl-3">
                <div className="flex items-center gap-2">
                  <span className="truncate">{c.name}</span>
                  {c.active && <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">Current</span>}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Assigned {fmtDate(c.assignedSince)} · {daysSince(c.assignedSince)} day{daysSince(c.assignedSince) > 1 ? "s" : ""}
                </div>
              </td>
              <td className="px-3 py-2 text-center tabular-nums">{c.metrics.calls.toLocaleString()}</td>
              <td className="px-3 py-2 text-center tabular-nums">{c.metrics.connected.toLocaleString()}</td>
              <td className="px-3 py-2 text-center tabular-nums">{c.metrics.interested.toLocaleString()}</td>
              <td className="px-3 py-2 text-center tabular-nums">{c.metrics.positive.toLocaleString()}</td>
              <td className="px-3 py-2 text-center tabular-nums">{c.metrics.lost.toLocaleString()}</td>
              <td className="px-3 py-2 text-center tabular-nums">{Math.round(c.metrics.talkSeconds / 60).toLocaleString()}</td>
              <td className="py-2 pr-3 text-center tabular-nums">{fmtDuration(c.metrics.avgSeconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExecCard({ e }) {
  const m = e.metrics;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-start gap-3">
        <Avatar name={e.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{e.name}</span>
            <LiveStatusBadge status={e.status} className="ml-auto" />
          </div>
          <div className="truncate text-[11px] text-muted-foreground">{e.campaign.name}</div>
        </div>
      </div>

      {/* Compact shift strip */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Shift {e.shiftStart}</span>
        <span className="inline-flex items-center gap-1"><LogIn className="h-3 w-3" />Login {e.loginTime}</span>
        <span className={cn("inline-flex items-center gap-1", m.breakMinutes > 45 && "font-medium text-destructive")}>
          <Coffee className="h-3 w-3" />Break {fmtMinutes(m.breakMinutes)}
        </span>
        <span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" />Working {fmtMinutes(m.workingMinutes)}</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Calls" value={m.calls.toLocaleString()} />
        <Stat label="Connected" value={m.connected.toLocaleString()} tone="good" />
        <Stat label="Interested" value={m.interested.toLocaleString()} tone="good" />
        <Stat label="Positive" value={m.positive.toLocaleString()} tone="warn" />
        <Stat label="In Progress" value={m.inProgress.toLocaleString()} />
        <Stat label="Lost" value={m.lost.toLocaleString()} tone="bad" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Total Talk Time</div>
          <div className="text-base font-semibold tabular-nums">{fmtDuration(m.talkSeconds)}</div>
        </div>
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Avg Call Duration</div>
          <div className="text-base font-semibold tabular-nums">{fmtDuration(m.avgSeconds)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Ring value={m.connectionRate} label="Connect" tone="good" />
        <Ring value={m.interestRate} label="Interest" tone="info" />
        <Ring value={m.conversion} label="Convert" tone="warn" />
        <Ring value={m.productivity} label="Productive" tone={m.productivity > 55 ? "good" : "warn"} />
      </div>

      <div className="mt-3 space-y-2">
        <Meter label="Working hours completed" value={Math.min(100, Math.round((m.workingMinutes / m.shiftMinutes) * 100))} tone="info" />
        <Meter label="Break usage of allowance (60m)" value={Math.min(100, Math.round((m.breakMinutes / 60) * 100))} tone={m.breakMinutes > 45 ? "bad" : "warn"} />
      </div>

      <div className="mt-3 rounded-lg border border-border bg-background/60 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <Coffee className="h-3.5 w-3.5" /> Break Monitoring
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <Stat label="Status" value={e.status === "On Break" ? "On Break" : "Active"} tone={e.status === "On Break" ? "bad" : "good"} small />
          <Stat label="Total" value={fmtMinutes(m.breakMinutes)} tone={m.breakMinutes > 45 ? "bad" : "default"} small />
          <Stat label="Breaks" value={m.breakCount} small />
          <Stat label="Longest" value={`${m.longestBreak}m`} small />
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          {m.currentBreakStartedAt ? `Current break started at ${m.currentBreakStartedAt}` : "No active break"}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "default", small }) {
  const cls = {
    default: "text-foreground",
    good: "text-[color:var(--success)]",
    warn: "text-[color:var(--warm)]",
    bad: "text-destructive",
  }[tone];
  return (
    <div className="rounded-lg bg-muted/40 px-2 py-1.5">
      <div className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("font-semibold tabular-nums", small ? "text-[13px]" : "text-sm", cls)}>{value}</div>
    </div>
  );
}

function Th({ children, className }) {
  return <th className={cn("px-3 py-2.5 text-center font-medium", className)}>{children}</th>;
}

function SectionTitle({ icon: Icon, title, note, className }) {
  return (
    <div className={cn("mb-3 flex items-center gap-2", className)}>
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {note && <span className="truncate text-[11px] text-muted-foreground">· {note}</span>}
    </div>
  );
}
