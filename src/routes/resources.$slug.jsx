import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { RESOURCES, resourceById, resourceContent, DEFAULT_CLIENT_ID } from "@/lib/share-resources";

export const Route = createFileRoute("/resources/$slug")({
  validateSearch: (s) => ({ client: typeof s.client === "string" ? s.client : DEFAULT_CLIENT_ID }),
  head: ({ params }) => {
    const res = resourceById(params.slug);
    const title = res ? `${res.label} — CollegeWollege` : "Resource — CollegeWollege";
    const description = res?.blurb || "University information shared by your counsellor.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ResourcePage,
  notFoundComponent: MissingResource,
});

function MissingResource() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="text-xl font-semibold">Resource not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">This link may be out of date.</p>
      <Link to="/resources" className="mt-4 inline-block text-sm font-medium text-[color:var(--brand)] underline">
        Browse all resources
      </Link>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Bullets({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t} className="flex gap-2 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function ResourcePage() {
  const { slug } = Route.useParams();
  const { client: clientId } = Route.useSearch();
  const res = resourceById(slug);
  if (!res) throw notFound();
  const data = resourceContent(res.id, clientId);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="rounded-xl bg-gradient-to-br from-[color:var(--brand)] to-[color:var(--brand-deep)] p-6 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{res.label}</p>
        <h1 className="mt-1 text-2xl font-semibold">{data.title}</h1>
        <p className="mt-1 text-sm text-white/80">{data.subtitle}</p>
      </header>

      <div className="mt-6 space-y-5">
        {data.highlights ? (
          <Section title="Highlights"><Bullets items={data.highlights} /></Section>
        ) : null}

        {data.programs ? (
          <Section title="Programmes & fees">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">Programme</th>
                    <th className="py-2 pr-3 font-semibold">Duration</th>
                    <th className="py-2 pr-3 font-semibold">Eligibility</th>
                    <th className="py-2 font-semibold">Fee / year</th>
                  </tr>
                </thead>
                <tbody>
                  {data.programs.map((p, i) => (
                    <tr key={`${p.name}-${i}`} className="border-b border-border last:border-0">
                      <td className="py-2 pr-3 font-medium">{p.name}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{p.duration}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{p.eligibility}</td>
                      <td className="py-2">₹{p.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        ) : null}

        {data.dates ? (
          <Section title="Key dates">
            <dl className="grid gap-3 sm:grid-cols-3">
              {data.dates.map((d) => (
                <div key={d.label} className="rounded-lg border border-border p-3">
                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{d.label}</dt>
                  <dd className="mt-1 text-sm font-medium">{d.value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        {data.stats ? (
          <Section title="Placement summary">
            <div className="grid gap-3 sm:grid-cols-4">
              {data.stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border p-3">
                  <div className="text-lg font-semibold">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {data.branches ? (
          <Section title="Branch-wise placements">
            <ul className="divide-y divide-border">
              {data.branches.map((b) => (
                <li key={b.name} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium">{b.name}</span>
                  <span className="text-muted-foreground">{b.placed} placed · {b.avg} avg</span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {data.recruiters ? (
          <Section title="Top recruiters">
            <div className="flex flex-wrap gap-2">
              {[...new Set(data.recruiters)].map((r) => (
                <span key={r} className="rounded-full border border-input px-3 py-1 text-xs font-medium">{r}</span>
              ))}
            </div>
          </Section>
        ) : null}

        {data.about ? <Section title="About the university"><p className="text-sm leading-relaxed">{data.about}</p></Section> : null}

        {data.facts ? (
          <Section title="Quick facts">
            <dl className="grid gap-3 sm:grid-cols-2">
              {data.facts.map((f) => (
                <div key={f.label} className="rounded-lg border border-border p-3">
                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{f.label}</dt>
                  <dd className="mt-1 text-sm font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        {data.facilities ? <Section title="Campus facilities"><Bullets items={data.facilities} /></Section> : null}

        {data.admission ? (
          <Section title="Admission process">
            <ol className="space-y-2">
              {data.admission.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Section>
        ) : null}
      </div>

      <nav className="mt-8 flex flex-wrap gap-2 border-t border-border pt-5">
        {RESOURCES.filter((r) => r.id !== res.id).map((r) => (
          <Link
            key={r.id}
            to="/resources/$slug"
            params={{ slug: r.slug }}
            search={{ client: clientId }}
            className="rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            View {r.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
