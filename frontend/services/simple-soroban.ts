const contractId = process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID || "PLACEHOLDER_CONTRACT_ID"
const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org"
const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015"

// Simple transaction service for the basic wallet
export class SimpleTransactionService {
  private rpcServer: any = null

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeRpcServer()
    }
  }

  private async initializeRpcServer() {
    try {
      const { Server } = await import('@stellar/stellar-sdk/rpc')
      this.rpcServer = new Server(rpcUrl)
    } catch (error) {
      console.warn('Failed to initialize RPC server:', error)
    }
  }

  // Build a simple test transaction
  async buildTestTransaction(publicKey: string): Promise<string> {
    try {
      // For now, return a simple placeholder XDR for development
      if (contractId === "PLACEHOLDER_CONTRACT_ID" || typeof window === 'undefined') {
        return "mock_transaction_xdr_" + Date.now()
      }

      // Dynamically import Stellar SDK for client-side only
      const { TransactionBuilder, BASE_FEE, Operation } = await import('@stellar/stellar-sdk')
      
      if (!this.rpcServer) {
        await this.initializeRpcServer()
      }
      
      const account = await this.rpcServer.getAccount(publicKey)
      
      // Create a simple manage data operation as a test (this adds arbitrary data to the account)
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: TESTNET_PASSPHRASE,
      })
        .addOperation(Operation.manageData({
          name: "bookie_test",
          value: "test_purchase_" + Date.now()
        }))
        .setTimeout(180)
        .build()

      return transaction.toXDR()
    } catch (error) {
      console.error("Failed to build test transaction:", error)
      throw new Error("Failed to build transaction")
    }
  }

  // Submit a signed transaction
  async submitTransaction(signedXdr: string): Promise<{ hash: string }> {
    try {
      // For development, just return a mock hash
      if (contractId === "PLACEHOLDER_CONTRACT_ID") {
        return { hash: "mock_transaction_hash_" + Date.now() }
      }

      // Dynamically import Stellar SDK for client-side only
      const { TransactionBuilder } = await import('@stellar/stellar-sdk')
      
      if (!this.rpcServer) {
        await this.initializeRpcServer()
      }

      // Convert the signed XDR back to a Transaction object
      const transaction = TransactionBuilder.fromXDR(signedXdr, TESTNET_PASSPHRASE)
      
      // Submit the transaction object to the network
      const result = await this.rpcServer.sendTransaction(transaction)
      return { hash: result.hash }
    } catch (error) {
      console.error("Failed to submit transaction:", error)
      throw new Error("Failed to submit transaction")
    }
  }
}

// Initialize the service only on client side
let transactionServiceInstance: SimpleTransactionService | null = null

// Mock service for SSR
class MockTransactionService extends SimpleTransactionService {
  constructor() {
    super()
  }

  async buildTestTransaction(): Promise<string> {
    return "mock_transaction_xdr"
  }

  async submitTransaction(): Promise<{ hash: string }> {
    return { hash: "mock_hash" }
  }
}

// Factory function to get the transaction service
export const getTransactionService = (): SimpleTransactionService => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return new MockTransactionService()
  }
  
  if (!transactionServiceInstance) {
    transactionServiceInstance = new SimpleTransactionService()
  }
  return transactionServiceInstance
}

// Export the service instance
export const transactionService = getTransactionService()

// Helper function for wallet integration
export async function signAndSubmitTransaction(
  txXdr: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<{ hash: string }> {
  try {
    const signedXdr = await signTransaction(txXdr)
    const service = getTransactionService()
    return await service.submitTransaction(signedXdr)
  } catch (error) {
    console.error("Transaction signing/submission failed:", error)
    throw error
  }
}
