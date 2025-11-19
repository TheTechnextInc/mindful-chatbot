import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import DarkModeProvider from "@/components/DarkModeProvider"

export const metadata: Metadata = {
  title: "MindfulChat - AI Mental Health Support",
  description: "Compassionate AI-powered mental health chatbot with multiple therapeutic approaches",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <DarkModeProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </DarkModeProvider>
      </body>
    </html>
  )
}
