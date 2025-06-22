import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/lib/wallet-context"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DataVault Marketplace - Own Your Data, Earn From It",
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
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Toaster />
          </AuthProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
