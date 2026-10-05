import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Search, Loader2, Inbox, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampaignFilterToolbar } from "@/components/campaigns/filter-toolbar";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { AssignCampaignDrawer } from "@/components/campaigns/assign-drawer";
import { ViewTeamDialog, ManageCounsellorsDialog, UploadLeadsDialog } from "@/components/campaigns/campaign-modals";
import {
  EMPTY_FILTERS,
  activeFilterCount,
  filterCampaigns,
  filterOptions,
  getCampaigns,
  setCampaignStatus,
  subscribeCampaigns,
} from "@/lib/campaign-store";

const MULTI_KEYS = ["status", "zone", "region", "state", "city", "caller"];

const asArray = (v) => (Array.isArray(v) ? v.map(String) : typeof v === "string" && v ? v.split(",") : []);

// Only non-default values are kept, so the URL stays short and shareable.
const cleanSearch = (search = {}) => {
  const out = {};
  for (const k of MULTI_KEYS) {
    const arr = asArray(search[k]);
    if (arr.length) out[k] = arr;
  }
  if (typeof search.assignment === "string" && search.assignment !== "All") out.assignment = search.assignment;
  if (typeof search.q === "string" && search.q) out.q = search.q;
  return out;
};

export const Route = createFileRoute("/campaigns/")({
  validateSearch: cleanSearch,
  head: () => ({
    meta: [
      { title: "Calling Campaigns — CollegeWollege CRM" },
      { name: "description", content: "Filter, monitor and assign calling campaigns across clients, zones and counsellor teams." },
      { property: "og:title", content: "Calling Campaigns — CollegeWollege CRM" },
      { property: "og:description", content: "Filter, monitor and assign calling campaigns across clients, zones and counsellor teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampaignsList,
});

function CampaignsList() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/campaigns/" });

  const [campaigns, setCampaigns] = useState(() => getCampaigns());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(search.q || "");

  const [drawer, setDrawer] = useState({ open: false, preselectId: "" });
  const [team, setTeam] = useState(null);
  const [manage, setManage] = useState(null);
  const [upload, setUpload] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    const t = setTimeout(() => {
      try {
        setCampaigns(getCampaigns());
        setLoading(false);
      } catch (e) {
        setError(e?.message || "Could not load campaigns.");
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => load(), [load]);
  useEffect(() => subscribeCampaigns(() => setCampaigns(getCampaigns())), []);

  // debounce the global search into the URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== (search.q || "")) navigate({ search: (prev) => cleanSearch({ ...prev, q: query }), replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [query, search.q, navigate]);

  const filters = useMemo(() => ({ ...EMPTY_FILTERS, ...search }), [search]);
  const options = useMemo(() => filterOptions(campaigns), [campaigns]);
  const visible = useMemo(() => filterCampaigns(campaigns, filters), [campaigns, filters]);

  const onFilterChange = (key, value) =>
    navigate({ search: (prev) => cleanSearch({ ...prev, [key]: value }), replace: true });

  const onReset = () =>
    navigate({ search: {}, replace: true });

  const handleStatus = async (campaign, next) => {
    if (campaign.status === next) return;
    try {
      await setCampaignStatus(campaign.id, next);
      toast.success(`${campaign.name} marked ${next}`);
    } catch (e) {
      toast.error(e?.message || "Could not update status.");
    }
  };

  return (
    <AppShell title="Calling Campaigns" breadcrumbs={[{ label: "Home", to: "/" }, { label: "Campaigns" }]}>
      <div className="space-y-4 p-4 md:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight">Calling Campaigns</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Monitor campaign health, manage counsellor teams and assign new calling buckets.
            </p>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none">
            <div className="relative min-w-[200px] flex-1 sm:w-72 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search leads or campaigns"
                placeholder="Search leads, CWID, mobile, campaign…"
                className="h-9 pl-8 text-xs"
              />
            </div>
            <Button className="h-9 gap-1.5 text-xs" onClick={() => setDrawer({ open: true, preselectId: "" })}>
              <Plus className="h-3.5 w-3.5" /> Assign Campaign
            </Button>
          </div>
        </header>

        <CampaignFilterToolbar
          filters={filters}
          options={options}
          onChange={onFilterChange}
          onReset={onReset}
          activeCount={activeFilterCount(filters) + (filters.q ? 1 : 0)}
          resultCount={visible.length}
        />

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-16 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading campaigns…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 py-14 text-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-xs text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="text-xs" onClick={load}>Retry</Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-14 text-center">
            <Inbox className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No campaigns match the current filters.</p>
            <Button variant="outline" size="sm" className="text-xs" onClick={onReset}>Clear filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            {visible.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onStatusChange={handleStatus}
                onUpload={setUpload}
                onViewTeam={setTeam}
                onManage={setManage}
                onAssign={(campaign) => setDrawer({ open: true, preselectId: campaign.clientId })}
              />
            ))}
          </div>
        )}
      </div>

      <AssignCampaignDrawer
        open={drawer.open}
        campaigns={campaigns}
        preselectId={drawer.preselectId}
        onClose={() => setDrawer({ open: false, preselectId: "" })}
        onAssigned={(res) => {
          setDrawer({ open: false, preselectId: "" });
          toast.success(`${res.assigned} leads assigned to ${res.campaign}`);
        }}
      />

      <ViewTeamDialog campaign={team} open={!!team} onOpenChange={(o) => !o && setTeam(null)} />
      <ManageCounsellorsDialog
        campaign={manage}
        open={!!manage}
        onOpenChange={(o) => !o && setManage(null)}
        onSaved={() => {
          setManage(null);
          toast.success("Counsellor team updated");
        }}
      />
      <UploadLeadsDialog
        campaign={upload}
        open={!!upload}
        onOpenChange={(o) => !o && setUpload(null)}
        onUploaded={(rows) => toast.success(`${rows} leads uploaded`)}
      />
    </AppShell>
  );
}
