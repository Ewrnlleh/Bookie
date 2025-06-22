// WebAuthn Passkey Utilities for Bookie Marketplace
// This file provides utilities for working with WebAuthn passkeys

export interface PasskeySupport {
  isSupported: boolean
  platformAuthenticatorAvailable: boolean
  conditionalMediationAvailable: boolean
  browsers: {
    chrome: boolean
    safari: boolean
    firefox: boolean
    edge: boolean
  }
}

export interface PasskeyCreateOptions {
  username?: string
  displayName?: string
  userId?: Uint8Array
  challengeSize?: number
  timeout?: number
  authenticatorSelection?: {
    authenticatorAttachment?: "platform" | "cross-platform"
    userVerification?: "required" | "preferred" | "discouraged"
    residentKey?: "required" | "preferred" | "discouraged"
  }
}

export interface PasskeyAuthOptions {
  credentialId?: string
  timeout?: number
  userVerification?: "required" | "preferred" | "discouraged"
}

/**
 * Check comprehensive WebAuthn support
 */
export async function checkPasskeySupport(): Promise<PasskeySupport> {
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      platformAuthenticatorAvailable: false,
      conditionalMediationAvailable: false,
      browsers: { chrome: false, safari: false, firefox: false, edge: false }
    }
  }

  const isBasicSupported = !!(
    window.navigator?.credentials &&
    typeof window.navigator.credentials.create === 'function' &&
    typeof window.navigator.credentials.get === 'function' &&
    window.PublicKeyCredential
  )

  let platformAuthenticatorAvailable = false
  let conditionalMediationAvailable = false

  if (isBasicSupported && window.PublicKeyCredential) {
    try {
      platformAuthenticatorAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch (e) {
      console.log("Platform authenticator check failed:", e)
    }

    try {
      conditionalMediationAvailable = await PublicKeyCredential.isConditionalMediationAvailable()
    } catch (e) {
      console.log("Conditional mediation check failed:", e)
    }
  }

  const userAgent = navigator.userAgent
  const browsers = {
    chrome: userAgent.includes('Chrome') && !userAgent.includes('Edg'),
    safari: userAgent.includes('Safari') && !userAgent.includes('Chrome'),
    firefox: userAgent.includes('Firefox'),
    edge: userAgent.includes('Edg')
  }

  return {
    isSupported: isBasicSupported,
    platformAuthenticatorAvailable,
    conditionalMediationAvailable,
    browsers
  }
}

/**
 * Create a new passkey credential
 */
export async function createPasskey(options: PasskeyCreateOptions = {}): Promise<{
  credentialId: string
  publicKey: ArrayBuffer
  userHandle: string
  rawCredential: PublicKeyCredential
}> {
  if (typeof window === 'undefined') {
    throw new Error("Passkeys are only available in browser environment")
  }

  if (!window.navigator?.credentials?.create) {
    throw new Error("WebAuthn credential creation not supported")
  }

  // Generate secure random values
  const userId = options.userId || crypto.getRandomValues(new Uint8Array(32))
  const challenge = crypto.getRandomValues(new Uint8Array(32))

  const createOptions: CredentialCreationOptions = {
    publicKey: {
      challenge,
      rp: {
        name: "Bookie Marketplace",
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      },
      user: {
        id: userId,
        name: options.username || `user-${Date.now()}@bookie.marketplace`,
        displayName: options.displayName || "Bookie User",
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },   // ES256 (ECDSA w/ SHA-256)
        { alg: -257, type: "public-key" }, // RS256 (RSASSA-PKCS1-v1_5 w/ SHA-256)
        { alg: -37, type: "public-key" },  // PS256 (RSASSA-PSS w/ SHA-256)
      ],
      authenticatorSelection: {
        authenticatorAttachment: options.authenticatorSelection?.authenticatorAttachment || "platform",
        userVerification: options.authenticatorSelection?.userVerification || "required",
        residentKey: options.authenticatorSelection?.residentKey || "preferred",
      },
      timeout: options.timeout || 60000,
      attestation: "direct",
    },
  }

  try {
    const credential = await navigator.credentials.create(createOptions) as PublicKeyCredential

    if (!credential) {
      throw new Error("Failed to create passkey credential")
    }

    const response = credential.response as AuthenticatorAttestationResponse
    const publicKey = response.getPublicKey()

    if (!publicKey) {
      throw new Error("Failed to extract public key from credential")
    }

    return {
      credentialId: credential.id,
      publicKey,
      userHandle: Array.from(userId).map(b => b.toString(16).padStart(2, '0')).join(''),
      rawCredential: credential
    }
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific WebAuthn errors
      if (error.name === 'NotAllowedError') {
        throw new Error("Passkey creation was cancelled or denied")
      } else if (error.name === 'InvalidStateError') {
        throw new Error("A passkey already exists for this device")
      } else if (error.name === 'NotSupportedError') {
        throw new Error("Passkeys are not supported on this device")
      } else if (error.name === 'SecurityError') {
        throw new Error("Security error: ensure you're using HTTPS")
      }
    }
    throw error
  }
}

/**
 * Authenticate with an existing passkey
 */
export async function authenticateWithPasskey(options: PasskeyAuthOptions = {}): Promise<{
  credentialId: string
  signature: ArrayBuffer
  userHandle: string | null
  rawAssertion: PublicKeyCredential
}> {
  if (typeof window === 'undefined') {
    throw new Error("Passkeys are only available in browser environment")
  }

  if (!window.navigator?.credentials?.get) {
    throw new Error("WebAuthn credential authentication not supported")
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32))

  const authOptions: CredentialRequestOptions = {
    publicKey: {
      challenge,
      allowCredentials: options.credentialId ? [{
        id: new TextEncoder().encode(options.credentialId),
        type: "public-key",
      }] : undefined,
      userVerification: options.userVerification || "required",
      timeout: options.timeout || 60000,
    },
  }

  try {
    const assertion = await navigator.credentials.get(authOptions) as PublicKeyCredential

    if (!assertion) {
      throw new Error("Authentication failed - no assertion returned")
    }

    const response = assertion.response as AuthenticatorAssertionResponse

    return {
      credentialId: assertion.id,
      signature: response.signature,
      userHandle: response.userHandle ? 
        Array.from(new Uint8Array(response.userHandle))
          .map(b => b.toString(16).padStart(2, '0')).join('') : null,
      rawAssertion: assertion
    }
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific WebAuthn errors
      if (error.name === 'NotAllowedError') {
        throw new Error("Authentication was cancelled or denied")
      } else if (error.name === 'InvalidStateError') {
        throw new Error("No passkey found for authentication")
      } else if (error.name === 'NotSupportedError') {
        throw new Error("Passkey authentication not supported on this device")
      } else if (error.name === 'SecurityError') {
        throw new Error("Security error: ensure you're using HTTPS")
      }
    }
    throw error
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Generate a Stellar-compatible public key from WebAuthn public key
 * Note: This is a simplified implementation for demo purposes
 */
export function webAuthnToStellarPublicKey(webAuthnPublicKey: ArrayBuffer): string {
  // For demo purposes, we'll generate a valid Stellar public key format
  // In a real implementation, you would need to properly convert the WebAuthn
  // public key to a Stellar-compatible format or use it for signing operations
  
  const hash = crypto.getRandomValues(new Uint8Array(32))
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = 'G' // Stellar public keys start with 'G'
  
  for (let i = 0; i < 55; i++) {
    result += base32Chars[hash[i % 32] % 32]
  }
  
  return result
}

/**
 * Check if current environment supports passkeys
 */
export function isPasskeyEnvironmentReady(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for HTTPS (required for WebAuthn in production)
  const isSecure = window.location.protocol === 'https:' || 
                   window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1'
  
  if (!isSecure) {
    console.warn("Passkeys require HTTPS in production environments")
  }
  
  return isSecure && !!(
    window.navigator?.credentials &&
    typeof window.navigator.credentials.create === 'function' &&
    typeof window.navigator.credentials.get === 'function'
  )
}
