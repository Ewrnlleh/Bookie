import Server from '@stellar/stellar-sdk'
import { xdr, contract, Address, nativeToScVal, Contract, Keypair, TransactionBuilder, BASE_FEE, Networks } from "@stellar/stellar-sdk"
import type { DataAsset } from "@/lib/types"
import { base64ToUint8Array, uint8ArrayToBase64, concatUint8Arrays } from "@/lib/utils"
import { Server as RpcServer } from '@stellar/stellar-sdk/rpc'

const isBrowser = typeof window !== "undefined"
const contractId = process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID || "YOUR_CONTRACT_ID"
const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://rpc-futurenet.stellar.org"
const FUTURENET_PASSPHRASE = "Test SDF Future Network ; October 2022"

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development' || contractId === "YOUR_CONTRACT_ID"

// Initialize Soroban client
let sorobanClient: RpcServer | null = null;
let lastConnectionAttempt = 0;
const RECONNECT_INTERVAL = 5000; // 5 seconds

function getClient(): RpcServer {
  if (!isBrowser) {
    throw new Error("Soroban client is only available in browser environments");
  }

  if (isDevelopment) {
    console.warn("Development mode: Using mock Soroban client")
    // Return a mock client for development
    return new RpcServer(rpcUrl, {
      allowHttp: true,
      timeout: 30000
    });
  }

  const now = Date.now();
  if (sorobanClient && now - lastConnectionAttempt < RECONNECT_INTERVAL) {
    return sorobanClient;
  }

  try {
    lastConnectionAttempt = now;
    const client = new RpcServer(rpcUrl, {
      allowHttp: rpcUrl.startsWith('http:'),
      timeout: 30000, // 30 second timeout
    });
    
    sorobanClient = client;
    return client;
  } catch (error) {
    console.error('Failed to initialize Soroban client:', error);
    throw new SorobanError('Failed to connect to Soroban network');
  }
}

// WebAuthn signature conversion utilities
async function convertWebAuthnSignatureToSoroban(
  signature: ArrayBuffer,
  authenticatorData: ArrayBuffer,
  clientDataJSON: ArrayBuffer
): Promise<Buffer> {
  // Combine the signature components into a format Soroban can verify
  const combinedSignature = concatUint8Arrays(
    new Uint8Array(authenticatorData),
    new Uint8Array(clientDataJSON),
    new Uint8Array(signature)
  )
  
  return Buffer.from(combinedSignature)
}

export async function signTransactionWithPasskey(
  transactionXdr: string,
  credentialId: string
): Promise<string> {
  if (!isBrowser) {
    throw new Error("WebAuthn is only available in browser environments")
  }

  try {
    // Create the challenge from the transaction XDR
    const challenge = base64ToUint8Array(transactionXdr)
    
    // Get the credential
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{
          id: base64ToUint8Array(credentialId),
          type: 'public-key'
        }],
        userVerification: 'required',
      }
    }) as PublicKeyCredential
    
    const response = assertion.response as AuthenticatorAssertionResponse
    
    // Convert the signature to Soroban-compatible format
    const signatureBuffer = await convertWebAuthnSignatureToSoroban(
      response.signature,
      response.authenticatorData,
      response.clientDataJSON
    )
    
    // Create and return the signed transaction XDR
    const envelope = xdr.TransactionEnvelope.fromXDR(transactionXdr, 'base64')
    const transaction = envelope.v1()
    
    transaction.signatures().push(
      new xdr.DecoratedSignature({
        hint: Buffer.alloc(4), // Empty hint for WebAuthn
        signature: signatureBuffer
      })
    )
    
    return envelope.toXDR('base64')
  } catch (error) {
    console.error('Error signing with Passkey:', error)
    throw new Error('Failed to sign transaction with Passkey')
  }
}

// Error types
export class SorobanError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'SorobanError'
  }
}

export class PasskeyError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'PasskeyError'
  }
}

// Add new error types
export class TransactionError extends SorobanError {
  constructor(message: string, public txHash?: string) {
    super(message);
    this.name = 'TransactionError';
  }
}

export class SimulationError extends SorobanError {
  constructor(message: string) {
    super(message);
    this.name = 'SimulationError';
  }
}

// Helper to check connection and reconnect if needed
async function ensureConnection(): Promise<RpcServer> {
  const client = getClient();
  try {
    // Simple health check
    await client.getHealth();
    return client;
  } catch (error) {
    sorobanClient = null; // Force reconnection
    return getClient();
  }
}

// Simple RPC abstraction
async function sorobanRpc(method: string, params: any[]) {
  try {
    await ensureConnection();
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params
      })
    });

    if (!response.ok) {
      throw new SorobanError(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    if (json.error) throw new SorobanError(json.error.message);
    return json.result;
  } catch (e) {
    console.error(`Error in ${method}:`, e);
    throw new SorobanError(e instanceof Error ? e.message : 'Unknown RPC error');
  }
}

// Transaction submission and monitoring
export async function submitSignedTransaction(signedTxXdr: string) {
  // Validate input type
  if (typeof signedTxXdr !== 'string') {
    console.error('submitSignedTransaction received invalid input:', typeof signedTxXdr, signedTxXdr)
    throw new SorobanError(`Transaction submission failed: Expected string but received ${typeof signedTxXdr}`)
  }
  
  if (!signedTxXdr) {
    throw new SorobanError('Transaction submission failed: Empty transaction XDR')
  }
  
  try {
    const result = await submitTransaction(signedTxXdr)
    return {
      hash: result.hash,
      status: result.status,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error submitting transaction'
    throw new SorobanError(message)
  }
}

export async function waitForTransactionCompletion(hash: string, maxAttempts = 10): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await getTransactionStatus(hash)
      
      if (status.status === 'SUCCESS') {
        return true
      }
      
      if (status.status === 'FAILED') {
        throw new SorobanError('Transaction failed', status.resultXdr)
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw new SorobanError('Transaction monitoring failed')
      }
    }
  }
  
  return false
}

// Add type definition for transaction status
export type TransactionStatusResponse = {
  status: string;
  resultXdr?: string;
}

// Make getTransactionStatus public and add type definition
export async function getTransactionStatus(hash: string): Promise<TransactionStatusResponse> {
  try {
    const result = await sorobanRpc("getTransaction", [{ hash }]);
    return {
      status: result.status,
      resultXdr: result.resultXdr,
    };
  } catch (error) {
    throw new SorobanError("Failed to fetch transaction status");
  }
}

// Enhance contract interaction helpers with retry logic
async function simulateTransaction(txXdr: string, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await sorobanRpc("simulateTransaction", [{ transactionXdr: txXdr }]);
      if (!result?.transaction) {
        throw new SimulationError("Invalid simulation result");
      }
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
      }
    }
  }
  throw new SimulationError(`Simulation failed after ${maxRetries} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

async function submitTransaction(signedTxXdr: string) {
  try {
    // Validate transaction XDR before submission
    const envelope = xdr.TransactionEnvelope.fromXDR(signedTxXdr, 'base64');
    // Check signatures property for all envelope types
    let signatures: any[] = [];
    if (envelope.switch() === xdr.EnvelopeType.envelopeTypeTxV0()) {
      signatures = envelope.v0().signatures();
    } else if (envelope.switch() === xdr.EnvelopeType.envelopeTypeTx()) {
      signatures = envelope.v1().signatures();
    } else if (envelope.switch() === xdr.EnvelopeType.envelopeTypeTxFeeBump()) {
      signatures = envelope.feeBump().signatures();
    }
    if (!signatures.length) {
      throw new TransactionError("Transaction has no signatures");
    }

    const result = await sorobanRpc("sendTransaction", [{ transactionXdr: signedTxXdr }]);
    if (!result?.hash) {
      throw new TransactionError("Invalid transaction response");
    }
    
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new TransactionError(`Transaction submission failed: ${message}`);
  }
}

export async function signAndSubmitTransaction(
  transactionXdr: string,
  credentialId: string
): Promise<{ hash: string }> {
  try {
    const signedTxXdr = await signTransactionWithPasskey(transactionXdr, credentialId);
    
    // Add validation before submission
    if (!signedTxXdr) {
      throw new PasskeyError("Failed to get signed transaction");
    }

    const { hash } = await submitSignedTransaction(signedTxXdr);
    if (!hash) {
      throw new TransactionError("No transaction hash returned");
    }

    return { hash };
  } catch (error) {
    if (error instanceof SorobanError || error instanceof PasskeyError) {
      throw error;
    }
    console.error("Transaction error:", error);
    throw new TransactionError(
      error instanceof Error ? error.message : 'Unknown transaction error'
    );
  }
}

// Contract interaction helpers 
async function parseContractValue<T>(xdrValue: string): Promise<T> {
  const value = xdr.ScVal.fromXDR(xdrValue, 'base64')
  return value as unknown as T
}

function parseDataAsset(value: any): DataAsset {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid data asset format')
  }
  
  return {
    id: value.id || '',
    title: value.title || '',
    description: value.description || '',
    dataType: value.dataType || '',
    price: Number(value.price) || 0,
    seller: value.seller || '',
    ipfsCid: value.ipfsCid || '',
    encryptionKey: value.encryptionKey || '',
    listedDate: value.listedDate || new Date().toISOString(),
    size: String(value.size || 0),
    isActive: Boolean(value.isActive)
  }
}

export async function listDataRequests(): Promise<DataAsset[]> {
  if (!isBrowser) return []
  
  // Development mode: return mock data
  if (isDevelopment) {
    console.warn("Development mode: Returning mock data for listDataRequests")
    return [
      {
        id: "mock-1",
        title: "Sample Health Data",
        description: "Anonymized health metrics for research",
        dataType: "health",
        price: 100,
        seller: "GDDBM35WJ7LRB4U3FJYFNH5JDVTPGLSCR7HSD6XV5GTSTQPOIFPDGJCT",
        ipfsCid: "QmX123mockCid",
        encryptionKey: "mock-encryption-key",
        listedDate: new Date().toISOString(),
        size: "2.5MB",
        isActive: true
      },
      {
        id: "mock-2", 
        title: "Fitness Tracking Data",
        description: "Daily activity and exercise data",
        dataType: "fitness",
        price: 50,
        seller: "GDDBM35WJ7LRB4U3FJYFNH5JDVTPGLSCR7HSD6XV5GTSTQPOIFPDGJCT",
        ipfsCid: "QmY456mockCid",
        encryptionKey: "mock-encryption-key-2",
        listedDate: new Date().toISOString(),
        size: "1.2MB",
        isActive: true
      }
    ]
  }
  
  try {
    const client = getClient()
    // For read-only operations, we can use a placeholder account
    const sourceAccount = await client.getAccount("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF")
    
    // Create contract instance
    const contractInstance = new Contract(contractId)
    
    // Build transaction to call get_requests
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: FUTURENET_PASSPHRASE,
    })
      .addOperation(contractInstance.call("get_requests"))
      .setTimeout(30)
      .build()
    
    // Simulate the transaction using our existing method
    const simulation = await simulateTransaction(transaction.toXDR())
    
    // Parse the result
    const result = await parseContractValue<any[]>(simulation.result.retval)
    return result.map(parseDataAsset)
  } catch (e) {
    console.error("Error fetching data requests:", e)
    return []
  }
}

export async function createDataRequest(params: {
  requester: string
  dataType: string
  price: number
  durationDays: number
}) {
  if (!isBrowser) throw new Error("Must be run in browser")
  
  // Development mode: return mock transaction XDR
  if (isDevelopment) {
    console.warn("Development mode: Returning mock transaction for createDataRequest")
    return "AAAAAgAAAACNlYd30uE/u3+w1JRpqTGpY9qF6xzJlOqG0ky0UXK7vQAAAGQAAOQGAAAACQAAAAEAAAAAAAAAAAAAAAA="
  }
  
  try {
    const client = getClient()
    // Use the requester's address for the source account
    const sourceAccount = await client.getAccount(params.requester)
    
    // Create contract instance
    const contractInstance = new Contract(contractId)
    
    // Convert parameters to Soroban values
    const requesterAddr = nativeToScVal(Address.fromString(params.requester))
    const dataTypeVal = nativeToScVal(params.dataType)
    const priceVal = nativeToScVal(params.price, { type: "u64" })
    const durationVal = nativeToScVal(params.durationDays, { type: "u32" })
    
    // Build transaction to call create_request
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: FUTURENET_PASSPHRASE,
    })
      .addOperation(contractInstance.call("create_request", requesterAddr, dataTypeVal, priceVal, durationVal))
      .setTimeout(30)
      .build()

    // Return the transaction XDR for signing
    return transaction.toXDR()
  } catch (e) {
    console.error("Error creating data request:", e)
    throw e
  }
}

export async function approveDataRequest(
  index: number,
  approverPublicKey: string
) {
  if (!isBrowser) throw new Error("Must be run in browser")
  
  // Development mode: return mock transaction XDR
  if (isDevelopment) {
    console.warn("Development mode: Returning mock transaction for approveDataRequest")
    return "AAAAAgAAAACNlYd30uE/u3+w1JRpqTGpY9qF6xzJlOqG0ky0UXK7vQAAAGQAAOQGAAAACQAAAAEAAAAAAAAAAAAAAAA="
  }
  
  try {
    const client = getClient()
    // Use the approver's address for the source account
    const sourceAccount = await client.getAccount(approverPublicKey)
    
    // Create contract instance
    const contractInstance = new Contract(contractId)
    
    // Convert parameters to Soroban values
    const indexVal = nativeToScVal(index, { type: "u32" })
    
    // Build transaction to call approve_request
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: FUTURENET_PASSPHRASE,
    })
      .addOperation(contractInstance.call("approve_request", indexVal))
      .setTimeout(30)
      .build()

    return transaction.toXDR()
  } catch (e) {
    console.error("Error approving data request:", e)
    throw e
  }
}