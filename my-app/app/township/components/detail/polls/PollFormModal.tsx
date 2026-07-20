"use client";

// ================================================================
//  PollFormModal — create/edit the project's single poll. Fully
//  controlled local form state seeded from `initial`; Cancel and
//  backdrop click discard silently. Save hands the form back to
//  the tab, which owns the store mutation + toasts.
// ================================================================

import { useState, type CSSProperties } from "react";
import type { PollFormState } from "./pollData";

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 5,
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 14,
  color: "#111827",
  outline: "none",
  fontFamily: "inherit",
  background: "#fff",
  boxSizing: "border-box",
};

function OptionRow({
  dot,
  value,
  onChange,
}: {
  dot: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: dot,
          flexShrink: 0,
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, height: 38, fontSize: 13.5 }}
      />
    </div>
  );
}

export default function PollFormModal({
  initial,
  onCancel,
  onSave,
}: {
  initial: PollFormState;
  onCancel: () => void;
  onSave: (form: PollFormState) => void;
}) {
  const [form, setForm] = useState<PollFormState>(initial);
  const set = (patch: Partial<PollFormState>) =>
    setForm((f) => ({ ...f, ...patch }));

  const saveLabel = form.edit
    ? "Save changes"
    : form.publish
      ? "Create & publish poll"
      : "Save as draft";

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 76,
        background: "rgba(15,23,42,.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: "100%",
          maxHeight: "86vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>
          {form.edit ? "Edit poll" : "Create a poll for this project"}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", margin: "4px 0 18px" }}>
          One poll per project. Residents choose from three fixed options — you
          can rename them.
        </div>

        <div style={labelStyle}>Poll question</div>
        <input
          value={form.question}
          onChange={(e) => set({ question: e.target.value })}
          placeholder="Do you support this proposal?"
          style={{ ...inputStyle, marginBottom: 16 }}
        />

        <div style={labelStyle}>Description or context (optional)</div>
        <textarea
          value={form.desc}
          onChange={(e) => set({ desc: e.target.value })}
          placeholder="Helper text shown to residents under the question."
          style={{
            ...inputStyle,
            height: "auto",
            minHeight: 64,
            padding: "10px 12px",
            fontSize: 13.5,
            lineHeight: 1.5,
            resize: "vertical",
            marginBottom: 16,
          }}
        />

        <div style={labelStyle}>Answer options</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <OptionRow
            dot="#16A34A"
            value={form.optSupport}
            onChange={(v) => set({ optSupport: v })}
          />
          <OptionRow
            dot="#CD481B"
            value={form.optOppose}
            onChange={(v) => set({ optOppose: v })}
          />
          <OptionRow
            dot="#94A3B8"
            value={form.optNeutral}
            onChange={(v) => set({ optNeutral: v })}
          />
        </div>
        <div style={{ fontSize: 11.5, color: "#94a3b8", margin: "6px 0 16px" }}>
          You can rename these, but not add or remove options.
        </div>

        <div style={labelStyle}>End date</div>
        <input
          value={form.end}
          onChange={(e) => set({ end: e.target.value })}
          placeholder="30 days from creation"
          style={{ ...inputStyle, marginBottom: 18 }}
        />

        {/* Publish toggle row */}
        <div
          onClick={() => set({ publish: !form.publish })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "12px 14px",
            background: "#F8FAFC",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            marginBottom: 20,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              position: "relative",
              width: 38,
              height: 22,
              borderRadius: 20,
              background: form.publish ? "#0d2240" : "#CBD5E1",
              flexShrink: 0,
              transition: "background 0.15s ease",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: form.publish ? 18 : 2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.15s ease",
              }}
            />
          </span>
          <span>
            <span
              style={{
                display: "block",
                fontSize: 13.5,
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              {form.publish ? "Publish now (Active)" : "Save as draft"}
            </span>
            <span style={{ display: "block", fontSize: 12, color: "#94a3b8" }}>
              {form.publish
                ? "Residents can vote as soon as you save."
                : "Not visible to residents until you publish."}
            </span>
          </span>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              height: 40,
              padding: "0 16px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s ease",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            style={{
              height: 40,
              padding: "0 16px",
              background: "#0d2240",
              border: "none",
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.15s ease",
            }}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
