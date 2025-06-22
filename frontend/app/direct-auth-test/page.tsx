"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Key, CheckCircle2, AlertCircle, Loader2, LogOut } from "lucide-react"

export default function DirectAuthTest() {
  const { isAuthenticated, loading, publicKey, credentialId, authenticate, logout } = useAuth()
  const { toast } = useToast()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleDirectAuth = async () => {
    setIsAuthenticating(true)
    try {
      await authenticate()
      toast({
        title: "Success!",
        description: "Direct authentication successful",
      })
    } catch (error) {
      console.error("Direct auth failed:", error)
      toast({
        title: "Failed",
        description: "Direct authentication failed",
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
      description: "Successfully logged out",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Direct Authentication Test</h1>
          <p className="text-gray-600">
            Bypass WebAuthn and sign in directly for development/testing
          </p>
        </div>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Authentication Status
            </CardTitle>
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
            <CardTitle>Direct Authentication</CardTitle>
            <CardDescription>
              Sign in directly without biometric authentication (for development)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              {!isAuthenticated ? (
                <Button
                  onClick={handleDirectAuth}
                  disabled={isAuthenticating || loading}
                  className="w-full"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Sign In Directly
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded border">
              <strong>Note:</strong> This is a simplified authentication for development purposes. 
              No actual biometric authentication is required.
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Authentication Type:</strong> Direct (WebAuthn Bypassed)
                </div>
                <div>
                  <strong>Timestamp:</strong> {new Date().toLocaleString()}
                </div>
                <div>
                  <strong>Browser:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
