"use client";

// ================================================================
//  Step 0 — Choose how to start. The AI "Upload documents" card is
//  only present when AI Assistance is ON.
// ================================================================

import { useTownship } from "../../TownshipContext";
import { CopyDocIcon, FileTextIcon, SparkleIcon, UploadTrayIcon } from "./shared";

export type StartKey = "upload" | "scratch" | "duplicate";

export default function StartStep({ onChoose }: { onChoose: (k: StartKey) => void }) {
  const { aiMode, dept } = useTownship();

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: "#0f2d59", margin: 0 }}>
        Create a new project
      </h1>
      <p style={{ fontSize: 14, color: "#64748B", margin: "6px 0 26px" }}>
        Choose how you want to start · In {dept}
      </p>

      <div style={{ display: "flex", gap: 24, alignItems: "stretch", flexWrap: "wrap" }}>
        {aiMode && (
          <button
            onClick={() => onChoose("upload")}
            style={{
              flex: "1 1 220px",
              position: "relative",
              textAlign: "left",
              padding: 22,
              borderRadius: 12,
              background: "#F5F3FF",
              border: "1px solid #C4B5FD",
              boxShadow: "0 8px 24px rgba(124,58,237,.1)",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <span style={{ position: "absolute", top: 14, right: 14 }}>
              <SparkleIcon size={18} color="#7C3AED" />
            </span>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: "#EDE9FE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadTrayIcon size={26} color="#7C3AED" />
            </span>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#0d2240" }}>
              Upload documents
            </span>
            <span style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
              AI reads your meeting minutes, proposals, and budget docs to pre-fill the
              project.
            </span>
            <span style={{ marginTop: "auto" }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 10.5,
                  fontWeight: 700,
                  background: "#7C3AED",
                  color: "#fff",
                  padding: "3px 10px",
                  borderRadius: 9999,
                }}
              >
                Recommended
              </span>
            </span>
          </button>
        )}

        <NeutralCard
          icon={<FileTextIcon size={22} color="#64748B" />}
          title="Start from scratch"
          sub="Fill in every field yourself. You can add and edit stages one at a time."
          onClick={() => onChoose("scratch")}
        />
        <NeutralCard
          icon={<CopyDocIcon size={22} color="#64748B" />}
          title="Duplicate an existing project"
          sub="Useful for annual recurring projects like road paving or budget cycles."
          onClick={() => onChoose("duplicate")}
        />
      </div>
    </div>
  );
}

function NeutralCard({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: "1 1 220px",
        textAlign: "left",
        padding: 22,
        borderRadius: 12,
        background: "#fff",
        border: "1px solid #e5e7eb",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s ease",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 16, fontWeight: 600, color: "#0d2240" }}>{title}</span>
      <span style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{sub}</span>
    </button>
  );
}
