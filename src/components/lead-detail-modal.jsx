import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShareAction } from "@/components/share-menu";
import { StatusBadge } from "@/components/status-badge";
import { sampleTimeline, maskMobile, maskEmail } from "@/lib/crm-data";
import {
  Phone, MessageCircle, Mail, FileText, ChevronRight, PhoneCall, Timer, Sparkles,
  ThumbsUp, ThumbsDown, CalendarClock, PhoneOff, Ban, XCircle, PhoneMissed,
  Mic, Pause, PhoneOutgoing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DispositionFlow } from "@/components/disposition-flow";
import { DISPOSITION_TO_FLOW } from "@/lib/disposition-flow-config";
import { logCall, logDisposition, useLeadCalls, useLeadActivity, formatDuration } from "@/lib/lead-activity-store";

const GROUPS = [
  {
    id: "positive",
    title: "Positive · Ready to progress",
    tone: "text-emerald-700",
    cols: "sm:grid-cols-1",
    size: "lg",
    items: [
      { key: "Interested", label: "Interested", desc: "Positive intent — convert to application", icon: ThumbsUp, color: "emerald", flow: "interested" },
    ],
  },
  {
    id: "nurture",
    title: "In-progress · Nurture",
    tone: "text-blue-700",
    cols: "sm:grid-cols-2",
    size: "lg",
    items: [
      { key: "Follow-up", label: "Follow Up", desc: "Schedule a callback at a specific time", icon: CalendarClock, color: "blue", flow: "follow-up" },
      { key: "Not Connected", label: "Not Connected", desc: "Call did not connect — mark reason", icon: PhoneOff, color: "orange", flow: "not-connected" },
    ],
  },
  {
    id: "closed",
    title: "Closed · Lost",
    tone: "text-muted-foreground",
    cols: "sm:grid-cols-2 xl:grid-cols-3",
    size: "sm",
    items: [
      { key: "Not Interested", label: "Not Interested", desc: "Choose the specific objection", icon: ThumbsDown, color: "red", flow: "not-interested" },
      { key: "Admission Done Elsewhere", label: "Enrolled Somewhere Else", desc: "Lost — captured for competitor intel", icon: Ban, color: "red", flow: "not-interested" },
      { key: "Wrong Number", label: "Invalid Number", desc: "Number is invalid — will mark as dead", icon: PhoneMissed, color: "rose", flow: "invalid" },
      { key: "Not a Student", label: "Not A Student", desc: "Not a prospective student — will mark as dead", icon: XCircle, color: "slate", flow: "not-a-student" },
    ],
  },
];

const CARD_COLORS = {
  emerald: { idle: "hover:border-emerald-400 hover:bg-emerald-50/60", icon: "bg-emerald-100 text-emerald-700", active: "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-500" },
  blue: { idle: "hover:border-blue-400 hover:bg-blue-50/60", icon: "bg-blue-100 text-blue-700", active: "border-blue-600 bg-blue-50 ring-1 ring-blue-500" },
  orange: { idle: "hover:border-orange-400 hover:bg-orange-50/60", icon: "bg-orange-100 text-orange-700", active: "border-orange-600 bg-orange-50 ring-1 ring-orange-500" },
  red: { idle: "hover:border-red-400 hover:bg-red-50/60", icon: "bg-red-100 text-red-700", active: "border-red-600 bg-red-50 ring-1 ring-red-500" },
  rose: { idle: "hover:border-rose-400 hover:bg-rose-50/60", icon: "bg-rose-100 text-rose-700", active: "border-rose-600 bg-rose-50 ring-1 ring-rose-500" },
  slate: { idle: "hover:border-slate-400 hover:bg-slate-100", icon: "bg-slate-200 text-slate-700", active: "border-slate-600 bg-slate-100 ring-1 ring-slate-400" },
};

const QUICK_REMARKS = [
  "Interested in scholarship", "Needs parent discussion", "Asked for brochure",
  "Will call tomorrow", "Busy now", "Requested callback", "Fees too high",
  "Documents pending", "Not reachable", "Already admitted elsewhere",
];

const fmtDur = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function LeadDetailModal({ lead, open, onOpenChange, onSaveAndNext }) {
  const [disposition, setDisposition] = useState("");
  const [remark, setRemark] = useState("");
  const [flowState, setFlowState] = useState(null);
  const [callState, setCallState] = useState("idle"); // idle | active | ended
  const [seconds, setSeconds] = useState(0);
  const [onHold, setOnHold] = useState(false);
  const [muted, setMuted] = useState(false);
  const tick = useRef(null);

  useEffect(() => {
    setDisposition("");
    setRemark("");
    setFlowState(null);
    setCallState("idle");
    setSeconds(0);
    setOnHold(false);
    setMuted(false);
  }, [lead?.id]);

  useEffect(() => {
    clearInterval(tick.current);
    if (callState === "active" && !onHold) {
      tick.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(tick.current);
  }, [callState, onHold]);

  const timeline = useMemo(() => (lead ? sampleTimeline(lead.id) : []), [lead?.id]);
  const sessionCalls = useLeadCalls(lead?.id);
  const sessionActivity = useLeadActivity(lead?.id);

  if (!lead) return null;

  const activeCard = GROUPS.flatMap((g) => g.items).find((i) => i.key === disposition) || null;
  const flowKey = activeCard?.flow || DISPOSITION_TO_FLOW[disposition] || null;
  const flowReady = !flowKey || !!flowState?.valid;

  const pick = (item) => {
    setDisposition(disposition === item.key ? "" : item.key);
    setFlowState(null);
  };

  const save = (thenNext = false) => {
    const payload = {
      leadId: lead.id,
      primaryDisposition: disposition,
      flowKey,
      subpoint: flowState?.subpoint || null,
      subpointId: flowState?.subpointId || null,
      step3Action: flowState?.step3Action || null,
      details: flowState?.details || {},
      followupAt: flowState?.followupAt || null,
      followupNote: flowState?.followupNote || null,
      remarks: remark,
      callDuration: seconds,
      counsellorId: lead.counsellor,
      savedAt: new Date().toISOString(),
    };
    console.info("[disposition:save]", payload);
    logDisposition(lead.id, payload);
    toast.success("Lead updated", {
      description: `${lead.name} · ${disposition}${payload.subpoint ? ` → ${payload.subpoint}` : ""}${flowState?.followupLabel ? ` · F/U ${flowState.followupLabel}` : ""}`,
    });
    onOpenChange(false);
    if (thenNext) setTimeout(() => onSaveAndNext?.(), 120);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[92vw] max-w-none flex-col gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--brand)] to-[color:var(--brand-deep)] text-xs font-semibold text-white">
            {lead.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <div className="truncate text-sm font-semibold">{lead.name}</div>
              <StatusBadge status={lead.status} />
            </div>
            <div className="text-[10px] text-muted-foreground">
              {lead.city}, {lead.state} · {lead.masterCourse} · Assigned to {lead.counsellor}
            </div>
          </div>
          <div className="mr-8 hidden shrink-0 grid-cols-4 gap-1.5 sm:grid sm:w-[430px]">
            <QuickAction icon={Phone} label="Call Again" onClick={() => { setCallState("active"); setSeconds(0); }} />
            <ShareAction icon={MessageCircle} label="WhatsApp" channel="WhatsApp" lead={lead} />
            <ShareAction icon={Mail} label="Email" channel="Email" lead={lead} />
            <QuickAction icon={FileText} label="Application" onClick={() => toast.success("Application link shared")} />
          </div>
        </div>

        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
          {/* Body */}
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[300px_1fr]">
            {/* Left rail */}
            <aside className="flex min-h-0 flex-col border-r border-border bg-muted/20">
              <div className="border-b border-border bg-card px-3">
                <TabsList className="h-auto gap-4 bg-transparent p-0">
                  {[["overview", "Overview"], ["calling", "Calling History"], ["activity", "Activity"]].map(([v, l]) => (
                    <TabsTrigger
                      key={v}
                      value={v}
                      className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-2.5 text-xs font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                    >
                      {l}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="scrollbar-thin min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
                <TabsContent value="overview" className="mt-0">
                  <section className="rounded-lg border border-border bg-card px-3 py-2.5">
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-primary" /> Student Details
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      <MiniInfo label="Name" value={lead.name} />
                      <MiniInfo label="CWID" value={<span className="font-mono">{lead.cwid}</span>} />
                      <MiniInfo label="Course" value={lead.interestedCourse} />
                      <MiniInfo label="Master Course" value={lead.masterCourse} />
                      <MiniInfo label="Qualification" value={lead.qualification} />
                      <MiniInfo label="City" value={lead.city} />
                      <MiniInfo label="State" value={lead.state} />
                      <MiniInfo label="Mobile" value={<span className="font-mono">{maskMobile(lead.mobile)}</span>} />
                      <MiniInfo label="Email" value={maskEmail(lead.email)} className="col-span-2" />
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="calling" className="mt-0">
                  <div className="divide-y divide-border rounded-lg border border-border bg-card px-3">
                    {[
                      ...sessionCalls.map((c) => ({
                        time: `Today · ${new Date(c.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                        dur: formatDuration(c.duration),
                        out: c.outcome,
                        by: c.by,
                      })),
                      { time: "Today · 10:32 AM", dur: "4m 12s", out: "Connected", by: "Keshav Gandhi" },
                      { time: "Yesterday · 5:20 PM", dur: "1m 04s", out: "Interested", by: "Keshav Gandhi" },
                      { time: "2 days ago · 11:15 AM", dur: "0m 22s", out: "Not connected", by: "Rahul Kapoor" },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center gap-2 py-2 text-[11px]">
                        <PhoneCall className="h-3.5 w-3.5 text-primary" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{c.time}</div>
                          <div className="text-[10px] text-muted-foreground">by {c.by} · {c.out}</div>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Timer className="h-3 w-3" /> {c.dur}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-0">
                  <ol className="relative ml-2 space-y-2.5 border-l border-border">
                    {[
                      ...sessionActivity.map((e) => ({
                        id: e.id,
                        time: new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        title: e.title,
                        detail: e.detail,
                      })),
                      ...timeline,
                    ].map((e) => (
                      <li key={e.id} className="ml-3">
                        <span className="absolute -left-[5px] flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary/20 ring-4 ring-muted/20">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                        </span>
                        <div className="flex items-baseline gap-2">
                          <div className="text-xs font-medium">{e.title}</div>
                          <div className="text-[10px] text-muted-foreground">{e.time}</div>
                        </div>
                        {e.detail && <div className="text-[11px] text-muted-foreground">{e.detail}</div>}
                      </li>
                    ))}
                  </ol>
                </TabsContent>

                {/* Call control */}
                <section className="rounded-lg border border-border bg-card px-3 py-2.5">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Call Control</div>
                  {callState === "idle" && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                          <Phone className="h-3 w-3" />
                        </span>
                        Ready to call
                      </div>
                      <button
                        onClick={() => { setCallState("active"); setSeconds(0); }}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                      >
                        <Phone className="h-3.5 w-3.5" /> Make call
                      </button>
                    </div>
                  )}

                  {callState === "active" && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                          {onHold ? "On hold" : "Call in progress"}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">{fmtDur(seconds)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <CallBtn icon={Mic} label={muted ? "Unmute" : "Mute"} active={muted} onClick={() => setMuted((m) => !m)} />
                        <CallBtn icon={Pause} label={onHold ? "Resume" : "Hold"} active={onHold} onClick={() => setOnHold((h) => !h)} />
                        <button
                          onClick={() => {
                            setCallState("ended");
                            logCall(lead.id, { duration: seconds, outcome: seconds > 5 ? "Connected" : "Not connected", by: lead.counsellor || "You" });
                          }}
                          className="flex flex-col items-center gap-1 rounded-md bg-red-600 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-red-700"
                        >
                          <PhoneOff className="h-3.5 w-3.5" /> End call
                        </button>
                      </div>
                    </div>
                  )}

                  {callState === "ended" && (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Call ended</span>
                        <span className="font-mono text-[11px]">{fmtDur(seconds)}</span>
                      </div>
                      <button
                        onClick={() => { setCallState("active"); setSeconds(0); setOnHold(false); }}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/5 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/10"
                      >
                        <PhoneOutgoing className="h-3.5 w-3.5" /> Call again
                      </button>
                    </div>
                  )}
                </section>
              </div>
            </aside>

            {/* Main */}
            <div className="scrollbar-thin min-h-0 overflow-y-auto p-3">
              <div className="mb-3 grid grid-cols-2 gap-1.5 sm:hidden">
                <QuickAction icon={Phone} label="Call Again" onClick={() => { setCallState("active"); setSeconds(0); }} />
                <ShareAction icon={MessageCircle} label="WhatsApp" channel="WhatsApp" lead={lead} />
                <ShareAction icon={Mail} label="Email" channel="Email" lead={lead} />
                <QuickAction icon={FileText} label="Application" onClick={() => toast.success("Application link shared")} />
              </div>



              {/* Disposition flow */}
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Disposition Flow</span>
                {!disposition && (
                  <span className="text-[11px] italic text-muted-foreground">Start by picking a primary outcome →</span>
                )}
              </div>

              {!disposition && (
                <div className="space-y-3">
                  {GROUPS.map((g) => (
                    <section key={g.id}>
                      <div className={cn("mb-1.5 text-[10px] font-semibold uppercase tracking-wider", g.tone)}>{g.title}</div>
                      <div className={cn("grid grid-cols-1 gap-1.5", g.cols)}>
                        {g.items.map((item) => {
                          const c = CARD_COLORS[item.color];
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.key}
                              onClick={() => pick(item)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg border bg-card text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                g.size === "lg" ? "px-3 py-2.5" : "px-2.5 py-2",
                                "border-border", c.idle,
                              )}
                            >
                              <span className={cn("flex shrink-0 items-center justify-center rounded-md", c.icon, g.size === "lg" ? "h-7 w-7" : "h-6 w-6")}>
                                <Icon className={g.size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className={cn("block truncate font-semibold", g.size === "lg" ? "text-sm" : "text-[11px]")}>{item.label}</span>
                                <span className={cn("block truncate text-muted-foreground", g.size === "lg" ? "text-[11px]" : "text-[10px]")}>{item.desc}</span>
                              </span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}


              {flowKey && (
                <div className="mt-3">
                  <DispositionFlow
                    key={`${lead.id}-${disposition}`}
                    flowKey={flowKey}
                    lead={lead}
                    onChange={setFlowState}
                    onBackToStep1={() => { setDisposition(""); setFlowState(null); }}
                  />
                </div>
              )}

              {/* Call remarks */}
              <section className="mt-3 rounded-lg border border-border bg-card px-3 py-2.5">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Call Remarks</div>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={2}
                  placeholder="Notes from the call…"
                  className="resize-none text-xs"
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {QUICK_REMARKS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setRemark((r) => (r ? `${r.trim()} · ${q}` : q))}
                      className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      + {q}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-card px-4 py-2">
          <div className="truncate text-[11px] text-muted-foreground">
            {disposition ? (
              <>
                Disposition → <b className="text-foreground">{activeCard?.label || disposition}</b>
                {flowState?.subpoint && <> · <b className="text-foreground">{flowState.subpoint}</b></>}
              </>
            ) : (
              <span>Pick a primary outcome to update this lead</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => save(false)} disabled={!disposition || !flowReady}>Save</Button>
            {onSaveAndNext && (
              <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => save(true)} disabled={!disposition || !flowReady}>
                Save &amp; Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 py-2 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-500/10"
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function CallBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-md border py-1.5 text-[10px] font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted",
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function MiniInfo({ label, value, className = "" }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="truncate text-[11px] font-medium">{value}</div>
    </div>
  );
}
