"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { checkPasskeySupport, isPasskeyEnvironmentReady, type PasskeySupport } from "@/lib/passkey-utils"
import { 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Fingerprint, 
  Shield, 
  Smartphone,
  Chrome,
  Info,
  Lock
} from "lucide-react"

export default function PasskeyAuthPage() {
  const { isAuthenticated, loading, publicKey, credentialId, authenticate, logout } = useAuth()
  const { toast } = useToast()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [passkeySupport, setPasskeySupport] = useState<PasskeySupport | null>(null)
  const [environmentReady, setEnvironmentReady] = useState(false)

  useEffect(() => {
    checkEnvironmentAndSupport()
  }, [])

  const checkEnvironmentAndSupport = async () => {
    setEnvironmentReady(isPasskeyEnvironmentReady())
    const support = await checkPasskeySupport()
    setPasskeySupport(support)
  }

  const handleAuthenticate = async () => {
    if (!environmentReady || !passkeySupport?.isSupported) {
      toast({
        title: "Passkeys Not Available",
        description: "Your browser or environment doesn't support passkeys",
        variant: "destructive",
      })
      return
    }

    setIsAuthenticating(true)
    try {
      await authenticate()
      toast({
        title: "Authentication Successful",
        description: "Successfully authenticated with passkey",
      })
    } catch (error) {
      console.error("Authentication failed:", error)
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Failed to authenticate with passkey",
        variant: "destructive",
      })
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "Successfully logged out from passkey authentication",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Passkey Authentication</h1>
          <p className="text-gray-600">
            Secure, passwordless authentication using WebAuthn technology
          </p>
        </div>

        {/* WebAuthn Support Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Passkey Environment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Environment Check */}
            <div className="flex items-center gap-2">
              {environmentReady ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">Environment Ready</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">Environment Not Ready</span>
                </>
              )}
            </div>

            {/* WebAuthn Support */}
            <div className="flex items-center gap-2">
              {passkeySupport?.isSupported ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">WebAuthn Supported</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">WebAuthn Not Supported</span>
                </>
              )}
            </div>

            {/* Platform Authenticator */}
            {passkeySupport && (
              <div className="flex items-center gap-2">
                {passkeySupport.platformAuthenticatorAvailable ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-green-700 font-medium">Platform Authenticator Available</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-700 font-medium">No Platform Authenticator</span>
                  </>
                )}
              </div>
            )}

            {passkeySupport && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Browser Support:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(passkeySupport.browsers).map(([browser, supported]) => (
                    <div key={browser} className="flex items-center gap-2">
                      {supported ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm capitalize">
                        {browser}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Security Status:</p>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  {window?.location?.protocol === 'https:' ? 'Secure (HTTPS)' : 
                   window?.location?.hostname === 'localhost' ? 'Local Development' : 'Insecure Connection'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Passkey Authentication
            </CardTitle>
            <CardDescription>
              Use your device's built-in security features for passwordless authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Authentication Status */}
            <div className="p-4 rounded-lg border bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : isAuthenticated ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">
                      {loading ? "Checking authentication..." : 
                       isAuthenticated ? "Authenticated" : "Not authenticated"}
                    </p>
                    {publicKey && (
                      <p className="text-sm text-gray-600">
                        Public Key: {publicKey.substring(0, 20)}...
                      </p>
                    )}
                    {credentialId && (
                      <p className="text-sm text-gray-600">
                        Credential ID: {credentialId.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isAuthenticated ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!isAuthenticated ? (
                <Button 
                  onClick={handleAuthenticate} 
                  disabled={isAuthenticating || !environmentReady || !passkeySupport?.isSupported}
                  className="flex items-center gap-2"
                >
                  {isAuthenticating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Fingerprint className="h-4 w-4" />
                  )}
                  {isAuthenticating ? "Creating Passkey..." : "Create & Authenticate"}
                </Button>
              ) : (
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>

            {(!environmentReady || !passkeySupport?.isSupported) && (
              <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Passkeys Not Available</p>
                    <p>
                      {!environmentReady && "Secure environment required (HTTPS). "}
                      {!passkeySupport?.isSupported && "Your browser doesn't support WebAuthn passkeys. "}
                      Please use a supported browser and ensure you're on a secure connection.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Passkey Authentication Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <Smartphone className="h-8 w-8 mx-auto text-blue-500" />
                <h3 className="font-medium">1. Device Authentication</h3>
                <p className="text-sm text-gray-600">
                  Use Touch ID, Face ID, Windows Hello, or PIN
                </p>
              </div>
              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 mx-auto text-green-500" />
                <h3 className="font-medium">2. Cryptographic Verification</h3>
                <p className="text-sm text-gray-600">
                  Public key cryptography ensures security
                </p>
              </div>
              <div className="text-center space-y-2">
                <Key className="h-8 w-8 mx-auto text-purple-500" />
                <h3 className="font-medium">3. Passwordless Access</h3>
                <p className="text-sm text-gray-600">
                  No passwords to remember or manage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
