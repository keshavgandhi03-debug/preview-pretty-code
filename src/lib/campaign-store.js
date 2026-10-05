// Campaign data layer for the /campaigns workspace.
// Pure derivation from the existing CRM data source + a tiny observable store
// so card mutations (status, assignment, counsellors, uploads) refresh in place.
// Swap `loadCampaigns` for a server query later; the UI contract stays the same.
import { CLIENTS, LEADS, COUNSELLORS, PROGRAMS, FEEDBACK_STATUSES, feedbackById } from "@/lib/crm-data";

export const CAMPAIGN_STATUSES = [
  { id: "Active", tone: "green" },
  { id: "Suspended", tone: "red" },
  { id: "Completed", tone: "blue" },
  { id: "Draft", tone: "slate" },
];

export const PRIORITIES = ["Low", "Medium", "High"];
export const LEVELS = ["Level 1 — Activation", "Level 2 — Counselling", "Level 3 — Admission"];
export const MASTER_COURSES = ["Engineering", "Management", "Design", "Law", "Sciences", "Commerce"];
export const BUCKETS = ["Fresh leads", "Untouched pool", "Follow-up pool", "Re-nurture", "Scholarship drive"];
export const CAMPAIGN_TYPES = ["Admissions calling", "Scholarship calling", "Re-nurture calling"];

const ZONE_BY_STATE = {
  Delhi: "North", Haryana: "North", Punjab: "North", "Uttar Pradesh": "North", Rajasthan: "North", Uttarakhand: "North",
  Maharashtra: "West", Gujarat: "West", Goa: "West",
  Karnataka: "South", "Tamil Nadu": "South", Telangana: "South", Kerala: "South",
  "West Bengal": "East", Odisha: "East", Bihar: "East", Assam: "East",
  "Madhya Pradesh": "Central", Chhattisgarh: "Central",
};

const REGION_BY_CITY = {
  Delhi: "Delhi NCR", Gurgaon: "Delhi NCR", Noida: "Delhi NCR",
  Mumbai: "Mumbai Metro", Pune: "West Maharashtra", Nagpur: "Vidarbha",
  Bengaluru: "Karnataka South", Chennai: "Coastal TN", Hyderabad: "Deccan",
  Kolkata: "Bengal", Ahmedabad: "Gujarat Central", Jaipur: "Rajasthan East",
  Lucknow: "Awadh", Chandigarh: "Tricity", Kochi: "Malabar",
  Bhopal: "MP Central", Indore: "Malwa",
};

const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
};

const pickFrom = (arr, seed) => arr[seed % arr.length];

function statsFor(leads) {
  const untouched = leads.filter((l) => l.status === "Fresh Lead" || l.status === "Attempted").length;
  const notInterested = leads.filter((l) => l.feedback === "not-interested" || l.feedback === "invalid").length;
  const interested = leads.filter((l) => l.feedback === "interested").length;
  const followups = leads.filter((l) => l.feedback === "follow-up").length;
  const total = leads.length;
  const processed = total - untouched;
  return {
    untouched,
    notInterested,
    interested,
    followups,
    total,
    processed,
    untouchedPct: total ? Math.round((untouched / total) * 100) : 0,
    processedPct: total ? Math.round((processed / total) * 100) : 0,
  };
}

function programsFor(leads) {
  const counts = new Map();
  for (const l of leads) counts.set(l.program, (counts.get(l.program) || 0) + 1);
  return [...counts.entries()]
    .filter(([name]) => PROGRAMS.includes(name))
    .map(([name, leadCount]) => ({ name, leads: leadCount }))
    .sort((a, b) => b.leads - a.leads);
}

function buildCampaigns() {
  return CLIENTS.map((client) => {
    const leads = LEADS.filter((l) => l.clientId === client.id);
    const seed = hash(client.id);
    const cityRow = leads[0] || { city: "Delhi", state: "Delhi" };
    const counsellorNames = COUNSELLORS.slice(0, Math.max(3, client.counsellors % COUNSELLORS.length || 4));
    return {
      id: client.id,
      clientId: client.id,
      name: client.name,
      short: client.short,
      color: client.color,
      status: pickFrom(["Active", "Active", "Suspended", "Active", "Completed", "Draft"], seed),
      type: pickFrom(CAMPAIGN_TYPES, seed),
      state: cityRow.state,
      city: cityRow.city,
      zone: ZONE_BY_STATE[cityRow.state] || "North",
      region: REGION_BY_CITY[cityRow.city] || "Other",
      counsellors: counsellorNames.map((name, i) => ({
        name,
        initials: name.split(" ").map((p) => p[0]).join("").slice(0, 2),
        leads: 20 + ((seed + i * 7) % 60),
        role: i === 0 ? "Team lead" : "Counsellor",
        status: pickFrom(["Online", "On Call", "Idle"], seed + i),
      })),
      assignedCount: counsellorNames.length,
      programs: programsFor(leads),
      stats: statsFor(leads),
      extraLeads: 0,
      updatedAt: new Date(0).toISOString(),
    };
  });
}

// ---- observable store ------------------------------------------------------

let state = buildCampaigns();
const listeners = new Set();

const emit = () => {
  state = [...state];
  listeners.forEach((fn) => fn());
};

export const subscribeCampaigns = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getCampaigns = () => state;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const update = (id, patch) => {
  state = state.map((c) => (c.id === id ? { ...c, ...patch(c) } : c));
  emit();
};

export async function setCampaignStatus(id, status) {
  await wait(200);
  update(id, () => ({ status }));
}

export async function saveCounsellors(id, names) {
  await wait(300);
  if (!names.length) throw new Error("A campaign needs at least one counsellor.");
  update(id, (c) => ({
    assignedCount: names.length,
    counsellors: names.map((name, i) => {
      const existing = c.counsellors.find((x) => x.name === name);
      return existing || {
        name,
        initials: name.split(" ").map((p) => p[0]).join("").slice(0, 2),
        leads: 0,
        role: i === 0 ? "Team lead" : "Counsellor",
        status: "Idle",
      };
    }),
  }));
}

export function availableLeads(campaign) {
  return campaign.stats.untouched + campaign.extraLeads;
}

export async function assignCampaign(form) {
  await wait(600);
  const campaign = state.find((c) => c.id === form.clientId);
  if (!campaign) throw new Error("Selected client is no longer available.");
  const capacity = availableLeads(campaign);
  if (form.leadCount > capacity) {
    throw new Error(`Only ${capacity} leads are available in this bucket.`);
  }
  const unauthorized = form.counsellors.filter((n) => !COUNSELLORS.includes(n));
  if (unauthorized.length) throw new Error(`Not authorised: ${unauthorized.join(", ")}`);
  update(campaign.id, (c) => ({
    status: c.status === "Draft" ? "Active" : c.status,
    counsellors: c.counsellors,
    stats: { ...c.stats },
    extraLeads: c.extraLeads,
    updatedAt: new Date().toISOString(),
  }));
  return { assigned: form.leadCount, campaign: campaign.name };
}

export async function uploadLeads(id, rows) {
  await wait(400);
  update(id, (c) => {
    const total = c.stats.total + rows;
    const untouched = c.stats.untouched + rows;
    return {
      extraLeads: c.extraLeads + rows,
      stats: {
        ...c.stats,
        total,
        untouched,
        processed: total - untouched,
        untouchedPct: Math.round((untouched / total) * 100),
        processedPct: Math.round(((total - untouched) / total) * 100),
      },
    };
  });
}

// ---- filtering -------------------------------------------------------------

export const ASSIGNMENT_OPTIONS = ["All", "Assigned", "Unassigned"];

const uniq = (arr) => [...new Set(arr)].sort();

export function filterOptions(campaigns) {
  return {
    status: CAMPAIGN_STATUSES.map((s) => s.id),
    zone: uniq(campaigns.map((c) => c.zone)),
    region: uniq(campaigns.map((c) => c.region)),
    state: uniq(campaigns.map((c) => c.state)),
    city: uniq(campaigns.map((c) => c.city)),
    caller: uniq(campaigns.flatMap((c) => c.counsellors.map((x) => x.name))),
    assignment: ASSIGNMENT_OPTIONS,
  };
}

export const EMPTY_FILTERS = {
  status: [], zone: [], region: [], state: [], city: [], caller: [], assignment: "All", q: "",
};

const matchesMulti = (selected, value) => !selected.length || selected.includes(value);

export function filterCampaigns(campaigns, f) {
  const q = (f.q || "").trim().toLowerCase();
  return campaigns.filter((c) => {
    if (!matchesMulti(f.status, c.status)) return false;
    if (!matchesMulti(f.zone, c.zone)) return false;
    if (!matchesMulti(f.region, c.region)) return false;
    if (!matchesMulti(f.state, c.state)) return false;
    if (!matchesMulti(f.city, c.city)) return false;
    if (f.caller.length && !c.counsellors.some((x) => f.caller.includes(x.name))) return false;
    if (f.assignment === "Assigned" && c.assignedCount === 0) return false;
    if (f.assignment === "Unassigned" && c.assignedCount > 0) return false;
    if (q) {
      const leadHit = LEADS.some(
        (l) =>
          l.clientId === c.clientId &&
          [l.name, l.cwid, l.mobile, l.email].some((v) => String(v || "").toLowerCase().includes(q)),
      );
      const campaignHit = [c.name, c.short, c.city, c.state, c.zone, c.region, c.type]
        .some((v) => String(v).toLowerCase().includes(q));
      if (!leadHit && !campaignHit) return false;
    }
    return true;
  });
}

export const activeFilterCount = (f) =>
  f.status.length + f.zone.length + f.region.length + f.state.length + f.city.length +
  f.caller.length + (f.assignment !== "All" ? 1 : 0);

// ---- per-program (campaign) feedback breakdown -----------------------------

// Each program inside a client tile is itself a calling campaign, so clicking it
// should reveal how that program's leads responded on call.
export function programFeedback(clientId, program) {
  const leads = LEADS.filter((l) => l.clientId === clientId && l.program === program);
  const total = leads.length;
  const buckets = FEEDBACK_STATUSES.map((f) => {
    const rows = leads.filter((l) => l.feedback === f.id);
    const subs = new Map();
    for (const l of rows) if (l.substatus) subs.set(l.substatus, (subs.get(l.substatus) || 0) + 1);
    return {
      id: f.id,
      label: f.label,
      tone: f.tone,
      count: rows.length,
      pct: total ? Math.round((rows.length / total) * 100) : 0,
      substatuses: [...subs.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4),
    };
  }).filter((b) => b.count > 0);

  const recent = [...leads]
    .sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact))
    .slice(0, 5)
    .map((l) => ({
      id: l.id,
      name: l.name,
      feedback: l.feedback,
      label: feedbackById(l.feedback)?.label || l.feedback,
      substatus: l.substatus || "—",
      lastContact: l.lastContact,
    }));

  return { total, buckets, recent };
}
