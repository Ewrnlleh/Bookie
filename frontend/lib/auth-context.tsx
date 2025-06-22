"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { signAndSubmitTransaction } from "@/services/soroban"
import type { AuthenticationState, PasskeyCredential } from "@/lib/types"

interface AuthContextType {
  isAuthenticated: boolean
  publicKey: string | null
  credentialId: string | null
  loading: boolean
  authenticate: () => Promise<void>
  signTransaction: (txXdr: string) => Promise<{ hash: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<AuthenticationState>({
    isAuthenticated: false,
    loading: true,
  })
  const [credential, setCredential] = useState<PasskeyCredential | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  
  // Add toast hook with fallback
  let toast: any
  try {
    const toastHook = useToast()
    toast = toastHook.toast
  } catch (error) {
    console.warn("Toast hook not available:", error)
    toast = (message: any) => console.log("Toast:", message)
  }

  useEffect(() => {
    setMounted(true)
    const initAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          setState({ isAuthenticated: false, loading: false })
          return
        }

        const savedAuth = localStorage.getItem("auth-state")
        const savedCredential = localStorage.getItem("passkey-credential")
        const savedPublicKey = localStorage.getItem("public-key")
        
        if (savedAuth && savedCredential && savedPublicKey) {
          try {
            const parsedCredential = JSON.parse(savedCredential)
            setState({ isAuthenticated: true, loading: false })
            setCredential(parsedCredential)
            setPublicKey(savedPublicKey)
          } catch (parseError) {
            console.error("Failed to parse saved credentials:", parseError)
            setState({ isAuthenticated: false, loading: false })
          }
        } else {
          setState({ isAuthenticated: false, loading: false })
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        setState({ isAuthenticated: false, loading: false })
        setCredential(null)
        setPublicKey(null)
      }
    }

    initAuth()
  }, [])

  // Don't render until mounted on client
  if (!mounted) {
    return null
  }

  const authenticate = async () => {
    if (typeof window === 'undefined') {
      throw new Error("Authentication is only available in browser")
    }

    setState(prev => ({ ...prev, loading: true }))
    
    try {
      if (!navigator.credentials) {
        throw new Error("WebAuthn is not supported in this browser")
      }

      // Check platform authenticator availability
      if (typeof PublicKeyCredential !== 'undefined' && 
          PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        if (!isAvailable) {
          throw new Error("No platform authenticator available. Please ensure you have biometric authentication set up on your device.")
        }
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32))

      const options: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: "Bookie Marketplace",
            id: typeof window !== 'undefined' ? window.location.hostname : "localhost",
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: "user@example.com",
            displayName: "Bookie User",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 }, // RS256
          ],
          timeout: 60000,
          attestation: "none", // Changed from "direct" to "none" for better compatibility
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: false, // Changed from true to false for better compatibility
            userVerification: "preferred", // Changed from "required" to "preferred"
          },
        },
      }

      const newCredential = await navigator.credentials.create(options)
      if (!newCredential || !(newCredential instanceof PublicKeyCredential)) {
        throw new Error("Failed to create credential")
      }

      const response = newCredential.response as AuthenticatorAttestationResponse
      const credentialId = Buffer.from(newCredential.rawId).toString("base64")
      const publicKeyBuffer = response.getPublicKey()
      
      if (!publicKeyBuffer) {
        throw new Error("Failed to get public key from credential")
      }

      const mockPublicKey = "GCKFBEIYTKP74Q7EJQLTPVQAETEJ2KGYVUH6EWPXCESR5KZKJXBXZXQX"

      const credentialData: PasskeyCredential = {
        id: credentialId,
        publicKey: Buffer.from(publicKeyBuffer).toString("base64"),
        userHandle: Buffer.from(response.getAuthenticatorData()).toString("base64"),
      }

      // Save to localStorage with error handling
      try {
        localStorage.setItem("auth-state", JSON.stringify({ isAuthenticated: true }))
        localStorage.setItem("passkey-credential", JSON.stringify(credentialData))
        localStorage.setItem("public-key", mockPublicKey)
      } catch (storageError) {
        console.warn("Failed to save to localStorage:", storageError)
      }

      setCredential(credentialData)
      setState({ isAuthenticated: true, loading: false })
      setPublicKey(mockPublicKey)

      toast({
        title: "Authentication Successful",
        description: "Successfully authenticated with Passkey",
      })
    } catch (error) {
      console.error("Authentication error:", error)
      setState({ isAuthenticated: false, loading: false })
      
      let errorMessage = "Failed to authenticate with Passkey"
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Authentication was cancelled or not allowed. Please try again."
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Passkey authentication is not supported on this device."
        } else if (error.name === 'SecurityError') {
          errorMessage = "Security error occurred. Please ensure you're on a secure connection."
        } else if (error.name === 'InvalidStateError') {
          errorMessage = "Invalid state. The authenticator may already be registered."
        } else if (error.message.includes('platform authenticator')) {
          errorMessage = "No biometric authentication found. Please set up Touch ID, Face ID, or Windows Hello."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw new Error(errorMessage)
    }
  }

  const logout = () => {
    setState({ isAuthenticated: false, loading: false })
    setCredential(null)
    setPublicKey(null)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem("auth-state")
        localStorage.removeItem("passkey-credential")
        localStorage.removeItem("public-key")
      } catch (error) {
        console.warn("Failed to clear localStorage:", error)
      }
    }
    
    toast({
      title: "Logged Out",
      description: "Successfully logged out",
    })
  }

  const signTransaction = async (txXdr: string): Promise<{ hash: string }> => {
    if (!state.isAuthenticated || !credential) {
      throw new Error("Not authenticated")
    }

    try {
      return await signAndSubmitTransaction(txXdr, credential.id)
    } catch (error) {
      console.error("Transaction signing error:", error)
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to sign transaction",
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      publicKey,
      credentialId: credential?.id || null,
      authenticate,
      signTransaction,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    // Return loading state instead of error during hydration
    return {
      isAuthenticated: false,
      publicKey: null,
      credentialId: null,
      loading: true,
      authenticate: async () => {},
      signTransaction: async () => ({ hash: '' }),
      logout: () => {},
    }
  }
  
  return context
}
