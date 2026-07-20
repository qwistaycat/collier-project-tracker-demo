"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProjectMapCard from "@/app/components/ProjectMapCard";
import Timeline from "@/app/components/Timeline";
import Discussion from "@/app/components/Discussion";
import VoteBanner from "@/app/components/VoteBanner";

// ── Types & Constants (Ported from Collier Connect Staff Mockups) ──
interface Comment {
  id: string;
  name: string;
  verified: boolean;
  anon: boolean;
  text: string;
  sent: "green" | "amber" | "red";
  time: string;
  replies: Array<{ dept: string; text: string; time: string; name?: string; attr?: string; edited?: boolean }>;
  flag: string | null;
}

interface Stage {
  n: number;
  title: string;
  dates: string;
  desc: string;
  bullets: string[];
  state: "Published" | "Draft" | "Hidden";
  ongoing?: boolean;
  start?: string;
  end?: string;
  dateMode?: "month" | "specific";
  aiFilled?: string[];
  ai?: boolean;
}

interface Project {
  id: string;
  title: string;
  cat: "Roads" | "Parks" | "Infrastructure" | "Plan/Dev" | "Public Safety";
  deptShort: string;
  dept: string;
  status: string;
  cost: string;
  funding: string;
  edited: string;
  followers: number;
  current: number;
  desc: string;
  sponsor: string;
  duration: string;
  stages: Stage[];
  poll: {
    support: number;
    oppose: number;
    neutral: number;
    verified: { s: number; o: number; n: number };
    trend: number[];
  };
  sentiment: { supportive: number; mixed: number; concerns: number };
  themes: Array<{ name: string; count: number; sent: "supportive" | "mixed" | "concerns"; quote: string }>;
  privateMsgs: Comment[];
  public: Comment[];
  hidden: Comment[];
  rejected: Comment[];
  deletedC?: Comment[];
  lc: "published" | "draft" | "pending" | "completed" | "archived" | "trash";
  submittedBy?: string;
  submittedDept?: string;
  submittedDate?: string;
  reviewer?: string;
  urgency?: "Low" | "Standard" | "High";
  srNote?: string;
  prevPublishedDate?: string;
  prevPublishedBy?: string;
  completedDate?: string;
  reopenedDate?: string;
  reopenedBy?: string;
  spotlight?: {
    reason: string;
    msg: string;
    end: string;
    priority: "Standard" | "High";
    by: string;
    cta?: string;
  } | null;
  neighborhoods?: string;
  reviewFeedback?: {
    by: string;
    note: string;
    type: "reject" | "changes";
  };
  docs?: Array<{ name: string; size?: string }>;
}

const DEPARTMENTS = [
  "Manager's Office",
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

const THEME_MAP: Record<string, string> = {
  "road-paving": "Residents are frustrated by confusing detour signage near the elementary school, though many appreciate the clear stage-by-stage schedule updates.",
  hilltop: "Enthusiasm for the new playground runs high, but neighbors on adjacent streets stay worried about parking capacity and weekend traffic spillover.",
  "digital-services": "Residents welcome the more accessible, mobile-friendly site, though several report trouble logging in and want the older meeting-minutes archive preserved.",
  nevillewood: "Opinion is split on the proposed speed bumps — some welcome slower cut-through traffic while others worry about vehicle damage and slower emergency response.",
  "fire-station": "Support for modernizing the station is broad, but residents keep asking how much the pending bond issue will add to their property taxes.",
  "mixed-use": "Opposition centers on the density of 24 units and its traffic impact on the village intersection, though some residents welcome more walkable local retail.",
};

const INITIAL_PROJECTS: Project[] = [
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
      { n: 1, title: "Planning & Survey", dates: "Mar – Apr", desc: "Roads assessed and prioritized by pavement condition index.", bullets: ["Condition survey of 42 segments", "Priority list finalized"], state: "Published" },
      { n: 2, title: "Budget Approval", dates: "Apr – May", desc: "Board approves the paving budget and scope.", bullets: ["$645,203 approved", "Liquid Fuels allocation confirmed"], state: "Published" },
      { n: 3, title: "Bid & Award", dates: "May – Jun", desc: "RFP issued and contractor selected.", bullets: ["3 bids received", "Awarded to Youngblood Paving"], state: "Published" },
      { n: 4, title: "Utility Coordination", dates: "Jun – Jun", desc: "Coordinate with sewer and gas before milling.", bullets: ["Sewer clearances obtained"], state: "Published" },
      { n: 5, title: "Milling", dates: "Jul – Aug", desc: "Existing surface milled on scheduled roads.", bullets: ["Neighborhoods A–C complete"], state: "Published" },
      { n: 6, title: "Paving — Phase 1", dates: "Aug – Sep", desc: "Active resurfacing underway in Nevillewood.", bullets: ["Hilltop Rd repaved", "Paving crews on Orchard Dr"], state: "Published" },
      { n: 7, title: "Paving — Phase 2", dates: "Sep – Oct", desc: "Remaining neighborhoods resurfaced.", bullets: ["Scheduled: Presto, Cook School Rd"], state: "Published" },
      { n: 8, title: "Line Painting & Restoration", dates: "Oct – Nov", desc: "Line striping and shoulder restoration.", bullets: ["Pending Phase 2"], state: "Published" }
    ],
    poll: { support: 118, oppose: 34, neutral: 22, verified: { s: 92, o: 18, n: 12 }, trend: [40, 62, 95, 120, 138, 152, 168, 174] },
    sentiment: { supportive: 58, mixed: 27, concerns: 15 },
    themes: [
      { name: "Traffic detour confusion", count: 14, sent: "concerns", quote: "The detour signs on Orchard sent me in a circle for 20 minutes." },
      { name: "Appreciation for updates", count: 11, sent: "supportive", quote: "Love that I can see exactly which street is next." },
      { name: "Driveway access timing", count: 8, sent: "mixed", quote: "Can we get more notice before our driveway is blocked?" }
    ],
    privateMsgs: [
      { id: "pm1", name: "Diane Kessler", verified: true, anon: false, text: "Our cul-de-sac on Fawn Court was skipped last cycle — is it in this year's scope? It's badly cracked.", sent: "amber", time: "2h", replies: [], flag: null },
      { id: "pm2", name: "Marcus Webb", verified: true, anon: false, text: "Thank you for the clear schedule. Makes planning my commute so much easier.", sent: "green", time: "1d", replies: [{ dept: "Public Works", text: "Thanks Marcus — glad it helps. Phase 1 wraps next week.", time: "22h" }], flag: null }
    ],
    public: [
      { id: "c1", name: "NevillewoodMom", verified: true, anon: false, text: "Will Hilltop Rd be done before school starts? Buses use it every morning.", sent: "amber", time: "3h", replies: [], flag: null },
      { id: "c2", name: "Anonymous", verified: false, anon: true, text: "Finally! This road has needed paving for years. Thank you Public Works.", sent: "green", time: "5h", replies: [{ dept: "Public Works", text: "Appreciate it — Hilltop is in Phase 1, wrapping this week.", time: "4h" }], flag: null },
      { id: "c3", name: "R. Callahan", verified: true, anon: false, text: "Concerned about the detour routing near the elementary school during dropoff.", sent: "red", time: "8h", replies: [], flag: null },
      { id: "c4", name: "GregT", verified: false, anon: false, text: "How long will my street be closed for milling?", sent: "amber", time: "1d", replies: [], flag: null }
    ],
    hidden: [
      { id: "h1", name: "user8842", verified: false, anon: false, text: "this is a total waste of my tax dollars you people are clueless", sent: "red", time: "6h", replies: [], flag: "Contains language flagged as inappropriate" },
      { id: "h2", name: "spammybot", verified: false, anon: false, text: "CHEAP DRIVEWAY SEALING visit my site now!!! link in bio", sent: "red", time: "9h", replies: [], flag: "Possible spam" },
      { id: "h3", name: "JoeK", verified: false, anon: false, text: "anyone know when the fireworks are this year", sent: "amber", time: "12h", replies: [], flag: "Off-topic" }
    ],
    rejected: [],
    lc: "published",
    neighborhoods: "Nevillewood, Presto, Collier Center",
    spotlight: {
      reason: "Public feedback needed",
      msg: "Public comment period is open through Aug 1. Share your input on this year's paving schedule.",
      end: "Aug 1, 2026",
      priority: "High",
      by: "Amy Medway",
      cta: "Share Your Input"
    }
  },
  {
    id: "hilltop",
    title: "Hilltop Park Expansion",
    cat: "Parks",
    deptShort: "Parks & Rec",
    dept: "Parks & Recreation",
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
      { n: 1, title: "Community Input", dates: "Jan – Feb", desc: "Resident surveys and public meetings shape the design.", bullets: ["312 survey responses", "2 public meetings held"], state: "Published" },
      { n: 2, title: "Design & Engineering", dates: "Feb – Apr", desc: "Landscape architects finalize plans.", bullets: ["Concept approved", "Trail alignment set"], state: "Published" },
      { n: 3, title: "Grant & Permitting", dates: "Apr – Jun", desc: "DCNR grant finalized and permits secured.", bullets: ["Grant awarded", "Stormwater permit under review"], state: "Published" },
      { n: 4, title: "Construction", dates: "Jun – Oct", desc: "Playground, trail, and parking built.", bullets: ["Not started"], state: "Draft" },
      { n: 5, title: "Opening", dates: "Nov – Dec", desc: "Ribbon cutting and community celebration.", bullets: ["Planned"], state: "Draft" }
    ],
    poll: { support: 201, oppose: 58, neutral: 30, verified: { s: 160, o: 31, n: 18 }, trend: [60, 110, 160, 200, 240, 255, 270, 289] },
    sentiment: { supportive: 64, mixed: 22, concerns: 14 },
    themes: [
      { name: "Parking capacity concerns", count: 19, sent: "concerns", quote: "More parking will just bring more traffic to our quiet street." },
      { name: "Excitement for playground", count: 23, sent: "supportive", quote: "My kids cannot wait for the new playground!" },
      { name: "Trail lighting & safety", count: 9, sent: "mixed", quote: "Will the trail be lit for evening walks?" }
    ],
    privateMsgs: [
      { id: "pm1", name: "Ellen Brooks", verified: true, anon: false, text: "We live directly behind the proposed parking lot. Concerned about headlights into our bedroom windows at night. Any buffer planned?", sent: "red", time: "1h", replies: [], flag: null }
    ],
    public: [
      { id: "c1", name: "ParkLover22", verified: true, anon: false, text: "This is exactly what our community needs. Thank you for listening to the surveys!", sent: "green", time: "2h", replies: [], flag: null },
      { id: "c2", name: "QuietStreetDad", verified: true, anon: false, text: "The expanded parking is going to ruin the character of Woodland Ave. Please reconsider.", sent: "red", time: "4h", replies: [], flag: null }
    ],
    hidden: [],
    rejected: [],
    lc: "published",
    neighborhoods: "Woodland Avenue, Hilltop area",
    spotlight: {
      reason: "Upcoming meeting",
      msg: "Public hearing on the parking plan is July 22 at 7pm. Learn more and prepare to speak.",
      end: "Jul 22, 2026",
      priority: "Standard",
      by: "Amy Medway",
      cta: "View Meeting Info"
    }
  },
  {
    id: "nevillewood",
    title: "Nevillewood Traffic Management Plan",
    cat: "Roads",
    deptShort: "Planning",
    dept: "Planning, Zoning, & Land Development",
    status: "Active",
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
      { n: 4, title: "Implementation", dates: "Jul – Aug", desc: "Selected measures installed.", bullets: ["Pending"], state: "Draft" }
    ],
    poll: { support: 44, oppose: 38, neutral: 19, verified: { s: 31, o: 24, n: 11 }, trend: [20, 35, 52, 68, 79, 88, 95, 101] },
    sentiment: { supportive: 41, mixed: 31, concerns: 28 },
    themes: [
      { name: "Speed bump opposition", count: 12, sent: "concerns", quote: "Speed bumps will damage my car and slow emergency vehicles." },
      { name: "Support for calming", count: 10, sent: "supportive", quote: "Finally something to slow the cut-through traffic." }
    ],
    privateMsgs: [],
    public: [
      { id: "c1", name: "SafeStreetsNow", verified: true, anon: false, text: "We need this. Cars fly down our road at 45mph.", sent: "green", time: "5h", replies: [], flag: null }
    ],
    hidden: [],
    rejected: [],
    lc: "published"
  },
  {
    id: "fire-station",
    title: "Fire Station Upgrades — Presto",
    cat: "Public Safety",
    deptShort: "EMS & Fire",
    dept: "EMS & Fire Services",
    status: "Planning",
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
      { n: 3, title: "Design", dates: "Jun – Sep", desc: "Architectural design.", bullets: ["Pending funding"], state: "Published" }
    ],
    poll: { support: 88, oppose: 42, neutral: 26, verified: { s: 70, o: 30, n: 15 }, trend: [30, 50, 72, 90, 108, 124, 140, 156] },
    sentiment: { supportive: 55, mixed: 25, concerns: 20 },
    themes: [
      { name: "Tax impact worry", count: 15, sent: "concerns", quote: "How much will this bond add to my property taxes?" }
    ],
    privateMsgs: [],
    public: [
      { id: "c1", name: "Anonymous", verified: false, anon: true, text: "Our firefighters deserve a modern station. I support the bond.", sent: "green", time: "1d", replies: [], flag: null }
    ],
    hidden: [],
    rejected: [],
    lc: "pending",
    submittedBy: "Bob Caun",
    submittedDept: "Public Works",
    submittedDate: "2 days ago",
    reviewer: "Amy Medway",
    urgency: "Standard",
    srNote: "Ready for review ahead of the April bond vote. Cost estimate attached."
  },
  {
    id: "mixed-use",
    title: "Small-Scale Mixed-Use Development",
    cat: "Plan/Dev",
    deptShort: "Planning",
    dept: "Planning, Zoning, & Land Development",
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
      { n: 4, title: "Decision", dates: "Jul – Jul", desc: "Commission votes.", bullets: [], state: "Draft" },
      { n: 5, title: "Conditions", dates: "Aug – Sep", desc: "Conditions of approval.", bullets: [], state: "Draft" }
    ],
    poll: { support: 61, oppose: 94, neutral: 28, verified: { s: 44, o: 71, n: 16 }, trend: [30, 55, 80, 102, 120, 140, 160, 183] },
    sentiment: { supportive: 33, mixed: 24, concerns: 43 },
    themes: [
      { name: "Density & traffic", count: 28, sent: "concerns", quote: "24 units will overwhelm our already-congested village intersection." },
      { name: "Support for local retail", count: 14, sent: "supportive", quote: "We need more walkable shops in the village." }
    ],
    privateMsgs: [
      { id: "pm1", name: "Harold Simms", verified: true, anon: false, text: "This density is completely out of character for the village. I urge the commission to deny.", sent: "red", time: "4h", replies: [], flag: null }
    ],
    public: [
      { id: "c1", name: "VillageResident", verified: true, anon: false, text: "Please protect our small-town character. This is too much.", sent: "red", time: "6h", replies: [], flag: null },
      { id: "c2", name: "WalkableFan", verified: false, anon: false, text: "I would love a coffee shop within walking distance. Support!", sent: "green", time: "1d", replies: [], flag: null }
    ],
    hidden: [
      { id: "h1", name: "nimby99", verified: false, anon: false, text: "the developer is obviously paying off the commission, corrupt", sent: "red", time: "7h", replies: [], flag: "Unsubstantiated claim flagged for review" }
    ],
    rejected: [],
    lc: "pending",
    submittedBy: "Kris Delano",
    submittedDept: "Planning",
    submittedDate: "6 hours ago",
    reviewer: "George Macino",
    urgency: "High",
    srNote: "Sensitive project — please review the comment moderation setting before publishing."
  },
  {
    id: "new-development",
    title: "New Development Review",
    cat: "Plan/Dev",
    deptShort: "Planning",
    dept: "Planning, Zoning, & Land Development",
    status: "Active",
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
      { n: 4, title: "Decisions", dates: "—", desc: "Rolling decisions.", bullets: [], state: "Draft" }
    ],
    poll: { support: 22, oppose: 19, neutral: 15, verified: { s: 16, o: 12, n: 9 }, trend: [8, 15, 22, 28, 34, 40, 46, 56] },
    sentiment: { supportive: 40, mixed: 33, concerns: 27 },
    themes: [],
    privateMsgs: [],
    public: [
      { id: "c1", name: "Anonymous", verified: false, anon: true, text: "Where can I see the full subdivision plans?", sent: "amber", time: "2d", replies: [], flag: null }
    ],
    hidden: [],
    rejected: [],
    lc: "draft"
  }
];

interface StaffSidebarProps {
  currentProposalId: string;
  activeProject: Project;
  projects: Project[];
  openProj: (id: string) => void;
}

function StaffSidebar({ currentProposalId, activeProject, projects, openProj }: StaffSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>(activeProject.cat);

  const toggleCategory = (cat: string) => {
    setOpenCategory((prev) => (prev === cat ? null : cat));
  };

  const categories = ["Roads", "Parks", "Infrastructure", "Plan/Dev", "Public Safety"];
  const catLabels: Record<string, string> = {
    Roads: "Roads & Transportation",
    Parks: "Parks & Green Spaces",
    Infrastructure: "Infrastructure & Facilities",
    "Plan/Dev": "Plan, Development & Sustainability",
    "Public Safety": "Public Safety"
  };

  return (
    <>
      <aside
        style={{
          width: isOpen ? 288 : 0,
          flexShrink: 0,
          background: "#f3f4f6",
          borderRight: "1px solid #e5e7eb",
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 58,
          height: "calc(100vh - 58px)",
          transition: "width 0.25s ease",
        }}
      >
        <div style={{ width: 288, display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "14px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Projects Navigation
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold bg-transparent border-none cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
            {categories.map((cat) => {
              const isExpanded = openCategory === cat;
              const catProposals = projects.filter((p) => p.cat === cat);
              const showIndicator = activeProject.cat === cat;

              return (
                <div key={cat}>
                  <button
                    onClick={() => toggleCategory(cat)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px 10px",
                      border: "none",
                      borderLeft: showIndicator ? "3px solid #2563eb" : "3px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      backgroundColor: isExpanded ? "#e8eaed" : "#f3f4f6",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <span className="font-sans text-xs font-bold uppercase tracking-wider text-gray-900">
                      {catLabels[cat] || cat}
                    </span>
                    <span className="text-gray-400 font-semibold text-xs">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col gap-1.5 p-3 bg-slate-50">
                      {catProposals.map((p) => {
                        const isCurrent = p.id === currentProposalId;
                        return (
                          <div
                            key={p.id}
                            onClick={() => openProj(p.id)}
                            className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                              isCurrent
                                ? "bg-white border-[#2563eb] text-[#2563eb] font-semibold"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <div className="font-semibold truncate">{p.title}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{p.status}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "absolute",
            left: 10,
            top: 270,
            zIndex: 45,
            width: 32,
            height: 32,
            borderRadius: "0 8px 8px 0",
            backgroundColor: "#1e3a5f",
            color: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          }}
        >
          ▶
        </button>
      )}
    </>
  );
}

interface StaffProjectCardProps {
  p: Project;
  toggleSpotlight: (id: string) => void;
  openProj: (id: string) => void;
}

function StaffProjectCard({ p, toggleSpotlight, openProj }: StaffProjectCardProps) {
  const [hovered, setHovered] = useState(false);

  const getProjectImage = (id: string) => {
    const seed = id.replace("-2026", "").replace("-presto", "").replace("-rennerdale", "");
    return `https://picsum.photos/seed/${seed}/600/340`;
  };

  const mapCatName = (cat: string) => {
    return {
      Roads: "Roads & Transportation",
      Parks: "Parks & Green Spaces",
      Infrastructure: "Infrastructure & Facilities",
      "Plan/Dev": "Plan, Development & Sustainability",
      "Public Safety": "Public Safety"
    }[cat] || cat;
  };

  return (
    <div
      onClick={() => openProj(p.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative bg-white border rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-150 cursor-pointer ${
        hovered ? "border-[#2563eb] shadow-md" : "border-[#e5e7eb] shadow-xs"
      }`}
    >
      <div>
        {/* Image Area */}
        <div className="relative w-full h-[160px] bg-[#f3f4f6] overflow-hidden">
          <img
            src={getProjectImage(p.id)}
            alt={p.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              hovered ? "scale-105" : "scale-100"
            }`}
          />
          {/* Hover overlay – dims only the photo area */}
          {hovered && (
            <div className="absolute inset-0 bg-[#0d2240]/55 flex items-center justify-center p-3 transition-opacity duration-150">
              <span className="text-white text-xs font-medium tracking-wide opacity-80 text-center font-sans">
                Manage Project Details
              </span>
            </div>
          )}
        </div>

        {/* Body content */}
        <div className="p-[14px]">
          {/* Meta row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5 font-sans">
            <span className="text-[11px] font-semibold text-[#2563eb]">
              {mapCatName(p.cat)}
            </span>
            <span className="text-[11px] text-[#9ca3af]">·</span>
            <span className="text-[11px] font-medium text-[#6b7280] truncate max-w-[120px]" title={p.dept}>
              {p.deptShort}
            </span>
            <span className="text-[11px] text-[#9ca3af]">·</span>
            <span className="text-[11px] text-[#9ca3af]">
              Updated {p.edited}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-semibold text-[#111827] line-clamp-2 leading-5 mb-1.5 font-sans">
            {p.title}
          </h3>

          {/* Description */}
          <p className="text-[13px] text-[#6b7280] line-clamp-2 leading-[18px] mb-1 font-sans">
            {p.desc}
          </p>
        </div>
      </div>

      {/* Staff Actions Footer */}
      <div className="border-t border-[#e5e7eb] bg-[#f8fafc] px-[14px] py-2.5 flex justify-between items-center gap-2 mt-auto">
        <div className="flex flex-col gap-0.5">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-max ${
            p.lc === "published"
              ? "bg-[#DCFCE7] text-[#16A34A]"
              : p.lc === "pending"
              ? "bg-[#FEF3C7] text-[#D97706]"
              : p.lc === "completed"
              ? "bg-[#DBEAFE] text-[#1D4ED8]"
              : "bg-slate-100 text-slate-800"
          }`}>
            {p.lc === "published" ? "Published" : p.lc === "pending" ? "Pending Approval" : p.lc === "completed" ? "Completed" : "Draft"}
          </span>
          <span className="text-[10px] text-[#94a3b8] font-medium font-sans">
            {p.followers} followers · {p.public.length + p.privateMsgs.length} comments
          </span>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSpotlight(p.id);
            }}
            className={`h-7 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              p.spotlight
                ? "bg-[#2563eb] text-white border-[#2563eb] hover:bg-blue-700"
                : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-slate-50"
            }`}
          >
            ★ {p.spotlight ? "Featured" : "Feature"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openProj(p.id);
            }}
            className="h-7 px-2.5 bg-[#1e3a5f] hover:bg-[#152a45] text-white rounded-lg text-xs font-semibold cursor-pointer border-none"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StaffPortal() {
  const [screen, setScreen] = useState<string>("login");
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [aiMode, setAiMode] = useState<boolean>(false);
  const [dept, setDept] = useState<string>("Manager's Office");
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [deptSwitchOpen, setDeptSwitchOpen] = useState<boolean>(false);
  
  // Gallery filters
  const [catFilter, setCatFilter] = useState<string>("All");
  const [galStatus, setGalStatus] = useState<string[]>(["All"]);
  const [spotlightOnly, setSpotlightOnly] = useState<boolean>(false);

  // Active Project Detail
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projTab, setProjTab] = useState<string>("details");
  const [detailTab, setDetailTab] = useState<string>("public");
  const [selStage, setSelStage] = useState<number>(1);
  const [editing, setEditing] = useState<boolean>(false);
  const [editAll, setEditAll] = useState<boolean>(false);
  const [following, setFollowing] = useState<boolean>(false);
  const [hovering, setHovering] = useState<boolean>(false);
  
  // Modals & temporary states
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string }>>([]);
  const [replyFor, setReplyFor] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [replyAttr, setReplyAttr] = useState<string>("name");
  
  // Insights filters
  const [sentTime, setSentTime] = useState<string>("all");
  const [sentScope, setSentScope] = useState<string>("all");
  const [sentStatus, setSentStatus] = useState<string>("all");
  const [sentSort, setSentSort] = useState<string>("comments");
  const [sentSortDir, setSentSortDir] = useState<"asc" | "desc">("desc");

  // Reports
  const [rptWelcome, setRptWelcome] = useState<boolean>(true);
  const [rptTab, setRptTab] = useState<string>("search");
  const [rptQuery, setRptQuery] = useState<string>("");
  const [rptCat, setRptCat] = useState<string>("All");
  const [rptType, setRptType] = useState<string>("All");
  const discussionRef = useRef<HTMLDivElement>(null);

  // Project creation wizard states
  const [createStep, setCreateStep] = useState<number>(0);
  const [createFiles, setCreateFiles] = useState<Array<{ name: string; type: string }>>([]);
  const [createCtx, setCreateCtx] = useState<string>("");
  const [ctxOpen, setCtxOpen] = useState<boolean>(false);
  const [parseBusy, setParseBusy] = useState<boolean>(false);
  const [extProgressText, setExtProgressText] = useState<string>("Initializing AI model...");
  const [extPct, setExtPct] = useState<number>(0);
  const [extTitle, setExtTitle] = useState<string>("Analyzing documents...");
  const [extReadLabel, setExtReadLabel] = useState<string>("Scanning text blocks...");
  const [extRunning, setExtRunning] = useState<boolean>(false);
  const [extDone, setExtDone] = useState<boolean>(false);
  const [extConfetti, setExtConfetti] = useState<boolean>(false);
  const [confettiBits, setConfettiBits] = useState<Array<{ style: React.CSSProperties }>>([]);
  
  // progressive extraction variables
  const [revealedFields, setRevealedFields] = useState<string[]>([]);
  const [extractedStagesCount, setExtractedStagesCount] = useState<number>(0);
  const [activeParaGlow, setActiveParaGlow] = useState<string | null>(null);

  const [createFields, setCreateFields] = useState<{
    title: string;
    category: string;
    desc: string;
    funding: string;
    cost: string;
    sponsor: string;
    duration: string;
  }>({
    title: "",
    category: "Roads",
    desc: "",
    funding: "",
    cost: "",
    sponsor: "",
    duration: "",
  });

  interface CreateStage {
    n: number;
    title: string;
    start: string;
    end: string;
    singleDate: boolean;
    summary: string;
    bullets: string[];
    status: "draft" | "published" | "hidden";
    docs: Array<{ name: string; size: string }>;
    docsOpen: boolean;
    ai: boolean;
    rewritten?: boolean;
    rewriteFrom?: string;
  }

  const [createStages, setCreateStages] = useState<CreateStage[]>([]);
  const [sourceDocs, setSourceDocs] = useState<Array<{ name: string; type: string }>>([]);
  const [sourceView, setSourceView] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewStage, setPreviewStage] = useState<number>(0);
  const [stageErrors, setStageErrors] = useState<Record<number, string>>({});
  const [templateMenuOpen, setTemplateMenuOpen] = useState<boolean>(false);
  
  const [compliance, setCompliance] = useState({
    rtk: false,
    mgr: false,
    acc: false,
  });
  
  const [publishConfirm, setPublishConfirm] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<{ title: string; id: string } | null>(null);
  const [activeExtData, setActiveExtData] = useState<any>(null);
  const [extractTimerId, setExtractTimerId] = useState<any>(null);
  const [exProgressMsgs, setExProgressMsgs] = useState<string[]>([
    "Reading PDF structures...",
    "Correlating meeting transcripts...",
    "Resolving engineering schedule blocks...",
    "Structuring capital timeline milestones...",
    "Applying plain-language translations...",
    "Finalizing document extraction draft..."
  ]);

  const showToast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((item) => item.id !== id)), 2600);
  };

  const activeProject = projects.find((p) => p.id === activeId) || projects[0];

  useEffect(() => {
    if (activeId) {
      const list = JSON.parse(localStorage.getItem("collier_followed") || "[]");
      setFollowing(list.includes(activeId));
    }
  }, [activeId]);

  const toggleFollow = () => {
    const list = JSON.parse(localStorage.getItem("collier_followed") || "[]");
    const idx = list.indexOf(activeProject.id);
    const next = !following;
    if (next && idx === -1) list.push(activeProject.id);
    if (!next && idx !== -1) list.splice(idx, 1);
    localStorage.setItem("collier_followed", JSON.stringify(list));
    setFollowing(next);
    showToast(next ? "Following project" : "Unfollowed project");
  };

  const getProjectImage = (id: string) => {
    const seed = id.replace("-2026", "").replace("-presto", "").replace("-rennerdale", "");
    return `https://picsum.photos/seed/${seed}/600/340`;
  };

  // AI Assistance triggers
  const toggleAiMode = () => {
    setAiMode(!aiMode);
    showToast(`AI Assistance ${!aiMode ? "ON" : "OFF"}`);
  };

  // Switch tabs
  const handleNav = (targetScreen: string) => {
    setScreen(targetScreen);
    setProfileOpen(false);
  };

  // Department switch
  const selectDept = (d: string) => {
    setDept(d);
    setDeptSwitchOpen(false);
    showToast(`Now posting as ${d}`);
  };

  const handleLogin = () => {
    setScreen("projects");
    showToast("Signed in as Amy Medway");
  };

  // Project interactions
  const openProj = (id: string, initialTab = "details") => {
    setActiveId(id);
    const P = projects.find((p) => p.id === id);
    if (P) {
      setSelStage(P.current || 1);
    }
    setProjTab(initialTab);
    setScreen("detail");
  };

  // Reply handlers
  const openReplyModal = (c: Comment) => {
    setReplyFor(c);
    setReplyText("");
    setReplyAttr("name");
  };

  const submitReply = () => {
    if (!replyText.trim() || !activeId || !replyFor) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeId) return p;
        const replyItem = {
          dept: dept,
          text: replyText,
          time: "just now",
          name: replyAttr === "name" ? "Amy Medway" : undefined,
          attr: replyAttr,
        };
        const updateComment = (cList: Comment[]) =>
          cList.map((c) => (c.id === replyFor.id ? { ...c, replies: [...c.replies, replyItem] } : c));
        return {
          ...p,
          public: updateComment(p.public),
          privateMsgs: updateComment(p.privateMsgs),
          hidden: updateComment(p.hidden),
        };
      })
    );
    showToast("Reply posted successfully");
    setReplyFor(null);
  };

  // Approve/Reject Moderation
  const approveComment = (comment: Comment) => {
    if (!activeId) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeId) return p;
        return {
          ...p,
          hidden: p.hidden.filter((c) => c.id !== comment.id),
          public: [...p.public, { ...comment, flag: null }],
        };
      })
    );
    showToast("Comment approved and published");
  };

  const rejectComment = (comment: Comment) => {
    if (!activeId) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeId) return p;
        return {
          ...p,
          hidden: p.hidden.filter((c) => c.id !== comment.id),
          rejected: [...p.rejected, comment],
        };
      })
    );
    showToast("Comment rejected");
  };

  // Approve Pending Review project
  const approveProject = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, lc: "published", status: "Active" };
      })
    );
    showToast("Project approved and published live");
    setScreen("projects");
  };

  // Toggle Spotlight
  const toggleSpotlight = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.spotlight) {
          showToast("Spotlight removed");
          return { ...p, spotlight: null };
        } else {
          showToast("Project spotlighted for residents");
          return {
            ...p,
            spotlight: {
              reason: "Important announcement",
              msg: "Key milestones updated. Read the latest progress report.",
              end: "Aug 15, 2026",
              priority: "Standard",
              by: "Amy Medway",
              cta: "Learn More",
            },
          };
        }
      })
    );
  };

  // AI plain language rewrite simulation
  const simulateRewrite = (text: string, callback: (rewritten: string) => void) => {
    showToast("Generating AI suggestion...");
    setTimeout(() => {
      const rewritten = text.replace(/Liquid Fuels|PennDOT/gi, "state road funding") + " (rewritten for clarity)";
      callback(rewritten);
      showToast("AI suggestion applied");
    }, 1000);
  };



  // AI Document Extraction simulation routines
  const roadExtract = () => {
    const files = [
      ["Road Paving 2026 — Process & Location Guide.pdf", "Process guide"],
      ["Road Paving 2026 — Board Meeting Minutes.pdf", "Meeting minutes"],
      ["Roadbotics Assessment 2024.pdf", "Assessment"],
      ["Contractor Bid Summary — March 2026.pdf", "Budget document"],
    ];
    const paras: Array<{ id: string; page: number; kind: string; text: string }> = [];
    const addPara = (page: number, kind: string, text: string) => {
      const id = "rp" + paras.length;
      paras.push({ id, page, kind, text });
      return id;
    };
    const pTitle = addPara(1, "h1", "Road Paving 2026");
    const pOver = addPara(1, "p", "Each year the Collier Township Public Works Department repaves a set of Township-owned roads to keep them safe, drivable, and well-maintained over time. In 2026, eight road locations across Ewingsville, Nevillewood, Rennerdale, and Beechmont have been selected for paving.");
    addPara(1, "h2", "Funding");
    const pFund = addPara(1, "p", "Paid for by taxpayers through the Township’s 2026 annual budget, at a total cost of $645,203.00. The project is under budget this year and requires no tax increase.");
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
    const F = (o: any) => Object.assign({ doc: files[0][0] }, o);
    const fields = {
      title: F({ label: "Project title", value: "Road Paving 2026", conf: "high", para: pTitle, page: pg(pTitle), section: "Document title", passage: "Road Paving 2026", reasoning: "Extracted directly from the document title." }),
      category: F({ label: "Category", value: "Roads", conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: "...the Public Works Department repaves a set of Township-owned roads...", reasoning: "Classified based on document content about road paving." }),
      department: F({ label: "Department", value: "Public Works", conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: "the Collier Township Public Works Department repaves...", reasoning: "Public Works is referenced as the responsible department." }),
      desc: F({ label: "Description", value: "This project paves eight Township road locations across Ewingsville, Nevillewood, Rennerdale, and Beechmont. It focuses on keeping Township roads safe, drivable, and well-maintained over time.", conf: "high", para: pOver, page: pg(pOver), section: "Overview & Location", passage: "In 2026, eight road locations across Ewingsville, Nevillewood, Rennerdale, and Beechmont have been selected for paving.", reasoning: "Synthesized from the overview and location sections.", multi: [{ passage: "eight road locations across Ewingsville, Nevillewood, Rennerdale, and Beechmont", maps: "Sentence 1" }, { passage: "keep them safe, drivable, and well-maintained over time", maps: "Sentence 2" }] }),
      funding: F({ label: "Funding", value: "Paid for through the Township’s 2026 annual budget at a total cost of $645,203. The project is under budget this year and requires no tax increase.", conf: "high", para: pFund, page: pg(pFund), section: "Funding", passage: "Paid for by taxpayers through the Township’s 2026 annual budget, at a total cost of $645,203.00.", reasoning: "Extracted from the Funding section." }),
      cost: F({ label: "Total cost", value: "$645,203", conf: "high", para: pFund, page: pg(pFund), section: "Funding", passage: "a total cost of $645,203.00", reasoning: "Extracted from the Funding section." }),
      sponsor: F({ label: "Project sponsor", value: "Collier Township Public Works Department", conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: "the Collier Township Public Works Department", reasoning: "Identified as the sponsoring department." }),
      duration: F({ label: "Duration", value: "Jan 2026 – Sep 2026", conf: "low", para: hProc, page: pg(hProc), section: "Process timeline", passage: "discussed at the 2025 and January 2026 meetings ... Final Inspection & Punchlist (September 2026)", reasoning: "Estimated from the earliest (January 2026 discussion) to the latest (September completion) dates across the procedure steps." })
    };

    const S = (o: any) => Object.assign({ doc: files[0][0], conf: "high", bullets: [], rewritten: false }, o);
    const stages = [
      S({ title: "Road Condition Assessment", start: "2024", end: "", para: s1, page: pg(s1), section: "Step 1", summary: "Public Works uses the Roadbotics program to evaluate every Township-owned road and create a condition score from 1 (minimal work needed) to 5 (most in need of work).", bullets: ["All Township roads are video recorded, with re-evaluations at least every 5 years", "Each road receives a 1 to 5 condition score", "Public Works measures how many miles fall into the highest-need category", "Roads most feasible to pave within the year’s budget are flagged for review"], passage: "Public Works uses the Roadbotics program to evaluate every Township-owned road and create a condition score from 1–5.", reasoning: "Mapped from Step 1 of the process guide." }),
      S({ title: "Board Approval to Seek Contractors", start: "Late 2025", end: "Jan 2026", para: s2, page: pg(s2), section: "Step 2", summary: "The Board of Commissioners holds a public vote to approve advertising the upcoming road paving work to qualified contractors.", bullets: ["The vote takes place at a regular Board meeting as a formal agenda item", "Discussions on which roads to pave occurred at the late 2025 and January 2026 meetings", "The Township engineer then prepares the scope-of-work documents"], passage: "The Board of Commissioners holds a public vote to approve advertising the upcoming road paving work...", reasoning: "Mapped from Step 2 of the process guide." }),
      S({ title: "Scope of Work & RFP Preparation", start: "Jan 2026", end: "", para: s3, page: pg(s3), section: "Step 3", summary: "The Township engineer prepares a Request for Proposals that lists the roads, quantities, and specifications contractors must meet.", bullets: ["Roads and quantities are itemized", "Material and workmanship specifications are set"], passage: "The Township engineer prepares a Request for Proposals (RFP)...", reasoning: "Mapped from Step 3 of the process guide." }),
      S({ title: "Advertising to Contractors", start: "Feb 2026", end: "", para: s4, page: pg(s4), section: "Step 4", summary: "The RFP is publicly advertised so qualified paving contractors can submit sealed bids during an open bidding period.", bullets: ["RFP advertised publicly", "Sealed bids accepted during the bidding window"], passage: "The RFP is publicly advertised so qualified paving contractors can submit sealed bids...", reasoning: "Mapped from Step 4 of the process guide." }),
      S({ title: "Public Bid Opening & Contractor Selection", start: "Mar 2026", end: "", para: s5, page: pg(s5), section: "Step 5", conf: "med", rewritten: true, rewriteFrom: "The State of Pennsylvania mandates the selection of the “lowest responsible bidder” (meaning the lowest bid total that promises to meet the RFP specifications within a reasonable timeframe) to avoid collusion of contracts between municipalities and companies.", summary: "After the bidding period closes, the Township engineer holds a public bid opening where all submitted bids are reviewed and the lowest qualified bidder is selected, as required by Pennsylvania state law.", bullets: ["Bids are opened publicly", "The lowest qualified bidder is selected per state law"], passage: "the selection of the “lowest responsible bidder” ... to avoid collusion of contracts...", reasoning: "Rewritten from Step 5 into plain language; involves interpretation, so confidence is medium." }),
      S({ title: "Board Awards Contract", start: "Mar 2026", end: "", para: s6, page: pg(s6), section: "Step 6", summary: "The Board of Commissioners votes at a public meeting to award the contract to the selected contractor.", bullets: ["Award voted at a public Board meeting"], passage: "The Board of Commissioners votes... to award the contract...", reasoning: "Mapped from Step 6 of the process guide." }),
      S({ title: "Pre-Construction & Utility Coordination", start: "Apr 2026", end: "", para: s7, page: pg(s7), section: "Step 7", summary: "Before milling begins, sewer and gas lines are located and cleared, and residents are notified of the schedule for their street.", bullets: ["Sewer and gas lines cleared", "Residents notified of the schedule"], passage: "sewer and gas lines are located and cleared, and residents are notified...", reasoning: "Mapped from Step 7 of the process guide." }),
      S({ title: "Milling", start: "May 2026", end: "Jun 2026", para: s8, page: pg(s8), section: "Step 8", summary: "The existing worn asphalt surface is ground off (milled) on the scheduled roads to prepare for new paving.", bullets: ["Worn surface milled on scheduled roads"], passage: "The existing worn asphalt surface is ground off (milled)...", reasoning: "Mapped from Step 8 of the process guide." }),
      S({ title: "Paving", start: "Jun 2026", end: "Aug 2026", para: s9, page: pg(s9), section: "Step 9", conf: "low", summary: "Fresh asphalt is laid and compacted one neighborhood at a time, beginning with the highest-priority roads.", bullets: ["Paving proceeds neighborhood by neighborhood"], passage: "Fresh asphalt is laid and compacted one neighborhood at a time...", reasoning: "The document gives a seasonal window; exact dates are estimated, so confidence is lower." }),
      S({ title: "Line Painting & Restoration", start: "Aug 2026", end: "", para: s10, page: pg(s10), section: "Step 10", summary: "Lane lines and pavement markings are repainted and shoulders restored once the new surface has cured.", bullets: ["Lane lines repainted", "Shoulders restored"], passage: "Lane lines and pavement markings are repainted and shoulders restored...", reasoning: "Mapped from Step 10 of the process guide." }),
      S({ title: "Final Inspection & Punchlist", start: "Sep 2026", end: "", para: s11, page: pg(s11), section: "Step 11", conf: "med", rewritten: true, rewriteFrom: "The engineer performs a final walkthrough and documents any remaining punchlist items the contractor must correct before final payment is released.", summary: "The Township engineer does a final walkthrough and makes a list of any small fixes the contractor must complete before the project is closed out and final payment is made.", bullets: ["Final walkthrough completed", "Remaining fixes documented before final payment"], passage: "documents any remaining punchlist items the contractor must correct before final payment...", reasoning: "Rewrote the term “punchlist” into plain language; confidence medium." })
    ];
    return assembleExtract(paras, fields, stages, files);
  };

  const synthExtract = (key: string | null) => {
    const files = [
      ["Cook_School_Culvert_Spec.docx", "Project specification"],
      ["Board_Packet_Engineering_Excerpt.pdf", "Engineering report"],
    ];
    const Fd = {
      title: "Cook School Road Culvert Replacement",
      category: "Infrastructure",
      desc: "Replacement of the aging Cook School Road culvert to prevent flooding and restore two-lane traffic.",
      funding: "PennDOT + Capital Reserve",
      cost: "$310,000",
      sponsor: "Public Works Dept",
      duration: "May 2026 – Sep 2026"
    };
    const ST = [
      ["Engineering & Permits", "May 2026", "Jun 2026", "Design is completed and DEP stream permits are secured.", ["Survey complete", "DEP permit applied"]],
      ["Bid & Award", "Jun 2026", "Jul 2026", "A contractor is selected through competitive bidding.", ["RFP issued"]],
      ["Construction", "Jul 2026", "Sep 2026", "The culvert is replaced and the road restored.", ["Not started"]]
    ];
    const paras: Array<{ id: string; page: number; kind: string; text: string }> = [];
    const addPara = (page: number, kind: string, text: string) => {
      const id = "sp" + paras.length;
      paras.push({ id, page, kind, text });
      return id;
    };
    const pTitle = addPara(1, "h1", Fd.title);
    const pOver = addPara(1, "p", Fd.desc);
    addPara(1, "h2", "Funding");
    const pFund = addPara(1, "p", "Funding: " + Fd.funding + ". Estimated total project cost: " + Fd.cost + ". Sponsored by the " + Fd.sponsor + ".");
    const hProc = addPara(1, "h2", "Process & Timeline");
    const sp = ST.map((a, i) => addPara(1 + Math.floor(i / 4), "p", "Step " + (i + 1) + " — " + a[0] + " (" + a[1] + (a[2] ? (" – " + a[2]) : "") + "). " + a[3]));

    const pg = (id: string) => paras.find((p) => p.id === id)?.page || 1;
    const F = (o: any) => Object.assign({ doc: files[0][0] }, o);
    const fields = {
      title: F({ label: "Project title", value: Fd.title, conf: "high", para: pTitle, page: pg(pTitle), section: "Document title", passage: Fd.title, reasoning: "Extracted from the document title." }),
      category: F({ label: "Category", value: Fd.category, conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: Fd.desc, reasoning: "Classified from the document subject matter." }),
      department: F({ label: "Department", value: dept, conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: Fd.desc, reasoning: "Inferred from the responsible department in the document." }),
      desc: F({ label: "Description", value: Fd.desc, conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: Fd.desc, reasoning: "Synthesized from the overview section." }),
      funding: F({ label: "Funding", value: Fd.funding, conf: "high", para: pFund, page: pg(pFund), section: "Funding", passage: "Funding: " + Fd.funding, reasoning: "Extracted from the funding section." }),
      cost: F({ label: "Total cost", value: Fd.cost, conf: "med", para: pFund, page: pg(pFund), section: "Funding", passage: "Estimated total project cost: " + Fd.cost, reasoning: "Read from the estimate in the funding section." }),
      sponsor: F({ label: "Project sponsor", value: Fd.sponsor, conf: "high", para: pOver, page: pg(pOver), section: "Overview", passage: Fd.desc, reasoning: "Identified from the sponsoring department." }),
      duration: F({ label: "Duration", value: Fd.duration, conf: "low", para: hProc, page: pg(hProc), section: "Process timeline", passage: "Derived from the process step dates", reasoning: "Estimated from the earliest and latest dates across the process steps." })
    };
    const stages = ST.map((a, i) => ({ doc: files[0][0], title: a[0], start: a[1], end: a[2] || "", summary: a[3] as string, bullets: (a[4] as string[]).slice(), conf: "high", rewritten: false, para: sp[i], page: pg(sp[i]), section: "Step " + (i + 1), passage: "Step " + (i + 1) + " — " + a[0] + ". " + a[3], reasoning: "Mapped from process step " + (i + 1) + "." }));
    return assembleExtract(paras, fields, stages, files);
  };

  const assembleExtract = (paras: any[], fields: any, stages: any[], files: any[][]) => {
    const events: Array<{ para: string; key?: string; kind: string; dur: number }> = [];
    ["title", "category", "department", "desc", "funding", "cost", "sponsor", "duration"].forEach((k) => {
      if (fields[k]) events.push({ para: fields[k].para, key: k, kind: "field", dur: 1300 });
    });
    stages.forEach((st) => events.push({ para: st.para, kind: "stage", dur: 1700 }));
    return { paras, fields, stages, events, docs: files.map((f) => ({ name: f[0], type: f[1] })) };
  };

  const genConfetti = () => {
    const cols = ["#7C3AED", "#16A34A", "#2563EB", "#D97706", "#EC4899", "#A78BFA"];
    return Array.from({ length: 38 }).map((_, i) => {
      const left = Math.random() * 100;
      const size = 6 + Math.random() * 7;
      const dur = 1 + Math.random() * 0.9;
      const delay = Math.random() * 0.5;
      const col = cols[i % cols.length];
      const rot = Math.random() * 90;
      return {
        style: {
          position: "absolute" as const,
          top: "-18px",
          left: `${left}%`,
          width: `${size}px`,
          height: `${size * 0.5}px`,
          backgroundColor: col,
          borderRadius: "2px",
          transform: `rotate(${rot}deg)`,
          animation: `confFall ${dur}s ease-in ${delay}s forwards`,
        }
      };
    });
  };

  const startExtract = (key: string | null) => {
    const ex = key === "road" ? roadExtract() : synthExtract(key);
    setActiveExtData(ex);
    setRevealedFields([]);
    setExtractedStagesCount(0);
    setActiveParaGlow(ex.events[0] ? ex.events[0].para : null);
    setExtPct(0);
    setExtRunning(true);
    setExtDone(false);
    setExtConfetti(false);
    setCreateStep(2);
    setParseBusy(true);

    if (extractTimerId) clearTimeout(extractTimerId);
    runExtractStep(0, ex.events, ex);
  };

  const runExtractStep = (idx: number, eventsList: any[], exData: any) => {
    if (idx >= eventsList.length) {
      finishExtract();
      return;
    }
    const evt = eventsList[idx];
    setExtPct(Math.round(((idx + 1) / eventsList.length) * 100));
    setActiveParaGlow(evt.para);
    
    // Rotate progress message text
    const msgIdx = Math.min(exProgressMsgs.length - 1, Math.floor((idx / eventsList.length) * exProgressMsgs.length));
    setExtProgressText(exProgressMsgs[msgIdx]);

    if (evt.kind === "field" && evt.key) {
      setRevealedFields((prev) => [...prev, evt.key]);
    } else if (evt.kind === "stage") {
      setExtractedStagesCount((prev) => prev + 1);
    }

    const tid = setTimeout(() => {
      runExtractStep(idx + 1, eventsList, exData);
    }, evt.dur || 1500);
    setExtractTimerId(tid);
  };

  const skipExtract = () => {
    if (extractTimerId) clearTimeout(extractTimerId);
    const ex = activeExtData;
    if (!ex) return;
    setRevealedFields(["title", "category", "department", "desc", "funding", "cost", "sponsor", "duration"]);
    setExtractedStagesCount(ex.stages.length);
    setExtPct(100);
    setExtRunning(false);
    setExtDone(true);
    setActiveParaGlow(null);
  };

  const finishExtract = () => {
    if (extractTimerId) clearTimeout(extractTimerId);
    setConfettiBits(genConfetti());
    setExtConfetti(true);
    setExtPct(100);
    setExtRunning(false);
    setExtDone(true);
    setActiveParaGlow(null);
  };

  const continueToReview = () => {
    const ex = activeExtData;
    if (!ex) return;
    const f = {
      title: ex.fields.title?.value || "",
      category: ex.fields.category?.value || "Roads",
      desc: ex.fields.desc?.value || "",
      funding: ex.fields.funding?.value || "",
      cost: ex.fields.cost?.value || "",
      sponsor: ex.fields.sponsor?.value || "",
      duration: ex.fields.duration?.value || ""
    };
    const mappedStages: CreateStage[] = ex.stages.map((st: any, i: number) => ({
      n: i + 1,
      title: st.title,
      start: st.start,
      end: st.end,
      singleDate: !st.end,
      summary: st.summary,
      bullets: st.bullets || [],
      status: "draft",
      docs: [],
      docsOpen: false,
      ai: true,
      rewritten: st.rewritten,
      rewriteFrom: st.rewriteFrom
    }));

    setCreateFields(f);
    setCreateStages(mappedStages);
    setSourceDocs(ex.docs);
    setCreateStep(3);
    setParseBusy(false);
  };

  const cancelExtract = () => {
    if (extractTimerId) clearTimeout(extractTimerId);
    setCreateStep(1);
    setParseBusy(false);
  };
  const filteredInsightsProjects = projects
    .filter((p) => p.lc === "published" || p.lc === "completed")
    .filter((p) => sentScope === "all" || p.dept === dept)
    .filter((p) => sentStatus === "all" || p.lc === sentStatus);

  const insightsRows = filteredInsightsProjects.map((p) => {
    const se = p.sentiment || { supportive: 50, mixed: 30, concerns: 20 };
    const comments = p.public.length + p.privateMsgs.length;
    const supportVal = se.supportive;
    const mixedVal = se.mixed;
    const concernsVal = se.concerns;
    
    let overallText = "Supportive";
    let overallColor = "text-[#16A34A]";
    if (concernsVal > 40) {
      overallText = "Concerns";
      overallColor = "text-[#DC2626]";
    } else if (mixedVal > 40) {
      overallText = "Mixed";
      overallColor = "text-[#D97706]";
    }

    const themeText = THEME_MAP[p.id] || "No major themes identified yet.";
    return {
      ...p,
      comments,
      supportVal,
      mixedVal,
      concernsVal,
      overallText,
      overallColor,
      themeText,
    };
  });

  const totalInsightsComments = insightsRows.reduce((sum, r) => sum + r.comments, 0);
  const totalInsightsResidents = insightsRows.reduce((sum, r) => sum + Math.round(r.followers * 0.4), 0);

  // Reports Generation computed
  const reportsTemplateList = [
    { name: "Road Paving 2026 Executive Summary", category: "Roads", type: "Board Briefing", year: "2026" },
    { name: "Hilltop Park Expansion Resident Feedback Report", category: "Parks", type: "Grant Support", year: "2026" },
    { name: "Downtown Mixed-Use Zoning Public Hearing Packet", category: "Planning", type: "Public Hearing", year: "2026" },
    { name: "MS4 Stormwater Compliance Annual Summary", category: "Infrastructure", type: "Annual Report", year: "2025" },
  ];

  // Grouped projects categories matching DashboardContent sections
  const categoryGroups = [
    { title: "Roads & Transportation", catKey: "Roads" },
    { title: "Parks & Green Spaces", catKey: "Parks" },
    { title: "Infrastructure & Facilities", catKey: "Infrastructure" },
    { title: "Plan, Development & Sustainability", catKey: "Plan/Dev" },
    { title: "Public Safety", catKey: "Public Safety" }
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans antialiased text-[#0F172A]">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg transition-all duration-300"
          >
            <div className="h-2 w-2 rounded-full bg-[#1E3A5F]" />
            <span className="text-sm font-medium text-[#1E3A5F]">{t.msg}</span>
          </div>
        ))}
      </div>

      {/* ── LOGIN SCREEN ── */}
      {screen === "login" && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1E3A5F] to-[#0F2942]">
          <div className="w-[380px] rounded-xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3A5F] text-xl font-bold text-white tracking-wide">
                CT
              </div>
              <h1 className="text-xl font-bold text-[#1E3A5F]">Collier Connect Staff</h1>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-semibold text-[#475569]">Email</label>
              <input
                type="text"
                readOnly
                value="amy.medway@colliertwp.gov"
                className="w-full h-10 border border-[#E2E8F0] rounded-lg px-3 text-sm text-[#0F172A] outline-none"
              />
            </div>
            <div className="mb-6">
              <label className="mb-1 block text-xs font-semibold text-[#475569]">Password</label>
              <input
                type="password"
                readOnly
                value="password"
                className="w-full h-10 border border-[#E2E8F0] rounded-lg px-3 text-sm text-[#0F172A] outline-none"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full h-11 bg-[#1E3A5F] text-white font-semibold rounded-lg text-sm hover:bg-[#152a45] transition-colors cursor-pointer border-none"
            >
              Sign In
            </button>
            <p className="mt-6 text-center text-xs text-[#94A3B8]">
              Access is provisioned by your township administrator.
            </p>
          </div>
        </div>
      )}

      {/* ── APP SHELL ── */}
      {screen !== "login" && (
        <div>
          {/* Top navigation */}
          <div className="sticky top-0 z-[40] h-[58px] bg-[#1E3A5F] flex items-center px-[2rem] gap-5 shadow-md">
            <div onClick={() => handleNav("projects")} className="flex items-center gap-3 cursor-pointer">
              <div className="h-[30px] w-[30px] rounded-lg bg-white flex items-center justify-center text-[#1E3A5F] font-bold text-sm">
                CT
              </div>
              <span className="text-white font-semibold text-sm">
                Collier Connect <span className="text-[#94A3B8] font-normal">| Staff</span>
              </span>
            </div>

            <div className="flex gap-1 ml-3">
              <button
                onClick={() => handleNav("projects")}
                className={`h-[34px] px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors border-none bg-transparent ${
                  screen === "projects" || screen === "detail" || screen === "create" ? "bg-white/15 text-white" : "text-[#CBD5E1] hover:text-white"
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => handleNav("feedback")}
                className={`h-[34px] px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors border-none bg-transparent ${
                  screen === "feedback" ? "bg-white/15 text-white" : "text-[#CBD5E1] hover:text-white"
                }`}
              >
                Feedback
              </button>
              <button
                onClick={() => handleNav("insights")}
                className={`h-[34px] px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors border-none bg-transparent ${
                  screen === "insights" ? "bg-white/15 text-white" : "text-[#CBD5E1] hover:text-white"
                }`}
              >
                Insights
              </button>
              <button
                onClick={() => handleNav("reports")}
                className={`h-[34px] px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors border-none bg-transparent ${
                  screen === "reports" ? "bg-white/15 text-white" : "text-[#CBD5E1] hover:text-white"
                }`}
              >
                Reports
              </button>
            </div>

            <div className="flex-1" />

            {/* Preview Resident View Switcher */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 h-[34px] px-3 rounded-full border border-white/20 bg-white/5 text-white text-xs font-semibold hover:bg-white/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview Resident View
            </Link>

            {/* AI Toggle */}
            <button
              onClick={toggleAiMode}
              className={`flex items-center gap-2 h-[34px] px-[14px] rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                aiMode ? "border-[#7C3AED] bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20" : "border-white/20 bg-white/5 text-white"
              }`}
            >
              <span className={`h-2 w-2 rounded-full transition-colors ${aiMode ? "bg-[#C4B5FD]" : "bg-[#64748B]"}`} />
              AI Assistance: {aiMode ? "ON" : "OFF"}
            </button>

            {/* User Dropdown Toggle */}
            <div className="relative">
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 cursor-pointer pl-1"
              >
                <div className="h-[34px] w-[34px] rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
                  AM
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-white text-xs font-semibold">Amy Medway</div>
                  <div className="text-[#94A3B8] text-[10px]">{dept}</div>
                </div>
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-2xl z-50">
                  <div className="border-b border-[#F1F5F9] p-2 pb-3 mb-1">
                    <div className="font-semibold text-xs text-[#0F172A]">Amy Medway</div>
                    <div className="text-[#94A3B8] text-[11px]">{dept}</div>
                  </div>
                  <button
                    onClick={() => {
                      setDeptSwitchOpen(true);
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-2 py-[7px] text-xs text-[#475569] hover:bg-slate-50 rounded-lg cursor-pointer border-none bg-transparent"
                  >
                    Switch Department
                  </button>
                  <button
                    onClick={() => setScreen("login")}
                    className="w-full text-left px-2 py-[7px] text-xs text-[#DC2626] hover:bg-red-50 rounded-lg font-semibold border-t border-slate-50 mt-1 pt-2 cursor-pointer border-none bg-transparent"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Switch Department Modal */}
          {deptSwitchOpen && (
            <div
              onClick={() => setDeptSwitchOpen(false)}
              className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-6 z-[999]"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-[520px] bg-white rounded-xl p-6 shadow-2xl border border-[#E2E8F0]"
              >
                <h3 className="text-lg font-bold text-[#1E3A5F] mb-1">Posting Department</h3>
                <p className="text-xs text-[#64748B] mb-4">
                  Select the department profile you want to represent this session.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DEPARTMENTS.map((d) => (
                    <button
                      key={d}
                      onClick={() => selectDept(d)}
                      className={`text-left p-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        d === dept ? "bg-[#EFF6FF] border-[#2563EB]" : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-[#1E3A5F]">{d}</div>
                      <div className="text-[10px] text-[#94A3B8] font-normal mt-0.5">
                        {d === dept ? "Active Profile" : "Switch to profile"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PROJECTS GALLERY SCREEN (MATCHING RESIDENT HOMEPAGE LAYOUT) ── */}
          {screen === "projects" && (
            <main className="max-w-5xl w-full mx-auto px-8 py-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Projects Management</h1>
                  <p className="text-xs text-[#64748B]">Create, publish, and moderate resident engagement.</p>
                </div>
                <button
                  onClick={() => {
                    setCreateStep(0);
                    setCreateFiles([]);
                    setCreateCtx("");
                    setCtxOpen(false);
                    setParseBusy(false);
                    setExtRunning(false);
                    setExtDone(false);
                    setExtConfetti(false);
                    setCompliance({ rtk: false, mgr: false, acc: false });
                    setPublishConfirm(false);
                    setPublishSuccess(null);
                    setScreen("create");
                  }}
                  className="h-10 px-4 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-lg font-semibold text-xs cursor-pointer border-none"
                >
                  + New Project
                </button>
              </div>

              {/* Pending Review Queue (Manager's Office specific) */}
              {dept === "Manager's Office" && projects.filter((p) => p.lc === "pending").length > 0 && (
                <div className="bg-[#FFF9E6] border border-[#F59E0B] rounded-xl p-5 mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
                      Pending Approvals Queue
                    </span>
                    <span className="text-[10px] bg-[#F59E0B] text-white px-2 py-0.5 rounded-full font-bold">
                      {projects.filter((p) => p.lc === "pending").length}
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {projects
                      .filter((p) => p.lc === "pending")
                      .map((p) => (
                        <div key={p.id} className="min-w-[280px] bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                          <div className="flex gap-2 items-center mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-sans">
                              {p.cat}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 font-sans">
                              {p.urgency} Priority
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#1E3A5F] mb-1 font-sans">{p.title}</h4>
                          <p className="text-[11px] text-[#94A3B8] mb-3 font-sans">
                            Submitted by {p.submittedBy} ({p.submittedDept})
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openProj(p.id)}
                              className="flex-1 h-8 rounded bg-slate-100 text-xs font-semibold text-[#1E3A5F] hover:bg-slate-200 cursor-pointer border-none"
                            >
                              Review Details
                            </button>
                            <button
                              onClick={() => approveProject(p.id)}
                              className="h-8 px-3 rounded bg-[#16A34A] text-xs font-semibold text-white hover:bg-green-700 cursor-pointer border-none"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Grouped list sections exactly matching the resident dashboard layout */}
              {categoryGroups.map((group) => {
                const groupProposals = projects.filter((p) => p.cat === group.catKey);
                if (groupProposals.length === 0) return null;

                return (
                  <section key={group.catKey} className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 font-sans border-b border-gray-100 pb-2">
                      {group.title}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {groupProposals.map((p) => (
                        <StaffProjectCard
                          key={p.id}
                          p={p}
                          toggleSpotlight={toggleSpotlight}
                          openProj={openProj}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </main>
          )}

          {/* ── PROJECT DETAIL SCREEN ── */}
          {screen === "detail" && (() => {
            const mappedProposalDetail = {
              id: activeProject.id,
              title: activeProject.title,
              heroImage: activeProject.id === "hilltop" ? "https://picsum.photos/seed/hilltoppark/1200/400" : getProjectImage(activeProject.id),
              photos: activeProject.id === "hilltop" ? [
                "https://picsum.photos/seed/hilltoppark-a/900/600",
                "https://picsum.photos/seed/hilltoppark-b/900/600",
                "https://picsum.photos/seed/hilltoppark-c/900/600",
                "https://picsum.photos/seed/hilltoppark-d/900/600",
              ] : [
                `https://picsum.photos/seed/${activeProject.id}-1/600/340`,
                `https://picsum.photos/seed/${activeProject.id}-2/600/340`,
                `https://picsum.photos/seed/${activeProject.id}-3/600/340`,
              ],
              lastUpdated: activeProject.edited,
              projectLink: "#",
              meetingLink: "#",
              description: activeProject.desc,
              funding: activeProject.funding,
              details: activeProject.desc,
              metadata: [
                { label: "Project Sponsor", value: activeProject.sponsor },
                { label: "Duration", value: activeProject.duration },
                { label: "Total Project Cost", value: activeProject.cost },
              ],
            };

            const mappedTimelineStages = activeProject.stages.map((st) => ({
              label: st.title,
              status: st.n < activeProject.current
                ? "completed" as const
                : st.n === activeProject.current
                ? "current" as const
                : "future" as const,
              date: st.dates,
              description: st.desc,
              bullets: st.bullets,
            }));

            const mappedDiscussionData = {
              private: {
                descriptions: [
                  "Every comment and question will be read by the township. Any replies you receive will be visible under your comment, in your notifications, and in your profile.",
                  "The township will weigh comments into decision making."
                ] as [string, string],
                placeholder: "Leave a message...",
                buttonLabel: "Submit Private Feedback",
                pastFeedback: activeProject.privateMsgs.map((c) => ({
                  time: c.time,
                  message: c.text,
                })),
              },
              public: {
                descriptions: [
                  "See how your neighbors feel about this project.",
                  "Any public comments containing inappropriate or irrelevant material will be removed."
                ] as [string, string],
                placeholder: "Leave us a message...",
                buttonLabel: "Post Public Feedback",
                viewCount: activeProject.followers ? Math.round(activeProject.followers * 0.1) : 12,
                comments: activeProject.public.map((c) => ({
                  user: c.name,
                  isOfficial: c.replies.some(r => r.attr === "official" || r.dept === "Township Staff"),
                  avatarColor: c.sent === "green" ? "#22c55e" : c.sent === "red" ? "#ef4444" : "#f59e0b",
                  timeAgo: c.time,
                  message: c.text,
                  replies: c.replies.map((r) => ({
                    user: r.name || "Township Staff",
                    isOfficial: r.attr === "official" || r.dept === "Township Staff",
                    avatarColor: "#0d2240",
                    timeAgo: r.time,
                    message: r.text,
                  })),
                })),
              },
            };

            return (
              <div style={{ display: "flex", minHeight: "calc(100vh - 58px)", position: "relative" }}>
                
                {/* Collapsible Sidebar matching resident proposal page */}
                <StaffSidebar
                  currentProposalId={activeProject.id}
                  activeProject={activeProject}
                  projects={projects}
                  openProj={openProj}
                />

                {/* Main content flow */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Hero image */}
                  <img
                    src={mappedProposalDetail.heroImage}
                    alt={activeProject.title}
                    style={{
                      width: "100%",
                      height: 260,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <div style={{ padding: "0 2rem 2rem 2rem" }}>
                    <div style={{ maxWidth: 800, margin: "0 auto" }}>
                      
                      {/* Back Button */}
                      <div className="mt-4 mb-2">
                        <button
                          onClick={() => setScreen("projects")}
                          className="text-xs font-semibold text-[#64748B] hover:text-[#1E3A5F] cursor-pointer bg-transparent border-none"
                        >
                          ← Back to Dashboard
                        </button>
                      </div>

                      {/* Title + Action Buttons Header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900 leading-tight font-sans">
                            {activeProject.title}
                          </h1>
                          <div className="flex gap-2 mt-2 items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-sans ${
                              activeProject.lc === "published"
                                ? "bg-[#DCFCE7] text-[#16A34A]"
                                : activeProject.lc === "pending"
                                ? "bg-[#FEF3C7] text-[#D97706]"
                                : "bg-slate-100 text-slate-800"
                            }`}>
                              {activeProject.lc === "published" ? "Published" : activeProject.lc === "pending" ? "Pending Approval" : "Draft"}
                            </span>
                            {activeProject.spotlight && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-sans">
                                ★ Spotlighted
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditAll(!editAll)}
                            className={`h-9 px-4 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                              editAll ? "bg-[#16A34A] text-white border-[#16A34A]" : "bg-white text-[#475569] border-[#e5e7eb] hover:bg-slate-50"
                            }`}
                          >
                            {editAll ? "✓ Done Editing" : "✎ Edit Details"}
                          </button>
                          <button
                            onClick={() => toggleSpotlight(activeProject.id)}
                            className={`h-9 px-4 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                              activeProject.spotlight ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-white text-[#475569] border-[#e5e7eb] hover:bg-slate-50"
                            }`}
                          >
                            ★ {activeProject.spotlight ? "Remove Spotlight" : "Spotlight"}
                          </button>
                        </div>
                      </div>

                      {/* Render either resident layout or staff editor layout */}
                      {!editAll ? (
                        <>
                          {/* Follow Button & Last updated row */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 16,
                              marginTop: 28,
                              flexWrap: "wrap",
                            }}
                          >
                            <div className="custom-tooltip-wrap" style={{ position: "relative" }}>
                              <button
                                onClick={toggleFollow}
                                onMouseEnter={() => setHovering(true)}
                                onMouseLeave={() => setHovering(false)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 7,
                                  borderRadius: 9999,
                                  padding: "10px 22px",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  transition: "background 0.15s, color 0.15s",
                                  background: following
                                    ? hovering
                                      ? "#fef2f2"
                                      : "#0d2240"
                                    : hovering
                                      ? "#eff6ff"
                                      : "white",
                                  color: following
                                    ? hovering
                                      ? "#dc2626"
                                      : "white"
                                    : "#2563eb",
                                  border: following
                                    ? hovering
                                      ? "2px solid #dc2626"
                                      : "2px solid #0d2240"
                                    : "2px solid #2563eb",
                                  boxShadow:
                                    following && !hovering
                                      ? "0 1px 4px rgba(0,0,0,0.18)"
                                      : "none",
                                }}
                              >
                                {following ? (
                                  hovering ? (
                                    <>✕ Unfollow</>
                                  ) : (
                                    <>✓ Following</>
                                  )
                                ) : (
                                  <>+ Follow Project</>
                                )}
                              </button>
                            </div>
                            <span style={{ fontSize: 13, fontStyle: "italic", color: "#6b7280" }}>
                              Last updated {activeProject.edited}
                            </span>
                          </div>

                          {/* Description */}
                          <p style={{ marginTop: 20, fontSize: 13, color: "#374151", lineHeight: 1.7 }} className="font-sans">
                            {activeProject.desc}
                          </p>

                          {/* Funding + Details metadata */}
                          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "14px 20px", marginTop: 16, alignItems: "start" }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }} className="font-sans">Funding:</span>
                            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }} className="font-sans">
                              {activeProject.funding}
                            </p>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }} className="font-sans">Details:</span>
                            <div>
                              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: "0 0 12px 0" }} className="font-sans">
                                {activeProject.desc}
                              </p>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <a
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 9999,
                                    padding: "6px 14px",
                                    color: "#6b7280",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    textDecoration: "none",
                                    background: "white",
                                  }}
                                  className="font-sans"
                                >
                                  Link to Project
                                </a>
                                <a
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 9999,
                                    padding: "6px 14px",
                                    color: "#6b7280",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    textDecoration: "none",
                                    background: "white",
                                  }}
                                  className="font-sans"
                                >
                                  Link to Meeting Notes
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Project Map Card */}
                          <ProjectMapCard p={mappedProposalDetail} />

                          {/* Timeline */}
                          <div style={{ marginTop: "2.5rem" }}>
                            <Timeline stages={mappedTimelineStages} />
                          </div>

                          {/* Discussion */}
                          <div ref={discussionRef} style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                            <Discussion data={mappedDiscussionData} />
                          </div>

                          {/* Floating vote banner */}
                          <VoteBanner discussionRef={discussionRef} />
                        </>
                      ) : (
                        <>
                          {/* Last updated and meta info in edit mode */}
                          <div className="text-xs text-gray-400 italic mt-2.5 font-sans">
                            Last updated {activeProject.edited} · {activeProject.followers} followers
                          </div>

                          {/* Description */}
                          <div className="mt-5">
                            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase mb-1 font-sans">
                              Description
                            </label>
                            <textarea
                              value={activeProject.desc}
                              onChange={(e) =>
                                setProjects((prev) =>
                                  prev.map((p) => (p.id === activeProject.id ? { ...p, desc: e.target.value } : p))
                                )
                              }
                              className="w-full min-h-[80px] p-3 border border-[#CBD5E1] rounded-lg text-xs outline-none"
                            />
                            {aiMode && (
                              <button
                                onClick={() =>
                                  simulateRewrite(activeProject.desc, (rewritten) =>
                                    setProjects((prev) =>
                                      prev.map((p) => (p.id === activeProject.id ? { ...p, desc: rewritten } : p))
                                    )
                                  )
                                }
                                className="mt-2 text-[10px] font-semibold text-[#7C3AED] hover:underline cursor-pointer bg-transparent border-none"
                              >
                                ✦ Rewrite in plain language (AI)
                              </button>
                            )}
                          </div>

                          {/* Funding + Sponsor Metadata row */}
                          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "14px 20px", marginTop: 24, alignItems: "start" }}>
                            <span className="font-bold text-xs text-gray-900 font-sans">Funding:</span>
                            <div>
                              <input
                                type="text"
                                value={activeProject.funding}
                                onChange={(e) =>
                                  setProjects((prev) =>
                                    prev.map((p) => (p.id === activeProject.id ? { ...p, funding: e.target.value } : p))
                                  )
                                }
                                className="w-full h-8 border border-[#E2E8F0] rounded-lg px-2 text-xs outline-none"
                              />
                            </div>
                            <span className="font-bold text-xs text-gray-900 font-sans">Sponsor:</span>
                            <div>
                              <input
                                type="text"
                                value={activeProject.sponsor}
                                onChange={(e) =>
                                  setProjects((prev) =>
                                    prev.map((p) => (p.id === activeProject.id ? { ...p, sponsor: e.target.value } : p))
                                  )
                                }
                                className="w-full h-8 border border-[#E2E8F0] rounded-lg px-2 text-xs outline-none"
                              />
                            </div>
                          </div>

                          {/* Map / Photo card placeholder */}
                          <div className="mt-6 border border-[#e5e7eb] rounded-xl p-4 bg-white shadow-xs">
                            <h3 className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-2 font-sans">
                              Location Map
                            </h3>
                            <div className="h-[180px] bg-slate-100 rounded-lg flex items-center justify-center border border-[#e5e7eb]">
                              <span className="text-xs text-[#94a3b8] font-sans">Project Location Map View</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-500 font-medium font-sans">
                              Scope: {activeProject.neighborhoods || "Township-Wide"}
                            </div>
                          </div>

                          {/* Timeline (with edit inputs if editAll is active) */}
                          <div className="mt-10">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-sans">
                                Project Timeline
                              </h3>
                              <button
                                onClick={() => {
                                  setProjects((prev) =>
                                    prev.map((p) => {
                                      if (p.id !== activeProject.id) return p;
                                      const nextStageNum = p.stages.length + 1;
                                      const nextStage: Stage = {
                                        n: nextStageNum,
                                        title: `Stage ${nextStageNum}`,
                                        dates: "Upcoming",
                                        desc: "Describe what will happen in this stage.",
                                        bullets: [],
                                        state: "Draft",
                                      };
                                      return { ...p, stages: [...p.stages, nextStage] };
                                    })
                                  );
                                  showToast("Stage added");
                                }}
                                className="h-7 px-3 bg-[#1e3a5f] hover:bg-[#152a45] text-white rounded text-xs font-semibold cursor-pointer border-none"
                              >
                                + Add Stage
                              </button>
                            </div>

                            <div className="flex flex-col gap-4">
                              {activeProject.stages.map((st, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-white">
                                  <div className="flex justify-between items-center mb-2">
                                    <input
                                      type="text"
                                      value={st.title}
                                      onChange={(e) => {
                                        const newStages = activeProject.stages.map((item, sIdx) =>
                                          sIdx === idx ? { ...item, title: e.target.value } : item
                                        );
                                        setProjects((prev) =>
                                          prev.map((p) => (p.id === activeProject.id ? { ...p, stages: newStages } : p))
                                        );
                                      }}
                                      className="h-8 border border-gray-200 rounded-lg px-2 text-xs font-semibold w-1/2 outline-none"
                                    />
                                    <input
                                      type="text"
                                      value={st.dates}
                                      onChange={(e) => {
                                        const newStages = activeProject.stages.map((item, sIdx) =>
                                          sIdx === idx ? { ...item, dates: e.target.value } : item
                                        );
                                        setProjects((prev) =>
                                          prev.map((p) => (p.id === activeProject.id ? { ...p, stages: newStages } : p))
                                        );
                                      }}
                                      className="h-8 border border-gray-200 rounded-lg px-2 text-xs w-28 text-right outline-none"
                                    />
                                  </div>

                                  <textarea
                                    value={st.desc}
                                    onChange={(e) => {
                                      const newStages = activeProject.stages.map((item, sIdx) =>
                                        sIdx === idx ? { ...item, desc: e.target.value } : item
                                      );
                                      setProjects((prev) =>
                                        prev.map((p) => (p.id === activeProject.id ? { ...p, stages: newStages } : p))
                                      );
                                    }}
                                    className="w-full min-h-[40px] p-2 border border-gray-200 rounded-lg text-xs outline-none"
                                  />

                                  <div className="mt-2 flex justify-between items-center">
                                    <button
                                      onClick={() => {
                                        const newStages = activeProject.stages.filter((item, sIdx) => sIdx !== idx);
                                        setProjects((prev) =>
                                          prev.map((p) => (p.id === activeProject.id ? { ...p, stages: newStages } : p))
                                        );
                                        showToast("Stage deleted");
                                      }}
                                      className="text-[10px] text-red-600 font-semibold cursor-pointer border-none bg-transparent"
                                    >
                                      Delete
                                    </button>
                                    {aiMode && (
                                      <button
                                        onClick={() =>
                                          simulateRewrite(st.desc, (rewritten) => {
                                            const newStages = activeProject.stages.map((item, sIdx) =>
                                              sIdx === idx ? { ...item, desc: rewritten } : item
                                            );
                                            setProjects((prev) =>
                                              prev.map((p) => (p.id === activeProject.id ? { ...p, stages: newStages } : p))
                                            );
                                          })
                                        }
                                        className="text-[10px] text-[#7C3AED] font-semibold hover:underline cursor-pointer border-none bg-transparent"
                                      >
                                        ✦ AI Suggestion
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Discussion / Moderation */}
                          <div className="mt-10 border-t border-gray-200 pt-8">
                            <div className="flex justify-between items-center mb-5">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-sans">
                                Discussion Moderation
                              </h3>
                              
                              <div className="flex gap-1.5">
                                {["public", "private", "moderation"].map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => setDetailTab(t)}
                                    className={`h-7 px-3 rounded text-[11px] font-semibold cursor-pointer border-none ${
                                      detailTab === t ? "bg-[#EFF3F8] text-[#1E3A5F]" : "bg-white text-slate-500 border border-slate-200"
                                    }`}
                                  >
                                    {t === "public" ? "Public Forum" : t === "private" ? "Private Mail" : "Moderation Queue"}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-4">
                              {detailTab === "public" && (
                                activeProject.public.length === 0 ? (
                                  <p className="text-xs text-[#94A3B8] p-4 text-center border border-dashed border-[#CBD5E1] rounded-xl bg-white font-sans">
                                    No public comments posted yet.
                                  </p>
                                ) : (
                                  activeProject.public.map((c) => (
                                    <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] font-sans">
                                            {c.name.charAt(0)}
                                          </div>
                                          <span className="text-xs font-bold text-[#1E3A5F] font-sans">{c.name}</span>
                                          <span className="text-[10px] text-[#94A3B8] font-sans">{c.time}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-sans ${
                                          c.sent === "green" ? "bg-green-100 text-green-800" : c.sent === "red" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                                        }`}>
                                          {c.sent}
                                        </span>
                                      </div>
                                      <p className="text-xs text-[#374151] mb-2 font-sans">{c.text}</p>
                                      
                                      {c.replies.map((r, rIdx) => (
                                        <div key={rIdx} className="ml-5 border-l-2 border-[#CBD5E1] pl-3 py-1 my-2 bg-slate-50 rounded px-2 font-sans">
                                          <span className="text-[10px] font-bold text-[#1E3A5F]">
                                            {r.name || r.dept} (Staff Reply)
                                          </span>
                                          <p className="text-xs text-[#475569]">{r.text}</p>
                                        </div>
                                      ))}

                                      <button
                                        onClick={() => openReplyModal(c)}
                                        className="text-[11px] font-semibold text-[#2563EB] hover:underline mt-2 cursor-pointer border-none bg-transparent"
                                      >
                                        + Reply
                                      </button>
                                    </div>
                                  ))
                                )
                              )}

                              {detailTab === "private" && (
                                activeProject.privateMsgs.length === 0 ? (
                                  <p className="text-xs text-[#94A3B8] p-4 text-center border border-dashed border-[#CBD5E1] rounded-xl bg-white font-sans">
                                    No private messages received.
                                  </p>
                                ) : (
                                  activeProject.privateMsgs.map((c) => (
                                    <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] font-sans">
                                            {c.name.charAt(0)}
                                          </div>
                                          <span className="text-xs font-bold text-[#1E3A5F] font-sans">{c.name}</span>
                                          <span className="text-[10px] text-[#94A3B8] font-sans">{c.time}</span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-[#374151] mb-2 font-sans">{c.text}</p>
                                      
                                      {c.replies.map((r, rIdx) => (
                                        <div key={rIdx} className="ml-5 border-l-2 border-[#CBD5E1] pl-3 py-1 my-2 bg-slate-50 rounded px-2 font-sans">
                                          <span className="text-[10px] font-bold text-[#1E3A5F]">
                                            {r.name || r.dept} (Staff Reply)
                                          </span>
                                          <p className="text-xs text-[#475569]">{r.text}</p>
                                        </div>
                                      ))}

                                      <button
                                        onClick={() => openReplyModal(c)}
                                        className="text-[11px] font-semibold text-[#2563EB] hover:underline mt-2 cursor-pointer border-none bg-transparent"
                                      >
                                        + Reply
                                      </button>
                                    </div>
                                  ))
                                )
                              )}

                              {detailTab === "moderation" && (
                                activeProject.hidden.length === 0 ? (
                                  <p className="text-xs text-[#94A3B8] p-4 text-center border border-dashed border-[#CBD5E1] rounded-xl bg-white font-sans">
                                    No flagged comments awaiting moderation review.
                                  </p>
                                ) : (
                                  activeProject.hidden.map((c) => (
                                    <div key={c.id} className="bg-[#FFFDF7] border border-[#FDE68A] rounded-xl p-4 shadow-xs">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-[#1E3A5F] font-sans">{c.name}</span>
                                          <span className="text-[10px] text-[#94A3B8] font-sans">{c.time}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-sans">
                                          AI Flagged: {c.flag}
                                        </span>
                                      </div>
                                      <p className="text-xs text-[#374151] mb-3 font-sans">{c.text}</p>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => approveComment(c)}
                                          className="h-7 px-3 bg-[#16A34A] text-white rounded text-[11px] font-semibold cursor-pointer border-none"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => rejectComment(c)}
                                          className="h-7 px-3 bg-[#DC2626] text-white rounded text-[11px] font-semibold cursor-pointer border-none"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )
                              )}
                            </div>
                          </div>

                          {/* Voting Results card */}
                          <div className="mt-10 border-t border-gray-200 pt-8 mb-10">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-sans">
                                Project Polls / Community Voting
                              </h3>
                              <button
                                onClick={() => showToast("Create new poll form opening...")}
                                className="h-7 px-3 bg-[#1e3a5f] hover:bg-[#152a45] text-white rounded text-xs font-semibold cursor-pointer border-none"
                              >
                                + Create Poll
                              </button>
                            </div>

                            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-wrap gap-6 items-center">
                              <div className="h-28 w-28 rounded-full border-8 border-green-500 border-t-red-500 border-r-amber-500 flex items-center justify-center text-xs font-bold text-gray-900 font-sans">
                                {activeProject.poll.support + activeProject.poll.oppose + activeProject.poll.neutral} Votes
                              </div>
                              <div className="flex-1 min-w-[200px] flex flex-col gap-2 font-sans">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-[#16A34A]">✓ Support</span>
                                  <span>{activeProject.poll.support} ({Math.round(activeProject.poll.support / (activeProject.poll.support + activeProject.poll.oppose + activeProject.poll.neutral || 1) * 100)}%)</span>
                                </div>
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-[#D97706]">⚠ Neutral</span>
                                  <span>{activeProject.poll.neutral} ({Math.round(activeProject.poll.neutral / (activeProject.poll.support + activeProject.poll.oppose + activeProject.poll.neutral || 1) * 100)}%)</span>
                                </div>
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-[#DC2626]">✕ Oppose</span>
                                  <span>{activeProject.poll.oppose} ({Math.round(activeProject.poll.oppose / (activeProject.poll.support + activeProject.poll.oppose + activeProject.poll.neutral || 1) * 100)}%)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── PROJECT CREATION WIZARD SCREEN ── */}
          {screen === "create" && (
            <div className="max-w-[1240px] w-full mx-auto px-8 py-6">
              
              {/* Top navigation back button / Discard Draft modal trigger */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    if (createStep > 2 || createFiles.length > 0) {
                      setDiscardOpen(true);
                    } else {
                      setScreen("projects");
                    }
                  }}
                  className="text-xs font-semibold text-[#64748B] hover:text-[#1E3A5F] cursor-pointer bg-transparent border-none"
                >
                  ← Discard & Cancel
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">
                    Step {createStep + 1} of 6
                  </span>
                  <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
                    <div style={{ width: `${((createStep + 1) / 6) * 100}%` }} className="h-full bg-[#1E3A5F]"></div>
                  </div>
                </div>
              </div>

              {/* Step 0: Choose draft creation path */}
              {createStep === 0 && (
                <div className="fx">
                  <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1 font-sans">Create a new project</h1>
                  <p className="text-xs text-gray-500 mb-8 font-sans">Choose how you want to build this project detail page in {dept}.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch font-sans">
                    {/* Option 1: AI Doc Extract */}
                    <div
                      onClick={() => setCreateStep(1)}
                      className="border border-slate-200 hover:border-[#7C3AED] rounded-2xl p-6 bg-white shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#7C3AED]">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>
                        </div>
                        {aiMode && (
                          <span className="text-[10px] font-bold text-[#7C3AED] bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1 font-sans">
                            ✦ Recommended
                          </span>
                        )}
                      </div>
                      <div className="mt-6">
                        <h3 className="text-sm font-bold text-[#1E3A5F]">Read Documents with AI</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          Upload project specifications, RFPs, or board meeting minutes. AI will read them and pre-fill the project details and timeline stages automatically.
                        </p>
                      </div>
                    </div>

                    {/* Option 2: Duplicate Existing */}
                    <div
                      onClick={() => {
                        const src = projects[0];
                        setCreateFields({
                          title: src.title + " (Copy)",
                          category: src.cat,
                          desc: src.desc,
                          funding: src.funding,
                          cost: src.cost,
                          sponsor: src.sponsor,
                          duration: src.duration,
                        });
                        setCreateStages(src.stages.map((st, sIdx) => ({
                          n: sIdx + 1,
                          title: st.title,
                          start: st.dates.split(" – ")[0] || st.dates,
                          end: st.dates.split(" – ")[1] || "",
                          singleDate: !st.dates.includes("–") && !st.dates.includes("-"),
                          summary: st.desc,
                          bullets: st.bullets,
                          status: "draft",
                          docs: [],
                          docsOpen: false,
                          ai: false,
                        })));
                        setCreateStep(3);
                        showToast(`Duplicated from ${src.title}`);
                      }}
                      className="border border-slate-200 hover:border-[#1E3A5F] rounded-2xl p-6 bg-white shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1E3A5F]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </div>
                      <div className="mt-6">
                        <h3 className="text-sm font-bold text-[#1E3A5F]">Duplicate Existing</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          Start by cloning an existing project's structure, timeline stages, and settings. Ideal for recurring annual programs.
                        </p>
                      </div>
                    </div>

                    {/* Option 3: Start from Scratch */}
                    <div
                      onClick={() => {
                        setCreateFields({
                          title: "",
                          category: "Roads",
                          desc: "",
                          funding: "",
                          cost: "",
                          sponsor: "",
                          duration: "",
                        });
                        setCreateStages([{
                          n: 1,
                          title: "Initial Planning",
                          start: "Upcoming",
                          end: "",
                          singleDate: true,
                          summary: "Describe what will happen in this stage.",
                          bullets: ["Key detail bullet"],
                          status: "draft",
                          docs: [],
                          docsOpen: false,
                          ai: false,
                        }]);
                        setCreateStep(3);
                      }}
                      className="border border-slate-200 hover:border-[#1E3A5F] rounded-2xl p-6 bg-white shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#475569]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"></path></svg>
                      </div>
                      <div className="mt-6">
                        <h3 className="text-sm font-bold text-[#1E3A5F]">Start from Scratch</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          Create a blank draft project and fill in all the details, location, funding, and timeline milestones manually.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Upload source documents */}
              {createStep === 1 && (
                <div className="max-w-[720px] mx-auto pb-10">
                  <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1 font-sans">Upload project documents</h1>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed font-sans">
                    AI will read your documents and pre-fill the project details and timeline stages in the next step. You can review and adjust everything before publishing.
                  </p>

                  {/* Upload Drop Zone */}
                  <div
                    onClick={() => {
                      setCreateFiles([
                        { name: "Road Paving 2026 — Process & Location Guide.pdf", type: "Process guide" },
                        { name: "Road Paving 2026 — Board Meeting Minutes.pdf", type: "Meeting minutes" },
                        { name: "Roadbotics Assessment 2024.pdf", type: "Assessment" },
                        { name: "Contractor Bid Summary — March 2026.pdf", type: "Budget document" },
                      ]);
                      showToast("4 Paving Project sample files loaded");
                    }}
                    className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/20 rounded-2xl min-h-[180px] flex flex-col items-center justify-center p-8 text-center cursor-pointer mb-6 transition-colors"
                  >
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" className="mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M17 8l-5-5-5 5"></path><path d="M12 3v12"></path></svg>
                    <div className="text-xs font-bold text-gray-700 font-sans">Drop your documents here, or click to load sample files</div>
                    <div className="text-[10px] text-gray-400 mt-1 font-sans">PDF, DOCX, or TXT files. Up to 10 files, 20MB each.</div>
                  </div>

                  {/* Ready files list */}
                  {createFiles.length > 0 && (
                    <div className="mb-6 font-sans animate-fadeIn">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Files ready to process</div>
                      {createFiles.map((file, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-xl p-3 mb-2 shadow-xs">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-700 font-bold truncate">{file.name}</div>
                          </div>
                          <span className="text-[9px] font-bold bg-purple-50 text-[#7C3AED] px-2 py-0.5 rounded shrink-0">{file.type}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCreateFiles(prev => prev.filter((_, idx) => idx !== fIdx));
                            }}
                            className="bg-transparent border-none text-[#94A3B8] hover:text-[#DC2626] font-bold text-base cursor-pointer px-1 shrink-0"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI context settings */}
                  <div className="border border-[#E2E8F0] rounded-xl mb-6 overflow-hidden bg-white">
                    <div
                      onClick={() => setCtxOpen(!ctxOpen)}
                      className="flex items-center gap-2 p-3.5 cursor-pointer bg-slate-50 border-b border-[#E2E8F0] select-none"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M12 8v4M12 16h.01"></path><circle cx="12" cy="12" r="10"></circle></svg>
                      <div className="text-xs font-bold text-[#334155] font-sans">Add context for AI (optional)</div>
                      <div className="flex-1"></div>
                      <span className="text-xs text-[#94A3B8]">{ctxOpen ? "▲" : "▼"}</span>
                    </div>
                    {ctxOpen && (
                      <div className="p-4 animate-fadeIn">
                        <textarea
                          value={createCtx}
                          onChange={(e) => setCreateCtx(e.target.value)}
                          placeholder="e.g., 'This is a recurring annual paving project' or 'Focus on the community engagement timeline'"
                          className="w-full min-h-[64px] border border-[#E2E8F0] rounded-lg p-3 text-xs outline-none font-sans"
                        />
                      </div>
                    )}
                  </div>

                  {/* Bottom bar */}
                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => setCreateStep(0)}
                      className="h-10 px-4 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                    >
                      Back
                    </button>
                    {createFiles.length > 0 && (
                      <button
                        onClick={() => startExtract("road")}
                        className="h-10 px-5 bg-[#7C3AED] hover:bg-[#6b21a8] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2"
                      >
                        ✦ Read Documents with AI
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: AI progressive document extraction */}
              {createStep === 2 && activeExtData && (
                <div className="fx">
                  <div className="flex items-center gap-3 mb-2 font-sans">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-[#7C3AED] shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.8L20 9l-5.8 1.9L12 17l-1.9-5.8L4 9l5.8-1.2z"></path></svg>
                    </div>
                    <div className="text-lg font-bold text-gray-900">{extTitle}</div>
                  </div>
                  <div className="h-2 bg-purple-100 rounded-full overflow-hidden mb-2">
                    <div style={{ width: `${extPct}%` }} className="h-full bg-[#7C3AED] transition-all duration-300"></div>
                  </div>
                  <div className="text-xs text-[#7C6FA6] mb-5 font-semibold font-sans">{extProgressText} ({extPct}%)</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-sans">
                    {/* LEFT: document text preview */}
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
                      <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-[#F1F5F9] font-sans">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>
                        <span className="text-xs font-semibold text-[#475569]">Scanning document sources...</span>
                        <div className="flex-1"></div>
                        {extRunning && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#7C3AED] bg-purple-50 border border-purple-200 rounded-full px-2.5 py-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED] animate-ping"></span>
                            Reading
                          </span>
                        )}
                      </div>
                      <div className="h-[460px] overflow-y-auto p-5 text-[11px] text-gray-600 leading-relaxed font-mono">
                        {activeExtData.paras.map((p: any) => (
                          <div
                            key={p.id}
                            style={{
                              backgroundColor: activeParaGlow === p.id ? "rgba(124, 58, 237, 0.08)" : "transparent",
                              padding: "4px 8px",
                              borderRadius: 4,
                              borderLeft: activeParaGlow === p.id ? "3px solid #7C3AED" : "3px solid transparent",
                              marginBottom: 8,
                              transition: "background-color 0.25s, border-left-color 0.25s",
                            }}
                          >
                            <span className="text-[9px] text-gray-400 mr-2 uppercase tracking-wide">P.{p.page} {p.kind}</span>
                            {p.text}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT: progressively extracted form */}
                    <div className="h-[500px] overflow-y-auto pr-1 flex flex-col gap-3">
                      {Object.keys(activeExtData.fields).map((k) => {
                        const fieldData = activeExtData.fields[k];
                        const isRevealed = revealedFields.includes(k);
                        if (!isRevealed) {
                          return (
                            <div key={k} className="bg-slate-50 border border-dashed border-[#E2E8F0] rounded-xl p-3">
                              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2 font-sans">{fieldData.label}</div>
                              <div className="h-3.5 bg-slate-200/50 rounded w-2/3 animate-pulse"></div>
                            </div>
                          );
                        }
                        return (
                          <div key={k} className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-xs animate-fadeIn">
                            <div className="flex items-center justify-between mb-1 font-sans">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{fieldData.label}</label>
                              <span className="text-[9px] font-bold text-[#7C3AED] bg-purple-50 border border-purple-100 rounded-full px-2 py-0.5 flex items-center gap-1 font-sans">
                                ✦ AI-suggested
                              </span>
                            </div>
                            <div className="text-xs text-gray-900 font-semibold leading-relaxed font-sans">{fieldData.value}</div>
                          </div>
                        );
                      })}

                      {/* Stages list */}
                      {extractedStagesCount > 0 && (
                        <div className="mt-4 animate-fadeIn">
                          <div className="flex items-center gap-1.5 mb-2.5 font-sans">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M12 2v20M5 8l7-6 7 6"></path></svg>
                            <span className="text-xs font-bold text-[#5B21B6] uppercase tracking-wider">Stages Extracted ({extractedStagesCount})</span>
                          </div>
                          <div className="flex flex-col gap-2 font-sans">
                            {activeExtData.stages.slice(0, extractedStagesCount).map((st: any, sIdx: number) => (
                              <div key={sIdx} className="flex gap-3 bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-xs animate-fadeIn">
                                <div className="h-6 w-6 rounded-full bg-[#EFF3F8] text-[#1E3A5F] font-bold text-xs flex items-center justify-center shrink-0 font-sans">
                                  {sIdx + 1}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-gray-900 truncate font-sans">{st.title}</div>
                                  <div className="text-[10px] text-gray-400 font-semibold font-sans">{st.dates || st.start}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confetti bit shower */}
                  {extConfetti && (
                    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
                      {confettiBits.map((bit, bitIdx) => (
                        <div key={bitIdx} style={bit.style} />
                      ))}
                    </div>
                  )}

                  {/* Bottom bar */}
                  <div className="flex justify-end gap-3 mt-6">
                    {extRunning && (
                      <button
                        onClick={skipExtract}
                        className="h-10 px-4 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                      >
                        Skip to End
                      </button>
                    )}
                    {extDone ? (
                      <button
                        onClick={continueToReview}
                        className="h-10 px-5 bg-[#7C3AED] hover:bg-[#6b21a8] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 animate-bounce"
                      >
                        Continue to Review →
                      </button>
                    ) : (
                      <button
                        disabled
                        className="h-10 px-5 bg-purple-100 text-purple-300 rounded-lg text-xs font-semibold cursor-not-allowed flex items-center gap-1.5"
                      >
                        Extracting...
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Review project details */}
              {createStep === 3 && (
                <div className="fx">
                  <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1 font-sans">Review project details</h1>
                  {aiMode ? (
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-2 font-sans">
                      <p className="text-xs text-purple-600 font-semibold">AI drafted the following based on your documents. Review each field carefully and adjust anything.</p>
                      <span className="text-[10px] font-bold bg-purple-50 text-[#7C3AED] px-2 py-0.5 rounded">✦ AI-suggested throughout</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mb-6 font-sans">Provide the key details for your new project draft below.</p>
                  )}

                  <div className="flex flex-col gap-5 font-sans">
                    {/* Title */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-gray-700">Project Title</label>
                        {aiMode && sourceDocs.length > 0 && (
                          <button
                            onClick={() => setSourceView(sourceView === "title" ? null : "title")}
                            className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 border-none cursor-pointer flex items-center gap-1"
                          >
                            👁 View source
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={createFields.title}
                        onChange={(e) => setCreateFields(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Road Paving 2026"
                        className="w-full h-11 border border-[#E2E8F0] rounded-xl px-3 font-semibold text-sm outline-none"
                      />
                      {sourceView === "title" && activeExtData && (
                        <div className="mt-2 bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-xs text-[#5B21B6] leading-relaxed animate-fadeIn">
                          <strong>Section:</strong> {activeExtData.fields.title?.section || "Document Header"}<br />
                          <strong>Passage:</strong> “{activeExtData.fields.title?.passage}”<br />
                          <strong>Reasoning:</strong> {activeExtData.fields.title?.reasoning}
                        </div>
                      )}
                    </div>

                    {/* Category + Dept */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">Category</label>
                          {aiMode && sourceDocs.length > 0 && (
                            <button
                              onClick={() => setSourceView(sourceView === "category" ? null : "category")}
                              className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 border-none cursor-pointer flex items-center gap-1"
                            >
                              👁 View source
                            </button>
                          )}
                        </div>
                        <select
                          value={createFields.category}
                          onChange={(e) => setCreateFields(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full h-10 border border-[#E2E8F0] rounded-xl px-2 text-xs outline-none bg-white font-sans"
                        >
                          <option value="Roads">Roads & Transportation</option>
                          <option value="Parks">Parks & Green Spaces</option>
                          <option value="Infrastructure">Infrastructure & Facilities</option>
                          <option value="Plan/Dev">Plan, Development & Sustainability</option>
                          <option value="Public Safety">Public Safety</option>
                        </select>
                        {sourceView === "category" && activeExtData && (
                          <div className="mt-2 bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-xs text-[#5B21B6] leading-relaxed animate-fadeIn">
                            <strong>Section:</strong> {activeExtData.fields.category?.section || "Document Content"}<br />
                            <strong>Passage:</strong> “{activeExtData.fields.category?.passage}”<br />
                            <strong>Reasoning:</strong> {activeExtData.fields.category?.reasoning}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                        <input
                          type="text"
                          disabled
                          value={dept}
                          className="w-full h-10 border border-[#E2E8F0] rounded-xl px-3 text-xs bg-slate-100 text-slate-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-gray-700">Description</label>
                        {aiMode && sourceDocs.length > 0 && (
                          <button
                            onClick={() => setSourceView(sourceView === "desc" ? null : "desc")}
                            className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 border-none cursor-pointer flex items-center gap-1"
                          >
                            👁 View source
                          </button>
                        )}
                      </div>
                      <textarea
                        value={createFields.desc}
                        onChange={(e) => setCreateFields(prev => ({ ...prev, desc: e.target.value }))}
                        placeholder="Write a public summary description of this project..."
                        className="w-full min-h-[80px] border border-[#E2E8F0] rounded-xl p-3 text-xs outline-none font-sans leading-relaxed"
                      />
                      {sourceView === "desc" && activeExtData && (
                        <div className="mt-2 bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-xs text-[#5B21B6] leading-relaxed animate-fadeIn">
                          <strong>Section:</strong> {activeExtData.fields.desc?.section || "Overview"}<br />
                          <strong>Passage:</strong> “{activeExtData.fields.desc?.passage}”<br />
                          <strong>Reasoning:</strong> {activeExtData.fields.desc?.reasoning}
                        </div>
                      )}
                    </div>

                    {/* Funding + Cost */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">Funding Source</label>
                          {aiMode && sourceDocs.length > 0 && (
                            <button
                              onClick={() => setSourceView(sourceView === "funding" ? null : "funding")}
                              className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 border-none cursor-pointer flex items-center gap-1"
                            >
                              👁 View source
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={createFields.funding}
                          onChange={(e) => setCreateFields(prev => ({ ...prev, funding: e.target.value }))}
                          placeholder="e.g., Township General Budget"
                          className="w-full h-10 border border-[#E2E8F0] rounded-xl px-3 text-xs outline-none"
                        />
                        {sourceView === "funding" && activeExtData && (
                          <div className="mt-2 bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-xs text-[#5B21B6] leading-relaxed animate-fadeIn">
                            <strong>Section:</strong> {activeExtData.fields.funding?.section || "Budget Details"}<br />
                            <strong>Passage:</strong> “{activeExtData.fields.funding?.passage}”<br />
                            <strong>Reasoning:</strong> {activeExtData.fields.funding?.reasoning}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">Total Project Cost</label>
                          {aiMode && sourceDocs.length > 0 && (
                            <button
                              onClick={() => setSourceView(sourceView === "cost" ? null : "cost")}
                              className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 border-none cursor-pointer flex items-center gap-1"
                            >
                              👁 View source
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={createFields.cost}
                          onChange={(e) => setCreateFields(prev => ({ ...prev, cost: e.target.value }))}
                          placeholder="e.g., $150,000"
                          className="w-full h-10 border border-[#E2E8F0] rounded-xl px-3 text-xs outline-none"
                        />
                        {sourceView === "cost" && activeExtData && (
                          <div className="mt-2 bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-xs text-[#5B21B6] leading-relaxed animate-fadeIn">
                            <strong>Section:</strong> {activeExtData.fields.cost?.section || "Estimates"}<br />
                            <strong>Passage:</strong> “{activeExtData.fields.cost?.passage}”<br />
                            <strong>Reasoning:</strong> {activeExtData.fields.cost?.reasoning}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sponsor + Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">Project Sponsor / Admin</label>
                          {aiMode && sourceDocs.length > 0 && (
                            <button
                              onClick={() => setSourceView(sourceView === "sponsor" ? null : "sponsor")}
                              className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 border-none cursor-pointer flex items-center gap-1"
                            >
                              👁 View source
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={createFields.sponsor}
                          onChange={(e) => setCreateFields(prev => ({ ...prev, sponsor: e.target.value }))}
                          placeholder="e.g., Public Works Department"
                          className="w-full h-10 border border-[#E2E8F0] rounded-xl px-3 text-xs outline-none"
                        />
                        {sourceView === "sponsor" && activeExtData && (
                          <div className="mt-2 bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-xs text-[#5B21B6] leading-relaxed animate-fadeIn">
                            <strong>Section:</strong> {activeExtData.fields.sponsor?.section || "Administration"}<br />
                            <strong>Passage:</strong> “{activeExtData.fields.sponsor?.passage}”<br />
                            <strong>Reasoning:</strong> {activeExtData.fields.sponsor?.reasoning}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">Project Duration / Dates</label>
                          {aiMode && sourceDocs.length > 0 && (
                            <button
                              onClick={() => setSourceView(sourceView === "duration" ? null : "duration")}
                              className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 border-none cursor-pointer flex items-center gap-1"
                            >
                              👁 View source
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={createFields.duration}
                          onChange={(e) => setCreateFields(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., Mar 2026 – Sep 2026"
                          className="w-full h-10 border border-[#E2E8F0] rounded-xl px-3 text-xs outline-none"
                        />
                        {sourceView === "duration" && activeExtData && (
                          <div className="mt-2 bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-xs text-[#5B21B6] leading-relaxed animate-fadeIn">
                            <strong>Section:</strong> {activeExtData.fields.duration?.section || "Timeline Overview"}<br />
                            <strong>Passage:</strong> “{activeExtData.fields.duration?.passage}”<br />
                            <strong>Reasoning:</strong> {activeExtData.fields.duration?.reasoning}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attached source docs list */}
                  {sourceDocs.length > 0 && (
                    <div className="mt-6 border border-[#E2E8F0] rounded-2xl bg-white p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>
                        <span className="text-xs font-bold text-gray-700 font-sans">Reference Documents Attached</span>
                      </div>
                      <div className="flex flex-wrap gap-2 font-sans">
                        {sourceDocs.map((doc, dIdx) => (
                          <div key={dIdx} className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs text-[#334155]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>
                            <span className="truncate max-w-[200px]">{doc.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom bar */}
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setCreateStep(sourceDocs.length > 0 ? 1 : 0)}
                      className="h-10 px-4 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCreateStep(4)}
                      className="h-10 px-5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Continue to Timeline →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Build Timeline stages */}
              {createStep === 4 && (
                <div className="max-w-[820px] mx-auto">
                  <div className="flex justify-between items-start gap-4 mb-2 font-sans">
                    <div>
                      <h1 className="text-2xl font-bold text-[#1E3A5F]">Build the timeline</h1>
                      <p className="text-xs text-gray-500 mt-1">Review the steps for this project. Drag or insert milestones to build the public timeline.</p>
                    </div>
                    {/* Template loader */}
                    <div className="relative">
                      <button
                        onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
                        className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#475569] cursor-pointer flex items-center gap-1"
                      >
                        Load a template ▼
                      </button>
                      {templateMenuOpen && (
                        <div className="absolute right-0 top-10 z-[50] w-[200px] bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-2 font-sans">
                          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider p-2">Presets</div>
                          <button
                            onClick={() => {
                              setCreateStages([
                                { n: 1, title: "Road Condition Assessment", start: "2024", end: "", singleDate: true, summary: "Assess road quality scoring 1 to 5.", bullets: ["Evaluate roads using Roadbotics scan"], status: "published", docs: [], docsOpen: false, ai: false },
                                { n: 2, title: "Board Approval to Advertise", start: "Jan 2026", end: "", singleDate: true, summary: "Request approval to advertise bids.", bullets: ["Board votes in public meeting"], status: "published", docs: [], docsOpen: false, ai: false },
                                { n: 3, title: "RFP scope & Bid opening", start: "Feb 2026", end: "Mar 2026", singleDate: false, summary: "Advertise scope and select contractor.", bullets: ["Choose lowest responsible bidder"], status: "published", docs: [], docsOpen: false, ai: false },
                                { n: 4, title: "Construction Milling & Paving", start: "May 2026", end: "Aug 2026", singleDate: false, summary: "Resurface streets and repaint markers.", bullets: ["Mill worn asphalt", "Lay new surface layer", "Paint lane lines"], status: "published", docs: [], docsOpen: false, ai: false },
                              ]);
                              setTemplateMenuOpen(false);
                              showToast("Loaded 'Road Paving' template");
                            }}
                            className="w-full text-left p-2 rounded text-xs text-[#0f172a] hover:bg-slate-50 border-none bg-transparent cursor-pointer font-sans"
                          >
                            Road Paving
                          </button>
                          <button
                            onClick={() => {
                              setCreateStages([
                                { n: 1, title: "Feasibility Study & Survey", start: "Mar 2026", end: "", singleDate: true, summary: "Survey boundaries and evaluate grading.", bullets: ["Boundary mapping", "Soil testing"], status: "published", docs: [], docsOpen: false, ai: false },
                                { n: 2, title: "Landscape Architecture Design", start: "Jun 2026", end: "Aug 2026", singleDate: false, summary: "Prepare blueprint drafts for park components.", bullets: ["Draft architectural plan", "Collect citizen feedback"], status: "published", docs: [], docsOpen: false, ai: false },
                                { n: 3, title: "Grading & Construction", start: "Sep 2026", end: "May 2027", singleDate: false, summary: "Clear ground and build park facilities.", bullets: ["Install playground gear", "Pave trail loops"], status: "published", docs: [], docsOpen: false, ai: false },
                              ]);
                              setTemplateMenuOpen(false);
                              showToast("Loaded 'Parks Project' template");
                            }}
                            className="w-full text-left p-2 rounded text-xs text-[#0f172a] hover:bg-slate-50 border-none bg-transparent cursor-pointer font-sans"
                          >
                            Parks Development
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage editor lists */}
                  <div className="flex flex-col gap-4 mt-6 font-sans">
                    {createStages.map((st, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-2xl bg-white p-5 relative shadow-xs">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-[#EFF3F8] text-[#1E3A5F] font-bold text-xs flex items-center justify-center font-sans">
                              {st.n}
                            </span>
                            {st.ai && (
                              <span className="text-[9px] font-bold bg-purple-50 text-[#7C3AED] px-2 py-0.5 rounded">
                                ✦ AI-suggested
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {aiMode && (
                              <button
                                onClick={() => {
                                  simulateRewrite(st.summary, (rewritten) => {
                                    setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, summary: rewritten, rewritten: true, rewriteFrom: s.summary } : s));
                                  });
                                }}
                                className="h-7 px-3 bg-purple-50 text-[#7C3AED] rounded text-[10px] font-bold cursor-pointer border-none"
                              >
                                ✦ Rewrite (AI)
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setCreateStages(prev => prev.filter((_, sIdx) => sIdx !== idx).map((s, sIdx) => ({ ...s, n: sIdx + 1 })));
                                showToast("Stage removed");
                              }}
                              className="text-xs text-red-600 font-bold border-none bg-transparent cursor-pointer px-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Title input */}
                        <div className="mb-3">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stage Title</label>
                          <input
                            type="text"
                            value={st.title}
                            onChange={(e) => setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, title: e.target.value } : s))}
                            placeholder="e.g., Road Condition Assessment"
                            className="w-full h-9 border border-[#E2E8F0] rounded-lg px-2.5 text-xs font-semibold outline-none"
                          />
                        </div>

                        {/* Date inputs */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Timeframe</label>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, singleDate: false } : s))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border-none cursor-pointer ${!st.singleDate ? "bg-[#1E3A5F] text-white" : "bg-slate-100 text-slate-500"}`}
                              >
                                Range
                              </button>
                              <button
                                onClick={() => setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, singleDate: true } : s))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border-none cursor-pointer ${st.singleDate ? "bg-[#1E3A5F] text-white" : "bg-slate-100 text-slate-500"}`}
                              >
                                Single Date
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={st.start}
                              onChange={(e) => setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, start: e.target.value } : s))}
                              placeholder="Start Date"
                              className="h-9 border border-[#E2E8F0] rounded-lg px-2.5 text-xs outline-none"
                            />
                            {!st.singleDate && (
                              <input
                                type="text"
                                value={st.end}
                                onChange={(e) => setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, end: e.target.value } : s))}
                                placeholder="End Date"
                                className="h-9 border border-[#E2E8F0] rounded-lg px-2.5 text-xs outline-none"
                              />
                            )}
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="mb-3">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Summary Sentence</label>
                          <textarea
                            value={st.summary}
                            onChange={(e) => setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, summary: e.target.value } : s))}
                            placeholder="Describe in one sentence what happens in this stage..."
                            className="w-full min-h-[50px] border border-[#E2E8F0] rounded-lg p-2.5 text-xs outline-none font-sans leading-relaxed"
                          />
                        </div>

                        {/* Bullets */}
                        <div className="mb-3">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Key details (Bullets)</label>
                          {st.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2 mb-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0"></span>
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => {
                                  const updatedBullets = [...st.bullets];
                                  updatedBullets[bIdx] = e.target.value;
                                  setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, bullets: updatedBullets } : s));
                                }}
                                placeholder="Add key detail for residents to scan"
                                className="flex-1 h-8 border border-[#E2E8F0] rounded-lg px-2.5 text-xs outline-none"
                              />
                              <button
                                onClick={() => {
                                  const updatedBullets = st.bullets.filter((_, bK) => bK !== bIdx);
                                  setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, bullets: updatedBullets } : s));
                                }}
                                className="bg-transparent border-none text-[#94A3B8] hover:text-[#DC2626] font-bold text-lg cursor-pointer px-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const updatedBullets = [...st.bullets, ""];
                              setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, bullets: updatedBullets } : s));
                            }}
                            className="text-[11px] font-bold text-[#1E3A5F] bg-transparent border-none cursor-pointer mt-1"
                          >
                            + Add Bullet Point
                          </button>
                        </div>

                        {/* Publish status */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Publish Status</label>
                          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg max-w-[280px]">
                            {["draft", "published", "hidden"].map((statusOption) => (
                              <button
                                key={statusOption}
                                onClick={() => setCreateStages(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, status: statusOption as any } : s))}
                                className={`flex-1 py-1 rounded text-[10px] font-bold border-none cursor-pointer uppercase ${st.status === statusOption ? "bg-white text-[#1e3a5f] shadow-xs" : "bg-transparent text-slate-500"}`}
                              >
                                {statusOption}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const nextN = createStages.length + 1;
                      setCreateStages(prev => [...prev, {
                        n: nextN,
                        title: `Stage ${nextN}`,
                        start: "Upcoming",
                        end: "",
                        singleDate: true,
                        summary: "Describe what will happen in this stage.",
                        bullets: [],
                        status: "draft",
                        docs: [],
                        docsOpen: false,
                        ai: false,
                      }]);
                      showToast("Stage added");
                    }}
                    className="w-full h-12 bg-slate-50 hover:bg-slate-100 border border-dashed border-[#CBD5E1] rounded-2xl font-bold text-xs text-slate-600 cursor-pointer mt-4 flex items-center justify-center"
                  >
                    + Add Timeline Stage
                  </button>

                  {/* Bottom bar */}
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setCreateStep(3)}
                      className="h-10 px-4 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (createStages.length === 0) {
                          showToast("Please add at least one stage");
                          return;
                        }
                        setCreateStep(5);
                      }}
                      className="h-10 px-5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Preview & Publish →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Preview and Publish */}
              {createStep === 5 && (
                <div className="fx">
                  <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1 font-sans">Preview &amp; Publish</h1>
                  <p className="text-xs text-gray-500 mb-6 font-sans">This is exactly what residents will see. Review the preview and complete the compliance checklist to publish.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* LEFT 2 Columns: Resident view live preview */}
                    <div className="lg:col-span-2 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                      <div className="bg-[#0D2240] text-white p-3 flex justify-between items-center text-xs font-sans">
                        <span>RESIDENT PUBLIC PREVIEW</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewMode("desktop")}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border-none cursor-pointer ${previewMode === "desktop" ? "bg-white text-[#0D2240]" : "bg-transparent text-white/60"}`}
                          >
                            Desktop
                          </button>
                          <button
                            onClick={() => setPreviewMode("mobile")}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border-none cursor-pointer ${previewMode === "mobile" ? "bg-white text-[#0D2D56]" : "bg-transparent text-white/60"}`}
                          >
                            Mobile
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[560px] overflow-y-auto bg-white">
                        <div style={{ maxWidth: previewMode === "mobile" ? 420 : "100%", margin: "0 auto", border: previewMode === "mobile" ? "8px solid #0F172A" : "none", borderRadius: previewMode === "mobile" ? "20px" : "0" }}>
                          {/* Mapped proposal page shell preview */}
                          <img
                            src="https://picsum.photos/seed/paving-preview/1200/400"
                            alt="Preview Hero"
                            className="w-full h-44 object-cover"
                          />
                          <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight font-sans">{createFields.title || "Untitled Project"}</h2>
                            <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500 border-b border-gray-100 pb-3 font-sans">
                              <span>Sponsor: {createFields.sponsor}</span>
                              <span>Duration: {createFields.duration}</span>
                              <span>Cost: {createFields.cost}</span>
                            </div>
                            
                            <p className="text-xs text-gray-600 leading-relaxed mt-4 font-sans">{createFields.desc || "No description provided."}</p>

                            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 font-sans">
                              <div><strong>Funding:</strong> {createFields.funding}</div>
                              <div><strong>Category:</strong> {createFields.category}</div>
                            </div>

                            {/* ProjectMapCard Preview */}
                            <div className="mt-6 border border-[#e5e7eb] rounded-xl p-4 bg-white shadow-xs font-sans">
                              <h3 className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-2">Location Map</h3>
                              <div className="h-[140px] bg-slate-100 rounded-lg flex items-center justify-center border border-[#e5e7eb] text-gray-400 text-xs">
                                Map View
                              </div>
                            </div>

                            {/* Timeline preview */}
                            <div className="mt-6">
                              <Timeline
                                stages={createStages.filter(s => s.status === "published").map((s, sIdx) => ({
                                  label: s.title,
                                  status: sIdx === previewStage ? "current" as const : sIdx < previewStage ? "completed" as const : "future" as const,
                                  date: s.start + (s.end ? ` – ${s.end}` : ""),
                                  description: s.summary,
                                  bullets: s.bullets,
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT 1 Column: Compliance checklist & publish buttons */}
                    <div className="border border-slate-200 rounded-2xl bg-white p-5 shadow-xs font-sans">
                      <h3 className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-4">Compliance Checklist</h3>
                      
                      <div className="flex flex-col gap-3 font-sans text-xs text-gray-700">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none leading-normal">
                          <input
                            type="checkbox"
                            checked={compliance.rtk}
                            onChange={(e) => setCompliance(prev => ({ ...prev, rtk: e.target.checked }))}
                            className="mt-0.5 cursor-pointer"
                          />
                          <span>Documents and descriptions comply with PA Right-to-Know standards.</span>
                        </label>
                        
                        <label className="flex items-start gap-2.5 cursor-pointer select-none leading-normal">
                          <input
                            type="checkbox"
                            checked={compliance.mgr}
                            onChange={(e) => setCompliance(prev => ({ ...prev, mgr: e.target.checked }))}
                            className="mt-0.5 cursor-pointer"
                          />
                          <span>Draft reviewed and authorized by the Township Manager's office.</span>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer select-none leading-normal">
                          <input
                            type="checkbox"
                            checked={compliance.acc}
                            onChange={(e) => setCompliance(prev => ({ ...prev, acc: e.target.checked }))}
                            className="mt-0.5 cursor-pointer"
                          />
                          <span>Formatting complies with WCAG accessibility guidelines.</span>
                        </label>
                      </div>

                      <div className="mt-8 flex flex-col gap-2.5">
                        <button
                          onClick={() => {
                            // save as draft
                            const id = "proj-" + Date.now();
                            const newProj: Project = {
                              id,
                              title: createFields.title || "Untitled Project",
                              cat: createFields.category as any,
                              deptShort: "Admin",
                              dept: dept,
                              status: "Draft",
                              cost: createFields.cost || "—",
                              funding: createFields.funding || "—",
                              edited: "just now",
                              followers: 0,
                              current: 1,
                              desc: createFields.desc,
                              sponsor: createFields.sponsor,
                              duration: createFields.duration,
                              stages: createStages.map((s, sIdx) => ({
                                n: sIdx + 1,
                                title: s.title,
                                dates: s.start + (s.end ? ` – ${s.end}` : ""),
                                desc: s.summary,
                                bullets: s.bullets,
                                state: s.status === "published" ? "Published" : "Draft"
                              })),
                              poll: { support: 0, oppose: 0, neutral: 0, verified: { s: 0, o: 0, n: 0 }, trend: [] },
                              sentiment: { supportive: 100, mixed: 0, concerns: 0 },
                              themes: [],
                              privateMsgs: [],
                              public: [],
                              hidden: [],
                              rejected: [],
                              lc: "draft",
                            };
                            setProjects([newProj, ...projects]);
                            showToast("Project saved as Draft");
                            setScreen("projects");
                          }}
                          className="w-full h-10 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-[#1E3A5F] cursor-pointer"
                        >
                          Save as Draft
                        </button>
                        
                        <button
                          disabled={!compliance.rtk || !compliance.mgr || !compliance.acc}
                          onClick={() => {
                            // publish live
                            const id = "proj-" + Date.now();
                            const newProj: Project = {
                              id,
                              title: createFields.title || "Untitled Project",
                              cat: createFields.category as any,
                              deptShort: "Admin",
                              dept: dept,
                              status: "Active",
                              cost: createFields.cost || "—",
                              funding: createFields.funding || "—",
                              edited: "just now",
                              followers: 0,
                              current: 1,
                              desc: createFields.desc,
                              sponsor: createFields.sponsor,
                              duration: createFields.duration,
                              stages: createStages.map((s, sIdx) => ({
                                n: sIdx + 1,
                                title: s.title,
                                dates: s.start + (s.end ? ` – ${s.end}` : ""),
                                desc: s.summary,
                                bullets: s.bullets,
                                state: s.status === "published" ? "Published" : "Draft"
                              })),
                              poll: { support: 0, oppose: 0, neutral: 0, verified: { s: 0, o: 0, n: 0 }, trend: [] },
                              sentiment: { supportive: 100, mixed: 0, concerns: 0 },
                              themes: [],
                              privateMsgs: [],
                              public: [],
                              hidden: [],
                              rejected: [],
                              lc: "published",
                            };
                            setProjects([newProj, ...projects]);
                            setPublishSuccess({ title: newProj.title, id: newProj.id });
                            showToast("Project published live!");
                          }}
                          className={`w-full h-10 rounded-lg text-xs font-bold text-white border-none cursor-pointer ${compliance.rtk && compliance.mgr && compliance.acc ? "bg-[#16A34A] hover:bg-[#11803a]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                        >
                          Approve &amp; Publish Live
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="flex justify-start mt-6 font-sans">
                    <button
                      onClick={() => setCreateStep(4)}
                      className="h-10 px-4 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* Discard Draft warning modal */}
              {discardOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="w-[420px] bg-white rounded-2xl p-6 shadow-2xl font-sans animate-fadeIn">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Discard project draft?</h3>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                      Are you sure you want to discard this project draft? All entered fields, uploaded reference files, and timeline stages will be permanently lost.
                    </p>
                    <div className="flex justify-end gap-2.5">
                      <button
                        onClick={() => setDiscardOpen(false)}
                        className="h-9 px-4 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                      >
                        Keep Editing
                      </button>
                      <button
                        onClick={() => {
                          setDiscardOpen(false);
                          setScreen("projects");
                        }}
                        className="h-9 px-4 bg-[#DC2626] text-white rounded-lg text-xs font-semibold cursor-pointer border-none"
                      >
                        Discard Draft
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Publish success modal overlay */}
              {publishSuccess && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="w-[440px] bg-white rounded-2xl p-7 shadow-2xl text-center font-sans animate-fadeIn">
                    <div className="h-12 w-12 rounded-full bg-green-50 text-[#16A34A] flex items-center justify-center mx-auto mb-4 text-xl">
                      ✓
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{publishSuccess.title} is now Live</h3>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                      The project is now published on the public resident portal. Residents will receive alerts if they are following this department's categories.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          const pId = publishSuccess.id;
                          setPublishSuccess(null);
                          openProj(pId);
                        }}
                        className="h-9 px-5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-lg text-xs font-semibold cursor-pointer border-none"
                      >
                        Go to Project Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
          {screen === "feedback" && (
            <div className="max-w-[1240px] mx-auto px-7 py-6">
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-1 font-sans">Cross-Project Feedback Center</h2>
              <p className="text-xs text-[#64748B] mb-5 font-sans">
                Monitor and moderate all public comments and private messages township-wide.
              </p>

              {/* Feed items */}
              <div className="flex flex-col gap-4">
                {projects.map((p) => {
                  const items = [...p.public, ...p.privateMsgs, ...p.hidden];
                  if (items.length === 0) return null;
                  return (
                    <div key={p.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <h3 className="text-xs font-bold text-[#2563EB] mb-3 font-sans">{p.title}</h3>
                      <div className="flex flex-col gap-3">
                        {items.map((c) => (
                          <div key={c.id} className="border-t border-[#F1F5F9] pt-3 flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 font-sans">
                                <span className="text-xs font-bold text-[#1E3A5F]">{c.name}</span>
                                <span className="text-[10px] text-[#94A3B8]">{c.time}</span>
                              </div>
                              <p className="text-xs text-[#475569] font-sans">{c.text}</p>
                            </div>
                            <button
                              onClick={() => openProj(p.id, "feedback")}
                              className="text-[11px] font-semibold text-[#1e3a5f] hover:underline cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1 rounded font-sans"
                            >
                              Open in Project
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── INSIGHTS SCREEN ── */}
          {screen === "insights" && (
            <div className="max-w-[1240px] mx-auto px-7 py-6">
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-1 font-sans">Insights Dashboard</h2>
              <p className="text-xs text-[#64748B] mb-5 font-sans">
                Which projects need your attention, and what residents are saying about them.
              </p>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 border border-[#E2E8F0] rounded-xl shadow-xs font-sans">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase">Timeframe</label>
                  <select
                    value={sentTime}
                    onChange={(e) => setSentTime(e.target.value)}
                    className="h-9 border border-[#E2E8F0] rounded-lg px-2 text-xs bg-white outline-none"
                  >
                    <option value="all">All time</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase">Scope</label>
                  <select
                    value={sentScope}
                    onChange={(e) => setSentScope(e.target.value)}
                    className="h-9 border border-[#E2E8F0] rounded-lg px-2 text-xs bg-white outline-none"
                  >
                    <option value="all">All departments</option>
                    <option value="dept">This department</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase">Status</label>
                  <select
                    value={sentStatus}
                    onChange={(e) => setSentStatus(e.target.value)}
                    className="h-9 border border-[#E2E8F0] rounded-lg px-2 text-xs bg-white outline-none"
                  >
                    <option value="all">All statuses</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 font-sans">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                  <div className="text-xl font-bold text-[#0F172A]">{filteredInsightsProjects.length}</div>
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase mt-1">Projects</div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                  <div className="text-xl font-bold text-[#0F172A]">{totalInsightsComments}</div>
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase mt-1">Comments</div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                  <div className="text-xl font-bold text-[#0F172A]">{totalInsightsResidents}</div>
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase mt-1">Residents</div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                  <div className="text-xl font-bold text-[#D97706]">73%</div>
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase mt-1">Response Rate</div>
                </div>
              </div>

              {/* Sentiment Table */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm font-sans">
                <div className="grid grid-cols-5 gap-4 p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  <div className="col-span-2">Project</div>
                  <div>Sentiment Breakdown</div>
                  <div>Overall Sentiment</div>
                  <div>Top Theme Summary</div>
                </div>

                <div className="divide-y divide-[#F1F5F9]">
                  {insightsRows.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => openProj(r.id, "feedback")}
                      className="grid grid-cols-5 gap-4 p-4 text-xs items-center cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="col-span-2">
                        <div className="font-semibold text-sm text-[#0F172A]">{r.title}</div>
                        <div className="text-[10px] text-[#94A3B8] mt-1">{r.dept}</div>
                      </div>

                      <div>
                        {aiMode ? (
                          <div className="flex h-2.5 rounded-full overflow-hidden w-[140px] bg-slate-100">
                            <div style={{ width: `${r.supportVal}%` }} className="bg-[#16A34A]" />
                            <div style={{ width: `${r.mixedVal}%` }} className="bg-[#D97706]" />
                            <div style={{ width: `${r.concernsVal}%` }} className="bg-[#DC2626]" />
                          </div>
                        ) : (
                          <div className="h-2 w-[140px] rounded-full bg-[#E2E8F0]" />
                        )}
                      </div>

                      <div>
                        {aiMode ? (
                          <span className={`font-bold ${r.overallColor}`}>{r.overallText}</span>
                        ) : (
                          <span className="text-[#94A3B8]">Not classified</span>
                        )}
                      </div>

                      <div className="pr-4">
                        {aiMode ? (
                          <span className="text-[#475569] leading-relaxed line-clamp-2">{r.themeText}</span>
                        ) : (
                          <span className="text-[#94A3B8] italic flex items-center gap-1.5">
                            AI Assistance required
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── REPORTS CREATOR SCREEN ── */}
          {screen === "reports" && (
            <div className="max-w-[1240px] mx-auto px-7 py-6 font-sans">
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-1">Reports Generator</h2>
              <p className="text-xs text-[#64748B] mb-5">
                Generate formatted reports from community feedback and timeline results.
              </p>

              {/* Welcome box */}
              {rptWelcome && (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex gap-3 mb-6">
                  <div className="flex-1 text-xs text-[#475569] leading-relaxed">
                    Reports helps you compile public engagement data into ready-to-share board packages, grant application attachments, and comprehensive plans.
                  </div>
                  <button
                    onClick={() => setRptWelcome(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold border-none bg-transparent cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Template grid */}
              <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wider mb-3">
                Templates & Formats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {reportsTemplateList.map((tmpl, idx) => (
                  <div
                    key={idx}
                    onClick={() => showToast(`Report generated: ${tmpl.name}`)}
                    className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-xl p-4 shadow-sm cursor-pointer transition-colors"
                  >
                    <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mb-1">
                      {tmpl.type}
                    </div>
                    <h4 className="text-sm font-bold text-[#1E3A5F] mb-2">{tmpl.name}</h4>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-medium text-[#64748B]">
                      {tmpl.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
