'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function TransactionTestPage() {
  const { isConnected, publicKey, connect, signAndSubmitTransaction } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)
  const { toast } = useToast()

  const testSimpleTransaction = async () => {
    if (!isConnected || !publicKey) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('🔧 Testing simple transaction...')
      
      // Import the buildPurchaseTransaction function
      const { buildPurchaseTransaction } = await import('@/services/soroban')
      
      // Create a test transaction
      const txXdr = await buildPurchaseTransaction(
        publicKey,
        'test-asset-id',
        1 // 1 XLM
      )
      
      console.log('Transaction XDR created:', txXdr.substring(0, 100) + '...')
      
      // Sign and submit
      const result = await signAndSubmitTransaction(txXdr)
      setLastTxHash(result.hash)
      
      toast({
        title: "Transaction Submitted",
        description: `Transaction hash: ${result.hash}`,
      })
      
    } catch (error) {
      console.error('Transaction test failed:', error)
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Transaction Test</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Public Key:</strong> {publicKey || 'None'}</div>
            </div>
            {!isConnected && (
              <Button onClick={() => connect('freighter')} className="mt-4">
                Connect Freighter
              </Button>
            )}
          </CardContent>
        </Card>

        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  This will create a purchase transaction and attempt to sign it with Freighter.
                  Check the browser console for detailed logs about whether it's creating a real or mock transaction.
                </p>
                
                <Button 
                  onClick={testSimpleTransaction} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Testing Transaction...' : 'Test Transaction'}
                </Button>
                
                {lastTxHash && (
                  <div className="mt-4 p-4 bg-green-50 rounded">
                    <h3 className="font-semibold text-green-800">Last Transaction:</h3>
                    <p className="text-sm text-green-700 break-all">{lastTxHash}</p>
                    {lastTxHash.startsWith('dev_') ? (
                      <p className="text-sm text-yellow-600 mt-2">⚠️ This is a mock transaction (development mode)</p>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">✅ This is a real transaction!</p>
                        <a 
                          href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View on Stellar Expert →
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div><strong>FORCE_REAL_TRANSACTIONS:</strong> {process.env.NEXT_PUBLIC_FORCE_REAL_TRANSACTIONS}</div>
              <div><strong>CONTRACT_ID:</strong> {process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID?.substring(0, 20)}...</div>
              <div><strong>RPC_URL:</strong> {process.env.NEXT_PUBLIC_SOROBAN_RPC_URL}</div>
              <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
