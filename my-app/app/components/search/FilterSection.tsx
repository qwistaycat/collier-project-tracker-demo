"use client";

// ================================================================
//  FilterSection — one checkbox group in FilterSidebar (Category /
//  Department / Region). Always expanded — no collapse/toggle
//  affordance, per design direction: the sidebar is meant to show
//  every option at all times rather than requiring a click to reveal
//  Department/Region. Section dividers and spacing between sections
//  are the parent's job (FilterSidebar), not this component's.
// ================================================================

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

export default function FilterSection({
  title,
  options,
  selected,
  onToggle,
}: FilterSectionProps) {
  return (
    <div>
      <div className="text-[12.5px] font-bold text-gray-900/50 uppercase tracking-wide mb-3">
        {title}
      </div>

      <div className="flex flex-col">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2.5 text-sm text-gray-800 cursor-pointer py-1"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
