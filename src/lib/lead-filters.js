// Filtering layer for the dashboard.
// Everything here is pure: swap `queryLeads` for a server-side query later and
// the UI stays unchanged.
import { LEADS } from "@/lib/crm-data";
import { activeFeedbackTaxonomy, getSettings, statusMatchesFeedback } from "@/lib/settings-store";

export const DATE_RANGES = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "quarter", label: "This Quarter" },
  { id: "year", label: "This Year" },
  { id: "custom", label: "Custom Date" },
];

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export function rangeBounds(range, from, to) {
  const now = new Date();
  const today = startOfDay(now);
  // End-of-day upper bound keeps SSR and client counts identical.
  const endOfToday = new Date(new Date(today).setHours(23, 59, 59, 999));
  switch (range) {
    case "today":
      return [today, endOfToday];
    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return [y, today];
    }
    case "week": {
      const w = new Date(today);
      w.setDate(w.getDate() - ((w.getDay() + 6) % 7));
      return [w, endOfToday];
    }
    case "month":
      return [new Date(now.getFullYear(), now.getMonth(), 1), endOfToday];
    case "quarter":
      return [new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1), endOfToday];
    case "year":
      return [new Date(now.getFullYear(), 0, 1), endOfToday];
    case "custom": {
      if (!from && !to) return null;
      const start = from ? startOfDay(from) : new Date(0);
      const end = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : endOfToday;
      return [start, end];
    }
    default:
      return null;
  }
}

const inRange = (iso, bounds) => {
  if (!bounds) return true;
  const t = new Date(iso).getTime();
  return t >= bounds[0].getTime() && t <= bounds[1].getTime();
};

const matchesText = (lead, q) => {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  return [lead.name, lead.cwid, lead.id, lead.mobile, lead.email]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(needle));
};

/**
 * AND between groups, OR within a group.
 * `skip` lets us compute counts for a group while ignoring that group itself.
 */
export function applyFilters(filters, skip = null) {
  const bounds = rangeBounds(filters.range, filters.from, filters.to);
  return LEADS.filter((l) => {
    if (skip !== "clients" && filters.clients.length && !filters.clients.includes(l.clientId)) return false;
    if (skip !== "programs" && filters.programs.length && !filters.programs.includes(l.program)) return false;
    if (skip !== "counsellors" && filters.counsellors.length && !filters.counsellors.includes(l.counsellor)) return false;
    if (skip !== "range" && !inRange(l.assignedDate, bounds)) return false;
    if (skip !== "status" && filters.status) {
      const status = activeFeedbackTaxonomy().find((item) => item.id === filters.status || item.legacyId === filters.status);
      if (status ? !statusMatchesFeedback(status, l.feedback) : l.feedback !== filters.status) return false;
    }
    if (skip !== "subs" && filters.subs.length && !filters.subs.includes(l.substatus)) return false;
    if (skip !== "q" && !matchesText(l, filters.q)) return false;
    return true;
  });
}

export function statusCounts(filters) {
  const base = applyFilters(filters, "status").filter(
    (l) => !filters.subs.length || filters.subs.includes(l.substatus),
  );
  const counts = {};
  for (const s of activeFeedbackTaxonomy()) counts[s.id] = 0;
  for (const l of base) {
    const status = activeFeedbackTaxonomy().find((item) => statusMatchesFeedback(item, l.feedback));
    if (status) counts[status.id] = (counts[status.id] || 0) + 1;
  }
  return counts;
}

export function substatusCounts(filters) {
  const base = applyFilters(filters, "subs");
  const counts = {};
  const status = activeFeedbackTaxonomy().find((item) => item.id === filters.status || item.legacyId === filters.status);
  const list = status?.subs || [];
  for (const s of list) counts[s.name] = 0;
  for (const l of base) if (l.substatus in counts) counts[l.substatus] += 1;
  return counts;
}

const SORTERS = {
  name: (a, b) => a.name.localeCompare(b.name),
  program: (a, b) => a.program.localeCompare(b.program),
  counsellor: (a, b) => a.counsellor.localeCompare(b.counsellor),
  status: (a, b) => a.feedback.localeCompare(b.feedback),
  lastContact: (a, b) => new Date(a.lastContact) - new Date(b.lastContact),
};

export function queryLeads(filters, { sort = "lastContact", dir = "desc", page = 1, pageSize = 10 } = {}) {
  const rows = applyFilters(filters);
  const sorter = SORTERS[sort] || SORTERS.lastContact;
  const sorted = [...rows].sort((a, b) => (dir === "asc" ? sorter(a, b) : sorter(b, a)));
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return {
    total,
    pageCount,
    page: safePage,
    rows: sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
  };
}

// ----- URL search params -------------------------------------------------
const csv = (v) => (typeof v === "string" && v ? v.split(",").filter(Boolean) : Array.isArray(v) ? v : []);

export function parseSearch(search) {
  const s = search || {};
  return {
    clients: csv(s.clients),
    programs: csv(s.programs),
    counsellors: csv(s.counsellors),
    subs: csv(s.subs),
    status: typeof s.status === "string" ? s.status : "",
    range: typeof s.range === "string" ? s.range : "month",
    from: typeof s.from === "string" ? s.from : "",
    to: typeof s.to === "string" ? s.to : "",
    q: typeof s.q === "string" ? s.q : "",
    sort: typeof s.sort === "string" ? s.sort : "lastContact",
    dir: s.dir === "asc" ? "asc" : "desc",
    page: Number(s.page) > 0 ? Number(s.page) : 1,
  };
}

export function toSearch(f) {
  const out = {};
  if (f.clients.length) out.clients = f.clients.join(",");
  if (f.programs.length) out.programs = f.programs.join(",");
  if (f.counsellors.length) out.counsellors = f.counsellors.join(",");
  if (f.subs.length) out.subs = f.subs.join(",");
  if (f.status) out.status = f.status;
  if (f.range && f.range !== "month") out.range = f.range;
  if (f.from) out.from = f.from;
  if (f.to) out.to = f.to;
  if (f.q) out.q = f.q;
  if (f.sort && f.sort !== "lastContact") out.sort = f.sort;
  if (f.dir === "asc") out.dir = "asc";
  if (f.page > 1) out.page = f.page;
  return out;
}

export const EMPTY_FILTERS = {
  clients: [], programs: [], counsellors: [], subs: [], status: "",
  range: "month", from: "", to: "", q: "", sort: "lastContact", dir: "desc", page: 1,
};
