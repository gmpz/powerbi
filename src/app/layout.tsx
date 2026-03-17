import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),

  title: {
    default: "Dashboard | สำนักงานสาธารณสุขจังหวัดปทุมธานี",
    template: "%s | PPHO Dashboard",
  },

  description:
    "ระบบบริหารจัดการข้อมูลและรายงาน Dashboard สำหรับสำนักงานสาธารณสุขจังหวัดปทุมธานี",

  openGraph: {
    title: "Dashboard | สำนักงานสาธารณสุขจังหวัดปทุมธานี",
    description:
      "ระบบบริหารจัดการข้อมูลและรายงาน Dashboard สำหรับสำนักงานสาธารณสุขจังหวัดปทุมธานี",
    siteName: "PPHO Dashboard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "th_TH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
