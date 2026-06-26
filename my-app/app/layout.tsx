import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Collier Township Project Tracker",
  description: "Track and follow township policy proposals and community projects in Collier Township.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
