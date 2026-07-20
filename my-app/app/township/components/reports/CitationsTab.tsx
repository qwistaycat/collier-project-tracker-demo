"use client";

// ================================================================
//  Reports › Citations — saved library of resident quotes with
//  copy/remove/select, add-from-comments modal, AI suggestions,
//  and AI paragraph drafting (simulateAi, 1200ms).
// ================================================================

import { useState, type CSSProperties } from "react";
import { CheckIcon, PlusIcon, SearchIcon } from "@/app/components/icons";
import { useTownship } from "../../TownshipContext";
import { citAttr, simulateAi, type Citation } from "../../data";
import {
  AiBadge,
  CARD,
  CopyIcon,
  ExportButton,
  QuoteIcon,
  SentDot,
  SparkleIcon,
  flattenComments,
  pillStyle,
  useOpenProject,
  whoOf,
  type CorpusComment,
} from "./shared";

const SENT_CHIPS = ["All", "Supportive", "Mixed", "Concerns"];

const smallBtn = (color = "#374151"): CSSProperties => ({
  height: 30,
  padding: "0 11px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#fff",
  fontSize: 12,
  fontWeight: 600,
  color,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});

const sugId = (c: CorpusComment) => `${c.projId}:${c.text}`;

export default function CitationsTab() {
  const { projects, citations, setCitations, aiMode, toast } = useTownship();
  const openProject = useOpenProject();

  const [citQuery, setCitQuery] = useState("");
  const [citSent, setCitSent] = useState("All");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [draftPara, setDraftPara] = useState<string | null>(null);

  const corpus = flattenComments(projects);
  const savedTexts = new Set(citations.map((c) => c.quote));

  // AI suggestions: first 5 unsaved supportive/concerns comments, minus dismissed, max 3
  const suggestions = corpus
    .filter((c) => !savedTexts.has(c.text) && (c.sentW === "supportive" || c.sentW === "concerns"))
    .slice(0, 5)
    .filter((c) => !dismissed.includes(sugId(c)))
    .slice(0, 3);

  // Filtered library rows
  const q = citQuery.trim().toLowerCase();
  const rows = citations.filter(
    (c) =>
      (citSent === "All" || c.sentW === citSent.toLowerCase()) &&
      (!q ||
        c.quote.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)))
  );

  const chosen = citations.filter((c) => selected[c.id]);
  const drafting = draftPara === "…";

  const addFromComment = (c: CorpusComment, closeModal = false) => {
    setCitations((cs) => [
      {
        id: "ct" + Date.now(),
        quote: c.text,
        attrLevel: c.anon ? "anon" : "first",
        name: c.name || "",
        nb: c.nb || "Collier",
        tags: [c.cat || "General"],
        project: c.project,
        projId: c.projId,
        date: "Jul 2026",
        sentW: c.sentW || "mixed",
      },
      ...cs,
    ]);
    if (closeModal) setModalOpen(false);
    toast("Added to citation library");
  };

  const removeCitation = (c: Citation) => {
    setCitations((cs) => cs.filter((x) => x.id !== c.id));
    setSelected((s) => {
      const next = { ...s };
      delete next[c.id];
      return next;
    });
    toast("Removed from citation library");
  };

  const copyCitation = (c: Citation) => {
    const text = `“${c.quote}” — ${citAttr(c)} (${c.project}, ${c.date})`;
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      // clipboard unavailable — toast regardless (mock behavior)
    }
    toast("Citation copied to clipboard");
  };

  const draftParagraph = async () => {
    if (!chosen.length) {
      toast("Select one or more citations first");
      return;
    }
    setDraftPara("…");
    const fallback =
      "Residents across Collier Township have voiced clear and consistent views. " +
      chosen.map((c) => `${citAttr(c)} noted, “${c.quote}”`).join(" ") +
      " Taken together, these voices underscore both the community's engagement and the priorities the Township must weigh going forward.";
    const result = await simulateAi(fallback);
    setDraftPara(result);
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              color: "#9ca3af",
            }}
          >
            <SearchIcon size={15} />
          </span>
          <input
            type="text"
            value={citQuery}
            onChange={(e) => setCitQuery(e.target.value)}
            placeholder="Search within saved quotes…"
            className="focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              width: "100%",
              height: 38,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "0 12px 0 36px",
              fontSize: 13.5,
              background: "#fff",
            }}
          />
        </div>
        {SENT_CHIPS.map((s) => (
          <button key={s} onClick={() => setCitSent(s)} style={pillStyle(citSent === s, true)}>
            {s}
          </button>
        ))}
        <button
          onClick={() => setModalOpen(true)}
          style={{
            height: 38,
            padding: "0 14px",
            borderRadius: 8,
            border: "none",
            background: "#0d2240",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <PlusIcon size={12} />
          Add citation from comments
        </button>
        <ExportButton />
      </div>

      {/* AI-suggested citations (AI ON only) */}
      {aiMode && suggestions.length > 0 && (
        <div
          style={{
            marginTop: 16,
            background: "#FAFAFF",
            border: "1px solid #DDD6FE",
            borderRadius: 12,
            padding: "15px 17px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
            <SparkleIcon size={14} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#5B21B6" }}>
              AI-suggested citations
            </span>
            <AiBadge />
          </div>
          {suggestions.map((c) => (
            <div
              key={sugId(c)}
              style={{
                background: "#fff",
                border: "1px solid #EDE9FE",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 9,
                display: "flex",
                gap: 11,
                alignItems: "center",
              }}
            >
              <SentDot word={c.sentW} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#374151", fontStyle: "italic", lineHeight: 1.5 }}>
                  “{c.text}”
                </div>
                <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 3 }}>
                  {whoOf(c)} · {c.project}
                </div>
              </div>
              <button
                onClick={() => addFromComment(c)}
                style={{
                  height: 30,
                  padding: "0 13px",
                  borderRadius: 7,
                  border: "none",
                  background: "#7C3AED",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Add
              </button>
              <button
                onClick={() => setDismissed((d) => [...d, sugId(c)])}
                style={{ ...smallBtn("#64748b"), flexShrink: 0 }}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Count row */}
      <div style={{ display: "flex", alignItems: "center", margin: "18px 0 12px" }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#9ca3af" }}>
          {rows.length} citations
        </span>
        <span style={{ flex: 1 }} />
        {aiMode && chosen.length > 0 && (
          <button
            onClick={draftParagraph}
            disabled={drafting}
            style={{
              height: 34,
              padding: "0 13px",
              borderRadius: 8,
              border: "1px solid #DDD6FE",
              background: "#F5F3FF",
              color: "#7C3AED",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: drafting ? "default" : "pointer",
              opacity: drafting ? 0.6 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <SparkleIcon size={13} />
            Draft paragraph with these quotes ({chosen.length} selected)
          </button>
        )}
      </div>

      {/* AI-drafted paragraph card */}
      {draftPara !== null && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #DDD6FE",
            borderRadius: 12,
            padding: "16px 18px",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                background: "#7C3AED",
                color: "#fff",
                padding: "2px 9px",
                borderRadius: 9999,
              }}
            >
              AI-drafted
            </span>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setDraftPara(null)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#9ca3af",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          </div>
          <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.65 }}>{draftPara}</div>
        </div>
      )}

      {/* Citation grid / empty state */}
      {rows.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px dashed #CBD5E1",
            borderRadius: 12,
            padding: "52px 24px",
            textAlign: "center",
          }}
        >
          <QuoteIcon size={34} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginTop: 10 }}>
            No citations saved yet.
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#9ca3af",
              maxWidth: 360,
              margin: "6px auto 0",
              lineHeight: 1.5,
            }}
          >
            {"Save memorable resident quotes from any comment so they're ready when you need them."}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              marginTop: 16,
              height: 36,
              padding: "0 16px",
              borderRadius: 8,
              border: "none",
              background: "#0d2240",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Browse recent comments
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          {rows.map((c) => {
            const sel = !!selected[c.id];
            return (
              <div
                key={c.id}
                style={{ ...CARD, padding: "16px 17px", display: "flex", flexDirection: "column" }}
              >
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <button
                    role="checkbox"
                    aria-checked={sel}
                    onClick={() =>
                      setSelected((s) => ({ ...s, [c.id]: !s[c.id] }))
                    }
                    style={{
                      width: 19,
                      height: 19,
                      borderRadius: 5,
                      flexShrink: 0,
                      marginTop: 2,
                      cursor: "pointer",
                      border: `2px solid ${sel ? "#7C3AED" : "#CBD5E1"}`,
                      background: sel ? "#7C3AED" : "#fff",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      transition: "background 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    {sel && <CheckIcon size={11} />}
                  </button>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#111827", lineHeight: 1.5 }}>
                    “{c.quote}”
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 8 }}>
                  — {citAttr(c)}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: "#F1F5F9",
                        color: "#475569",
                        padding: "2px 9px",
                        borderRadius: 6,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderTop: "1px solid #F1F5F9",
                    paddingTop: 12,
                    marginTop: "auto",
                  }}
                >
                  <button
                    onClick={() => openProject(c.projId, "feedback")}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#2563eb",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 130,
                    }}
                  >
                    {c.project}
                  </button>
                  <span style={{ fontSize: 11.5, color: "#9ca3af", whiteSpace: "nowrap" }}>
                    · {c.date}
                  </span>
                  <span style={{ flex: 1 }} />
                  <button onClick={() => copyCitation(c)} style={smallBtn()}>
                    <CopyIcon size={12} />
                    Copy
                  </button>
                  <button onClick={() => removeCitation(c)} style={smallBtn("#9ca3af")}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add citation from comments modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 640,
              maxWidth: "100%",
              maxHeight: "82vh",
              background: "#fff",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px 14px",
                borderBottom: "1px solid #F1F5F9",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>
                  Add citation from comments
                </div>
                <div style={{ fontSize: 12.5, color: "#9ca3af", marginTop: 3 }}>
                  {"Attribution follows each resident's original public/anonymous setting."}
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  height: 32,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Close
              </button>
            </div>
            <div style={{ overflowY: "auto", padding: "14px 24px 20px", flex: 1 }}>
              {corpus
                .filter((c) => !savedTexts.has(c.text))
                .slice(0, 14)
                .map((c, i) => (
                  <div
                    key={sugId(c)}
                    style={{
                      display: "flex",
                      gap: 11,
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: "1px solid #F1F5F9",
                      borderTop: i === 0 ? "none" : undefined,
                    }}
                  >
                    <SentDot word={c.sentW} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{c.text}</div>
                      <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 3 }}>
                        {whoOf(c)} · {c.project}
                      </div>
                    </div>
                    <button
                      onClick={() => addFromComment(c, true)}
                      style={{
                        height: 30,
                        padding: "0 14px",
                        borderRadius: 8,
                        border: "none",
                        background: "#0d2240",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Save
                    </button>
                  </div>
                ))}
            </div>
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #F1F5F9",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  height: 38,
                  padding: "0 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#0d2240",
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
