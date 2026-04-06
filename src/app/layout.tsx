import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_WEDDING_TITLE || "Wedding RSVP",
  description: "RSVP for the wedding of Sarah and Joseph.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-ivory text-deep-green min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
