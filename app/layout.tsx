import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import DesktopSidebar from "@/components/navigation/DesktopSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import TopNav from "@/components/navigation/TopNav";
import { SidebarProvider } from "@/lib/contexts/SidebarContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Goat Fun - Meme Market Platform",
  description: "Create and trade meme markets on Goat Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  bg-black text-white`}
      >
        <SidebarProvider>
          <div className="min-h-screen bg-black">
            <DesktopSidebar className="hidden md:block" />
            
            <TopNav className="" />
            
            <ResponsiveLayout>
              <main className="pt-16 md:pt-16 pb-20 md:pb-0 bg-black">
                {children}
              </main>
            </ResponsiveLayout>
            
            <MobileBottomNav className="block md:hidden" />
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
