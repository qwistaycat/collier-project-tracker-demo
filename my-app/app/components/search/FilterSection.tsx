"use client";

// ================================================================
//  FilterSection — one collapsible checkbox group in FilterSidebar.
//  Generic over any string-valued facet (Category / Department /
//  Region all use this same component). Purely a controlled
//  presentational piece: it holds its own expand/collapse state but
//  the checked values themselves live in the parent's draft state.
// ================================================================

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "../icons";

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  /** Category opens by default per the wireframe; Department/Region start collapsed. */
  defaultExpanded?: boolean;
}

export default function FilterSection({
  title,
  options,
  selected,
  onToggle,
  defaultExpanded = false,
}: FilterSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-100 py-3">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-800"
        aria-expanded={expanded}
      >
        <span>{title}</span>
        {expanded ? (
          <ChevronDownIcon size={14} className="text-gray-400" />
        ) : (
          <ChevronRightIcon size={14} className="text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2.5">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
