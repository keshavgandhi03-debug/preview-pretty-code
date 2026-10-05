// Multi-step disposition flow: primary stage -> subpoint -> contextual detail form.
import {
  ThumbsUp, ThumbsDown, PhoneOff, CalendarClock, Ban, XCircle,
  Sparkles, Building2, HelpCircle, Award, FileText, MapPin, Rocket,
  PhoneCall, PhoneMissed, Voicemail, PowerOff, SignalZero,
  GraduationCap, IndianRupee, Route, BookX, ShieldAlert, MessageSquareWarning,
  Clock, Sunset, Sunrise, Moon, CalendarDays, CalendarRange, Settings2, Skull,
} from "lucide-react";

export const FOLLOWUP_PRESETS = [
  { id: "30min", label: "+30 min", icon: Clock },
  { id: "evening6", label: "Evening, 6 PM", icon: Sunset },
  { id: "tomorrow-morning", label: "Tomorrow Morning", icon: Sunrise },
  { id: "tomorrow-evening", label: "Tomorrow Evening", icon: Moon },
  { id: "after-2-days", label: "After 2 Days", icon: CalendarDays },
  { id: "next-week", label: "Next Week", icon: CalendarRange },
  { id: "custom", label: "Custom", icon: Settings2 },
];

const at = (d, h, m = 0) => { const x = new Date(d); x.setHours(h, m, 0, 0); return x; };

export function resolveFollowupPreset(presetId, now = new Date()) {
  const d = new Date(now);
  switch (presetId) {
    case "30min": return new Date(now.getTime() + 30 * 60000);
    case "evening6": {
      const t = at(d, 18);
      if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1);
      return t;
    }
    case "tomorrow-morning": { const t = at(d, 10); t.setDate(t.getDate() + 1); return t; }
    case "tomorrow-evening": { const t = at(d, 18); t.setDate(t.getDate() + 1); return t; }
    case "after-2-days": { const t = at(d, 10); t.setDate(t.getDate() + 2); return t; }
    case "next-week": { const t = at(d, 10); t.setDate(t.getDate() + 7); return t; }
    default: return null;
  }
}

export const formatFollowup = (date) =>
  date
    ? date.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      }).replace(",", " —")
    : "";

// Field helpers
const text = (id, label, opts = {}) => ({ id, label, type: "text", ...opts });
const area = (id, label, opts = {}) => ({ id, label, type: "textarea", full: true, ...opts });
const select = (id, label, options, opts = {}) => ({ id, label, type: "select", options, ...opts });
const date = (id, label, opts = {}) => ({ id, label, type: "date", ...opts });
const time = (id, label, opts = {}) => ({ id, label, type: "time", ...opts });
const chips = (id, label, options, opts = {}) => ({ id, label, type: "chips", options, full: true, ...opts });
const check = (id, label, opts = {}) => ({ id, label, type: "checkbox", full: true, ...opts });
const followup = (opts = {}) => ({ id: "followup", label: "Follow-up scheduling", type: "followup", full: true, ...opts });
const share = (id, label, actions) => ({ id, label, type: "actions", actions, full: true });

export const PRIMARY_FLOWS = {
  interested: {
    key: "interested",
    label: "Interested",
    icon: ThumbsUp,
    color: "emerald",
    options: [
      {
        id: "same", label: "Interested in Same", fullLabel: "Interested in Same University", icon: Sparkles,
        step3: {
          kind: "choice",
          heading: "Choose the next action",
          choices: [
            {
              id: "brochure-link-shared", label: "Brochure and Application Link Shared", icon: FileText,
              fields: [
                share("share", "Sharing actions", ["Share Brochure", "Share Application Link"]),
                followup(),
              ],
            },
            { id: "application-started", label: "Application Started", icon: Rocket, fields: [followup()] },
          ],
        },
      },
      {
        id: "another-university", label: "Interested in Another University", icon: Building2,
        step3: {
          fields: [
            text("universityName", "University / college name"),
            text("interestedCourse", "Interested course"),
            text("preferredCity", "City or preferred location"),
            followup(),
            area("notes", "Notes"),
          ],
        },
      },
      {
        id: "confused", label: "Confused", icon: HelpCircle,
        step3: {
          fields: [
            area("confusionReason", "Confusion (why) / reason notes"),
            text("coursesCompared", "Courses being compared"),
            followup(),
          ],
        },
      },
      {
        id: "scholarship", label: "Scholarship Required", icon: Award,
        step3: {
          fields: [
            text("expectedBudget", "Expected budget"),
            text("scholarshipRequirement", "Scholarship requirement"),
            area("scholarshipDetails", "Scholarship details discussed"),
            followup(),
          ],
        },
      },
      {
        id: "details-university", label: "Details About University", icon: FileText,
        step3: {
          fields: [
            area("detailsRequested", "Details requested"),
            select("channel", "Preferred communication channel", ["WhatsApp", "Email", "Phone Call", "SMS"]),
            share("share", "Brochure sharing", ["Share Brochure"]),
            followup(),
          ],
        },
      },
      {
        id: "will-visit-campus", label: "Will Visit Campus", icon: MapPin,
        step3: {
          fields: [
            text("campus", "Campus / university"),
            date("visitDate", "Visit date", { required: true }),
            time("visitTime", "Visit time"),
            text("accompaniedBy", "Person accompanying"),
            area("visitNotes", "Visit notes"),
          ],
        },
      },
      {
        id: "application-initiated", label: "Application Initiated", icon: Rocket,
        step3: {
          fields: [
            select("applicationStatus", "Application status", ["Not Started", "In Progress", "Submitted"]),
            select("applicationLinkShared", "Application link shared", ["Yes", "No"]),
            date("applicationStartedDate", "Application started date"),
            followup(),
          ],
        },
      },
    ],
  },

  "not-connected": {
    key: "not-connected",
    label: "Not Connected",
    icon: PhoneOff,
    color: "orange",
    options: [
      { id: "ringing", label: "Ringing", icon: PhoneCall },
      { id: "busy-call-cut", label: "Busy / Call Cut", icon: PhoneMissed },
      { id: "switched-off", label: "Switched Off", icon: PowerOff },
      { id: "voicemail", label: "Voicemail", icon: Voicemail },
      { id: "not-reachable", label: "Not Reachable", icon: SignalZero },
    ].map((o) => ({ ...o, step3: { fields: [followup({ required: true })] } })),
  },

  "follow-up": {
    key: "follow-up",
    label: "Follow Up",
    icon: CalendarClock,
    color: "blue",
    options: FOLLOWUP_PRESETS.map((p) => ({
      id: p.id,
      label: p.id === "30min" ? "+30 Minutes" : p.label,
      icon: p.icon,
      preset: p.id,
      step3: { kind: "followup-preset" },
    })),
  },

  "not-interested": {
    key: "not-interested",
    label: "Not Interested",
    icon: ThumbsDown,
    color: "red",
    options: [
      {
        id: "already-admission", label: "Already Taken Admission", icon: GraduationCap,
        step3: {
          fields: [
            text("collegeName", "Where — College Name", { required: true }),
            select("when", "When", ["This Week", "Last Week", "This Month", "Earlier"]),
          ],
          buttons: true,
        },
      },
      {
        id: "fees-too-high", label: "Fees Too High", icon: IndianRupee,
        step3: {
          fields: [
            chips("budgetRange", "Budget range (select all that apply)",
              ["Under ₹1L", "₹1L – ₹2L", "₹2L – ₹4L", "₹4L – ₹6L", "Above ₹6L"], { multiple: true }),
            check("scholarshipRequired", "Scholarship required"),
            text("suggestedCwid", "Suggested another CW ID"),
            followup(),
          ],
        },
      },
      {
        id: "distance-issue", label: "Distance Issue", icon: Route,
        step3: {
          fields: [
            text("suggestedCwid", "Suggested another CW ID"),
            text("altUniversity", "Alternative university / college"),
            text("preferredLocation", "Preferred location"),
            followup(),
          ],
        },
      },
      {
        id: "course-not-available", label: "Course Not Available", icon: BookX,
        step3: {
          fields: [
            text("requiredCourse", "Required course"),
            text("altCourse", "Alternative course suggested"),
            text("suggestedUniversity", "Suggested university / college"),
            text("suggestedCwid", "Suggested CW ID"),
            followup(),
          ],
        },
      },
      {
        id: "not-eligible", label: "Not Eligible", icon: ShieldAlert,
        step3: {
          fields: [
            select("reason", "Reason",
              ["Not the Right Age", "Already Pursuing", "Not Given Exam (CAT/XAT)", "Incorrect Stream"],
              { required: true }),
            area("notes", "Notes (optional)"),
          ],
        },
      },
      {
        id: "incomplete-discussion", label: "Incomplete Discussion", icon: MessageSquareWarning,
        step3: {
          fields: [
            text("incompleteReason", "Reason for incomplete discussion"),
            area("notes", "Notes"),
            followup(),
          ],
        },
      },
    ],
  },

  invalid: {
    key: "invalid",
    label: "Invalid Number",
    icon: Ban,
    color: "rose",
    options: [
      {
        id: "dead", label: "Dead", icon: Skull,
        step3: {
          confirmText: "Confirm that this number is invalid and mark the lead as dead.",
          fields: [
            check("confirmDead", "I confirm this number is invalid", { required: true }),
            area("notes", "Notes (optional)"),
          ],
          tryAnotherNumber: true,
        },
      },
    ],
  },

  "not-a-student": {
    key: "not-a-student",
    label: "Not a Student",
    icon: XCircle,
    color: "slate",
    options: [
      {
        id: "dead", label: "Dead", icon: Skull,
        step3: {
          confirmText: "Confirm this contact is not a student and mark the lead as dead.",
          fields: [
            check("confirmDead", "I confirm this contact is not a student", { required: true }),
            area("notes", "Reason / notes (optional)"),
          ],
        },
      },
    ],
  },
};

// Maps the existing primary disposition cards to a flow.
export const DISPOSITION_TO_FLOW = {
  "Interested": "interested",
  "Not Connected": "not-connected",
  "Follow-up": "follow-up",
  "Call Back": "follow-up",
  "Not Interested": "not-interested",
  "Wrong Number": "invalid",
  "Not a Student": "not-a-student",
  "Admission Done Elsewhere": "not-interested",
};

export const COLOR_CLASSES = {
  emerald: {
    panel: "border-emerald-500 bg-emerald-50/60",
    heading: "text-emerald-700",
    iconWrap: "bg-emerald-100 text-emerald-700",
    idle: "border-border bg-card hover:border-emerald-400 hover:bg-emerald-50",
    active: "border-emerald-600 bg-emerald-600 text-white",
    ring: "focus-visible:ring-emerald-500",
    accent: "border-emerald-500",
    chip: "bg-emerald-100 text-emerald-800",
  },
  blue: {
    panel: "border-blue-500 bg-blue-50/60",
    heading: "text-blue-700",
    iconWrap: "bg-blue-100 text-blue-700",
    idle: "border-border bg-card hover:border-blue-400 hover:bg-blue-50",
    active: "border-blue-600 bg-blue-600 text-white",
    ring: "focus-visible:ring-blue-500",
    accent: "border-blue-500",
    chip: "bg-blue-100 text-blue-800",
  },
  orange: {
    panel: "border-orange-500 bg-orange-50/60",
    heading: "text-orange-700",
    iconWrap: "bg-orange-100 text-orange-700",
    idle: "border-border bg-card hover:border-orange-400 hover:bg-orange-50",
    active: "border-orange-600 bg-orange-600 text-white",
    ring: "focus-visible:ring-orange-500",
    accent: "border-orange-500",
    chip: "bg-orange-100 text-orange-800",
  },
  red: {
    panel: "border-red-500 bg-red-50/60",
    heading: "text-red-700",
    iconWrap: "bg-red-100 text-red-700",
    idle: "border-border bg-card hover:border-red-400 hover:bg-red-50",
    active: "border-red-600 bg-red-600 text-white",
    ring: "focus-visible:ring-red-500",
    accent: "border-red-500",
    chip: "bg-red-100 text-red-800",
  },
  rose: {
    panel: "border-rose-400 bg-rose-50/60",
    heading: "text-rose-700",
    iconWrap: "bg-rose-100 text-rose-700",
    idle: "border-border bg-card hover:border-rose-400 hover:bg-rose-50",
    active: "border-rose-600 bg-rose-600 text-white",
    ring: "focus-visible:ring-rose-500",
    accent: "border-rose-400",
    chip: "bg-rose-100 text-rose-800",
  },
  slate: {
    panel: "border-slate-400 bg-slate-50",
    heading: "text-slate-700",
    iconWrap: "bg-slate-200 text-slate-700",
    idle: "border-border bg-card hover:border-slate-400 hover:bg-slate-100",
    active: "border-slate-700 bg-slate-700 text-white",
    ring: "focus-visible:ring-slate-500",
    accent: "border-slate-400",
    chip: "bg-slate-200 text-slate-800",
  },
};
