"use client";

// ================================================================
//  Trash — deleted projects with restore / permanent-delete.
// ================================================================

import React, { useState } from "react";
import { useStaff } from "../lib/StaffContext";
import { CAT, CAT_FULL, lcMeta } from "../lib/utils";
import { Card, ConfirmModal, EmptyState } from "../components/ui";

export default function TrashScreen() {
  const { projects, nav, restoreFromTrash, purgeTrash } = useStaff();
  const [purgeFor, setPurgeFor] = useState<string | null>(null);

  const items = projects.filter((p) => p.lc === "trash");
  const purgeTarget = items.find((p) => p.id === purgeFor);

  return (
    <main className="mx-auto w-full max-w-[900px] px-8 py-8">
      <button
        onClick={() => nav("projects")}
        className="mb-4 cursor-pointer border-none bg-transparent text-xs font-semibold text-[#64748B] hover:text-[#1E3A5F]"
      >
        ← Back to Projects
      </button>
      <h1 className="text-2xl font-bold text-[#111827]">Trash</h1>
      <p className="mb-6 mt-1 text-xs text-[#64748B]">
        Deleted projects stay here for 30 days before permanent deletion. You get an email
        warning 7 days before purge.
      </p>

      {items.length === 0 ? (
        <EmptyState title="Trash is empty." />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((p) => (
            <Card key={p.id} className="flex items-center gap-4 p-4">
              <span
                style={{ backgroundColor: CAT[p.cat].color }}
                className="h-9 w-9 shrink-0 rounded-lg opacity-80"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[#111827]">{p.title}</div>
                <div className="text-[11px] text-[#94A3B8]">
                  {CAT_FULL[p.cat]} · was {lcMeta(p.prevLc ?? "draft").label} · deleted{" "}
                  {p.trashedDate}
                </div>
              </div>
              <button
                onClick={() => restoreFromTrash(p.id)}
                className="h-8 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-3 text-xs font-semibold text-white hover:bg-[#152a45]"
              >
                Restore
              </button>
              <button
                onClick={() => setPurgeFor(p.id)}
                className="h-8 cursor-pointer rounded-lg border border-[#FECACA] bg-white px-3 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
              >
                Delete permanently
              </button>
            </Card>
          ))}
        </div>
      )}

      {purgeTarget && (
        <ConfirmModal
          title={`Permanently delete "${purgeTarget.title}"?`}
          body="This cannot be undone. The project and all of its stages, comments, and poll results will be removed."
          confirmLabel="Delete permanently"
          danger
          onCancel={() => setPurgeFor(null)}
          onConfirm={() => {
            purgeTrash(purgeTarget.id);
            setPurgeFor(null);
          }}
        />
      )}
    </main>
  );
}
