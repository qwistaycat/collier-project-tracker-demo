"use client";

// ================================================================
//  View-source modal — shows where an AI-extracted field or stage
//  came from: document/page/section, confidence, and the quoted
//  passage. To change a suggestion, staff simply edit the field
//  text directly — there is deliberately no reject action here.
// ================================================================

import { useTownship } from "../../TownshipContext";
import {
  btnSecondary,
  FileTextIcon,
  overlayStyle,
  type Conf,
  type SourceView,
} from "./shared";

const CONF_BOX: Record<Conf, { bg: string; border: string; color: string; label: string }> = {
  high: { bg: "#F2F7F4", border: "#C9DAD0", color: "#567A67", label: "High confidence" },
  low: { bg: "#FFF6EC", border: "#FFD5AA", color: "#B45309", label: "Lower confidence — review carefully" },
  med: { bg: "#F8FAFC", border: "#E2E8F0", color: "#475569", label: "Medium confidence" },
};

export default function SourceModal({
  sv,
  onClose,
}: {
  sv: SourceView;
  onClose: () => void;
}) {
  const { toast } = useTownship();
  const box = CONF_BOX[sv.conf];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: "100%",
          maxHeight: "84vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", flex: 1 }}>
            {sv.label}
          </div>
          <button
            onClick={onClose}
            title="Close"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "none",
              background: "#F1F5F9",
              color: "#475569",
              fontSize: 14,
              cursor: "pointer",
              flexShrink: 0,
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#475569", marginBottom: 14 }}>
          <FileTextIcon size={13} color="#2563eb" />
          <span>
            <span style={{ fontWeight: 700 }}>{sv.doc}</span> · Page {sv.page} · {sv.section}
          </span>
        </div>

        <div
          style={{
            background: box.bg,
            border: `1px solid ${box.border}`,
            color: box.color,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>{box.label}</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 3, lineHeight: 1.5 }}>
            {sv.reasoning}
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            color: "#94A3B8",
            marginBottom: 7,
          }}
        >
          Text passage from the document
        </div>
        <div
          style={{
            background: "#FFF6EC",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            fontStyle: "italic",
            color: "#334155",
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          {"“"}
          {sv.passage}
          {"”"}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              toast("Opening document at this section…");
              onClose();
            }}
            style={btnSecondary}
          >
            Open document at this section
          </button>
        </div>
      </div>
    </div>
  );
}
