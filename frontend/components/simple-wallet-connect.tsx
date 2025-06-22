"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useWallet } from "@/lib/simple-wallet-context"
import { Wallet, Chrome, ExternalLink } from "lucide-react"

interface SimpleWalletConnectProps {
  trigger?: React.ReactNode
}

export function SimpleWalletConnect({ trigger }: SimpleWalletConnectProps) {
  const { connect, isConnected, publicKey, disconnect } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
      setDialogOpen(false)
    } catch (error) {
      console.error("Connection failed:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setDialogOpen(false)
  }

  // If connected, show wallet info
  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            {trigger || (
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Chrome className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {publicKey.substring(0, 4)}...{publicKey.substring(publicKey.length - 4)}
                </span>
                <span className="sm:hidden">Connected</span>
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Wallet Connected</DialogTitle>
              <DialogDescription>
                Your Freighter wallet is connected and ready to use.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Chrome className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Freighter Wallet</p>
                    <p className="text-sm text-muted-foreground">
                      {publicKey.substring(0, 8)}...{publicKey.substring(publicKey.length - 8)}
                    </p>
                  </div>
                </div>
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

  // If not connected, show connect dialog
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Connect your Freighter wallet to access the Bookie marketplace.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card 
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={handleConnect}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Chrome className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-base">Freighter Wallet</CardTitle>
                    <CardDescription className="text-sm">
                      Connect using Freighter browser extension
                    </CardDescription>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            {isConnecting && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Connecting to Freighter...
                </div>
              </CardContent>
            )}
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have Freighter?{" "}
              <a 
                href="https://freighter.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Install it here
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
