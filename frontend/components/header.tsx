"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/bookie-logo.png" 
              alt="Bookie Logo" 
              width={48} 
              height={48}
              className="w-20 h-16"
            />
            <Image 
              src="/bookie-title.png" 
              alt="Bookie" 
              width={120} 
              height={32}
              className="h-8"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 font-medium">
              Marketplace
            </Link>
            <Link href="/sell" className="text-gray-600 hover:text-gray-900 font-medium">
              Sell Data
            </Link>
            <Link href="/vault" className="text-gray-600 hover:text-gray-900 font-medium">
              My Vault
            </Link>
            <Link href="/wallet-test" className="text-gray-600 hover:text-gray-900 font-medium">
              Wallet Test
            </Link>
            <Link href="/freighter-debug" className="text-gray-600 hover:text-gray-900 font-medium text-xs">
              Debug
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  )
}
