// ================================================================
//  TOWNSHIP (STAFF) DATA LAYER — seed data + pure helpers for the
//  staff-facing side. Ported from the design-canvas prototype.
//  Runtime mutations live in TownshipContext; everything here is
//  immutable seed content and lookup tables.
// ================================================================

// ── Categories ───────────────────────────────────────────────────

export type StaffCategory =
  | "Roads"
  | "Parks"
  | "Infrastructure"
  | "Plan/Dev"
  | "Public Safety";

export const STAFF_CATEGORIES: StaffCategory[] = [
  "Roads",
  "Parks",
  "Infrastructure",
  "Plan/Dev",
  "Public Safety",
];

/** Category accent + tint. Data-encoding colors — keep verbatim. */
export const CAT_META: Record<StaffCategory, { color: string; bg: string; heroSeed: string }> = {
  Roads: { color: "#B45309", bg: "#FFEEDD", heroSeed: "roadpaving" },
  Parks: { color: "#567A67", bg: "#E4EDE7", heroSeed: "hilltoppark" },
  Infrastructure: { color: "#2563EB", bg: "#DBEAFE", heroSeed: "stormwater" },
  "Plan/Dev": { color: "#0891B2", bg: "#E0F2F7", heroSeed: "newdevelopment" },
  "Public Safety": { color: "#CD481B", bg: "#F9E3D8", heroSeed: "firestationpresto" },
};

export function catFull(c: StaffCategory | "All"): string {
  const m: Record<string, string> = {
    All: "All",
    Roads: "Roads & Transportation",
    Parks: "Parks & Green Spaces",
    Infrastructure: "Infrastructure & Facilities",
    "Plan/Dev": "Plan / Dev / Sustainability",
    "Public Safety": "Public Safety",
  };
  return m[c] || c;
}

/**
 * Card meta-line label for StaffProject.edited: relative forms get the
 * resident-style "Updated" prefix; pre-labeled forms ("completed Dec
 * 2024") pass through capitalized instead of reading "Updated completed…".
 */
export function updatedLabel(edited: string): string {
  if (!edited || edited === "—") return "Not yet edited";
  if (/^(completed|deleted)/.test(edited)) {
    return edited.charAt(0).toUpperCase() + edited.slice(1);
  }
  return `Updated ${edited}`;
}

/** Flat imagery per category — replaces the prototype's gradients.  */
export function catHeroImage(cat: StaffCategory, id: string): string {
  return `https://picsum.photos/seed/${id || CAT_META[cat].heroSeed}/600/340`;
}

// ── Lifecycle ────────────────────────────────────────────────────

export type Lifecycle =
  | "draft"
  | "pending"
  | "published"
  | "unpublished"
  | "completed"
  | "archived"
  | "trash";

export function lcMeta(lc: Lifecycle): { label: string; c: string; bg: string } {
  const m: Record<Lifecycle, { label: string; c: string; bg: string }> = {
    draft: { label: "Draft", c: "#475569", bg: "#F1F5F9" },
    pending: { label: "Pending Review", c: "#B45309", bg: "#FFEEDD" },
    published: { label: "Published", c: "#567A67", bg: "#E4EDE7" },
    unpublished: { label: "Unpublished", c: "#64748B", bg: "#EEF2F6" },
    completed: { label: "Completed", c: "#2563EB", bg: "#DBEAFE" },
    archived: { label: "Archived", c: "#64748B", bg: "#EEF2F6" },
    trash: { label: "In Trash", c: "#CD481B", bg: "#F9E3D8" },
  };
  return m[lc] || m.published;
}

export function statusStyleColors(status: string): [string, string] {
  const m: Record<string, [string, string]> = {
    Active: ["#567A67", "#E4EDE7"],
    Published: ["#567A67", "#E4EDE7"],
    Draft: ["#475569", "#F1F5F9"],
    Planning: ["#B45309", "#FFEEDD"],
    "In Review": ["#B45309", "#FFEEDD"],
    Completed: ["#2563EB", "#DBEAFE"],
  };
  return m[status] || m["Active"];
}

// ── Sentiment ────────────────────────────────────────────────────

export type SentimentCode = "green" | "amber" | "red";
export type SentimentWord = "supportive" | "mixed" | "concerns";

/** [accent, tint, label] for a comment sentiment code. */
export function sentColor(s: SentimentCode): [string, string, string] {
  return s === "green"
    ? ["#567A67", "#E4EDE7", "Supportive"]
    : s === "red"
      ? ["#CD481B", "#F9E3D8", "Concerns"]
      : ["#B45309", "#FFEEDD", "Mixed"];
}

export const SENT_WORD_COLOR: Record<SentimentWord, string> = {
  supportive: "#567A67",
  mixed: "#B45309",
  concerns: "#CD481B",
};

// ── Types ────────────────────────────────────────────────────────

export interface StaffReply {
  /** "name" = personal attribution, "dept" = official Township Staff */
  attr?: "name" | "dept";
  name?: string;
  dept?: string;
  text: string;
  time: string;
  edited?: boolean;
}

export interface StaffComment {
  id: string;
  name: string;
  verified: boolean;
  anon: boolean;
  text: string;
  sent: SentimentCode;
  time: string;
  replies: StaffReply[];
  /** Moderation flag reason — only on hidden-queue comments */
  flag: string | null;
}

export interface StaffStage {
  n: number;
  title: string;
  dates: string;
  desc: string;
  bullets: string[];
  state: "Published" | "Draft";
}

export interface StaffPoll {
  support: number;
  oppose: number;
  neutral: number;
  verified: { s: number; o: number; n: number };
  trend: number[];
}

export interface StaffTheme {
  name: string;
  count: number;
  sent: SentimentWord;
  quote: string;
}

export interface Spotlight {
  reason: string;
  msg: string;
  end: string;
  priority: "Standard" | "High";
  by: string;
  cta: string;
}

export type ModMode = "post" | "selective" | "full";

export interface LogEntry {
  text: string;
  time: string;
  by: string;
}

export interface StaffProject {
  id: string;
  title: string;
  cat: StaffCategory;
  deptShort: string;
  dept: string;
  status: string;
  cost: string;
  funding: string;
  edited: string;
  followers: number;
  /** 1-based current stage number */
  current: number;
  desc: string;
  sponsor: string;
  duration: string;
  stages: StaffStage[];
  poll: StaffPoll;
  sentiment: { supportive: number; mixed: number; concerns: number };
  themes: StaffTheme[];
  privateMsgs: StaffComment[];
  public: StaffComment[];
  hidden: StaffComment[];
  rejected: StaffComment[];
  deletedC: StaffComment[];
  log: LogEntry[];
  lc: Lifecycle;
  modMode: ModMode;
  spotlight: Spotlight | null;
  // lifecycle extras
  prevLc?: Lifecycle;
  trashedDate?: string;
  completedDate?: string;
  archivedYear?: string;
  outcome?: string;
  // pending-review extras
  submittedBy?: string;
  submittedDept?: string;
  submittedDate?: string;
  reviewer?: string;
  urgency?: string;
  srNote?: string;
}

// ── Staff identity / departments ─────────────────────────────────

export const STAFF_NAME = "Amy Medway";
export const STAFF_EMAIL = "amy.medway@colliertwp.gov";
export const DEFAULT_DEPT = "Manager's Office";

export const STAFF_DEPARTMENTS = [
  "Manager’s Office",
  "Township Secretary",
  "Public Works",
  "Sewer Department",
  "Building and Codes",
  "Police Department",
  "Planning, Zoning, and Land Development",
  "Garbage and Recycling",
  "Parks and Recreation",
  "Finance Department",
];

// ── Seed data ────────────────────────────────────────────────────

const C = (
  id: string,
  name: string,
  verified: boolean,
  anon: boolean,
  text: string,
  sent: SentimentCode,
  time: string,
  replies: StaffReply[] = [],
  flag: string | null = null
): StaffComment => ({ id, name, verified, anon, text, sent, time, replies, flag });

const stg = (
  n: number,
  title: string,
  d1: string,
  d2: string,
  desc: string,
  bullets: string[],
  state: "Published" | "Draft" = "Published"
): StaffStage => ({ n, title, dates: `${d1} – ${d2}`, desc, bullets, state });

const base = {
  rejected: [] as StaffComment[],
  deletedC: [] as StaffComment[],
  log: [] as LogEntry[],
  lc: "published" as Lifecycle,
  modMode: "post" as ModMode,
  spotlight: null as Spotlight | null,
};

function mini(
  id: string,
  title: string,
  cat: StaffCategory,
  lc: Lifecycle,
  extra: Partial<StaffProject> = {}
): StaffProject {
  return {
    id,
    title,
    cat,
    deptShort: "Public Works",
    dept: "Public Works",
    status: lc === "completed" || lc === "archived" ? "Completed" : "Draft",
    cost: "—",
    funding: "Township Capital",
    edited: "—",
    followers: 0,
    current: 1,
    desc: "",
    sponsor: "Public Works Dept",
    duration: "",
    stages: [
      { n: 1, title: "Complete", dates: "—", desc: "", bullets: [], state: "Published" },
    ],
    poll: {
      support: 0,
      oppose: 0,
      neutral: 0,
      verified: { s: 0, o: 0, n: 0 },
      trend: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    sentiment: { supportive: 0, mixed: 0, concerns: 0 },
    themes: [],
    privateMsgs: [],
    public: [],
    hidden: [],
    ...base,
    lc,
    ...extra,
  };
}

const pubStage = (t: string, d?: string): StaffStage[] => [
  {
    n: 1,
    title: t,
    dates: d || "2026",
    desc: "Work is currently underway on this project.",
    bullets: ["On schedule"],
    state: "Published",
  },
];

export function seedProjects(): StaffProject[] {
  const projects: StaffProject[] = [
    {
      id: "road-paving",
      title: "Road Paving 2026",
      cat: "Roads",
      deptShort: "Public Works",
      dept: "Public Works",
      status: "Active",
      cost: "$645,203",
      funding: "PennDOT Liquid Fuels + Capital Reserve",
      edited: "2 days ago",
      followers: 214,
      current: 6,
      desc: "Annual resurfacing of 8.4 miles of township roads across five neighborhoods, including base repair and line painting.",
      sponsor: "Public Works Dept",
      duration: "Mar 2026 – Nov 2026",
      stages: [
        stg(1, "Planning & Survey", "Mar", "Apr", "Roads assessed and prioritized by pavement condition index.", ["Condition survey of 42 segments", "Priority list finalized"]),
        stg(2, "Budget Approval", "Apr", "May", "Board approves the paving budget and scope.", ["$645,203 approved", "Liquid Fuels allocation confirmed"]),
        stg(3, "Bid & Award", "May", "Jun", "RFP issued and contractor selected.", ["3 bids received", "Awarded to Youngblood Paving"]),
        stg(4, "Utility Coordination", "Jun", "Jun", "Coordinate with sewer and gas before milling.", ["Sewer clearances obtained"]),
        stg(5, "Milling", "Jul", "Aug", "Existing surface milled on scheduled roads.", ["Neighborhoods A–C complete"]),
        stg(6, "Paving — Phase 1", "Aug", "Sep", "Active resurfacing underway in Nevillewood.", ["Hilltop Rd repaved", "Paving crews on Orchard Dr"]),
        stg(7, "Paving — Phase 2", "Sep", "Oct", "Remaining neighborhoods resurfaced.", ["Scheduled: Presto, Cook School Rd"]),
        stg(8, "Line Painting & Restoration", "Oct", "Nov", "Line striping and shoulder restoration.", ["Pending Phase 2"]),
      ],
      poll: { support: 118, oppose: 34, neutral: 22, verified: { s: 92, o: 18, n: 12 }, trend: [40, 62, 95, 120, 138, 152, 168, 174] },
      sentiment: { supportive: 58, mixed: 27, concerns: 15 },
      themes: [
        { name: "Traffic detour confusion", count: 14, sent: "concerns", quote: "The detour signs on Orchard sent me in a circle for 20 minutes." },
        { name: "Appreciation for updates", count: 11, sent: "supportive", quote: "Love that I can see exactly which street is next." },
        { name: "Driveway access timing", count: 8, sent: "mixed", quote: "Can we get more notice before our driveway is blocked?" },
      ],
      privateMsgs: [
        C("pm1", "Diane Kessler", true, false, "Our cul-de-sac on Fawn Court was skipped last cycle — is it in this year’s scope? It’s badly cracked.", "amber", "2h"),
        C("pm2", "Marcus Webb", true, false, "Thank you for the clear schedule. Makes planning my commute so much easier.", "green", "1d", [
          { dept: "Public Works", text: "Thanks Marcus — glad it helps. Phase 1 wraps next week.", time: "22h" },
        ]),
      ],
      public: [
        C("c1", "NevillewoodMom", true, false, "Will Hilltop Rd be done before school starts? Buses use it every morning.", "amber", "3h"),
        C("c2", "Anonymous", false, true, "Finally! This road has needed paving for years. Thank you Public Works.", "green", "5h", [
          { dept: "Public Works", text: "Appreciate it — Hilltop is in Phase 1, wrapping this week.", time: "4h" },
        ]),
        C("c3", "R. Callahan", true, false, "Concerned about the detour routing near the elementary school during dropoff.", "red", "8h"),
        C("c4", "GregT", false, false, "How long will my street be closed for milling?", "amber", "1d"),
      ],
      hidden: [
        C("h1", "user8842", false, false, "this is a total waste of my tax dollars you people are clueless", "red", "6h", [], "Contains language flagged as inappropriate"),
        C("h2", "spammybot", false, false, "CHEAP DRIVEWAY SEALING visit my site now!!! link in bio", "red", "9h", [], "Possible spam"),
        C("h3", "JoeK", false, false, "anyone know when the fireworks are this year", "amber", "12h", [], "Off-topic"),
      ],
      ...base,
      modMode: "selective",
      spotlight: {
        reason: "Public feedback needed",
        msg: "Public comment period is open through Aug 1. Share your input on this year’s paving schedule.",
        end: "Aug 1, 2026",
        priority: "High",
        by: "Amy Medway",
        cta: "Share Your Input",
      },
    },

    {
      id: "hilltop",
      title: "Hilltop Park Expansion",
      cat: "Parks",
      deptShort: "Parks & Rec",
      dept: "Parks and Recreation",
      status: "Active",
      cost: "$1.2M",
      funding: "DCNR Grant + Township Match",
      edited: "4 hours ago",
      followers: 389,
      current: 3,
      desc: "Expansion of Hilltop Park with a new playground, multi-use trail, and expanded parking to meet growing demand.",
      sponsor: "Parks & Recreation",
      duration: "Jan 2026 – Dec 2026",
      stages: [
        stg(1, "Community Input", "Jan", "Feb", "Resident surveys and public meetings shape the design.", ["312 survey responses", "2 public meetings held"]),
        stg(2, "Design & Engineering", "Feb", "Apr", "Landscape architects finalize plans.", ["Concept approved", "Trail alignment set"]),
        stg(3, "Grant & Permitting", "Apr", "Jun", "DCNR grant finalized and permits secured.", ["Grant awarded", "Stormwater permit under review"]),
        stg(4, "Construction", "Jun", "Oct", "Playground, trail, and parking built.", ["Not started"]),
        stg(5, "Opening", "Nov", "Dec", "Ribbon cutting and community celebration.", ["Planned"]),
      ],
      poll: { support: 201, oppose: 58, neutral: 30, verified: { s: 160, o: 31, n: 18 }, trend: [60, 110, 160, 200, 240, 255, 270, 289] },
      sentiment: { supportive: 64, mixed: 22, concerns: 14 },
      themes: [
        { name: "Parking capacity concerns", count: 19, sent: "concerns", quote: "More parking will just bring more traffic to our quiet street." },
        { name: "Excitement for playground", count: 23, sent: "supportive", quote: "My kids cannot wait for the new playground!" },
        { name: "Trail lighting & safety", count: 9, sent: "mixed", quote: "Will the trail be lit for evening walks?" },
      ],
      privateMsgs: [
        C("pm1", "Ellen Brooks", true, false, "We live directly behind the proposed parking lot. Concerned about headlights into our bedroom windows at night. Any buffer planned?", "red", "1h"),
        C("pm2", "Tom Alvarez", true, false, "The playground design looks fantastic. Is it ADA accessible throughout?", "green", "6h", [
          { dept: "Parks and Recreation", text: "Yes — the entire play area and trail meet ADA accessibility standards.", time: "5h" },
        ]),
        C("pm3", "Priya N.", false, true, "Can residents volunteer for the trail planting day?", "green", "1d"),
      ],
      public: [
        C("c1", "ParkLover22", true, false, "This is exactly what our community needs. Thank you for listening to the surveys!", "green", "2h"),
        C("c2", "QuietStreetDad", true, false, "The expanded parking is going to ruin the character of Woodland Ave. Please reconsider.", "red", "4h"),
        C("c3", "Anonymous", false, true, "Will the new trail connect to the existing township trail network?", "amber", "7h", [
          { dept: "Parks and Recreation", text: "Yes, Stage 2 includes a connector to the Nevillewood trail spur.", time: "6h" },
        ]),
        C("c4", "M. Sung", true, false, "Please make sure there is enough lighting on the trail for evening safety.", "amber", "10h"),
        C("c5", "GreenThumb", false, false, "Excited for this! Any native plantings in the landscape plan?", "green", "1d"),
      ],
      hidden: [
        C("h1", "angryresident", false, false, "you clowns are wasting a MILLION dollars on a swing set, unbelievable", "red", "5h", [], "Contains language flagged as inappropriate"),
        C("h2", "promo_deals", false, false, "Best mulch prices in the county!! call now for a free quote!!!", "red", "8h", [], "Possible spam"),
      ],
      ...base,
      spotlight: {
        reason: "Upcoming meeting",
        msg: "Public hearing on the parking plan is July 22 at 7pm. Learn more and prepare to speak.",
        end: "Jul 22, 2026",
        priority: "Standard",
        by: "Amy Medway",
        cta: "View Meeting Info",
      },
    },

    {
      id: "nevillewood",
      title: "Nevilewood Traffic Management Plan",
      cat: "Roads",
      deptShort: "Planning",
      dept: "Planning, Zoning, and Land Development",
      status: "Completed",
      cost: "$180,000",
      funding: "Township Capital",
      edited: "1 week ago",
      followers: 97,
      current: 2,
      desc: "Traffic calming and signal study for the Nevillewood corridor to address speeding and cut-through traffic.",
      sponsor: "Planning Dept",
      duration: "Feb 2026 – Aug 2026",
      stages: [
        stg(1, "Traffic Study", "Feb", "Apr", "Speed and volume data collected.", ["Counts complete"]),
        stg(2, "Design Alternatives", "Apr", "May", "Calming options developed.", ["3 options drafted"]),
        stg(3, "Public Review", "Jun", "Jul", "Residents weigh in on options.", ["Meeting scheduled"]),
        stg(4, "Implementation", "Jul", "Aug", "Selected measures installed.", ["Pending"]),
      ],
      poll: { support: 44, oppose: 38, neutral: 19, verified: { s: 31, o: 24, n: 11 }, trend: [20, 35, 52, 68, 79, 88, 95, 101] },
      sentiment: { supportive: 41, mixed: 31, concerns: 28 },
      themes: [
        { name: "Speed bump opposition", count: 12, sent: "concerns", quote: "Speed bumps will damage my car and slow emergency vehicles." },
        { name: "Support for calming", count: 10, sent: "supportive", quote: "Finally something to slow the cut-through traffic." },
      ],
      privateMsgs: [
        C("pm1", "Frank D.", true, false, "Please no speed bumps — my elderly mother’s back can’t take them. Consider a roundabout instead.", "amber", "3h"),
      ],
      public: [
        C("c1", "SafeStreetsNow", true, false, "We need this. Cars fly down our road at 45mph.", "green", "5h"),
        C("c2", "Anonymous", false, true, "Speed bumps are the wrong answer. Enforce the existing limit instead.", "red", "1d"),
      ],
      hidden: [],
      ...base,
      lc: "completed",
      completedDate: "May 2026",
    },

    {
      id: "fire-station",
      title: "Fire Station Upgrades — Presto",
      cat: "Public Safety",
      deptShort: "EMS & Fire",
      dept: "Police Department",
      status: "In Review",
      cost: "$2.4M",
      funding: "Bond Issue (pending)",
      edited: "3 days ago",
      followers: 142,
      current: 1,
      desc: "Renovation and equipment modernization of the Presto fire station, including a new apparatus bay and living quarters.",
      sponsor: "EMS & Fire",
      duration: "2026 – 2027",
      stages: [
        stg(1, "Needs Assessment", "Jan", "Mar", "Facility condition and equipment audit.", ["Audit underway"]),
        stg(2, "Bond Referendum", "Apr", "May", "Voters decide on the bond issue.", ["On ballot"]),
        stg(3, "Design", "Jun", "Sep", "Architectural design.", ["Pending funding"]),
      ],
      poll: { support: 88, oppose: 42, neutral: 26, verified: { s: 70, o: 30, n: 15 }, trend: [30, 50, 72, 90, 108, 124, 140, 156] },
      sentiment: { supportive: 55, mixed: 25, concerns: 20 },
      themes: [
        { name: "Tax impact worry", count: 15, sent: "concerns", quote: "How much will this bond add to my property taxes?" },
      ],
      privateMsgs: [],
      public: [
        C("c1", "Anonymous", false, true, "Our firefighters deserve a modern station. I support the bond.", "green", "1d"),
      ],
      hidden: [],
      ...base,
      lc: "pending",
      submittedBy: "Bob Caun",
      submittedDept: "Public Works",
      submittedDate: "2 days ago",
      reviewer: "Amy Medway",
      urgency: "Standard",
      srNote: "Ready for review ahead of the April bond vote. Cost estimate attached.",
    },

    {
      id: "ms4",
      title: "MS4 Stormwater Projects",
      cat: "Infrastructure",
      deptShort: "Sewer Dept",
      dept: "Sewer Department",
      status: "Active",
      cost: "$390,000",
      funding: "MS4 Compliance Fund",
      edited: "5 days ago",
      followers: 63,
      current: 2,
      desc: "Stormwater management improvements to meet MS4 permit requirements, including basin retrofits and outfall repairs.",
      sponsor: "Sewer Dept",
      duration: "2026",
      stages: [
        stg(1, "Compliance Mapping", "Jan", "Mar", "Outfalls mapped and inspected.", ["Mapping complete"]),
        stg(2, "Basin Retrofits", "Apr", "Aug", "Detention basins upgraded.", ["2 of 5 complete"]),
        stg(3, "Reporting", "Sep", "Dec", "Annual MS4 report filed.", ["Pending"]),
      ],
      poll: { support: 32, oppose: 8, neutral: 14, verified: { s: 26, o: 5, n: 9 }, trend: [10, 18, 26, 33, 40, 46, 50, 54] },
      sentiment: { supportive: 62, mixed: 24, concerns: 14 },
      themes: [],
      privateMsgs: [],
      public: [
        C("c1", "WatershedWatch", true, false, "Great to see the township taking stormwater seriously.", "green", "2d"),
      ],
      hidden: [],
      ...base,
    },

    {
      id: "mixed-use",
      title: "Small-Scale Mixed-Use Development",
      cat: "Plan/Dev",
      deptShort: "Planning",
      dept: "Planning, Zoning, and Land Development",
      status: "In Review",
      cost: "N/A (private)",
      funding: "Private Developer",
      edited: "6 days ago",
      followers: 176,
      current: 3,
      desc: "Zoning review of a proposed mixed-use development with ground-floor retail and 24 residential units near the village center.",
      sponsor: "Planning Dept",
      duration: "Review 2026",
      stages: [
        stg(1, "Application Filed", "Mar", "Mar", "Developer submits application.", ["Received"]),
        stg(2, "Staff Review", "Apr", "May", "Zoning and traffic review.", ["Traffic study requested"]),
        stg(3, "Public Hearing", "Jun", "Jun", "Planning commission hearing.", ["Scheduled Jun 18"]),
        stg(4, "Decision", "Jul", "Jul", "Commission votes.", ["Pending"]),
        stg(5, "Conditions", "Aug", "Sep", "Conditions of approval.", ["Pending"]),
      ],
      poll: { support: 61, oppose: 94, neutral: 28, verified: { s: 44, o: 71, n: 16 }, trend: [30, 55, 80, 102, 120, 140, 160, 183] },
      sentiment: { supportive: 33, mixed: 24, concerns: 43 },
      themes: [
        { name: "Density & traffic", count: 28, sent: "concerns", quote: "24 units will overwhelm our already-congested village intersection." },
        { name: "Support for local retail", count: 14, sent: "supportive", quote: "We need more walkable shops in the village." },
      ],
      privateMsgs: [
        C("pm1", "Harold Simms", true, false, "This density is completely out of character for the village. I urge the commission to deny.", "red", "4h"),
      ],
      public: [
        C("c1", "VillageResident", true, false, "Please protect our small-town character. This is too much.", "red", "6h"),
        C("c2", "WalkableFan", false, false, "I would love a coffee shop within walking distance. Support!", "green", "1d"),
      ],
      hidden: [
        C("h1", "nimby99", false, false, "the developer is obviously paying off the commission, corrupt", "red", "7h", [], "Unsubstantiated claim flagged for review"),
      ],
      ...base,
      lc: "pending",
      modMode: "full",
      submittedBy: "Kris Delano",
      submittedDept: "Planning",
      submittedDate: "6 hours ago",
      reviewer: "George Macino",
      urgency: "High",
      srNote: "Sensitive project — please review the comment moderation setting before publishing.",
    },

    {
      id: "new-dev",
      title: "New Development Review",
      cat: "Plan/Dev",
      deptShort: "Planning",
      dept: "Planning, Zoning, and Land Development",
      status: "Draft",
      cost: "N/A",
      funding: "Private",
      edited: "1 week ago",
      followers: 54,
      current: 2,
      desc: "Rolling review dashboard for new residential subdivision applications currently before the township.",
      sponsor: "Planning Dept",
      duration: "Ongoing",
      stages: [
        stg(1, "Intake", "—", "—", "Applications logged.", ["4 active"]),
        stg(2, "Review", "—", "—", "Under staff review.", ["2 in traffic review"]),
        stg(3, "Hearings", "—", "—", "Scheduled hearings.", ["1 upcoming"]),
        stg(4, "Decisions", "—", "—", "Rolling decisions.", ["—"]),
      ],
      poll: { support: 22, oppose: 19, neutral: 15, verified: { s: 16, o: 12, n: 9 }, trend: [8, 15, 22, 28, 34, 40, 46, 56] },
      sentiment: { supportive: 40, mixed: 33, concerns: 27 },
      themes: [],
      privateMsgs: [],
      public: [
        C("c1", "Anonymous", false, true, "Where can I see the full subdivision plans?", "amber", "2d"),
      ],
      hidden: [],
      ...base,
      lc: "draft",
    },
  ];

  // ── archive / trash / extra published seeds ────────────────────

  projects.push(
    mini("arch-playground", "Playground Resurfacing 2024", "Parks", "completed", {
      deptShort: "Parks & Rec",
      dept: "Parks and Recreation",
      followers: 96,
      edited: "completed Dec 2024",
      completedDate: "Dec 2024",
      archivedYear: "2025",
      desc: "Poured-rubber safety surfacing installed at three neighborhood playgrounds.",
      outcome: "Completed under budget; surfacing installed at Hilltop, Presto, and Fort Pitt playgrounds.",
    }),
    mini("arch-signage", "Wayfinding Signage Refresh", "Infrastructure", "completed", {
      followers: 41,
      edited: "completed Feb 2025",
      completedDate: "Feb 2025",
      archivedYear: "2025",
      desc: "Replacement of aging directional and park signage township-wide.",
      outcome: "42 signs replaced; positive resident feedback on legibility.",
    }),
    mini("trash-saltshed", "Salt Shed Roof Repair", "Infrastructure", "trash", {
      followers: 8,
      edited: "deleted 3 days ago",
      trashedDate: "3 days ago",
      prevLc: "draft",
      desc: "Draft project for a minor roof repair at the Cook School Rd salt shed.",
    })
  );

  const P = (
    id: string,
    title: string,
    cat: StaffCategory,
    dept: string,
    deptShort: string,
    extra: Partial<StaffProject> = {}
  ) =>
    projects.push(
      mini(id, title, cat, "published", {
        dept,
        deptShort,
        status: "Active",
        stages: pubStage("Underway"),
        ...extra,
      })
    );

  P("lobaugh", "Private Road Maintenance — Lobaugh Drive", "Roads", "Public Works", "Public Works", {
    followers: 37,
    edited: "3 days ago",
    desc: "Cost-shared repaving of the private section of Lobaugh Drive under the Township’s private-road maintenance program.",
  });
  P("collier-park", "Collier Park & Ballfield Upgrades", "Parks", "Parks and Recreation", "Parks & Rec", {
    followers: 158,
    edited: "1 day ago",
    desc: "New backstops, regraded infields, and accessible pathways across the Collier Park ballfields.",
  });
  P("police-remodel", "Police Department Facility Remodeling", "Public Safety", "Police Department", "Police Dept", {
    followers: 88,
    edited: "6 days ago",
    desc: "Interior remodel of the police facility, including upgraded evidence storage and an accessible public lobby.",
  });
  P("cc-parking", "Community Center Parking Lot", "Infrastructure", "Public Works", "Public Works", {
    followers: 52,
    edited: "4 days ago",
    desc: "Resurfacing and restriping of the Community Center lot with added ADA spaces and stormwater inlets.",
  });
  P("ordinance", "Township Ordinance Updates", "Plan/Dev", "Planning, Zoning, and Land Development", "Planning", {
    followers: 44,
    edited: "1 week ago",
    desc: "A rolling set of ordinance updates covering signage, short-term rentals, and stormwater standards.",
  });
  P("digital-services", "Website & Digital Services Upgrade", "Plan/Dev", "Manager's Office", "Manager's Office", {
    followers: 71,
    edited: "2 days ago",
    desc: "A township-wide upgrade of the public website and online service requests, led by the Manager’s Office.",
    sentiment: { supportive: 54, mixed: 29, concerns: 17 },
    themes: [
      { name: "Accessibility improvements", count: 8, sent: "supportive", quote: "The new site is so much easier to read on my phone." },
      { name: "Login confusion", count: 5, sent: "concerns", quote: "I could not reset my service-request password — it kept looping." },
    ],
    public: [
      C("ds1", "Rennerdale Resident", true, false, "Paying my sewer bill online finally works without crashing. Thank you!", "green", "3h"),
      C("ds2", "Anonymous", false, true, "The old permit forms are still linked from the news page — confusing.", "amber", "6h"),
      C("ds3", "M. Torres", true, false, "Could not reset my password for service requests. Kept sending me in circles.", "red", "1d"),
      C("ds4", "PrestoParent", true, false, "Love the new mobile layout. Much easier than the old site.", "green", "2d"),
    ],
    privateMsgs: [
      C("dspm1", "Diane Kessler", true, false, "Will the new site keep the meeting-minutes archive going back to 2018?", "amber", "1d"),
    ],
  });

  projects.push(
    mini("fire-rennerdale", "Fire Station Upgrades — Rennerdale", "Public Safety", "completed", {
      dept: "Police Department",
      deptShort: "EMS & Fire",
      followers: 119,
      edited: "completed Mar 2026",
      completedDate: "Mar 2026",
      desc: "Apparatus bay expansion and equipment modernization at the Rennerdale fire station.",
      stages: pubStage("Complete", "2026"),
    })
  );

  return projects;
}

// ── Citations (Reports page) ─────────────────────────────────────

export type AttrLevel = "anon" | "first" | "full";

export interface Citation {
  id: string;
  quote: string;
  attrLevel: AttrLevel;
  name: string;
  nb: string;
  tags: string[];
  project: string;
  projId: string;
  date: string;
  sentW: SentimentWord;
}

export function seedCitations(): Citation[] {
  return [
    { id: "ct1", quote: "My kids cannot wait for the new playground!", attrLevel: "first", name: "Sarah Nguyen", nb: "Nevillewood", tags: ["Parks", "Playground"], project: "Hilltop Park Expansion", projId: "hilltop", date: "Mar 2026", sentW: "supportive" },
    { id: "ct2", quote: "24 units will overwhelm our already-congested village intersection.", attrLevel: "full", name: "Harold Simms", nb: "Presto", tags: ["Density", "Traffic"], project: "Grandview Village Rezoning", projId: "rezoning", date: "Apr 2026", sentW: "concerns" },
    { id: "ct3", quote: "Love that I can see exactly which street is next.", attrLevel: "anon", name: "", nb: "Nevillewood", tags: ["Transparency", "Roads"], project: "Road Paving 2026", projId: "road-paving", date: "May 2026", sentW: "supportive" },
    { id: "ct4", quote: "Our firefighters deserve a modern station. I support the bond.", attrLevel: "anon", name: "", nb: "Rennerdale", tags: ["Public Safety", "Bond"], project: "Fire Station Bond", projId: "fire", date: "Feb 2026", sentW: "supportive" },
    { id: "ct5", quote: "Finally something to slow the cut-through traffic.", attrLevel: "first", name: "Dana Reyes", nb: "Ewingsville", tags: ["Traffic", "Safety"], project: "Neighborhood Traffic Calming", projId: "traffic", date: "Jan 2026", sentW: "supportive" },
  ];
}

export function citAttr(c: Citation): string {
  return c.attrLevel === "anon"
    ? "Anonymous Collier resident"
    : c.attrLevel === "first"
      ? `Resident ${String(c.name || "").split(" ")[0]} (first name only)`
      : `${c.name || "Resident"}, ${c.nb} resident`;
}

// ── Create-flow samples & stage templates ────────────────────────

export interface SampleFields {
  title: string;
  category: StaffCategory;
  desc: string;
  funding: string;
  cost: string;
  sponsor: string;
  duration: string;
}

export interface SampleStage {
  /** [title, start, end, summary, bullets] */
  title: string;
  start: string;
  end: string;
  summary: string;
  bullets: string[];
}

export interface CreateSample {
  key: string;
  label: string;
  /** [filename, docType] pairs */
  files: [string, string][];
  fields: SampleFields;
  stages: SampleStage[];
}

const S = (t: string, s: string, e: string, sum: string, b: string[]): SampleStage => ({
  title: t,
  start: s,
  end: e,
  summary: sum,
  bullets: b,
});

export const CREATE_SAMPLES: CreateSample[] = [
  {
    key: "road",
    label: "Road Paving 2026",
    files: [
      ["Road Paving 2026 — Board Meeting Minutes.pdf", "Meeting minutes"],
      ["Roadbotics Assessment — Ewingsville & Nevillewood 2024.pdf", "Assessment"],
      ["Contractor Bid Summary — March 2026.pdf", "Budget document"],
      ["PW-2026-01 RFP.pdf", "RFP"],
    ],
    fields: { title: "Road Paving 2026", category: "Roads", desc: "Annual resurfacing of 8.4 miles of township roads across five neighborhoods, including base repair and line painting.", funding: "PennDOT Liquid Fuels + Capital Reserve", cost: "$645,203", sponsor: "Public Works Dept", duration: "Mar 2026 – Nov 2026" },
    stages: [
      S("Planning & Survey", "Mar 2026", "Apr 2026", "Public Works scores every Township road with the Roadbotics program and prioritizes segments by condition.", ["Condition survey of 42 segments", "Priority list finalized"]),
      S("Budget Approval", "Apr 2026", "May 2026", "The Board reviews and approves the paving budget and scope.", ["$645,203 approved", "Liquid Fuels allocation confirmed"]),
      S("Bid & Award", "May 2026", "Jun 2026", "An RFP is issued and a contractor is selected through competitive bidding.", ["3 bids received", "Awarded to Youngblood Paving"]),
      S("Utility Coordination", "Jun 2026", "Jun 2026", "Sewer and gas lines are cleared before milling begins.", ["Sewer clearances obtained"]),
      S("Milling", "Jul 2026", "Aug 2026", "The existing surface is milled on scheduled roads.", ["Neighborhoods A–C complete"]),
      S("Paving — Phase 1", "Aug 2026", "Sep 2026", "Active resurfacing gets underway in Nevillewood.", ["Hilltop Rd repaved", "Crews on Orchard Dr"]),
      S("Paving — Phase 2", "Sep 2026", "Oct 2026", "The remaining neighborhoods are resurfaced.", ["Scheduled: Presto, Cook School Rd"]),
      S("Line Painting & Restoration", "Oct 2026", "Nov 2026", "Lane striping and shoulder restoration complete the project.", ["Pending Phase 2"]),
    ],
  },
  {
    key: "hilltop",
    label: "Hilltop Park Expansion",
    files: [
      ["Hilltop Park Expansion Proposal.pdf", "Proposal"],
      ["Board Meeting Minutes — February 12 2025.pdf", "Meeting minutes"],
      ["Parks Department Budget Request.pdf", "Budget document"],
      ["Community Feedback Summary.pdf", "Summary"],
    ],
    fields: { title: "Hilltop Park Expansion", category: "Parks", desc: "Expansion of Hilltop Park with a new playground, multi-use trail, and expanded parking to meet growing demand.", funding: "DCNR Grant + Township Match", cost: "$1.2M", sponsor: "Parks & Recreation", duration: "Jan 2026 – Dec 2026" },
    stages: [
      S("Community Input", "Jan 2026", "Feb 2026", "Resident surveys and public meetings shape the design.", ["312 survey responses", "2 public meetings held"]),
      S("Design & Engineering", "Feb 2026", "Apr 2026", "Landscape architects finalize the plans.", ["Concept approved", "Trail alignment set"]),
      S("Grant & Permitting", "Apr 2026", "Jun 2026", "The DCNR grant is finalized and permits secured.", ["Grant awarded", "Stormwater permit under review"]),
      S("Construction", "Jun 2026", "Oct 2026", "The playground, trail, and parking are built.", ["Not started"]),
      S("Opening", "Nov 2026", "Dec 2026", "A ribbon cutting celebrates the completed park.", ["Planned"]),
    ],
  },
  {
    key: "fire",
    label: "Fire Station Upgrades — Presto",
    files: [
      ["Fire Station Presto — Feasibility Study.pdf", "Study"],
      ["Grant Application — PA Fire Commissioner.pdf", "Grant application"],
      ["Preliminary Cost Estimate.pdf", "Budget document"],
    ],
    fields: { title: "Fire Station Upgrades — Presto", category: "Public Safety", desc: "Renovation and equipment modernization of the Presto fire station, including a new apparatus bay and living quarters.", funding: "Grant + Bond Issue (pending)", cost: "$2.4M", sponsor: "EMS & Fire", duration: "2026 – 2027" },
    stages: [
      S("Needs Assessment", "Jan 2026", "Mar 2026", "The facility condition and equipment are audited.", ["Audit underway"]),
      S("Grant Application", "Mar 2026", "May 2026", "A grant application is filed with the PA Fire Commissioner.", ["Application submitted"]),
      S("Design", "Jun 2026", "Sep 2026", "Architectural design and cost estimates are prepared.", ["Pending funding"]),
      S("Construction", "2027", "2027", "Renovation and equipment modernization are completed.", ["Planned"]),
    ],
  },
  {
    key: "zoning",
    label: "Downtown Mixed-Use Zoning Amendment",
    files: [
      ["Zoning Amendment Draft.pdf", "Ordinance draft"],
      ["Planning Commission Recommendations.pdf", "Recommendations"],
      ["Public Hearing Notice.pdf", "Notice"],
    ],
    fields: { title: "Downtown Mixed-Use Zoning Amendment", category: "Plan/Dev", desc: "A proposed zoning amendment enabling ground-floor retail with residential units above near the village center.", funding: "N/A (regulatory)", cost: "N/A", sponsor: "Planning Dept", duration: "Review 2026" },
    stages: [
      S("Application Filed", "Mar 2026", "Mar 2026", "The amendment application is submitted to the Township.", ["Received"]),
      S("Staff Review", "Apr 2026", "May 2026", "Planning staff review zoning and traffic impacts.", ["Traffic study requested"]),
      S("Public Hearing", "Jun 2026", "Jun 2026", "The Planning Commission holds a public hearing.", ["Scheduled Jun 18"]),
      S("Commission Vote", "Jul 2026", "Jul 2026", "The Commission votes on the amendment.", ["Pending"]),
      S("Conditions & Adoption", "Aug 2026", "Sep 2026", "Conditions of approval are finalized and adopted.", ["Pending"]),
    ],
  },
];

export const PROC_MSGS = [
  "Reading your documents…",
  "Extracting project name and description…",
  "Identifying funding details…",
  "Suggesting timeline stages…",
  "Drafting stage summaries in plain language…",
  "Preparing preview…",
];

export interface TemplateStage {
  title: string;
  start: string;
  end?: string;
  summary: string;
  bullets: string[];
  status?: string;
}

export const STAGE_TEMPLATES: Record<string, TemplateStage[]> = {
  "Road Paving": [
    { title: "Road Condition Assessment", start: "Winter 2025", end: "Spring 2026", summary: "Public Works scores every Township-owned road to prioritize which segments need resurfacing.", bullets: ["Pavement condition survey", "Priority list finalized"], status: "published" },
    { title: "Budget Approval", start: "Spring 2026", summary: "The Board reviews and approves the paving budget and scope.", bullets: ["Funding confirmed"], status: "published" },
    { title: "Bid & Award", start: "Late Spring 2026", summary: "A contractor is selected through competitive bidding.", bullets: ["RFP issued", "Contractor awarded"] },
    { title: "Milling & Paving", start: "Summer 2026", summary: "Existing surfaces are milled and new asphalt is laid.", bullets: ["Neighborhoods scheduled in phases"] },
    { title: "Line Painting & Restoration", start: "Fall 2026", summary: "Lane lines are painted and shoulders are restored.", bullets: ["Final walkthrough"] },
  ],
  "Park Improvement": [
    { title: "Community Input", start: "Winter 2026", summary: "Resident surveys and public meetings shape the design.", bullets: ["Survey open", "Public meeting held"], status: "published" },
    { title: "Design & Engineering", start: "Spring 2026", summary: "Landscape architects finalize the plans.", bullets: ["Concept approved"] },
    { title: "Grant & Permitting", start: "Summer 2026", summary: "Grants are finalized and permits secured.", bullets: ["Grant application submitted"] },
    { title: "Construction", start: "Fall 2026", summary: "Improvements are built on site.", bullets: [] },
    { title: "Grand Opening", start: "Winter 2026", summary: "A ribbon cutting celebrates the completed park.", bullets: [] },
  ],
  "Zoning Amendment": [
    { title: "Application Filed", start: "Received", summary: "The application is submitted to the Township.", bullets: ["Received"], status: "published" },
    { title: "Staff Review", start: "In progress", summary: "Planning staff review zoning and traffic impacts.", bullets: ["Traffic study requested"] },
    { title: "Public Hearing", start: "Upcoming", summary: "The Planning Commission holds a public hearing.", bullets: ["Hearing scheduled"] },
    { title: "Decision", start: "Pending", summary: "The Commission votes on the amendment.", bullets: [] },
  ],
  "Building Renovation": [
    { title: "Needs Assessment", start: "Underway", summary: "The facility condition and equipment are audited.", bullets: ["Audit underway"], status: "published" },
    { title: "Design", start: "Next", summary: "Architectural design and cost estimates are prepared.", bullets: [] },
    { title: "Funding", start: "Planned", summary: "Funding is secured for construction.", bullets: [] },
    { title: "Construction", start: "Planned", summary: "Renovation work is completed.", bullets: [] },
  ],
  "Comprehensive Plan": [
    { title: "Kickoff & Visioning", start: "Winter 2026", summary: "The community defines goals for the plan.", bullets: ["Steering committee formed"], status: "published" },
    { title: "Existing Conditions", start: "Spring 2026", summary: "Current land use and infrastructure are analyzed.", bullets: [] },
    { title: "Draft Plan", start: "Summer 2026", summary: "A draft plan is prepared for review.", bullets: [] },
    { title: "Public Review", start: "Fall 2026", summary: "Residents comment on the draft.", bullets: [] },
    { title: "Adoption", start: "Winter 2026", summary: "The Board adopts the final plan.", bullets: [] },
  ],
};

// ── Misc helpers ─────────────────────────────────────────────────

/** Simulated AI call — resolves to the canned fallback after a delay. */
export function simulateAi(fallback: string, delayMs = 1200): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(fallback), delayMs));
}

const AVATAR_COLORS = ["#60a5fa", "#567A67", "#567A67", "#a78bfa", "#f472b6", "#67e8f9", "#fb923c"];

export function avatarColor(name: string): string {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function initialsOf(name: string): string {
  return String(name || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
