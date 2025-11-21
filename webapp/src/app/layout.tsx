import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/shared/layout/_layout";
import ReduxProvider from "@/shared/store/provider/redux-provider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Delta Sign — Secure Digital Document Signing",
  description:
    "Delta Sign lets you create, manage, and securely sign digital documents powered by the Cardano blockchain. Fast, verifiable, and tamper-proof e-signatures.",
  icons: {
    icon: "/logo.ico",
  },
  keywords: [
    "digital signatures",
    "e-signature",
    "Cardano",
    "blockchain signing",
    "document signer",
    "secure document signing",
    "Delta Sign",
  ],
  authors: [{ name: "Sireto Technology" }],
  applicationName: "Delta Sign",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="enn no-scrollbar">
      <head>
        <link
          rel="preload"
          href="/fonts/Madeva Suarte Signature Font.ttf"
          as="font"
          type="font/tff"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`no-scrollbar antialiased`}>
        <ReduxProvider>
          <Suspense>
            <Layout>{children}</Layout>
          </Suspense>
        </ReduxProvider>
      </body>
    </html>
  );
}
