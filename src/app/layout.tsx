import type { Metadata } from "next";
import Script from "next/script";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { PageTransitionProvider } from "./motion/PageTransitionProvider";
import { BackgroundMusic } from "./BackgroundMusic";
import "./globals.css";

export const metadata: Metadata = {
  title: "Happy Birthday Alyse!",
  description:
    "Wishing you a day that's as sweet, bright, and amazing as you are!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          as="image"
          href="/assets/party-cat-logo.webp"
          type="image/webp"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/party-cat-hover.webp"
          type="image/webp"
        />
      </head>
      <body>
        <ConvexClientProvider>
          <PageTransitionProvider>
            {children}
            <BackgroundMusic />
          </PageTransitionProvider>
        </ConvexClientProvider>
        <Script src="/brand-bounce.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
