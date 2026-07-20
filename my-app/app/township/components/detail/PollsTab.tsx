"use client";

// ================================================================
//  PollsTab — "Poll Results" tab body of the staff project detail
//  page. Each project has a single resident poll: results donut,
//  support/oppose/neutral stats with verified-voter split, vote
//  trend line, poll lifecycle actions, and the create/edit modal.
//  Rendered by the detail shell (which owns the header + tab bar).
// ================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTownship } from "../../TownshipContext";
import { STAFF_NAME, type LogEntry } from "@/app/township/data";
import PollCard from "./polls/PollCard";
import PollFormModal from "./polls/PollFormModal";
import {
  projectPolls,
  ZEROED_POLL,
  type PollFormState,
  type PollRecord,
  type ProjectWithPolls,
} from "./polls/pollData";

/** Local icon — bar chart glyph used by the empty state. */
function BarChartIcon({
  size = 40,
  color = "#CBD5E1",
  strokeWidth = 1.6,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  );
}

function PrimaryBtn({
  label,
  onClick,
  height = 38,
  fontSize = 13,
}: {
  label: string;
  onClick: () => void;
  height?: number;
  fontSize?: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height,
        padding: height >= 40 ? "0 18px" : "0 15px",
        background: "#0d2240",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontSize,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        opacity: hover ? 0.9 : 1,
        transition: "opacity 0.15s ease",
        fontFamily: "inherit",
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

export default function PollsTab({ projectId }: { projectId: string }) {
  const { getProject, updateProject, toast } = useTownship();
  const router = useRouter();
  const [form, setForm] = useState<PollFormState | null>(null);

  const project = getProject(projectId);
  if (!project) return null;

  const polls = projectPolls(project);
  const hasPoll = polls.length > 0;

  const logged = (log: LogEntry[], what: string): LogEntry[] => [
    { text: what, time: "just now", by: STAFF_NAME },
    ...log,
  ];

  const openPollForm = (edit: boolean) => {
    const ex = projectPolls(project)[0];
    if (edit && ex) {
      setForm({
        edit: true,
        question: ex.question,
        desc: ex.desc || "",
        end: ex.end || "30 days from creation",
        publish: ex.status !== "Draft",
        optSupport: ex.optSupport || "I support",
        optOppose: ex.optOppose || "I do not support",
        optNeutral: ex.optNeutral || "Neutral / Unsure",
      });
    } else {
      setForm({
        edit: false,
        question: "Do you support this proposal?",
        desc: "",
        end: "30 days from creation",
        publish: true,
        optSupport: "I support",
        optOppose: "I do not support",
        optNeutral: "Neutral / Unsure",
      });
    }
  };

  const savePoll = (f: PollFormState) => {
    const status = f.publish ? "Active" : "Draft";
    const base = {
      question: f.question || "Do you support this proposal?",
      desc: f.desc,
      end: f.end,
      status,
      optSupport: f.optSupport,
      optOppose: f.optOppose,
      optNeutral: f.optNeutral,
    } as const;

    const isEdit = f.edit && hasPoll;
    const createdId = "p" + Date.now();
    updateProject(projectId, (p) => {
      const existing = projectPolls(p);
      if (isEdit && existing[0]) {
        const next: ProjectWithPolls = {
          ...p,
          polls: [{ ...existing[0], ...base }],
          log: logged(p.log, "Edited the poll"),
        };
        return next;
      }
      const created: PollRecord = {
        id: createdId,
        opened: "Opened just now",
        poll: {
          ...ZEROED_POLL,
          verified: { ...ZEROED_POLL.verified },
          trend: [...ZEROED_POLL.trend],
        },
        ...base,
      };
      const next: ProjectWithPolls = {
        ...p,
        polls: [created],
        log: logged(p.log, "Created a poll"),
      };
      return next;
    });

    toast(
      isEdit
        ? "Poll updated"
        : f.publish
          ? "Poll created and published"
          : "Poll saved as draft"
    );
    setForm(null);
  };

  const setPollStatus = (status: "Active" | "Closed") => {
    updateProject(projectId, (p) => {
      const next: ProjectWithPolls = {
        ...p,
        polls: projectPolls(p).map((pl) => ({ ...pl, status })),
        log: logged(p.log, status === "Closed" ? "Closed a poll" : "Reopened a poll"),
      };
      return next;
    });
    toast(status === "Closed" ? "Poll closed" : "Poll reopened");
  };

  const exportResults = () => toast("Exporting results as CSV…");

  const gotoFeedback = () =>
    router.replace(`/township/project/${projectId}?tab=feedback`);

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 6,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>
            Poll Results
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#64748b",
              marginTop: 3,
              maxWidth: 560,
            }}
          >
            Each project has a single resident poll. Results are visible to
            residents alongside the poll.
          </div>
        </div>
        <PrimaryBtn
          label={hasPoll ? "Edit Poll" : "+ Create Poll for This Project"}
          onClick={() => openPollForm(hasPoll)}
        />
      </div>

      {hasPoll ? (
        <div style={{ marginTop: 18 }}>
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onEdit={() => openPollForm(true)}
              onSetStatus={setPollStatus}
              onExport={exportResults}
            />
          ))}

          {/* Participation caveat */}
          <div
            style={{
              background: "#FFF7ED",
              border: "1px solid #FFD5AA",
              borderRadius: 12,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: "#9A3412",
                lineHeight: 1.5,
              }}
            >
              Poll results reflect the residents who chose to participate, not
              the full township. Read the comments alongside these numbers to
              understand the reasoning behind them.
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                gotoFeedback();
              }}
              style={{
                display: "inline-block",
                fontSize: 13,
                fontWeight: 600,
                color: "#2563eb",
                marginTop: 8,
                textDecoration: "none",
              }}
            >
              View comments on this project →
            </a>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div
          style={{
            background: "#fff",
            border: "1px dashed #CBD5E1",
            borderRadius: 12,
            padding: 44,
            textAlign: "center",
            marginTop: 18,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <BarChartIcon />
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#334155",
              marginBottom: 6,
            }}
          >
            This project has no poll yet
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
            Create one poll for this project to give residents a quick way to
            signal support or concerns.
          </div>
          <PrimaryBtn
            label="+ Create Poll for This Project"
            onClick={() => openPollForm(false)}
            height={40}
            fontSize={14}
          />
        </div>
      )}

      {form && (
        <PollFormModal
          initial={form}
          onCancel={() => setForm(null)}
          onSave={savePoll}
        />
      )}
    </div>
  );
}
