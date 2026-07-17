"use client";

// ================================================================
//  GalleryContent — the staff Projects landing screen.
//  Title row → priority/activity panels (hidden while a ?q= search
//  is active) → category chips + search → status pills + spotlight
//  toggle → Pending Review band (Manager's Office only) → category
//  groups of project cards → empty state.
//
//  Filter semantics match the prototype: single-select category,
//  multi-select status with 'All' fallback, spotlight-only toggle.
//  ?q= comes from the navbar search (also wired to the in-row
//  search input) and matches title/description case-insensitively.
// ================================================================

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CloseIcon, EyeIcon, PlusIcon, SearchIcon } from "@/app/components/icons";
import { useTownship } from "../../TownshipContext";
import {
  CAT_META,
  catFull,
  DEFAULT_DEPT,
  STAFF_CATEGORIES,
  type Lifecycle,
  type StaffCategory,
  type StaffProject,
} from "../../data";
import PendingReviewBand from "./PendingReviewBand";
import PriorityPanels from "./PriorityPanels";
import ProjectCard from "./ProjectCard";
import { StarFilledIcon } from "./galleryIcons";

const CAT_KEYS: (StaffCategory | "All")[] = ["All", ...STAFF_CATEGORIES];

const STATUS_LABELS = ["All", "Draft", "Pending Review", "Published", "Completed"];

const LABEL_TO_LC: Record<string, Lifecycle> = {
  Draft: "draft",
  "Pending Review": "pending",
  Published: "published",
  Completed: "completed",
};

const URGENCY_RANK: Record<string, number> = { High: 3, Standard: 2, Low: 1 };

function pillStyle(on: boolean, height = 32): React.CSSProperties {
  return {
    height,
    padding: "0 14px",
    borderRadius: 9999,
    fontSize: 12.5,
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
    background: on ? "#0d2240" : "#fff",
    color: on ? "#fff" : "#475569",
    border: `1px solid ${on ? "#0d2240" : "#e5e7eb"}`,
    transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
    whiteSpace: "nowrap",
  };
}

export default function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projects, dept } = useTownship();

  const q = searchParams.get("q") ?? "";
  const ql = q.trim().toLowerCase();

  const [catFilter, setCatFilter] = useState<StaffCategory | "All">("All");
  const [galStatus, setGalStatus] = useState<string[]>(["All"]);
  const [spotlightOnly, setSpotlightOnly] = useState(false);

  // In-row search input mirrors the navbar search (?q=), including
  // the render-time sync pattern the navbar uses.
  const [searchDraft, setSearchDraft] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  if (syncedQ !== q) {
    setSyncedQ(q);
    setSearchDraft(q);
  }

  const statusAll = galStatus.includes("All");

  const matchesQ = (p: StaffProject) =>
    !ql || p.title.toLowerCase().includes(ql) || p.desc.toLowerCase().includes(ql);
  const matchesCat = (p: StaffProject) => catFilter === "All" || p.cat === catFilter;
  const matchesStatus = (p: StaffProject) =>
    statusAll || galStatus.some((l) => LABEL_TO_LC[l] === p.lc);

  const galleryProjects = projects.filter(
    (p) =>
      p.lc !== "trash" &&
      matchesQ(p) &&
      matchesCat(p) &&
      matchesStatus(p) &&
      (!spotlightOnly || !!p.spotlight)
  );

  const groups = STAFF_CATEGORIES.map((cat) => ({
    cat,
    items: galleryProjects.filter((p) => p.cat === cat),
  })).filter((g) => g.items.length > 0);

  // Pending Review band (Manager's Office only)
  const pendingRow = projects
    .filter((p) => p.lc === "pending" && matchesCat(p) && matchesQ(p))
    .sort(
      (a, b) =>
        (URGENCY_RANK[b.urgency ?? "Low"] ?? 0) - (URGENCY_RANK[a.urgency ?? "Low"] ?? 0)
    );
  const showPendingRow =
    dept === DEFAULT_DEPT &&
    pendingRow.length > 0 &&
    (statusAll || galStatus.includes("Pending Review"));

  const toggleGalStatus = (label: string) => {
    setGalStatus((cur) => {
      if (label === "All") return ["All"];
      let next = cur.filter((l) => l !== "All");
      next = next.includes(label) ? next.filter((l) => l !== label) : [...next, label];
      return next.length ? next : ["All"];
    });
  };

  const clearFilters = () => {
    setCatFilter("All");
    setGalStatus(["All"]);
    setSpotlightOnly(false);
    if (ql) router.push("/township/projects");
  };

  const commitSearch = () => {
    const v = searchDraft.trim();
    router.push(v ? `/township/projects?q=${encodeURIComponent(v)}` : "/township/projects");
  };

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "26px 28px 60px" }}>
      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 600, color: "#0f2d59", margin: 0 }}>Projects</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#2563eb",
              textDecoration: "none",
            }}
          >
            <EyeIcon size={15} />
            Preview resident gallery
          </a>
          <button
            onClick={() => router.push("/township/create")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              height: 40,
              padding: "0 18px",
              borderRadius: 9999,
              background: "#0d2240",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
          >
            <PlusIcon size={13} />
            New Project
          </button>
        </div>
      </div>

      {/* Search results row */}
      {ql && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
            padding: "10px 14px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            fontSize: 13,
            color: "#374151",
          }}
        >
          <span>
            <strong>{galleryProjects.length}</strong> result
            {galleryProjects.length === 1 ? "" : "s"} for &ldquo;{q.trim()}&rdquo;
          </span>
          <button
            onClick={() => router.push("/township/projects")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              border: "none",
              background: "none",
              color: "#2563eb",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <CloseIcon size={10} />
            Clear search
          </button>
        </div>
      )}

      {/* Priority / activity panels — hidden while searching */}
      {!ql && <PriorityPanels />}

      {/* Category filter row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        {CAT_KEYS.map((key) => (
          <button key={key} onClick={() => setCatFilter(key)} style={pillStyle(catFilter === key)}>
            {catFull(key)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative", width: 200 }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              color: "#94A3B8",
            }}
          >
            <SearchIcon size={15} />
          </span>
          <input
            value={searchDraft}
            placeholder="Search projects"
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitSearch();
            }}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              width: "100%",
              height: 36,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              padding: "0 10px 0 32px",
              fontSize: 13,
              background: "#fff",
            }}
          />
        </div>
      </div>

      {/* Status filter row */}
      <div
        style={{
          display: "flex",
          gap: 7,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginRight: 3 }}>
          Status
        </span>
        {STATUS_LABELS.map((label) => (
          <button
            key={label}
            onClick={() => toggleGalStatus(label)}
            style={pillStyle(galStatus.includes(label), 30)}
          >
            {label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setSpotlightOnly((v) => !v)}
          style={{
            height: 30,
            padding: "0 13px",
            borderRadius: 9999,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            background: spotlightOnly ? "#EFF6FF" : "#fff",
            color: spotlightOnly ? "#2563eb" : "#475569",
            border: `1px solid ${spotlightOnly ? "#2563eb" : "#e5e7eb"}`,
            transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          <StarFilledIcon size={13} />
          Spotlighted only
        </button>
      </div>

      {/* Pending Review band */}
      {showPendingRow && (
        <PendingReviewBand
          items={pendingRow}
          onReviewAll={() => setGalStatus(["Pending Review"])}
        />
      )}

      {/* Category groups / empty state */}
      {groups.length === 0 ? (
        <div style={{ textAlign: "center", padding: 70, fontSize: 14, color: "#94A3B8" }}>
          No projects match your filters.{" "}
          <button
            onClick={clearFilters}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "#2563eb",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.cat} style={{ marginBottom: 34 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: CAT_META[g.cat].color,
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                {catFull(g.cat)}
              </span>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>
                {g.items.length} project{g.items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 18,
              }}
            >
              {g.items.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
