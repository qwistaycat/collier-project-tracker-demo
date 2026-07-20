"use client";

// ================================================================
//  DetailsTab — the "Project Details" tab body in *editing* mode.
//  Mirrors the resident proposal page structure one-for-one (hero,
//  title, description, funding, info/map card, timeline) so the
//  Editing ↔ Resident Preview toggle reads as the same page with
//  edit affordances, not two different screens. Staff-only extras
//  (Source Documents, the stage editor rail, Add Stage) slot into
//  that same column. The shell owns editAll state, stage
//  selection, and the dirty/nav-guard plumbing.
// ================================================================

import { useRef, useState } from "react";
import { useTownship } from "../../TownshipContext";
import { catHeroImage, catFull, CAT_META, type StaffCategory } from "../../data";
import {
  MapPinIcon,
  ImageIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "@/app/components/icons";
import {
  cardStyle,
  labelCaps,
  ghostBtn,
  primaryBtn,
  fieldInput,
  patchProject,
  FileIcon,
  NEIGHBORHOOD_DEFAULT,
  type XProject,
  type XStage,
} from "./shared";
import StageEditor, { type StageEditorHandle } from "./StageEditor";

interface Props {
  project: XProject;
  editAll: boolean;
  onEnterEditAll: () => void;
  onDiscardEditAll: () => void;
  onSaveEditAll: () => void;
  selStage: number;
  stageDirty: boolean;
  onSelectStage: (n: number) => void;
  onAddStage: () => void;
  onStageDirtyChange: (d: boolean) => void;
  editorHandleRef: React.RefObject<StageEditorHandle | null>;
}

// Resident meta-label style (ProjectMapCard's info column)
const metaLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.5,
  color: "#9ca3af",
  textTransform: "uppercase",
  margin: "0 0 4px 0",
};

const metaValue: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
  margin: 0,
  whiteSpace: "pre-line",
};

const linkPill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "1px solid #e5e7eb",
  borderRadius: 9999,
  padding: "6px 14px",
  color: "#6b7280",
  fontSize: 12,
  fontWeight: 500,
  background: "white",
  cursor: "pointer",
  fontFamily: "inherit",
};

// ── Info + Map/Photos card — the resident ProjectMapCard layout
//    with the info column editable in edit-all mode ───────────────

function FactsMapCard({ project: p, editAll }: { project: XProject; editAll: boolean }) {
  const { updateProject } = useTownship();
  const apEdit = (fields: Partial<XProject>) => patchProject(updateProject, p.id, fields);

  const [view, setView] = useState<"map" | "photos">("map");
  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const photos = ["a", "b", "c", "d"].map(
    (s) => `https://picsum.photos/seed/${p.id}-${s}/900/600`
  );
  const goTo = (i: number) => setPhotoIndex(((i % photos.length) + photos.length) % photos.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) goTo(dx > 0 ? photoIndex - 1 : photoIndex + 1);
    touchStartX.current = null;
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 8,
    border: active ? "1px solid #0d2240" : "1px solid #e5e7eb",
    background: active ? "#0d2240" : "white",
    color: active ? "white" : "#6b7280",
    cursor: "pointer",
  });

  const fact = (label: string, value: string, field: keyof XProject) => (
    <div style={{ marginTop: 18 }}>
      <p style={metaLabel}>{label}</p>
      {editAll ? (
        <input
          value={value}
          aria-label={label}
          onChange={(e) => apEdit({ [field]: e.target.value } as Partial<XProject>)}
          style={{ ...fieldInput(true, 34), fontSize: 14, fontWeight: 600 }}
        />
      ) : (
        <p style={metaValue}>{value}</p>
      )}
    </div>
  );

  const arrowBtn = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    [side]: 12,
    top: "50%",
    transform: "translateY(-50%)",
    width: 34,
    height: 34,
    borderRadius: 9999,
    border: "none",
    background: "rgba(255,255,255,0.85)",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
  });

  return (
    <div
      style={{
        marginTop: 24,
        display: "flex",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        minHeight: 360,
        background: "#fff",
      }}
    >
      {/* Left info column */}
      <div
        style={{
          width: 260,
          flexShrink: 0,
          padding: "24px 22px",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }}>
          {p.title}
        </h3>

        {fact("Responsible Dept", p.sponsor, "sponsor")}
        {fact("Duration", p.duration, "duration")}
        {fact("Budget", p.cost, "cost")}

        {/* Map / Photos toggle */}
        <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", gap: 8 }}>
          <button aria-label="Show map" onClick={() => setView("map")} style={toggleBtnStyle(view === "map")}>
            <MapPinIcon size={16} />
          </button>
          <button aria-label="Show photos" onClick={() => setView("photos")} style={toggleBtnStyle(view === "photos")}>
            <ImageIcon size={16} />
          </button>
        </div>
      </div>

      {/* Right map / photo carousel panel */}
      <div style={{ flex: 1, position: "relative", background: "#f3f4f6" }}>
        {view === "map" ? (
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=-80.18%2C40.32%2C-79.98%2C40.42&layer=mapnik"
            style={{ width: "100%", height: "100%", minHeight: 360, border: "none", display: "block" }}
            title="Project Location Map"
          />
        ) : (
          <div
            style={{ position: "relative", width: "100%", height: "100%", minHeight: 360 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[photoIndex]}
              alt={`${p.title} photo ${photoIndex + 1}`}
              style={{ width: "100%", height: "100%", minHeight: 360, objectFit: "cover", display: "block" }}
            />
            <button aria-label="Previous photo" onClick={() => goTo(photoIndex - 1)} style={arrowBtn("left")}>
              <ChevronLeftIcon size={18} />
            </button>
            <button aria-label="Next photo" onClick={() => goTo(photoIndex + 1)} style={arrowBtn("right")}>
              <ChevronRightIcon size={18} />
            </button>
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 6,
              }}
            >
              {photos.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to photo ${i + 1}`}
                  onClick={() => goTo(i)}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 9999,
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    background: i === photoIndex ? "white" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab body ─────────────────────────────────────────────────────

export default function DetailsTab({
  project,
  editAll,
  onEnterEditAll,
  onDiscardEditAll,
  onSaveEditAll,
  selStage,
  stageDirty,
  onSelectStage,
  onAddStage,
  onStageDirtyChange,
  editorHandleRef,
}: Props) {
  const { updateProject, toast } = useTownship();
  const apEdit = (fields: Partial<XProject>) => patchProject(updateProject, project.id, fields);

  const docs = project.docs ?? [];
  const stage = project.stages.find((s) => s.n === selStage) as XStage | undefined;
  const cat = CAT_META[project.cat];

  return (
    <div>
      {/* Hero image — same position and size as the resident page */}
      <div style={{ position: "relative", height: 260, borderRadius: 12, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={catHeroImage(project.cat, project.id)}
          alt={project.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <span
          style={{
            position: "absolute",
            left: 14,
            bottom: 12,
            background: "rgba(255, 255, 255, 0.92)",
            color: cat.color,
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 9999,
          }}
        >
          {catFull(project.cat as StaffCategory)}
        </span>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 className="text-2xl font-bold text-gray-900" style={{ margin: "28px 0 0 0" }}>
          {project.title}
        </h1>

        {/* Action row — sits where the resident Follow row sits */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          {editAll ? (
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#2563eb" }}>
              Editing — changes apply as you type
            </span>
          ) : (
            <button onClick={onEnterEditAll} style={{ ...ghostBtn(34), color: "#0d2240", fontSize: 13 }}>
              Edit All Fields
            </button>
          )}
          <span style={{ fontSize: 13, fontStyle: "italic", color: "#6b7280" }}>
            Last updated {project.edited}
          </span>
        </div>

        {/* Description */}
        {editAll ? (
          <textarea
            value={project.desc}
            aria-label="Project description"
            onChange={(e) => apEdit({ desc: e.target.value })}
            rows={4}
            style={{
              ...fieldInput(true),
              height: "auto",
              minHeight: 90,
              padding: "9px 10px",
              marginTop: 20,
              fontSize: 13,
              lineHeight: 1.7,
              resize: "vertical",
              display: "block",
              fontFamily: "inherit",
            }}
          />
        ) : (
          <p style={{ marginTop: 20, fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
            {project.desc}
          </p>
        )}

        {/* Funding */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr",
            gap: "14px 20px",
            marginTop: 16,
            alignItems: "start",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 13, color: "#111827", paddingTop: editAll ? 9 : 0 }}>
            Funding:
          </span>
          <div>
            {editAll ? (
              <input
                value={project.funding}
                aria-label="Funding"
                onChange={(e) => apEdit({ funding: e.target.value })}
                style={{ ...fieldInput(true), fontSize: 13, marginBottom: 12 }}
              />
            ) : (
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: "0 0 12px 0" }}>
                {project.funding}
              </p>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => toast("Opening project link picker…")} style={linkPill}>
                <ExternalLinkIcon size={15} /> Link to Project
              </button>
              <button onClick={() => toast("Opening meeting notes picker…")} style={linkPill}>
                <ExternalLinkIcon size={15} /> Link to Meeting Notes
              </button>
            </div>
          </div>
        </div>

        {/* Source Documents — staff-only, hidden from residents */}
        <div style={{ ...cardStyle, marginTop: 24, marginBottom: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span style={{ ...labelCaps, fontSize: 13, marginBottom: 0 }}>SOURCE DOCUMENTS</span>
            <button
              onClick={() => toast("Opening document upload — AI will suggest updates from new documents.")}
              style={{ ...ghostBtn(30), color: "#0d2240", fontSize: 12 }}
            >
              + Add documents
            </button>
          </div>
          {docs.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {docs.map((d, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: "#F8FAFC",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 11px",
                    fontSize: 12,
                    color: "#334155",
                  }}
                >
                  <span style={{ color: "#7C3AED", display: "inline-flex" }}>
                    <FileIcon size={13} />
                  </span>
                  {d}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#94A3B8" }}>
              No documents attached yet. Add meeting minutes or proposals — AI can suggest updates
              from them.
            </div>
          )}
        </div>

        {/* Project info + Map/Photos card (editable twin of the resident card) */}
        <FactsMapCard project={project} editAll={editAll} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
            fontSize: 13,
            color: "#475569",
            flexWrap: "wrap",
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>This project affects</span>
          <input
            value={project.neighborhoods ?? NEIGHBORHOOD_DEFAULT}
            readOnly={!editAll}
            aria-label="Affected neighborhoods"
            onChange={(e) => apEdit({ neighborhoods: e.target.value })}
            style={{ ...fieldInput(editAll, 34), width: 340, maxWidth: "100%", fontSize: 13 }}
          />
        </div>

        {/* Project Timeline — stage rail + editor */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "40px 0 14px",
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Project Timeline</span>
          <button onClick={onAddStage} style={primaryBtn(36)}>
            + Add Stage
          </button>
        </div>

        {project.stages.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px dashed #CBD5E1",
              borderRadius: 12,
              padding: 44,
              textAlign: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ margin: "0 auto", display: "block" }}
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#334155", marginTop: 12 }}>
              This project has no stages yet
            </div>
            <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
              Add stages to build the timeline residents will follow.
            </div>
            <button
              onClick={onAddStage}
              style={{ ...primaryBtn(40), borderRadius: 9, fontSize: 14, marginTop: 16 }}
            >
              + Add Your First Stage
            </button>
          </div>
        ) : (
          <div
            style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 18, alignItems: "start" }}
          >
            {/* Stage rail */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {project.stages.map((s) => {
                const sel = s.n === selStage;
                const st = s.state as string;
                const dotColor =
                  st === "Hidden" ? "#94A3B8" : st === "Published" ? "#16A34A" : "#D97706";
                return (
                  <button
                    key={s.n}
                    onClick={() => onSelectStage(s.n)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      textAlign: "left",
                      borderRadius: 9,
                      padding: "11px 12px",
                      cursor: "pointer",
                      background: sel ? "#EFF3F8" : "#fff",
                      border: `1px solid ${sel ? "#0d2240" : "#EEF2F6"}`,
                      fontFamily: "inherit",
                      transition: "background 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "#EFF3F8",
                        color: "#0d2240",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {s.n}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0d2240",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.title}
                      </span>
                      <span style={{ display: "block", fontSize: 11, color: "#94A3B8" }}>
                        {s.dates}
                      </span>
                    </span>
                    <span style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      {sel && stageDirty && (
                        <span
                          title="Unsaved changes"
                          style={{ width: 8, height: 8, borderRadius: "50%", background: "#D97706" }}
                        />
                      )}
                      <span
                        title={st}
                        style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stage editor */}
            {stage && (
              <StageEditor
                key={`${project.id}-${stage.n}`}
                project={project}
                stage={stage}
                onDirtyChange={onStageDirtyChange}
                handleRef={editorHandleRef}
              />
            )}
          </div>
        )}
      </div>

      {/* Sticky edit-all footer */}
      {editAll && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
            padding: "12px 0",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            zIndex: 10,
            marginTop: 20,
          }}
        >
          <button onClick={onDiscardEditAll} style={{ ...ghostBtn(42), borderRadius: 9 }}>
            Discard changes
          </button>
          <button onClick={onSaveEditAll} style={{ ...primaryBtn(42), borderRadius: 9 }}>
            Save all changes
          </button>
        </div>
      )}
    </div>
  );
}
