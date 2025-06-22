"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Wallet, Network, Zap } from "lucide-react"

export default function FreighterDiagnosticPage() {
  const { isConnected, publicKey, connect, signAndSubmitTransaction } = useWallet()
  const { toast } = useToast()
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [testing, setTesting] = useState(false)

  const runDiagnostics = async () => {
    setTesting(true)
    const results: any = {}

    try {
      // Check if Freighter is installed
      const freighter = (window as any).freighter
      results.freighterInstalled = !!freighter
      
      if (freighter) {
        try {
          // Check if user is connected
          results.isConnected = await freighter.isConnected()
          
          // Get network details
          try {
            const networkDetails = await freighter.getNetworkDetails()
            results.networkDetails = networkDetails
            results.onTestnet = networkDetails.networkPassphrase === "Test SDF Network ; September 2015"
          } catch (e) {
            results.networkError = e instanceof Error ? e.message : 'Unknown network error'
          }
          
          // Get public key if connected
          if (results.isConnected) {
            try {
              const publicKey = await freighter.getPublicKey()
              results.publicKey = publicKey
              results.publicKeyValid = publicKey && publicKey.length === 56 && publicKey.startsWith('G')
            } catch (e) {
              results.publicKeyError = e instanceof Error ? e.message : 'Failed to get public key'
            }
          }
          
          // Check account on testnet
          if (results.publicKey) {
            try {
              const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${results.publicKey}`)
              if (response.ok) {
                const accountData = await response.json()
                results.accountExists = true
                results.accountBalance = accountData.balances.find((b: any) => b.asset_type === 'native')?.balance || '0'
              } else {
                results.accountExists = false
                results.accountError = 'Account not found on Testnet'
              }
            } catch (e) {
              results.accountNetworkError = e instanceof Error ? e.message : 'Network error checking account'
            }
          }
          
        } catch (e) {
          results.freighterError = e instanceof Error ? e.message : 'Unknown Freighter error'
        }
      }
      
    } catch (e) {
      results.generalError = e instanceof Error ? e.message : 'Unknown error'
    }

    setDiagnostics(results)
    setTesting(false)
  }

  const testSimpleTransaction = async () => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      })
      return
    }

    try {
      // Create a very simple mock transaction
      const { Account, TransactionBuilder, BASE_FEE, Networks, Operation, Asset } = await import('@stellar/stellar-sdk')
      
      const account = new Account(publicKey!, '0')
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.payment({
          destination: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
          asset: Asset.native(),
          amount: "0.0000001",
        }))
        .setTimeout(300)
        .build()

      const txXdr = transaction.toXDR()
      
      const result = await signAndSubmitTransaction(txXdr)
      
      toast({
        title: "Transaction Test Successful!",
        description: `Mock transaction signed successfully. Hash: ${result.hash}`,
      })
    } catch (error: any) {
      console.error("Transaction test failed:", error)
      toast({
        title: "Transaction Test Failed",
        description: error.message || "Unknown error",
        variant: "destructive"
      })
    }
  }

  const fundAccount = () => {
    if (diagnostics.publicKey) {
      window.open(`https://friendbot.stellar.org/?addr=${diagnostics.publicKey}`, '_blank')
    }
  }

  const StatusIcon = ({ status }: { status: boolean | undefined }) => {
    if (status === undefined) return <AlertCircle className="w-5 h-5 text-yellow-500" />
    return status ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Freighter Diagnostic Tool</h1>
          <p className="text-muted-foreground mt-2">
            Diagnose and troubleshoot Freighter wallet issues
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={runDiagnostics} disabled={testing}>
            {testing && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            <Network className="w-4 h-4 mr-2" />
            Run Diagnostics
          </Button>
          
          {!isConnected ? (
            <Button onClick={() => connect()} variant="outline">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Freighter
            </Button>
          ) : (
            <Button onClick={testSimpleTransaction} variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Test Transaction
            </Button>
          )}
        </div>

        {Object.keys(diagnostics).length > 0 && (
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Freighter Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Freighter Extension Installed</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={diagnostics.freighterInstalled} />
                    <Badge variant={diagnostics.freighterInstalled ? "default" : "destructive"}>
                      {diagnostics.freighterInstalled ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
                
                {diagnostics.freighterInstalled && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Freighter Connected</span>
                      <div className="flex items-center gap-2">
                        <StatusIcon status={diagnostics.isConnected} />
                        <Badge variant={diagnostics.isConnected ? "default" : "secondary"}>
                          {diagnostics.isConnected ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                    
                    {diagnostics.freighterError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">Error: {diagnostics.freighterError}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {diagnostics.freighterInstalled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Network Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diagnostics.networkDetails && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Network</span>
                        <Badge variant={diagnostics.onTestnet ? "default" : "destructive"}>
                          {diagnostics.networkDetails.networkPassphrase?.includes('Test') ? 'Testnet' : 'Other'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Correct Network (Testnet)</span>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={diagnostics.onTestnet} />
                          <Badge variant={diagnostics.onTestnet ? "default" : "destructive"}>
                            {diagnostics.onTestnet ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {diagnostics.networkError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">Network Error: {diagnostics.networkError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {diagnostics.isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diagnostics.publicKey && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Public Key Valid</span>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={diagnostics.publicKeyValid} />
                          <Badge variant={diagnostics.publicKeyValid ? "default" : "destructive"}>
                            {diagnostics.publicKeyValid ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-2 bg-gray-50 rounded font-mono text-sm break-all">
                        {diagnostics.publicKey}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Account Exists on Testnet</span>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={diagnostics.accountExists} />
                          <Badge variant={diagnostics.accountExists ? "default" : "destructive"}>
                            {diagnostics.accountExists ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                      
                      {diagnostics.accountExists && diagnostics.accountBalance && (
                        <div className="flex items-center justify-between">
                          <span>XLM Balance</span>
                          <Badge variant="outline">
                            {parseFloat(diagnostics.accountBalance).toFixed(7)} XLM
                          </Badge>
                        </div>
                      )}
                      
                      {!diagnostics.accountExists && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700 mb-2">
                            Account not funded on Testnet. Fund it to use transactions.
                          </p>
                          <Button onClick={fundAccount} size="sm" variant="outline">
                            Fund Account on Testnet
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                  
                  {diagnostics.publicKeyError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">Public Key Error: {diagnostics.publicKeyError}</p>
                    </div>
                  )}
                  
                  {diagnostics.accountError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">Account Error: {diagnostics.accountError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Tips</CardTitle>
            <CardDescription>Common solutions for Freighter issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">For "Internal Error" messages:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Refresh this page and try again</li>
                <li>• Close and reopen the Freighter extension popup</li>
                <li>• Restart your browser</li>
                <li>• Clear browser cache and cookies</li>
                <li>• Disable and re-enable the Freighter extension</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">For Network issues:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Ensure Freighter is connected to Stellar Testnet</li>
                <li>• Check your internet connection</li>
                <li>• Try switching networks in Freighter and back</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">For Account issues:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Fund your account on Testnet using the button above</li>
                <li>• Ensure you're using the correct account in Freighter</li>
                <li>• Wait a few seconds after funding before trying transactions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
