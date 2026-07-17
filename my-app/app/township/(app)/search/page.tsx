import type { Metadata } from "next";
import TownshipSearchResults from "../../components/search/TownshipSearchResults";

export const metadata: Metadata = {
  title: "Search Projects — Collier Connect Township",
  description: "Search and filter Collier Township projects as staff.",
};

export default function TownshipSearchPage() {
  return <TownshipSearchResults />;
}
