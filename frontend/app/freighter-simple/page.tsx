"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function FreighterSimpleTest() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testFreighter = async () => {
    setLoading(true)
    const testResults: any = {}
    
    try {
      // Import Freighter
      const freighterModule = await import('@stellar/freighter-api')
      const freighter = freighterModule.default || freighterModule
      
      testResults.imported = true
      testResults.functions = Object.keys(freighter)
      
      // Test isConnected
      try {
        const connected = await freighter.isConnected()
        testResults.isConnected = connected.isConnected || connected // Handle both object and boolean responses
      } catch (e: any) {
        testResults.isConnectedError = e.message
      }
      
      // Test isAllowed
      try {
        const allowed = await freighter.isAllowed()
        testResults.isAllowed = allowed.isAllowed || allowed // Handle both object and boolean responses
      } catch (e: any) {
        testResults.isAllowedError = e.message
      }
      
      // If allowed, try to get address
      if (testResults.isAllowed) {
        try {
          const address = await freighter.getAddress()
          testResults.address = address.address || address // Handle both string and object responses
        } catch (e: any) {
          testResults.addressError = e.message
        }
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
      // Re-test after requesting access
      await testFreighter()
    } catch (e: any) {
      setResults((prev: any) => ({ ...prev, requestAccessError: e.message }))
    }
  }

  useEffect(() => {
    testFreighter()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Simple Freighter Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testFreighter} disabled={loading}>
                {loading ? 'Testing...' : 'Test Freighter'}
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
                  <strong>Connected:</strong> <Badge variant={results.isConnected ? "default" : "destructive"}>{String(results.isConnected)}</Badge>
                </div>
                <div>
                  <strong>Allowed:</strong> <Badge variant={results.isAllowed ? "default" : "destructive"}>{String(results.isAllowed)}</Badge>
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
              
              {results.functions && (
                <div>
                  <strong>Available Functions:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {results.functions.map((func: string) => (
                      <Badge key={func} variant="outline" className="text-xs">
                        {func}
                      </Badge>
                    ))}
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
