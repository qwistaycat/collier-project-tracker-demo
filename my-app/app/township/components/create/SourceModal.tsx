"use client";

// ================================================================
//  View-source modal — shows where an AI-extracted field or stage
//  came from: document/page/section, confidence, and the quoted
//  passage. "Reject this suggestion" clears the field (wizard owns
//  that mutation + toast).
// ================================================================

import { useTownship } from "../../TownshipContext";
import {
  btnDangerOutline,
  btnSecondary,
  FileTextIcon,
  overlayStyle,
  type Conf,
  type SourceView,
} from "./shared";

const CONF_BOX: Record<Conf, { bg: string; border: string; color: string; label: string }> = {
  high: { bg: "#F0FDF4", border: "#BBF7D0", color: "#15803D", label: "High confidence" },
  low: { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309", label: "Lower confidence — review carefully" },
  med: { bg: "#F8FAFC", border: "#E2E8F0", color: "#475569", label: "Medium confidence" },
};

export default function SourceModal({
  sv,
  onClose,
  onReject,
}: {
  sv: SourceView;
  onClose: () => void;
  onReject: () => void;
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
          <FileTextIcon size={13} color="#7C3AED" />
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
            background: "#FFFBEB",
            borderLeft: "3px solid #F5D97A",
            borderRadius: "0 8px 8px 0",
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

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onReject} style={btnDangerOutline}>
            Reject this suggestion
          </button>
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
