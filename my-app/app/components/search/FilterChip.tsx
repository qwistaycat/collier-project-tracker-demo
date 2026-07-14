"use client";

// ================================================================
//  FilterChip — single removable pill for one committed filter value.
//  Clicking × commits the removal immediately (see AppliedFiltersBar) —
//  no Apply needed, per the wireframe's state 3c behavior.
// ================================================================

import type { ReactNode } from "react";
import { CloseIcon } from "../icons";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  /** Optional leading icon — used to visually set the keyword chip apart from facet chips. */
  icon?: ReactNode;
}

export default function FilterChip({ label, onRemove, icon }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full border border-blue-200 bg-blue-50 text-sm text-blue-700">
      {icon}
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="text-blue-400 hover:text-blue-600"
      >
        <CloseIcon size={10} />
      </button>
    </span>
  );
}
