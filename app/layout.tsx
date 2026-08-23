'use client'
import { Oxanium, Instrument_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CommandPalette from "@/components/CommandPalette";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useProjectStore, TEST_MODE } from "@/store/projectStore";

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-oxanium", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code", display: "swap" });

// Applies the persisted (or system) theme before first paint — no flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem("c2c-theme");if(t!=="light"&&t!=="dark")t="dark";var dark=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark)}catch(e){document.documentElement.classList.add("dark")}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if (!TEST_MODE) {
      const store = useProjectStore as unknown as { persist?: { rehydrate: () => void } };
      store.persist?.rehydrate();
    }
  }, []);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${oxanium.variable} ${instrument.variable} ${firaCode.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar />

          <main
            className="flex-1 bg-background
                     flex flex-col
                     overflow-hidden"
          >
            {children}
          </main>
        </div>

        <CommandPalette />
        <Toaster />
      </body>
    </html>
  )
}
