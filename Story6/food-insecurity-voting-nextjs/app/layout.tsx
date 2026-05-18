import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Affordability × Child Safety",
  description: "Next.js slide deck showing how food insecurity, child hunger, and poverty can become an affordability message in Republican-leaning states."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
