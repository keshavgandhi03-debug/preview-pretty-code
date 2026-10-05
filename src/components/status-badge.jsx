const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "@/lib/jsx-dev-shim";import { statusTone, toneStyles, } from "@/lib/crm-data";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }) {
  const tone = statusTone(status);
  return (
    _jsxDEV('span', {
      className: cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap",
        toneStyles[tone],
        className,
      ),
 children: [
      _jsxDEV('span', { className: "h-1.5 w-1.5 rounded-full bg-current opacity-80"    ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 14}, this )
      , status
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 7}, this)
  );
}

export function PriorityDot({ priority }) {
  const cls = priority === "High" ? "bg-[color:var(--hot)]" : priority === "Medium" ? "bg-[color:var(--warm)]" : "bg-muted-foreground/50";
  return (
    _jsxDEV('span', { className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground"    , children: [
      _jsxDEV('span', { className: cn("h-1.5 w-1.5 rounded-full", cls),}, void 0, false, {fileName: _jsxFileName, lineNumber: 24}, this ), " " , priority
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 23}, this)
  );
}
