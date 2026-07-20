"use client";

// ================================================================
//  Step 3 — Review project details. Every field editable;
//  confidence dots + "View source" buttons when an AI extraction
//  backs the draft. Department is fixed to the acting department.
// ================================================================

import { useState } from "react";
import { EyeIcon } from "@/app/components/icons";
import { STAFF_CATEGORIES, type StaffCategory } from "../../data";
import { useTownship } from "../../TownshipContext";
import {
  btnPrimary,
  btnSecondary,
  cardStyle,
  ConfidenceDot,
  ctrlSrcStyle,
  fieldLabelStyle,
  FileTextIcon,
  InfoCircleIcon,
  inputStyle,
  stickyFooterStyle,
  textareaStyle,
  type ExtractMeta,
  type FieldKey,
  type WizardFields,
} from "./shared";

interface Props {
  fields: WizardFields;
  updField: <K extends keyof WizardFields>(k: K, v: WizardFields[K]) => void;
  extract: ExtractMeta | null;
  sourceDocs: [string, string][];
  onViewSource: (key: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function ReviewStep({
  fields,
  updField,
  extract,
  sourceDocs,
  onViewSource,
  onBack,
  onContinue,
}: Props) {
  const { aiMode, dept } = useTownship();
  const [srcExpanded, setSrcExpanded] = useState(true);
  const aiSrc = aiMode && !!extract;
  const fc = (k: FieldKey) => extract?.fields[k]?.conf;

  // Plain render helper (not a nested component — those remount on
  // every parent render and trip the compiler lint).
  const labelRow = (label: string, k: FieldKey, srcLabel = "View source") => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <span style={fieldLabelStyle}>{label}</span>
      <ConfidenceDot conf={fc(k)} fieldTip />
      <span style={{ flex: 1 }} />
      {aiSrc && (
        <button onClick={() => onViewSource(k)} style={ctrlSrcStyle}>
          <EyeIcon size={11} />
          {srcLabel}
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#0f2d59", margin: 0 }}>
            Review project details
          </h1>
          {aiMode ? (
            <p style={{ fontSize: 13.5, color: "#7C3AED", margin: "6px 0 0", lineHeight: 1.5 }}>
              AI drafted the following based on your documents. Every field is editable —
              edit anything that needs changing.
            </p>
          ) : (
            <p style={{ fontSize: 13.5, color: "#64748B", margin: "6px 0 0" }}>
              Fill in the project details.
            </p>
          )}
        </div>
        {aiMode && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: "#EDE9FE",
              color: "#7C3AED",
              padding: "4px 11px",
              borderRadius: 9999,
              whiteSpace: "nowrap",
              marginTop: 6,
            }}
          >
            AI-suggested throughout
          </span>
        )}
      </div>

      {!aiMode && extract && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "#F8FAFC",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12.5,
            color: "#475569",
            marginBottom: 10,
          }}
        >
          <InfoCircleIcon size={15} color="#64748B" />
          AI-generated content is preserved. Toggle AI Assistance on to access source
          references.
        </div>
      )}

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 14 }}>
        <div>
          {labelRow("Project title", "title")}
          <input
            value={fields.title}
            onChange={(e) => updField("title", e.target.value)}
            placeholder="e.g., Road Paving 2026"
            style={{ ...inputStyle, height: 42, fontSize: 16, fontWeight: 600 }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            {labelRow("Category", "category", "Source")}
            <select
              value={fields.category}
              onChange={(e) => updField("category", e.target.value as StaffCategory)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {STAFF_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            {labelRow("Department", "department", "Source")}
            <input
              value={dept}
              disabled
              style={{ ...inputStyle, background: "#F8FAFC", color: "#94A3B8" }}
            />
          </div>
        </div>

        <div>
          {labelRow("Description", "desc")}
          <textarea
            value={fields.desc}
            onChange={(e) => updField("desc", e.target.value)}
            placeholder="What is this project and why does it matter to residents?"
            style={textareaStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            {labelRow("Funding", "funding", "Source")}
            <input
              value={fields.funding}
              onChange={(e) => updField("funding", e.target.value)}
              placeholder="e.g., PennDOT Liquid Fuels + Capital Reserve"
              style={inputStyle}
            />
          </div>
          <div>
            {labelRow("Total cost", "cost", "Source")}
            <input
              value={fields.cost}
              onChange={(e) => updField("cost", e.target.value)}
              placeholder="e.g., $645,203"
              style={inputStyle}
            />
          </div>
          <div>
            {labelRow("Project sponsor", "sponsor", "Source")}
            <input
              value={fields.sponsor}
              onChange={(e) => updField("sponsor", e.target.value)}
              placeholder="e.g., Public Works Dept"
              style={inputStyle}
            />
          </div>
          <div>
            {labelRow("Duration", "duration", "Source")}
            <input
              value={fields.duration}
              onChange={(e) => updField("duration", e.target.value)}
              placeholder="e.g., Mar 2026 – Nov 2026"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Source Documents card */}
      {sourceDocs.length > 0 && (
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <div
            onClick={() => setSrcExpanded((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "13px 16px",
              cursor: "pointer",
            }}
          >
            <FileTextIcon size={15} color="#7C3AED" />
            <span style={{ fontSize: 13, color: "#64748B", flex: 1 }}>
              <span style={{ fontWeight: 700, color: "#111827" }}>Source Documents</span>
              {" — click any field's “View source” to see where it came from"}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#7C3AED" }}>
              {srcExpanded ? "Hide" : "Show"}
            </span>
          </div>
          {srcExpanded && (
            <div style={{ padding: "0 16px 14px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {sourceDocs.map(([name]) => (
                  <span
                    key={name}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      background: "#F8FAFC",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: "6px 11px",
                      fontSize: 12,
                      color: "#334155",
                      maxWidth: 260,
                    }}
                  >
                    <FileTextIcon size={13} color="#7C3AED" />
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {name}
                    </span>
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 9, lineHeight: 1.5 }}>
                These documents are saved with the project for reference. Residents will
                not see them unless you attach them to specific stages.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={stickyFooterStyle}>
        <button onClick={onBack} style={btnSecondary}>
          Back
        </button>
        <button onClick={onContinue} style={{ ...btnPrimary, height: 42, padding: "0 22px" }}>
          Continue to Timeline
        </button>
      </div>
    </div>
  );
}
