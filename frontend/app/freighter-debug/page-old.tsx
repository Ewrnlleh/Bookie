"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function FreighterDebugPage() {
  const [freighterStatus, setFreighterStatus] = useState<{
    installed: boolean
    available: boolean
    functions: string[]
    error?: string
  }>({
    installed: false,
    available: false,
    functions: []
  })

  const [testResults, setTestResults] = useState<{
    isConnected?: boolean
    isAllowed?: boolean
    address?: string
    networkPassphrase?: string
  }>({})

  const [isLoading, setIsLoading] = useState(false)

  const checkFreighter = async () => {
    try {
      // Check if extension is installed
      if (typeof window === 'undefined') {
        setFreighterStatus({
          installed: false,
          available: false,
          functions: [],
          error: 'Running on server side'
        })
        return
      }

      // Try to import the module dynamically
      let freighterApi: any = null
      try {
        const freighterModule = await import('@stellar/freighter-api')
        freighterApi = freighterModule.default || freighterModule
        
        console.log('Freighter module loaded:', freighterApi)
        console.log('Available functions:', Object.keys(freighterApi))
        
        setFreighterStatus({
          installed: true,
          available: !!freighterApi,
          functions: freighterApi ? Object.keys(freighterApi) : [],
        })

        // Test actual functions
        if (freighterApi) {
          try {
            // Test isConnected function first
            const isConnected = await freighterApi.isConnected()
            console.log('Freighter isConnected:', isConnected)
            
            const isAllowed = await freighterApi.isAllowed()
            console.log('Freighter isAllowed:', isAllowed)
            
            if (isAllowed) {
              const address = await freighterApi.getAddress()
              console.log('Freighter address:', address)
              
              setFreighterStatus(prev => ({
                ...prev,
                error: undefined
              }))
            } else {
              console.log('Freighter access not allowed - need to request access')
              setFreighterStatus(prev => ({
                ...prev,
                error: 'Access not allowed - click "Request Access" button'
              }))
            }
          } catch (funcError) {
            console.error('Freighter function test error:', funcError)
            setFreighterStatus(prev => ({
              ...prev,
              error: `Function test failed: ${funcError instanceof Error ? funcError.message : String(funcError)}`
            }))
          }
        }
      } catch (requireError) {
        console.error('Freighter import error:', requireError)
        setFreighterStatus({
          installed: false,
          available: false,
          functions: [],
          error: `Import error: ${requireError instanceof Error ? requireError.message : String(requireError)}`
        })
      }
    } catch (error) {
      setFreighterStatus({
        installed: false,
        available: false,
        functions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const testFreighterFunction = async (functionName: string) => {
    setIsLoading(true)
    try {
      const freighterModule = await import('@stellar/freighter-api')
      const freighterApi = freighterModule.default || freighterModule

      switch (functionName) {
        case 'isConnected':
          const connected = await freighterApi.isConnected()
          setTestResults(prev => ({ ...prev, isConnected: connected.isConnected || false }))
          break
        case 'isAllowed':
          const allowed = await freighterApi.isAllowed()
          setTestResults(prev => ({ ...prev, isAllowed: allowed.isAllowed || false }))
          break
        case 'requestAccess':
          await freighterApi.requestAccess()
          // Re-check isAllowed after requesting access
          const newAllowed = await freighterApi.isAllowed()
          setTestResults(prev => ({ ...prev, isAllowed: newAllowed.isAllowed || false }))
          break
        case 'getAddress':
          const userAddress = await freighterApi.getAddress()
          setTestResults(prev => ({ ...prev, address: userAddress.address || '' }))
          break
        case 'getNetworkDetails':
          const networkDetails = await freighterApi.getNetworkDetails()
          setTestResults(prev => ({ ...prev, networkPassphrase: networkDetails.networkPassphrase }))
          break
      }
    } catch (error) {
      console.error(`Test ${functionName} failed:`, error)
      setFreighterStatus(prev => ({
        ...prev,
        error: `${functionName} failed: ${error instanceof Error ? error.message : String(error)}`
      }))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    checkFreighter()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Freighter Debug Panel</h1>
          <p className="text-muted-foreground mt-2">
            Diagnostic information for Freighter wallet integration
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Freighter Extension Status
              <Button
                variant="outline"
                size="sm"
                onClick={checkFreighter}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Check if Freighter extension is installed and working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {freighterStatus.installed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">Extension Installed</span>
                <Badge variant={freighterStatus.installed ? "default" : "destructive"}>
                  {freighterStatus.installed ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {freighterStatus.available ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">API Available</span>
                <Badge variant={freighterStatus.available ? "default" : "destructive"}>
                  {freighterStatus.available ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {freighterStatus.error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {freighterStatus.error}
                </AlertDescription>
              </Alert>
            )}

            {freighterStatus.functions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Available Functions:</h4>
                <div className="flex flex-wrap gap-1">
                  {freighterStatus.functions.map((func) => (
                    <Badge key={func} variant="outline">
                      {func}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Installation Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">If Freighter is not installed:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Visit <a href="https://freighter.app/" target="_blank" rel="noopener" className="text-blue-600 underline">freighter.app</a></li>
                <li>Click "Add to Chrome" or "Add to Firefox"</li>
                <li>Follow the installation instructions</li>
                <li>Create a new wallet or import an existing one</li>
                <li>Refresh this page</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">If Freighter is installed but not working:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Make sure the extension is enabled in your browser</li>
                <li>Check if you need to allow this website in Freighter settings</li>
                <li>Try refreshing the page</li>
                <li>Check browser console for errors (F12 → Console)</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>User Agent:</strong>
                <div className="mt-1 p-2 bg-muted rounded text-xs break-all">
                  {typeof window !== 'undefined' ? navigator.userAgent : 'Server side'}
                </div>
              </div>
              <div>
                <strong>URL:</strong>
                <div className="mt-1 p-2 bg-muted rounded text-xs break-all">
                  {typeof window !== 'undefined' ? window.location.href : 'Server side'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
