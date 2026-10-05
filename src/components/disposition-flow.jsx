import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight, ChevronLeft, RotateCcw, BookOpen, Link2, MessageCircle, Mail, Phone, CalendarClock, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PRIMARY_FLOWS, COLOR_CLASSES, FOLLOWUP_PRESETS, resolveFollowupPreset, formatFollowup,
} from "@/lib/disposition-flow-config";

const emptyFollowup = { preset: null, date: "", time: "", note: "", reminder: false };

function followupDate(fu) {
  if (!fu || !fu.preset) return null;
  if (fu.preset === "custom") {
    if (!fu.date || !fu.time) return null;
    const d = new Date(`${fu.date}T${fu.time}`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return resolveFollowupPreset(fu.preset);
}

export function DispositionFlow({ flowKey, lead, onChange, onBackToStep1 }) {
  const flow = PRIMARY_FLOWS[flowKey];
  const [subId, setSubId] = useState(null);
  const [choiceId, setChoiceId] = useState(null);
  const [values, setValues] = useState({});
  const [fu, setFu] = useState(emptyFollowup);
  const [showErrors, setShowErrors] = useState(false);
  const [step, setStep] = useState(2);

  const sub = useMemo(() => flow?.options.find((o) => o.id === subId) || null, [flow, subId]);
  const step3 = sub?.step3 || null;
  const choice = step3?.kind === "choice" ? step3.choices.find((c) => c.id === choiceId) || null : null;

  const fields = useMemo(() => {
    if (!step3) return [];
    if (step3.kind === "choice") return choice?.fields || [];
    if (step3.kind === "followup-preset") return [];
    return step3.fields || [];
  }, [step3, choice]);

  // Reset dependent state whenever the subpoint changes.
  const selectSub = (id) => {
    if (id === subId) return;
    setSubId(id);
    setChoiceId(null);
    setValues({});
    setShowErrors(false);
    const next = flow.options.find((o) => o.id === id);
    setFu(next?.preset ? { ...emptyFollowup, preset: next.preset } : emptyFollowup);
    setStep(3);
  };

  const reset = () => {
    setSubId(null); setChoiceId(null); setValues({}); setFu(emptyFollowup);
    setShowErrors(false); setStep(2);
    onBackToStep1?.();
  };

  const back = () => {
    if (step === 3 && step3?.kind === "choice" && choiceId) { setChoiceId(null); return; }
    if (step === 3) { setStep(2); return; }
    onBackToStep1?.();
  };

  const errors = useMemo(() => {
    const e = {};
    if (!subId) return e;
    if (step3?.kind === "followup-preset") {
      if (!followupDate(fu)) e["followup"] = "Pick a valid follow-up date and time.";
      return e;
    }
    if (step3?.kind === "choice" && !choiceId) {
      e["choice"] = "Choose a next action to continue.";
      return e;
    }
    for (const f of fields) {
      if (!f.required) continue;
      if (f.type === "followup") {
        if (!followupDate(fu)) e[f.id] = "Pick a valid follow-up date and time.";
      } else if (f.type === "checkbox") {
        if (!values[f.id]) e[f.id] = "Confirmation is required.";
      } else if (!String(values[f.id] ?? "").trim()) {
        e[f.id] = `${f.label} is required.`;
      }
    }
    return e;
  }, [subId, step3, choiceId, fields, values, fu]);

  const emit = useRef(onChange);
  emit.current = onChange;
  useEffect(() => {
    const d = followupDate(fu);
    emit.current?.({
      valid: !!subId && Object.keys(errors).length === 0,
      subpoint: sub ? (sub.fullLabel || sub.label) : null,
      subpointId: subId,
      step3Action: choice ? choice.label : (step3?.kind === "followup-preset" ? sub?.label : null),
      details: values,
      followupAt: d ? d.toISOString() : null,
      followupLabel: d ? formatFollowup(d) : null,
      followupNote: fu.note || null,
      reminder: fu.reminder,
    });
  }, [subId, sub, choice, step3, values, fu, errors]);

  if (!flow) return null;
  const c = COLOR_CLASSES[flow.color];
  const setVal = (id, v) => setValues((s) => ({ ...s, [id]: v }));

  const err = (id) => (showErrors || subId ? errors[id] : null);

  return (
    <div className="space-y-2.5">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="shrink-0">Disposition Flow</span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className={cn("shrink-0 rounded px-1.5 py-0.5 normal-case", c.chip)}>{flow.label}</span>
          {sub && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className={cn("truncate rounded px-1.5 py-0.5 normal-case", c.chip)}>{sub.label}</span>
            </>
          )}
          {choice && (
            <>
              <ChevronRight className="hidden h-3 w-3 shrink-0 sm:block" />
              <span className={cn("hidden truncate rounded px-1.5 py-0.5 normal-case sm:inline", c.chip)}>{choice.label}</span>
            </>
          )}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px]" onClick={back}>
            <ChevronLeft className="h-3 w-3" /> Back
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]" onClick={reset}>
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        </div>
      </div>

      {/* Step 2 */}
      <section className={cn("rounded-xl border-2 p-3 transition-colors", c.panel)}>
        <div className="mb-2.5 flex items-center gap-2">
          <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", c.iconWrap)}>
            <flow.icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Step 2</div>
            <div className="truncate text-sm font-semibold text-foreground">
              Choose a specific reason under <span className={c.heading}>{flow.label}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {flow.options.map((o) => {
            const active = subId === o.id;
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectSub(o.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
                  c.ring,
                  active ? c.active : c.idle,
                )}
              >
                <o.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 3 */}
      {sub && step3 && (
        <section className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Step 3 · Refine <span className="text-foreground">{sub.label}</span>
          </div>

          {step3.confirmText && (
            <p className="mb-2.5 rounded-md bg-muted px-2.5 py-2 text-xs text-foreground">{step3.confirmText}</p>
          )}

          {step3.kind === "followup-preset" && (
            <FollowupBlock
              c={c}
              fu={fu}
              setFu={setFu}
              lockedPreset={sub.preset}
              error={err("followup")}
              showReminder
            />
          )}

          {step3.kind === "choice" && !choice && (
            <>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {step3.choices.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => { setChoiceId(ch.id); setValues({}); setFu(emptyFollowup); }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
                      c.ring, c.idle,
                    )}
                  >
                    <ch.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{ch.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
              {err("choice") && <p className="mt-1.5 text-[11px] text-destructive">{errors["choice"]}</p>}
            </>
          )}

          {fields.length > 0 && (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {fields.map((f) => (
                <FieldRenderer
                  key={f.id}
                  field={f}
                  c={c}
                  lead={lead}
                  value={values[f.id]}
                  onValue={(v) => setVal(f.id, v)}
                  fu={fu}
                  setFu={setFu}
                  error={err(f.id)}
                />
              ))}
            </div>
          )}

          {step3.tryAnotherNumber && lead?.altMobile && (
            <button
              type="button"
              onClick={() => toast.info(`Alternate number on file: ${lead.altMobile}`)}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-accent"
            >
              <Phone className="h-3 w-3" /> Try Another Number
            </button>
          )}

          {step3.buttons && (
            <div className="mt-2.5 flex justify-end gap-1.5">
              <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => { setValues({}); setShowErrors(false); }}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-[11px]"
                onClick={() => {
                  setShowErrors(true);
                  if (Object.keys(errors).length === 0) toast.success("Detail added to this disposition");
                }}
              >
                Add Detail
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function FieldLabel({ children }) {
  return <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</div>;
}

function FieldRenderer({ field, c, lead, value, onValue, fu, setFu, error }) {
  const wrap = (node) => (
    <div className={cn("min-w-0", field.full && "sm:col-span-2")}>
      <FieldLabel>{field.label}{field.required ? " *" : ""}</FieldLabel>
      {node}
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );

  switch (field.type) {
    case "textarea":
      return wrap(
        <Textarea rows={2} className="resize-none text-xs" value={value || ""} onChange={(e) => onValue(e.target.value)} />,
      );
    case "select":
      return wrap(
        <select
          className={cn(
            "h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2",
            c.ring, error && "border-destructive",
          )}
          value={value || ""}
          onChange={(e) => onValue(e.target.value)}
        >
          <option value="">Select…</option>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>,
      );
    case "date":
    case "time":
      return wrap(
        <Input type={field.type} className={cn("h-8 text-xs", error && "border-destructive")}
          value={value || ""} onChange={(e) => onValue(e.target.value)} />,
      );
    case "checkbox":
      return wrap(
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" className="h-3.5 w-3.5 accent-current" checked={!!value} onChange={(e) => onValue(e.target.checked)} />
          <span>{field.label}</span>
        </label>,
      );
    case "chips": {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (o) =>
        onValue(field.multiple
          ? (selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o])
          : [o]);
      return wrap(
        <div className="flex flex-wrap gap-1.5">
          {field.options.map((o) => (
            <button key={o} type="button" onClick={() => toggle(o)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
                c.ring, selected.includes(o) ? c.active : c.idle,
              )}>
              {selected.includes(o) && <Check className="mr-1 inline h-3 w-3" />}{o}
            </button>
          ))}
        </div>,
      );
    }
    case "actions":
      return wrap(
        <div className="flex flex-wrap gap-1.5">
          {field.actions.map((a) => (
            <ShareAction key={a} label={a} lead={lead} />
          ))}
        </div>,
      );
    case "followup":
      return (
        <div className="min-w-0 sm:col-span-2">
          <FollowupBlock c={c} fu={fu} setFu={setFu} error={error} required={field.required} />
        </div>
      );
    default:
      return wrap(
        <Input className={cn("h-8 text-xs", error && "border-destructive")} value={value || ""}
          onChange={(e) => onValue(e.target.value)} placeholder={field.placeholder || ""} />,
      );
  }
}

const ACTION_ICONS = {
  "Share Brochure": BookOpen,
  "Share Application Link": Link2,
  "WhatsApp": MessageCircle,
  "Email": Mail,
};

function ShareAction({ label, lead }) {
  const Icon = ACTION_ICONS[label] || Link2;
  const run = () => {
    if (label === "Share Brochure" || label === "Share Application Link") {
      if (!lead?.mobile) { toast.error("No mobile number on this lead."); return; }
      const text = label === "Share Brochure"
        ? `Hi ${lead.name}, sharing the university brochure as discussed.`
        : `Hi ${lead.name}, here is the application link as discussed.`;
      window.open(`https://wa.me/${lead.mobile.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      return;
    }
    toast.info("No sharing integration is configured for this action yet.");
  };
  return (
    <button type="button" onClick={run}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function FollowupBlock({ c, fu, setFu, error, required, lockedPreset, showReminder }) {
  const resolved = followupDate(fu);
  return (
    <div>
      <FieldLabel>Follow-up scheduling{required ? " *" : ""}</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {FOLLOWUP_PRESETS.map((p) => {
          const active = fu.preset === p.id;
          const locked = lockedPreset && lockedPreset !== p.id && p.id !== "custom";
          return (
            <button key={p.id} type="button" disabled={!!locked}
              onClick={() => setFu({ ...fu, preset: p.id })}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2",
                c.ring, active ? c.active : c.idle,
              )}>
              <p.icon className="h-3 w-3" /> {p.label}
            </button>
          );
        })}
      </div>

      {fu.preset === "custom" && (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <FieldLabel>Date</FieldLabel>
            <Input type="date" className="h-8 text-xs" value={fu.date} onChange={(e) => setFu({ ...fu, date: e.target.value })} />
          </div>
          <div>
            <FieldLabel>Time</FieldLabel>
            <Input type="time" className="h-8 text-xs" value={fu.time} onChange={(e) => setFu({ ...fu, time: e.target.value })} />
          </div>
        </div>
      )}

      {fu.preset && (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>Follow-up note</FieldLabel>
            <Input className="h-8 text-xs" value={fu.note} onChange={(e) => setFu({ ...fu, note: e.target.value })}
              placeholder="Optional note for the reminder" />
          </div>
          {showReminder && (
            <label className="flex items-center gap-2 text-[11px]">
              <input type="checkbox" className="h-3.5 w-3.5" checked={fu.reminder}
                onChange={(e) => setFu({ ...fu, reminder: e.target.checked })} />
              Set a reminder
            </label>
          )}
        </div>
      )}

      {resolved && (
        <p className={cn("mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium", c.chip)}>
          <CalendarClock className="h-3 w-3" /> {formatFollowup(resolved)}
        </p>
      )}
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
