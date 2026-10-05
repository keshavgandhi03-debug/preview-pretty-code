import { ArrowRight } from "lucide-react";
import { Chip } from "@/components/filters/filter-primitives";

export function SubstatusBar({ status, taxonomy = [], selected, counts, onToggle, customValue, onCustomChange }) {
  const parent = taxonomy.find((item) => item.id === status || item.legacyId === status);
  if (!parent) return null;
  const subs = parent.subs || [];
  const showCustomPicker = parent.id === "follow-up" && selected.includes("Custom");

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin">
        <Chip tone={parent.tone} active>{parent.label}</Chip>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div
          role="group"
          aria-label={`${parent.label} substatuses`}
          className="flex items-center gap-2 pb-0.5"
        >
            {subs.map((s) => (
            <Chip
              key={s.id || s.name}
              tone={parent.tone}
              active={selected.includes(s)}
              count={counts[s.name || s] ?? 0}
              onClick={() => onToggle(s.name || s)}
              ariaLabel={`${s.name || s}, ${counts[s.name || s] ?? 0} leads`}
            >
              {s.name || s}
            </Chip>
          ))}
        </div>
      </div>

      {showCustomPicker ? (
        <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-border pt-3">
          <label className="text-xs font-medium text-muted-foreground">
            Custom follow-up date &amp; time
            <input
              type="datetime-local"
              value={customValue || ""}
              onChange={(e) => onCustomChange(e.target.value)}
              className="mt-1 block h-9 rounded-md border border-input bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
