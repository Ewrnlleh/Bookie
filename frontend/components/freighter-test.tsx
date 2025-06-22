"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FreighterTest() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [freighterApi, setFreighterApi] = useState<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadFreighterApi = async () => {
      try {
        const api = await import('@stellar/freighter-api')
        setFreighterApi(api)
      } catch (error) {
        console.error('Failed to load Freighter API:', error)
      }
    }

    loadFreighterApi()
  }, [])

  const runTests = async () => {
    if (!freighterApi) {
      setTestResults({ error: "Freighter API not loaded" })
      return
    }

    setLoading(true)
    const results: any = {}

    try {
      // Test isConnected
      const connected = await freighterApi.isConnected()
      results.isConnected = connected

      // Test isAllowed  
      const allowed = await freighterApi.isAllowed()
      results.isAllowed = allowed

      // Test getAddress (if allowed)
      if (allowed.isAllowed) {
        const address = await freighterApi.getAddress()
        results.address = address
      }

      // Test getNetwork
      const network = await freighterApi.getNetwork()
      results.network = network

      // Test getNetworkDetails
      const networkDetails = await freighterApi.getNetworkDetails()
      results.networkDetails = networkDetails

    } catch (error) {
      results.error = error instanceof Error ? error.message : "Unknown error"
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Freighter API Test</CardTitle>
        <CardDescription>
          Test the Freighter API integration to verify it's working correctly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={loading}>
          {loading ? "Running Tests..." : "Run Freighter API Tests"}
        </Button>

        {Object.keys(testResults).length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
