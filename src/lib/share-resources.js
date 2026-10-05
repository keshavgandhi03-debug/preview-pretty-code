// Shareable resources (brochure, placement report, university details).
// Each resource is a real page under /resources/<slug>?client=<clientId>,
// so WhatsApp / email shares carry working links instead of empty placeholders.
import { CLIENTS } from "@/lib/crm-data";

export const RESOURCES = [
  {
    id: "brochure",
    slug: "brochure",
    label: "Brochure",
    blurb: "Programs, fees, scholarships and key dates",
  },
  {
    id: "placement-report",
    slug: "placement-report",
    label: "Placement report",
    blurb: "Placement %, packages and top recruiters",
  },
  {
    id: "university-details",
    slug: "university-details",
    label: "University details",
    blurb: "Campus, rankings, hostel and admission process",
  },
];

export const resourceById = (id) => RESOURCES.find((r) => r.id === id || r.slug === id);

export const clientById = (id) => CLIENTS.find((c) => c.id === id);

export const DEFAULT_CLIENT_ID = "chandigarh";

const hash = (s) => Math.abs(String(s).split("").reduce((a, c) => a + c.charCodeAt(0) * 17, 7));
const pickN = (arr, n, seed) => {
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[(seed + i * 3) % arr.length]);
  return out;
};

const RECRUITERS = [
  "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Amazon", "Microsoft",
  "Deloitte", "Capgemini", "HCLTech", "Bosch", "Byju's", "Tech Mahindra", "IBM",
  "ZS Associates", "Jaro Education", "Paytm", "Flipkart",
];

const PROGRAM_ROWS = [
  { name: "B.Tech — Computer Science", duration: "4 years", eligibility: "10+2 with PCM, 60%+", fee: "1,60,000" },
  { name: "B.Tech — AI & Machine Learning", duration: "4 years", eligibility: "10+2 with PCM, 60%+", fee: "1,80,000" },
  { name: "BBA", duration: "3 years", eligibility: "10+2 any stream, 50%+", fee: "1,10,000" },
  { name: "MBA", duration: "2 years", eligibility: "Graduation 50%+ / CAT-MAT", fee: "2,40,000" },
  { name: "BCA", duration: "3 years", eligibility: "10+2 with Maths / CS", fee: "95,000" },
  { name: "B.Des", duration: "4 years", eligibility: "10+2 any stream + portfolio", fee: "1,75,000" },
  { name: "B.Sc — Data Science", duration: "3 years", eligibility: "10+2 with Maths", fee: "1,20,000" },
  { name: "MCA", duration: "2 years", eligibility: "BCA / B.Sc with Maths", fee: "1,35,000" },
];

/** Deterministic sample content per university. Replace with the real prospectus data when available. */
export function resourceContent(resourceId, clientId) {
  const client = clientById(clientId) || CLIENTS[0];
  const seed = hash(client.id);
  const placementPct = 82 + (seed % 15);
  const avgPackage = (4.2 + ((seed % 22) / 10)).toFixed(1);
  const highestPackage = (28 + (seed % 20)).toFixed(0);

  const base = { client, resourceId };

  if (resourceId === "brochure") {
    return {
      ...base,
      title: `${client.name} — Programme Brochure`,
      subtitle: "Admissions 2026–27 · Scholarships up to 100% on merit",
      highlights: [
        "NAAC A+ accredited campus with industry-aligned curriculum",
        `${placementPct}% placement across core and IT roles`,
        "Merit and sports scholarships reviewed at application stage",
        "Hostel, transport and education-loan assistance available",
      ],
      programs: pickN(PROGRAM_ROWS, 6, seed),
      dates: [
        { label: "Applications open", value: "Now — rolling admissions" },
        { label: "Scholarship test", value: "Every Saturday, online" },
        { label: "Session begins", value: "July 2026" },
      ],
    };
  }

  if (resourceId === "placement-report") {
    return {
      ...base,
      title: `${client.name} — Placement Report 2025`,
      subtitle: "Verified campus placement summary for the 2025 graduating batch",
      stats: [
        { label: "Students placed", value: `${placementPct}%` },
        { label: "Average package", value: `₹${avgPackage} LPA` },
        { label: "Highest package", value: `₹${highestPackage} LPA` },
        { label: "Recruiters on campus", value: `${180 + (seed % 120)}+` },
      ],
      branches: [
        { name: "Computer Science", placed: `${placementPct}%`, avg: `₹${(Number(avgPackage) + 1.4).toFixed(1)} LPA` },
        { name: "AI & Machine Learning", placed: `${placementPct - 2}%`, avg: `₹${(Number(avgPackage) + 1.1).toFixed(1)} LPA` },
        { name: "Management (BBA / MBA)", placed: `${placementPct - 6}%`, avg: `₹${(Number(avgPackage) - 0.4).toFixed(1)} LPA` },
        { name: "Design", placed: `${placementPct - 9}%`, avg: `₹${(Number(avgPackage) - 0.8).toFixed(1)} LPA` },
      ],
      recruiters: pickN(RECRUITERS, 12, seed),
    };
  }

  return {
    ...base,
    title: `${client.name} — University Details`,
    subtitle: "Campus, approvals, facilities and the admission process",
    about: `${client.name} is a multidisciplinary university offering undergraduate and postgraduate programmes across engineering, management, design, law and sciences. The campus runs an industry-linked curriculum with mandatory internships and a dedicated placement cell.`,
    facts: [
      { label: "Approvals", value: "UGC recognised · NAAC A+ · AICTE approved" },
      { label: "Campus", value: `${120 + (seed % 90)} acres, fully residential` },
      { label: "Students", value: `${18 + (seed % 20)},000+ on campus` },
      { label: "Counsellors assigned", value: `${client.counsellors} for this campaign` },
    ],
    facilities: [
      "Separate boys' and girls' hostels with mess and laundry",
      "Central library, innovation labs and incubation centre",
      "Sports complex, gym and medical centre on campus",
      "Campus shuttle from the city and railway station",
    ],
    admission: [
      "Submit the online application form with 10th / 12th marksheets",
      "Appear for the scholarship or entrance test (online, 60 minutes)",
      "Counselling call and programme confirmation",
      "Pay the booking amount to block the seat",
    ],
  };
}

/** Absolute URL for a resource page — safe on the server, exact in the browser. */
export function resourceUrl(resourceId, clientId, origin) {
  const res = resourceById(resourceId);
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/resources/${res?.slug || resourceId}?client=${clientId || DEFAULT_CLIENT_ID}`;
}

const firstName = (name = "") => name.split(" ")[0] || "there";

export function shareMessage(lead, resourceIds, origin) {
  const client = clientById(lead?.clientId);
  const lines = [
    `Hi ${firstName(lead?.name)},`,
    "",
    `Sharing the details you asked for about ${client?.name || "the university"}:`,
    "",
    ...resourceIds.map((id) => `• ${resourceById(id)?.label}: ${resourceUrl(id, lead?.clientId, origin)}`),
    "",
    "Happy to walk you through any of it on a quick call.",
    lead?.counsellor ? `— ${lead.counsellor}, CollegeWollege` : "— CollegeWollege",
  ];
  return lines.join("\n");
}

export function shareSubject(lead, resourceIds) {
  const client = clientById(lead?.clientId);
  const labels = resourceIds.map((id) => resourceById(id)?.label).filter(Boolean);
  return `${client?.name || "University"} — ${labels.join(", ")}`;
}

export function whatsappHref(lead, resourceIds, origin) {
  const digits = String(lead?.mobile || "").replace(/\D/g, "");
  const text = encodeURIComponent(shareMessage(lead, resourceIds, origin));
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function mailtoHref(lead, resourceIds, origin) {
  const to = encodeURIComponent(lead?.email || "");
  const subject = encodeURIComponent(shareSubject(lead, resourceIds));
  const body = encodeURIComponent(shareMessage(lead, resourceIds, origin));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
