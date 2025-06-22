"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

// Type definitions for Freighter API
interface FreighterApi {
  isConnected: () => Promise<{ isConnected: boolean; error?: string }>
  isAllowed: () => Promise<{ isAllowed: boolean; error?: string }>
  requestAccess: () => Promise<{ address: string; error?: string }>
  getAddress: () => Promise<{ address: string; error?: string }>
  getNetwork: () => Promise<{ network: string; networkPassphrase: string; error?: string }>
  signTransaction: (xdr: string, opts?: { networkPassphrase?: string; address?: string }) => Promise<{ signedTxXdr: string; signerAddress: string; error?: string }>
  WatchWalletChanges: any
}

// Simple wallet context for Freighter only
interface WalletContextType {
  isConnected: boolean
  publicKey: string | null
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (txXdr: string) => Promise<string>
  network?: string
  networkPassphrase?: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [network, setNetwork] = useState<string>()
  const [networkPassphrase, setNetworkPassphrase] = useState<string>()
  const [freighterApi, setFreighterApi] = useState<FreighterApi | null>(null)
  const { toast } = useToast()

  // Load Freighter API dynamically on client side
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadFreighterApi = async () => {
      try {
        const api = await import('@stellar/freighter-api')
        setFreighterApi(api as any)
        checkConnection()
      } catch (error) {
        console.error('Failed to load Freighter API:', error)
      }
    }

    loadFreighterApi()
  }, [])

  // Check if already connected on mount
  useEffect(() => {
    if (!freighterApi) return
    
    checkConnection()
    
    // Set up wallet watcher
    const watcher = new freighterApi.WatchWalletChanges(3000)
    watcher.watch(({ address, network: net, networkPassphrase: netPassphrase }: any) => {
      if (address && address !== publicKey) {
        setPublicKey(address)
        setIsWalletConnected(true)
        if (typeof window !== 'undefined') {
          localStorage.setItem('wallet_public_key', address)
        }
      }
      if (net) setNetwork(net)
      if (netPassphrase) setNetworkPassphrase(netPassphrase)
    })

    return () => {
      watcher.stop()
    }
  }, [freighterApi, publicKey])

  const checkConnection = async () => {
    if (!freighterApi) return
    
    try {
      const connected = await freighterApi.isConnected()
      if (!connected.isConnected) {
        // Clear saved data if Freighter is not connected
        if (typeof window !== 'undefined') {
          localStorage.removeItem('wallet_public_key')
        }
        setIsWalletConnected(false)
        setPublicKey(null)
        return
      }

      const allowed = await freighterApi.isAllowed()
      if (allowed.isAllowed) {
        const addressResult = await freighterApi.getAddress()
        if (addressResult.address) {
          setPublicKey(addressResult.address)
          setIsWalletConnected(true)
          if (typeof window !== 'undefined') {
            localStorage.setItem('wallet_public_key', addressResult.address)
          }
          
          // Get network info
          const networkResult = await freighterApi.getNetwork()
          if (networkResult.network) {
            setNetwork(networkResult.network)
            setNetworkPassphrase(networkResult.networkPassphrase)
          }
        }
      } else {
        // User hasn't granted permission yet
        if (typeof window !== 'undefined') {
          const savedPublicKey = localStorage.getItem('wallet_public_key')
          if (savedPublicKey) {
            localStorage.removeItem('wallet_public_key')
          }
        }
        setIsWalletConnected(false)
        setPublicKey(null)
      }
    } catch (error) {
      console.error("Error checking connection:", error)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wallet_public_key')
      }
      setIsWalletConnected(false)
      setPublicKey(null)
    }
  }

  const connect = async () => {
    if (!freighterApi) {
      toast({
        title: "Freighter Not Loaded",
        description: "Please wait for Freighter API to load and try again.",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if Freighter is installed
      const connected = await freighterApi.isConnected()
      if (!connected.isConnected) {
        toast({
          title: "Freighter Not Found",
          description: "Please install the Freighter browser extension and refresh the page.",
          variant: "destructive",
        })
        // Open Freighter installation page
        if (typeof window !== 'undefined') {
          window.open('https://freighter.app/', '_blank')
        }
        return
      }

      // Request access to user's public key
      const accessResult = await freighterApi.requestAccess()
      
      if (accessResult.error) {
        throw new Error(accessResult.error)
      }

      if (!accessResult.address) {
        throw new Error("Failed to get address from Freighter")
      }

      // Save connection
      setPublicKey(accessResult.address)
      setIsWalletConnected(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet_public_key', accessResult.address)
      }

      // Get network info
      const networkResult = await freighterApi.getNetwork()
      if (networkResult.network) {
        setNetwork(networkResult.network)
        setNetworkPassphrase(networkResult.networkPassphrase)
      }

      toast({
        title: "Wallet Connected",
        description: `Connected to ${accessResult.address.substring(0, 8)}...`,
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
    setIsWalletConnected(false)
    setPublicKey(null)
    setNetwork(undefined)
    setNetworkPassphrase(undefined)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wallet_public_key')
    }
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  const walletSignTransaction = async (txXdr: string): Promise<string> => {
    if (!freighterApi || !isWalletConnected || !publicKey) {
      throw new Error("Wallet not connected")
    }

    try {
      const result = await freighterApi.signTransaction(txXdr, {
        networkPassphrase: networkPassphrase || "Test SDF Network ; September 2015",
        address: publicKey
      })

      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.signedTxXdr) {
        throw new Error("Failed to get signed transaction")
      }

      return result.signedTxXdr
    } catch (error) {
      console.error("Transaction signing error:", error)
      throw error
    }
  }

  return (
    <WalletContext.Provider value={{
      isConnected: isWalletConnected,
      publicKey,
      connect,
      disconnect,
      signTransaction: walletSignTransaction,
      network,
      networkPassphrase
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
