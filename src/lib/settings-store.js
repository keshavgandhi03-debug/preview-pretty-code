// Settings module store (prototype persistence layer).
// ---------------------------------------------------------------------------
// Single source of truth for Organization, Customization (statuses /
// sub-statuses), User Profile and Teams data. Swap the read/write helpers for
// API calls later — components only use the exported hooks and actions.
// ---------------------------------------------------------------------------
import { useEffect, useState } from "react";
import { COUNSELLORS, PROGRAMS, CLIENTS, FEEDBACK_STATUSES, SUBSTATUS_MAP } from "@/lib/crm-data";

const KEY = "cw.settings.v1";

const uid = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

const STATUS_SEED = [
  { id: "not-connected", name: "Not Connected", color: "#f97316", icon: "PhoneOff", followUp: true },
  { id: "invalid", name: "Invalid Number", color: "#ef4444", icon: "Ban", followUp: false },
  { id: "follow-up", name: "Follow-up", color: "#8b5cf6", icon: "CalendarClock", followUp: true },
  { id: "not-interested", name: "Not Interested", color: "#e11d48", icon: "ThumbsDown", followUp: false },
  { id: "not-a-student", name: "Not a Student", color: "#3b82f6", icon: "UserX", followUp: false },
  { id: "interested-same", name: "Interested in Same University", color: "#10b981", icon: "GraduationCap", followUp: true },
  { id: "interested-other", name: "Interested in Another University", color: "#0ea5e9", icon: "School", followUp: true },
  { id: "enrolled-elsewhere", name: "Enrolled Somewhere Else", color: "#64748b", icon: "Archive", followUp: false },
];

const SUB_SEED = {
  "Not Connected": ["Ringing", "Busy", "Voicemail", "Switched Off", "Call Cut", "Not Reachable"],
  "Invalid Number": ["Wrong Number", "Number Does Not Exist"],
  "Follow-up": ["After 30 Minutes", "Evening 6 PM", "Tomorrow Morning / Evening", "After 2 Days", "Next Week", "Custom"],
  "Not Interested": ["Already Taken Admission", "Fee Too High", "Distance Issue", "Course Not Available", "Not Eligible"],
  "Not a Student": ["Parent Enquiry", "Working Professional"],
  "Interested in Same University": ["Scholarship Required", "Will Visit Campus", "Application Initiated", "Confused"],
  "Interested in Another University": ["Details of University", "Comparing Options"],
  "Enrolled Somewhere Else": ["Enrolled Elsewhere"],
};

const defaultStatuses = () =>
  STATUS_SEED.map((s, i) => ({
    id: s.id,
    legacyId: s.id === "interested-same" ? "interested" : s.id,
    name: s.name,
    description: `Calling outcome: ${s.name}`,
    color: s.color,
    icon: s.icon,
    order: i + 1,
    active: true,
    archived: false,
    notesRequired: !s.followUp,
    followUpAllowed: s.followUp,
    usedInHistory: i < 4,
    subs: (SUB_SEED[s.name] || []).map((n, j) => ({
      id: uid("sub"),
      name: n,
      description: "",
      order: j + 1,
      active: true,
      archived: false,
      notesRequired: false,
      followUpRequired: s.followUp,
      collegeRequired: s.name.startsWith("Interested"),
      programRequired: s.name.startsWith("Interested"),
      usedInHistory: j < 2,
    })),
  }));

const defaultMembers = () =>
  COUNSELLORS.map((name, i) => {
    const [first, ...rest] = name.split(" ");
    return {
      id: uid("mem"),
      firstName: first,
      lastName: rest.join(" "),
      phone: `+91 98${String(10000000 + i * 137).slice(0, 8)}`,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@collegewollege.com`,
      employeeId: `CW-${1200 + i}`,
      role: i === 0 ? "Super Admin" : i === 1 ? "Admin" : i < 4 ? "Team Lead" : "Counsellor",
      team: i % 3 === 0 ? "Alpha Squad" : i % 3 === 1 ? "Beta Squad" : "Gamma Squad",
      reportsTo: i === 0 ? "—" : COUNSELLORS[0],
      status: i === 8 ? "Inactive" : i === 9 ? "Suspended" : "Active",
      callingEnabled: i !== 8,
      liveTracking: i % 2 === 0,
    };
  });

const defaultTeams = () => [
  { id: uid("tm"), name: "Alpha Squad", code: "ALP", description: "Engineering intake calling", manager: COUNSELLORS[0], members: COUNSELLORS.slice(0, 4), campaigns: [CLIENTS[0].name, CLIENTS[1].name], programs: PROGRAMS.slice(0, 3), regions: ["West", "North"], active: true, distribution: "Round Robin", maxLeads: 120, activeCampaigns: 2, assignedLeads: 480, connectRate: 62, conversion: 11 },
  { id: uid("tm"), name: "Beta Squad", code: "BET", description: "Management programs", manager: COUNSELLORS[1], members: COUNSELLORS.slice(4, 7), campaigns: [CLIENTS[2].name], programs: PROGRAMS.slice(2, 5), regions: ["South"], active: true, distribution: "Workload Based", maxLeads: 90, activeCampaigns: 1, assignedLeads: 310, connectRate: 57, conversion: 9 },
  { id: uid("tm"), name: "Gamma Squad", code: "GAM", description: "Nurture + repeat leads", manager: COUNSELLORS[2], members: COUNSELLORS.slice(7), campaigns: [CLIENTS[3].name, CLIENTS[4].name], programs: PROGRAMS.slice(1, 4), regions: ["East", "Central"], active: false, distribution: "Equal", maxLeads: 70, activeCampaigns: 0, assignedLeads: 120, connectRate: 48, conversion: 6 },
];

const defaultDistribution = () => ({
  method: "Round Robin",
  defaultTeam: "Alpha Squad",
  fallbackTeam: "Beta Squad",
  maxLeadsPerMember: 120,
  respectCapacity: true,
  autoAssignNewLeads: true,
  rules: [
    { id: uid("rule"), name: "Engineering programs", condition: "Program is B.Tech, BCA or MCA", team: "Alpha Squad", priority: 1, active: true },
    { id: uid("rule"), name: "Management programs", condition: "Program is MBA or BBA", team: "Beta Squad", priority: 2, active: true },
  ],
});

const defaultSubscription = () => ({
  plan: "Growth",
  status: "Active",
  renewalDate: "2026-10-01",
  seats: 25,
  monthlyLeads: 10000,
  usedSeats: 10,
  usedLeads: 3840,
  autoRenew: true,
  invoiceEmail: "admissions@collegewollege.com",
});

const defaultRestoreItems = () => [
  { id: "archived-001", name: "Aarav Sharma", email: "aarav.sharma18@gmail.com", phone: "+91 98765 41022", archivedAt: "2026-08-28T10:30:00.000Z", archivedBy: "Keshav Gandhi", reason: "Duplicate lead", status: "Archived" },
  { id: "archived-002", name: "Diya Menon", email: "diya.menon42@gmail.com", phone: "+91 98210 77314", archivedAt: "2026-08-25T14:15:00.000Z", archivedBy: "Rahul Kapoor", reason: "Requested removal", status: "Archived" },
  { id: "archived-003", name: "Rohan Gupta", email: "rohan.gupta07@gmail.com", phone: "+91 99100 28416", archivedAt: "2026-08-21T09:45:00.000Z", archivedBy: "Anjali Rao", reason: "Invalid record", status: "Archived" },
];

const defaults = () => ({
  organization: {
    logo: "",
    name: "CollegeWollege Edu Services",
    email: "admissions@collegewollege.com",
    phone: "+91 98200 11223",
    website: "https://collegewollege.com",
    address: "4th Floor, Prabhat Tower, Andheri East",
    state: "Maharashtra",
    city: "Mumbai",
    timezone: "Asia/Kolkata (IST)",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    callStart: "09:30",
    callEnd: "19:00",
    callRecording: true,
    mandatoryFeedback: true,
  },
  profile: {
    firstName: "Keshav",
    lastName: "Gandhi",
    displayName: "Keshav G.",
    email: "keshav.g@collegewollege.com",
    countryCode: "+91",
    phone: "9820011223",
    employeeId: "CW-1200",
    designation: "Senior Counsellor",
    department: "Admissions",
    team: "Alpha Squad",
    reportsTo: "Anjali Rao",
    role: "Super Admin",
    language: "English",
    timezone: "Asia/Kolkata (IST)",
    picture: "",
    notifications: { email: true, whatsapp: true, push: true, followUpReminders: true },
  },
  statuses: defaultStatuses(),
  members: defaultMembers(),
  teams: defaultTeams(),
  distribution: defaultDistribution(),
  subscription: defaultSubscription(),
  importJobs: [],
  leadUpdates: [],
  restoreItems: defaultRestoreItems(),
});

let state = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l(state));

const normalizeStatus = (status) => {
  const seed = STATUS_SEED.find((s) => s.id === status.id || s.name.toLowerCase() === status.name?.toLowerCase());
  return seed
    ? { ...status, id: seed.id, legacyId: seed.id === "interested-same" ? "interested" : seed.id }
    : status;
};

const load = () => {
  if (state) return state;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = { ...defaults(), ...parsed, statuses: (parsed.statuses || defaults().statuses).map(normalizeStatus) };
        return state;
      }
    } catch {
      /* fall through to defaults */
    }
  }
  state = defaults();
  return state;
};

const persist = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — in-memory only */
  }
};

export function getSettings() {
  return load();
}

export function updateSettings(patch) {
  state = { ...load(), ...(typeof patch === "function" ? patch(load()) : patch) };
  persist();
  emit();
  return state;
}

export function useSettings() {
  const [snapshot, setSnapshot] = useState(() => (typeof window === "undefined" ? defaults() : load()));
  useEffect(() => {
    const sync = () => setSnapshot({ ...load() });
    sync();
    listeners.add(sync);
    return () => listeners.delete(sync);
  }, []);
  return snapshot;
}

export function resetSettings() {
  state = defaults();
  persist();
  emit();
}

/* ---------------------------------- roles --------------------------------- */

export const ROLES = ["Super Admin", "Admin", "Team Lead", "Counsellor"];
export const canEditOrganization = (role) => role === "Admin" || role === "Super Admin";
export const canManageCustomization = (role) => role === "Admin" || role === "Super Admin";
export const canManageTeams = (role) => role === "Admin" || role === "Super Admin" || role === "Team Lead";
export const canManageWorkspace = (role) => role === "Admin" || role === "Super Admin";

/* ------------------------------- statuses -------------------------------- */

const sortByOrder = (a, b) => a.order - b.order || a.name.localeCompare(b.name);

export const visibleStatuses = (s) => s.statuses.filter((x) => !x.archived).sort(sortByOrder);

export const statusTone = (status) => {
  const id = status?.id || status?.legacyId;
  if (["interested-same", "interested-other"].includes(id)) return "green";
  if (id === "not-connected") return "orange";
  if (id === "follow-up") return "purple";
  if (id === "invalid") return "red";
  if (id === "not-a-student") return "blue";
  return "rose";
};

export const statusMatchesFeedback = (status, feedback) => {
  if (!status || feedback == null) return false;
  const feedbackValue = String(feedback).trim().toLowerCase();
  if (!feedbackValue) return false;
  return status.id === feedback || status.legacyId === feedback || String(status.name || "").trim().toLowerCase() === feedbackValue;
};

export const statusSummary = (s) => {
  const live = s.statuses.filter((x) => !x.archived);
  const subs = live.flatMap((x) => x.subs.filter((y) => !y.archived));
  return {
    total: live.length,
    subs: subs.length,
    active: live.filter((x) => x.active).length,
    inactive: live.filter((x) => !x.active).length,
    archived: s.statuses.filter((x) => x.archived).length,
  };
};

const mapStatuses = (fn) => updateSettings((s) => ({ statuses: fn(s.statuses) }));

export function saveStatus(draft) {
  mapStatuses((list) => {
    if (draft.id) return list.map((s) => (s.id === draft.id ? { ...s, ...draft } : s));
    return [...list, { ...draft, id: uid("st"), archived: false, usedInHistory: false, subs: [] }];
  });
}

export function toggleStatusActive(id) {
  mapStatuses((list) => list.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
}

export function archiveStatus(id) {
  mapStatuses((list) => list.map((s) => (s.id === id ? { ...s, archived: true, active: false } : s)));
}

export function restoreStatus(id) {
  mapStatuses((list) => list.map((s) => (s.id === id ? { ...s, archived: false } : s)));
}

export function moveStatus(id, dir) {
  mapStatuses((list) => {
    const live = list.filter((s) => !s.archived).sort(sortByOrder);
    const i = live.findIndex((s) => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= live.length) return list;
    const swapped = [...live];
    [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
    const orders = new Map(swapped.map((s, idx) => [s.id, idx + 1]));
    return list.map((s) => (orders.has(s.id) ? { ...s, order: orders.get(s.id) } : s));
  });
}

export function saveSubstatus(statusId, draft) {
  mapStatuses((list) =>
    list.map((s) => {
      if (s.id !== statusId) {
        // parent changed in the drawer — drop it from the old parent
        return draft.id ? { ...s, subs: s.subs.filter((x) => x.id !== draft.id) } : s;
      }
      const exists = s.subs.some((x) => x.id === draft.id);
      return {
        ...s,
        subs: exists
          ? s.subs.map((x) => (x.id === draft.id ? { ...x, ...draft } : x))
          : [...s.subs, { ...draft, id: draft.id || uid("sub"), archived: false, usedInHistory: false }],
      };
    }),
  );
}

export function toggleSubstatusActive(statusId, subId) {
  mapStatuses((list) =>
    list.map((s) =>
      s.id === statusId ? { ...s, subs: s.subs.map((x) => (x.id === subId ? { ...x, active: !x.active } : x)) } : s,
    ),
  );
}

export function archiveSubstatus(statusId, subId) {
  mapStatuses((list) =>
    list.map((s) =>
      s.id === statusId
        ? { ...s, subs: s.subs.map((x) => (x.id === subId ? { ...x, archived: true, active: false } : x)) }
        : s,
    ),
  );
}

export function moveSubstatus(statusId, subId, dir) {
  mapStatuses((list) =>
    list.map((s) => {
      if (s.id !== statusId) return s;
      const live = s.subs.filter((x) => !x.archived).sort(sortByOrder);
      const i = live.findIndex((x) => x.id === subId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= live.length) return s;
      const swapped = [...live];
      [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
      const orders = new Map(swapped.map((x, idx) => [x.id, idx + 1]));
      return { ...s, subs: s.subs.map((x) => (orders.has(x.id) ? { ...x, order: orders.get(x.id) } : x)) };
    }),
  );
}

/**
 * Active taxonomy consumed by the calling feedback form, lead filters, lead
 * details, follow-ups, reports and bulk lead updates.
 */
export function activeFeedbackTaxonomy(s = load()) {
  return visibleStatuses(s)
    .filter((x) => x.active)
    .map((x) => ({
      id: x.id,
      legacyId: x.legacyId || x.id,
      label: x.name,
      color: x.color,
      tone: statusTone(x),
      notesRequired: x.notesRequired,
      followUpAllowed: x.followUpAllowed,
      subs: x.subs.filter((y) => !y.archived && y.active).sort(sortByOrder).map((y) => ({ ...y, label: y.name })),
    }));
}

/** Legacy fallback so untouched pages keep working. */
export const legacyTaxonomy = FEEDBACK_STATUSES.map((f) => ({ ...f, subs: SUBSTATUS_MAP[f.id] || [] }));

/* -------------------------------- members -------------------------------- */

export function saveMember(draft) {
  updateSettings((s) => ({
    members: draft.id
      ? s.members.map((m) => (m.id === draft.id ? { ...m, ...draft } : m))
      : [...s.members, { ...draft, id: uid("mem") }],
  }));
}

export function setMemberStatus(id, status) {
  updateSettings((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, status } : m)) }));
}

/* --------------------------------- teams --------------------------------- */

export const DISTRIBUTION_METHODS = ["Manual", "Round Robin", "Equal", "Workload Based"];

export function saveTeam(draft) {
  updateSettings((s) => ({
    teams: draft.id
      ? s.teams.map((t) => (t.id === draft.id ? { ...t, ...draft } : t))
      : [
          ...s.teams,
          { ...draft, id: uid("tm"), activeCampaigns: draft.campaigns?.length || 0, assignedLeads: 0, connectRate: 0, conversion: 0 },
        ],
  }));
}

export function setTeamActive(id, active) {
  updateSettings((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, active } : t)) }));
}

/* ----------------------------- workspace setup ---------------------------- */

export function updateDistribution(patch) {
  return updateSettings((s) => ({ distribution: { ...s.distribution, ...patch } }));
}

export function saveDistributionRule(draft) {
  return updateSettings((s) => ({
    distribution: {
      ...s.distribution,
      rules: draft.id
        ? s.distribution.rules.map((rule) => (rule.id === draft.id ? { ...rule, ...draft } : rule))
        : [...s.distribution.rules, { ...draft, id: uid("rule"), active: true }],
    },
  }));
}

export function removeDistributionRule(id) {
  return updateSettings((s) => ({ distribution: { ...s.distribution, rules: s.distribution.rules.filter((rule) => rule.id !== id) } }));
}

export function updateSubscription(patch) {
  return updateSettings((s) => ({ subscription: { ...s.subscription, ...patch } }));
}

export function createImportJob(draft) {
  const job = { ...draft, id: uid("imp"), importedAt: new Date().toISOString(), status: "Completed" };
  updateSettings((s) => ({ importJobs: [job, ...s.importJobs] }));
  return job;
}

export function createLeadUpdate(draft) {
  const update = { ...draft, id: uid("upd"), createdAt: new Date().toISOString(), status: "Applied" };
  updateSettings((s) => ({ leadUpdates: [update, ...s.leadUpdates] }));
  return update;
}

export function restoreLead(id) {
  updateSettings((s) => ({
    restoreItems: s.restoreItems.map((item) => (
      item.id === id ? { ...item, status: "Restored", restoredAt: new Date().toISOString(), restoredBy: s.profile.displayName } : item
    )),
  }));
}

export const memberFullName = (m) => `${m.firstName} ${m.lastName}`.trim();
export const initialsOf = (text) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
