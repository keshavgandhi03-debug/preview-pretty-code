import { ChevronDown, ChevronUp, Eye, Phone, RefreshCw } from "lucide-react";
import { SearchBox } from "@/components/filters/filter-primitives";
import { cn } from "@/lib/utils";

const TONE_TEXT = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
};

const COLUMNS = [
  { id: "name", label: "Lead" },
  { id: "program", label: "Program" },
  { id: "counsellor", label: "Counsellor" },
  { id: "status", label: "Status / Substatus" },
  { id: "lastContact", label: "Last activity" },
];

function StatusPill({ feedback, taxonomy = [] }) {
  const fb = taxonomy.find((item) => item.id === feedback || item.legacyId === feedback);
  if (!fb) return null;
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", TONE_TEXT[fb.tone])}>
      {fb.label}
    </span>
  );
}

export function LeadResults({
  result, loading, error, onRetry, search, onSearchChange, sort, dir, onSort,
  onPage, onView, clientName, taxonomy,
}) {
  return (
    <section aria-labelledby="results-heading" className="rounded-xl border border-border bg-card">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 id="results-heading" className="truncate text-sm font-semibold text-foreground">
            Filtered leads
          </h2>
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${result.total.toLocaleString()} matching leads`}
          </p>
        </div>
        <SearchBox
          value={search}
          onChange={onSearchChange}
          label="Search leads by name, CWID, mobile or email"
          placeholder="Search name, CWID, mobile, email…"
          className="w-full sm:w-72"
        />
      </header>

      {error ? (
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-destructive">Couldn&apos;t load leads.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : result.total === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-foreground">No leads match these filters.</p>
          <p className="mt-1 text-xs text-muted-foreground">Try removing a filter chip or widening the date range.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  {COLUMNS.map((c) => (
                    <th key={c.id} scope="col" className="px-4 py-2.5 font-semibold">
                      <button
                        type="button"
                        onClick={() => onSort(c.id)}
                        aria-label={`Sort by ${c.label}`}
                        className="inline-flex items-center gap-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {c.label}
                        {sort === c.id ? (
                          dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        ) : null}
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-2.5 font-semibold">Contact</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-foreground">{l.name}</div>
                      <div className="text-[11px] text-muted-foreground">{l.cwid} · {clientName(l.clientId)}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs">{l.program}</td>
                    <td className="px-4 py-2.5 text-xs">{l.counsellor}</td>
                    <td className="px-4 py-2.5">
                       <StatusPill feedback={l.feedback} taxonomy={taxonomy} />
                      <div className="mt-1 text-[11px] text-muted-foreground">{l.substatus}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {new Date(l.lastContact).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      <div>{l.mobile}</div>
                      <div className="truncate">{l.email}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onView(l)}
                          className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-[11px] font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Eye className="h-3 w-3" /> View Lead
                        </button>
                        <a
                          href={`tel:${l.mobile.replace(/\s/g, "")}`}
                          aria-label={`Call ${l.name}`}
                          className="inline-flex items-center rounded-md border border-input p-1.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Phone className="h-3 w-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav aria-label="Results pagination" className="flex items-center justify-between gap-3 border-t border-border p-3">
            <p className="text-xs text-muted-foreground">
              Page {result.page} of {result.pageCount}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={result.page <= 1}
                onClick={() => onPage(result.page - 1)}
                className="rounded-md border border-input px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={result.page >= result.pageCount}
                onClick={() => onPage(result.page + 1)}
                className="rounded-md border border-input px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Next
              </button>
            </div>
          </nav>
        </>
      )}
    </section>
  );
}
