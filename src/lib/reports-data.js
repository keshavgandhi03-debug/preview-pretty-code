// Reports data layer for the CollegeWollege Counsellor Calling Panel.
// ---------------------------------------------------------------------------
// Deterministic call/activity dataset derived from the CRM leads. Every
// aggregation here is a pure function of (calls, leads, filters) so the whole
// module can be swapped for Supabase/API queries later without touching UI.
// ---------------------------------------------------------------------------
import { LEADS, COUNSELLORS, PROGRAMS } from "@/lib/crm-data";

const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};
const rand = seededRandom(20260825);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// ----- Teams ---------------------------------------------------------------
export const TEAMS = [
  { id: "alpha", name: "Team Alpha" },
  { id: "beta", name: "Team Beta" },
];
export const TEAM_NAME = Object.fromEntries(TEAMS.map((t) => [t.id, t.name]));
export const COUNSELLOR_TEAM = {};
COUNSELLORS.forEach((c, i) => {
  COUNSELLOR_TEAM[c] = i % 2 === 0 ? "alpha" : "beta";
});

// ----- Call feedback taxonomy (10 report dispositions) ----------------------
export const REPORT_FEEDBACK = [
  { id: "not-connected", label: "Not Connected", color: "#f59e0b", subs: ["Ringing", "Busy", "Switched Off", "Not Reachable", "Call Cut", "Voicemail", "Call Rejected"] },
  { id: "invalid", label: "Invalid Number", color: "#ef4444", subs: ["Wrong Number", "Dead Number", "Does Not Exist"] },
  { id: "follow-up", label: "Follow-up", color: "#8b5cf6", subs: ["After 30 Minutes", "Evening 6 PM", "Tomorrow Morning", "After 2 Days", "Next Week"] },
  { id: "not-interested", label: "Not Interested", color: "#f43f5e", subs: ["Already Taken Admission", "Fee Too High", "Distance Issue", "Course Not Available", "Not Eligible"] },
  { id: "not-a-student", label: "Not a Student", color: "#3b82f6", subs: ["Working Professional", "Parent Enquiry", "General Query"] },
  { id: "interested-same", label: "Interested in Same University", color: "#10b981", subs: ["Will Visit Campus", "Scholarship Required", "Needs Fee Details"] },
  { id: "interested-other", label: "Interested in Another University", color: "#14b8a6", subs: ["Comparing Options", "Needs Counselling"] },
  { id: "enrolled-elsewhere", label: "Enrolled Somewhere Else", color: "#f97316", subs: ["Admission Confirmed Elsewhere"] },
  { id: "link-shared", label: "Brochure/Application Link Shared", color: "#6366f1", subs: ["Brochure on WhatsApp", "Application Link on Email", "Both Shared"] },
  { id: "app-started", label: "Application Started", color: "#0ea5e9", subs: ["Form Opened", "Documents Pending", "Payment Pending"] },
];
export const feedbackMeta = (id) => REPORT_FEEDBACK.find((f) => f.id === id);

const NOTE_POOL = [
  "Student asked about hostel facilities and fee structure.",
  "Parent wants a callback after discussing with family.",
  "Explained scholarship criteria and last date to apply.",
  "Student comparing with two other universities.",
  "Shared brochure and application link on WhatsApp.",
  "Asked for placement statistics of the CSE branch.",
  "Will visit campus this weekend with parents.",
  "Requested education loan assistance details.",
  "Student is waiting for board exam results.",
  "Asked about lateral entry and transfer options.",
  "Explained the difference between BBA and B.Com programs.",
  "Follow-up planned after entrance exam results.",
];

// ----- Deterministic call log ----------------------------------------------
const CONNECTED_WEIGHTS = [
  ["follow-up", 0.22], ["not-interested", 0.17], ["interested-same", 0.12],
  ["link-shared", 0.13], ["invalid", 0.08], ["interested-other", 0.07],
  ["app-started", 0.07], ["enrolled-elsewhere", 0.07], ["not-a-student", 0.07],
];
const weightedFeedback = () => {
  let r = rand();
  for (const [id, w] of CONNECTED_WEIGHTS) {
    if (r < w) return id;
    r -= w;
  }
  return "follow-up";
};

const dayAt = (offset, hour, minute) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offset);
  d.setHours(hour, minute, Math.floor(rand() * 60), 0);
  return d;
};

const generateCalls = () => {
  const calls = [];
  let n = 1;
  for (const lead of LEADS) {
    const attempts = 1 + Math.floor(rand() * 5);
    for (let i = 0; i < attempts; i++) {
      const ts = dayAt(Math.floor(rand() * 45), 9 + Math.floor(rand() * 10), Math.floor(rand() * 60));
      const type = rand() < 0.82 ? "outgoing" : "incoming";
      const roll = rand();
      let status, durationSec, feedbackId;
      if (roll < 0.52) {
        status = "connected";
        feedbackId = weightedFeedback();
        durationSec = feedbackId === "invalid" ? 8 + Math.floor(rand() * 25) : 35 + Math.floor(rand() * 560);
      } else if (roll < 0.86) {
        status = "missed";
        feedbackId = "not-connected";
        durationSec = 0;
      } else {
        status = "rejected";
        feedbackId = rand() < 0.3 ? "invalid" : "not-connected";
        durationSec = 0;
      }
      const meta = REPORT_FEEDBACK.find((f) => f.id === feedbackId);
      const followupScheduled = feedbackId === "follow-up" || rand() < 0.18;
      calls.push({
        id: `C-${String(n++).padStart(6, "0")}`,
        leadId: lead.id,
        leadName: lead.name,
        mobile: lead.mobile,
        counsellor: lead.counsellor,
        team: COUNSELLOR_TEAM[lead.counsellor],
        clientId: lead.clientId,
        campaign: lead.campaign,
        program: lead.program,
        ts: ts.toISOString(),
        type,
        status,
        durationSec,
        feedback: feedbackId,
        substatus: pick(meta.subs),
        note: status === "connected" ? pick(NOTE_POOL) : "",
        nextFollowup: followupScheduled ? dayAt(-(1 + Math.floor(rand() * 6)), 9 + Math.floor(rand() * 9), Math.floor(rand() * 60)).toISOString() : null,
        followupScheduled,
        followupCompleted: followupScheduled && rand() < 0.55,
        notesAdded: status === "connected" && rand() < 0.7,
        linkShared: feedbackId === "link-shared" || (status === "connected" && rand() < 0.14),
        feedbackUpdated: true,
      });
    }
  }
  return calls.sort((a, b) => new Date(b.ts) - new Date(a.ts));
};

export const CALL_LOG = generateCalls();

export const CAMPAIGN_LIST = [...new Set(LEADS.map((l) => l.campaign))].sort();
export const PROGRAM_LIST = [...PROGRAMS];

// ----- Date ranges -----------------------------------------------------------
export const REPORT_RANGES = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 Days" },
  { id: "thisWeek", label: "This Week" },
  { id: "lastWeek", label: "Last Week" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "custom", label: "Custom Range" },
];

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const mondayOf = (d) => {
  const x = startOfDay(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};

export function reportRangeBounds(range, from, to) {
  const now = new Date();
  const today = startOfDay(now);
  // End-of-day anchoring keeps SSR and client aggregations identical.
  const endToday = endOfDay(today);
  switch (range) {
    case "today": return [today, endToday];
    case "yesterday": {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return [y, endOfDay(y)];
    }
    case "last7": {
      const s = new Date(today); s.setDate(s.getDate() - 6);
      return [s, endToday];
    }
    case "thisWeek": return [mondayOf(now), endToday];
    case "lastWeek": {
      const thisMon = mondayOf(now);
      const prevMon = new Date(thisMon); prevMon.setDate(prevMon.getDate() - 7);
      const prevSun = new Date(thisMon); prevSun.setDate(prevSun.getDate() - 1);
      return [prevMon, endOfDay(prevSun)];
    }
    case "thisMonth": return [new Date(now.getFullYear(), now.getMonth(), 1), endToday];
    case "lastMonth": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevLast = new Date(first); prevLast.setDate(prevLast.getDate() - 1);
      return [prevFirst, endOfDay(prevLast)];
    }
    case "custom": {
      if (!from && !to) return null;
      const s = from ? startOfDay(from) : new Date(0);
      const e = to ? endOfDay(to) : endToday;
      return [s, e];
    }
    default: return null;
  }
}

/** Same-length period immediately before the selected one. */
export function previousBounds(bounds) {
  if (!bounds) return null;
  const len = bounds[1].getTime() - bounds[0].getTime() + 1;
  const prevEnd = new Date(bounds[0].getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - len + 1);
  return [prevStart, prevEnd];
}

// ----- Filtering -------------------------------------------------------------
export const EMPTY_REPORT_FILTERS = {
  counsellors: [], teams: [], campaigns: [], programs: [],
  range: "last7", from: "", to: "",
};

export function filterCalls(filters) {
  const bounds = reportRangeBounds(filters.range, filters.from, filters.to);
  return CALL_LOG.filter((c) => {
    if (filters.counsellors.length && !filters.counsellors.includes(c.counsellor)) return false;
    if (filters.teams.length && !filters.teams.includes(c.team)) return false;
    if (filters.campaigns.length && !filters.campaigns.includes(c.campaign)) return false;
    if (filters.programs.length && !filters.programs.includes(c.program)) return false;
    if (bounds) {
      const t = new Date(c.ts).getTime();
      if (t < bounds[0].getTime() || t > bounds[1].getTime()) return false;
    }
    return true;
  });
}

export function filterLeadsByScope(filters) {
  return LEADS.filter((l) => {
    const team = COUNSELLOR_TEAM[l.counsellor];
    if (filters.counsellors.length && !filters.counsellors.includes(l.counsellor)) return false;
    if (filters.teams.length && !filters.teams.includes(team)) return false;
    if (filters.campaigns.length && !filters.campaigns.includes(l.campaign)) return false;
    if (filters.programs.length && !filters.programs.includes(l.program)) return false;
    return true;
  });
}

// ----- Formatters --------------------------------------------------------------
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const fmtTime = (iso) => {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
};
export const fmtDateTime = (iso) => `${fmtDate(iso)}, ${fmtTime(iso)}`;
export const fmtDuration = (sec) => {
  if (!sec) return "0s";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  if (m) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
};
export const fmtNum = (n) => Number(n || 0).toLocaleString("en-IN");
export const fmtPct = (n, digits = 1) => `${(n || 0).toFixed(digits)}%`;

/** % change vs previous period; null when previous is 0. */
export function deltaPct(current, previous) {
  if (!previous) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

// ----- Aggregations ---------------------------------------------------------
export function callSummary(calls) {
  const total = calls.length;
  const incoming = calls.filter((c) => c.type === "incoming").length;
  const outgoing = total - incoming;
  const missed = calls.filter((c) => c.status === "missed").length;
  const rejected = calls.filter((c) => c.status === "rejected").length;
  const answered = calls.filter((c) => c.status === "connected").length;
  const talkSec = calls.reduce((s, c) => s + c.durationSec, 0);
  return {
    total, incoming, outgoing, missed, rejected, answered,
    talkSec,
    avgTalkSec: answered ? Math.round(talkSec / answered) : 0,
    answerRate: total ? (answered / total) * 100 : 0,
  };
}

export function feedbackBreakdown(calls) {
  const counts = {};
  for (const f of REPORT_FEEDBACK) counts[f.id] = 0;
  for (const c of calls) counts[c.feedback] = (counts[c.feedback] || 0) + 1;
  return REPORT_FEEDBACK.map((f) => ({
    ...f,
    count: counts[f.id] || 0,
    pct: calls.length ? ((counts[f.id] || 0) / calls.length) * 100 : 0,
  })).sort((a, b) => b.count - a.count);
}

export function hourlyOutcomes(calls) {
  const slots = [];
  for (let h = 9; h <= 18; h++) {
    const ap = h >= 12 ? "PM" : "AM";
    const label = `${h % 12 || 12} ${ap}`;
    slots.push({ hour: h, label, total: 0, connected: 0, missed: 0, rejected: 0 });
  }
  for (const c of calls) {
    const h = new Date(c.ts).getHours();
    const slot = slots.find((s) => s.hour === h);
    if (!slot) continue;
    slot.total += 1;
    slot[c.status] += 1;
  }
  return slots;
}

const STAGE_MAP = [
  { stage: "Fresh", match: ["Fresh Lead"] },
  { stage: "Contacted", match: ["Attempted", "Connected", "Not Connected", "Call Back Evening", "Call Back Tomorrow", "Busy", "Switched Off", "Disconnected", "Wrong Number"] },
  { stage: "Interested", match: ["Interested", "Warm"] },
  { stage: "Counselling", match: ["Counselling Started", "Brochure Shared", "Follow-up", "Cold"] },
  { stage: "Application Started", match: ["Application Started", "Documents Pending"] },
  { stage: "Submitted", match: ["Application Submitted", "Payment Pending", "Application Converted"] },
  { stage: "Admission", match: ["Admission Confirmed"] },
];

export function leadStageDistribution(leads) {
  return STAGE_MAP.map((s) => ({
    stage: s.stage,
    value: leads.filter((l) => s.match.includes(l.status)).length,
  }));
}

export function leadsSummary(leads, calls, bounds) {
  const inBounds = (iso) => {
    if (!bounds) return true;
    const t = new Date(iso).getTime();
    return t >= bounds[0].getTime() && t <= bounds[1].getTime();
  };
  const leadIds = new Set(leads.map((l) => l.id));
  const scopedCalls = calls.filter((c) => leadIds.has(c.leadId));
  const contactedIds = new Set(scopedCalls.map((c) => c.leadId));
  const created = leads.filter((l) => inBounds(l.assignedDate));
  const now = Date.now();
  const stale = leads.filter((l) => now - new Date(l.lastContact).getTime() > 7 * 86400000);
  return {
    created: created.length,
    assigned: created.length,
    untouched: leads.filter((l) => !contactedIds.has(l.id)).length,
    contacted: contactedIds.size,
    interested: leads.filter((l) => ["Interested", "Warm", "Application Started", "Counselling Started"].includes(l.status)).length,
    followupsDue: leads.filter((l) => l.nextFollowup && new Date(l.nextFollowup).getTime() < now).length,
    stale: stale.length,
  };
}

// ----- Trends series ---------------------------------------------------------
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function eachDay(bounds) {
  if (!bounds) return [];
  const days = [];
  const d = startOfDay(bounds[0]);
  while (d.getTime() <= bounds[1].getTime()) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function callTrendSeries(calls, groupBy, bounds) {
  if (groupBy === "hour") {
    return hourlyOutcomes(calls).map((s) => ({ label: s.label, total: s.total, connected: s.connected, missed: s.missed, rejected: s.rejected }));
  }
  const buckets = new Map();
  const push = (key, label) => { if (!buckets.has(key)) buckets.set(key, { label, total: 0, connected: 0, missed: 0, rejected: 0 }); return buckets.get(key); };
  for (const c of calls) {
    const d = new Date(c.ts);
    let key, label;
    if (groupBy === "week") {
      const m = mondayOf(d);
      key = `w-${dayKey(m)}`;
      label = `${fmtDate(m.toISOString()).slice(0, 6)} wk`;
    } else if (groupBy === "month") {
      key = `m-${d.getFullYear()}-${d.getMonth()}`;
      label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    } else {
      key = dayKey(d);
      label = fmtDate(d.toISOString()).slice(0, 6);
    }
    const b = push(key, label);
    b.total += 1;
    b[c.status] += 1;
  }
  return [...buckets.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([, v]) => v);
}

export function leadTrendSeries(leads, calls, bounds) {
  const days = eachDay(bounds);
  const firstCall = {};
  for (const c of [...calls].sort((a, b) => new Date(a.ts) - new Date(b.ts))) {
    if (!firstCall[c.leadId]) firstCall[c.leadId] = c;
  }
  const byDay = days.map((d) => ({
    key: dayKey(d),
    label: fmtDate(d.toISOString()).slice(0, 6),
    created: 0, assigned: 0, contacted: 0, interested: 0, untouched: 0,
  }));
  const idx = Object.fromEntries(byDay.map((b, i) => [b.key, i]));
  for (const l of leads) {
    const k = dayKey(new Date(l.assignedDate));
    if (k in idx) {
      byDay[idx[k]].created += 1;
      byDay[idx[k]].assigned += 1;
      if (!firstCall[l.id]) byDay[idx[k]].untouched += 1;
    }
  }
  for (const c of calls) {
    const k = dayKey(new Date(c.ts));
    if (!(k in idx)) continue;
    if (firstCall[c.leadId] && firstCall[c.leadId].id === c.id) {
      byDay[idx[k]].contacted += 1;
      if (["interested-same", "interested-other"].includes(c.feedback)) byDay[idx[k]].interested += 1;
    }
  }
  return byDay;
}

export function activitySeries(calls, bounds) {
  const days = eachDay(bounds);
  const byDay = days.map((d) => ({
    key: dayKey(d),
    label: fmtDate(d.toISOString()).slice(0, 6),
    feedback: 0, fuScheduled: 0, fuCompleted: 0, notes: 0, links: 0,
  }));
  const idx = Object.fromEntries(byDay.map((b, i) => [b.key, i]));
  for (const c of calls) {
    const k = dayKey(new Date(c.ts));
    if (!(k in idx)) continue;
    const b = byDay[idx[k]];
    if (c.feedbackUpdated) b.feedback += 1;
    if (c.followupScheduled) b.fuScheduled += 1;
    if (c.followupCompleted) b.fuCompleted += 1;
    if (c.notesAdded) b.notes += 1;
    if (c.linkShared) b.links += 1;
  }
  return byDay;
}

export function activitySummary(calls) {
  return {
    feedbackUpdated: calls.filter((c) => c.feedbackUpdated).length,
    feedbackPending: calls.filter((c) => !c.feedbackUpdated).length,
    fuScheduled: calls.filter((c) => c.followupScheduled).length,
    fuCompleted: calls.filter((c) => c.followupCompleted).length,
    notes: calls.filter((c) => c.notesAdded).length,
    links: calls.filter((c) => c.linkShared).length,
  };
}

// ----- User performance ------------------------------------------------------
export function buildUserPerformance(calls, leads, filters) {
  const scopedCounsellors = filters.counsellors.length
    ? filters.counsellors
    : COUNSELLORS.filter((c) => (filters.teams.length ? filters.teams.includes(COUNSELLOR_TEAM[c]) : true));
  return scopedCounsellors.map((name) => {
    const myCalls = calls.filter((c) => c.counsellor === name);
    const myLeads = leads.filter((l) => l.counsellor === name);
    const sum = callSummary(myCalls);
    const contactedIds = new Set(myCalls.map((c) => c.leadId));
    const contacted = myLeads.filter((l) => contactedIds.has(l.id)).length;
    const interested = myCalls.filter((c) => ["interested-same", "interested-other"].includes(c.feedback)).map((c) => c.leadId);
    const interestedCount = new Set(interested).size;
    const appStarted = myCalls.filter((c) => c.feedback === "app-started").map((c) => c.leadId);
    const days = new Set(myCalls.map((c) => dayKey(new Date(c.ts))));
    const outgoing = myCalls.filter((c) => c.type === "outgoing");
    const connectedOutgoing = outgoing.filter((c) => c.status === "connected").length;
    const now = Date.now();
    const lastActivity = myCalls.length ? myCalls.reduce((a, b) => (new Date(a.ts) > new Date(b.ts) ? a : b)).ts : null;
    return {
      name,
      team: TEAM_NAME[COUNSELLOR_TEAM[name]],
      teamId: COUNSELLOR_TEAM[name],
      status: myCalls.length ? "Active" : "Inactive",
      workingDays: days.size,
      leadsAssigned: myLeads.length,
      leadsContacted: contacted,
      untouched: Math.max(0, myLeads.length - contacted),
      followupsDue: myLeads.filter((l) => l.nextFollowup && new Date(l.nextFollowup).getTime() < now).length,
      followupsCompleted: myCalls.filter((c) => c.followupCompleted).length,
      interested: interestedCount,
      appStarted: new Set(appStarted).size,
      contactRate: myLeads.length ? (contacted / myLeads.length) * 100 : 0,
      conversionRate: contacted ? (interestedCount / contacted) * 100 : 0,
      totalCalls: sum.total,
      incoming: sum.incoming,
      outgoing: sum.outgoing,
      connected: sum.answered,
      missed: sum.missed,
      rejected: sum.rejected,
      talkSec: sum.talkSec,
      avgTalkSec: sum.avgTalkSec,
      connectionPct: outgoing.length ? (connectedOutgoing / outgoing.length) * 100 : 0,
      feedbackUpdated: myCalls.filter((c) => c.feedbackUpdated).length,
      feedbackPending: myCalls.filter((c) => !c.feedbackUpdated).length,
      notesAdded: myCalls.filter((c) => c.notesAdded).length,
      followupsScheduled: myCalls.filter((c) => c.followupScheduled).length,
      linksShared: myCalls.filter((c) => c.linkShared).length,
      lastActivity,
    };
  });
}

// ----- CSV export ------------------------------------------------------------
export function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => esc(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(typeof c.value === "function" ? c.value(r) : r[c.value])).join(","));
  return [header, ...body].join("\n");
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([`﻿${csvText}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
