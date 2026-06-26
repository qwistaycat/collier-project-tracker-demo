import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProposalDetailContent from "@/app/components/ProposalDetailContent";

export const metadata: Metadata = {
  title: "Hilltop Park Expansion — Collier Township",
  description:
    "View details, timeline, discussion, and vote on the Hilltop Park Expansion proposal.",
};

export default function ProposalPage() {
  return (
    <>
      <div className="flex-shrink-0">
        <Navbar />
      </div>
      <ProposalDetailContent />
      <Footer />
    </>
  );
}
