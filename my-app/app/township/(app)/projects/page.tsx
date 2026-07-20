import { Suspense } from "react";
import GalleryContent from "@/app/township/components/gallery/GalleryContent";

// Suspense: GalleryContent reads the ?q= keyword filter via
// useSearchParams (foundation convention for township pages).
export default function TownshipProjectsPage() {
  return (
    <Suspense fallback={null}>
      <GalleryContent />
    </Suspense>
  );
}
