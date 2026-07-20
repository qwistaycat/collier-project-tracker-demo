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

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "@/app/components/icons";
import { useTownship } from "../../TownshipContext";
import {
  catFull,
  DEFAULT_DEPT,
  STAFF_CATEGORIES,
  type Lifecycle,
  type StaffProject,
} from "../../data";
import PendingReviewBand from "./PendingReviewBand";
import ProjectCard from "./ProjectCard";

const LABEL_TO_LC: Record<string, Lifecycle> = {
  Draft: "draft",
  "Pending Review": "pending",
  Published: "published",
  Completed: "completed",
};

const URGENCY_RANK: Record<string, number> = { High: 3, Standard: 2, Low: 1 };

export default function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projects, dept } = useTownship();

  const q = searchParams.get("q") ?? "";
  const ql = q.trim().toLowerCase();

  const [galStatus, setGalStatus] = useState<string[]>(["All"]);

  const statusAll = galStatus.includes("All");

  const matchesQ = (p: StaffProject) =>
    !ql || p.title.toLowerCase().includes(ql) || p.desc.toLowerCase().includes(ql);
  const matchesStatus = (p: StaffProject) =>
    statusAll || galStatus.some((l) => LABEL_TO_LC[l] === p.lc);

  const galleryProjects = projects.filter(
    (p) =>
      p.lc !== "trash" &&
      matchesQ(p) &&
      matchesStatus(p)
  );

  const groups = STAFF_CATEGORIES.map((cat) => ({
    cat,
    items: galleryProjects.filter((p) => p.cat === cat),
  })).filter((g) => g.items.length > 0);

  // Pending Review band (Manager's Office only)
  const pendingRow = projects
    .filter((p) => p.lc === "pending" && matchesQ(p))
    .sort(
      (a, b) =>
        (URGENCY_RANK[b.urgency ?? "Low"] ?? 0) - (URGENCY_RANK[a.urgency ?? "Low"] ?? 0)
    );
  const showPendingRow =
    dept === DEFAULT_DEPT &&
    pendingRow.length > 0 &&
    (statusAll || galStatus.includes("Pending Review"));



  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "26px 28px 60px" }}>
      {/* Add Project — opens the create flow (AI upload or manual entry) */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <Link
          href="/township/create"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            height: 38,
            padding: "0 18px",
            borderRadius: 9999,
            background: "#0d2240",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 600,
            textDecoration: "none",
            transition: "background 0.15s ease",
          }}
        >
          <PlusIcon size={13} />
          Add Project
        </Link>
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
            onClick={() => { setGalStatus(["All"]); router.push("/township/projects"); }}
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
          <section key={g.cat} style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111827",
                marginBottom: 16,
              }}
            >
              {catFull(g.cat)}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 24,
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
