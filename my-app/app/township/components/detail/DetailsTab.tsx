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

import { useEffect, useRef, useState } from "react";
import { useTownship } from "../../TownshipContext";
import { catHeroImage, catFull, CAT_META, type StaffCategory } from "../../data";
import {
  MapPinIcon,
  ImageIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  SearchIcon,
  CloseIcon,
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
  type MapArea,
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
  textDecoration: "none",
};

// One editable external-link row in edit-all mode: URL input +
// Remove; a removed link shows a "+ Add …" affordance instead.
function LinkEditRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  if (value === null) {
    return (
      <button
        onClick={() => onChange("")}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          textAlign: "left",
          fontSize: 12.5,
          fontWeight: 600,
          color: "#2563eb",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        + Add {label.toLowerCase()}
      </button>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12.5,
          fontWeight: 600,
          color: "#334155",
          width: 170,
          flexShrink: 0,
        }}
      >
        <ExternalLinkIcon size={14} /> {label}
      </span>
      <input
        value={value === "#" ? "" : value}
        placeholder="https://…"
        aria-label={`${label} URL`}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...fieldInput(true, 34), width: "auto", flex: 1, minWidth: 180, fontSize: 12.5 }}
      />
      <button
        onClick={() => onChange(null)}
        aria-label={`Remove ${label}`}
        style={{ ...ghostBtn(30), color: "#CD481B", fontSize: 12 }}
      >
        Remove
      </button>
    </div>
  );
}

// Canned place results for the location search — real Collier
// Township landmarks, with deterministic map positions (percent).
const PLACES: { name: string; address: string; x: number; y: number }[] = [
  { name: "Collier Township Municipal Building", address: "2418 Hilltop Rd, Presto, PA 15142", x: 46, y: 38 },
  { name: "Hilltop Park", address: "Nevillewood Dr, Presto, PA 15142", x: 58, y: 30 },
  { name: "Rennerdale Volunteer Fire Dept", address: "131 Noblestown Rd, Rennerdale, PA 15071", x: 30, y: 52 },
  { name: "Kirwan Heights", address: "Washington Pike, Bridgeville, PA 15017", x: 68, y: 66 },
  { name: "Walkers Mill", address: "Walkers Mill Rd, Carnegie, PA 15106", x: 24, y: 26 },
  { name: "Presto-Sygan Road", address: "Presto, PA 15142", x: 52, y: 58 },
  { name: "Nevillewood", address: "The Club at Nevillewood, Presto, PA 15142", x: 62, y: 44 },
];

type PlaceMode = null | "pin" | "area";

// ── Info + Map/Photos card — the resident ProjectMapCard layout
//    with the info column editable and staff location tools
//    (address search, drop-a-pin, highlight-an-area) on the map ────

function FactsMapCard({ project: p, editAll }: { project: XProject; editAll: boolean }) {
  const { updateProject, toast } = useTownship();
  const apEdit = (fields: Partial<XProject>) => patchProject(updateProject, p.id, fields);

  const [view, setView] = useState<"map" | "photos">("map");
  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Location tools
  const [mode, setMode] = useState<PlaceMode>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dragRect, setDragRect] = useState<MapArea | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  const pins = p.pins ?? [];
  const area = p.area ?? null;

  // Escape cancels an active placement mode.
  useEffect(() => {
    if (!mode) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMode(null);
        setDragRect(null);
        dragStart.current = null;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mode]);

  const panePct = (e: { clientX: number; clientY: number }) => {
    const r = paneRef.current?.getBoundingClientRect();
    if (!r) return { x: 50, y: 50 };
    return {
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    };
  };

  const addPin = (x: number, y: number, label?: string) => {
    apEdit({ pins: [...pins, { x, y, label }] });
    toast(label ? `Pin added — ${label}` : "Pin dropped — click a pin to remove it");
  };

  const removePin = (i: number) => {
    apEdit({ pins: pins.filter((_, j) => j !== i) });
  };

  const results = query.trim()
    ? PLACES.filter((pl) =>
        `${pl.name} ${pl.address}`.toLowerCase().includes(query.trim().toLowerCase())
      ).slice(0, 5)
    : PLACES.slice(0, 5);

  const pickPlace = (pl: (typeof PLACES)[number]) => {
    addPin(pl.x, pl.y, pl.name);
    setQuery("");
    setSearchOpen(false);
  };

  const overlayClick = (e: React.MouseEvent) => {
    if (mode !== "pin") return;
    const pt = panePct(e);
    addPin(pt.x, pt.y);
    setMode(null);
  };

  const overlayPointerDown = (e: React.PointerEvent) => {
    if (mode !== "area") return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = panePct(e);
    setDragRect(null);
  };

  const overlayPointerMove = (e: React.PointerEvent) => {
    if (mode !== "area" || !dragStart.current) return;
    const cur = panePct(e);
    const s = dragStart.current;
    setDragRect({
      x: Math.min(s.x, cur.x),
      y: Math.min(s.y, cur.y),
      w: Math.abs(cur.x - s.x),
      h: Math.abs(cur.y - s.y),
    });
  };

  const overlayPointerUp = () => {
    if (mode !== "area") return;
    if (dragRect && dragRect.w >= 2 && dragRect.h >= 2) {
      apEdit({ area: dragRect });
      toast("Area highlighted on the map");
    }
    dragStart.current = null;
    setDragRect(null);
    setMode(null);
  };

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
      <div ref={paneRef} style={{ flex: 1, position: "relative", background: "#f3f4f6" }}>
        {view === "map" ? (
          <>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-80.18%2C40.32%2C-79.98%2C40.42&layer=mapnik"
              style={{ width: "100%", height: "100%", minHeight: 360, border: "none", display: "block" }}
              title="Project Location Map"
            />

            {/* Highlighted area */}
            {area && (
              <div
                style={{
                  position: "absolute",
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  width: `${area.w}%`,
                  height: `${area.h}%`,
                  border: "2px solid #2563eb",
                  background: "rgba(37, 99, 235, 0.12)",
                  borderRadius: 4,
                  pointerEvents: "none",
                }}
              >
                <button
                  onClick={() => apEdit({ area: null })}
                  aria-label="Remove highlighted area"
                  title="Remove highlighted area"
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                  }}
                >
                  <CloseIcon size={9} />
                </button>
              </div>
            )}

            {/* Drag preview while selecting an area */}
            {dragRect && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: `${dragRect.x}%`,
                  top: `${dragRect.y}%`,
                  width: `${dragRect.w}%`,
                  height: `${dragRect.h}%`,
                  border: "2px dashed #2563eb",
                  background: "rgba(37, 99, 235, 0.08)",
                  borderRadius: 4,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Dropped pins — click to remove */}
            {pins.map((pin, i) => (
              <button
                key={i}
                onClick={() => removePin(i)}
                aria-label={`Remove pin${pin.label ? `: ${pin.label}` : ""}`}
                title="Remove pin"
                style={{
                  position: "absolute",
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  transform: "translate(-50%, -100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <span style={{ color: "#CD481B", display: "flex" }}>
                  <MapPinIcon size={26} />
                </span>
                {pin.label && (
                  <span
                    style={{
                      marginTop: 2,
                      background: "rgba(255,255,255,0.94)",
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                    }}
                  >
                    {pin.label}
                  </span>
                )}
              </button>
            ))}

            {/* Placement capture layer */}
            {mode && (
              <div
                onClick={overlayClick}
                onPointerDown={overlayPointerDown}
                onPointerMove={overlayPointerMove}
                onPointerUp={overlayPointerUp}
                style={{ position: "absolute", inset: 0, cursor: "crosshair", zIndex: 6 }}
              />
            )}

            {/* Floating search + placement tools */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                right: 10,
                zIndex: 7,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ position: "relative", width: 250 }}>
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 10,
                    display: "flex",
                    alignItems: "center",
                    color: "#6b7280",
                  }}
                >
                  <SearchIcon size={13} />
                </span>
                <input
                  value={query}
                  placeholder="Search an address or place"
                  aria-label="Search an address or place"
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false);
                    if (e.key === "Enter" && results.length) pickPlace(results[0]);
                  }}
                  style={{
                    width: "100%",
                    height: 34,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "0 10px 0 30px",
                    fontSize: 12.5,
                    background: "#fff",
                    fontFamily: "inherit",
                    boxShadow: "0 2px 8px rgba(2,12,27,.10)",
                  }}
                />
                {searchOpen && results.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 38,
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      boxShadow: "0 8px 24px rgba(2,12,27,.14)",
                      overflow: "hidden",
                    }}
                  >
                    {results.map((pl) => (
                      <button
                        key={pl.name}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickPlace(pl)}
                        className="township-place-result"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          width: "100%",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          borderBottom: "1px solid #F1F5F9",
                          padding: "8px 10px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <span style={{ color: "#94A3B8", marginTop: 1, display: "flex" }}>
                          <MapPinIcon size={13} />
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span
                            style={{
                              display: "block",
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: "#111827",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {pl.name}
                          </span>
                          <span
                            style={{
                              display: "block",
                              fontSize: 11,
                              color: "#6b7280",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {pl.address}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setMode(mode === "pin" ? null : "pin")}
                aria-pressed={mode === "pin"}
                style={{
                  ...ghostBtn(34),
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(2,12,27,.10)",
                  ...(mode === "pin"
                    ? { background: "#0d2240", border: "1px solid #0d2240", color: "#fff" }
                    : null),
                }}
              >
                <MapPinIcon size={13} />
                Drop pin
              </button>
              <button
                onClick={() => setMode(mode === "area" ? null : "area")}
                aria-pressed={mode === "area"}
                style={{
                  ...ghostBtn(34),
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(2,12,27,.10)",
                  ...(mode === "area"
                    ? { background: "#0d2240", border: "1px solid #0d2240", color: "#fff" }
                    : null),
                }}
              >
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="4 3">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
                Select area
              </button>
            </div>

            {/* Mode hint */}
            {mode && (
              <div
                role="status"
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 7,
                  background: "#0d2240",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 9999,
                  padding: "6px 14px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(2,12,27,.2)",
                  pointerEvents: "none",
                }}
              >
                {mode === "pin"
                  ? "Click the map to drop a pin — Esc to cancel"
                  : "Drag on the map to highlight an area — Esc to cancel"}
              </div>
            )}
          </>
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
  // undefined = demo default ("#"), null = removed by staff
  const projectLink = project.projectLink === null ? null : (project.projectLink ?? "#");
  const meetingLink = project.meetingLink === null ? null : (project.meetingLink ?? "#");

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
        {editAll ? (
          <input
            value={project.title}
            aria-label="Project title"
            placeholder="Project title"
            onChange={(e) => apEdit({ title: e.target.value })}
            style={{
              ...fieldInput(true, 48),
              marginTop: 28,
              fontSize: 24,
              fontWeight: 700,
              color: "#111827",
              fontFamily: "inherit",
            }}
          />
        ) : (
          <h1 className="text-2xl font-bold text-gray-900" style={{ margin: "28px 0 0 0" }}>
            {project.title}
          </h1>
        )}

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
            {editAll ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <LinkEditRow
                  label="Link to Project"
                  value={projectLink}
                  onChange={(v) => apEdit({ projectLink: v })}
                />
                <LinkEditRow
                  label="Link to Meeting Notes"
                  value={meetingLink}
                  onChange={(v) => apEdit({ meetingLink: v })}
                />
              </div>
            ) : (
              (projectLink !== null || meetingLink !== null) && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {projectLink !== null && (
                    <a
                      href={projectLink || "#"}
                      target={projectLink && projectLink !== "#" ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      style={linkPill}
                    >
                      <ExternalLinkIcon size={15} /> Link to Project
                    </a>
                  )}
                  {meetingLink !== null && (
                    <a
                      href={meetingLink || "#"}
                      target={meetingLink && meetingLink !== "#" ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      style={linkPill}
                    >
                      <ExternalLinkIcon size={15} /> Link to Meeting Notes
                    </a>
                  )}
                </div>
              )
            )}
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
                    {sel && stageDirty && (
                      <span
                        title="Unsaved changes"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#FFAA55",
                          flexShrink: 0,
                        }}
                      />
                    )}
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
