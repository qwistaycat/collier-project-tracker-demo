import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SearchFilterProvider } from "./context/SearchFilterContext";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Collier Township Project Tracker",
  description: "Track and follow township project proposals and community projects in Collier Township.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen flex flex-col ${poppins.className}`}>
        <SearchFilterProvider>
          <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
        </SearchFilterProvider>
      </body>
    </html>
  );
}
