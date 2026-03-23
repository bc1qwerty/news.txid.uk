import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased">
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-bitcoin focus:text-white focus:rounded-lg focus:text-sm">
            Skip to content
          </a>
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>

        {/* Auth SDK */}
        <Script
          src="https://api.txid.uk/txid-auth.js"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://api.txid.uk/txid-auth.css"
          crossOrigin="anonymous"
        />

        {/* Analytics */}
        <Script
          src="https://umami.txid.uk/script.js"
          data-website-id="ea6d6f3e-715c-4e54-9539-21e574252ce2"
          strategy="lazyOnload"
        />
        <Script
          src="https://gc.zgo.at/count.js"
          data-goatcounter="https://txid.goatcounter.com/count"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
