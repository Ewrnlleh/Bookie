"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useWallet, type WalletType } from "@/lib/wallet-context"
import { Wallet, Key, Chrome, Smartphone, ExternalLink } from "lucide-react"
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

  const handleConnect = async (type: WalletType) => {
    setIsConnecting(true)
    setSelectedWallet(type)
    
    try {
      await connect(type)
      setDialogOpen(false)
      onConnect?.()
    } catch (error) {
      console.error("Connection failed:", error)
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setDialogOpen(false)
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          {walletType === 'freighter' ? (
            <Chrome className="h-3 w-3" />
          ) : (
            <Key className="h-3 w-3" />
          )}
          {walletType === 'freighter' ? 'Freighter' : 'Passkey'}
        </Badge>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            {trigger || (
              <Button variant="outline" size="sm">
                <Wallet className="h-4 w-4 mr-2" />
                {publicKey ? formatPublicKey(publicKey) : 'Connected'}
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
                <div className="flex items-center gap-3">
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
          <Button>
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
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
        
        <div className="space-y-3">
          {/* Freighter Wallet Option */}
          <Card 
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedWallet === 'freighter' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => !isConnecting && handleConnect('freighter')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Chrome className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-base">Freighter Wallet</CardTitle>
                    <CardDescription className="text-sm">
                      Connect using Freighter browser extension
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary">Recommended</Badge>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            {selectedWallet === 'freighter' && isConnecting && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Connecting to Freighter...
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
                <div className="flex items-center gap-3">
                  <Key className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-base">Passkey Authentication</CardTitle>
                    <CardDescription className="text-sm">
                      Use biometric authentication or security key
                    </CardDescription>
                  </div>
                </div>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            {selectedWallet === 'passkey' && isConnecting && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Setting up Passkey...
                </div>
              </CardContent>
            )}
          </Card>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4">
          <p>
            <strong>Freighter:</strong> Install the browser extension for the full Stellar wallet experience.
          </p>
          <p className="mt-1">
            <strong>Passkey:</strong> Use your device's built-in security features for authentication.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
