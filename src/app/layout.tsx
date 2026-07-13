import type { Metadata } from "next";
import { instrumentSerif } from "@/lib/fonts";
import { landingPaletteCssVars } from "@/lib/palette";
import "./globals.css";

export const metadata: Metadata = {
  title: "Counterparty Brand Guidelines",
  description: "Counterparty brand guidelines by Infinite Fun studio",
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
