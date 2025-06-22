'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function AccountSetupPage() {
  const { isConnected, publicKey, connect } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fundAccount = async () => {
    if (!publicKey) {
      toast({
        title: "No Account",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('🪙 Funding account on Testnet:', publicKey)
      
      const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`)
      const result = await response.text()
      
      if (response.ok) {
        toast({
          title: "Account Funded!",
          description: `Successfully funded ${publicKey.substring(0, 10)}... on Testnet`,
        })
        console.log('✅ Account funded successfully:', result)
      } else {
        throw new Error(`Friendbot error: ${result}`)
      }
    } catch (error) {
      console.error('❌ Failed to fund account:', error)
      toast({
        title: "Funding Failed",
        description: error instanceof Error ? error.message : "Failed to fund account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkAccountBalance = async () => {
    if (!publicKey) return

    try {
      console.log('🔍 Checking account balance...')
      const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`)
      
      if (response.ok) {
        const accountData = await response.json()
        const xlmBalance = accountData.balances.find((b: any) => b.asset_type === 'native')
        
        toast({
          title: "Account Balance",
          description: `XLM: ${xlmBalance ? xlmBalance.balance : '0'}`,
        })
        
        console.log('💰 Account data:', accountData)
      } else {
        throw new Error('Account not found')
      }
    } catch (error) {
      console.error('❌ Failed to check balance:', error)
      toast({
        title: "Balance Check Failed",
        description: error instanceof Error ? error.message : "Failed to check balance",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Setup</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Account:</strong> {publicKey || 'None'}</div>
              
              {!isConnected && (
                <Button onClick={() => connect('freighter')} className="w-full">
                  Connect Freighter Wallet
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isConnected && publicKey && (
          <Card>
            <CardHeader>
              <CardTitle>Testnet Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  For testing transactions, your account needs to be funded on Stellar Testnet.
                  This will give you free test XLM to use for transactions.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={fundAccount} 
                    disabled={isLoading}
                    variant="default"
                    className="w-full"
                  >
                    {isLoading ? 'Funding Account...' : 'Fund Account (Testnet)'}
                  </Button>
                  
                  <Button 
                    onClick={checkAccountBalance}
                    variant="outline"
                    className="w-full"
                  >
                    Check Balance
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div><strong>Account:</strong> {publicKey}</div>
                  <div><strong>Network:</strong> Stellar Testnet</div>
                  <div><strong>Friendbot:</strong> https://friendbot.stellar.org</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div>1. ✅ Connect your Freighter wallet</div>
              <div>2. 🪙 Fund your account on Testnet</div>
              <div>3. 🔍 Check your balance</div>
              <div>4. 🚀 Go to <a href="/transaction-test" className="text-blue-600 hover:underline">Transaction Test</a> to test real transactions</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
