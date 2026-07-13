import type { Metadata } from "next";
import { instrumentSerif } from "@/lib/fonts";
import { landingPaletteCssVars } from "@/lib/palette";
import "./globals.css";

export const metadata: Metadata = {
  title: "Counterparty Brand Guidelines",
  description: "Counterparty brand guidelines by Infinite Fun studio",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
  },
  openGraph: {
    title: "Counterparty Brand Guidelines",
    description: "Counterparty brand guidelines by Infinite Fun studio",
    images: [
      {
        url: "/og.png",
        width: 1024,
        height: 537,
        alt: "Counterparty",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Counterparty Brand Guidelines",
    description: "Counterparty brand guidelines by Infinite Fun studio",
    images: ["/og.png"],
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
      className={`${instrumentSerif.variable} h-full`}
      style={landingPaletteCssVars()}
    >
      <body className={`${instrumentSerif.className} h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
