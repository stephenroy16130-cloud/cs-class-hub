import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InitialSplash from "@/components/InitialSplash";
import ChatWidget from "@/components/ChatWidget";
import AccountMenu from "@/components/AccountMenu";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Computer Science 1.1 - Class Hub",
  description: "Timetables, announcements, resources and class coordination.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <InitialSplash />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ChatWidget />
        <AccountMenu />
      </body>
    </html>
  );
}
