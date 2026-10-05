const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "@/lib/jsx-dev-shim";import { cn } from "@/lib/utils";













const toneAccent = {
  default: "bg-primary/10 text-primary",
  hot: "bg-[color:var(--hot)]/10 text-[color:var(--hot)]",
  warm: "bg-[color:var(--warm)]/10 text-[color:var(--warm)]",
  cold: "bg-[color:var(--cold)]/10 text-[color:var(--cold)]",
  interested: "bg-[color:var(--interested)]/10 text-[color:var(--interested)]",
  followup: "bg-[color:var(--followup)]/10 text-[color:var(--followup)]",
  success: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
};

export function KpiCard({ label, value, icon: Icon, tone = "default", delta, deltaTone = "neutral", hint }) {
  return (
    _jsxDEV('div', { className: "rounded-xl bg-card border border-border p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow"       , children: [
      _jsxDEV('div', { className: "flex items-start justify-between gap-2"   , children: [
        _jsxDEV('div', { className: "min-w-0", children: [
          _jsxDEV('div', { className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate"     , children: label}, void 0, false, {fileName: _jsxFileName, lineNumber: 30}, this)
          , _jsxDEV('div', { className: "mt-1.5 text-2xl font-semibold tracking-tight text-foreground"    , children: value}, void 0, false, {fileName: _jsxFileName, lineNumber: 31}, this)
          , hint && _jsxDEV('div', { className: "mt-0.5 text-[11px] text-muted-foreground"  , children: hint}, void 0, false, {fileName: _jsxFileName, lineNumber: 32}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 29}, this)
        , Icon && (
          _jsxDEV('div', { className: cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", toneAccent[tone]), children: 
            _jsxDEV(Icon, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 36}, this )
          }, void 0, false, {fileName: _jsxFileName, lineNumber: 35}, this)
        )
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 28}, this)
      , delta && (
        _jsxDEV('div', {
          className: cn(
            "mt-3 inline-flex items-center gap-1 text-[11px] font-medium",
            deltaTone === "up" && "text-emerald-600",
            deltaTone === "down" && "text-destructive",
            deltaTone === "neutral" && "text-muted-foreground",
          ),
 children: 
          delta
        }, void 0, false, {fileName: _jsxFileName, lineNumber: 41}, this)
      )
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 27}, this)
  );
}
