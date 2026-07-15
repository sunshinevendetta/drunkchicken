import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./components/react-bits/react-bits.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
  const image = new URL("/og.png", origin).toString();

  return {
    title: "$DRUNKCHICKEN — The Internet's Least Sober Chicken",
    description:
      "The official home of DRUNKCHICKEN: maximum cluck, minimum coordination, live on Pons Family.",
    openGraph: {
      title: "$DRUNKCHICKEN",
      description: "One chicken. Several beverages. Maximum cluck.",
      type: "website",
      images: [{ url: image, width: 1728, height: 896, alt: "$DRUNKCHICKEN" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "$DRUNKCHICKEN",
      description: "One chicken. Several beverages. Maximum cluck.",
      images: [image],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
