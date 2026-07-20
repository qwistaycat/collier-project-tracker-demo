"use client";

// ================================================================
//  Step 2 — AI extraction split-view. The left pane "reads" the
//  synthesized document paragraph by paragraph while the right
//  pane's form flips from skeleton to filled in sync. PROC_MSGS
//  captions the phase under the progress bar; confetti fires only
//  on natural completion (never on skip).
// ================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { PROC_MSGS } from "../../data";
import {
  AiChip,
  ConfidenceDot,
  FIELD_LABELS,
  FIELD_ORDER,
  FileTextIcon,
  SparkleIcon,
  type ExtractMeta,
} from "./shared";

interface Ev {
  type: "field" | "stage";
  paraId: number;
  dur: number;
}

interface RunState {
  curIdx: number;
  fieldsShown: number;
  stagesShown: number;
  pct: number;
  glow: number | null;
  done: boolean;
  skipped: boolean;
}

interface ConfettiBit {
  left: number;
  w: number;
  color: string;
  durS: number;
  delayS: number;
}

export default function ExtractStep({
  extract,
  onContinue,
}: {
  extract: ExtractMeta;
  onContinue: () => void;
}) {
  const events = useMemo<Ev[]>(
    () => [
      ...FIELD_ORDER.map((k) => ({ type: "field" as const, paraId: extract.fields[k].paraId, dur: 1300 })),
      ...extract.stages.map((s) => ({ type: "stage" as const, paraId: s.paraId, dur: 1700 })),
    ],
    [extract]
  );

  const [run, setRun] = useState<RunState>({
    curIdx: -1,
    fieldsShown: 0,
    stagesShown: 0,
    pct: 0,
    glow: extract.paras[0]?.id ?? null,
    done: false,
    skipped: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skippedRef = useRef(false);
  const docBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    skippedRef.current = false;
    const stepFn = (i: number) => {
      if (cancelled || skippedRef.current) return;
      if (i >= events.length) {
        setRun((r) => (r.skipped ? r : { ...r, pct: 100, done: true, glow: null }));
        return;
      }
      const ev = events[i];
      setRun((r) => ({
        ...r,
        curIdx: i,
        glow: ev.paraId,
        fieldsShown: ev.type === "field" ? r.fieldsShown + 1 : r.fieldsShown,
        stagesShown: ev.type === "stage" ? r.stagesShown + 1 : r.stagesShown,
        pct: Math.round(((i + 1) / events.length) * 100),
      }));
      timerRef.current = setTimeout(() => stepFn(i + 1), ev.dur);
    };
    timerRef.current = setTimeout(() => stepFn(0), 750);
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [events]);

  // auto-scroll the glowing paragraph into view
  useEffect(() => {
    if (run.glow == null || !docBodyRef.current) return;
    const el = docBodyRef.current.querySelector(`[data-para="${run.glow}"]`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [run.glow]);

  // Confetti scatter — deterministic pseudo-random from the index so
  // the computation stays pure (render-safe) while still looking
  // scattered.
  const confetti = useMemo<ConfettiBit[] | null>(() => {
    if (!(run.done && !run.skipped)) return null;
    const colors = ["#2563eb", "#16A34A", "#2563EB", "#FFAA55", "#0d2240", "#60a5fa"];
    const rnd = (i: number, salt: number) =>
      (((i + 1) * 9301 + salt * 49297) % 233280) / 233280;
    return Array.from({ length: 38 }, (_, i) => ({
      left: rnd(i, 1) * 100,
      w: 6 + rnd(i, 2) * 7,
      color: colors[i % colors.length],
      durS: 1 + rnd(i, 3) * 0.9,
      delayS: rnd(i, 4) * 0.5,
    }));
  }, [run.done, run.skipped]);

  const curPage =
    run.glow != null ? (extract.paras.find((p) => p.id === run.glow)?.page ?? 1) : extract.pageCount;
  const remain = Math.max(1, Math.round((events.length - (run.curIdx + 1)) * 1.6));
  const msgIdx = Math.min(
    PROC_MSGS.length - 1,
    Math.max(0, Math.floor(((run.curIdx + 1) / events.length) * PROC_MSGS.length))
  );
  const stageSectionVisible = run.stagesShown > 0 || run.done;

  return (
    <div>
      {/* Confetti */}
      {confetti && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 80, overflow: "hidden" }}>
          {confetti.map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                left: `${c.left}%`,
                width: c.w,
                height: c.w / 2,
                background: c.color,
                borderRadius: 2,
                animation: `twCreateFall ${c.durS}s ease-in ${c.delayS}s forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "#DBEAFE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SparkleIcon size={18} color="#2563eb" />
        </span>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f2d59", margin: 0 }}>
          {run.done ? "Extraction complete — review below" : "Extracting project details"}
        </h1>
      </div>

      {/* Progress */}
      <div style={{ height: 8, background: "#DBEAFE", borderRadius: 9999, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${run.pct}%`,
            background: "#0d2240",
            borderRadius: 9999,
            transition: "width 0.55s ease",
          }}
        />
      </div>
      <div style={{ fontSize: 12.5, color: "#64748B", margin: "7px 0 2px" }}>
        {run.done
          ? `AI read all ${events.length} sections across ${extract.docs.length} document${extract.docs.length === 1 ? "" : "s"}.`
          : `AI has read ${Math.max(0, run.curIdx + 1)} of ${events.length} sections · about ${remain}s remaining`}
      </div>
      {!run.done && (
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "#1E40AF", marginBottom: 14 }}>
          {PROC_MSGS[msgIdx]}
        </div>
      )}
      {run.done && <div style={{ marginBottom: 14 }} />}

      {/* Split view */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left — document viewer */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 4px 14px rgba(15,23,42,.05)",
            alignSelf: "start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "#FAFBFC",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <FileTextIcon size={14} color="#2563eb" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", flex: 1 }}>
              {run.done
                ? "Extraction complete"
                : `AI is reading page ${curPage} of ${extract.pageCount}`}
            </span>
            {!run.done && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2563eb",
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: 9999,
                  padding: "3px 10px",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#2563eb",
                    animation: "twCreatePulse 1.1s ease infinite",
                  }}
                />
                Reading
              </span>
            )}
          </div>
          <div ref={docBodyRef} style={{ height: 520, overflowY: "auto", padding: "18px 20px" }}>
            {extract.paras.map((p) => (
              <div
                key={p.id}
                data-para={p.id}
                style={{
                  padding: "6px 8px",
                  borderRadius: 6,
                  marginBottom: p.kind === "h1" ? 10 : 8,
                  ...(run.glow === p.id
                    ? { background: "#EFF3F8", animation: "twCreateGlow 1.2s ease infinite" }
                    : {}),
                  ...(p.kind === "h1"
                    ? { fontSize: 16, fontWeight: 700, color: "#0F172A" }
                    : p.kind === "h2"
                      ? {
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase" as const,
                          letterSpacing: 0.6,
                          color: "#2563eb",
                          marginTop: 6,
                        }
                      : { fontSize: 13, color: "#334155", lineHeight: 1.62 }),
                }}
              >
                {p.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right — progressive form */}
        <div
          style={{
            height: 520,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingRight: 2,
          }}
        >
          {FIELD_ORDER.map((k, i) => {
            const shown = i < run.fieldsShown;
            const fm = extract.fields[k];
            if (!shown) {
              return (
                <div
                  key={k}
                  style={{
                    border: "1px dashed #E2E8F0",
                    background: "#F8FAFC",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      color: "#CBD5E1",
                      marginBottom: 8,
                    }}
                  >
                    {FIELD_LABELS[k]}
                  </div>
                  <div
                    style={{
                      height: 11,
                      width: "72%",
                      borderRadius: 6,
                      background:
                        "linear-gradient(90deg,#F1F5F9 25%,#DBEAFE 50%,#F1F5F9 75%)",
                      backgroundSize: "320px 100%",
                      animation: "twCreateShimmer 1.4s linear infinite",
                    }}
                  />
                </div>
              );
            }
            return (
              <div
                key={k}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: "12px 14px",
                  animation: "twCreateFadeIn 0.3s ease both",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      color: "#94A3B8",
                    }}
                  >
                    {FIELD_LABELS[k]}
                  </span>
                  <ConfidenceDot conf={fm.conf} />
                  <span style={{ flex: 1 }} />
                  <AiChip />
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    color: "#0F172A",
                    fontWeight: k === "title" ? 700 : 400,
                    lineHeight: 1.5,
                  }}
                >
                  {fm.value}
                </div>
              </div>
            );
          })}

          {/* Timeline being built */}
          {stageSectionVisible && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
                <SparkleIcon size={12} color="#1E40AF" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1E40AF" }}>
                  {run.done
                    ? `AI identified ${extract.stages.length} stages. Review each below.`
                    : `AI is identifying stages in your document… (${run.stagesShown} of ${extract.stages.length})`}
                </span>
              </div>
              {extract.stages.slice(0, run.stagesShown).map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "11px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    animation: "twCreateFadeIn 0.3s ease both",
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
                    {i + 1}
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#111827",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.title}
                      </span>
                      <ConfidenceDot conf={s.conf} />
                    </span>
                    <span style={{ display: "block", fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                      {s.end ? `${s.start} – ${s.end}` : s.start}
                    </span>
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
          marginTop: 18,
        }}
      >
        {run.done ? (
          <button
            onClick={onContinue}
            style={{
              height: 42,
              padding: "0 22px",
              borderRadius: 9999,
              background: "#0d2240",
              border: "1px solid #0d2240",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
          >
            Continue to review →
          </button>
        ) : (
          <button
            disabled
            style={{
              height: 42,
              padding: "0 22px",
              borderRadius: 9999,
              background: "#E2E8F0",
              border: "1px solid #E2E8F0",
              color: "#94A3B8",
              fontSize: 13,
              fontWeight: 600,
              cursor: "not-allowed",
              fontFamily: "inherit",
            }}
          >
            Continue to review →
          </button>
        )}
      </div>
    </div>
  );
}
