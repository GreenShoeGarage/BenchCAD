import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BENCHCAD",
  description: "A local-first, shape-based CAD workbench with an editable construction timeline.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
