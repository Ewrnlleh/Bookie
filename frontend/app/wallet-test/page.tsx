"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WalletConnect } from "@/components/wallet-connect"
import { useWallet } from "@/lib/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { Copy, ExternalLink, Wallet, Key, Chrome } from "lucide-react"
import { formatPublicKey } from "@/lib/utils"

export default function WalletTestPage() {
  const { isConnected, publicKey, walletType, signAndSubmitTransaction } = useWallet()
  const { toast } = useToast()
  const [isTestingTx, setIsTestingTx] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
  }

  const testTransaction = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsTestingTx(true)
    
    try {
      // Create a valid Futurenet transaction XDR for testing
      const mockTxXdr = "AAAAAgAAAACHPYwB3Oej2jJM7fNeji0DQxeywPI8BRXA/tgJTcDsrgAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAABoV2Y6AAAAAAAAAAEAAAAAAAAAAQAAAAC/xnpDymHoGznRQJrAJKcP35jR+LUHkQ80NRhkxqYsWQAAAAAAAAAABfXhAAAAAAAAAAAA"
      
      const result = await signAndSubmitTransaction(mockTxXdr)
      
      toast({
        title: "Transaction Test Successful!",
        description: `Mock transaction would have hash: ${result.hash}`,
      })
    } catch (error) {
      console.error("Transaction test failed:", error)
      // Don't show error toast, it will be handled by wallet context
    } finally {
      setIsTestingTx(false)
    }
  }

  const createValidTransaction = async (): Promise<string> => {
    try {
      // First, get the connected wallet's address
      const freighterModule = await import('@stellar/freighter-api')
      const freighter = freighterModule.default || freighterModule
      
      const addressResult = await freighter.getAddress()
      const address = typeof addressResult === 'string' ? addressResult : addressResult.address
      console.log('Creating transaction for address:', address)
      
      // Create a simple transaction using the connected account
      const StellarSdk = await import('@stellar/stellar-sdk')
      
      // Create a mock destination account
      const destinationKeypair = StellarSdk.Keypair.random()
      
      // For testing, use a mock account with sequence number 0
      const account = new StellarSdk.Account(address, '0')
      
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: 'Test SDF Network ; September 2015',
      })
      .addOperation(StellarSdk.Operation.payment({
        destination: destinationKeypair.publicKey(),
        asset: StellarSdk.Asset.native(),
        amount: '1',
      }))
      .setTimeout(300)
      .build()
      
      console.log('Created transaction XDR:', transaction.toXDR())
      return transaction.toXDR()
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw error
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Wallet Integration Test</h1>
          <p className="text-muted-foreground mt-2">
            Test Freighter and Passkey wallet connections for the Bookie marketplace
          </p>
        </div>

        {/* Wallet Connection Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
            <CardDescription>
              Connect your wallet to interact with the Stellar blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <WalletConnect />
            </div>
            
            {isConnected && (
              <div className="space-y-4">
                <Separator />
                
                {/* Wallet Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wallet Type</label>
                    <div className="flex items-center gap-2">
                      {walletType === 'freighter' ? (
                        <>
                          <Chrome className="h-4 w-4" />
                          <Badge variant="secondary">Freighter Wallet</Badge>
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4" />
                          <Badge variant="secondary">Passkey Authentication</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Public Key</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-2 py-1 bg-muted rounded text-sm">
                        {formatPublicKey(publicKey)}
                      </code>
                      {publicKey && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(publicKey)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full Public Key */}
                {publicKey && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Public Key</label>
                    <div className="p-3 bg-muted rounded-md break-all text-sm font-mono">
                      {publicKey}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Test Section */}
        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction Testing</CardTitle>
              <CardDescription>
                Test transaction signing with your connected wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testTransaction}
                disabled={isTestingTx}
                className="w-full"
              >
                {isTestingTx ? "Testing Transaction..." : "Test Transaction Signing"}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Note:</strong> This will test the transaction signing flow without actually submitting to the blockchain.</p>
                {walletType === 'freighter' && (
                  <p className="mt-1">
                    <strong>Freighter:</strong> The browser extension will prompt you to sign the transaction.
                  </p>
                )}
                {walletType === 'passkey' && (
                  <p className="mt-1">
                    <strong>Passkey:</strong> Your device will prompt for biometric authentication.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Installation Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Installation Guide</CardTitle>
            <CardDescription>
              How to set up wallets for the Bookie marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Freighter Installation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Chrome className="h-5 w-5" />
                <h3 className="font-semibold">Freighter Wallet</h3>
                <Badge variant="secondary">Recommended</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                The most popular Stellar wallet browser extension with full ecosystem support.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://freighter.app/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Install Freighter
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://docs.freighter.app/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Documentation
                  </a>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Passkey Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <h3 className="font-semibold">Passkey Authentication</h3>
                <Badge variant="outline">Built-in</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Use your device's built-in security features like Touch ID, Face ID, or Windows Hello.
              </p>
              <p className="text-xs text-muted-foreground">
                No installation required. Works on all modern devices with WebAuthn support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
