"use client";

// ================================================================
//  PendingReviewBand — amber callout shown to the Manager's Office
//  when projects are awaiting review. Horizontally scrolling row of
//  300px cards; the whole card and its Review button open the
//  project detail in review mode (?review=1 — the detail screen
//  ignores unknown params if it doesn't support it yet).
//  Amber values are data-encoding — kept verbatim.
// ================================================================

import { useRouter } from "next/navigation";
import { CAT_META, type StaffProject } from "../../data";

const URGENCY_COLORS: Record<string, [string, string]> = {
  High: ["#DC2626", "#FEE2E2"],
  Standard: ["#D97706", "#FEF3C7"],
  Low: ["#64748B", "#F1F5F9"],
};

export default function PendingReviewBand({
  items,
  onReviewAll,
}: {
  items: StaffProject[];
  onReviewAll: () => void;
}) {
  const router = useRouter();
  const review = (id: string) => router.push(`/township/project/${id}?tab=details&review=1`);
  const n = items.length;

  return (
    <div
      style={{
        background: "#FEF3C7",
        border: "1px solid #F59E0B",
        borderRadius: 8,
        padding: 24,
        marginBottom: 34,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#92400E" }}>
          {n} project{n === 1 ? "" : "s"} need{n === 1 ? "s" : ""} review
        </span>
        <button
          onClick={onReviewAll}
          style={{
            background: "none",
            border: "none",
            color: "#B45309",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Review all
        </button>
      </div>

      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
        {items.map((p) => {
          const cat = CAT_META[p.cat];
          const urgency = p.urgency ?? "Low";
          const [uc, ub] = URGENCY_COLORS[urgency] ?? URGENCY_COLORS.Low;
          return (
            <div
              key={p.id}
              onClick={() => review(p.id)}
              style={{
                flex: "0 0 300px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 16,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: cat.color,
                    background: cat.bg,
                    padding: "2px 7px",
                    borderRadius: 5,
                  }}
                >
                  {p.cat}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: uc,
                    background: ub,
                    padding: "2px 9px",
                    borderRadius: 20,
                  }}
                >
                  {urgency}
                </span>
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                {p.title}
              </div>

              <div style={{ fontSize: 12, color: "#94A3B8" }}>
                By {p.submittedBy} · {p.submittedDept} · {p.submittedDate}
              </div>

              <div
                style={{
                  fontSize: 12.5,
                  color: "#475569",
                  lineHeight: 1.45,
                  height: 36,
                  overflow: "hidden",
                }}
              >
                {p.desc}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  review(p.id);
                }}
                style={{
                  width: "100%",
                  height: 34,
                  background: "#0d2240",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: "auto",
                  transition: "opacity 0.15s ease",
                }}
              >
                Review
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
