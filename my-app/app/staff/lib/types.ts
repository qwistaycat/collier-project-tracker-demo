// ================================================================
//  Staff portal data types — ported from the Collier Connect Staff
//  v2 prototype. One Project record carries everything the portal
//  needs: content, lifecycle/approval state, moderation queues,
//  polls, and AI sentiment data.
// ================================================================

export type Sentiment = "green" | "amber" | "red";

export type Lifecycle =
  | "draft"
  | "pending"
  | "published"
  | "completed"
  | "archived"
  | "trash";

export type ModMode = "post" | "selective" | "full";

export type StaffCategory =
  | "Roads"
  | "Parks"
  | "Infrastructure"
  | "Plan/Dev"
  | "Public Safety";

export interface Reply {
  /** "name" = personal attribution, "official" = Township Staff seal */
  attr?: "name" | "official";
  dept: string;
  name?: string;
  text: string;
  time: string;
  edited?: boolean;
}

export interface Comment {
  id: string;
  name: string;
  verified: boolean;
  anon: boolean;
  text: string;
  sent: Sentiment;
  time: string;
  replies: Reply[];
  flag: string | null;
}

export interface StageDoc {
  name: string;
  size?: string;
}

export interface Stage {
  n: number;
  title: string;
  dates: string;
  desc: string;
  bullets: string[];
  state: "Published" | "Draft" | "Hidden";
  /** true while stage content is AI-suggested and not yet staff-reviewed */
  ai?: boolean;
  aiFilled?: string[];
  docs?: StageDoc[];
}

export interface PollCounts {
  support: number;
  oppose: number;
  neutral: number;
  verified: { s: number; o: number; n: number };
  trend: number[];
}

export interface PollRec {
  id: string;
  question: string;
  desc?: string;
  status: "Active" | "Closed" | "Draft";
  opened: string;
  end: string;
  optSupport: string;
  optOppose: string;
  optNeutral: string;
  poll: PollCounts;
}

export interface Theme {
  name: string;
  count: number;
  sent: "supportive" | "mixed" | "concerns";
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

export interface ReviewFeedback {
  type: "changes" | "reject";
  by: string;
  note: string;
  when: string;
}

export interface LogEntry {
  who: string;
  when: string;
  what: string;
}

export interface Project {
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
  /** 1-based index of the current stage */
  current: number;
  desc: string;
  sponsor: string;
  duration: string;
  neighborhoods?: string;
  stages: Stage[];
  polls: PollRec[];
  sentiment: { supportive: number; mixed: number; concerns: number };
  themes: Theme[];
  privateMsgs: Comment[];
  public: Comment[];
  /** AI-flagged comments awaiting moderation */
  hidden: Comment[];
  /** rejected comments kept in the audit log */
  rejected: Comment[];
  lc: Lifecycle;
  modMode: ModMode;
  spotlight: Spotlight | null;
  log: LogEntry[];
  docs?: StageDoc[];
  /** which project fields are AI-authored and unreviewed */
  aiFields?: Record<string, boolean>;
  // Pending-review metadata
  submittedBy?: string;
  submittedDept?: string;
  submittedDate?: string;
  reviewer?: string;
  urgency?: "Low" | "Standard" | "High";
  srNote?: string;
  rejectedSub?: boolean;
  reviewFeedback?: ReviewFeedback;
  // Lifecycle history metadata
  completedDate?: string;
  archivedYear?: string;
  trashedDate?: string;
  prevLc?: Lifecycle;
  prevPublishedDate?: string;
  prevPublishedBy?: string;
  reopenedDate?: string;
  reopenedBy?: string;
  outcome?: string;
}

export interface Citation {
  id: string;
  quote: string;
  /** anon = "Anonymous Collier resident", first = first name only, full = name + neighborhood */
  attrLevel: "anon" | "first" | "full";
  name: string;
  nb: string;
  tags: string[];
  project: string;
  projId: string;
  date: string;
  sentW: "supportive" | "mixed" | "concerns";
}

// ── Create-wizard shapes ─────────────────────────────────────────

export interface CreateFields {
  title: string;
  category: StaffCategory;
  desc: string;
  funding: string;
  cost: string;
  sponsor: string;
  duration: string;
}

export interface CreateStage {
  n: number;
  title: string;
  start: string;
  end: string;
  singleDate: boolean;
  summary: string;
  bullets: string[];
  status: "draft" | "published" | "hidden";
  docs: StageDoc[];
  docsOpen: boolean;
  ai: boolean;
  rewritten?: boolean;
  rewriteFrom?: string;
  err?: boolean;
}

export interface ExtractPara {
  id: string;
  page: number;
  kind: "h1" | "h2" | "p";
  text: string;
}

export type Confidence = "high" | "med" | "low";

export interface ExtractField {
  label: string;
  value: string;
  conf: Confidence;
  para: string;
  page: number;
  section: string;
  passage: string;
  reasoning: string;
  doc: string;
  multi?: Array<{ passage: string; maps: string }>;
}

export interface ExtractStage {
  title: string;
  start: string;
  end: string;
  summary: string;
  bullets: string[];
  conf: Confidence;
  rewritten: boolean;
  rewriteFrom?: string;
  para: string;
  page: number;
  section: string;
  passage: string;
  reasoning: string;
  doc: string;
}

export interface ExtractData {
  paras: ExtractPara[];
  fields: Record<string, ExtractField>;
  stages: ExtractStage[];
  events: Array<{ para: string; key?: string; kind: "field" | "stage"; dur: number }>;
  docs: Array<{ name: string; type: string }>;
}

export interface SampleSet {
  key: string;
  label: string;
  files: Array<[string, string]>;
  fields: CreateFields;
  stages: Array<{
    title: string;
    start: string;
    end: string;
    summary: string;
    bullets: string[];
  }>;
}
