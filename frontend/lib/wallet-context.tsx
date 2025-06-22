"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./auth-context"
import { signAndSubmitTransaction } from "@/services/soroban"

// Freighter API imports - use dynamic import to avoid SSR issues
let freighterApi: any = null

const loadFreighterApi = async () => {
  if (typeof window === 'undefined') return null
  
  try {
    if (!freighterApi) {
      const freighterModule = await import('@stellar/freighter-api')
      freighterApi = freighterModule.default || freighterModule
      console.log('Freighter API loaded:', Object.keys(freighterApi))
    }
    return freighterApi
  } catch (e) {
    console.warn('Freighter API not available:', e)
    return null
  }
}

export type WalletType = 'freighter' | 'passkey'

interface WalletContextType {
  isConnected: boolean
  publicKey: string | null
  walletType: WalletType | null
  connect: (walletType?: WalletType) => Promise<void>
  disconnect: () => void
  signAndSubmitTransaction: (txXdr: string) => Promise<{ hash: string }>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authenticate, signTransaction, publicKey: passkeyPublicKey } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<WalletType | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check saved wallet type and connection status
    if (typeof window !== 'undefined') {
      const savedWalletType = localStorage.getItem('wallet_type') as WalletType | null
      const savedPublicKey = localStorage.getItem('wallet_public_key')
      
      if (savedWalletType === 'passkey' && isAuthenticated && passkeyPublicKey) {
        setWalletType('passkey')
        setPublicKey(passkeyPublicKey)
        setIsConnected(true)
      } else if (savedWalletType === 'freighter' && savedPublicKey) {
        // Check if Freighter is still connected
        loadFreighterApi().then((freighter) => {
          if (freighter) {
            freighter.isConnected().then((connected: boolean) => {
              if (connected) {
                setWalletType('freighter')
                setPublicKey(savedPublicKey)
                setIsConnected(true)
              } else {
                // Clear invalid saved state
                localStorage.removeItem('wallet_type')
                localStorage.removeItem('wallet_public_key')
              }
            }).catch(() => {
              localStorage.removeItem('wallet_type')
              localStorage.removeItem('wallet_public_key')
            })
          }
        })
      }
    }
  }, [isAuthenticated, passkeyPublicKey])

  const connectFreighter = async () => {
    try {
      // Enhanced check if Freighter is installed
      if (typeof window === 'undefined') {
        throw new Error("Window object not available")
      }

      // Multiple checks for Freighter availability
      const hasFreighterApi = !!window.freighterApi
      const hasFreighterInWindow = 'freighterApi' in window
      const hasFreighterMethods = window.freighterApi && 
        typeof window.freighterApi.isConnected === 'function' &&
        typeof window.freighterApi.getAddress === 'function'

      console.log('Freighter connection attempt:', {
        hasFreighterApi,
        hasFreighterInWindow,
        hasFreighterMethods,
        windowKeys: Object.keys(window).filter(key => key.toLowerCase().includes('freighter')),
        freighterApi: window.freighterApi
      })

      if (!hasFreighterApi || !hasFreighterInWindow || !hasFreighterMethods) {
        throw new Error("Freighter extension is not installed or not properly loaded. Please install it from freighter.app and refresh the page.")
      }

      const freighter = window.freighterApi!
      console.log('Freighter API methods:', freighter ? Object.keys(freighter) : [])

      // First check if we can get the address directly
      console.log('Getting address from Freighter...')
      let addressResult: string | { address: string }
      
      try {
        addressResult = await freighter.getAddress()
        console.log('Freighter address result:', addressResult)
      } catch (addressError) {
        console.error('Error getting address:', addressError)
        // If address call fails, it usually means user hasn't given permission
        throw new Error("Please allow Freighter access in your browser extension and try again.")
      }
      
      let publicKey: string
      
      // Handle different response formats from Freighter
      if (typeof addressResult === 'string') {
        publicKey = addressResult
      } else if (addressResult && typeof addressResult === 'object') {
        // Handle object response format - check for address property
        if ('address' in addressResult && typeof addressResult.address === 'string') {
          publicKey = addressResult.address
        } else {
          throw new Error("Address property not found in Freighter response")
        }
      } else {
        throw new Error("Invalid address format received from Freighter")
      }
      
      // Validate the public key format
      if (!publicKey || typeof publicKey !== 'string') {
        console.error('Invalid public key received:', publicKey)
        throw new Error("Failed to get valid address from Freighter")
      }
      
      // Check if it looks like a valid Stellar address
      if (publicKey.length < 20 || !publicKey.startsWith('G')) {
        console.error('Invalid Stellar address format:', publicKey)
        throw new Error("Invalid Stellar address format received from Freighter")
      }
      
      console.log('Successfully got Freighter address:', publicKey)
      
      // Verify we can check connection status
      try {
        const isConnected = await freighter.isConnected()
        console.log('Freighter isConnected:', isConnected)
      } catch (connectionError) {
        console.warn('Could not verify connection status:', connectionError)
        // Continue anyway if we have the address
      }
      
      setWalletType('freighter')
      setPublicKey(publicKey)
      setIsConnected(true)
      
      // Save to localStorage
      localStorage.setItem('wallet_type', 'freighter')
      localStorage.setItem('wallet_public_key', publicKey)

      toast({
        title: "Freighter Connected",
        description: `Successfully connected to Freighter wallet: ${publicKey.substring(0, 8)}...`,
      })
    } catch (error) {
      console.error("Freighter connection error:", error)
      
      // Provide more specific error messages
      let errorMessage = "Failed to connect to Freighter wallet"
      if (error instanceof Error) {
        if (error.message.includes("not installed")) {
          errorMessage = "Freighter extension is not installed. Please install it from freighter.app"
        } else if (error.message.includes("allow") || error.message.includes("permission")) {
          errorMessage = "Please allow Freighter access in your browser extension and try again."
        } else if (error.message.includes("denied") || error.message.includes("rejected")) {
          errorMessage = "Freighter access was denied. Please try again and allow access."
        } else if (error.message.includes("address") || error.message.includes("Invalid")) {
          errorMessage = "Could not retrieve wallet address from Freighter. Please check your wallet and try again."
        } else {
          errorMessage = error.message
        }
      }
      
      // Show user-friendly toast
      toast({
        title: "Freighter Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      throw new Error(errorMessage)
    }
  }

  const connectPasskey = async () => {
    try {
      await authenticate()
      
      // Wait for authentication to complete and get public key
      if (!passkeyPublicKey) {
        throw new Error("Failed to get public key from passkey authentication")
      }
      
      setWalletType('passkey')
      setPublicKey(passkeyPublicKey)
      setIsConnected(true)
      
      // Save to localStorage
      localStorage.setItem('wallet_type', 'passkey')
      localStorage.setItem('wallet_public_key', passkeyPublicKey)

      toast({
        title: "Passkey Connected",
        description: `Successfully authenticated with passkey: ${passkeyPublicKey.substring(0, 8)}...`,
      })
    } catch (error) {
      console.error("Passkey connection error:", error)
      
      // Provide more specific error messages for passkey failures
      let errorMessage = "Failed to connect with passkey authentication"
      if (error instanceof Error) {
        if (error.message.includes("not supported")) {
          errorMessage = "Passkeys are not supported on this device or browser. Please use a compatible device."
        } else if (error.message.includes("cancelled") || error.message.includes("abort")) {
          errorMessage = "Passkey authentication was cancelled. Please try again."
        } else if (error.message.includes("timeout")) {
          errorMessage = "Passkey authentication timed out. Please try again."
        } else if (error.message.includes("security")) {
          errorMessage = "Security error during passkey authentication. Please ensure your device supports secure authentication."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Passkey Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      throw new Error(errorMessage)
    }
  }

  const connect = async (preferredWalletType?: WalletType) => {
    try {
      if (preferredWalletType === 'freighter') {
        await connectFreighter()
      } else if (preferredWalletType === 'passkey') {
        await connectPasskey()
      } else {
        // Auto-detect: try Freighter first, then fallback to Passkey
        try {
          await connectFreighter()
        } catch (freighterError) {
          console.log("Freighter not available, trying Passkey:", freighterError)
          await connectPasskey()
        }
      }
    } catch (error) {
      console.error("Wallet connection error:", error)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      })
      throw error
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setPublicKey(null)
    setWalletType(null)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wallet_type')
      localStorage.removeItem('wallet_public_key')
    }
    
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected wallet",
    })
  }

  const signAndSubmitTransaction = async (txXdr: string): Promise<{ hash: string }> => {
    if (!isConnected || !walletType) {
      throw new Error("Wallet not connected")
    }

    try {
      if (walletType === 'freighter') {
        const freighter = await loadFreighterApi()
        if (!freighter) {
          throw new Error("Freighter not available")
        }
        
        // Sign with Freighter
        console.log('Attempting to sign transaction with Freighter...')
        console.log('Transaction XDR:', txXdr)
        console.log('Network passphrase:', "Test SDF Network ; September 2015")
        
        // First check network details
        try {
          const networkDetails = await freighter.getNetworkDetails()
          console.log('Freighter network details:', networkDetails)
          
          if (networkDetails.networkPassphrase !== "Test SDF Network ; September 2015") {
            throw new Error(`Network mismatch. Freighter is on "${networkDetails.networkPassphrase}" but transaction is for "Test SDF Network ; September 2015"`)
          }
        } catch (networkError) {
          console.warn('Could not check network details:', networkError)
        }
        
        try {
          const signedTxResult = await freighter.signTransaction(txXdr, {
            networkPassphrase: "Test SDF Network ; September 2015"
          })
          
          console.log('Freighter signTransaction result:', signedTxResult)
          console.log('Result type:', typeof signedTxResult)
          console.log('Result constructor:', signedTxResult?.constructor?.name)
          
          // Check if user rejected the transaction
          if (signedTxResult && typeof signedTxResult === 'object' && (signedTxResult as any).error) {
            const error = (signedTxResult as any).error
            console.log('Freighter error detected:', error)
            
            if (error.code === -4 || error.message?.includes('rejected') || error.message?.includes('cancelled')) {
              throw new Error('Transaction was cancelled by user')
            } else {
              throw new Error(`Freighter error: ${error.message || 'Unknown error'}`)
            }
          }
          
          // Extract the signed transaction XDR string from the result
          // Handle different possible response formats from Freighter
          let signedTx: string | undefined
          if (typeof signedTxResult === 'string') {
            signedTx = signedTxResult
          } else if (signedTxResult && typeof signedTxResult === 'object') {
            // Try different possible property names
            signedTx = (signedTxResult as any).signedTxXdr || 
                      (signedTxResult as any).signedTransaction || 
                      (signedTxResult as any).xdr ||
                      (signedTxResult as any).transactionXdr ||
                      (signedTxResult as any).signed_transaction_xdr ||
                      (signedTxResult as any).signed_tx_xdr
            
            console.log('Available properties in signedTxResult:', Object.keys(signedTxResult))
            console.log('All values:', Object.entries(signedTxResult))
          }
          
          console.log('Extracted signedTx:', signedTx)
          console.log('signedTx type:', typeof signedTx)
          console.log('signedTx length:', signedTx?.length)
          
          if (!signedTx || typeof signedTx !== 'string' || signedTx.trim() === '') {
            console.error('Invalid signed transaction result:', signedTxResult)
            console.error('Attempted to extract from properties:', [
              'signedTxXdr', 'signedTransaction', 'xdr', 'transactionXdr', 
              'signed_transaction_xdr', 'signed_tx_xdr'
            ])
            throw new Error(`Failed to get signed transaction XDR string from Freighter. Received: ${JSON.stringify(signedTxResult, null, 2)}`)
          }
          
          // Submit the signed transaction using our Soroban service
          const { submitSignedTransaction } = await import("@/services/soroban")
          const result = await submitSignedTransaction(signedTx)
          return result
        } catch (freighterError) {
          console.error('Freighter signing error:', freighterError)
          
          // Check for specific Freighter error types
          if (freighterError instanceof Error) {
            const errorMessage = freighterError.message.toLowerCase()
            
            if (errorMessage.includes('rejected') || errorMessage.includes('cancelled')) {
              throw new Error('Transaction was cancelled by user')
            } else if (errorMessage.includes('internal error') || errorMessage.includes('wallet encountered an internal error')) {
              throw new Error('Freighter wallet internal error. Try refreshing the page, closing and reopening Freighter, or restarting your browser.')
            } else if (errorMessage.includes('network')) {
              throw new Error('Network error. Please check your connection and ensure Freighter is connected to Stellar Testnet.')
            } else if (errorMessage.includes('account')) {
              throw new Error('Account error. Please ensure your account is funded on Testnet.')
            } else if (errorMessage.includes('transaction too large') || errorMessage.includes('size')) {
              throw new Error('Transaction is too large for Freighter to process. Please try a simpler transaction.')
            } else if (errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
              throw new Error('Invalid transaction format. The transaction may be corrupted.')
            }
            
            throw new Error(`Freighter signing failed: ${freighterError.message}`)
          }
          throw new Error('Unknown error during Freighter signing')
        }
      } else if (walletType === 'passkey') {
        // Use Passkey signing
        return await signTransaction(txXdr)
      } else {
        throw new Error("Unknown wallet type")
      }
    } catch (error) {
      console.error("Transaction error:", error)
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to submit transaction",
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        publicKey,
        walletType,
        connect,
        disconnect,
        signAndSubmitTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
