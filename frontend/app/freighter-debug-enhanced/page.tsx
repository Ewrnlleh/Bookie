"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Chrome, 
  RefreshCw,
  ExternalLink,
  Info,
  Zap
} from "lucide-react"

interface FreighterInfo {
  isInstalled: boolean
  isConnected: boolean
  address?: string
  networkDetails?: any
  version?: string
  availableMethods: string[]
}

export default function FreighterDiagnosticPage() {
  const { toast } = useToast()
  const [freighterInfo, setFreighterInfo] = useState<FreighterInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  useEffect(() => {
    checkFreighterStatus()
  }, [])

  const checkFreighterStatus = async () => {
    setLoading(true)
    try {
      const info: FreighterInfo = {
        isInstalled: false,
        isConnected: false,
        availableMethods: []
      }

      // Check if Freighter is installed
      if (typeof window !== 'undefined' && window.freighterApi) {
        info.isInstalled = true
        info.availableMethods = Object.keys(window.freighterApi)
        
        try {
          // Test isConnected method
          info.isConnected = await window.freighterApi.isConnected()
          
          // Try to get address
          if (info.isConnected) {
            const addressResult = await window.freighterApi.getAddress()
            info.address = typeof addressResult === 'string' ? addressResult : addressResult?.address
            
            // Get network details
            try {
              info.networkDetails = await window.freighterApi.getNetworkDetails()
            } catch (e) {
              console.log("Could not get network details:", e)
            }
          }
        } catch (error) {
          console.error("Error checking Freighter status:", error)
        }
      }

      setFreighterInfo(info)
    } catch (error) {
      console.error("Failed to check Freighter status:", error)
      toast({
        title: "Diagnostic Failed",
        description: "Could not complete Freighter diagnostic",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testFreighterMethod = async (methodName: string) => {
    if (!window.freighterApi || !freighterInfo?.isInstalled) {
      toast({
        title: "Freighter Not Available",
        description: "Freighter extension is not installed",
        variant: "destructive",
      })
      return
    }

    try {
      setTestResults(prev => ({ ...prev, [methodName]: 'testing' }))
      
      let result: any
      const freighter = window.freighterApi
      
      switch (methodName) {
        case 'isConnected':
          result = await freighter.isConnected()
          break
        case 'getAddress':
          result = await freighter.getAddress()
          break
        case 'getNetworkDetails':
          result = await freighter.getNetworkDetails()
          break
        default:
          result = `Method ${methodName} not implemented in test`
      }
      
      setTestResults(prev => ({ 
        ...prev, 
        [methodName]: { status: 'success', result: result }
      }))
      
      toast({
        title: "Test Successful",
        description: `${methodName} executed successfully`,
      })
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [methodName]: { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
      }))
      
      toast({
        title: "Test Failed",
        description: `${methodName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const connectToFreighter = async () => {
    if (!freighterInfo?.isInstalled || !window.freighterApi) {
      toast({
        title: "Freighter Not Available",
        description: "Freighter extension is not installed or available",
        variant: "destructive",
      })
      return
    }

    try {
      const addressResult = await window.freighterApi.getAddress()
      const address = typeof addressResult === 'string' ? addressResult : addressResult?.address
      
      if (address) {
        toast({
          title: "Connection Successful",
          description: `Connected to: ${address.substring(0, 8)}...${address.substring(address.length - 8)}`,
        })
        await checkFreighterStatus() // Refresh status
      } else {
        throw new Error("No address received from Freighter")
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Freighter Diagnostic</h1>
          <p className="text-gray-600">
            Debug and test Freighter wallet extension integration
          </p>
        </div>

        {/* Freighter Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Chrome className="h-5 w-5" />
              Freighter Status
              <Button
                variant="ghost"
                size="sm"
                onClick={checkFreighterStatus}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {freighterInfo ? (
              <>
                {/* Installation Status */}
                <div className="flex items-center gap-2">
                  {freighterInfo.isInstalled ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Freighter Extension Installed</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700 font-medium">Freighter Extension Not Found</span>
                    </>
                  )}
                </div>

                {/* Connection Status */}
                {freighterInfo.isInstalled && (
                  <div className="flex items-center gap-2">
                    {freighterInfo.isConnected ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-green-700 font-medium">Connected to Freighter</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <span className="text-yellow-700 font-medium">Not Connected</span>
                      </>
                    )}
                  </div>
                )}

                {/* Address */}
                {freighterInfo.address && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Wallet Address:</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{freighterInfo.address}</p>
                  </div>
                )}

                {/* Network Details */}
                {freighterInfo.networkDetails && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Network Details:</p>
                    <pre className="text-xs text-gray-600 mt-1 overflow-x-auto">
                      {JSON.stringify(freighterInfo.networkDetails, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Available Methods */}
                {freighterInfo.availableMethods.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Available API Methods:</p>
                    <div className="flex flex-wrap gap-2">
                      {freighterInfo.availableMethods.map((method) => (
                        <Badge key={method} variant="secondary">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Checking Freighter status...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button
                onClick={connectToFreighter}
                disabled={!freighterInfo?.isInstalled}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Connect to Freighter
              </Button>
              
              {!freighterInfo?.isInstalled && (
                <Button
                  variant="outline"
                  onClick={() => window.open('https://freighter.app/', '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Install Freighter
                </Button>
              )}
            </div>

            {!freighterInfo?.isInstalled && (
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Freighter Not Installed</p>
                    <p>
                      Freighter is a browser extension wallet for Stellar. Install it from the Chrome Web Store 
                      or Firefox Add-ons to use Stellar wallet features.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Method Testing */}
        {freighterInfo?.isInstalled && (
          <Card>
            <CardHeader>
              <CardTitle>API Method Testing</CardTitle>
              <CardDescription>
                Test individual Freighter API methods to debug connection issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {['isConnected', 'getAddress', 'getNetworkDetails'].map((method) => (
                  <div key={method} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{method}()</p>
                      {testResults[method] && (
                        <div className="mt-1">
                          {testResults[method] === 'testing' ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Testing...
                            </div>
                          ) : testResults[method].status === 'success' ? (
                            <div className="text-sm">
                              <span className="text-green-600 font-medium">✓ Success:</span>
                              <pre className="text-xs mt-1 p-2 bg-green-50 rounded overflow-x-auto">
                                {JSON.stringify(testResults[method].result, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <span className="text-red-600 font-medium">✗ Error:</span>
                              <p className="text-red-600 text-xs mt-1">{testResults[method].error}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testFreighterMethod(method)}
                      disabled={testResults[method] === 'testing'}
                    >
                      Test
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
