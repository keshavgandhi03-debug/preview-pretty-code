import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, GraduationCap, BarChart3 } from "lucide-react";
import { RESOURCES, DEFAULT_CLIENT_ID } from "@/lib/share-resources";
import { CLIENTS } from "@/lib/crm-data";

export const Route = createFileRoute("/resources/")({
  head: () => ({
    meta: [
      { title: "Shareable Resources — CollegeWollege" },
      { name: "description", content: "Brochures, placement reports and university details you can share with students over WhatsApp or email." },
      { property: "og:title", content: "Shareable Resources — CollegeWollege" },
      { property: "og:description", content: "Brochures, placement reports and university details for every partner university." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResourcesIndex,
});

const ICONS = { brochure: FileText, "placement-report": BarChart3, "university-details": GraduationCap };

function ResourcesIndex() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-2xl font-semibold">Shareable resources</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a university to open the page students receive when you share from a lead.
      </p>

      <div className="mt-8 space-y-8">
        {RESOURCES.map((r) => {
          const Icon = ICONS[r.id] || FileText;
          return (
            <section key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5">
                <Icon className="h-5 w-5 text-[color:var(--brand)]" />
                <h2 className="text-base font-semibold">{r.label}</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.blurb}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(CLIENTS.length ? CLIENTS : [{ id: DEFAULT_CLIENT_ID, name: "University" }]).map((c) => (
                  <Link
                    key={c.id}
                    to="/resources/$slug"
                    params={{ slug: r.slug }}
                    search={{ client: c.id }}
                    className="rounded-full border border-input px-3 py-1 text-xs font-medium hover:bg-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
