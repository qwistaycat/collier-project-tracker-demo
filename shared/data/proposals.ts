// ================================================================
//  DATA LAYER — single source of truth for all proposals and content.
//  Ported from the vanilla JS inline data.
// ================================================================

// ── Tag Constants ────────────────────────────────────────────────

/** Five resident-facing functional categories shown on the dashboard */
export type FunctionalCategory =
  | "Roads & Transportation"
  | "Parks & Green Spaces"
  | "Infrastructure & Facilities"
  | "Plan, Development & Sustainability"
  | "Public Safety";

export const FUNCTIONAL_CATEGORIES: FunctionalCategory[] = [
  "Roads & Transportation",
  "Parks & Green Spaces",
  "Infrastructure & Facilities",
  "Plan, Development & Sustainability",
  "Public Safety",
];

/** Collier Township departments — used in filter UI and government interface */
export type Department =
  | "Public Works"
  | "Parks & Recreation"
  | "EMS & Fire Services"
  | "Police Department"
  | "Planning, Zoning, & Land Development"
  | "Administration"
  | "Sewer Department";

export const DEPARTMENTS: Department[] = [
  "Public Works",
  "Parks & Recreation",
  "EMS & Fire Services",
  "Police Department",
  "Planning, Zoning, & Land Development",
  "Administration",
  "Sewer Department",
];

// ── Types ────────────────────────────────────────────────────────

export interface ProposalCard {
  id: string;
  title: string;
  /** Resident-facing functional category (one of the five) */
  functionalCategory: FunctionalCategory;
  /** Township department responsible for this proposal */
  department: Department;
  updated: string;
  description: string;
  image: string;
  link: string;
}

export interface DashboardSection {
  title: string;
  dynamic?: boolean;
  cards?: ProposalCard[];
}

export interface SidebarProposal {
  title: string;
  updated: string;
  isCurrent?: boolean;
  link: string;
}

export interface MetadataItem {
  label: string;
  value: string;
}

export interface ProposalDetail {
  id: string;
  title: string;
  heroImage: string;
  lastUpdated: string;
  projectLink: string;
  meetingLink: string;
  description: string;
  funding: string;
  details: string;
  metadata: MetadataItem[];
}

export interface TimelineStage {
  label: string;
  status: "completed" | "current" | "future";
  date: string;
  description: string;
  bullets: string[];
}

export interface Reply {
  user: string;
  isOfficial?: boolean;
  avatarColor: string;
  timeAgo: string;
  replyTo?: string;
  message: string;
}

export interface Comment {
  user: string;
  isOfficial?: boolean;
  avatarColor: string;
  timeAgo: string;
  message: string;
  replies: Reply[];
}

export interface PastFeedbackItem {
  time: string;
  message: string;
}

export interface PrivateDiscussion {
  descriptions: [string, string];
  placeholder: string;
  buttonLabel: string;
  pastFeedback: PastFeedbackItem[];
}

export interface PublicDiscussion {
  descriptions: [string, string];
  placeholder: string;
  buttonLabel: string;
  viewCount: number;
  comments: Comment[];
}

export interface DiscussionData {
  private: PrivateDiscussion;
  public: PublicDiscussion;
}

// ── Proposal Registry ────────────────────────────────────────────

export const proposalRegistry: Record<string, ProposalCard> = {
  // ── Roads & Transportation ───────────────────────────────────────
  "road-paving-2026": {
    id: "road-paving-2026",
    title: "Road Paving 2026",
    functionalCategory: "Roads & Transportation",
    department: "Public Works",
    updated: "Updated 1 week ago",
    description:
      "Resurfacing six residential streets: Maclaine Dr, Turnberry Dr, Sunnyside Ave, Columbia Ave, Highlandview Dr, and Walker Ave.",
    image: "https://picsum.photos/seed/roadpaving/600/340",
    link: "/proposal",
  },
  "lobaugh-drive": {
    id: "lobaugh-drive",
    title: "Private Road Maintenance – Lobaugh Drive",
    functionalCategory: "Roads & Transportation",
    department: "Public Works",
    updated: "Updated 3 days ago",
    description:
      "Addressing maintenance obligations and cost-sharing for Lobaugh Drive, a privately owned road within the township.",
    image: "https://picsum.photos/seed/lobaughdrive/600/340",
    link: "/proposal",
  },
  // ── Parks & Green Spaces ─────────────────────────────────────────
  "collier-park-upgrades": {
    id: "collier-park-upgrades",
    title: "Collier Park & Ballfield Upgrades",
    functionalCategory: "Parks & Green Spaces",
    department: "Parks & Recreation",
    updated: "Updated 5 days ago",
    description:
      "Renovating athletic fields and recreational facilities at Collier Township Park, including dugout improvements and field drainage.",
    image: "https://picsum.photos/seed/ballfield/600/340",
    link: "/proposal",
  },
  "hilltop-park": {
    id: "hilltop-park",
    title: "Hilltop Park Expansion",
    functionalCategory: "Parks & Green Spaces",
    department: "Parks & Recreation",
    updated: "Updated 2 weeks ago",
    description:
      "This project improves Hilltop Park by adding new recreation space and permanent facilities. It focuses on access, safety, and capacity during high-use times.",
    image: "https://picsum.photos/seed/hilltoppark/600/340",
    link: "/proposal",
  },
  // ── Infrastructure & Facilities ──────────────────────────────────
  "police-remodeling": {
    id: "police-remodeling",
    title: "Police Department Facility Remodeling",
    functionalCategory: "Infrastructure & Facilities",
    department: "Police Department",
    updated: "Updated 2 weeks ago",
    description:
      "Renovating and modernizing the Collier Township Police Department building to improve operational capacity and staff facilities.",
    image: "https://picsum.photos/seed/policedept/600/340",
    link: "/proposal",
  },
  "fire-station-presto": {
    id: "fire-station-presto",
    title: "Fire Station Upgrades – Presto",
    functionalCategory: "Infrastructure & Facilities",
    department: "EMS & Fire Services",
    updated: "Updated 1 week ago",
    description:
      "Capital improvements to the Presto Volunteer Fire Department station, including structural repairs and equipment storage upgrades.",
    image: "https://picsum.photos/seed/firestationpresto/600/340",
    link: "/proposal",
  },
  "fire-station-rennerdale": {
    id: "fire-station-rennerdale",
    title: "Fire Station Upgrades – Rennerdale",
    functionalCategory: "Infrastructure & Facilities",
    department: "EMS & Fire Services",
    updated: "Updated 1 week ago",
    description:
      "Capital improvements to the Rennerdale Volunteer Fire Department station, including bay expansion and safety system upgrades.",
    image: "https://picsum.photos/seed/firestationrennerdale/600/340",
    link: "/proposal",
  },
  "community-center-parking": {
    id: "community-center-parking",
    title: "Community Center Parking Lot",
    functionalCategory: "Infrastructure & Facilities",
    department: "Parks & Recreation",
    updated: "Updated 4 days ago",
    description:
      "Resurfacing and restriping the parking lot at Collier Township Community Center to improve safety and capacity.",
    image: "https://picsum.photos/seed/parkinglot/600/340",
    link: "/proposal",
  },
  "ms4-stormwater": {
    id: "ms4-stormwater",
    title: "MS4 Stormwater Projects",
    functionalCategory: "Infrastructure & Facilities",
    department: "Sewer Department",
    updated: "Updated 2 days ago",
    description:
      "Municipal Separate Storm Sewer System compliance projects to manage stormwater runoff and meet DEP permit requirements.",
    image: "https://picsum.photos/seed/stormwater/600/340",
    link: "/proposal",
  },
  // ── Plan, Development & Sustainability ───────────────────────────
  "new-development": {
    id: "new-development",
    title: "New Development Review",
    functionalCategory: "Plan, Development & Sustainability",
    department: "Planning, Zoning, & Land Development",
    updated: "Updated 3 days ago",
    description:
      "Review and processing of new residential and commercial development applications under current township land use ordinances.",
    image: "https://picsum.photos/seed/newdevelopment/600/340",
    link: "/proposal",
  },
  "ordinance-updates": {
    id: "ordinance-updates",
    title: "Township Ordinance Updates",
    functionalCategory: "Plan, Development & Sustainability",
    department: "Planning, Zoning, & Land Development",
    updated: "Updated 1 week ago",
    description:
      "Revision of township ordinances to reflect current zoning standards, land use policy, and state regulatory requirements.",
    image: "https://picsum.photos/seed/ordinance/600/340",
    link: "/proposal",
  },
  // ── Public Safety ────────────────────────────────────────────────
  "fire-dept-consolidation": {
    id: "fire-dept-consolidation",
    title: "Fire Department Consolidation",
    functionalCategory: "Public Safety",
    department: "EMS & Fire Services",
    updated: "Updated 2 weeks ago",
    description:
      "Evaluating consolidation options among Collier's three volunteer fire departments to improve emergency response and reduce operational costs.",
    image: "https://picsum.photos/seed/fireconsolidate/600/340",
    link: "/proposal",
  },
  "ems-grants": {
    id: "ems-grants",
    title: "EMS Grants",
    functionalCategory: "Public Safety",
    department: "EMS & Fire Services",
    updated: "Updated 5 days ago",
    description:
      "Pursuing state and federal grant funding to support emergency medical services equipment, training, and personnel across the township.",
    image: "https://picsum.photos/seed/emsgrants/600/340",
    link: "/proposal",
  },
};

// ── Dashboard Sections ───────────────────────────────────────────
// Resident-facing dashboard: one section per functional category,
// plus a dynamic "Your Followed Projects" section at the top.

export const dashboardSections: DashboardSection[] = [
  {
    title: "Your Followed Projects",
    dynamic: true,
  },
  ...FUNCTIONAL_CATEGORIES.map((cat) => ({
    title: cat,
    cards: Object.values(proposalRegistry).filter(
      (p) => p.functionalCategory === cat
    ),
  })),
];

// ── Sidebar Proposals ────────────────────────────────────────────

export const sidebarProposals: SidebarProposal[] = [
  {
    title: "Hilltop Park Expansion",
    updated: "June 10, 2026",
    isCurrent: true,
    link: "/proposal",
  },
  {
    title: "Nevilewood Traffic Management Plan",
    updated: "June 8, 2026",
    link: "/proposal",
  },
  {
    title: "Small-Scale Mixed-Use Development",
    updated: "June 5, 2026",
    link: "/proposal",
  },
  {
    title: "Sidewalk and Pedestrian Safety Improvement",
    updated: "June 3, 2026",
    link: "/proposal",
  },
  {
    title: "Conservation Easement on Undeveloped Green Space",
    updated: "May 28, 2026",
    link: "/proposal",
  },
];

// ── Proposal Detail ──────────────────────────────────────────────

export const proposalData: ProposalDetail = {
  id: "hilltop-park",
  title: "Hilltop Park Expansion",
  heroImage: "https://picsum.photos/seed/hilltoppark/1200/400",
  lastUpdated: "June 10, 2026",
  projectLink: "#",
  meetingLink: "#",
  description:
    "This project improves Hilltop Park by adding new recreation space and permanent facilities. It focuses on access, safety, and capacity during high-use times.",
  funding:
    "The project would be paid for using township savings, a state grant application, and a proposed $200,000 bond.",
  details:
    "Phase One, planned for 2026, would add two new sports courts, a new accessible playground, and 40 more parking spaces. Phase Two, planned for 2027, would add a covered pavilion, better trail lighting, and permanent restrooms.",
  metadata: [
    {
      label: "Project Sponsor",
      value: "Collier Township\nParks Department",
    },
    { label: "Duration", value: "Jan 2026 - Feb 2027" },
    { label: "Total Project Cost", value: "$1.2 million" },
  ],
};

// ── Timeline ─────────────────────────────────────────────────────

export const timelineStages: TimelineStage[] = [
  {
    label: "Proposal Submitted",
    status: "completed",
    date: "January 2026",
    description:
      "The Hilltop Park Expansion proposal was formally submitted to the Collier Township Parks Department for review and consideration.",
    bullets: [],
  },
  {
    label: "Initial Staff Review",
    status: "completed",
    date: "February 2026",
    description:
      "Township staff reviewed the proposal for completeness, engineering feasibility, and budget accuracy.",
    bullets: [
      "Engineering site assessment completed",
      "Budget estimates independently verified",
      "Preliminary environmental review initiated",
    ],
  },
  {
    label: "Public Comment Period",
    status: "current",
    date: "Spring 2026",
    description:
      "Residents are invited to review and comment on the proposal. All feedback is documented and considered in the final decision.",
    bullets: [
      "Community meeting held March 15, 2026",
      "Online comment portal open through April 30, 2026",
      "Written comments: 12 received to date",
    ],
  },
  {
    label: "Board Review & Decision",
    status: "future",
    date: "Summer 2026",
    description:
      "The Board of Commissioners will review all public feedback and staff recommendations before casting a final vote.",
    bullets: [],
  },
  {
    label: "Implementation — Phase 1",
    status: "future",
    date: "Fall 2026",
    description:
      "Phase 1 construction: two new sports courts, an accessible playground, and 40 additional parking spaces.",
    bullets: [],
  },
  {
    label: "Implementation — Phase 2",
    status: "future",
    date: "2027",
    description:
      "Phase 2: covered pavilion, trail lighting upgrades, and a permanent restroom facility.",
    bullets: [],
  },
];

// ── Discussion ───────────────────────────────────────────────────

export const discussionData: DiscussionData = {
  private: {
    descriptions: [
      "Every comment and question will be read by the township. Any replies you receive will be visible under your comment, in your notifications, and in your profile.",
      "The township will weigh comments into decision making.",
    ],
    placeholder: "Leave a message...",
    buttonLabel: "Submit Private Feedback",
    pastFeedback: [
      {
        time: "1:33pm 27 Jan 2025",
        message:
          "This is exciting and long overdue for our community! I've lived here for 10 years and we've needed more courts and better facilities.",
      },
      {
        time: "4:20pm 20 Jan 2025",
        message:
          "This is actually pretty cool, I think this is a great addition to the park and the community.",
      },
      {
        time: "2:20pm 19 Jan 2025",
        message:
          "I'm not certain about this policy, this will increase my tax and the decisions don't affect me or my neighbors.",
      },
      {
        time: "5:10pm 19 Jan 2025",
        message: "We should change the terms to be more flexible",
      },
      {
        time: "5:00pm 3 Jan 2025",
        message:
          "I like that it's inclusive but is there a way to make it less expensive?",
      },
    ],
  },
  public: {
    descriptions: [
      "See how your neighbors feel about this project.",
      "Any public comments containing inappropriate or irrelevant material will be removed.",
    ],
    placeholder: "Leave us a message...",
    buttonLabel: "Post Public Feedback",
    viewCount: 12,
    comments: [
      {
        user: "NevillewoodMom",
        avatarColor: "#22c55e",
        timeAgo: "3 days ago",
        message:
          "Finally! We've been asking about permanent restrooms for years. My kids play here every weekend and having to drive home or go to a gas station is ridiculous. Fully support this.",
        replies: [
          {
            user: "Township Staff",
            isOfficial: true,
            avatarColor: "#0d2240",
            timeAgo: "3 days ago",
            replyTo: "NevillewoodMom",
            message:
              "Awesome! Glad to hear your support. Come to the meeting next week to learn more about the specifics.",
          },
          {
            user: "Resident_PghSW",
            avatarColor: "#60a5fa",
            timeAgo: "2 days ago",
            replyTo: "NevillewoodMom",
            message:
              "Same here — my family uses that park every Sunday. The parking situation alone is worth fixing.",
          },
          {
            user: "NWood_HomeOwner",
            avatarColor: "#67e8f9",
            timeAgo: "2 days ago",
            replyTo: "NevillewoodMom",
            message:
              "Agreed on restrooms. Though I hope Phase Two trail lighting doesn't get cut if the grant falls through.",
          },
          {
            user: "ColTwpWatcher",
            avatarColor: "#a5b4fc",
            timeAgo: "1 day ago",
            replyTo: "NWood_HomeOwner",
            message:
              "@NWood_HomeOwner That's exactly my concern too. Lighting feels like the most impactful part for evening users.",
          },
        ],
      },
      {
        user: "Resident_PghSW",
        avatarColor: "#86efac",
        timeAgo: "2 days ago",
        message:
          "I'm supportive of the improvements but the timing on the bond vote concerns me. November is right around the corner — have there been enough community meetings for residents to actually understand what they're voting on? Feels rushed.",
        replies: [],
      },
      {
        user: "Resident_hiiiii",
        avatarColor: "#78783e",
        timeAgo: "1 day ago",
        message:
          "I'm supportive ! This looks great. I'm excited to see this soon.",
        replies: [],
      },
      {
        user: "Ressi",
        avatarColor: "#904de",
        timeAgo: "1 day ago",
        message:
          "Wow I'm excited!",
        replies: [],
      },
      {
        user: "NWood_HomeOwner",
        avatarColor: "#67e8f9",
        timeAgo: "2 days ago",
        message:
          "What happens to the existing trail during Phase Two construction? I do the loop every morning and if it's closed for months that's a real quality of life issue for a lot of us.",
        replies: [],
      },
      {
        user: "ColTwpWatcher",
        avatarColor: "#a5b4fc",
        timeAgo: "1 day ago",
        message:
          "The DCNR grant dependency worries me. If it doesn't come through and Phase Two gets pushed to 2028, are we actually confident it'll happen then? Or does it just quietly disappear?",
        replies: [],
      },
    ],
  },
};
