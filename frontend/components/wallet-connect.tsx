"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useWallet, type WalletType } from "@/lib/wallet-context"
import { Wallet, Key, Chrome, Smartphone, ExternalLink, RefreshCw } from "lucide-react"
import { formatPublicKey } from "@/lib/utils"

interface WalletConnectProps {
  trigger?: React.ReactNode
  onConnect?: () => void
}

export function WalletConnect({ trigger, onConnect }: WalletConnectProps) {
  const { connect, isConnected, walletType, publicKey, disconnect } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [freighterInstalled, setFreighterInstalled] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Check if Freighter is installed on component mount and periodically
  useEffect(() => {
    const checkFreighter = () => {
      if (typeof window !== 'undefined') {
        // Check multiple ways Freighter might be available
        const hasFreighterApi = !!window.freighterApi
        const hasFreighterInWindow = 'freighterApi' in window
        const hasFreighterMethods = window.freighterApi && 
          typeof window.freighterApi.isConnected === 'function' &&
          typeof window.freighterApi.getAddress === 'function'
        
        const isInstalled = hasFreighterApi && hasFreighterInWindow && hasFreighterMethods
        
        console.log('Freighter detection:', {
          hasFreighterApi,
          hasFreighterInWindow,
          hasFreighterMethods,
          isInstalled,
          freighterApi: window.freighterApi
        })
        
        setFreighterInstalled(!!isInstalled)
      }
    }
    
    checkFreighter()
    
    // Check every 2 seconds in case user installs Freighter
    const interval = setInterval(checkFreighter, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const handleConnect = async (type: WalletType) => {
    // Clear any previous connection errors
    setConnectionError(null)
    
    // Additional check for Freighter installation
    if (type === 'freighter' && !freighterInstalled) {
      // Open Freighter installation page
      window.open('https://freighter.app/', '_blank')
      return
    }

    setIsConnecting(true)
    setSelectedWallet(type)
    
    try {
      await connect(type)
      setDialogOpen(false)
      setConnectionError(null)
      onConnect?.()
    } catch (error) {
      console.error("Connection failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet"
      setConnectionError(errorMessage)
      // Keep the dialog open so user can try again
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const handleRetry = () => {
    setConnectionError(null)
    if (selectedWallet) {
      handleConnect(selectedWallet)
    }
  }

  const handleRefreshFreighter = () => {
    if (typeof window !== 'undefined') {
      // Enhanced Freighter detection
      const hasFreighterApi = !!window.freighterApi
      const hasFreighterInWindow = 'freighterApi' in window
      const hasFreighterMethods = window.freighterApi && 
        typeof window.freighterApi.isConnected === 'function' &&
        typeof window.freighterApi.getAddress === 'function'
      
      const isInstalled = hasFreighterApi && hasFreighterInWindow && hasFreighterMethods
      
      console.log('Manual Freighter refresh:', {
        hasFreighterApi,
        hasFreighterInWindow,
        hasFreighterMethods,
        isInstalled,
        windowKeys: Object.keys(window).filter(key => key.toLowerCase().includes('freighter')),
        freighterApi: window.freighterApi
      })
      
      setFreighterInstalled(!!isInstalled)
      
      // Show feedback to user
      if (isInstalled) {
        setConnectionError(null)
      }
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setDialogOpen(false)
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="flex items-center gap-2 text-xs sm:text-sm px-3 py-1">
          {walletType === 'freighter' ? (
            <Chrome className="h-3 w-3" />
          ) : (
            <Key className="h-3 w-3" />
          )}
          <span className="hidden sm:inline">
            {walletType === 'freighter' ? 'Freighter' : 'Passkey'}
          </span>
        </Badge>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            {trigger || (
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-4 py-2">
                <Wallet className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {publicKey ? formatPublicKey(publicKey) : 'Connected'}
                </span>
                <span className="sm:hidden">
                  {publicKey ? formatPublicKey(publicKey, 4) : 'Connected'}
                </span>
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Wallet Connected</DialogTitle>
              <DialogDescription>
                Your wallet is connected and ready to use.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {walletType === 'freighter' ? (
                    <Chrome className="h-5 w-5" />
                  ) : (
                    <Key className="h-5 w-5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {walletType === 'freighter' ? 'Freighter Wallet' : 'Passkey Authentication'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {publicKey ? formatPublicKey(publicKey) : 'No address available'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
              
              <Button 
                onClick={handleDisconnect} 
                variant="outline" 
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="text-xs sm:text-sm px-4 sm:px-6 py-2">
            <Wallet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose how you'd like to connect to the Bookie marketplace.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Freighter Wallet Option */}
          <Card 
            className={`cursor-pointer transition-colors ${
              freighterInstalled 
                ? `hover:bg-accent ${selectedWallet === 'freighter' ? 'ring-2 ring-primary' : ''}`
                : 'bg-gray-50 cursor-not-allowed opacity-75'
            }`}
            onClick={() => {
              if (freighterInstalled && !isConnecting) {
                handleConnect('freighter')
              } else if (!freighterInstalled) {
                window.open('https://freighter.app/', '_blank')
              }
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Chrome className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-base">Freighter Wallet</CardTitle>
                    <CardDescription className="text-sm">
                      {freighterInstalled 
                        ? "Connect using Freighter browser extension"
                        : "Browser extension not installed - Click to install"
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {freighterInstalled ? (
                    <>
                      <Badge variant="secondary">Recommended</Badge>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </>
                  ) : (
                    <>
                      <Badge variant="outline">Not Installed</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRefreshFreighter()
                        }}
                        className="p-1 h-6 w-6"
                        title="Refresh Freighter detection"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Debug info in console
                          console.log('=== FREIGHTER DEBUG INFO ===')
                          console.log('window.freighterApi:', window.freighterApi)
                          console.log('typeof window.freighterApi:', typeof window.freighterApi)
                          console.log('window has freighterApi:', 'freighterApi' in window)
                          console.log('All window properties containing "freighter":', 
                            Object.keys(window).filter(key => key.toLowerCase().includes('freighter')))
                          console.log('All window properties:', Object.keys(window).slice(0, 20))
                          if (window.freighterApi) {
                            console.log('freighterApi methods:', Object.keys(window.freighterApi))
                          }
                          // Try to call a simple method
                          if (window.freighterApi?.isConnected) {
                            window.freighterApi.isConnected().then(result => {
                              console.log('isConnected result:', result)
                            }).catch(err => {
                              console.log('isConnected error:', err)
                            })
                          }
                          alert('Debug info logged to console. Press F12 to open developer tools.')
                        }}
                        className="p-1 h-6 w-6 text-xs"
                        title="Debug Freighter detection (check console)"
                      >
                        🐛
                      </Button>
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            {selectedWallet === 'freighter' && isConnecting && freighterInstalled && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Connecting to Freighter...
                </div>
              </CardContent>
            )}
            {!freighterInstalled && (
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <ExternalLink className="h-4 w-4" />
                    Click to install Freighter extension
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Click refresh after installing
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Passkey Option */}
          <Card 
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedWallet === 'passkey' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => !isConnecting && handleConnect('passkey')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Key className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-base">Passkey Authentication</CardTitle>
                    <CardDescription className="text-sm">
                      Use Touch ID, Face ID, or Windows Hello for secure access
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Secure</Badge>
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            {selectedWallet === 'passkey' && isConnecting && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Setting up Passkey... Please use your device authentication
                </div>
              </CardContent>
            )}
          </Card>
        </div>
        
        {/* Error Message and Retry */}
        {connectionError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-red-500 mt-0.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-800 font-medium text-sm">Connection Failed</p>
                <p className="text-red-700 text-sm mt-1">{connectionError}</p>
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-red-700 border-red-300 hover:bg-red-50"
                  disabled={isConnecting}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-6 space-y-2">
          <p>
            <strong>Freighter:</strong> {freighterInstalled 
              ? "Browser extension installed and ready to use."
              : "Install the browser extension from freighter.app for the full Stellar wallet experience."
            }
          </p>
          <p>
            <strong>Passkey:</strong> Uses your device's biometric authentication (Touch ID, Face ID, Windows Hello) for secure, passwordless access.
          </p>
          {!freighterInstalled && (
            <div className="p-3 mt-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium text-sm">
                📌 To use Freighter wallet: 
                <button 
                  onClick={() => window.open('/freighter-install', '_blank')}
                  className="text-blue-600 underline hover:text-blue-800 ml-1"
                >
                  Follow our installation guide
                </button>
                {' '}or{' '}
                <button 
                  onClick={() => window.open('https://freighter.app/', '_blank')}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  install directly
                </button>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
