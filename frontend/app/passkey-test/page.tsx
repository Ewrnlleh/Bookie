"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Key, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function PasskeyTestPage() {
  const { isAuthenticated, loading, publicKey, credentialId, authenticate, logout } = useAuth()
  const { toast } = useToast()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleAuthenticate = async () => {
    setIsAuthenticating(true)
    try {
      await authenticate()
      toast({
        title: "Authentication Successful",
        description: "Direct authentication completed successfully",
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

  const testWebAuthnSupport = () => {
    if (typeof window === 'undefined') {
      return false
    }

    return !!(
      window.navigator &&
      window.navigator.credentials &&
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Passkey Authentication Test</h1>
          <p className="text-gray-600">
            Direct sign-in enabled (WebAuthn bypassed for development)
          </p>
          <div className="mt-2">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Development Mode: Direct Authentication
            </Badge>
          </div>
        </div>

        {/* WebAuthn Support Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              WebAuthn Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {testWebAuthnSupport() ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-600">WebAuthn is supported on this device</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600">WebAuthn is not supported on this device</span>
                </>
              )}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Browser:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'}</p>
              <p><strong>Platform:</strong> {typeof window !== 'undefined' ? window.navigator.platform : 'Unknown'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {loading ? (
                  <Badge variant="outline">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Loading...
                  </Badge>
                ) : isAuthenticated ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Authenticated
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Authenticated
                  </Badge>
                )}
              </div>

              {isAuthenticated && (
                <>
                  <div>
                    <span className="font-medium">Public Key:</span>
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                      {publicKey ? `${publicKey.substring(0, 20)}...` : 'None'}
                    </code>
                  </div>

                  <div>
                    <span className="font-medium">Credential ID:</span>
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                      {credentialId ? `${credentialId.substring(0, 20)}...` : 'None'}
                    </code>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Authentication Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Authentication</CardTitle>
            <CardDescription>
              Use your device's biometric authentication (Touch ID, Face ID, Windows Hello, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isAuthenticated ? (
                <Button 
                  onClick={handleAuthenticate}
                  disabled={isAuthenticating || !testWebAuthnSupport()}
                  className="w-full"
                  size="lg"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Authenticate with Passkey
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Logout
                </Button>
              )}

              {!testWebAuthnSupport() && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>WebAuthn not supported:</strong> This browser or device doesn't support passkey authentication.
                    Try using a modern browser like Chrome, Firefox, Safari, or Edge on a device with biometric capabilities.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Navigator.credentials:</strong> {typeof window !== 'undefined' && window.navigator.credentials ? 'Available' : 'Not Available'}</div>
              <div><strong>PublicKeyCredential:</strong> {typeof window !== 'undefined' && window.PublicKeyCredential ? 'Available' : 'Not Available'}</div>
              <div><strong>Location:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Unknown'}</div>
              <div><strong>HTTPS:</strong> {typeof window !== 'undefined' ? (window.location.protocol === 'https:' ? 'Yes' : 'No (localhost allowed)') : 'Unknown'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
