import { SlidersHorizontal, CheckCircle2, Compass, Map, MapPin, Building2, Phone, ClipboardList, RotateCcw, ChevronDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FIELDS = [
  { key: "status", label: "Client status", icon: CheckCircle2, allLabel: "All statuses", multi: true },
  { key: "zone", label: "Zone", icon: Compass, allLabel: "All zones", multi: true },
  { key: "region", label: "Region", icon: Map, allLabel: "All regions", multi: true },
  { key: "state", label: "State", icon: MapPin, allLabel: "All states", multi: true },
  { key: "city", label: "City", icon: Building2, allLabel: "All cities", multi: true },
  { key: "caller", label: "Caller", icon: Phone, allLabel: "All callers", multi: true },
  { key: "assignment", label: "Assignment", icon: ClipboardList, allLabel: "All", multi: false },
];

function valueLabel(field, filters) {
  const v = filters[field.key];
  if (field.multi) {
    if (!v.length) return field.allLabel;
    return v.length === 1 ? v[0] : `${v.length} selected`;
  }
  return v;
}

function FilterDropdown({ field, filters, options, onChange }) {
  const Icon = field.icon;
  const selected = filters[field.key];
  const active = field.multi ? selected.length > 0 : selected !== field.allLabel;

  const toggle = (opt) => {
    if (!field.multi) return onChange(field.key, opt);
    const next = selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt];
    onChange(field.key, next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${field.label} filter`}
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-left transition-colors",
            "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? "border-primary/50 bg-primary/5" : "border-border",
          )}
        >
          <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-[10px] text-muted-foreground">{field.label}</span>
            <span className="block truncate text-xs font-medium text-foreground">{valueLabel(field, filters)}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <div className="max-h-64 overflow-y-auto scrollbar-thin">
          {field.multi && (
            <button
              type="button"
              onClick={() => onChange(field.key, [])}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              {field.allLabel}
              {!selected.length && <Check className="h-3.5 w-3.5" />}
            </button>
          )}
          {options.map((opt) => {
            const isOn = field.multi ? selected.includes(opt) : selected === opt;
            return (
              <button
                key={opt}
                type="button"
                aria-pressed={isOn}
                onClick={() => toggle(opt)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
                  isOn && "bg-primary/10 font-medium text-primary",
                )}
              >
                <span className="truncate">{opt}</span>
                {isOn && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
          {!options.length && <div className="px-2 py-3 text-xs text-muted-foreground">No options</div>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CampaignFilterToolbar({ filters, options, onChange, onReset, activeCount, resultCount }) {
  return (
    <section aria-label="Campaign filters" className="rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 items-center gap-2 pr-1">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <span className="truncate text-xs font-semibold">Filter campaigns</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-semibold text-primary tabular-nums">
              {activeCount}
            </span>
          )}
        </div>

        {FIELDS.map((f) => (
          <FilterDropdown key={f.key} field={f} filters={filters} options={options[f.key] || []} onChange={onChange} />
        ))}

        <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto gap-1.5 text-xs">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground" aria-live="polite">
        {resultCount} campaign{resultCount === 1 ? "" : "s"} match the current filters.
      </p>
    </section>
  );
}
