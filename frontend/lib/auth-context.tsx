"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { signAndSubmitTransaction } from "@/services/soroban"
import type { AuthenticationState, PasskeyCredential } from "@/lib/types"
import { 
  createPasskey, 
  authenticateWithPasskey,
  checkPasskeySupport,
  webAuthnToStellarPublicKey,
  isPasskeyEnvironmentReady
} from "@/lib/passkey-utils"

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
      // Check if environment is ready for passkeys
      if (!isPasskeyEnvironmentReady()) {
        throw new Error("Passkey environment not ready. HTTPS required in production.")
      }

      // Check comprehensive WebAuthn support
      const support = await checkPasskeySupport()
      if (!support.isSupported) {
        throw new Error("WebAuthn passkeys are not supported in this browser")
      }

      // Try to use existing credential first
      if (credential?.id) {
        try {
          const authResult = await authenticateWithPasskey({ credentialId: credential.id })
          if (authResult) {
            setState({ isAuthenticated: true, loading: false })
            toast({
              title: "Welcome Back!",
              description: "Successfully authenticated with existing passkey",
            })
            return
          }
        } catch (error) {
          console.log("Existing credential authentication failed, creating new one:", error)
        }
      }

      // Create new passkey credential
      const newCredential = await createPasskey({
        username: `user-${Date.now()}@bookie.marketplace`,
        displayName: "Bookie Marketplace User"
      })
      
      // Convert WebAuthn public key to Stellar format
      const stellarPublicKey = webAuthnToStellarPublicKey(newCredential.publicKey)
      
      const passkeyCredential: PasskeyCredential = {
        id: newCredential.credentialId,
        publicKey: stellarPublicKey,
        userHandle: newCredential.userHandle,
      }
      
      setCredential(passkeyCredential)
      setPublicKey(stellarPublicKey)
      setState({ isAuthenticated: true, loading: false })

      // Save to localStorage
      localStorage.setItem("auth-state", JSON.stringify({ isAuthenticated: true }))
      localStorage.setItem("passkey-credential", JSON.stringify(passkeyCredential))
      localStorage.setItem("public-key", stellarPublicKey)

      toast({
        title: "Passkey Created Successfully!",
        description: "Your biometric authentication is now set up for secure access",
      })
    } catch (error) {
      console.error("Passkey authentication error:", error)
      setState({ isAuthenticated: false, loading: false })
      
      let errorMessage = "Failed to authenticate with passkey"
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
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
