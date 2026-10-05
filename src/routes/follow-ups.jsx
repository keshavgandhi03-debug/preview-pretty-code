const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "@/lib/jsx-dev-shim";import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { LEADS, } from "@/lib/crm-data";
import { StatusBadge } from "@/components/status-badge";
import { LeadDetailModal } from "@/components/lead-detail-modal";
import { Button } from "@/components/ui/button";
import { Phone, Clock, CheckCircle2, CalendarClock, ChevronRight, BellRing } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RelativeTime } from "@/components/relative-time";
import { isBefore, addMinutes, addHours, addDays, isSameDay, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useFollowupOverrides, applyFollowups } from "@/lib/lead-activity-store";

export const Route = createFileRoute("/follow-ups")({
  head: () => ({ meta: [{ title: "Follow-ups — CollegeWollege CRM" }] }),
  component: FollowupsPage,
});

const REMARKS = [
  "Interested in scholarship options",
  "Wants brochure via WhatsApp",
  "Parent will decide next week",
  "Comparing with another college",
  "Ready to start application",
];
const remarkFor = (id) => REMARKS[Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % REMARKS.length];

const QUICK_CHIPS = [
  { label: "+30 mins", fn: (d) => addMinutes(d, 30) },
  { label: "Evening 6 PM", fn: (d) => { const n = new Date(d); n.setHours(18, 0, 0, 0); return n; } },
  { label: "Tomorrow AM", fn: (d) => { const n = addDays(d, 1); n.setHours(10, 0, 0, 0); return n; } },
  { label: "Tomorrow PM", fn: (d) => { const n = addDays(d, 1); n.setHours(15, 0, 0, 0); return n; } },
  { label: "After 2 days", fn: (d) => addHours(d, 48) },
  { label: "Next week", fn: (d) => addDays(d, 7) },
];

function FollowupsPage() {
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const overrides = useFollowupOverrides();
  // Buckets depend on the current time, so only fill them after hydration.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const withFollowups = useMemo(() =>
    hydrated
      ? applyFollowups(LEADS, overrides).filter((l) => l.nextFollowup).sort((a, b) =>
          new Date(a.nextFollowup).getTime() - new Date(b.nextFollowup).getTime()
        )
      : [], [hydrated, overrides]);

  const now = new Date();
  const overdue = [];
  const due30 = [];
  const today = [];
  const tomorrow = [];
  const thisWeek = [];

  for (const l of withFollowups) {
    const d = new Date(l.nextFollowup);
    if (isBefore(d, now)) { overdue.push(l); continue; }
    const diffMin = differenceInMinutes(d, now);
    if (diffMin <= 30) { due30.push(l); continue; }
    if (isSameDay(d, now)) { today.push(l); continue; }
    if (isSameDay(d, addDays(now, 1))) { tomorrow.push(l); continue; }
    thisWeek.push(l);
  }

  const openLead = (l) => { setSelected(l); setOpen(true); };

  return (
    _jsxDEV(AppShell, { title: "Follow-ups", breadcrumbs: [{ label: "Home", to: "/" }, { label: "Follow-ups" }], children: [
      _jsxDEV('div', { className: "p-6 space-y-5" , children: [
        _jsxDEV('div', { className: "rounded-xl border border-[color:var(--hot)]/20 bg-[color:var(--hot)]/5 p-4 flex items-center gap-3"       , children: [
          _jsxDEV(BellRing, { className: "h-5 w-5 text-[color:var(--hot)]"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 68}, this )
          , _jsxDEV('div', { className: "flex-1", children: [
            _jsxDEV('div', { className: "text-sm font-semibold" , children: [
              overdue.length, " overdue · "   , due30.length, " due in the next 30 minutes · "        , today.length + tomorrow.length, " coming up"
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 70}, this)
            , _jsxDEV('div', { className: "text-xs text-muted-foreground" , children: "Auto-reschedule is enabled for unanswered calls."     }, void 0, false, {fileName: _jsxFileName, lineNumber: 73}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 69}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 67}, this)

        , _jsxDEV(Lane, {
          title: "Overdue",
          dot: "bg-[color:var(--hot)]",
          count: overdue.length,
          items: overdue,
          tone: "hot",
          onOpen: openLead,}, void 0, false, {fileName: _jsxFileName, lineNumber: 77}, this
        )
        , _jsxDEV(Lane, {
          title: "Due in 30 minutes"   ,
          dot: "bg-[color:var(--warm)]",
          count: due30.length,
          items: due30,
          tone: "warm",
          onOpen: openLead,}, void 0, false, {fileName: _jsxFileName, lineNumber: 85}, this
        )
        , _jsxDEV(Lane, {
          title: "Later today" ,
          dot: "bg-[color:var(--followup)]",
          count: today.length,
          items: today,
          tone: "followup",
          onOpen: openLead,}, void 0, false, {fileName: _jsxFileName, lineNumber: 93}, this
        )
        , _jsxDEV(Lane, {
          title: "Tomorrow",
          dot: "bg-emerald-500",
          count: tomorrow.length,
          items: tomorrow,
          tone: "success",
          onOpen: openLead,}, void 0, false, {fileName: _jsxFileName, lineNumber: 101}, this
        )
        , _jsxDEV(Lane, {
          title: "This week" ,
          dot: "bg-primary",
          count: thisWeek.length,
          items: thisWeek.slice(0, 30),
          tone: "default",
          onOpen: openLead,}, void 0, false, {fileName: _jsxFileName, lineNumber: 109}, this
        )
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 66}, this)

      , _jsxDEV(LeadDetailModal, { lead: selected, open: open, onOpenChange: setOpen,}, void 0, false, {fileName: _jsxFileName, lineNumber: 119}, this )
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 65}, this)
  );
}

function Lane({ title, dot, count, items, tone, onOpen }






) {
  if (items.length === 0) return null;
  return (
    _jsxDEV('section', { children: [
      _jsxDEV('div', { className: "flex items-center gap-2 mb-2.5"   , children: [
        _jsxDEV('span', { className: cn("h-2 w-2 rounded-full", dot),}, void 0, false, {fileName: _jsxFileName, lineNumber: 136}, this )
        , _jsxDEV('h3', { className: "text-sm font-semibold" , children: title}, void 0, false, {fileName: _jsxFileName, lineNumber: 137}, this)
        , _jsxDEV('span', { className: "text-xs text-muted-foreground" , children: count}, void 0, false, {fileName: _jsxFileName, lineNumber: 138}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 135}, this)
      , _jsxDEV('div', { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5"    , children: 
        items.map((l) => (
          _jsxDEV(FollowupCard, { lead: l, tone: tone, onOpen: onOpen,}, l.id, false, {fileName: _jsxFileName, lineNumber: 142}, this )
        ))
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 140}, this)
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 134}, this)
  );
}

function FollowupCard({ lead, tone, onOpen }



) {
  const toneCls = {
    hot: "text-[color:var(--hot)]",
    warm: "text-[color:var(--warm)]",
    followup: "text-[color:var(--followup)]",
    success: "text-emerald-600",
    default: "text-primary",
  };
  return (
    _jsxDEV('div', { className: "rounded-lg border border-border bg-card p-3 hover:border-primary/40 hover:shadow-[var(--shadow-card)] transition-all"       , children: [
      _jsxDEV('div', { className: "flex items-start justify-between gap-3"   , children: [
        _jsxDEV('button', { onClick: () => onOpen(lead), className: "min-w-0 text-left flex-1"  , children: [
          _jsxDEV('div', { className: "text-sm font-medium truncate"  , children: lead.name}, void 0, false, {fileName: _jsxFileName, lineNumber: 165}, this)
          , _jsxDEV('div', { className: "text-[11px] text-muted-foreground truncate"  , children: [lead.interestedCourse, " · "  , lead.city]}, void 0, true, {fileName: _jsxFileName, lineNumber: 166}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 164}, this)
        , _jsxDEV(StatusBadge, { status: lead.status,}, void 0, false, {fileName: _jsxFileName, lineNumber: 168}, this )
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 163}, this)

      , _jsxDEV('div', { className: "mt-2 flex items-center justify-between text-[11px]"    , children: [
        _jsxDEV('span', { className: cn("inline-flex items-center gap-1 font-medium", toneCls[tone]), children: [
          _jsxDEV(Clock, { className: "h-3 w-3" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 173}, this )
          , _jsxDEV(RelativeTime, { value: lead.nextFollowup }, void 0, false, {fileName: _jsxFileName, lineNumber: 174}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 172}, this)
        , _jsxDEV('span', { className: "text-muted-foreground", children: ["Priority: " , _jsxDEV('b', { className: "text-foreground", children: lead.priority}, void 0, false, {fileName: _jsxFileName, lineNumber: 176}, this)]}, void 0, true, {fileName: _jsxFileName, lineNumber: 176}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 171}, this)

      , _jsxDEV('div', { className: "mt-2 text-[11px] text-muted-foreground line-clamp-1"   , children: ["\"", remarkFor(lead.id), "\""]}, void 0, true, {fileName: _jsxFileName, lineNumber: 179}, this)

      /* Action row */
      , _jsxDEV('div', { className: "mt-2.5 flex items-center gap-1"   , children: [
        _jsxDEV(Button, { size: "sm", className: "h-7 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700"    , onClick: () => toast.success(`Dialing ${lead.mobile}`), children: [
          _jsxDEV(Phone, { className: "h-3 w-3" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 184}, this ), " Call"
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 183}, this)
        , _jsxDEV(Button, { size: "sm", variant: "outline", className: "h-7 text-[11px] gap-1"  , onClick: () => toast.success("Marked complete"), children: [
          _jsxDEV(CheckCircle2, { className: "h-3 w-3" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 187}, this ), " Done"
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 186}, this)
        , _jsxDEV('div', { className: "ml-auto", children: 
          _jsxDEV(RescheduleMenu, { onPick: (label) => toast.success(`Rescheduled — ${label}`),}, void 0, false, {fileName: _jsxFileName, lineNumber: 190}, this )
        }, void 0, false, {fileName: _jsxFileName, lineNumber: 189}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 182}, this)

      /* Quick chips */
      , _jsxDEV('div', { className: "mt-2 flex flex-wrap gap-1"   , children: 
        QUICK_CHIPS.slice(0, 4).map((c) => (
          _jsxDEV('button', {

            onClick: () => toast.success(`Rescheduled — ${c.label}`),
            className: "text-[10px] px-1.5 py-0.5 rounded border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors"         ,
 children: 
            c.label
          }, c.label, false, {fileName: _jsxFileName, lineNumber: 197}, this)
        ))
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 195}, this)
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 162}, this)
  );
}

function RescheduleMenu({ onPick }) {
  const [open, setOpen] = useState(false);
  return (
    _jsxDEV('div', { className: "relative", children: [
      _jsxDEV('button', {
        onClick: () => setOpen((v) => !v),
        className: "inline-flex items-center gap-1 text-[11px] font-medium text-primary px-1.5 py-1 rounded hover:bg-primary/10"         ,
 children: [
        _jsxDEV(CalendarClock, { className: "h-3 w-3" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 218}, this ), " Snooze "  , _jsxDEV(ChevronRight, { className: "h-3 w-3" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 218}, this )
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 214}, this)
      , open && (
        _jsxDEV('div', {
          onMouseLeave: () => setOpen(false),
          className: "absolute right-0 mt-1 w-40 z-20 rounded-md border border-border bg-popover shadow-lg p-1"          ,
 children: 
          QUICK_CHIPS.map((c) => (
            _jsxDEV('button', {

              onClick: () => { onPick(c.label); setOpen(false); },
              className: "w-full text-left text-[11px] px-2 py-1.5 rounded hover:bg-muted"      ,
 children: 
              c.label
            }, c.label, false, {fileName: _jsxFileName, lineNumber: 226}, this)
          ))
        }, void 0, false, {fileName: _jsxFileName, lineNumber: 221}, this)
      )
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 213}, this)
  );
}
