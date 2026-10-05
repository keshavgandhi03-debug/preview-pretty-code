// Team Dashboard data layer.
// Everything here is shaped like the future Dialer API + Lead Disposition API
// responses so the UI can be swapped to live data without changes.

import { CLIENTS } from "@/lib/crm-data";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const DATE_RANGES = [
  { id: "today", label: "Today", days: 1 },
  { id: "yesterday", label: "Yesterday", days: 1 },
  { id: "last7", label: "Last 7 Days", days: 7 },
  { id: "month", label: "This Month", days: 22 },
  { id: "lastmonth", label: "Last Month", days: 30 },
];

// Live agent states coming from the Dialer API.
export const AGENT_STATUSES = {
  "On Call": { dot: "bg-emerald-500", chip: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25", emoji: "🟢" },
  "Idle": { dot: "bg-amber-500", chip: "bg-amber-500/10 text-amber-700 ring-amber-500/25", emoji: "🟡" },
  "Ringing": { dot: "bg-sky-500", chip: "bg-sky-500/10 text-sky-700 ring-sky-500/25", emoji: "🔵" },
  "Wrap-up": { dot: "bg-orange-500", chip: "bg-orange-500/10 text-orange-700 ring-orange-500/25", emoji: "🟠" },
  "On Break": { dot: "bg-red-500", chip: "bg-red-500/10 text-red-700 ring-red-500/25", emoji: "🔴" },
  "Offline": { dot: "bg-slate-400", chip: "bg-muted text-muted-foreground ring-border", emoji: "⚪" },
};

export const AGENT_STATUS_LIST = Object.keys(AGENT_STATUSES);

// Future mapping: KPI cards derive from these dispositions once the
// Lead Disposition service is connected.
export const DISPOSITION_MAP = {
  interested: ["Interested", "Highly Interested"],
  positive: ["Warm", "Application Started", "Documents Pending", "Registration Pending", "Admission Confirmed"],
  inProgress: ["Follow-up", "Callback", "Cold"],
  lost: ["Not Connected", "Duplicate", "Wrong Number"],
};

export const RANK_METRICS = [
  { id: "calls", label: "Calls Made" },
  { id: "connected", label: "Connected Calls" },
  { id: "interested", label: "Interested Leads" },
  { id: "positive", label: "Positive Leads" },
  { id: "talkSeconds", label: "Talk Time" },
  { id: "conversion", label: "Conversion %" },
];

export const SHIFTS = [
  { id: "morning", label: "Morning (09:00 - 18:00)", start: "09:00" },
  { id: "mid", label: "Mid (11:00 - 20:00)", start: "11:00" },
  { id: "evening", label: "Evening (13:00 - 22:00)", start: "13:00" },
];

export const TEAM_LEADS = ["Ritika Sharma", "Arjun Mehta", "Neha Kapoor"];

const NAMES = [
  "Aarav Singh", "Isha Verma", "Rohan Gupta", "Simran Kaur", "Kabir Nair",
  "Ananya Rao", "Devansh Joshi", "Meera Pillai", "Yash Chauhan", "Tanvi Desai",
  "Aditya Bhatt", "Pooja Iyer", "Nikhil Menon", "Sana Qureshi", "Harsh Vardhan",
  "Riya Malhotra", "Vikram Sethi", "Diya Bansal", "Kunal Rathore", "Aisha Khan",
  "Manav Trivedi", "Shreya Ghosh", "Rahul Dubey", "Nandini Reddy",
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Deterministic pseudo-random so SSR and client render identically.
function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function fmtDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

export function fmtMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export function pct(a, b) {
  if (!b) return 0;
  return Math.round((a / b) * 1000) / 10;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysSince(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

/* ------------------------------------------------------------------ */
/* Mock "Dialer API" snapshot                                          */
/* ------------------------------------------------------------------ */

const BASE_EXECUTIVES = NAMES.map((name, i) => {
  const rnd = seeded(i * 977 + 13);
  const client = CLIENTS[i % CLIENTS.length];
  const shift = SHIFTS[i % SHIFTS.length];
  const assignedDaysAgo = 1 + Math.floor(rnd() * 40);
  const assignedSince = new Date(Date.now() - assignedDaysAgo * 86400000).toISOString();
  const status = AGENT_STATUS_LIST[Math.floor(rnd() * AGENT_STATUS_LIST.length)];
  const loginHour = Number(shift.start.slice(0, 2));
  const loginMinute = Math.floor(rnd() * 25);
  return {
    id: `exec-${i + 1}`,
    name,
    teamLead: TEAM_LEADS[i % TEAM_LEADS.length],
    shiftId: shift.id,
    shiftLabel: shift.label,
    shiftStart: shift.start,
    loginTime: `${String(loginHour).padStart(2, "0")}:${String(loginMinute).padStart(2, "0")}`,
    logoutTime: status === "Offline" ? "18:04" : null,
    campaign: {
      id: client.id,
      name: `Admissions Campaign — ${client.name}`,
      short: client.short,
      assignedSince,
    },
    status,
    _seed: i * 977 + 13,
  };
});

function buildMetrics(exec, days) {
  const rnd = seeded(exec._seed + days * 31);
  const perDay = 55 + Math.floor(rnd() * 70);
  const calls = perDay * days;
  const connected = Math.round(calls * (0.42 + rnd() * 0.3));
  const interested = Math.round(connected * (0.16 + rnd() * 0.16));
  const positive = Math.round(interested * (0.45 + rnd() * 0.3));
  const inProgress = Math.round(connected * (0.18 + rnd() * 0.14));
  const lost = Math.max(0, connected - interested - inProgress - Math.round(connected * 0.1));
  const avgSeconds = 90 + Math.floor(rnd() * 150);
  const talkSeconds = connected * avgSeconds;
  const admissions = Math.round(positive * (0.1 + rnd() * 0.18));

  const breakCount = 1 + Math.floor(rnd() * 4);
  const breakMinutes = 12 + Math.floor(rnd() * 48);
  const longestBreak = Math.max(8, Math.round(breakMinutes / breakCount) + Math.floor(rnd() * 9));
  const workingMinutes = 240 + Math.floor(rnd() * 300);

  return {
    calls,
    connected,
    interested,
    positive,
    inProgress,
    lost,
    admissions,
    talkSeconds,
    avgSeconds,
    connectionRate: pct(connected, calls),
    interestRate: pct(interested, connected),
    positiveRate: pct(positive, connected),
    conversion: pct(admissions, connected),
    productivity: Math.min(100, pct(talkSeconds / 60, workingMinutes)),
    breakCount,
    breakMinutes,
    longestBreak,
    currentBreakStartedAt: exec.status === "On Break" ? "14:36" : null,
    workingMinutes,
    shiftMinutes: 540,
  };
}

/**
 * Mock of `GET /api/dialer/team-snapshot?range=...`.
 * Replace the body with a fetch once the Dialer API is available —
 * the returned shape is the contract the UI depends on.
 */
export function getTeamSnapshot(rangeId, tick = 0) {
  const range = DATE_RANGES.find((r) => r.id === rangeId) || DATE_RANGES[0];
  return BASE_EXECUTIVES.map((exec, i) => {
    // `tick` simulates the live WebSocket/poll pushing new agent states.
    const status =
      tick === 0
        ? exec.status
        : AGENT_STATUS_LIST[(AGENT_STATUS_LIST.indexOf(exec.status) + tick + i) % AGENT_STATUS_LIST.length];
    const withStatus = { ...exec, status };
    return { ...withStatus, metrics: buildMetrics(withStatus, range.days) };
  });
}

export function summarize(execs) {
  const sum = (fn) => execs.reduce((a, e) => a + fn(e), 0);
  const calls = sum((e) => e.metrics.calls);
  const connected = sum((e) => e.metrics.connected);
  const talkSeconds = sum((e) => e.metrics.talkSeconds);
  const workingMinutes = sum((e) => e.metrics.workingMinutes) || 1;
  const byStatus = (s) => execs.filter((e) => e.status === s).length;
  return {
    total: execs.length,
    loggedIn: execs.filter((e) => e.status !== "Offline").length,
    onCall: byStatus("On Call"),
    idle: byStatus("Idle"),
    ringing: byStatus("Ringing"),
    wrapUp: byStatus("Wrap-up"),
    onBreak: byStatus("On Break"),
    offline: byStatus("Offline"),
    calls,
    connected,
    interested: sum((e) => e.metrics.interested),
    positive: sum((e) => e.metrics.positive),
    inProgress: sum((e) => e.metrics.inProgress),
    lost: sum((e) => e.metrics.lost),
    talkSeconds,
    talkMinutes: Math.round(talkSeconds / 60),
    avgTalkSeconds: connected ? Math.round(talkSeconds / connected) : 0,
    connectionRate: pct(connected, calls),
    productivity: Math.min(100, pct(talkSeconds / 60, workingMinutes)),
    breakMinutes: sum((e) => e.metrics.breakMinutes),
  };
}

/* ------------------------------------------------------------------ */
/* Campaign history per executive                                      */
/* ------------------------------------------------------------------ */

/**
 * Mock of `GET /api/dialer/executive/:id/campaigns?range=...`.
 * Returns every campaign assigned to the executive till date, with the
 * disposition-backed KPIs the manager needs inline.
 */
export function getExecCampaigns(exec, rangeId = "today") {
  const range = DATE_RANGES.find((r) => r.id === rangeId) || DATE_RANGES[0];
  const rnd = seeded(exec._seed + 7);
  const count = 2 + Math.floor(rnd() * 3);
  const startIndex = CLIENTS.findIndex((c) => c.id === exec.campaign.id);

  return Array.from({ length: count }, (_, k) => {
    const client = CLIENTS[(startIndex + k) % CLIENTS.length];
    const seed = exec._seed + k * 131;
    const m = buildMetrics({ _seed: seed, status: exec.status }, Math.max(1, Math.round(range.days / count)));
    const assignedDaysAgo = 2 + Math.floor(seeded(seed)() * 90);
    return {
      id: `${exec.id}-${client.id}`,
      name: `Admissions Campaign — ${client.name}`,
      short: client.short,
      assignedSince: new Date(Date.now() - assignedDaysAgo * 86400000).toISOString(),
      active: k === 0,
      metrics: m,
    };
  });
}
