'use client'
import type { Metadata } from "next";
import { Oxanium, Merriweather, Fira_Code } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-oxanium" });
const merriweather = Merriweather({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-merriweather" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code" });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [dark, setDark] = useState(true);

  return (
    <html
      lang="en"
      className={` ${dark? "dark" : ""} ${oxanium.variable} ${merriweather.variable} ${firaCode.variable}`}
    >
      <body className="bg-background text-foreground font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar dark={dark} setDark={setDark} />

          <main
            className="flex-1 bg-background
                     flex flex-col
                     overflow-hidden"
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  )

}
