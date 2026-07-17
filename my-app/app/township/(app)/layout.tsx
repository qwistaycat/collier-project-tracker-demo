import { Suspense } from "react";
import TownshipNavbar from "../components/TownshipNavbar";

export default function TownshipAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Suspense: the navbar reads useSearchParams for the search field */}
      <Suspense fallback={<div style={{ height: 56, background: "#0d2240" }} />}>
        <TownshipNavbar />
      </Suspense>
      {children}
    </div>
  );
}
