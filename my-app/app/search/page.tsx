import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SearchResultsContent from "@/app/components/SearchResultsContent";

export const metadata: Metadata = {
  title: "Search Results — Collier Township Project Tracker",
  description: "Search and filter Collier Township project proposals.",
};

export default function SearchPage() {
  return (
    <>
      <div className="flex-shrink-0">
        <Navbar />
      </div>
      <SearchResultsContent />
      <Footer />
    </>
  );
}
