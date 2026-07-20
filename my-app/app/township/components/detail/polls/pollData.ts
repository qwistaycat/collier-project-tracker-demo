// ================================================================
//  Poll Results tab — local data helpers. One poll per project.
//  StaffProject seeds only a raw `poll` counts object; the richer
//  poll record (question/status/labels) is derived lazily here and
//  written back onto the project (as an untyped extension) once
//  staff create/edit/close a poll.
// ================================================================

import type { StaffPoll, StaffProject } from "@/app/township/data";

export type PollStatus = "Active" | "Closed" | "Draft";

export interface PollRecord {
  id: string;
  question: string;
  desc?: string;
  status: PollStatus;
  opened: string;
  end?: string;
  optSupport?: string;
  optOppose?: string;
  optNeutral?: string;
  poll: StaffPoll;
}

/**
 * Extension of StaffProject: once staff touch the poll (create /
 * edit / close / reopen) the derived list is persisted on `polls`.
 * Until then it is recomputed from the seeded counts on each read.
 */
export interface ProjectWithPolls extends StaffProject {
  polls?: PollRecord[];
}

/** Lazy derivation, ported from the prototype's projectPolls(). */
export function projectPolls(p: StaffProject): PollRecord[] {
  const wp = p as ProjectWithPolls;
  if (wp.polls) return wp.polls;
  const total = p.poll.support + p.poll.oppose + p.poll.neutral;
  if (total <= 0) return [];
  return [
    {
      id: "p1",
      question: `Do you support the ${p.title}?`,
      status: p.status === "Completed" ? "Closed" : "Active",
      opened: `Opened ${p.edited}`,
      end: "Aug 1, 2026",
      poll: p.poll,
    },
  ];
}

/** Fields edited in the create/edit poll modal. */
export interface PollFormState {
  edit: boolean;
  question: string;
  desc: string;
  end: string;
  publish: boolean;
  optSupport: string;
  optOppose: string;
  optNeutral: string;
}

export const ZEROED_POLL: StaffPoll = {
  support: 0,
  oppose: 0,
  neutral: 0,
  verified: { s: 0, o: 0, n: 0 },
  trend: [0, 0, 0, 0, 0, 0, 0, 0],
};

export function pctOf(v: number, total: number): string {
  return total ? Math.round((v / total) * 100) + "%" : "0%";
}
