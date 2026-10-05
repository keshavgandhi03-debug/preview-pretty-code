import { cn } from "@/lib/utils";
import { AGENT_STATUSES } from "@/lib/team-dashboard";

export function LiveStatusBadge({ status, className }) {
  const cfg = AGENT_STATUSES[status] || AGENT_STATUSES.Offline;
  const pulse = status === "On Call" || status === "Ringing";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap",
        cfg.chip,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", cfg.dot)} />}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", cfg.dot)} />
      </span>
      {status}
    </span>
  );
}

export function SummaryTile({ label, value, sub, tone = "info", icon: Icon }) {
  const toneCls = {
    info: "text-primary bg-primary/10",
    good: "text-[color:var(--success)] bg-[color:var(--success)]/10",
    warn: "text-[color:var(--warm)] bg-[color:var(--warm)]/10",
    bad: "text-destructive bg-destructive/10",
    muted: "text-muted-foreground bg-muted",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-3 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{value}</div>
          {sub && <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</div>}
        </div>
        {Icon && (
          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", toneCls)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}

export function Meter({ label, value, tone = "info", suffix = "%" }) {
  const bar = {
    info: "bg-primary",
    good: "bg-[color:var(--success)]",
    warn: "bg-[color:var(--warm)]",
    bad: "bg-destructive",
  }[tone];
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-500", bar)} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

export function Ring({ value, label, tone = "info", size = 56 }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = {
    info: "var(--primary)",
    good: "var(--success)",
    warn: "var(--warm)",
    bad: "var(--destructive)",
  }[tone];
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-muted" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            stroke={`color-mix(in oklab, ${color} 100%, transparent)`}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={c - (Math.min(100, value) / 100) * c}
            style={{ transition: "stroke-dashoffset 600ms ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums">{Math.round(value)}%</span>
      </div>
      <span className="text-[10.5px] uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}

export function Avatar({ name }) {
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("");
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 text-[11px] font-semibold text-white">
      {initials}
    </span>
  );
}
