import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ContextProvider } from "@/context/userContext"; 
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import FloatingContact from "@/components/FloatingContact";

import "./globals.css";

export const metadata: Metadata = {
  title: "Newtimes Hotel",
  description: "A modern hotel booking experience",
  generator: "Newtimes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ContextProvider>
          <Header />
          {children}
          <FloatingContact 
          phone="+254713706034"
          whatsapp="+254713706034"
          whatsappMessage="Hi, I'm interested in booking a room at Newtimes Hotel."
        />
          <Toaster />
        </ContextProvider>
        <Analytics />
        
      </body>
    </html>
  );
}
