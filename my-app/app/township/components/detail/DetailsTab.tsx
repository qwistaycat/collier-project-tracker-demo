"use client";

// ================================================================
//  DetailsTab — the "Project Details" tab body: edit-all controls,
//  Source Documents, description/metadata/location cards, and the
//  stage timeline (rail + editor). The shell owns editAll state,
//  stage selection, and the dirty/nav-guard plumbing.
// ================================================================

import { useTownship } from "../../TownshipContext";
import { catFull, type StaffCategory } from "../../data";
import { MapPinIcon } from "@/app/components/icons";
import {
  cardStyle,
  labelCaps,
  ghostBtn,
  primaryBtn,
  fieldInput,
  patchProject,
  FileIcon,
  LinkIcon,
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

  return (
    <div>
      {/* Top edit row */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        {editAll ? (
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#7C3AED" }}>
            Editing — changes apply as you type
          </span>
        ) : (
          <button onClick={onEnterEditAll} style={{ ...ghostBtn(32), color: "#0d2240", fontSize: 13 }}>
            Edit All Fields
          </button>
        )}
      </div>

      {/* Source Documents */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
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
            No documents attached yet. Add meeting minutes or proposals — AI can suggest updates from
            them.
          </div>
        )}
      </div>

      {/* Section A — Description */}
      <div style={cardStyle}>
        <div style={labelCaps}>DESCRIPTION</div>
        <textarea
          value={project.desc}
          readOnly={!editAll}
          onChange={(e) => apEdit({ desc: e.target.value })}
          style={{
            ...fieldInput(editAll),
            height: "auto",
            minHeight: editAll ? 70 : 0,
            padding: editAll ? "9px 10px" : 0,
            fontSize: 14.5,
            lineHeight: 1.6,
            resize: editAll ? "vertical" : "none",
            display: "block",
          }}
          rows={editAll ? 3 : Math.max(2, Math.ceil(project.desc.length / 90))}
        />
        <div style={{ borderTop: "1px solid #F1F5F9", margin: "14px 0" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <div style={labelCaps}>FUNDING</div>
            <input
              value={project.funding}
              readOnly={!editAll}
              onChange={(e) => apEdit({ funding: e.target.value })}
              style={fieldInput(editAll)}
            />
          </div>
          <div>
            <div style={labelCaps}>CATEGORY</div>
            <div style={{ fontSize: 13.5, color: "#334155", paddingTop: editAll ? 9 : 0 }}>
              {catFull(project.cat as StaffCategory)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={() => toast("Opening project link picker…")}
            style={{ ...ghostBtn(34), color: "#0d2240" }}
          >
            <LinkIcon size={13} />
            Link to Project
          </button>
          <button
            onClick={() => toast("Opening meeting notes picker…")}
            style={{ ...ghostBtn(34), color: "#0d2240" }}
          >
            <FileIcon size={13} />
            Link to Meeting Notes
          </button>
        </div>
      </div>

      {/* Section B — Metadata */}
      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          <div>
            <div style={labelCaps}>PROJECT SPONSOR</div>
            <input
              value={project.sponsor}
              readOnly={!editAll}
              onChange={(e) => apEdit({ sponsor: e.target.value })}
              style={fieldInput(editAll)}
            />
          </div>
          <div>
            <div style={labelCaps}>DURATION</div>
            <input
              value={project.duration}
              readOnly={!editAll}
              onChange={(e) => apEdit({ duration: e.target.value })}
              style={fieldInput(editAll)}
            />
          </div>
          <div>
            <div style={labelCaps}>TOTAL PROJECT COST</div>
            <input
              value={project.cost}
              readOnly={!editAll}
              onChange={(e) => apEdit({ cost: e.target.value })}
              style={fieldInput(editAll)}
            />
          </div>
        </div>
      </div>

      {/* Section C — Location */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Location</span>
          <button onClick={() => toast("Opening map picker…")} style={ghostBtn(30)}>
            Edit location
          </button>
        </div>
        <div
          style={{
            position: "relative",
            height: 170,
            borderRadius: 11,
            border: "1px solid #e5e7eb",
            background: "#E8EEF4",
            overflow: "hidden",
          }}
        >
          {/* stylized roads */}
          <div
            style={{
              position: "absolute",
              left: -20,
              right: -20,
              top: 78,
              height: 14,
              background: "rgba(255,255,255,.75)",
              transform: "rotate(-4deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -20,
              bottom: -20,
              left: "58%",
              width: 12,
              background: "rgba(255,255,255,.6)",
              transform: "rotate(9deg)",
            }}
          />
          <span style={{ position: "absolute", top: 46, left: "34%", color: "#DC2626" }}>
            <MapPinIcon size={22} />
          </span>
          <span style={{ position: "absolute", top: 92, left: "64%", color: "#2563EB" }}>
            <MapPinIcon size={22} />
          </span>
          <span
            style={{
              position: "absolute",
              left: 10,
              bottom: 10,
              fontSize: 10.5,
              color: "#64748B",
              background: "rgba(255,255,255,.8)",
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            Collier Township, PA
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 13, color: "#475569", flexWrap: "wrap" }}>
          <span style={{ whiteSpace: "nowrap" }}>This project affects</span>
          <input
            value={project.neighborhoods ?? NEIGHBORHOOD_DEFAULT}
            readOnly={!editAll}
            onChange={(e) => apEdit({ neighborhoods: e.target.value })}
            style={{ ...fieldInput(editAll, 34), width: 340, maxWidth: "100%", fontSize: 13 }}
          />
        </div>
      </div>

      {/* Section D — Project Timeline */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 0 14px" }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>Project Timeline</span>
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
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" style={{ margin: "0 auto", display: "block" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 18, alignItems: "start" }}>
          {/* Stage rail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {project.stages.map((s) => {
              const sel = s.n === selStage;
              const st = s.state as string;
              const dotColor = st === "Hidden" ? "#94A3B8" : st === "Published" ? "#16A34A" : "#D97706";
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
                    <span style={{ display: "block", fontSize: 11, color: "#94A3B8" }}>{s.dates}</span>
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
