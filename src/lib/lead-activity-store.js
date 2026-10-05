import { useSyncExternalStore } from "react";

// In-memory activity log for calls, dispositions and follow-ups made in this session.
const state = {
  calls: {},        // leadId -> [{ id, at, duration, outcome, by }]
  activity: {},     // leadId -> [{ id, at, type, title, detail }]
  followups: {},    // leadId -> ISO string
  dispositions: {}, // leadId -> { primaryDisposition, subpoint, step3Action, remarks, savedAt, followupAt }
};

let version = 0;
const listeners = new Set();
const emit = () => { version += 1; listeners.forEach((l) => l()); };
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
const getVersion = () => version;

// Persist across reloads so saved dispositions and follow-ups survive navigation.
const STORAGE_KEY = "cw.lead-activity";

if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch {
    /* ignore corrupt storage */
  }
}

const persist = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
};

const push = (bucket, leadId, entry) => {
  bucket[leadId] = [entry, ...(bucket[leadId] || [])];
};

export function logCall(leadId, { duration = 0, outcome = "Connected", by = "You" } = {}) {
  if (!leadId) return;
  const at = new Date().toISOString();
  push(state.calls, leadId, { id: `c-${Date.now()}`, at, duration, outcome, by });
  push(state.activity, leadId, {
    id: `a-${Date.now()}`,
    at,
    type: "call",
    title: `Call ${outcome.toLowerCase()}`,
    detail: `Duration ${formatDuration(duration)}`,
  });
  persist();
  emit();
}

export function logDisposition(leadId, payload) {
  if (!leadId) return;
  const at = payload.savedAt || new Date().toISOString();
  const detailBits = [payload.subpoint, payload.step3Action, payload.remarks].filter(Boolean);
  push(state.activity, leadId, {
    id: `a-${Date.now()}`,
    at,
    type: "status",
    title: `Disposition → ${payload.primaryDisposition}`,
    detail: detailBits.join(" · ") || undefined,
  });

  // Attach the disposition as the outcome of the most recent call from this session.
  const calls = state.calls[leadId];
  if (calls?.length && payload.callDuration) {
    calls[0] = { ...calls[0], outcome: payload.primaryDisposition };
  }

  if (payload.followupAt) {
    state.followups[leadId] = new Date(payload.followupAt).toISOString();
    push(state.activity, leadId, {
      id: `a-${Date.now()}-f`,
      at,
      type: "followup",
      title: "Follow-up scheduled",
      detail: new Date(payload.followupAt).toLocaleString(),
    });
  }
  state.dispositions[leadId] = {
    primaryDisposition: payload.primaryDisposition,
    subpoint: payload.subpoint,
    step3Action: payload.step3Action,
    remarks: payload.remarks,
    followupAt: payload.followupAt ? new Date(payload.followupAt).toISOString() : undefined,
    savedAt: at,
  };
  persist();
  emit();
}

export function formatDuration(s = 0) {
  const m = Math.floor(s / 60);
  return `${m}m ${String(s % 60).padStart(2, "0")}s`;
}

export function useLeadCalls(leadId) {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  return leadId ? state.calls[leadId] || [] : [];
}

export function useLeadActivity(leadId) {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  return leadId ? state.activity[leadId] || [] : [];
}

export function useFollowupOverrides() {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  return state.followups;
}

export function applyFollowups(leads, overrides) {
  return leads.map((l) => (overrides[l.id] ? { ...l, nextFollowup: overrides[l.id] } : l));
}

export function useDispositionOverrides() {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  return state.dispositions;
}
