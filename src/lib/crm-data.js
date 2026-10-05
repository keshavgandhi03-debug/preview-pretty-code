 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }// Mock data + shared types for the Counselling CRM prototype.

 





























export const LEVEL1_STATUSES = [
  "Fresh Lead", "Attempted", "Connected", "Interested", "Warm", "Cold",
  "Follow-up", "Call Back Evening", "Call Back Tomorrow",
  "Not Connected", "Wrong Number", "Switched Off", "Disconnected", "Busy",
  "Invalid Number", "Not Interested", "Not a Student", "Admission Done Elsewhere",
];

export const LEVEL2_STATUSES = [
  "Counselling Started", "Brochure Shared", "Documents Pending",
  "Application Started", "Application Submitted", "Payment Pending",
  "Application Converted", "Admission Confirmed", "Lost Lead",
];

 

export const statusTone = (s) => {
  const map = {
    "Warm": "warm",
    "Cold": "cold",
    "Interested": "interested",
    "Connected": "interested",
    "Follow-up": "followup",
    "Call Back Evening": "followup",
    "Call Back Tomorrow": "followup",
    "Fresh Lead": "neutral",
    "Attempted": "neutral",
    "Not Connected": "neutral",
    "Wrong Number": "danger",
    "Switched Off": "neutral",
    "Disconnected": "neutral",
    "Busy": "neutral",
    "Invalid Number": "danger",
    "Not Interested": "danger",
    "Not a Student": "danger",
    "Admission Done Elsewhere": "danger",
    "Counselling Started": "interested",
    "Brochure Shared": "interested",
    "Documents Pending": "warm",
    "Application Started": "interested",
    "Application Submitted": "success",
    "Payment Pending": "warm",
    "Application Converted": "success",
    "Admission Confirmed": "success",
    "Lost Lead": "danger",
  };
  return _nullishCoalesce(map[s], () => ( "neutral"));
};

export const toneStyles = {
  hot: "bg-[color:var(--hot)]/10 text-[color:var(--hot)] ring-1 ring-inset ring-[color:var(--hot)]/20",
  warm: "bg-[color:var(--warm)]/10 text-[color:var(--warm)] ring-1 ring-inset ring-[color:var(--warm)]/20",
  cold: "bg-[color:var(--cold)]/10 text-[color:var(--cold)] ring-1 ring-inset ring-[color:var(--cold)]/20",
  interested: "bg-[color:var(--interested)]/10 text-[color:var(--interested)] ring-1 ring-inset ring-[color:var(--interested)]/20",
  followup: "bg-[color:var(--followup)]/10 text-[color:var(--followup)] ring-1 ring-inset ring-[color:var(--followup)]/20",
  neutral: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  success: "bg-[color:var(--success)]/10 text-[color:var(--success)] ring-1 ring-inset ring-[color:var(--success)]/20",
  danger: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20",
};













export const CLIENTS = [
  { id: "amity", name: "Amity University", short: "AU", activeLeads: 1240, pendingLeads: 328, followupDue: 42, applications: 186, counsellors: 8, color: "from-blue-500 to-indigo-600" },
  { id: "mitwpu", name: "MIT-WPU", short: "MW", activeLeads: 890, pendingLeads: 210, followupDue: 31, applications: 142, counsellors: 6, color: "from-emerald-500 to-teal-600" },
  { id: "chandigarh", name: "Chandigarh University", short: "CU", activeLeads: 1560, pendingLeads: 402, followupDue: 58, applications: 221, counsellors: 10, color: "from-orange-500 to-red-500" },
  { id: "lpu", name: "LPU", short: "LP", activeLeads: 2010, pendingLeads: 512, followupDue: 74, applications: 294, counsellors: 12, color: "from-violet-500 to-purple-600" },
  { id: "sharda", name: "Sharda University", short: "SU", activeLeads: 720, pendingLeads: 180, followupDue: 22, applications: 96, counsellors: 5, color: "from-rose-500 to-pink-600" },
  { id: "graphicera", name: "Graphic Era", short: "GE", activeLeads: 540, pendingLeads: 128, followupDue: 18, applications: 68, counsellors: 4, color: "from-cyan-500 to-blue-500" },
  { id: "manipal", name: "Manipal", short: "MU", activeLeads: 980, pendingLeads: 234, followupDue: 35, applications: 158, counsellors: 7, color: "from-amber-500 to-orange-600" },
  { id: "parul", name: "Parul University", short: "PU", activeLeads: 1420, pendingLeads: 356, followupDue: 48, applications: 204, counsellors: 9, color: "from-sky-500 to-blue-600" },
];


























const FIRST = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Krishna", "Ishaan", "Rohan", "Kabir", "Ananya", "Diya", "Aadhya", "Kiara", "Myra", "Pari", "Anika", "Navya", "Riya", "Aisha", "Neha", "Priya", "Karthik", "Rahul", "Siddharth"];
const LAST = ["Sharma", "Verma", "Iyer", "Patel", "Reddy", "Kumar", "Singh", "Nair", "Menon", "Gupta", "Joshi", "Malhotra", "Kapoor", "Chopra", "Bansal", "Shah", "Rao", "Das", "Bose", "Khan"];
const CITIES = [
  ["Mumbai", "Maharashtra"], ["Pune", "Maharashtra"], ["Delhi", "Delhi"], ["Gurgaon", "Haryana"],
  ["Bengaluru", "Karnataka"], ["Chennai", "Tamil Nadu"], ["Hyderabad", "Telangana"], ["Kolkata", "West Bengal"],
  ["Ahmedabad", "Gujarat"], ["Jaipur", "Rajasthan"], ["Lucknow", "Uttar Pradesh"], ["Chandigarh", "Punjab"],
  ["Kochi", "Kerala"], ["Bhopal", "Madhya Pradesh"], ["Indore", "Madhya Pradesh"], ["Nagpur", "Maharashtra"],
];
const COURSES = ["B.Tech CSE", "B.Tech AI/ML", "BBA", "MBA", "B.Sc Data Science", "B.Com", "BA Economics", "B.Des", "M.Tech", "MCA", "B.Arch", "BA LLB"];
const MASTERS = ["Engineering", "Management", "Design", "Law", "Sciences", "Commerce"];
const SOURCES = ["Google Ads", "Facebook", "Instagram", "Organic", "Referral", "Shiksha", "CollegeDekho", "Website"];
export const COUNSELLORS = ["Keshav Gandhi", "Rahul Kapoor", "Anjali Rao", "Vikram Shah", "Neha Gupta", "Kunal Verma", "Sneha Iyer", "Arjun Nair", "Raghav Menon", "Priya Bansal"];
const CAMPAIGNS = ["Summer Intake 2026", "Winter Batch", "Early Bird", "Scholarship Drive", "Repeat Nurture"];

export const PROGRAMS = ["B.Tech", "MBA", "BBA", "BCA", "B.Com", "B.Des", "B.Sc", "MCA"];

// Feedback / call-outcome taxonomy (parent status -> substatuses).
export const FEEDBACK_STATUSES = [
  { id: "interested", label: "Interested", tone: "green" },
  { id: "not-interested", label: "Not Interested", tone: "rose" },
  { id: "not-connected", label: "Not Connected", tone: "orange" },
  { id: "follow-up", label: "Follow Up", tone: "purple" },
  { id: "invalid", label: "Invalid", tone: "red" },
  { id: "not-a-student", label: "Not a Student", tone: "blue" },
];

export const SUBSTATUS_MAP = {
  interested: [
    "Interested in Same College", "Interested in Other College", "Confused",
    "Scholarship Required", "Details of University", "Will Visit Campus", "Application Initiated",
  ],
  "not-connected": ["Ringing", "Busy", "Voicemail", "Switched Off", "Call Cut", "Not Reachable"],
  invalid: ["Dead"],
  "follow-up": ["After 30 Minutes", "Evening 6 PM", "Tomorrow Morning / Evening", "After 2 Days", "Next Week", "Custom"],
  "not-interested": ["Already Taken Admission", "Fee Too High", "Distance Issue", "Course Not Available", "Not Eligible"],
  "not-a-student": ["Dead"],
};

export const feedbackById = (id) => FEEDBACK_STATUSES.find((f) => f.id === id);

const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const rand = seededRandom(42);

const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const hoursFromNow = (h) => {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d.toISOString();
};

const ALL_STATUSES = [...LEVEL1_STATUSES, ...LEVEL2_STATUSES];

const generateLeads = () => {
  const leads = [];
  let n = 1;
  for (const client of CLIENTS) {
    const count = 24;
    for (let i = 0; i < count; i++) {
      const [city, state] = pick(CITIES);
      const first = pick(FIRST);
      const last = pick(LAST);
      const status = pick(ALL_STATUSES);
      const priorityRoll = rand();
      const priority = priorityRoll > 0.7 ? "High" : priorityRoll > 0.35 ? "Medium" : "Low";
      leads.push({
        id: `L-${String(n).padStart(5, "0")}`,
        cwid: `CW${String(100000 + n).padStart(6, "0")}`,
        name: `${first} ${last}`,
        mobile: `+91 ${9000000000 + Math.floor(rand() * 999999999)}`.slice(0, 17),
        altMobile: rand() > 0.6 ? `+91 ${8000000000 + Math.floor(rand() * 999999999)}`.slice(0, 17) : undefined,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(rand() * 99)}@gmail.com`,
        city, state,
        masterCourse: pick(MASTERS),
        interestedCourse: pick(COURSES),
        source: pick(SOURCES),
        score: Math.floor(30 + rand() * 70),
        lastContact: daysAgo(Math.floor(rand() * 14)),
        status,
        assignedDate: daysAgo(Math.floor(rand() * 30)),
        priority,
        nextFollowup: rand() > 0.5 ? hoursFromNow(Math.floor(rand() * 48) - 6) : undefined,
        counsellor: pick(COUNSELLORS),
        clientId: client.id,
        campaign: pick(CAMPAIGNS),
        parentContact: rand() > 0.5 ? `+91 ${7000000000 + Math.floor(rand() * 999999999)}`.slice(0, 17) : undefined,
        qualification: pick(["12th CBSE", "12th ICSE", "12th State Board", "Diploma", "Graduate"]),
        program: pick(PROGRAMS),
        ...(() => {
          const fb = pick(FEEDBACK_STATUSES);
          const subs = SUBSTATUS_MAP[fb.id];
          return { feedback: fb.id, substatus: subs[Math.floor(rand() * subs.length)] };
        })(),
      });
      n++;
    }
  }
  return leads;
};

export const LEADS = generateLeads();

export const leadsByClient = (clientId) => LEADS.filter((l) => l.clientId === clientId);

export const maskMobile = (m) => {
  const digits = m.replace(/\D/g, "");
  if (digits.length < 6) return m;
  const cc = m.startsWith("+") ? "+91 " : "";
  const first = digits.slice(-10, -8);
  const last = digits.slice(-3);
  return `${cc}${first}XXXXX${last}`;
};

export const maskEmail = (e) => {
  const [user, domain] = e.split("@");
  if (!user || !domain) return e;
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, user.length - 2))}@${domain}`;
};






















export const campaignKpis = (clientId) => {
  const leads = leadsByClient(clientId);
  const now = Date.now();
  const byStatus = (s) => {
    const arr = Array.isArray(s) ? s : [s];
    return leads.filter((l) => arr.includes(l.status)).length;
  };
  const seed = clientId.length * 7 + leads.length;
  const target = 80 + (seed % 40);
  const made = Math.floor(target * (0.35 + ((seed % 50) / 100)));
  return {
    totalAssigned: leads.length,
    freshLeads: byStatus("Fresh Lead"),
    connectedLeads: byStatus(["Connected", "Interested", "Warm", "Counselling Started"]),
    pendingFollowups: leads.filter((l) => l.nextFollowup && new Date(l.nextFollowup).getTime() < now).length,
    scheduledCalls: leads.filter((l) => l.nextFollowup && new Date(l.nextFollowup).getTime() >= now).length,
    interested: byStatus("Interested"),
    warm: byStatus("Warm"),
    cold: byStatus("Cold"),
    appsStarted: byStatus(["Application Started", "Documents Pending", "Brochure Shared"]),
    appsConverted: byStatus(["Application Submitted", "Application Converted", "Payment Pending"]),
    admissionsConfirmed: byStatus("Admission Confirmed"),
    whatsappSent: 120 + (seed % 90),
    emailsSent: 40 + (seed % 45),
    avgCallDuration: `${2 + (seed % 4)}m ${10 + (seed % 45)}s`,
    callingProgressPct: Math.round((made / target) * 100),
    callsMadeToday: made,
    callsTargetToday: target,
  };
};









export const sampleTimeline = (leadId) => [
  { id: "t1", time: "Just now", type: "note", title: "Lead opened", detail: `Viewed ${leadId}` },
  { id: "t2", time: "10:42 AM", type: "email", title: "Email sent", detail: "Application Form + Brochure" },
  { id: "t3", time: "10:40 AM", type: "whatsapp", title: "WhatsApp sent", detail: "Fee Structure template" },
  { id: "t4", time: "10:32 AM", type: "call", title: "Call connected", detail: "Duration 4m 12s" },
  { id: "t5", time: "Yesterday 5:20 PM", type: "status", title: "Status → Interested", detail: "Set by Keshav Gandhi" },
  { id: "t6", time: "2 days ago", type: "followup", title: "Follow-up scheduled", detail: "Tomorrow 11:00 AM" },
];

// Dashboard mocks
export const kpis = {
  totalAssigned: 320,
  freshLeads: 62,
  todaysCalls: 148,
  connectedCalls: 92,
  notConnected: 56,
  interested: 41,
  warm: 27,
  followupDueToday: 18,
  scheduledCalls: 34,
  appsStarted: 22,
  appsSubmitted: 15,
  admissionsConfirmed: 9,
  whatsappToday: 210,
  emailsToday: 74,
  avgCallDuration: "3m 42s",
};

export const callsByHour = Array.from({ length: 12 }, (_, i) => ({
  hour: `${9 + i}:00`,
  calls: Math.floor(4 + Math.random() * 22),
  connected: Math.floor(2 + Math.random() * 14),
}));

export const statusDistribution = [
  { name: "Warm", value: 27, tone: "warm" },
  { name: "Interested", value: 41, tone: "interested" },
  { name: "Follow-up", value: 32, tone: "followup" },
  { name: "Cold", value: 18, tone: "cold" },
  { name: "Not Connected", value: 56, tone: "neutral" },
];

export const conversionFunnel = [
  { stage: "Fresh", value: 320 },
  { stage: "Contacted", value: 214 },
  { stage: "Interested", value: 118 },
  { stage: "Counselling", value: 62 },
  { stage: "App Started", value: 34 },
  { stage: "Submitted", value: 21 },
  { stage: "Admission", value: 12 },
];

export const dailyCalling = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  calls: Math.floor(60 + Math.random() * 90),
  connected: Math.floor(30 + Math.random() * 60),
}));

export const counsellorPerformance = COUNSELLORS.map((c, i) => ({
  name: c,
  calls: 60 + Math.floor(Math.random() * 100),
  connected: 30 + Math.floor(Math.random() * 60),
  interested: 8 + Math.floor(Math.random() * 20),
  applications: 2 + Math.floor(Math.random() * 12),
  admissions: Math.floor(Math.random() * 6),
  avgDur: `${2 + (i % 3)}m ${10 + i * 6}s`,
  followupPct: 65 + Math.floor(Math.random() * 30),
  conversion: 6 + Math.floor(Math.random() * 14),
  status: (["Online", "On Call", "Idle", "Online", "On Call"] )[i % 5],
}));
