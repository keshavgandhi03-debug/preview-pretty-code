const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "@/lib/jsx-dev-shim"; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { CLIENTS, leadsByClient, campaignKpis, maskMobile, maskEmail, LEVEL1_STATUSES, LEVEL2_STATUSES } from "@/lib/crm-data";
import { StatusBadge } from "@/components/status-badge";
import { LeadDetailModal } from "@/components/lead-detail-modal";
import { KpiCard } from "@/components/kpi-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Filter, Download, Users, CheckCircle2, BellRing,
  ClipboardList, Send, TrendingUp, Target, ChevronLeft, ChevronRight, Phone,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RelativeTime } from "@/components/relative-time";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campaigns/$clientId")({
  loader: ({ params }) => {
    const client = CLIENTS.find((c) => c.id === params.clientId);
    if (!client) throw notFound();
    return { client };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.client.name} — Campaign Workspace` : "Campaign" }],
  }),
  component: CampaignWorkspace,
  notFoundComponent: () => (
    _jsxDEV(AppShell, { title: "Campaign not found"  , children: 
      _jsxDEV('div', { className: "p-6", children: _jsxDEV(Link, { to: "/campaigns", className: "text-primary", children: "Back to campaigns"  }, void 0, false, {fileName: _jsxFileName, lineNumber: 30}, this)}, void 0, false, {fileName: _jsxFileName, lineNumber: 30}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 29}, this)
  ),
});

const ALL = "__all__";
const PAGE_SIZE = 15;

const REMARKS = [
  "Interested in scholarship options",
  "Asked to call back after 2 PM",
  "Wants brochure via WhatsApp",
  "Parent will decide, follow-up next week",
  "Comparing with another college",
  "Ready to start application",
  "Not picking up, retry evening",
  "Confirmed budget fits programme",
];
const remarkFor = (id) => REMARKS[Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % REMARKS.length];

function CampaignWorkspace() {
  const { client } = Route.useLoaderData();
  const allLeads = useMemo(() => leadsByClient(client.id), [client.id]);
  const kpis = useMemo(() => campaignKpis(client.id), [client.id]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSelectedId(null); setQ(""); setStatus(ALL); setPriority(ALL); setPage(1);
  }, [client.id]);

  const filtered = useMemo(() => {
    return allLeads.filter((l) => {
      if (status !== ALL && l.status !== status) return false;
      if (priority !== ALL && l.priority !== priority) return false;
      if (q) {
        const s = q.toLowerCase();
        return [l.name, l.cwid, l.mobile, l.email, l.city, l.interestedCourse].some((f) => f.toLowerCase().includes(s));
      }
      return true;
    });
  }, [allLeads, status, priority, q]);

  useEffect(() => { setPage(1); }, [q, status, priority]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selected = useMemo(
    () => _nullishCoalesce(allLeads.find((l) => l.id === selectedId), () => ( null)),
    [allLeads, selectedId],
  );

  const openLead = (id) => { setSelectedId(id); setModalOpen(true); };

  const goNext = () => {
    if (!selectedId) return;
    const idx = filtered.findIndex((l) => l.id === selectedId);
    const next = filtered[idx + 1];
    if (next) {
      setSelectedId(next.id);
      setModalOpen(true);
      const nextPage = Math.floor((idx + 1) / PAGE_SIZE) + 1;
      if (nextPage !== page) setPage(nextPage);
    } else {
      setModalOpen(false);
    }
  };

  return (
    _jsxDEV(AppShell, {
      title: `${client.name} · Workspace`,
      breadcrumbs: [{ label: "Campaigns", to: "/campaigns" }, { label: client.name }],
 children: [
      _jsxDEV('div', { className: "p-5 space-y-4" , children: [
        /* Campaign header */
        _jsxDEV('div', { className: "flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3"        , children: [
          _jsxDEV('div', { className: `h-11 w-11 rounded-xl bg-gradient-to-br ${client.color} text-white flex items-center justify-center font-semibold shrink-0`, children: 
            client.short
          }, void 0, false, {fileName: _jsxFileName, lineNumber: 112}, this)
          , _jsxDEV('div', { className: "flex-1 min-w-0" , children: [
            _jsxDEV('div', { className: "text-base font-semibold tracking-tight"  , children: client.name}, void 0, false, {fileName: _jsxFileName, lineNumber: 116}, this)
            , _jsxDEV('div', { className: "text-[11px] text-muted-foreground" , children: [allLeads.length, " leads assigned · "    , client.counsellors, " counsellors on this campaign"    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 117}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 115}, this)
          , _jsxDEV('div', { className: "flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5"        , children: [
            _jsxDEV(Target, { className: "h-3.5 w-3.5 text-primary"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 120}, this )
            , _jsxDEV('div', { className: "text-[11px] text-muted-foreground" , children: "Today"}, void 0, false, {fileName: _jsxFileName, lineNumber: 121}, this)
            , _jsxDEV('div', { className: "text-xs font-semibold" , children: [kpis.callsMadeToday, "/", kpis.callsTargetToday]}, void 0, true, {fileName: _jsxFileName, lineNumber: 122}, this)
            , _jsxDEV('div', { className: "w-24 h-1.5 rounded-full bg-muted overflow-hidden"    , children: 
              _jsxDEV('div', { className: "h-full bg-primary" , style: { width: `${Math.min(kpis.callingProgressPct, 100)}%` },}, void 0, false, {fileName: _jsxFileName, lineNumber: 124}, this )
            }, void 0, false, {fileName: _jsxFileName, lineNumber: 123}, this)
            , _jsxDEV('div', { className: "text-[11px] font-medium text-primary"  , children: [kpis.callingProgressPct, "%"]}, void 0, true, {fileName: _jsxFileName, lineNumber: 126}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 119}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 111}, this)

        /* Six compact KPI cards */
        , _jsxDEV('div', { className: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5"    , children: [
          _jsxDEV(KpiCard, { label: "Assigned Leads" , value: kpis.totalAssigned, icon: Users, tone: "default",}, void 0, false, {fileName: _jsxFileName, lineNumber: 132}, this )
          , _jsxDEV(KpiCard, { label: "Active Counsellors" , value: client.counsellors, icon: Users, tone: "default",}, void 0, false, {fileName: _jsxFileName, lineNumber: 133}, this )
          , _jsxDEV(KpiCard, { label: "Connected Today" , value: kpis.connectedLeads, icon: CheckCircle2, tone: "success",}, void 0, false, {fileName: _jsxFileName, lineNumber: 134}, this )
          , _jsxDEV(KpiCard, { label: "Follow-ups Due" , value: kpis.pendingFollowups, icon: BellRing, tone: "followup",}, void 0, false, {fileName: _jsxFileName, lineNumber: 135}, this )
          , _jsxDEV(KpiCard, { label: "Applications", value: kpis.appsStarted + kpis.appsConverted, icon: Send, tone: "interested",}, void 0, false, {fileName: _jsxFileName, lineNumber: 136}, this )
          , _jsxDEV(KpiCard, { label: "Conversion Rate" , value: `${Math.round((kpis.admissionsConfirmed / Math.max(1, kpis.totalAssigned)) * 100)}%`, icon: TrendingUp, tone: "success", hint: `${kpis.admissionsConfirmed} admissions`,}, void 0, false, {fileName: _jsxFileName, lineNumber: 137}, this )
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 131}, this)

        /* Filters */
        , _jsxDEV('div', { className: "rounded-xl border border-border bg-card"   , children: [
          _jsxDEV('div', { className: "px-4 py-3 border-b border-border flex items-center gap-2 flex-wrap"       , children: [
            _jsxDEV('div', { className: "relative flex-1 min-w-[220px] max-w-sm"   , children: [
              _jsxDEV(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 144}, this )
              , _jsxDEV(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search name, mobile, email…"    , className: "pl-9 h-9 bg-background"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 145}, this )
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 143}, this)
            , _jsxDEV(Select, { value: status, onValueChange: setStatus, children: [
              _jsxDEV(SelectTrigger, { className: "w-[170px] h-9 bg-background"  , children: _jsxDEV(SelectValue, { placeholder: "Status",}, void 0, false, {fileName: _jsxFileName, lineNumber: 148}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 148}, this)
              , _jsxDEV(SelectContent, { className: "max-h-72", children: [
                _jsxDEV(SelectItem, { value: ALL, children: "All statuses" }, void 0, false, {fileName: _jsxFileName, lineNumber: 150}, this)
                , _jsxDEV('div', { className: "px-2 py-1 text-[10px] uppercase text-muted-foreground tracking-wider"     , children: "Level 1" }, void 0, false, {fileName: _jsxFileName, lineNumber: 151}, this)
                , LEVEL1_STATUSES.map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 152}, this))
                , _jsxDEV('div', { className: "px-2 py-1 text-[10px] uppercase text-muted-foreground tracking-wider"     , children: "Level 2" }, void 0, false, {fileName: _jsxFileName, lineNumber: 153}, this)
                , LEVEL2_STATUSES.map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 154}, this))
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 149}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 147}, this)
            , _jsxDEV(Select, { value: priority, onValueChange: setPriority, children: [
              _jsxDEV(SelectTrigger, { className: "w-[130px] h-9 bg-background"  , children: _jsxDEV(SelectValue, { placeholder: "Priority",}, void 0, false, {fileName: _jsxFileName, lineNumber: 158}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 158}, this)
              , _jsxDEV(SelectContent, { children: [
                _jsxDEV(SelectItem, { value: ALL, children: "All priorities" }, void 0, false, {fileName: _jsxFileName, lineNumber: 160}, this)
                , _jsxDEV(SelectItem, { value: "High", children: "High"}, void 0, false, {fileName: _jsxFileName, lineNumber: 161}, this)
                , _jsxDEV(SelectItem, { value: "Medium", children: "Medium"}, void 0, false, {fileName: _jsxFileName, lineNumber: 162}, this)
                , _jsxDEV(SelectItem, { value: "Low", children: "Low"}, void 0, false, {fileName: _jsxFileName, lineNumber: 163}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 159}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 157}, this)
            , _jsxDEV(Button, { variant: "outline", size: "sm", className: "gap-1.5 h-9" , children: [_jsxDEV(Filter, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 166}, this ), " More" ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 166}, this)
            , _jsxDEV(Button, { variant: "outline", size: "sm", className: "gap-1.5 h-9" , children: [_jsxDEV(Download, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 167}, this ), " Export" ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 167}, this)
            , _jsxDEV('div', { className: "text-xs text-muted-foreground ml-auto"  , children: [filtered.length, " of "  , allLeads.length]}, void 0, true, {fileName: _jsxFileName, lineNumber: 168}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 142}, this)

          /* Full-width table */
          , _jsxDEV('div', { className: "overflow-x-auto scrollbar-thin" , children: 
            _jsxDEV('table', { className: "w-full text-sm" , children: [
              _jsxDEV('thead', { className: "bg-muted/60 text-muted-foreground text-[11px] uppercase tracking-wider"    , children: 
                _jsxDEV('tr', { children: [
                  _jsxDEV(Th, { children: "Call"}, void 0, false, {fileName: _jsxFileName, lineNumber: 176}, this)
                  , _jsxDEV(Th, { children: "Student"}, void 0, false, {fileName: _jsxFileName, lineNumber: 176}, this)
                  , _jsxDEV(Th, { children: "Mobile"}, void 0, false, {fileName: _jsxFileName, lineNumber: 178}, this)
                  , _jsxDEV(Th, { children: "Email"}, void 0, false, {fileName: _jsxFileName, lineNumber: 179}, this)
                  , _jsxDEV(Th, { children: "City"}, void 0, false, {fileName: _jsxFileName, lineNumber: 180}, this)
                  , _jsxDEV(Th, { children: "State"}, void 0, false, {fileName: _jsxFileName, lineNumber: 181}, this)
                  , _jsxDEV(Th, { children: "Master Course" }, void 0, false, {fileName: _jsxFileName, lineNumber: 182}, this)
                  , _jsxDEV(Th, { children: "Interested Course" }, void 0, false, {fileName: _jsxFileName, lineNumber: 183}, this)
                  , _jsxDEV(Th, { children: "Status"}, void 0, false, {fileName: _jsxFileName, lineNumber: 184}, this)
                  , _jsxDEV(Th, { children: "Last Contact" }, void 0, false, {fileName: _jsxFileName, lineNumber: 185}, this)
                  , _jsxDEV(Th, { children: "Next F/U" }, void 0, false, {fileName: _jsxFileName, lineNumber: 186}, this)
                  , _jsxDEV(Th, { children: "Last Remark" }, void 0, false, {fileName: _jsxFileName, lineNumber: 187}, this)
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 175}, this)
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 174}, this)
              , _jsxDEV('tbody', { children: [
                pageRows.map((l) => (
                  _jsxDEV('tr', {

                    onClick: () => openLead(l.id),
                    className: "border-t border-border cursor-pointer hover:bg-primary/5 transition-colors"    ,
 children: [
                    _jsxDEV(Td, { children: _jsxDEV(Button, {
                      type: "button",
                      variant: "outline",
                      size: "icon",
                      className: "h-8 w-8 text-primary hover:bg-primary/10",
                      "aria-label": `Call ${l.name}`,
                      onClick: (event) => { event.stopPropagation(); window.location.href = `tel:${l.mobile.replace(/\\s/g, "")}`; },
                      children: _jsxDEV(Phone, { className: "h-3.5 w-3.5" }, void 0, false, {fileName: _jsxFileName, lineNumber: 198}, this)
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 198}, this)}, void 0, false, {fileName: _jsxFileName, lineNumber: 197}, this)
                    , _jsxDEV(Td, { children:
                      _jsxDEV('div', { className: "flex items-center gap-2.5"  , children: [
                        _jsxDEV('div', { className: "h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center shrink-0"            , children:
                          l.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
                        }, void 0, false, {fileName: _jsxFileName, lineNumber: 199}, this)
                        , _jsxDEV('div', { className: "min-w-0", children: [
                          _jsxDEV('div', { className: "font-medium truncate" , children: l.name}, void 0, false, {fileName: _jsxFileName, lineNumber: 203}, this)
                          , _jsxDEV('div', { className: "text-[11px] text-muted-foreground truncate"  , children: ["Score " , l.score]}, void 0, true, {fileName: _jsxFileName, lineNumber: 204}, this)
                        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 202}, this)
                      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 198}, this)
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 197}, this)
                    , _jsxDEV(Td, { className: "whitespace-nowrap font-mono text-[12px]"  , children: maskMobile(l.mobile)}, void 0, false, {fileName: _jsxFileName, lineNumber: 209}, this)
                    , _jsxDEV(Td, { className: "whitespace-nowrap max-w-[200px] truncate"  , children: maskEmail(l.email)}, void 0, false, {fileName: _jsxFileName, lineNumber: 210}, this)
                    , _jsxDEV(Td, { className: "whitespace-nowrap", children: l.city}, void 0, false, {fileName: _jsxFileName, lineNumber: 211}, this)
                    , _jsxDEV(Td, { className: "whitespace-nowrap text-muted-foreground" , children: l.state}, void 0, false, {fileName: _jsxFileName, lineNumber: 212}, this)
                    , _jsxDEV(Td, { className: "whitespace-nowrap", children: l.masterCourse}, void 0, false, {fileName: _jsxFileName, lineNumber: 213}, this)
                    , _jsxDEV(Td, { className: "whitespace-nowrap", children: l.interestedCourse}, void 0, false, {fileName: _jsxFileName, lineNumber: 214}, this)
                    , _jsxDEV(Td, { children: _jsxDEV(StatusBadge, { status: l.status,}, void 0, false, {fileName: _jsxFileName, lineNumber: 215}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 215}, this)
                    , _jsxDEV(Td, { className: "text-[11px] text-muted-foreground whitespace-nowrap"  , children: 
                      _jsxDEV(RelativeTime, { value: l.lastContact }, void 0, false, {fileName: _jsxFileName, lineNumber: 217}, this)
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 216}, this)
                    , _jsxDEV(Td, { className: "text-[11px] whitespace-nowrap" , children: 
                      l.nextFollowup ? (
                        _jsxDEV('span', { className: "text-[color:var(--followup)]", children: 
                          _jsxDEV(RelativeTime, { value: l.nextFollowup }, void 0, false, {fileName: _jsxFileName, lineNumber: 222}, this)
                        }, void 0, false, {fileName: _jsxFileName, lineNumber: 221}, this)
                      ) : _jsxDEV('span', { className: "text-muted-foreground", children: "—"}, void 0, false, {fileName: _jsxFileName, lineNumber: 224}, this)
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 219}, this)
                    , _jsxDEV(Td, { className: "max-w-[220px] text-[11px] text-muted-foreground truncate"   , children: remarkFor(l.id)}, void 0, false, {fileName: _jsxFileName, lineNumber: 226}, this)
                  ]}, l.id, true, {fileName: _jsxFileName, lineNumber: 192}, this)
                ))
                , pageRows.length === 0 && (
                  _jsxDEV('tr', { children: _jsxDEV('td', { colSpan: 12, className: "text-center py-12 text-sm text-muted-foreground"   , children: "No leads match your filters."    }, void 0, false, {fileName: _jsxFileName, lineNumber: 230}, this)}, void 0, false, {fileName: _jsxFileName, lineNumber: 230}, this)
                )
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 190}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 173}, this)
          }, void 0, false, {fileName: _jsxFileName, lineNumber: 172}, this)

          /* Pagination */
          , _jsxDEV('div', { className: "px-4 py-3 border-t border-border flex items-center justify-between text-xs"       , children: [
            _jsxDEV('div', { className: "text-muted-foreground", children: ["Showing "
               , (page - 1) * PAGE_SIZE + 1, "–", Math.min(page * PAGE_SIZE, filtered.length), " of "  , filtered.length
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 238}, this)
            , _jsxDEV('div', { className: "flex items-center gap-1"  , children: [
              _jsxDEV(Button, { variant: "outline", size: "sm", className: "h-8 gap-1" , disabled: page === 1, onClick: () => setPage((p) => p - 1), children: [
                _jsxDEV(ChevronLeft, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 243}, this ), " Prev"
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 242}, this)
              , _jsxDEV('div', { className: "px-2 text-muted-foreground" , children: ["Page " , _jsxDEV('b', { className: "text-foreground", children: page}, void 0, false, {fileName: _jsxFileName, lineNumber: 245}, this), " of "  , totalPages]}, void 0, true, {fileName: _jsxFileName, lineNumber: 245}, this)
              , _jsxDEV(Button, { variant: "outline", size: "sm", className: "h-8 gap-1" , disabled: page >= totalPages, onClick: () => setPage((p) => p + 1), children: ["Next "
                 , _jsxDEV(ChevronRight, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 247}, this )
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 246}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 241}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 237}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 141}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 109}, this)

      , _jsxDEV(LeadDetailModal, {
        lead: selected,
        open: modalOpen,
        onOpenChange: setModalOpen,
        onSaveAndNext: goNext,}, void 0, false, {fileName: _jsxFileName, lineNumber: 254}, this
      )
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 105}, this)
  );
}

function Th({ children }) {
  return _jsxDEV('th', { className: cn("text-left font-medium px-3 py-2.5 whitespace-nowrap bg-muted/60"), children: children}, void 0, false, {fileName: _jsxFileName, lineNumber: 265}, this);
}
function Td({ children, className = "" }) {
  return _jsxDEV('td', { className: `px-3 py-3 ${className}`, children: children}, void 0, false, {fileName: _jsxFileName, lineNumber: 268}, this);
}
