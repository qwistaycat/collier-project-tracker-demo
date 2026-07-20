"use client";

// ================================================================
//  Step 1 — Upload project documents. The dropzone is a demo
//  shortcut: clicking it "uploads" three fixed files. A sample
//  picker surfaces the four CREATE_SAMPLES document sets so the
//  richer pre-baked extractions are reachable.
// ================================================================

import { useState } from "react";
import { ChevronDownIcon } from "@/app/components/icons";
import { CREATE_SAMPLES } from "../../data";
import {
  btnPurple,
  btnSecondary,
  cardStyle,
  detectType,
  FileTextIcon,
  InfoCircleIcon,
  SparkleIcon,
  stickyFooterStyle,
  textareaStyle,
  UPLOAD_SHORTCUT_FILES,
  UploadTrayIcon,
} from "./shared";

interface Props {
  files: string[];
  setFiles: (f: string[]) => void;
  onBack: () => void;
  /** null = default upload path (culvert extract); key = CREATE_SAMPLES entry */
  onRead: (sampleKey: string | null) => void;
}

export default function UploadStep({ files, setFiles, onBack, onRead }: Props) {
  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctxText, setCtxText] = useState("");
  const hasFiles = files.length > 0;

  const addSampleFiles = () => setFiles(UPLOAD_SHORTCUT_FILES);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: 70 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: "#0f2d59", margin: 0 }}>
        Upload project documents
      </h1>
      <p style={{ fontSize: 13.5, color: "#64748B", margin: "6px 0 20px", lineHeight: 1.55 }}>
        AI will read your documents and pre-fill the project details in the next step. You
        can adjust anything before publishing.
      </p>

      {/* Dropzone */}
      <div
        onClick={addSampleFiles}
        style={{
          border: "2px dashed #DDD6FE",
          background: "#FAFAFF",
          borderRadius: 12,
          minHeight: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          cursor: "pointer",
          padding: 24,
          textAlign: "center",
          transition: "all 0.15s ease",
        }}
      >
        <UploadTrayIcon size={42} color="#7C3AED" />
        <div style={{ fontSize: 15, fontWeight: 600, color: "#334155" }}>
          Drop your documents here, or click to browse
        </div>
        <div style={{ fontSize: 13, color: "#94A3B8" }}>
          PDF, DOCX, or TXT files. Up to 10 files, 20MB each.
        </div>
      </div>

      {/* Sample document sets */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            color: "#94A3B8",
            marginBottom: 8,
          }}
        >
          Or try a sample document set
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CREATE_SAMPLES.map((s) => (
            <button
              key={s.key}
              onClick={() => onRead(s.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 32,
                padding: "0 14px",
                borderRadius: 9999,
                background: "#fff",
                border: "1px solid #DDD6FE",
                color: "#7C3AED",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
            >
              <SparkleIcon size={11} color="#7C3AED" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Files list */}
      {hasFiles && (
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              color: "#94A3B8",
              marginBottom: 8,
            }}
          >
            Files ready to process
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {files.map((name) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "10px 13px",
                }}
              >
                <FileTextIcon size={17} color="#7C3AED" />
                <span
                  style={{
                    fontSize: 13,
                    color: "#111827",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {name}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    background: "#EDE9FE",
                    color: "#7C3AED",
                    padding: "2px 8px",
                    borderRadius: 5,
                    whiteSpace: "nowrap",
                  }}
                >
                  {detectType(name)}
                </span>
                <button
                  onClick={() => setFiles(files.filter((f) => f !== name))}
                  title="Remove file"
                  style={{
                    border: "none",
                    background: "none",
                    color: "#94A3B8",
                    fontSize: 16,
                    cursor: "pointer",
                    padding: "0 2px",
                    lineHeight: 1,
                    fontFamily: "inherit",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addSampleFiles}
            style={{
              marginTop: 8,
              border: "none",
              background: "none",
              color: "#2563eb",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            + Add more files
          </button>
        </div>
      )}

      {/* Context accordion */}
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <div
          onClick={() => setCtxOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "13px 16px",
            cursor: "pointer",
          }}
        >
          <InfoCircleIcon size={15} color="#64748B" />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#334155", flex: 1 }}>
            Add context for AI (optional)
          </span>
          <span
            style={{
              display: "inline-flex",
              transform: ctxOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.15s ease",
              color: "#94A3B8",
            }}
          >
            <ChevronDownIcon size={16} />
          </span>
        </div>
        {ctxOpen && (
          <div style={{ padding: "0 16px 14px" }}>
            <textarea
              value={ctxText}
              onChange={(e) => setCtxText(e.target.value)}
              placeholder={"e.g., 'This is a recurring annual paving project' or 'Focus on the community engagement timeline'"}
              style={{ ...textareaStyle, minHeight: 64 }}
            />
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div style={stickyFooterStyle}>
        <button onClick={onBack} style={btnSecondary}>
          Cancel
        </button>
        {hasFiles ? (
          <button onClick={() => onRead(null)} style={btnPurple}>
            <SparkleIcon size={14} color="#fff" />
            Read Documents with AI
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
