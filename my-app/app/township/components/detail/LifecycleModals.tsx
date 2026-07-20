"use client";

// ================================================================
//  Lifecycle modals for the project-detail shell: Submit for
//  Review, Spotlight, Review Action (reject / request changes),
//  Delete confirm, and the Edit History drawer. Presentation +
//  input collection only — mutations live in DetailShell.
// ================================================================

import { useEffect, useState } from "react";
import { STAFF_NAME } from "../../data";
import {
  ModalShell,
  ConfirmModal,
  ghostBtn,
  primaryBtn,
  dangerBtn,
  dangerOutlineBtn,
  StarIcon,
  type XProject,
} from "./shared";

const modalLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#94A3B8",
  letterSpacing: 0.4,
  textTransform: "uppercase",
  margin: "16px 0 7px",
};

const textArea: React.CSSProperties = {
  width: "100%",
  minHeight: 70,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "9px 11px",
  fontSize: 13,
  fontFamily: "inherit",
  color: "#334155",
  resize: "vertical",
};

function ChoiceBtn({
  selected,
  fill,
  onClick,
  children,
  h = 38,
}: {
  selected: boolean;
  /** true → navy fill when selected; false → navy border + tint */
  fill?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  h?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        height: h,
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: "pointer",
        transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
        ...(fill
          ? {
              background: selected ? "#0d2240" : "#fff",
              border: `1px solid ${selected ? "#0d2240" : "#e5e7eb"}`,
              color: selected ? "#fff" : "#475569",
            }
          : {
              background: selected ? "#EFF3F8" : "#fff",
              border: `1px solid ${selected ? "#0d2240" : "#e5e7eb"}`,
              color: selected ? "#0d2240" : "#475569",
            }),
      }}
    >
      {children}
    </button>
  );
}

// ── Submit for Review ────────────────────────────────────────────

export function SubmitReviewModal({
  project,
  onClose,
  onSubmit,
}: {
  project: XProject;
  onClose: () => void;
  onSubmit: (reviewer: string, urgency: string, note: string) => void;
}) {
  const recReviewer =
    project.cat === "Plan/Dev" || project.cat === "Infrastructure" ? "George Macino" : "Amy Medway";
  const [reviewer, setReviewer] = useState(recReviewer);
  const [urgency, setUrgency] = useState("Standard");
  const [note, setNote] = useState("");

  return (
    <ModalShell width={480} onClose={onClose}>
      <div style={{ fontSize: 19, fontWeight: 600, color: "#111827" }}>Submit for Review</div>
      <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
        Choose who should review this project before publishing.
      </div>

      <div style={modalLabel}>REVIEWER</div>
      <div style={{ display: "flex", gap: 10 }}>
        {["Amy Medway", "George Macino"].map((r) => (
          <ChoiceBtn key={r} selected={reviewer === r} onClick={() => setReviewer(r)}>
            {r}
          </ChoiceBtn>
        ))}
      </div>

      <div style={modalLabel}>URGENCY</div>
      <div style={{ display: "flex", gap: 10 }}>
        {["Low", "Standard", "High"].map((u) => (
          <ChoiceBtn key={u} selected={urgency === u} fill h={34} onClick={() => setUrgency(u)}>
            {u}
          </ChoiceBtn>
        ))}
      </div>

      <div style={modalLabel}>NOTES FOR THE REVIEWER (OPTIONAL)</div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Anything the reviewer should know…"
        style={textArea}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
        <button onClick={onClose} style={ghostBtn(38)}>
          Cancel
        </button>
        <button onClick={() => onSubmit(reviewer, urgency, note)} style={primaryBtn(38)}>
          Submit for Review
        </button>
      </div>
    </ModalShell>
  );
}

// ── Spotlight ────────────────────────────────────────────────────

const SPOT_REASONS = [
  "Upcoming meeting",
  "Public feedback needed",
  "Time-sensitive",
  "Important announcement",
  "Other",
];

export function SpotlightModal({
  project,
  spotCount,
  onClose,
  onSave,
  onRemove,
}: {
  project: XProject;
  spotCount: number;
  onClose: () => void;
  onSave: (sp: { reason: string; msg: string; end: string; priority: "Standard" | "High" }) => void;
  onRemove: () => void;
}) {
  const existing = project.spotlight;
  const [reason, setReason] = useState(existing?.reason ?? "Upcoming meeting");
  const [msg, setMsg] = useState(existing?.msg ?? "");
  const [end, setEnd] = useState(existing?.end ?? "Aug 15, 2026");
  const [priority, setPriority] = useState<"Standard" | "High">(existing?.priority ?? "Standard");
  const [notify, setNotify] = useState(true);

  return (
    <ModalShell width={500} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <StarIcon size={17} color="#2563EB" />
        <span style={{ fontSize: 19, fontWeight: 600, color: "#111827" }}>
          {existing ? "Edit Spotlight" : "Spotlight this project"}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
        Boost this project on the resident home with a call to action. {spotCount} of 5 spotlights in
        use.
      </div>

      <div style={modalLabel}>REASON</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {SPOT_REASONS.map((r) => {
          const on = reason === r;
          return (
            <button
              key={r}
              onClick={() => setReason(r)}
              style={{
                height: 36,
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                background: on ? "#EFF6FF" : "#fff",
                border: `1px solid ${on ? "#2563EB" : "#e5e7eb"}`,
                color: on ? "#2563EB" : "#475569",
                transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
              }}
            >
              {r}
            </button>
          );
        })}
      </div>

      <div style={modalLabel}>MESSAGE SHOWN TO RESIDENTS (OPTIONAL)</div>
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="e.g. Public hearing on July 22. Your voice matters."
        style={textArea}
      />

      <div style={modalLabel}>END DATE</div>
      <input
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        style={{
          width: "100%",
          height: 38,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "0 11px",
          fontSize: 13,
          fontFamily: "inherit",
          color: "#334155",
        }}
      />

      <div style={modalLabel}>PRIORITY</div>
      <div style={{ display: "flex", gap: 10 }}>
        {(["Standard", "High"] as const).map((p) => (
          <ChoiceBtn key={p} selected={priority === p} fill h={34} onClick={() => setPriority(p)}>
            {p}
          </ChoiceBtn>
        ))}
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12.5,
          color: "#334155",
          marginTop: 16,
          cursor: "pointer",
        }}
      >
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
        Notify following residents (push + email)
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
        {existing && (
          <button onClick={onRemove} style={dangerOutlineBtn(38)}>
            Remove spotlight
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={onClose} style={ghostBtn(38)}>
          Cancel
        </button>
        <button onClick={() => onSave({ reason, msg, end, priority })} style={primaryBtn(38)}>
          Spotlight this project
        </button>
      </div>
    </ModalShell>
  );
}

// ── Review action (reject / request changes) ─────────────────────

export function ReviewActionModal({
  mode,
  onClose,
  onSend,
}: {
  mode: "reject" | "changes";
  onClose: () => void;
  onSend: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <ModalShell width={460} onClose={onClose}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
        {mode === "reject" ? "Reject this project" : "Request changes"}
      </div>
      <div style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>
        The creator will be notified and can see your notes at the top of the project.
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notes for the creator (required)…"
        style={{ ...textArea, marginTop: 14 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
        <button onClick={onClose} style={ghostBtn(38)}>
          Cancel
        </button>
        <button
          onClick={() => onSend(note)}
          style={{ ...ghostBtn(38), background: "#B45309", border: "1px solid #B45309", color: "#fff" }}
        >
          Send to creator
        </button>
      </div>
    </ModalShell>
  );
}

// ── Delete confirm ───────────────────────────────────────────────

export function DeleteConfirmModal({
  project,
  onClose,
  onDelete,
}: {
  project: XProject;
  onClose: () => void;
  onDelete: (notify: boolean) => void;
}) {
  const [notify, setNotify] = useState(true);
  const lc = project.lc;
  const title =
    lc === "draft"
      ? "Delete this draft?"
      : lc === "archived"
        ? "Delete this archived project?"
        : "Delete this project?";
  const body =
    lc === "draft"
      ? "This draft has never been visible to residents. You can restore it from Trash within 30 days."
      : lc === "archived"
        ? "Archived projects can be restored anytime. Deleting moves it to Trash where it stays for 30 days before permanent deletion."
        : lc === "published"
          ? `This project is currently visible to ${project.followers} residents following it. Deleting it removes it from their view and archives their follow relationship. You can restore it from Trash within 30 days.`
          : "You can restore this project from Trash within 30 days before permanent deletion.";

  return (
    <ConfirmModal
      width={440}
      title={title}
      body={body}
      onClose={onClose}
      actions={
        <>
          <button onClick={onClose} style={ghostBtn(38)}>
            Cancel
          </button>
          <button onClick={() => onDelete(notify)} style={dangerBtn(38)}>
            Delete
          </button>
        </>
      }
    >
      {lc === "published" && (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            color: "#334155",
            marginTop: 14,
            cursor: "pointer",
          }}
        >
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          Notify following residents that this project was removed
        </label>
      )}
    </ConfirmModal>
  );
}

// ── Edit history drawer ──────────────────────────────────────────

export function EditHistoryDrawer({ project, onClose }: { project: XProject; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const entries = [
    ...project.log.map((l) => ({ who: l.by, when: l.time, what: l.text })),
    { who: STAFF_NAME, when: project.edited, what: `Updated Stage ${project.current} description and dates` },
    { who: STAFF_NAME, when: "1 week ago", what: "Published project to residents" },
    { who: "George Macino", when: "2 weeks ago", what: "Approved compliance checklist" },
    { who: STAFF_NAME, when: "3 weeks ago", what: "Created project" },
  ];

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgba(15,23,42,.35)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          maxWidth: "90%",
          background: "#fff",
          boxShadow: "-12px 0 40px rgba(2,12,27,.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Edit History</div>
            <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>{project.title}</div>
          </div>
          <button onClick={onClose} style={ghostBtn(30)}>
            Close
          </button>
        </div>
        <div style={{ padding: 20, overflow: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {entries.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 11 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: i === 0 ? "#2563EB" : "#CBD5E1",
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.45 }}>{e.what}</div>
                <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>
                  {e.who} · {e.when}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
