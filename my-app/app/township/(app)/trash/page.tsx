"use client";

// ================================================================
//  Township Trash — soft-delete holding area, reached only from the
//  profile dropdown. Lists projects with lc === 'trash'; Restore
//  returns a project to its previous lifecycle state, Delete
//  permanently removes it from the session registry. No nav tab is
//  active while here (the navbar highlights nothing for /trash).
// ================================================================

import Link from "next/link";
import { useState } from "react";
import { useTownship } from "../../TownshipContext";
import { CAT_META, catFull, lcMeta } from "../../data";

// ── Pill action button with a subtle hover wash ──────────────────

function PillButton({
  label,
  color,
  border,
  hoverBg,
  onClick,
}: {
  label: string;
  color: string;
  border: string;
  hoverBg: string;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 34,
        padding: "0 14px",
        background: hover ? hoverBg : "#fff",
        border: `1px solid ${border}`,
        borderRadius: 9999,
        fontSize: 12.5,
        fontWeight: 600,
        color,
        cursor: "pointer",
        transition: "background 0.15s ease",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────

export default function TrashPage() {
  const { projects, setProjects, updateProject, toast } = useTownship();

  const trashItems = projects.filter((p) => p.lc === "trash");

  const restore = (id: string) => {
    updateProject(id, (p) => ({ ...p, lc: p.prevLc || "draft" }));
    toast("Restored from Trash");
  };

  const purge = (id: string) => {
    setProjects((ps) => ps.filter((p) => p.id !== id));
    toast("Permanently deleted");
  };

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "26px 28px 60px",
        minHeight: "calc(100vh - 58px)",
      }}
    >
      <Link
        href="/township/projects"
        style={{
          display: "inline-block",
          fontSize: 13,
          color: "#64748b",
          textDecoration: "none",
          marginBottom: 12,
          transition: "color 0.15s ease",
        }}
      >
        ← Back to Projects
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>
        Trash
      </h1>
      <p style={{ fontSize: 13, color: "#64748b", margin: "3px 0 22px" }}>
        Deleted projects stay here for 30 days before permanent deletion. You
        get an email warning 7 days before purge.
      </p>

      {trashItems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "70px 20px",
            color: "#94a3b8",
            fontSize: 14,
          }}
        >
          Trash is empty.
        </div>
      ) : (
        trashItems.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "15px 18px",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: CAT_META[p.cat].color,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                {p.title}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                {catFull(p.cat)} · was {lcMeta(p.prevLc || "draft").label} ·
                deleted {p.trashedDate || "recently"}
              </div>
            </div>
            <PillButton
              label="Restore"
              color="#0d2240"
              border="#e2e8f0"
              hoverBg="#f8fafc"
              onClick={() => restore(p.id)}
            />
            <PillButton
              label="Delete permanently"
              color="#CD481B"
              border="#F2C6B3"
              hoverBg="#FBF0EA"
              onClick={() => purge(p.id)}
            />
          </div>
        ))
      )}
    </main>
  );
}
