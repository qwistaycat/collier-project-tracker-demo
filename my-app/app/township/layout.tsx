import type { Metadata } from "next";
import { TownshipProvider } from "./TownshipContext";
import { TownshipSearchFilterProvider } from "./TownshipSearchFilterContext";
import { TownshipRecentlyViewedProvider } from "./TownshipRecentlyViewedContext";
import Toasts from "./components/Toasts";

export const metadata: Metadata = {
  title: "Collier Blueprint — Township",
  description:
    "Staff-facing management tools for Collier Township projects, feedback, insights, and reports.",
};

export default function TownshipLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <TownshipProvider>
      <TownshipSearchFilterProvider>
        <TownshipRecentlyViewedProvider>
          {children}
          <Toasts />
        </TownshipRecentlyViewedProvider>
      </TownshipSearchFilterProvider>
    </TownshipProvider>
  );
}
