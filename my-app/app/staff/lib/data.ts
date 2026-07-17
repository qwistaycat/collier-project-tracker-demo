// ================================================================
//  Staff portal seed data — ported verbatim from the Collier Connect
//  Staff v2 prototype (projects, comments, polls, citations, report
//  templates, trend series, AI-extraction sample content).
// ================================================================

import type {
  Citation,
  ExtractData,
  ExtractField,
  ExtractPara,
  ExtractStage,
  PollCounts,
  PollRec,
  Project,
  SampleSet,
  StaffCategory,
} from "./types";

function mkPoll(id: string, title: string, edited: string, counts: PollCounts): PollRec[] {
  if (counts.support + counts.oppose + counts.neutral === 0) return [];
  return [
    {
      id: `${id}-p1`,
      question: `Do you support the ${title}?`,
      status: "Active",
      opened: `Opened ${edited}`,
      end: "Aug 1, 2026",
      optSupport: "I support",
      optOppose: "I do not support",
      optNeutral: "Neutral / Unsure",
      poll: counts,
    },
  ];
}

const base = {
  neighborhoods: undefined,
  rejected: [] as Project["rejected"],
  log: [] as Project["log"],
};

export function seedProjects(): Project[] {
  const projects: Project[] = [
    {
      ...base,
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
      neighborhoods: "Nevillewood, Presto, Collier Center",
      docs: [
        { name: "Road Paving 2026 — Process & Location Guide.pdf" },
        { name: "Contractor Bid Summary — March 2026.pdf" },
      ],
      stages: [
        { n: 1, title: "Planning & Survey", dates: "Mar – Apr", desc: "Roads assessed and prioritized by pavement condition index.", bullets: ["Condition survey of 42 segments", "Priority list finalized"], state: "Published" },
        { n: 2, title: "Budget Approval", dates: "Apr – May", desc: "Board approves the paving budget and scope.", bullets: ["$645,203 approved", "Liquid Fuels allocation confirmed"], state: "Published" },
        { n: 3, title: "Bid & Award", dates: "May – Jun", desc: "RFP issued and contractor selected.", bullets: ["3 bids received", "Awarded to Youngblood Paving"], state: "Published" },
        { n: 4, title: "Utility Coordination", dates: "Jun – Jun", desc: "Coordinate with sewer and gas before milling.", bullets: ["Sewer clearances obtained"], state: "Published" },
        { n: 5, title: "Milling", dates: "Jul – Aug", desc: "Existing surface milled on scheduled roads.", bullets: ["Neighborhoods A–C complete"], state: "Published" },
        { n: 6, title: "Paving — Phase 1", dates: "Aug – Sep", desc: "Active resurfacing underway in Nevillewood.", bullets: ["Hilltop Rd repaved", "Paving crews on Orchard Dr"], state: "Published" },
        { n: 7, title: "Paving — Phase 2", dates: "Sep – Oct", desc: "Remaining neighborhoods resurfaced.", bullets: ["Scheduled: Presto, Cook School Rd"], state: "Published" },
        { n: 8, title: "Line Painting & Restoration", dates: "Oct – Nov", desc: "Line striping and shoulder restoration.", bullets: ["Pending Phase 2"], state: "Published" },
      ],
      polls: mkPoll("road-paving", "Road Paving 2026", "2 days ago", {
        support: 118, oppose: 34, neutral: 22, verified: { s: 92, o: 18, n: 12 },
        trend: [40, 62, 95, 120, 138, 152, 168, 174],
      }),
      sentiment: { supportive: 58, mixed: 27, concerns: 15 },
      themes: [
        { name: "Traffic detour confusion", count: 14, sent: "concerns", quote: "The detour signs on Orchard sent me in a circle for 20 minutes." },
        { name: "Appreciation for updates", count: 11, sent: "supportive", quote: "Love that I can see exactly which street is next." },
        { name: "Driveway access timing", count: 8, sent: "mixed", quote: "Can we get more notice before our driveway is blocked?" },
      ],
      privateMsgs: [
        { id: "pm1", name: "Diane Kessler", verified: true, anon: false, text: "Our cul-de-sac on Fawn Court was skipped last cycle — is it in this year's scope? It's badly cracked.", sent: "amber", time: "2h", replies: [], flag: null },
        { id: "pm2", name: "Marcus Webb", verified: true, anon: false, text: "Thank you for the clear schedule. Makes planning my commute so much easier.", sent: "green", time: "1d", replies: [{ dept: "Public Works", text: "Thanks Marcus — glad it helps. Phase 1 wraps next week.", time: "22h" }], flag: null },
      ],
      public: [
        { id: "c1", name: "NevillewoodMom", verified: true, anon: false, text: "Will Hilltop Rd be done before school starts? Buses use it every morning.", sent: "amber", time: "3h", replies: [], flag: null },
        { id: "c2", name: "Anonymous", verified: false, anon: true, text: "Finally! This road has needed paving for years. Thank you Public Works.", sent: "green", time: "5h", replies: [{ dept: "Public Works", text: "Appreciate it — Hilltop is in Phase 1, wrapping this week.", time: "4h" }], flag: null },
        { id: "c3", name: "R. Callahan", verified: true, anon: false, text: "Concerned about the detour routing near the elementary school during dropoff.", sent: "red", time: "8h", replies: [], flag: null },
        { id: "c4", name: "GregT", verified: false, anon: false, text: "How long will my street be closed for milling?", sent: "amber", time: "1d", replies: [], flag: null },
      ],
      hidden: [
        { id: "h1", name: "user8842", verified: false, anon: false, text: "this is a total waste of my tax dollars you people are clueless", sent: "red", time: "6h", replies: [], flag: "Contains language flagged as inappropriate" },
        { id: "h2", name: "spammybot", verified: false, anon: false, text: "CHEAP DRIVEWAY SEALING visit my site now!!! link in bio", sent: "red", time: "9h", replies: [], flag: "Possible spam" },
        { id: "h3", name: "JoeK", verified: false, anon: false, text: "anyone know when the fireworks are this year", sent: "amber", time: "12h", replies: [], flag: "Off-topic" },
      ],
      lc: "published",
      modMode: "selective",
      spotlight: {
        reason: "Public feedback needed",
        msg: "Public comment period is open through Aug 1. Share your input on this year's paving schedule.",
        end: "Aug 1, 2026",
        priority: "High",
        by: "Amy Medway",
        cta: "Share Your Input",
      },
    },
    {
      ...base,
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
      neighborhoods: "Woodland Avenue, Hilltop area",
      stages: [
        { n: 1, title: "Community Input", dates: "Jan – Feb", desc: "Resident surveys and public meetings shape the design.", bullets: ["312 survey responses", "2 public meetings held"], state: "Published" },
        { n: 2, title: "Design & Engineering", dates: "Feb – Apr", desc: "Landscape architects finalize plans.", bullets: ["Concept approved", "Trail alignment set"], state: "Published" },
        { n: 3, title: "Grant & Permitting", dates: "Apr – Jun", desc: "DCNR grant finalized and permits secured.", bullets: ["Grant awarded", "Stormwater permit under review"], state: "Published" },
        { n: 4, title: "Construction", dates: "Jun – Oct", desc: "Playground, trail, and parking built.", bullets: ["Not started"], state: "Draft" },
        { n: 5, title: "Opening", dates: "Nov – Dec", desc: "Ribbon cutting and community celebration.", bullets: ["Planned"], state: "Draft" },
      ],
      polls: mkPoll("hilltop", "Hilltop Park Expansion", "4 hours ago", {
        support: 201, oppose: 58, neutral: 30, verified: { s: 160, o: 31, n: 18 },
        trend: [60, 110, 160, 200, 240, 255, 270, 289],
      }),
      sentiment: { supportive: 64, mixed: 22, concerns: 14 },
      themes: [
        { name: "Parking capacity concerns", count: 19, sent: "concerns", quote: "More parking will just bring more traffic to our quiet street." },
        { name: "Excitement for playground", count: 23, sent: "supportive", quote: "My kids cannot wait for the new playground!" },
        { name: "Trail lighting & safety", count: 9, sent: "mixed", quote: "Will the trail be lit for evening walks?" },
      ],
      privateMsgs: [
        { id: "pm1", name: "Ellen Brooks", verified: true, anon: false, text: "We live directly behind the proposed parking lot. Concerned about headlights into our bedroom windows at night. Any buffer planned?", sent: "red", time: "1h", replies: [], flag: null },
        { id: "pm2", name: "Tom Alvarez", verified: true, anon: false, text: "The playground design looks fantastic. Is it ADA accessible throughout?", sent: "green", time: "6h", replies: [{ dept: "Parks and Recreation", text: "Yes — the entire play area and trail meet ADA accessibility standards.", time: "5h" }], flag: null },
        { id: "pm3", name: "Priya N.", verified: false, anon: true, text: "Can residents volunteer for the trail planting day?", sent: "green", time: "1d", replies: [], flag: null },
      ],
      public: [
        { id: "c1", name: "ParkLover22", verified: true, anon: false, text: "This is exactly what our community needs. Thank you for listening to the surveys!", sent: "green", time: "2h", replies: [], flag: null },
        { id: "c2", name: "QuietStreetDad", verified: true, anon: false, text: "The expanded parking is going to ruin the character of Woodland Ave. Please reconsider.", sent: "red", time: "4h", replies: [], flag: null },
        { id: "c3", name: "Anonymous", verified: false, anon: true, text: "Will the new trail connect to the existing township trail network?", sent: "amber", time: "7h", replies: [{ dept: "Parks and Recreation", text: "Yes, Stage 2 includes a connector to the Nevillewood trail spur.", time: "6h" }], flag: null },
        { id: "c4", name: "M. Sung", verified: true, anon: false, text: "Please make sure there is enough lighting on the trail for evening safety.", sent: "amber", time: "10h", replies: [], flag: null },
        { id: "c5", name: "GreenThumb", verified: false, anon: false, text: "Excited for this! Any native plantings in the landscape plan?", sent: "green", time: "1d", replies: [], flag: null },
      ],
      hidden: [
        { id: "h1", name: "angryresident", verified: false, anon: false, text: "you clowns are wasting a MILLION dollars on a swing set, unbelievable", sent: "red", time: "5h", replies: [], flag: "Contains language flagged as inappropriate" },
        { id: "h2", name: "promo_deals", verified: false, anon: false, text: "Best mulch prices in the county!! call now for a free quote!!!", sent: "red", time: "8h", replies: [], flag: "Possible spam" },
      ],
      lc: "published",
      modMode: "post",
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
      ...base,
      id: "nevillewood",
      title: "Nevillewood Traffic Management Plan",
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
        { n: 1, title: "Traffic Study", dates: "Feb – Apr", desc: "Speed and volume data collected.", bullets: ["Counts complete"], state: "Published" },
        { n: 2, title: "Design Alternatives", dates: "Apr – May", desc: "Calming options developed.", bullets: ["3 options drafted"], state: "Published" },
        { n: 3, title: "Public Review", dates: "Jun – Jul", desc: "Residents weigh in on options.", bullets: ["Meeting scheduled"], state: "Published" },
        { n: 4, title: "Implementation", dates: "Jul – Aug", desc: "Selected measures installed.", bullets: ["Pending"], state: "Draft" },
      ],
      polls: mkPoll("nevillewood", "Nevillewood Traffic Management Plan", "1 week ago", {
        support: 44, oppose: 38, neutral: 19, verified: { s: 31, o: 24, n: 11 },
        trend: [20, 35, 52, 68, 79, 88, 95, 101],
      }),
      sentiment: { supportive: 41, mixed: 31, concerns: 28 },
      themes: [
        { name: "Speed bump opposition", count: 12, sent: "concerns", quote: "Speed bumps will damage my car and slow emergency vehicles." },
        { name: "Support for calming", count: 10, sent: "supportive", quote: "Finally something to slow the cut-through traffic." },
      ],
      privateMsgs: [
        { id: "pm1", name: "Frank D.", verified: true, anon: false, text: "Please no speed bumps — my elderly mother's back can't take them. Consider a roundabout instead.", sent: "amber", time: "3h", replies: [], flag: null },
      ],
      public: [
        { id: "c1", name: "SafeStreetsNow", verified: true, anon: false, text: "We need this. Cars fly down our road at 45mph.", sent: "green", time: "5h", replies: [], flag: null },
        { id: "c2", name: "Anonymous", verified: false, anon: true, text: "Speed bumps are the wrong answer. Enforce the existing limit instead.", sent: "red", time: "1d", replies: [], flag: null },
      ],
      hidden: [],
      lc: "completed",
      modMode: "post",
      spotlight: null,
      completedDate: "May 2026",
    },
    {
      ...base,
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
        { n: 1, title: "Needs Assessment", dates: "Jan – Mar", desc: "Facility condition and equipment audit.", bullets: ["Audit underway"], state: "Published" },
        { n: 2, title: "Bond Referendum", dates: "Apr – May", desc: "Voters decide on the bond issue.", bullets: ["On ballot"], state: "Published" },
        { n: 3, title: "Design", dates: "Jun – Sep", desc: "Architectural design.", bullets: ["Pending funding"], state: "Published" },
      ],
      polls: mkPoll("fire-station", "Fire Station Upgrades — Presto", "3 days ago", {
        support: 88, oppose: 42, neutral: 26, verified: { s: 70, o: 30, n: 15 },
        trend: [30, 50, 72, 90, 108, 124, 140, 156],
      }),
      sentiment: { supportive: 55, mixed: 25, concerns: 20 },
      themes: [
        { name: "Tax impact worry", count: 15, sent: "concerns", quote: "How much will this bond add to my property taxes?" },
      ],
      privateMsgs: [],
      public: [
        { id: "c1", name: "Anonymous", verified: false, anon: true, text: "Our firefighters deserve a modern station. I support the bond.", sent: "green", time: "1d", replies: [], flag: null },
      ],
      hidden: [],
      lc: "pending",
      modMode: "post",
      spotlight: null,
      submittedBy: "Bob Caun",
      submittedDept: "Public Works",
      submittedDate: "2 days ago",
      reviewer: "Amy Medway",
      urgency: "Standard",
      srNote: "Ready for review ahead of the April bond vote. Cost estimate attached.",
    },
    {
      ...base,
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
        { n: 1, title: "Compliance Mapping", dates: "Jan – Mar", desc: "Outfalls mapped and inspected.", bullets: ["Mapping complete"], state: "Published" },
        { n: 2, title: "Basin Retrofits", dates: "Apr – Aug", desc: "Detention basins upgraded.", bullets: ["2 of 5 complete"], state: "Published" },
        { n: 3, title: "Reporting", dates: "Sep – Dec", desc: "Annual MS4 report filed.", bullets: ["Pending"], state: "Published" },
      ],
      polls: mkPoll("ms4", "MS4 Stormwater Projects", "5 days ago", {
        support: 32, oppose: 8, neutral: 14, verified: { s: 26, o: 5, n: 9 },
        trend: [10, 18, 26, 33, 40, 46, 50, 54],
      }),
      sentiment: { supportive: 62, mixed: 24, concerns: 14 },
      themes: [],
      privateMsgs: [],
      public: [
        { id: "c1", name: "WatershedWatch", verified: true, anon: false, text: "Great to see the township taking stormwater seriously.", sent: "green", time: "2d", replies: [], flag: null },
      ],
      hidden: [],
      lc: "published",
      modMode: "post",
      spotlight: null,
    },
    {
      ...base,
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
        { n: 1, title: "Application Filed", dates: "Mar – Mar", desc: "Developer submits application.", bullets: ["Received"], state: "Published" },
        { n: 2, title: "Staff Review", dates: "Apr – May", desc: "Zoning and traffic review.", bullets: ["Traffic study requested"], state: "Published" },
        { n: 3, title: "Public Hearing", dates: "Jun – Jun", desc: "Planning commission hearing.", bullets: ["Scheduled Jun 18"], state: "Published" },
        { n: 4, title: "Decision", dates: "Jul – Jul", desc: "Commission votes.", bullets: ["Pending"], state: "Draft" },
        { n: 5, title: "Conditions", dates: "Aug – Sep", desc: "Conditions of approval.", bullets: ["Pending"], state: "Draft" },
      ],
      polls: mkPoll("mixed-use", "Small-Scale Mixed-Use Development", "6 days ago", {
        support: 61, oppose: 94, neutral: 28, verified: { s: 44, o: 71, n: 16 },
        trend: [30, 55, 80, 102, 120, 140, 160, 183],
      }),
      sentiment: { supportive: 33, mixed: 24, concerns: 43 },
      themes: [
        { name: "Density & traffic", count: 28, sent: "concerns", quote: "24 units will overwhelm our already-congested village intersection." },
        { name: "Support for local retail", count: 14, sent: "supportive", quote: "We need more walkable shops in the village." },
      ],
      privateMsgs: [
        { id: "pm1", name: "Harold Simms", verified: true, anon: false, text: "This density is completely out of character for the village. I urge the commission to deny.", sent: "red", time: "4h", replies: [], flag: null },
      ],
      public: [
        { id: "c1", name: "VillageResident", verified: true, anon: false, text: "Please protect our small-town character. This is too much.", sent: "red", time: "6h", replies: [], flag: null },
        { id: "c2", name: "WalkableFan", verified: false, anon: false, text: "I would love a coffee shop within walking distance. Support!", sent: "green", time: "1d", replies: [], flag: null },
      ],
      hidden: [
        { id: "h1", name: "nimby99", verified: false, anon: false, text: "the developer is obviously paying off the commission, corrupt", sent: "red", time: "7h", replies: [], flag: "Unsubstantiated claim flagged for review" },
      ],
      lc: "pending",
      modMode: "full",
      spotlight: null,
      submittedBy: "Kris Delano",
      submittedDept: "Planning",
      submittedDate: "6 hours ago",
      reviewer: "George Macino",
      urgency: "High",
      srNote: "Sensitive project — please review the comment moderation setting before publishing.",
    },
    {
      ...base,
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
        { n: 1, title: "Intake", dates: "—", desc: "Applications logged.", bullets: ["4 active"], state: "Published" },
        { n: 2, title: "Review", dates: "—", desc: "Under staff review.", bullets: ["2 in traffic review"], state: "Published" },
        { n: 3, title: "Hearings", dates: "—", desc: "Scheduled hearings.", bullets: ["1 upcoming"], state: "Published" },
        { n: 4, title: "Decisions", dates: "—", desc: "Rolling decisions.", bullets: ["—"], state: "Draft" },
      ],
      polls: mkPoll("new-dev", "New Development Review", "1 week ago", {
        support: 22, oppose: 19, neutral: 15, verified: { s: 16, o: 12, n: 9 },
        trend: [8, 15, 22, 28, 34, 40, 46, 56],
      }),
      sentiment: { supportive: 40, mixed: 33, concerns: 27 },
      themes: [],
      privateMsgs: [],
      public: [
        { id: "c1", name: "Anonymous", verified: false, anon: true, text: "Where can I see the full subdivision plans?", sent: "amber", time: "2d", replies: [], flag: null },
      ],
      hidden: [],
      lc: "draft",
      modMode: "post",
      spotlight: null,
    },
    {
      ...base,
      id: "digital-services",
      title: "Website & Digital Services Upgrade",
      cat: "Plan/Dev",
      deptShort: "Manager's Office",
      dept: "Manager's Office",
      status: "Active",
      cost: "—",
      funding: "Township Capital",
      edited: "2 days ago",
      followers: 71,
      current: 1,
      desc: "A township-wide upgrade of the public website and online service requests, led by the Manager's Office.",
      sponsor: "Manager's Office",
      duration: "2026",
      stages: [
        { n: 1, title: "Underway", dates: "2026", desc: "Work is currently underway on this project.", bullets: ["On schedule"], state: "Published" },
      ],
      polls: [],
      sentiment: { supportive: 54, mixed: 29, concerns: 17 },
      themes: [
        { name: "Accessibility improvements", count: 8, sent: "supportive", quote: "The new site is so much easier to read on my phone." },
        { name: "Login confusion", count: 5, sent: "concerns", quote: "I could not reset my service-request password — it kept looping." },
      ],
      privateMsgs: [
        { id: "dspm1", name: "Diane Kessler", verified: true, anon: false, text: "Will the new site keep the meeting-minutes archive going back to 2018?", sent: "amber", time: "1d", replies: [], flag: null },
      ],
      public: [
        { id: "ds1", name: "Rennerdale Resident", verified: true, anon: false, text: "Paying my sewer bill online finally works without crashing. Thank you!", sent: "green", time: "3h", replies: [], flag: null },
        { id: "ds2", name: "Anonymous", verified: false, anon: true, text: "The old permit forms are still linked from the news page — confusing.", sent: "amber", time: "6h", replies: [], flag: null },
        { id: "ds3", name: "M. Torres", verified: true, anon: false, text: "Could not reset my password for service requests. Kept sending me in circles.", sent: "red", time: "1d", replies: [], flag: null },
        { id: "ds4", name: "PrestoParent", verified: true, anon: false, text: "Love the new mobile layout. Much easier than the old site.", sent: "green", time: "2d", replies: [], flag: null },
      ],
      hidden: [],
      lc: "published",
      modMode: "post",
      spotlight: null,
    },
  ];

  // Simple published seeds — single "Underway" stage, no engagement yet
  const P = (
    id: string,
    title: string,
    cat: StaffCategory,
    dept: string,
    deptShort: string,
    followers: number,
    edited: string,
    desc: string
  ): Project => ({
    ...base,
    id,
    title,
    cat,
    dept,
    deptShort,
    status: "Active",
    cost: "—",
    funding: "Township Capital",
    edited,
    followers,
    current: 1,
    desc,
    sponsor: deptShort,
    duration: "2026",
    stages: [
      { n: 1, title: "Underway", dates: "2026", desc: "Work is currently underway on this project.", bullets: ["On schedule"], state: "Published" },
    ],
    polls: [],
    sentiment: { supportive: 0, mixed: 0, concerns: 0 },
    themes: [],
    privateMsgs: [],
    public: [],
    hidden: [],
    lc: "published",
    modMode: "post",
    spotlight: null,
  });

  projects.push(
    P("lobaugh", "Private Road Maintenance — Lobaugh Drive", "Roads", "Public Works", "Public Works", 37, "3 days ago",
      "Cost-shared repaving of the private section of Lobaugh Drive under the Township's private-road maintenance program."),
    P("collier-park", "Collier Park & Ballfield Upgrades", "Parks", "Parks and Recreation", "Parks & Rec", 158, "1 day ago",
      "New backstops, regraded infields, and accessible pathways across the Collier Park ballfields."),
    P("police-remodel", "Police Department Facility Remodeling", "Public Safety", "Police Department", "Police Dept", 88, "6 days ago",
      "Interior remodel of the police facility, including upgraded evidence storage and an accessible public lobby."),
    P("cc-parking", "Community Center Parking Lot", "Infrastructure", "Public Works", "Public Works", 52, "4 days ago",
      "Resurfacing and restriping of the Community Center lot with added ADA spaces and stormwater inlets."),
    P("ordinance", "Township Ordinance Updates", "Plan/Dev", "Planning, Zoning, and Land Development", "Planning", 44, "1 week ago",
      "A rolling set of ordinance updates covering signage, short-term rentals, and stormwater standards.")
  );

  // Completed / archived / trashed seeds
  projects.push(
    {
      ...P("fire-rennerdale", "Fire Station Upgrades — Rennerdale", "Public Safety", "Police Department", "EMS & Fire", 119, "completed Mar 2026",
        "Apparatus bay expansion and equipment modernization at the Rennerdale fire station."),
      lc: "completed",
      status: "Completed",
      completedDate: "Mar 2026",
      stages: [{ n: 1, title: "Complete", dates: "2026", desc: "Project complete.", bullets: [], state: "Published" }],
    },
    {
      ...P("arch-playground", "Playground Resurfacing 2024", "Parks", "Parks and Recreation", "Parks & Rec", 96, "completed Dec 2024",
        "Poured-rubber safety surfacing installed at three neighborhood playgrounds."),
      lc: "completed",
      status: "Completed",
      completedDate: "Dec 2024",
      archivedYear: "2025",
      outcome: "Completed under budget; surfacing installed at Hilltop, Presto, and Fort Pitt playgrounds.",
      stages: [{ n: 1, title: "Complete", dates: "—", desc: "Project complete.", bullets: [], state: "Published" }],
    },
    {
      ...P("arch-signage", "Wayfinding Signage Refresh", "Infrastructure", "Public Works", "Public Works", 41, "completed Feb 2025",
        "Replacement of aging directional and park signage township-wide."),
      lc: "completed",
      status: "Completed",
      completedDate: "Feb 2025",
      archivedYear: "2025",
      outcome: "42 signs replaced; positive resident feedback on legibility.",
      stages: [{ n: 1, title: "Complete", dates: "—", desc: "Project complete.", bullets: [], state: "Published" }],
    },
    {
      ...P("trash-saltshed", "Salt Shed Roof Repair", "Infrastructure", "Public Works", "Public Works", 8, "deleted 3 days ago",
        "Draft project for a minor roof repair at the Cook School Rd salt shed."),
      lc: "trash",
      status: "Draft",
      trashedDate: "3 days ago",
      prevLc: "draft",
    }
  );

  return projects;
}

// ── Citation library ─────────────────────────────────────────────

export const SEED_CITATIONS: Citation[] = [
  { id: "ct1", quote: "My kids cannot wait for the new playground!", attrLevel: "first", name: "Sarah Nguyen", nb: "Nevillewood", tags: ["Parks", "Playground"], project: "Hilltop Park Expansion", projId: "hilltop", date: "Mar 2026", sentW: "supportive" },
  { id: "ct2", quote: "24 units will overwhelm our already-congested village intersection.", attrLevel: "full", name: "Harold Simms", nb: "Presto", tags: ["Density", "Traffic"], project: "Grandview Village Rezoning", projId: "rezoning", date: "Apr 2026", sentW: "concerns" },
  { id: "ct3", quote: "Love that I can see exactly which street is next.", attrLevel: "anon", name: "", nb: "Nevillewood", tags: ["Transparency", "Roads"], project: "Road Paving 2026", projId: "road-paving", date: "May 2026", sentW: "supportive" },
  { id: "ct4", quote: "Our firefighters deserve a modern station. I support the bond.", attrLevel: "anon", name: "", nb: "Rennerdale", tags: ["Public Safety", "Bond"], project: "Fire Station Bond", projId: "fire", date: "Feb 2026", sentW: "supportive" },
  { id: "ct5", quote: "Finally something to slow the cut-through traffic.", attrLevel: "first", name: "Dana Reyes", nb: "Ewingsville", tags: ["Traffic", "Safety"], project: "Neighborhood Traffic Calming", projId: "traffic", date: "Jan 2026", sentW: "supportive" },
];

export function citAttr(c: Citation): string {
  if (c.attrLevel === "anon") return "Anonymous Collier resident";
  if (c.attrLevel === "first") return `Resident ${c.name.split(" ")[0]} (first name only)`;
  return `${c.name}, ${c.nb} resident`;
}

// ── Stage templates (create-flow "Load a template") ──────────────

export const STAGE_TEMPLATES: Record<
  string,
  Array<{ title: string; start: string; end?: string; summary: string; bullets: string[]; status?: "published" }>
> = {
  "Road Paving": [
    { title: "Road Condition Assessment", start: "Winter 2025", end: "Spring 2026", summary: "Every township-owned road is scored by condition to prioritize the paving list.", bullets: ["Roads scored 1–5 by condition", "Priority list finalized"], status: "published" },
    { title: "Budget Approval", start: "Spring 2026", summary: "The Board approves the paving budget and scope at a public meeting.", bullets: ["Budget approved by Board vote"], status: "published" },
    { title: "Bid & Award", start: "Late Spring 2026", summary: "Contractors submit sealed bids and the lowest responsible bidder is selected.", bullets: ["RFP advertised publicly", "Contract awarded"] },
    { title: "Milling & Paving", start: "Summer 2026", summary: "Old surface is milled off and fresh asphalt is laid neighborhood by neighborhood.", bullets: ["Milling of worn surface", "New asphalt laid and compacted"] },
    { title: "Line Painting & Restoration", start: "Fall 2026", summary: "Lane lines are repainted and shoulders restored once the surface cures.", bullets: ["Lane lines repainted", "Shoulders restored"] },
  ],
  "Park Improvement": [
    { title: "Community Input", start: "Spring 2026", summary: "Resident surveys and public meetings shape the design.", bullets: ["Surveys collected", "Public meetings held"], status: "published" },
    { title: "Design & Engineering", start: "Summer 2026", summary: "Landscape architects finalize the plan.", bullets: ["Concept approved"] },
    { title: "Grant & Permitting", start: "Fall 2026", summary: "Grants are finalized and permits secured.", bullets: ["Permits under review"] },
    { title: "Construction", start: "Spring 2027", summary: "Facilities are built and installed.", bullets: ["Not started"] },
    { title: "Grand Opening", start: "Fall 2027", summary: "Ribbon cutting and community celebration.", bullets: ["Planned"] },
  ],
  "Zoning Amendment": [
    { title: "Application Filed", start: "Spring 2026", summary: "The application is submitted and logged.", bullets: ["Received"], status: "published" },
    { title: "Staff Review", start: "Late Spring 2026", summary: "Zoning and traffic review by township staff.", bullets: ["Reviews underway"] },
    { title: "Public Hearing", start: "Summer 2026", summary: "Residents weigh in at a planning commission hearing.", bullets: ["Hearing scheduled"] },
    { title: "Decision", start: "Late Summer 2026", summary: "The commission votes on the amendment.", bullets: ["Pending"] },
  ],
  "Building Renovation": [
    { title: "Needs Assessment", start: "Winter 2026", summary: "Facility condition and equipment audit.", bullets: ["Audit underway"], status: "published" },
    { title: "Design", start: "Spring 2026", summary: "Architectural design of the renovation.", bullets: ["Pending"] },
    { title: "Funding", start: "Summer 2026", summary: "Funding sources are confirmed.", bullets: ["Pending"] },
    { title: "Construction", start: "Fall 2026", summary: "Renovation work is completed.", bullets: ["Not started"] },
  ],
  "Comprehensive Plan": [
    { title: "Kickoff & Visioning", start: "Winter 2026", summary: "The planning process kicks off with community visioning.", bullets: ["Steering committee formed"], status: "published" },
    { title: "Existing Conditions", start: "Spring 2026", summary: "Data on existing conditions is gathered and analyzed.", bullets: ["Data collection underway"] },
    { title: "Draft Plan", start: "Summer 2026", summary: "The draft comprehensive plan is written.", bullets: ["Pending"] },
    { title: "Public Review", start: "Fall 2026", summary: "Residents review and comment on the draft.", bullets: ["Pending"] },
    { title: "Adoption", start: "Winter 2027", summary: "The Board adopts the final plan.", bullets: ["Pending"] },
  ],
};

// ── Report templates ─────────────────────────────────────────────

export interface ReportTemplate {
  key: string;
  name: string;
  purpose: string;
  sections: Array<
    | { heading: string; kind: "text"; body: string }
    | { heading: string; kind: "stats" }
    | { heading: string; kind: "quotes" }
    | { heading: string; kind: "narrative"; aiBody: string; manualHint: string }
  >;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    key: "grant",
    name: "Grant Application Support Package",
    purpose: "Gather community-engagement data supporting a grant application for a project or category.",
    sections: [
      { heading: "Project Overview", kind: "text", body: "Summary of the selected project, its scope, funding, and timeline as published to residents." },
      { heading: "Community Engagement at a Glance", kind: "stats" },
      { heading: "Community Voices", kind: "quotes" },
      {
        heading: "Demonstrated Community Support",
        kind: "narrative",
        aiBody:
          "Resident engagement on this project demonstrates broad and sustained community support. Poll participation has grown steadily since the comment period opened, with supportive responses outnumbering concerns by a wide margin. Public comments emphasize the project's day-to-day impact on residents, and the township's response rate shows an active, two-way dialogue that grant reviewers can verify directly on the public project page.",
        manualHint: "[Narrative: summarize the evidence of community support for the grant reviewer.]",
      },
    ],
  },
  {
    key: "compplan",
    name: "Comprehensive Plan Data Package",
    purpose: "Aggregate multi-year community data for a section of the comprehensive plan.",
    sections: [
      { heading: "Engagement Summary", kind: "text", body: "Multi-year engagement trends across projects in the selected category and time range." },
      { heading: "Key Metrics", kind: "stats" },
      { heading: "Representative Resident Input", kind: "quotes" },
      {
        heading: "Findings for the Plan",
        kind: "narrative",
        aiBody:
          "Across the selected period, resident engagement has broadened across neighborhoods rather than concentrating in a few streets, and sentiment has warmed as township response times improved. The recurring themes — traffic safety, park capacity, and communication clarity — map directly onto the plan's mobility, recreation, and civic-engagement chapters.",
        manualHint: "[Narrative: connect the engagement data to the comprehensive plan chapter.]",
      },
    ],
  },
  {
    key: "board",
    name: "Board Meeting Brief",
    purpose: "A one-page brief for an upcoming board vote on a specific project.",
    sections: [
      { heading: "Decision Before the Board", kind: "text", body: "What the Board is being asked to vote on, with the project's current stage and schedule." },
      { heading: "Resident Engagement", kind: "stats" },
      { heading: "What Residents Are Saying", kind: "quotes" },
      {
        heading: "Staff Summary",
        kind: "narrative",
        aiBody:
          "Staff recommends the Board weigh the poll results alongside the comment themes: overall sentiment is supportive, with the main concerns focused on construction-period disruption rather than the project itself. A brief public update addressing detour timing would likely resolve the most common question residents raise.",
        manualHint: "[Narrative: staff summary and recommendation for the Board.]",
      },
    ],
  },
  {
    key: "annual",
    name: "Annual Community Report",
    purpose: "Public-facing yearly summary of engagement and outcomes.",
    sections: [
      { heading: "Year in Review", kind: "text", body: "Projects published, completed, and underway this year, with participation totals." },
      { heading: "Engagement by the Numbers", kind: "stats" },
      { heading: "Resident Highlights", kind: "quotes" },
      {
        heading: "Looking Ahead",
        kind: "narrative",
        aiBody:
          "Next year's slate builds on this momentum: the township will carry forward the paving program, open the expanded Hilltop Park, and continue modernizing digital services. Residents can follow every stage — and shape the outcome — on Collier Connect.",
        manualHint: "[Narrative: forward-looking close for the public report.]",
      },
    ],
  },
];

// ── Trends (Reports tab) hard-coded series ───────────────────────

export const QUARTER_LABELS = ["Q1 24", "Q2 24", "Q3 24", "Q4 24", "Q1 25", "Q2 25", "Q3 25", "Q4 25", "Q1 26", "Q2 26"];

export const TREND_RANGES: Array<{ key: string; label: string; points: number }> = [
  { key: "6m", label: "Last 6 months", points: 3 },
  { key: "1y", label: "Last year", points: 5 },
  { key: "3y", label: "Last 3 years", points: 8 },
  { key: "5y", label: "Last 5 years", points: 10 },
  { key: "all", label: "All time", points: 10 },
];

export const ENG_SERIES = [
  { key: "comments", label: "Comments", color: "#2563EB", data: [120, 140, 165, 185, 205, 235, 268, 305, 352, 405] },
  { key: "follows", label: "Follows", color: "#16A34A", data: [80, 92, 108, 128, 150, 172, 196, 222, 251, 286] },
  { key: "votes", label: "Poll votes", color: "#D97706", data: [210, 235, 262, 298, 338, 378, 416, 458, 502, 560] },
  { key: "dms", label: "Private messages", color: "#7C3AED", data: [10, 13, 17, 21, 25, 30, 35, 41, 47, 54] },
];

export const RESP_RATE = [64, 66, 68, 70, 72, 75, 77, 80, 82, 85];
export const RESP_TIME_DAYS = [5.4, 5.0, 4.6, 4.2, 3.9, 3.5, 3.2, 2.9, 2.6, 2.3];

export const NEIGHBORHOODS = ["Nevillewood", "Ewingsville", "Rennerdale", "Beechmont", "Presto"];
export const NB_COLORS = ["#1E3A5F", "#2563EB", "#0891B2", "#0D9488", "#7C3AED"];
export const NB_BASE = [
  [30, 22, 18, 12, 8], [34, 26, 20, 14, 10], [40, 30, 22, 16, 12], [46, 34, 26, 18, 14], [52, 40, 30, 22, 17],
  [60, 46, 34, 26, 20], [70, 52, 40, 30, 24], [82, 60, 46, 34, 28], [95, 70, 54, 40, 33], [110, 82, 63, 47, 39],
];

export const CAT_TREND_LABELS = ["Roads", "Parks", "Infrastructure", "Plan/Dev", "Public Safety"];
export const CAT_TREND_COLORS = ["#D97706", "#16A34A", "#2563EB", "#7C3AED", "#DC2626"];
export const CAT_BASE = [
  [40, 30, 18, 14, 10], [46, 34, 20, 16, 12], [54, 40, 24, 20, 14], [62, 46, 28, 22, 16], [72, 54, 33, 26, 19],
  [84, 62, 38, 30, 22], [98, 72, 45, 34, 26], [112, 84, 52, 40, 30], [128, 96, 60, 46, 34], [146, 110, 70, 52, 40],
];

export const SENT_BASE = [
  { s: 52, m: 30, c: 18 }, { s: 54, m: 29, c: 17 }, { s: 50, m: 30, c: 20 }, { s: 48, m: 31, c: 21 }, { s: 53, m: 28, c: 19 },
  { s: 55, m: 27, c: 18 }, { s: 51, m: 29, c: 20 }, { s: 57, m: 26, c: 17 }, { s: 59, m: 25, c: 16 }, { s: 61, m: 24, c: 15 },
];

export const TREND_NOTES = {
  eng: "Engagement has grown steadily by roughly 40% year over year, with the largest jumps in Q3 of each year.",
  engAnno: "Comment volume spiked in Q4 2024 after the property-tax announcement.",
  resp: "Response rate climbed from 64% to 85% while average response time fell from 5.4 to 2.3 days — the Township is answering more residents, faster.",
  nbhd: "Engagement is broadening across neighborhoods rather than concentrating; Rennerdale and Beechmont more than doubled their share.",
  cat: "Roads and Parks remain the dominant topics, but Infrastructure engagement is rising as facility projects move forward.",
  sent: "Overall sentiment has warmed from 52% to 61% supportive over the period, tracking the Township's faster response times.",
};

// ── AI-upload sample datasets (create flow) ──────────────────────

export const SAMPLES: SampleSet[] = [
  {
    key: "road",
    label: "Road Paving 2026",
    files: [
      ["Road Paving 2026 — Board Meeting Minutes.pdf", "Meeting minutes"],
      ["Roadbotics Assessment — Ewingsville & Nevillewood 2024.pdf", "Assessment"],
      ["Contractor Bid Summary — March 2026.pdf", "Budget document"],
      ["PW-2026-01 RFP.pdf", "RFP"],
    ],
    fields: {
      title: "Road Paving 2026",
      category: "Roads",
      desc: "Annual resurfacing of 8.4 miles of township roads across five neighborhoods, including base repair and line painting.",
      funding: "PennDOT Liquid Fuels + Capital Reserve",
      cost: "$645,203",
      sponsor: "Public Works Dept",
      duration: "Mar 2026 – Nov 2026",
    },
    stages: [
      { title: "Planning & Survey", start: "Mar 2026", end: "Apr 2026", summary: "Public Works scores every Township road with the Roadbotics program and prioritizes segments by condition.", bullets: ["Condition survey of 42 segments", "Priority list finalized"] },
      { title: "Budget Approval", start: "Apr 2026", end: "May 2026", summary: "The Board approves the paving budget and scope.", bullets: ["$645,203 approved", "Liquid Fuels allocation confirmed"] },
      { title: "Bid & Award", start: "May 2026", end: "Jun 2026", summary: "The RFP is issued and a contractor selected.", bullets: ["3 bids received", "Awarded to Youngblood Paving"] },
      { title: "Utility Coordination", start: "Jun 2026", end: "", summary: "Sewer and gas lines are coordinated before milling.", bullets: ["Sewer clearances obtained"] },
      { title: "Milling", start: "Jul 2026", end: "Aug 2026", summary: "The existing surface is milled on scheduled roads.", bullets: ["Neighborhoods A–C complete"] },
      { title: "Paving — Phase 1", start: "Aug 2026", end: "Sep 2026", summary: "Active resurfacing begins in Nevillewood.", bullets: ["Hilltop Rd repaved", "Crews on Orchard Dr"] },
      { title: "Paving — Phase 2", start: "Sep 2026", end: "Oct 2026", summary: "Remaining neighborhoods are resurfaced.", bullets: ["Scheduled: Presto, Cook School Rd"] },
      { title: "Line Painting & Restoration", start: "Oct 2026", end: "Nov 2026", summary: "Line striping and shoulder restoration wrap the season.", bullets: ["Pending Phase 2"] },
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
    fields: {
      title: "Hilltop Park Expansion",
      category: "Parks",
      desc: "Expansion of Hilltop Park with a new playground, multi-use trail, and expanded parking to meet growing demand.",
      funding: "DCNR Grant + Township Match",
      cost: "$1.2M",
      sponsor: "Parks & Recreation",
      duration: "Jan 2026 – Dec 2026",
    },
    stages: [
      { title: "Community Input", start: "Jan 2026", end: "Feb 2026", summary: "Resident surveys and public meetings shape the design.", bullets: ["312 survey responses", "2 public meetings held"] },
      { title: "Design & Engineering", start: "Feb 2026", end: "Apr 2026", summary: "Landscape architects finalize plans.", bullets: ["Concept approved", "Trail alignment set"] },
      { title: "Grant & Permitting", start: "Apr 2026", end: "Jun 2026", summary: "The DCNR grant is finalized and permits secured.", bullets: ["Grant awarded", "Stormwater permit under review"] },
      { title: "Construction", start: "Jun 2026", end: "Oct 2026", summary: "Playground, trail, and parking are built.", bullets: ["Not started"] },
      { title: "Opening", start: "Nov 2026", end: "Dec 2026", summary: "Ribbon cutting and community celebration.", bullets: ["Planned"] },
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
    fields: {
      title: "Fire Station Upgrades — Presto",
      category: "Public Safety",
      desc: "Renovation and equipment modernization of the Presto fire station, including a new apparatus bay and living quarters.",
      funding: "Grant + Bond Issue (pending)",
      cost: "$2.4M",
      sponsor: "EMS & Fire",
      duration: "2026 – 2027",
    },
    stages: [
      { title: "Needs Assessment", start: "Jan 2026", end: "Mar 2026", summary: "Facility condition and equipment audit.", bullets: ["Audit underway"] },
      { title: "Grant Application", start: "Mar 2026", end: "May 2026", summary: "State grant application submitted.", bullets: ["Application filed"] },
      { title: "Design", start: "Jun 2026", end: "Sep 2026", summary: "Architectural design of the station upgrades.", bullets: ["Pending funding"] },
      { title: "Construction", start: "2027", end: "", summary: "Renovation and bay construction.", bullets: ["Not started"] },
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
    fields: {
      title: "Downtown Mixed-Use Zoning Amendment",
      category: "Plan/Dev",
      desc: "Zoning amendment enabling small-scale mixed-use development with ground-floor retail near the village center.",
      funding: "N/A (regulatory)",
      cost: "N/A",
      sponsor: "Planning Dept",
      duration: "Review 2026",
    },
    stages: [
      { title: "Application Filed", start: "Mar 2026", end: "", summary: "The amendment application is submitted and logged.", bullets: ["Received"] },
      { title: "Staff Review", start: "Apr 2026", end: "May 2026", summary: "Zoning and traffic review by township staff.", bullets: ["Traffic study requested"] },
      { title: "Public Hearing", start: "Jun 2026", end: "", summary: "Planning commission hearing with resident input.", bullets: ["Scheduled Jun 18"] },
      { title: "Commission Vote", start: "Jul 2026", end: "", summary: "The commission votes on the amendment.", bullets: ["Pending"] },
      { title: "Conditions & Adoption", start: "Aug 2026", end: "Sep 2026", summary: "Conditions of approval are finalized and adopted.", bullets: ["Pending"] },
    ],
  },
];

// ── AI extraction split-view demo content ────────────────────────

export function roadExtract(): ExtractData {
  const files: Array<[string, string]> = [
    ["Road Paving 2026 — Process & Location Guide.pdf", "Process guide"],
    ["Road Paving 2026 — Board Meeting Minutes.pdf", "Meeting minutes"],
    ["Roadbotics Assessment 2024.pdf", "Assessment"],
    ["Contractor Bid Summary — March 2026.pdf", "Budget document"],
  ];
  const paras: ExtractPara[] = [];
  const addPara = (page: number, kind: "h1" | "h2" | "p", text: string) => {
    const id = "rp" + paras.length;
    paras.push({ id, page, kind, text });
    return id;
  };
  const pTitle = addPara(1, "h1", "Road Paving 2026");
  const pOver = addPara(1, "p", "Each year the Collier Township Public Works Department repaves a set of Township-owned roads to keep them safe, drivable, and well-maintained over time. In 2026, eight road locations across Ewingsville, Nevillewood, Rennerdale, and Beechmont have been selected for paving.");
  addPara(1, "h2", "Funding");
  const pFund = addPara(1, "p", "Paid for by taxpayers through the Township's 2026 annual budget, at a total cost of $645,203.00. The project is under budget this year and requires no tax increase.");
  addPara(1, "h2", "Location by Neighborhood");
  addPara(1, "p", "Maclaine Drive (Ewingsville), Turnberry Drive (Nevillewood), Sunnyside Avenue — Lower (Rennerdale), Cook School Road (Rennerdale), Orchard Drive (Nevillewood), Presto Lane (Beechmont), Hilltop Road (Nevillewood), and Fawn Court (Ewingsville). These were chosen based on condition scores from the Roadbotics evaluation program.");
  addPara(1, "h2", "How does this affect you?");
  addPara(1, "p", "Roads being repaired in these neighborhoods will likely have one lane open only or full-closure detours during the work. Please plan accordingly when commuting or traveling through these areas. Once paving is complete, the roads will be fully accessible.");
  const hProc = addPara(2, "h1", "The Paving Process, Step by Step");
  const s1 = addPara(2, "p", "Step 1 — Road Condition Assessment (first full scan with the program completed 2024). Public Works uses the Roadbotics program to evaluate every Township-owned road and create a condition score from 1 (minimal work needed) to 5 (most in need of work). All roads are video recorded, with re-evaluations done at least every 5 years.");
  const s2 = addPara(2, "p", "Step 2 — Board Approval to Seek Contractors (discussed at the 2025 and January 2026 meetings). The Board of Commissioners holds a public vote to approve advertising the upcoming road paving work to qualified contractors. Once approved, the Township engineer prepares documents describing the scope of work.");
  const s3 = addPara(2, "p", "Step 3 — Scope of Work & RFP Preparation (January 2026). The Township engineer prepares a Request for Proposals (RFP) listing the roads, quantities, and specifications contractors must meet.");
  const s4 = addPara(2, "p", "Step 4 — Advertising to Contractors (February 2026). The RFP is publicly advertised so qualified paving contractors can submit sealed bids during an open bidding period.");
  const s5 = addPara(3, "p", "Step 5 — Public Bid Opening & Contractor Selection (March 2026). The State of Pennsylvania mandates the selection of the “lowest responsible bidder” (meaning the lowest bid total that promises to meet the RFP specifications within a reasonable timeframe) to avoid collusion of contracts between municipalities and companies.");
  const s6 = addPara(3, "p", "Step 6 — Board Awards Contract (March 2026). The Board of Commissioners votes at a public meeting to award the contract to the selected contractor.");
  const s7 = addPara(3, "p", "Step 7 — Pre-Construction & Utility Coordination (April 2026). Before milling begins, sewer and gas lines are located and cleared, and residents are notified of the schedule for their street.");
  const s8 = addPara(3, "p", "Step 8 — Milling (May – June 2026). The existing worn asphalt surface is ground off (milled) on the scheduled roads to prepare for new paving.");
  const s9 = addPara(4, "p", "Step 9 — Paving (June – August 2026). Fresh asphalt is laid and compacted one neighborhood at a time, beginning with the highest-priority roads.");
  const s10 = addPara(4, "p", "Step 10 — Line Painting & Restoration (August 2026). Lane lines and pavement markings are repainted and shoulders restored once the new surface has cured.");
  const s11 = addPara(4, "p", "Step 11 — Final Inspection & Punchlist (September 2026). The engineer performs a final walkthrough and documents any remaining punchlist items the contractor must correct before final payment is released.");

  const pg = (id: string) => paras.find((p) => p.id === id)?.page || 1;
  const F = (o: Omit<ExtractField, "doc">): ExtractField => ({ doc: files[0][0], ...o });
  const fields: Record<string, ExtractField> = {
    title: F({ label: "Project title", value: "Road Paving 2026", conf: "high", para: pTitle, page: pg(pTitle), section: "Document title", passage: "Road Paving 2026", reasoning: "Extracted directly from the document title." }),
    category: F({ label: "Category", value: "Roads", conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: "...the Public Works Department repaves a set of Township-owned roads...", reasoning: "Classified based on document content about road paving." }),
    department: F({ label: "Department", value: "Public Works", conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: "the Collier Township Public Works Department repaves...", reasoning: "Public Works is referenced as the responsible department." }),
    desc: F({
      label: "Description",
      value: "This project paves eight Township road locations across Ewingsville, Nevillewood, Rennerdale, and Beechmont. It focuses on keeping Township roads safe, drivable, and well-maintained over time.",
      conf: "high", para: pOver, page: pg(pOver), section: "Overview & Location",
      passage: "In 2026, eight road locations across Ewingsville, Nevillewood, Rennerdale, and Beechmont have been selected for paving.",
      reasoning: "Synthesized from the overview and location sections.",
      multi: [
        { passage: "eight road locations across Ewingsville, Nevillewood, Rennerdale, and Beechmont", maps: "Sentence 1" },
        { passage: "keep them safe, drivable, and well-maintained over time", maps: "Sentence 2" },
      ],
    }),
    funding: F({ label: "Funding", value: "Paid for through the Township's 2026 annual budget at a total cost of $645,203. The project is under budget this year and requires no tax increase.", conf: "high", para: pFund, page: pg(pFund), section: "Funding", passage: "Paid for by taxpayers through the Township's 2026 annual budget, at a total cost of $645,203.00.", reasoning: "Extracted from the Funding section." }),
    cost: F({ label: "Total cost", value: "$645,203", conf: "high", para: pFund, page: pg(pFund), section: "Funding", passage: "a total cost of $645,203.00", reasoning: "Extracted from the Funding section." }),
    sponsor: F({ label: "Project sponsor", value: "Collier Township Public Works Department", conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: "the Collier Township Public Works Department", reasoning: "Identified as the sponsoring department." }),
    duration: F({ label: "Duration", value: "Jan 2026 – Sep 2026", conf: "low", para: hProc, page: pg(hProc), section: "Process timeline", passage: "discussed at the 2025 and January 2026 meetings ... Final Inspection & Punchlist (September 2026)", reasoning: "Estimated from the earliest (January 2026 discussion) to the latest (September completion) dates across the procedure steps." }),
  };

  const S = (o: Partial<ExtractStage> & Pick<ExtractStage, "title" | "start" | "para" | "section" | "summary" | "passage" | "reasoning">): ExtractStage => ({
    doc: files[0][0], conf: "high", bullets: [], rewritten: false, end: "", page: pg(o.para), ...o,
  });
  const stages: ExtractStage[] = [
    S({ title: "Road Condition Assessment", start: "2024", para: s1, section: "Step 1", summary: "Public Works uses the Roadbotics program to evaluate every Township-owned road and create a condition score from 1 (minimal work needed) to 5 (most in need of work).", bullets: ["All Township roads are video recorded, with re-evaluations at least every 5 years", "Each road receives a 1 to 5 condition score", "Public Works measures how many miles fall into the highest-need category", "Roads most feasible to pave within the year's budget are flagged for review"], passage: "Public Works uses the Roadbotics program to evaluate every Township-owned road and create a condition score from 1–5.", reasoning: "Mapped from Step 1 of the process guide." }),
    S({ title: "Board Approval to Seek Contractors", start: "Late 2025", end: "Jan 2026", para: s2, section: "Step 2", summary: "The Board of Commissioners holds a public vote to approve advertising the upcoming road paving work to qualified contractors.", bullets: ["The vote takes place at a regular Board meeting as a formal agenda item", "Discussions on which roads to pave occurred at the late 2025 and January 2026 meetings", "The Township engineer then prepares the scope-of-work documents"], passage: "The Board of Commissioners holds a public vote to approve advertising the upcoming road paving work...", reasoning: "Mapped from Step 2 of the process guide." }),
    S({ title: "Scope of Work & RFP Preparation", start: "Jan 2026", para: s3, section: "Step 3", summary: "The Township engineer prepares a Request for Proposals that lists the roads, quantities, and specifications contractors must meet.", bullets: ["Roads and quantities are itemized", "Material and workmanship specifications are set"], passage: "The Township engineer prepares a Request for Proposals (RFP)...", reasoning: "Mapped from Step 3 of the process guide." }),
    S({ title: "Advertising to Contractors", start: "Feb 2026", para: s4, section: "Step 4", summary: "The RFP is publicly advertised so qualified paving contractors can submit sealed bids during an open bidding period.", bullets: ["RFP advertised publicly", "Sealed bids accepted during the bidding window"], passage: "The RFP is publicly advertised so qualified paving contractors can submit sealed bids...", reasoning: "Mapped from Step 4 of the process guide." }),
    S({ title: "Public Bid Opening & Contractor Selection", start: "Mar 2026", para: s5, section: "Step 5", conf: "med", rewritten: true, rewriteFrom: "The State of Pennsylvania mandates the selection of the “lowest responsible bidder” (meaning the lowest bid total that promises to meet the RFP specifications within a reasonable timeframe) to avoid collusion of contracts between municipalities and companies.", summary: "After the bidding period closes, the Township engineer holds a public bid opening where all submitted bids are reviewed and the lowest qualified bidder is selected, as required by Pennsylvania state law.", bullets: ["Bids are opened publicly", "The lowest qualified bidder is selected per state law"], passage: "the selection of the “lowest responsible bidder” ... to avoid collusion of contracts...", reasoning: "Rewritten from Step 5 into plain language; involves interpretation, so confidence is medium." }),
    S({ title: "Board Awards Contract", start: "Mar 2026", para: s6, section: "Step 6", summary: "The Board of Commissioners votes at a public meeting to award the contract to the selected contractor.", bullets: ["Award voted at a public Board meeting"], passage: "The Board of Commissioners votes... to award the contract...", reasoning: "Mapped from Step 6 of the process guide." }),
    S({ title: "Pre-Construction & Utility Coordination", start: "Apr 2026", para: s7, section: "Step 7", summary: "Before milling begins, sewer and gas lines are located and cleared, and residents are notified of the schedule for their street.", bullets: ["Sewer and gas lines cleared", "Residents notified of the schedule"], passage: "sewer and gas lines are located and cleared, and residents are notified...", reasoning: "Mapped from Step 7 of the process guide." }),
    S({ title: "Milling", start: "May 2026", end: "Jun 2026", para: s8, section: "Step 8", summary: "The existing worn asphalt surface is ground off (milled) on the scheduled roads to prepare for new paving.", bullets: ["Worn surface milled on scheduled roads"], passage: "The existing worn asphalt surface is ground off (milled)...", reasoning: "Mapped from Step 8 of the process guide." }),
    S({ title: "Paving", start: "Jun 2026", end: "Aug 2026", para: s9, section: "Step 9", conf: "low", summary: "Fresh asphalt is laid and compacted one neighborhood at a time, beginning with the highest-priority roads.", bullets: ["Paving proceeds neighborhood by neighborhood"], passage: "Fresh asphalt is laid and compacted one neighborhood at a time...", reasoning: "The document gives a seasonal window; exact dates are estimated, so confidence is lower." }),
    S({ title: "Line Painting & Restoration", start: "Aug 2026", para: s10, section: "Step 10", summary: "Lane lines and pavement markings are repainted and shoulders restored once the new surface has cured.", bullets: ["Lane lines repainted", "Shoulders restored"], passage: "Lane lines and pavement markings are repainted and shoulders restored...", reasoning: "Mapped from Step 10 of the process guide." }),
    S({ title: "Final Inspection & Punchlist", start: "Sep 2026", para: s11, section: "Step 11", conf: "med", rewritten: true, rewriteFrom: "The engineer performs a final walkthrough and documents any remaining punchlist items the contractor must correct before final payment is released.", summary: "The Township engineer does a final walkthrough and makes a list of any small fixes the contractor must complete before the project is closed out and final payment is made.", bullets: ["Final walkthrough completed", "Remaining fixes documented before final payment"], passage: "documents any remaining punchlist items the contractor must correct before final payment...", reasoning: "Rewrote the term “punchlist” into plain language; confidence medium." }),
  ];
  return assembleExtract(paras, fields, stages, files);
}

/** Build an ExtractData from a SampleSet (non-road samples) */
export function synthExtract(sample: SampleSet, dept: string): ExtractData {
  const files = sample.files;
  const Fd = sample.fields;
  const paras: ExtractPara[] = [];
  const addPara = (page: number, kind: "h1" | "h2" | "p", text: string) => {
    const id = "sp" + paras.length;
    paras.push({ id, page, kind, text });
    return id;
  };
  const pTitle = addPara(1, "h1", Fd.title);
  const pOver = addPara(1, "p", Fd.desc);
  addPara(1, "h2", "Funding");
  const pFund = addPara(1, "p", `Funding: ${Fd.funding}. Estimated total project cost: ${Fd.cost}. Sponsored by the ${Fd.sponsor}.`);
  const hProc = addPara(1, "h2", "Process & Timeline");
  const sp = sample.stages.map((st, i) =>
    addPara(1 + Math.floor(i / 4), "p", `Step ${i + 1} — ${st.title} (${st.start}${st.end ? " – " + st.end : ""}). ${st.summary}`)
  );

  const pg = (id: string) => paras.find((p) => p.id === id)?.page || 1;
  const F = (o: Omit<ExtractField, "doc">): ExtractField => ({ doc: files[0][0], ...o });
  const fields: Record<string, ExtractField> = {
    title: F({ label: "Project title", value: Fd.title, conf: "high", para: pTitle, page: pg(pTitle), section: "Document title", passage: Fd.title, reasoning: "Extracted from the document title." }),
    category: F({ label: "Category", value: Fd.category, conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: Fd.desc, reasoning: "Classified from the document subject matter." }),
    department: F({ label: "Department", value: dept, conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: Fd.desc, reasoning: "Inferred from the responsible department in the document." }),
    desc: F({ label: "Description", value: Fd.desc, conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: Fd.desc, reasoning: "Synthesized from the overview section." }),
    funding: F({ label: "Funding", value: Fd.funding, conf: "high", para: pFund, page: pg(pFund), section: "Funding", passage: `Funding: ${Fd.funding}`, reasoning: "Extracted from the funding section." }),
    cost: F({ label: "Total cost", value: Fd.cost, conf: "med", para: pFund, page: pg(pFund), section: "Funding", passage: `Estimated total project cost: ${Fd.cost}`, reasoning: "Read from the estimate in the funding section." }),
    sponsor: F({ label: "Project sponsor", value: Fd.sponsor, conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: Fd.desc, reasoning: "Identified from the sponsoring department." }),
    duration: F({ label: "Duration", value: Fd.duration, conf: "low", para: hProc, page: pg(hProc), section: "Process timeline", passage: "Derived from the process step dates", reasoning: "Estimated from the earliest and latest dates across the process steps." }),
  };
  const stages: ExtractStage[] = sample.stages.map((a, i) => ({
    doc: files[0][0],
    title: a.title,
    start: a.start,
    end: a.end || "",
    summary: a.summary,
    bullets: [...a.bullets],
    conf: "high",
    rewritten: false,
    para: sp[i],
    page: pg(sp[i]),
    section: `Step ${i + 1}`,
    passage: `Step ${i + 1} — ${a.title}. ${a.summary}`,
    reasoning: `Mapped from process step ${i + 1}.`,
  }));
  return assembleExtract(paras, fields, stages, files);
}

function assembleExtract(
  paras: ExtractPara[],
  fields: Record<string, ExtractField>,
  stages: ExtractStage[],
  files: Array<[string, string]>
): ExtractData {
  const events: ExtractData["events"] = [];
  ["title", "category", "department", "desc", "funding", "cost", "sponsor", "duration"].forEach((k) => {
    if (fields[k]) events.push({ para: fields[k].para, key: k, kind: "field", dur: 1300 });
  });
  stages.forEach((st) => events.push({ para: st.para, kind: "stage", dur: 1700 }));
  return { paras, fields, stages, events, docs: files.map((f) => ({ name: f[0], type: f[1] })) };
}

// ── Stage-level AI upload sample (Board minutes) ─────────────────

export const STAGE_UP_SAMPLE_FILE = { name: "Board Meeting Minutes — Aug 2026.pdf", type: "Meeting minutes" };

export const STAGE_UP_DOC_PARAS: Array<{ text: string; mark?: boolean }> = [
  { text: "Collier Township Board of Commissioners — Regular Meeting Minutes — August 12, 2026" },
  { text: "Item 6 — Contract Award. A motion was made by Commissioner Reyes and seconded by Commissioner Doyle to award the paving contract." },
  { text: "The motion carried by a vote of 5–0.", mark: true },
  { text: "The contract was awarded to the lowest responsible bidder", mark: true },
  { text: "Staff was directed to issue the notice to proceed to the contractor, with work to begin August 2026.", mark: true },
  { text: "Item 7 — Public Comment. Two residents spoke in support of the project timeline. The meeting was adjourned at 8:14 PM." },
];

export const STAGE_UP_RESULT = {
  title: "Board Vote & Contract Award",
  datesLabel: "August 2026",
  start: "Aug 2026",
  end: "",
  summary:
    "The Board of Commissioners voted to approve the contract award at the August public meeting, clearing the way for work to begin.",
  bullets: [
    "Motion carried by a 5–0 vote",
    "Contract awarded to the lowest responsible bidder",
    "Notice to proceed issued to the contractor",
  ],
};
