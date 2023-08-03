import Navbar from "@/components/Navbar"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import "@/styles/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "coreddit",
  description: "꼬레딧!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ko"
      className={cn("bg-white text-slate-900 antialiased", inter.className)}
    >
      <body className="min-h-screen pt-12 bg-slate-50 antialiased">
        <Navbar />
        <div className="container max-w-7xl mx-auto h-full pt-12"></div>
        <div className="container max-w-7xl mx-auto h-full pt-12">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  )
}
