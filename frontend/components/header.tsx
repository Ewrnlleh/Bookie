"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { WalletConnect } from "@/components/wallet-connect"
import { Menu, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const navigationLinks = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/sell", label: "Sell Data" },
    { href: "/vault", label: "My Vault" },
    { href: "/passkey-auth", label: "Passkey Auth" },
    { href: "/wallet-test", label: "Wallet Test" },
    { href: "/wallet-connection-test", label: "Connection Test" },
  ]

  const NavLinks = ({ mobile = false, onLinkClick }: { mobile?: boolean; onLinkClick?: () => void }) => (
    <>
      {navigationLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${
            mobile
              ? "block px-4 py-3 text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-b border-gray-100"
              : "text-gray-600 hover:text-gray-900 font-medium px-3 py-2"
          }`}
          onClick={onLinkClick}
        >
          {link.label}
        </Link>
      ))}
    </>
  )

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4 flex-shrink-0 mr-4 sm:mr-8">
            <Image 
              src="/bookie-logo.png" 
              alt="Bookie Logo" 
              width={48} 
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
            />
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Bookie</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>

          {/* Right side - Wallet + Mobile Menu */}
          <div className="flex items-center gap-4 sm:gap-6 ml-8">
            {/* Wallet Connect - Always visible but responsive */}
            <div className="hidden sm:block">
              <WalletConnect />
            </div>
            
            {/* Mobile Wallet Connect (simplified) */}
            <div className="block sm:hidden">
              <WalletConnect />
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-10 w-10"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Image 
                        src="/bookie-logo.png" 
                        alt="Bookie Logo" 
                        width={40} 
                        height={40}
                        className="w-10 h-10 flex-shrink-0"
                      />
                      <span className="text-lg font-bold text-gray-900">Bookie</span>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-6">
                    <div className="space-y-1">
                      <NavLinks mobile onLinkClick={() => setIsOpen(false)} />
                    </div>
                  </nav>

                  {/* Mobile Wallet Section */}
                  <div className="border-t border-gray-100 pt-6">
                    <div className="px-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Wallet Connection</p>
                      <WalletConnect />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
