export interface DataAsset {
  id: string
  title: string
  description: string
  dataType: string
  price: number
  seller: string
  ipfsCid: string
  encryptionKey: string
  listedDate: string
  size: string
  isActive: boolean
}

export interface Transaction {
  id: string
  assetId: string
  buyer: string
  seller: string
  price: number
  timestamp: string
  txHash: string
}

export interface WalletState {
  isConnected: boolean
  publicKey: string
  balance: number
}

export interface PasskeyRegistrationOptions {
  username: string
  displayName: string
}

export interface PasskeyAuthenticationOptions {
  allowCredentials: PublicKeyCredentialDescriptor[]
  userVerification?: UserVerificationRequirement
}

export interface SorobanAuthEntry {
  credentials: string
  signature: Uint8Array
  clientData: ArrayBuffer
}

export type AuthenticationState = {
  loading: any
  isAuthenticated: boolean
  credentialId?: string
  error?: string
}

export interface PasskeyCredential {
  id: string
  publicKey: string
  userHandle: string
}

export interface TransactionDetails {
  hash: string
  status: 'pending' | 'success' | 'error'
  error?: string
}
