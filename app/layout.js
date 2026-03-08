import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://direct-wiki.vercel.app"),
  title: "직영점 대응 위키",
  description: "하카코리아 직영점 대응 위키 - POS 장애대응 가이드",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "직영점 대응 위키",
    description: "하카코리아 직영점 대응 위키 - POS 장애대응 가이드",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={geistSans.variable}>{children}</body>
    </html>
  );
}
