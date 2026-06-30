// ================================================================
//  DATA LAYER — single source of truth for all proposals and content.
//  Shared between web and mobile apps.
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
