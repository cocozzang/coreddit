import Navbar from "@/components/Navbar"
import { cn } from "@/lib/utils"
import "@/styles/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "coreddit",
  description: "Welcome!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cn("bg-white text-slate-900 antialiased", inter.className)}
    >
      <body className="min-h-screen pt-12 bg-slate-50 antialiased">
        <Navbar />
        <div className="container max-w-7xl mx-auto h-full pt-12"></div>
        {children}
      </body>
    </html>
  )
}
