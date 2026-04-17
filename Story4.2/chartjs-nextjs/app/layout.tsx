import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Story 4 Salary Deck",
  description: "Standalone Story 4 built in Next.js and Chart.js"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
