"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface DebugStatus {
  installed: boolean
  available: boolean  
  functions: string[]
  error: string
  isConnected: boolean
  isAllowed: boolean
  address: string
  networkPassphrase: string
}

export default function FreighterDebugPage() {
  const [status, setStatus] = useState<DebugStatus>({
    installed: false,
    available: false,
    functions: [],
    error: '',
    isConnected: false,
    isAllowed: false,
    address: '',
    networkPassphrase: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  const updateStatus = (updates: Partial<DebugStatus>) => {
    setStatus(prev => ({ ...prev, ...updates }))
  }

  const checkFreighter = async () => {
    try {
      if (typeof window === 'undefined') {
        updateStatus({ error: 'Running on server side' })
        return
      }

      const freighterModule = await import('@stellar/freighter-api')
      const freighterApi = freighterModule.default || freighterModule
      
      console.log('Freighter module loaded:', freighterApi)
      console.log('Available functions:', Object.keys(freighterApi))
      
      updateStatus({
        installed: true,
        available: !!freighterApi,
        functions: freighterApi ? Object.keys(freighterApi) : [],
        error: ''
      })

      if (freighterApi) {
        try {
          const connectedResult = await freighterApi.isConnected()
          const allowedResult = await freighterApi.isAllowed()
          
          updateStatus({
            isConnected: connectedResult.isConnected || false,
            isAllowed: allowedResult.isAllowed || false
          })

          if (allowedResult) {
            const addressResult = await freighterApi.getAddress()
            const networkDetails = await freighterApi.getNetworkDetails()
            
            updateStatus({
              address: addressResult.address || '',
              networkPassphrase: networkDetails.networkPassphrase
            })
          }
        } catch (funcError) {
          console.error('Freighter function test error:', funcError)
          updateStatus({
            error: `Function test failed: ${funcError instanceof Error ? funcError.message : String(funcError)}`
          })
        }
      }
    } catch (requireError) {
      console.error('Freighter import error:', requireError)
      updateStatus({
        installed: false,
        available: false,
        functions: [],
        error: `Import error: ${requireError instanceof Error ? requireError.message : String(requireError)}`
      })
    }
  }

  const testFunction = async (functionName: string) => {
    setIsLoading(true)
    try {
      const freighterModule = await import('@stellar/freighter-api')
      const freighterApi = freighterModule.default || freighterModule

      switch (functionName) {
        case 'requestAccess':
          await freighterApi.requestAccess()
          await checkFreighter() // Refresh status
          break
        case 'refresh':
          await checkFreighter()
          break
      }
    } catch (error) {
      console.error(`Test ${functionName} failed:`, error)
      updateStatus({
        error: `${functionName} failed: ${error instanceof Error ? error.message : String(error)}`
      })
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
                onClick={() => testFunction('refresh')}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <CardDescription>
              Check if Freighter extension is installed and working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {status.installed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">Extension Installed</span>
                <Badge variant={status.installed ? "default" : "destructive"}>
                  {status.installed ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {status.available ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">API Available</span>
                <Badge variant={status.available ? "default" : "destructive"}>
                  {status.available ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {status.isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">Connected</span>
                <Badge variant={status.isConnected ? "default" : "destructive"}>
                  {status.isConnected ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {status.isAllowed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">Access Allowed</span>
                <Badge variant={status.isAllowed ? "default" : "destructive"}>
                  {status.isAllowed ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {status.error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {status.error}
                </AlertDescription>
              </Alert>
            )}

            {!status.isAllowed && status.available && (
              <div className="flex gap-2">
                <Button
                  onClick={() => testFunction('requestAccess')}
                  disabled={isLoading}
                >
                  Request Access
                </Button>
              </div>
            )}

            {status.address && (
              <div className="space-y-2">
                <h4 className="font-medium">Wallet Address:</h4>
                <div className="p-2 bg-muted rounded text-sm font-mono break-all">
                  {status.address}
                </div>
              </div>
            )}

            {status.networkPassphrase && (
              <div className="space-y-2">
                <h4 className="font-medium">Network:</h4>
                <div className="p-2 bg-muted rounded text-sm">
                  {status.networkPassphrase}
                </div>
              </div>
            )}

            {status.functions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Available Functions:</h4>
                <div className="flex flex-wrap gap-1">
                  {status.functions.map((func) => (
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
                <li>Click "Request Access" button above</li>
                <li>Allow this website in Freighter popup</li>
                <li>Check browser console for errors (F12 → Console)</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
