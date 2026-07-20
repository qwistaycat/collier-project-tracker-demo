"use client";

// ================================================================
//  /township/project/[id] — staff project detail. Thin client page:
//  DetailShell reads useParams/useSearchParams, so it sits inside
//  a Suspense boundary per the App Router requirement.
// ================================================================

import { Suspense } from "react";
import DetailShell from "@/app/township/components/detail/DetailShell";

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={null}>
      <DetailShell />
    </Suspense>
  );
}
