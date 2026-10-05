import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Upload, MoreVertical, Users, Megaphone, ClipboardList, HeartCrack, Heart, Phone, ChevronDown, ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CAMPAIGN_STATUSES, programFeedback } from "@/lib/campaign-store";
import { cn } from "@/lib/utils";

const statusChip = {
  Active: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25",
  Suspended: "bg-destructive/10 text-destructive ring-destructive/25",
  Completed: "bg-primary/10 text-primary ring-primary/25",
  Draft: "bg-muted text-muted-foreground ring-border",
};

const toneChip = {
  green: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25",
  rose: "bg-rose-500/10 text-rose-700 ring-rose-500/25",
  orange: "bg-orange-500/10 text-orange-700 ring-orange-500/25",
  purple: "bg-[color:var(--followup)]/10 text-[color:var(--followup)] ring-[color:var(--followup)]/25",
  red: "bg-destructive/10 text-destructive ring-destructive/25",
  blue: "bg-primary/10 text-primary ring-primary/25",
};

const dotColor = {
  Active: "bg-emerald-500",
  Suspended: "bg-destructive",
  Completed: "bg-primary",
  Draft: "bg-muted-foreground/60",
};


function MetricBlock({ icon: Icon, label, value, tone }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card px-2.5 py-2">
      <div className="flex items-center gap-2">
        <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md", tone)}>
          <Icon className="h-3 w-3" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-none tabular-nums">{value}</span>
          <span className="block truncate text-[10px] text-muted-foreground">{label}</span>
        </span>
      </div>
    </div>
  );
}

export function CampaignCard({ campaign, onStatusChange, onUpload, onViewTeam, onAssign, onManage }) {
  const [busy, setBusy] = useState(false);
  const [openProgram, setOpenProgram] = useState("");
  const navigate = useNavigate();
  const s = campaign.stats;
  const shown = campaign.counsellors.slice(0, 4);
  const extra = campaign.assignedCount - shown.length;

  const feedback = useMemo(
    () => (openProgram ? programFeedback(campaign.clientId, openProgram) : null),
    [campaign.clientId, openProgram],
  );

  const changeStatus = async (next) => {
    setBusy(true);
    try { await onStatusChange(campaign, next); } finally { setBusy(false); }
  };

  const openWorkspace = (e) => {
    // Ignore clicks that land on the card's own controls.
    if (e.target.closest("button, a, input, [role='menu'], [role='dialog']")) return;
    navigate({ to: "/campaigns/$clientId", params: { clientId: campaign.clientId } });
  };

  return (
    <article
      onClick={openWorkspace}
      className="flex min-w-0 cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]"
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-semibold text-primary-foreground", campaign.color)}>
            {campaign.short}
          </span>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Link
                to="/campaigns/$clientId"
                params={{ clientId: campaign.clientId }}
                className="truncate text-sm font-semibold hover:text-primary hover:underline"
              >
                {campaign.name}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={`Campaign status: ${campaign.status}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      statusChip[campaign.status],
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[campaign.status])} />
                    Status: {campaign.status}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel className="text-xs">Set status</DropdownMenuLabel>
                  {CAMPAIGN_STATUSES.map((st) => (
                    <DropdownMenuItem key={st.id} onClick={() => changeStatus(st.id)} className="text-xs">
                      <span className={cn("mr-2 h-1.5 w-1.5 rounded-full", dotColor[st.id])} />
                      {st.id}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {campaign.assignedCount} counsellors assigned · {campaign.city}, {campaign.zone}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-[11px]" onClick={() => onUpload(campaign)}>
            <Upload className="h-3 w-3" /> Upload leads
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="Campaign actions" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAssign(campaign)} className="text-xs">Assign campaign</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManage(campaign)} className="text-xs">Manage counsellors</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpload(campaign)} className="text-xs">Upload leads</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-xs">
                <Link to="/campaigns/$clientId" params={{ clientId: campaign.clientId }}>
                  <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open workspace
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-muted/30 p-2.5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-[11px] font-medium">Counsellor team</span>
            <div className="flex shrink-0 -space-x-1.5">
              {shown.map((c) => (
                <span key={c.name} title={c.name} className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary ring-2 ring-card">
                  {c.initials}
                </span>
              ))}
              {extra > 0 && (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground ring-2 ring-card">
                  +{extra}
                </span>
              )}
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">{campaign.assignedCount} assigned</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-[11px]" onClick={() => onViewTeam(campaign)}>
              <Users className="h-3 w-3" /> View team
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Team actions" className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-1 text-[11px] text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  More <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onManage(campaign)} className="text-xs">Manage counsellors</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewTeam(campaign)} className="text-xs">Team details</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Megaphone className="h-3 w-3" /> {campaign.type}
          </span>
        </div>
      </div>

      {campaign.programs.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Programs</span>
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {campaign.programs.slice(0, 4).map((p) => {
                const on = openProgram === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setOpenProgram(on ? "" : p.name)}
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      on
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "border-border bg-muted/40 text-foreground hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    {p.name} · {p.leads} leads
                  </button>
                );
              })}
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{campaign.stats.total} total</span>
          </div>

          {feedback && (
            <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-primary">
                  {openProgram} campaign feedback · {feedback.total} leads
                </p>
                <button
                  type="button"
                  onClick={() => setOpenProgram("")}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Hide
                </button>
              </div>

              {feedback.total === 0 ? (
                <p className="mt-2 text-[11px] text-muted-foreground">No calls logged for this program yet.</p>
              ) : (
                <>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {feedback.buckets.map((b) => (
                      <div key={b.id} className="rounded-md border border-border bg-card px-2.5 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset", toneChip[b.tone])}>
                            {b.label}
                          </span>
                          <span className="text-[11px] font-semibold tabular-nums">{b.count} · {b.pct}%</span>
                        </div>
                        {b.substatuses.length > 0 && (
                          <p className="mt-1 truncate text-[10px] text-muted-foreground">
                            {b.substatuses.map((sub) => `${sub.name} (${sub.count})`).join(" · ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <ul className="mt-2 space-y-1">
                    {feedback.recent.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                        <span className="truncate text-foreground">{r.name}</span>
                        <span className="truncate">{r.label} · {r.substatus}</span>
                        <span className="shrink-0">{formatDistanceToNow(new Date(r.lastContact), { addSuffix: true })}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}


      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricBlock icon={ClipboardList} label="Untouched leads" value={s.untouched} tone="bg-primary/10 text-primary" />
        <MetricBlock icon={HeartCrack} label="Not interested" value={s.notInterested} tone="bg-destructive/10 text-destructive" />
        <MetricBlock icon={Heart} label="Interested" value={s.interested} tone="bg-emerald-500/10 text-emerald-600" />
        <MetricBlock icon={Phone} label="Follow-ups" value={s.followups} tone="bg-[color:var(--followup)]/10 text-[color:var(--followup)]" />
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium">{s.untouchedPct}% leads untouched</span>
          <span className="text-muted-foreground tabular-nums">{s.processed} of {s.total} leads</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={s.processedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${s.processedPct}% of leads processed`}
          className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <span className="block h-full rounded-full bg-primary transition-[width]" style={{ width: `${s.processedPct}%` }} />
        </div>
      </div>

      <footer className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onAssign(campaign)}>
          <Megaphone className="h-3.5 w-3.5" /> Assign campaign
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => onManage(campaign)}>
          <Users className="h-3.5 w-3.5" /> Manage counsellors
        </Button>
      </footer>
    </article>
  );
}
