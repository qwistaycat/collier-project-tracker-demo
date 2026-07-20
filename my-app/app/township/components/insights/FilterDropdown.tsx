"use client";

// ================================================================
//  Insights — filter dropdown button. The button label is always
//  the currently selected option's label. The page owns which
//  dropdown is open (mutually exclusive); this component handles
//  outside-click / Escape close as an improvement over the export.
// ================================================================

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/app/components/icons";

export default function FilterDropdown<T extends string>({
  options,
  value,
  open,
  width = 190,
  onToggle,
  onClose,
  onPick,
}: {
  options: { value: T; label: string }[];
  value: T;
  open: boolean;
  width?: number;
  onToggle: () => void;
  onClose: () => void;
  onPick: (v: T) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          height: 36,
          padding: "0 14px",
          background: "#fff",
          border: `1px solid ${hover || open ? "#cbd5e1" : "#e2e8f0"}`,
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "inherit",
          color: "#334155",
          cursor: "pointer",
          transition: "border-color 0.15s ease",
        }}
      >
        {selected?.label}
        <span style={{ color: "#94a3b8", display: "flex" }}>
          <ChevronDownIcon size={12} />
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 42,
            left: 0,
            zIndex: 40,
            width,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            boxShadow: "0 16px 40px rgba(2,12,27,.16)",
            padding: 6,
            animation: "townshipToastIn 0.2s ease both",
          }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              className="township-menu-item"
              onClick={() => onPick(o.value)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "9px 11px",
                fontWeight: 600,
                fontFamily: "inherit",
                color: "#0f172a",
              }}
            >
              {o.label}
              {o.value === value && (
                <span style={{ color: "#0d2240", display: "flex" }}>
                  <CheckIcon size={13} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
