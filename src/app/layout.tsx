import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tessa",
  description: "Memories through the years, captured and curated.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cedarville+Cursive&family=Google+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
