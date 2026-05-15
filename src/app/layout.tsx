import type { Metadata } from "next";
import { IBM_Plex_Sans  } from "next/font/google";
import "@/styles/globals.css";
import QueryProvider from "@/providers/QueryProvider";
import StoreProvider from "@/providers/StoreProvider";
import ToasterProvider from "@/providers/ToastProvider";
import { Suspense } from "react";
import TopLoaderProvider from "@/providers/TopLoaderProvider";
import CookieSessionGuard from "@/components/common/cookieSessionGuard";

const gtmScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KHBBX4H2');`;

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-sans",
});

export const metadata: Metadata = {
  title: "KMA Property - Seller Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="facebook-domain-verification"
          content="uyl7h2cdribbwphnomumbad3plrxd1"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: gtmScript,
          }}
        />
      </head>
      <body
        className={`${ibmPlexSans.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: gtmScript,
          }}
        />
        <Suspense>
        <StoreProvider>
          <QueryProvider>
          <CookieSessionGuard />
          {children}
          <ToasterProvider />
          <TopLoaderProvider/>
          </QueryProvider>
        </StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}
