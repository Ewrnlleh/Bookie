"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

// Simple wallet context for Freighter only
interface WalletContextType {
  isConnected: boolean
  publicKey: string | null
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (txXdr: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const { toast } = useToast()

  // Check if already connected on mount
  useEffect(() => {
    const savedPublicKey = localStorage.getItem('wallet_public_key')
    if (savedPublicKey && window.freighterApi) {
      window.freighterApi.isConnected().then((connected: boolean) => {
        if (connected) {
          setPublicKey(savedPublicKey)
          setIsConnected(true)
        } else {
          localStorage.removeItem('wallet_public_key')
        }
      }).catch(() => {
        localStorage.removeItem('wallet_public_key')
      })
    }
  }, [])

  const connect = async () => {
    try {
      // Check if Freighter is installed
      if (!window.freighterApi) {
        toast({
          title: "Freighter Not Found",
          description: "Please install the Freighter browser extension and refresh the page.",
          variant: "destructive",
        })
        // Open Freighter installation page
        window.open('https://freighter.app/', '_blank')
        return
      }

      // Get public key from Freighter
      const address = await window.freighterApi.getAddress()
      const publicKeyResult = typeof address === 'string' ? address : address.address

      if (!publicKeyResult) {
        throw new Error("Failed to get address from Freighter")
      }

      // Save connection
      setPublicKey(publicKeyResult)
      setIsConnected(true)
      localStorage.setItem('wallet_public_key', publicKeyResult)

      toast({
        title: "Wallet Connected",
        description: `Connected to ${publicKeyResult.substring(0, 8)}...`,
      })

    } catch (error) {
      console.error("Wallet connection error:", error)
      
      let errorMessage = "Failed to connect wallet"
      if (error instanceof Error) {
        if (error.message.includes("rejected") || error.message.includes("denied")) {
          errorMessage = "Connection was rejected. Please try again and approve the connection."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setPublicKey(null)
    localStorage.removeItem('wallet_public_key')
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  const signTransaction = async (txXdr: string): Promise<string> => {
    if (!window.freighterApi || !isConnected) {
      throw new Error("Wallet not connected")
    }

    try {
      const result = await window.freighterApi.signTransaction(txXdr, {
        networkPassphrase: "Test SDF Network ; September 2015"
      })

      // Handle different response formats
      if (typeof result === 'string') {
        return result
      } else if (result && typeof result === 'object') {
        return result.signedTxXdr || result.signedTransaction || result.xdr || result.transactionXdr || ''
      }

      throw new Error("Invalid transaction signature format")
    } catch (error) {
      console.error("Transaction signing error:", error)
      throw error
    }
  }

  return (
    <WalletContext.Provider value={{
      isConnected,
      publicKey,
      connect,
      disconnect,
      signTransaction
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
