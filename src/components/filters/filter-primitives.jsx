import { cn } from "@/lib/utils";
import { Check, X, Search } from "lucide-react";

export function FilterGroup({ label, children, action, id }) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-x-3 gap-y-1 py-1.5 sm:grid-cols-[124px_minmax(0,1fr)] sm:items-start"
    >
      <h3
        id={id}
        className="pt-1 text-[10px] font-semibold uppercase leading-4 tracking-wider text-muted-foreground"
      >
        {label}
      </h3>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">{children}</div>
        {action}
      </div>
    </section>
  );
}

const TONES = {
  green: "border-emerald-300 bg-emerald-50 text-emerald-700",
  rose: "border-rose-300 bg-rose-50 text-rose-700",
  orange: "border-orange-300 bg-orange-50 text-orange-700",
  purple: "border-violet-300 bg-violet-50 text-violet-700",
  red: "border-red-300 bg-red-50 text-red-700",
  blue: "border-blue-300 bg-blue-50 text-blue-700",
  neutral: "border-border bg-card text-foreground",
};

const TONES_ACTIVE = {
  green: "border-emerald-600 bg-emerald-600 text-white",
  rose: "border-rose-600 bg-rose-600 text-white",
  orange: "border-orange-600 bg-orange-600 text-white",
  purple: "border-violet-600 bg-violet-600 text-white",
  red: "border-red-600 bg-red-600 text-white",
  blue: "border-blue-600 bg-blue-600 text-white",
  neutral: "border-primary bg-primary text-primary-foreground",
};

export function Chip({ children, active = false, tone = "neutral", count, onClick, avatar, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active ? TONES_ACTIVE[tone] : cn(TONES[tone], "hover:brightness-[0.97]"),
      )}
    >
      {active ? <Check className="h-3 w-3 shrink-0" aria-hidden="true" /> : avatar}
      <span className="whitespace-nowrap">{children}</span>
      {typeof count === "number" ? (
        <span
          className={cn(
            "ml-0.5 rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
            active ? "bg-white/25" : "bg-black/5",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function Initials({ name }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-muted text-[8px] font-semibold text-muted-foreground"
    >
      {initials}
    </span>
  );
}

export function SearchBox({ value, onChange, placeholder, label, className }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full rounded-md border border-input bg-card pl-9 pr-3 text-[11px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

export function AppliedFilters({ items, onClearAll }) {
  if (!items.length) {
    return <p className="text-xs text-muted-foreground">No filters applied — showing all leads.</p>;
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/5 py-0.5 pl-2 pr-0.5 text-[11px] font-medium text-foreground"
        >
          {item.label}
          <button
            type="button"
            onClick={item.onRemove}
            aria-label={`Remove filter ${item.label}`}
            className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="rounded-md px-2 py-1 text-xs font-semibold text-destructive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Clear all
      </button>
    </div>
  );
}
