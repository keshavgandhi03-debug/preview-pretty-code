import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CLIENTS, COUNSELLORS, PROGRAMS, feedbackById } from "@/lib/crm-data";
import { activeFeedbackTaxonomy, statusMatchesFeedback, useSettings } from "@/lib/settings-store";
import {
  DATE_RANGES, parseSearch, toSearch, queryLeads, statusCounts, substatusCounts, EMPTY_FILTERS,
} from "@/lib/lead-filters";
import { FilterGroup, Chip, Initials, SearchBox, AppliedFilters } from "@/components/filters/filter-primitives";
import { SubstatusBar } from "@/components/filters/substatus-bar";
import { LeadResults } from "@/components/filters/lead-results";
import { LeadDrawer } from "@/components/lead-drawer";
import { ListFilter } from "lucide-react";

export const Route = createFileRoute("/")({
  validateSearch: (search) => toSearch(parseSearch(search)),
  head: () => ({
    meta: [
      { title: "Dashboard — Counsellor Panel" },
      { name: "description", content: "Filter leads by client, date range, program, counsellor and call outcome, then work the filtered list." },
      { property: "og:title", content: "Dashboard — Counsellor Panel" },
      { property: "og:description", content: "Filter leads by client, date range, program, counsellor and call outcome, then work the filtered list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardHome,
});

const PAGE_SIZE = 10;
const clientName = (id) => CLIENTS.find((c) => c.id === id)?.name || id;

function DashboardHome() {
  const navigate = useNavigate({ from: "/" });
  const search = Route.useSearch();
  const filters = useMemo(() => parseSearch(search), [search]);
  const settings = useSettings();
  const taxonomy = useMemo(() => activeFeedbackTaxonomy(settings), [settings]);

  const [counsellorQuery, setCounsellorQuery] = useState("");
  const [clientQuery, setClientQuery] = useState("");
  const [showAllCounsellors, setShowAllCounsellors] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.q);
  const [customFollowUp, setCustomFollowUp] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const resultsRef = useRef(null);

  const setFilters = useCallback(
    (patch) => {
      navigate({ search: (prev) => toSearch({ ...parseSearch(prev), page: 1, ...patch }), replace: true });
    },
    [navigate],
  );

  const toggleIn = (key, value) => {
    const list = filters[key];
    setFilters({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  // Debounced free-text search -> URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.q) setFilters({ q: searchInput });
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput, filters.q, setFilters]);

  // Simulated async query (swap for server-side fetch when available)
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [search]);

  const result = useMemo(
    () => queryLeads(filters, { sort: filters.sort, dir: filters.dir, page: filters.page, pageSize: PAGE_SIZE }),
    [filters],
  );
  const sCounts = useMemo(() => statusCounts(filters), [filters]);
  const subCounts = useMemo(() => substatusCounts(filters), [filters]);

  const visibleClients = CLIENTS.filter((c) => c.name.toLowerCase().includes(clientQuery.toLowerCase()));
  const matchedCounsellors = COUNSELLORS.filter((c) => c.toLowerCase().includes(counsellorQuery.toLowerCase()));
  const shownCounsellors = showAllCounsellors ? matchedCounsellors : matchedCounsellors.slice(0, 6);
  const hiddenCount = matchedCounsellors.length - shownCounsellors.length;

  const applied = [
    ...filters.clients.map((id) => ({ key: `c-${id}`, label: clientName(id), onRemove: () => toggleIn("clients", id) })),
    ...(filters.range !== "month" || filters.from || filters.to
      ? [{
          key: "range",
          label: filters.range === "custom"
            ? `Custom: ${filters.from || "…"} → ${filters.to || "…"}`
            : DATE_RANGES.find((d) => d.id === filters.range)?.label || filters.range,
          onRemove: () => setFilters({ range: "month", from: "", to: "" }),
        }]
      : []),
    ...filters.programs.map((p) => ({ key: `p-${p}`, label: p, onRemove: () => toggleIn("programs", p) })),
    ...filters.counsellors.map((c) => ({ key: `co-${c}`, label: c, onRemove: () => toggleIn("counsellors", c) })),
    ...(filters.status
      ? [{ key: "st", label: taxonomy.find((s) => s.id === filters.status || s.legacyId === filters.status)?.label || feedbackById(filters.status)?.label || filters.status, onRemove: () => setFilters({ status: "", subs: [] }) }]
      : []),
    ...filters.subs.map((s) => ({ key: `s-${s}`, label: s, onRemove: () => toggleIn("subs", s) })),
    ...(filters.q ? [{ key: "q", label: `“${filters.q}”`, onRemove: () => { setSearchInput(""); setFilters({ q: "" }); } }] : []),
  ];

  const selectStatus = (id) => {
    if (filters.status === id) setFilters({ status: "", subs: [] });
    else {
      const status = taxonomy.find((item) => item.id === id);
      setFilters({ status: id, subs: filters.subs.filter((s) => status?.subs.some((sub) => sub.name === s)) });
    }
  };

  const onSort = (col) => setFilters({ sort: col, dir: filters.sort === col && filters.dir === "desc" ? "asc" : "desc" });

  const viewLeads = () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <AppShell title="Dashboard" breadcrumbs={[{ label: "Home" }]}>
      <div className="space-y-3 p-3 sm:p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Organization overview</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Calling Dashboard</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Track leads, campaigns, calling activity and team performance.</p>
        </div>

        <div className="border-b border-border/70 pb-2">
          <FilterGroup
            id="f-client"
            label="Client"
            action={<SearchBox value={clientQuery} onChange={setClientQuery} label="Search clients" placeholder="Search clients…" className="w-44 sm:w-56" />}
          >
            <div className="flex flex-wrap gap-2">
              {visibleClients.map((c) => (
                <Chip key={c.id} active={filters.clients.includes(c.id)} onClick={() => toggleIn("clients", c.id)}>
                  {c.name}
                </Chip>
              ))}
              {visibleClients.length === 0 ? <p className="text-xs text-muted-foreground">No clients match.</p> : null}
            </div>
          </FilterGroup>

          <FilterGroup id="f-date" label="Date Range">
            <div className="flex flex-wrap gap-2">
              {DATE_RANGES.map((d) => (
                <Chip
                  key={d.id}
                  active={filters.range === d.id}
                  onClick={() => setFilters({ range: d.id, from: "", to: "" })}
                >
                  {d.label}
                </Chip>
              ))}
            </div>
            {filters.range === "custom" ? (
              <div className="mt-3 flex flex-wrap gap-4">
                <label className="text-xs font-medium text-muted-foreground">
                  Start date
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => setFilters({ from: e.target.value })}
                    className="mt-1 block h-9 rounded-md border border-input bg-card px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
                <label className="text-xs font-medium text-muted-foreground">
                  End date
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => setFilters({ to: e.target.value })}
                    className="mt-1 block h-9 rounded-md border border-input bg-card px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              </div>
            ) : null}
          </FilterGroup>

          <FilterGroup id="f-program" label="Program">
            <div className="flex flex-wrap gap-2">
              {PROGRAMS.map((p) => (
                <Chip key={p} active={filters.programs.includes(p)} onClick={() => toggleIn("programs", p)}>
                  {p}
                </Chip>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup
            id="f-counsellors"
            label="Counsellors"
            action={<SearchBox value={counsellorQuery} onChange={setCounsellorQuery} label="Search counsellors" placeholder="Search counsellor…" className="w-44 sm:w-56" />}
          >
            <div className="flex flex-wrap items-center gap-2">
              {shownCounsellors.map((c) => (
                <Chip key={c} active={filters.counsellors.includes(c)} onClick={() => toggleIn("counsellors", c)} avatar={<Initials name={c} />}>
                  {c}
                </Chip>
              ))}
              {hiddenCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowAllCounsellors(true)}
                  className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  +{hiddenCount} more
                </button>
              ) : null}
              {showAllCounsellors && matchedCounsellors.length > 6 ? (
                <button
                  type="button"
                  onClick={() => setShowAllCounsellors(false)}
                  className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Show less
                </button>
              ) : null}
            </div>
          </FilterGroup>

          <FilterGroup id="f-feedback" label="Feedback / Call Outcome">
            <div className="flex flex-wrap gap-2">
              {taxonomy.map((f) => (
                <Chip
                  key={f.id}
                  tone={f.tone}
                  active={filters.status === f.id}
                  count={sCounts[f.id] ?? 0}
                  onClick={() => selectStatus(f.id)}
                  ariaLabel={`${f.label}, ${sCounts[f.id] ?? 0} leads`}
                >
                  {f.label}
                </Chip>
              ))}
            </div>
            {filters.status ? (
              <div className="mt-3">
                <SubstatusBar
                  status={filters.status}
                  taxonomy={taxonomy}
                  selected={filters.subs}
                  counts={subCounts}
                  onToggle={(s) => toggleIn("subs", s)}
                  customValue={customFollowUp}
                  onCustomChange={setCustomFollowUp}
                />
              </div>
            ) : null}
          </FilterGroup>

          <FilterGroup id="f-applied" label="Applied Filters">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <AppliedFilters
                items={applied}
                onClearAll={() => { setSearchInput(""); navigate({ search: toSearch(EMPTY_FILTERS), replace: true }); }}
              />
              <button
                type="button"
                onClick={viewLeads}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ListFilter className="h-3.5 w-3.5" /> View Leads ({result.total.toLocaleString()})
              </button>
            </div>
          </FilterGroup>
        </div>

        <div ref={resultsRef}>
            <LeadResults
            result={result}
            loading={loading}
            error={null}
            onRetry={() => setLoading(false)}
            search={searchInput}
            onSearchChange={setSearchInput}
            sort={filters.sort}
            dir={filters.dir}
            onSort={onSort}
            onPage={(p) => navigate({ search: (prev) => toSearch({ ...parseSearch(prev), page: p }), replace: true })}
            onView={setSelectedLead}
            clientName={clientName}
              taxonomy={taxonomy}
          />
        </div>
      </div>

      <LeadDrawer lead={selectedLead} open={!!selectedLead} onOpenChange={(o) => !o && setSelectedLead(null)} />
    </AppShell>
  );
}
