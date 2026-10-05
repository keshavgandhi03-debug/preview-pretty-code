const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "@/lib/jsx-dev-shim";import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Bell, Phone, MessageCircle, CheckCircle2, AlertTriangle, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — CollegeWollege CRM" }] }),
  component: NotificationsPage,
});

const ITEMS = [
  { icon: AlertTriangle, tone: "text-[color:var(--hot)] bg-[color:var(--hot)]/10", title: "3 follow-ups are overdue", detail: "Amity · LPU · MIT-WPU", time: "just now" },
  { icon: CalendarClock, tone: "text-[color:var(--followup)] bg-[color:var(--followup)]/10", title: "Follow-up in 15 minutes", detail: "Aarav Sharma — B.Tech CSE", time: "2m ago" },
  { icon: Phone, tone: "text-emerald-600 bg-emerald-500/10", title: "Missed call from lead", detail: "Diya Patel · +91 98******12", time: "18m ago" },
  { icon: MessageCircle, tone: "text-[color:var(--interested)] bg-[color:var(--interested)]/10", title: "New WhatsApp reply", detail: "Kiara Reddy replied to Fee Structure", time: "1h ago" },
  { icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-500/10", title: "Application submitted", detail: "Vivaan Iyer · LPU · B.Tech AI/ML", time: "3h ago" },
  { icon: Bell, tone: "text-primary bg-primary/10", title: "New leads assigned", detail: "24 fresh leads added to Chandigarh University campaign", time: "5h ago" },
];

function NotificationsPage() {
  return (
    _jsxDEV(AppShell, { title: "Notifications", breadcrumbs: [{ label: "Home", to: "/" }, { label: "Notifications" }], children: 
      _jsxDEV('div', { className: "p-6 max-w-3xl" , children: [
        _jsxDEV('div', { className: "text-sm text-muted-foreground mb-4"  , children: "Recent activity across your campaigns."    }, void 0, false, {fileName: _jsxFileName, lineNumber: 24}, this)
        , _jsxDEV('div', { className: "rounded-xl border border-border bg-card divide-y divide-border"     , children: 
          ITEMS.map((n, i) => (
            _jsxDEV('div', { className: "flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"      , children: [
              _jsxDEV('div', { className: cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", n.tone), children: 
                _jsxDEV(n.icon, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 29}, this )
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 28}, this)
              , _jsxDEV('div', { className: "flex-1 min-w-0" , children: [
                _jsxDEV('div', { className: "text-sm font-medium" , children: n.title}, void 0, false, {fileName: _jsxFileName, lineNumber: 32}, this)
                , _jsxDEV('div', { className: "text-[11px] text-muted-foreground truncate"  , children: n.detail}, void 0, false, {fileName: _jsxFileName, lineNumber: 33}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 31}, this)
              , _jsxDEV('div', { className: "text-[11px] text-muted-foreground whitespace-nowrap"  , children: n.time}, void 0, false, {fileName: _jsxFileName, lineNumber: 35}, this)
            ]}, i, true, {fileName: _jsxFileName, lineNumber: 27}, this)
          ))
        }, void 0, false, {fileName: _jsxFileName, lineNumber: 25}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 23}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 22}, this)
  );
}
