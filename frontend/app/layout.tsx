import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/lib/simple-wallet-context"
import { Toaster } from "@/components/ui/toaster"
import LayoutWrapper from "@/components/layout-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bookie Marketplace - Own Your Data, Earn From It",
  description:
    "Decentralized marketplace for personal data. Upload, encrypt, and monetize your data while maintaining complete privacy and ownership.",
  keywords: "data marketplace, privacy, blockchain, stellar, personal data, monetization",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  )
}
