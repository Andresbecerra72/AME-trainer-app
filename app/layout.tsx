import { InstallPrompt } from "@/components/install-prompt"
import { NetworkStatusBanner } from "@/components/network-status-banner"
import { PushNotificationPrompt } from "@/components/push-notification-prompt"
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from "@/features/auth/components/UserProvider"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import type React from "react"
import "./globals.css"
import { RegisterServiceWorker } from "./register-sw"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AME Exam Trainer - Aircraft Maintenance Engineer Study App",
  description: "Master your AME exams with comprehensive study materials, practice questions, and exam simulation",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AME Trainer",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: [
      { url: "/icon-32x32.png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" },
      { url: "/icon-192x192.png", sizes: "192x192" },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#003A63" },
    { media: "(prefers-color-scheme: dark)", color: "#FFCC00" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`font-sans antialiased`}
        suppressHydrationWarning={true} 
      >
        <RegisterServiceWorker />
        <NetworkStatusBanner />
        <UserProvider>
          {children}
          <InstallPrompt />
          <PushNotificationPrompt />
        </UserProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
