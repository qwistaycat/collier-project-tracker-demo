import type { Metadata } from "next";
import { TownshipProvider } from "./TownshipContext";
import Toasts from "./components/Toasts";

export const metadata: Metadata = {
  title: "Collier Connect — Township",
  description:
    "Staff-facing management tools for Collier Township projects, feedback, insights, and reports.",
};

export default function TownshipLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <TownshipProvider>
      {children}
      <Toasts />
    </TownshipProvider>
  );
}
