"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FreighterSignTestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testFreighterSigning = async () => {
    setLoading(true)
    const testResults: any = {}
    
    try {
      // Import Freighter
      const freighterModule = await import('@stellar/freighter-api')
      const freighter = freighterModule.default || freighterModule
      
      testResults.imported = true
      
      // Check if allowed
      try {
        const allowed = await freighter.isAllowed()
        testResults.isAllowed = allowed.isAllowed || allowed
        
        if (!testResults.isAllowed) {
          testResults.error = "Freighter access not allowed. Please connect your wallet first."
          setResults(testResults)
          setLoading(false)
          return
        }
      } catch (e: any) {
        testResults.isAllowedError = e.message
        setResults(testResults)
        setLoading(false)
        return
      }
      
      // Get address
      try {
        const addressResult = await freighter.getAddress()
        testResults.address = addressResult.address || addressResult
      } catch (e: any) {
        testResults.addressError = e.message
      }
      
      // Get network details
      try {
        const networkDetails = await freighter.getNetworkDetails()
        testResults.networkPassphrase = networkDetails.networkPassphrase
        testResults.network = networkDetails.network
      } catch (e: any) {
        testResults.networkError = e.message
      }
      
      // Test with simple transaction XDR (valid for Futurenet)
      const testTxXdr = "AAAAAgAAAACHPYwB3Oej2jJM7fNeji0DQxeywPI8BRXA/tgJTcDsrgAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAABoV2Y2AAAAAAAAAAEAAAAAAAAAAQAAAAC/xnpDymHoGznRQJrAJKcP35jR+LUHkQ80NRhkxqYsWQAAAAAAAAAABfXhAAAAAAAAAAAA"
      
      try {
        console.log('Testing Freighter signTransaction with XDR:', testTxXdr)
        console.log('Network passphrase:', "Test SDF Network ; September 2015")
        
        const signResult = await freighter.signTransaction(testTxXdr, {
          networkPassphrase: "Test SDF Network ; September 2015"
        })
        
        testResults.signResult = signResult
        testResults.signResultType = typeof signResult
        testResults.signResultKeys = signResult && typeof signResult === 'object' ? Object.keys(signResult) : []
        testResults.signSuccess = true
        
        console.log('Sign result:', signResult)
        
      } catch (signError: any) {
        testResults.signError = signError.message
        testResults.signSuccess = false
        console.error('Sign error:', signError)
      }
      
    } catch (e: any) {
      testResults.importError = e.message
    }
    
    setResults(testResults)
    setLoading(false)
  }

  const requestAccess = async () => {
    try {
      const freighterModule = await import('@stellar/freighter-api')
      const freighter = freighterModule.default || freighterModule
      await freighter.requestAccess()
      // Refresh the test after requesting access
      setTimeout(() => testFreighterSigning(), 1000)
    } catch (e: any) {
      setResults({ ...results, requestAccessError: e.message })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Freighter Sign Transaction Test</h1>
          <p className="text-muted-foreground mt-2">
            Direct test of Freighter's signTransaction method
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Freighter Signing Test</CardTitle>
            <CardDescription>
              Test transaction signing directly with Freighter extension
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testFreighterSigning} disabled={loading}>
                {loading ? 'Testing...' : 'Test Freighter Signing'}
              </Button>
              <Button onClick={requestAccess} variant="outline">
                Request Access
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Results:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Imported:</strong> <Badge variant={results.imported ? "default" : "destructive"}>{results.imported ? "Yes" : "No"}</Badge>
                </div>
                <div>
                  <strong>Allowed:</strong> <Badge variant={results.isAllowed ? "default" : "destructive"}>{String(results.isAllowed)}</Badge>
                </div>
                <div>
                  <strong>Sign Success:</strong> <Badge variant={results.signSuccess ? "default" : "destructive"}>{String(results.signSuccess)}</Badge>
                </div>
                <div>
                  <strong>Network:</strong> {results.network || "Unknown"}
                </div>
              </div>
              
              {results.address && (
                <div>
                  <strong>Address:</strong>
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all mt-1">
                    {results.address}
                  </div>
                </div>
              )}
              
              {results.networkPassphrase && (
                <div>
                  <strong>Network Passphrase:</strong>
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all mt-1">
                    {results.networkPassphrase}
                  </div>
                </div>
              )}
              
              {results.signResult && (
                <div>
                  <strong>Sign Result:</strong>
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all mt-1">
                    Type: {results.signResultType}<br/>
                    Keys: {results.signResultKeys.join(', ')}<br/>
                    Data: {JSON.stringify(results.signResult)}
                  </div>
                </div>
              )}
              
              {Object.keys(results).filter(key => key.endsWith('Error')).map(errorKey => (
                <div key={errorKey} className="text-red-600">
                  <strong>{errorKey}:</strong> {results[errorKey]}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded">
              <h4 className="font-medium mb-2">Raw Results:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
