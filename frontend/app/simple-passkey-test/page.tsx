"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimplePasskeyTest() {
  const [status, setStatus] = useState<string>("Ready to test")
  const [error, setError] = useState<string | null>(null)

  const testBasicWebAuthn = async () => {
    setStatus("Testing WebAuthn support...")
    setError(null)

    try {
      // Check basic support
      if (!navigator.credentials) {
        throw new Error("navigator.credentials not supported")
      }

      if (!window.PublicKeyCredential) {
        throw new Error("PublicKeyCredential not supported")
      }

      setStatus("✓ Basic WebAuthn supported. Testing platform authenticator...")

      // Check platform authenticator
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!available) {
        throw new Error("No platform authenticator available")
      }

      setStatus("✓ Platform authenticator available. Creating credential...")

      // Create a simple passkey
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const userId = crypto.getRandomValues(new Uint8Array(16))

      const createOptions: CredentialCreationOptions = {
        publicKey: {
          rp: {
            name: "Bookie Test",
            id: "localhost", // Explicitly set for localhost
          },
          user: {
            id: userId,
            name: "test@bookie.com",
            displayName: "Test User",
          },
          challenge,
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
          ],
          timeout: 60000,
          attestation: "none", // Changed from "direct" to "none"
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "preferred", // Changed from "required" to "preferred"
            requireResidentKey: false, // Changed from true to false
          },
        },
      }

      setStatus("Creating passkey... (You may see a biometric prompt)")

      const credential = await navigator.credentials.create(createOptions)

      if (!credential) {
        throw new Error("Failed to create credential")
      }

      setStatus("✅ Passkey created successfully!")
      console.log("Credential created:", credential)

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      setError(errorMsg)
      setStatus("❌ Test failed")
      console.error("WebAuthn test failed:", err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Simple Passkey Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                This test will attempt to create a passkey using simplified settings.
              </p>
              
              <div className="p-3 bg-gray-50 rounded mb-4">
                <strong>Status:</strong> {status}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <Button onClick={testBasicWebAuthn} className="w-full">
                Test Passkey Creation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
