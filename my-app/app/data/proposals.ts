// ================================================================
//  DATA LAYER — single source of truth for all proposals and content.
//  Ported from the vanilla JS inline data.
// ================================================================

// ── Types ────────────────────────────────────────────────────────

export interface ProposalCard {
  id: string;
  title: string;
  category: string;
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
  "hilltop-park": {
    id: "hilltop-park",
    title: "Hilltop Park Expansion",
    category: "Parks & Recreation",
    updated: "2 days ago",
    description:
      "Expanding Hilltop Park by adding new courts, a more accessible playground, extra parking, trail lighting, and permanent restrooms.",
    image: "https://picsum.photos/seed/hilltoppark/600/340",
    link: "/proposal",
  },
  "nevilewood-traffic": {
    id: "nevilewood-traffic",
    title: "Nevilewood Traffic Management Plan",
    category: "Traffic and Safety",
    updated: "2 hours ago",
    description:
      "Improving traffic on Nevilewood's main entrance road.",
    image: "https://picsum.photos/seed/roundabout/600/340",
    link: "/proposal",
  },
  "mixed-use-dev": {
    id: "mixed-use-dev",
    title: "Small-Scale Mixed-Use Development",
    category: "Zoning",
    updated: "3 days ago",
    description:
      "Updating the zoning rules in Beechmont to allow shops, cafes, and small businesses on ground floors of residential buildings.",
    image: "https://picsum.photos/seed/cafeinterior/600/340",
    link: "/proposal",
  },
  "sidewalk-safety": {
    id: "sidewalk-safety",
    title: "Sidewalk and Pedestrian Safety Improvement",
    category: "Infrastructure",
    updated: "1 day ago",
    description:
      "Making walking safer in Beechmont by fixing their sidewalks.",
    image: "https://picsum.photos/seed/suburbhouse/600/340",
    link: "/proposal",
  },
  "conservation-easement": {
    id: "conservation-easement",
    title: "Conservation Easement on Undeveloped Green Space",
    category: "Parks and Rec",
    updated: "2 hours ago",
    description:
      "Protecting 14.3 acres of undeveloped land in Rennerdale by placing a conservation easement on it.",
    image: "https://picsum.photos/seed/greenforest/600/340",
    link: "/proposal",
  },
  "stormwater-upgrade": {
    id: "stormwater-upgrade",
    title: "Stormwater Drainage System Upgrade",
    category: "Infrastructure",
    updated: "1 hour ago",
    description:
      "Replacing pines and fixing road drainage to prevent stormwater flooding in Kirwan Heights.",
    image: "https://picsum.photos/seed/floodroad/600/340",
    link: "/proposal",
  },
  "fire-dept-renovation": {
    id: "fire-dept-renovation",
    title: "Fire Department Facility Renovation",
    category: "Public Safety",
    updated: "3 weeks ago",
    description:
      "Adding a new HVAC system, diesel exhaust system, and structural wall repairs at Kirwan Heights' fire station.",
    image: "https://picsum.photos/seed/firestation42/600/340",
    link: "/proposal",
  },
};

// ── Dashboard Sections ───────────────────────────────────────────

export const dashboardSections: DashboardSection[] = [
  {
    title: "Your Followed Projects",
    dynamic: true,
  },
  {
    title: "Newest",
    cards: ["hilltop-park", "nevilewood-traffic", "mixed-use-dev", "sidewalk-safety"].map(
      (id) => proposalRegistry[id]
    ),
  },
  {
    title: "Urgent Approaching Deadlines",
    cards: ["conservation-easement"].map((id) => proposalRegistry[id]),
  },
  {
    title: "Most Discussed Policies",
    cards: ["stormwater-upgrade", "fire-dept-renovation"].map(
      (id) => proposalRegistry[id]
    ),
  },
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
        time: "5:20pm 20 Jan 2025",
        message:
          "I'm not certain about this policy, this will increase my tax and the decisions don't affect me or my neighbors.",
      },
      {
        time: "5:20pm 20 Jan 2025",
        message: "We should change the terms to be more flexible",
      },
      {
        time: "5:20pm 20 Jan 2025",
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
