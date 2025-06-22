import Server from '@stellar/stellar-sdk'
import { xdr, contract, Address, nativeToScVal, Contract, Keypair, TransactionBuilder, BASE_FEE, Networks, Account, Operation, Asset, Horizon, Transaction } from "@stellar/stellar-sdk"
import type { DataAsset } from "@/lib/types"
import { base64ToUint8Array, uint8ArrayToBase64, concatUint8Arrays } from "@/lib/utils"
import { Server as RpcServer } from '@stellar/stellar-sdk/rpc'

const isBrowser = typeof window !== "undefined"
const contractId = process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID || "YOUR_CONTRACT_ID"
const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org"
const horizonUrl = "https://horizon-testnet.stellar.org"
const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015"

// Development mode check - can be overridden with environment variable
const forceRealTransactions = process.env.NEXT_PUBLIC_FORCE_REAL_TRANSACTIONS === 'true'
const isDevelopment = !forceRealTransactions && (process.env.NODE_ENV === 'development' || contractId === "YOUR_CONTRACT_ID")

// Debug logging for development mode detection
if (isBrowser) {
  console.log('🔧 Transaction Mode Debug:', {
    forceRealTransactions,
    isDevelopment,
    NODE_ENV: process.env.NODE_ENV,
    contractId: contractId.substring(0, 10) + '...',
    isPlaceholder: contractId === "YOUR_CONTRACT_ID"
  })
}

// Service initialized
console.log('Soroban service initialized for Testnet')

// Initialize Soroban client
let sorobanClient: RpcServer | null = null;
let lastConnectionAttempt = 0;
const RECONNECT_INTERVAL = 5000; // 5 seconds

export function getClient(): RpcServer {
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
    console.log(`Making RPC call: ${method}`, params);
    
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
    console.log(`RPC response for ${method}:`, json);
    
    if (json.error) {
      console.error(`RPC error for ${method}:`, json.error);
      
      // Handle specific Soroban error codes
      let errorMessage = json.error.message || JSON.stringify(json.error);
      if (json.error.code) {
        switch (json.error.code) {
          case -32602:
            errorMessage = `Invalid parameters for ${method}. Check your transaction format and parameters.`;
            break;
          case -32603:
            errorMessage = `Internal error in ${method}. The RPC server encountered an error processing your request.`;
            break;
          case -32700:
            errorMessage = `Parse error in ${method}. Invalid JSON format.`;
            break;
          case -32600:
            errorMessage = `Invalid request for ${method}. Check the RPC method name and format.`;
            break;
          default:
            errorMessage = `${method} failed with code ${json.error.code}: ${errorMessage}`;
        }
      }
      
      throw new SorobanError(errorMessage);
    }
    return json.result;
  } catch (e) {
    console.error(`Error in ${method}:`, e);
    if (e instanceof SorobanError) {
      throw e;
    }
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
  
  // Validate XDR format before processing
  try {
    const envelope = xdr.TransactionEnvelope.fromXDR(signedTxXdr, 'base64');
    console.log('Transaction XDR validation successful, envelope type:', envelope.switch());
  } catch (xdrError) {
    console.error('Invalid transaction XDR format:', xdrError);
    throw new SorobanError(`Transaction submission failed: Invalid XDR format - ${xdrError instanceof Error ? xdrError.message : 'Unknown XDR error'}`);
  }
  
  // Check if we should mock the transaction submission
  if (isDevelopment) {
    console.warn('🔧 Development mode: Simulating successful transaction submission')
    console.log('Transaction will be mocked because:', {
      forceRealTransactions,
      isDevelopment,
      NODE_ENV: process.env.NODE_ENV,
      contractIdIsPlaceholder: contractId === "YOUR_CONTRACT_ID"
    })
    const mockHash = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('Mock transaction hash:', mockHash)
    
    return {
      hash: mockHash,
      status: 'SUCCESS'
    }
  }
  
  // Submitting REAL transaction
  console.log("🚀 Submitting REAL transaction to Stellar network!", {
    rpcUrl,
    txXdrLength: signedTxXdr.length,
    txXdrPreview: signedTxXdr.substring(0, 50) + '...'
  })
  
  try {
    const result = await submitTransaction(signedTxXdr)
    console.log("✅ Real transaction submitted successfully:", result)
    return {
      hash: result.hash || result,
      status: result.status || 'PENDING',
    }
  } catch (error) {
    console.warn("❌ Soroban submission failed, trying Horizon fallback:", error);
    
    // Try submitting via Horizon as fallback for simple Stellar transactions
    try {
      const horizonServer = new Horizon.Server(horizonUrl);
      
      // Parse the transaction to check for Soroban operations
      const envelope = xdr.TransactionEnvelope.fromXDR(signedTxXdr, 'base64');
      let transaction;
      
      // Get the transaction from the envelope
      if (envelope.switch() === xdr.EnvelopeType.envelopeTypeTx()) {
        transaction = envelope.v1().tx();
      } else if (envelope.switch() === xdr.EnvelopeType.envelopeTypeTxV0()) {
        transaction = envelope.v0().tx();
      } else {
        throw new Error("Unsupported transaction envelope type");
      }
      
      // Check if this is a simple Stellar transaction (no Soroban operations)
      const ops = transaction.operations();
      const hasSorobanOps = ops.some((op: any) => 
        op.body().switch() === xdr.OperationType.invokeHostFunction() ||
        op.body().switch() === xdr.OperationType.restoreFootprint() ||
        op.body().switch() === xdr.OperationType.extendFootprintTtl()
      );
      
      if (!hasSorobanOps) {
        console.log("🔄 Attempting Horizon submission for non-Soroban transaction");
        // Use the correct Horizon method for XDR submission
        const horizonResult = await fetch(`${horizonUrl}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `tx=${encodeURIComponent(signedTxXdr)}`
        });
        
        if (!horizonResult.ok) {
          throw new Error(`Horizon HTTP error: ${horizonResult.status} ${horizonResult.statusText}`);
        }
        
        const horizonResponse = await horizonResult.json();
        console.log("✅ Horizon submission successful:", horizonResponse);
        return {
          hash: horizonResponse.hash,
          status: 'SUCCESS',
        };
      } else {
        console.log("❌ Transaction contains Soroban operations, cannot use Horizon fallback");
        throw error;
      }
    } catch (horizonError) {
      console.error("❌ Horizon fallback also failed:", horizonError);
      const originalMessage = error instanceof Error ? error.message : 'Unknown error submitting transaction';
      const horizonMessage = horizonError instanceof Error ? horizonError.message : 'Unknown Horizon error';
      throw new SorobanError(`Transaction submission failed via both Soroban (${originalMessage}) and Horizon (${horizonMessage})`);
    }
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
      const result = await sorobanRpc("simulateTransaction", [{ transaction: txXdr }]);
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
    console.log('Submitting transaction XDR:', signedTxXdr.substring(0, 100) + '...');
    
    // Validate transaction XDR before submission
    const envelope = xdr.TransactionEnvelope.fromXDR(signedTxXdr, 'base64');
    console.log('Transaction envelope type:', envelope.switch());
    
    // Check signatures property for all envelope types
    let signatures: any[] = [];
    if (envelope.switch() === xdr.EnvelopeType.envelopeTypeTxV0()) {
      signatures = envelope.v0().signatures();
    } else if (envelope.switch() === xdr.EnvelopeType.envelopeTypeTx()) {
      signatures = envelope.v1().signatures();
    } else if (envelope.switch() === xdr.EnvelopeType.envelopeTypeTxFeeBump()) {
      signatures = envelope.feeBump().signatures();
    }
    
    console.log('Transaction signatures count:', signatures.length);
    if (!signatures.length) {
      throw new TransactionError("Transaction has no signatures");
    }

    // Submit to Soroban RPC - correct format with transaction object
    const result = await sorobanRpc("sendTransaction", [{ transaction: signedTxXdr }]);
    console.log('Soroban sendTransaction result:', result);
    
    if (!result) {
      throw new TransactionError("No response from sendTransaction");
    }
    
    // Handle different response formats
    if (typeof result === 'string') {
      // Simple hash response
      return { hash: result };
    } else if (result.hash) {
      // Object with hash property
      return result;
    } else if (result.status) {
      // Response with status
      return result;
    } else {
      console.error('Unexpected sendTransaction response format:', result);
      throw new TransactionError(`Unexpected response format: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    console.error('Transaction submission error:', error);
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
      networkPassphrase: TESTNET_PASSPHRASE,
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
      networkPassphrase: TESTNET_PASSPHRASE,
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
      networkPassphrase: TESTNET_PASSPHRASE,
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

export async function buildPurchaseTransaction(
  buyerAddress: string,
  assetId: string,
  price: number
): Promise<string> {
  if (!isBrowser) throw new Error("Must be run in browser")
  
  // Validate input parameters
  if (!buyerAddress || typeof buyerAddress !== 'string') {
    throw new Error("Invalid buyer address: must be a valid Stellar account ID")
  }
  
  if (!assetId || typeof assetId !== 'string') {
    throw new Error("Invalid asset ID")
  }
  
  if (!price || typeof price !== 'number' || price <= 0) {
    throw new Error("Invalid price: must be a positive number")
  }
  
  // Check if we should create real transactions
  if (isDevelopment) {
    console.warn("🔧 Development mode: Creating simple mock transaction for purchase")
    console.log('Transaction will be mocked because:', {
      forceRealTransactions,
      isDevelopment,
      NODE_ENV: process.env.NODE_ENV,
      contractIdIsPlaceholder: contractId === "YOUR_CONTRACT_ID"
    })
    
    try {
      // Validate the buyer address format for Stellar using already imported Keypair
      try {
        // This will throw if the address is not a valid Stellar account ID
        Keypair.fromPublicKey(buyerAddress)
      } catch (validationError: any) {
        console.error('Invalid Stellar address format:', buyerAddress)
        throw new Error(`Invalid Stellar account ID format: ${buyerAddress}`)
      }
      
      // Return a simple mock XDR for development testing
      // This is a valid XDR format that can be used for testing
      console.log(`Mock purchase transaction for asset ${assetId} at price ${price} by ${buyerAddress}`)
       // Create a minimal payment transaction
      const account = new Account(buyerAddress, '0')
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: TESTNET_PASSPHRASE,
      })
      .addOperation(Operation.payment({
        destination: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
        asset: Asset.native(),
        amount: price.toString(),
      }))
      .setTimeout(300)
      .build()
      
      return transaction.toXDR()
    } catch (error: any) {
      console.error('Error creating test transaction:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        buyerAddress,
        assetId,
        price
      })
      throw new Error(`Failed to create test transaction: ${error.message}`)
    }
  }
  
  // Creating REAL transaction
  console.log("🚀 Creating REAL purchase transaction!", {
    buyerAddress: buyerAddress.substring(0, 10) + '...',
    assetId,
    price,
    contractId: contractId.substring(0, 10) + '...',
    rpcUrl
  })
  
  try {
    // Validate the buyer address format for Stellar before making RPC call
    const { Keypair } = await import('@stellar/stellar-sdk')
    try {
      Keypair.fromPublicKey(buyerAddress)
    } catch (validationError) {
      console.error('Invalid Stellar address format:', buyerAddress)
      throw new Error(`Invalid Stellar account ID format: ${buyerAddress}`)
    }
    
    console.log("🔍 Fetching account from Stellar network...")
    const client = getClient()
    let sourceAccount
    try {
      sourceAccount = await client.getAccount(buyerAddress)
      console.log("✅ Account found on network:", {
        accountId: sourceAccount.accountId(),
        sequence: sourceAccount.sequenceNumber()
      })
    } catch (accountError: any) {
      console.error("❌ Failed to fetch account from network:", accountError)
      
      // Check if account doesn't exist
      if (accountError.message?.includes('does not exist') || accountError.message?.includes('account_not_found')) {
        throw new Error(`Account ${buyerAddress.substring(0, 10)}... does not exist on Testnet. Please fund it first at https://friendbot.stellar.org`)
      }
      throw new Error(`Failed to fetch account: ${accountError.message}`)
    }
    
    // Create contract instance
    console.log("🔗 Creating contract instance...")
    const contractInstance = new Contract(contractId)
    
    // Convert parameters to Soroban values
    const assetIdVal = nativeToScVal(assetId)
    const buyerAddr = nativeToScVal(Address.fromString(buyerAddress))
    const priceVal = nativeToScVal(price, { type: "u64" })
    
    // Build transaction to call purchase_data
    console.log("🏗️ Building transaction with contract call...")
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: TESTNET_PASSPHRASE,
    })
      .addOperation(contractInstance.call("purchase_data", assetIdVal, buyerAddr, priceVal))
      .setTimeout(30)
      .build()

    console.log("✅ Transaction built successfully!")
    const txXdr = transaction.toXDR()
    console.log("📄 Transaction XDR length:", txXdr.length)
    
    return txXdr
  } catch (e: any) {
    console.error("❌ Error building purchase transaction:", e)
    console.error("Error details:", {
      name: e.name,
      message: e.message,
      stack: e.stack?.split('\n').slice(0, 5)
    })
    
    // Provide more helpful error messages
    if (e.message?.includes('account does not exist')) {
      throw new Error(`Account ${buyerAddress.substring(0, 10)}... does not exist on Testnet. Please fund it first at https://friendbot.stellar.org`)
    } else if (e.message?.includes('contract') && e.message?.includes('not found')) {
      throw new Error(`Contract ${contractId.substring(0, 10)}... not found on Testnet. Contract may not be deployed.`)
    } else if (e.message?.includes('network')) {
      throw new Error(`Network error: ${e.message}. Please check your internet connection and try again.`)
    }
    
    throw e
  }
}

// Network diagnostics helper
export async function diagnosticsNetworkHealth(): Promise<{
  rpcUrl: string;
  isHealthy: boolean;
  latestLedger?: number;
  error?: string;
}> {
  try {
    const health = await sorobanRpc("getHealth", []);
    return {
      rpcUrl,
      isHealthy: health.status === "healthy",
      latestLedger: health.latestLedger,
    };
  } catch (error) {
    return {
      rpcUrl,
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}