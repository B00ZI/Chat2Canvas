'use client'
import { Oxanium, Merriweather, Fira_Code } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { useProjectStore, TEST_MODE } from "@/store/projectStore";

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-oxanium", display: "swap" });
const merriweather = Merriweather({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-merriweather", display: "swap" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code", display: "swap" });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [dark, setDark] = useState(false);

  useEffect(() => {
    // skipHydration is set on the store; rehydrate manually after mount so
    // SSR markup matches the first client render.
    if (!TEST_MODE) useProjectStore.persist.rehydrate();
  }, []);

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
