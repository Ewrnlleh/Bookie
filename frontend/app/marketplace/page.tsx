"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/lib/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, ShoppingCart, Database, Calendar, User, Copy } from "lucide-react"
import { listDataRequests } from "@/services/soroban"
import { useTransactionStatus } from "@/lib/hooks/useTransactionStatus"
import { formatPublicKey } from "@/lib/utils"
import type { DataAsset } from "@/lib/types"

export default function MarketplacePage() {
  const { isConnected, connect, signAndSubmitTransaction, publicKey } = useWallet()
  const { toast } = useToast()
  const [assets, setAssets] = useState<DataAsset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<DataAsset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [purchaseState, setPurchaseState] = useState<{
    assetId: string | null
    txHash: string | null
  }>({ assetId: null, txHash: null })

  const { status: txStatus, error: txError } = useTransactionStatus(purchaseState.txHash)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Seller ID copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Fetch from Soroban contract
    listDataRequests()
      .then(setAssets)
      .catch(console.error)
  }, [])

  useEffect(() => {
    let filtered = assets

    if (searchTerm) {
      filtered = filtered.filter(
        (asset) =>
          asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((asset) => asset.dataType === filterType)
    }

    setFilteredAssets(filtered)
  }, [assets, searchTerm, filterType])

  // Monitor transaction status
  useEffect(() => {
    if (purchaseState.txHash && txStatus === "success") {
      toast({
        title: "Purchase Successful",
        description: "Your data asset purchase has been confirmed",
      })
      setPurchaseState({ assetId: null, txHash: null })
      // Refresh asset list
      listDataRequests().then(setAssets).catch(console.error)
    } else if (txStatus === "error" && txError) {
      toast({
        title: "Purchase Failed",
        description: txError,
        variant: "destructive",
      })
      setPurchaseState({ assetId: null, txHash: null })
    }
  }, [txStatus, txError, purchaseState.txHash, toast])

  const handlePurchase = async (asset: DataAsset) => {
    if (!isConnected) {
      try {
        await connect()
      } catch (error) {
        return // Connect toast will show error
      }
    }

    if (!publicKey) {
      toast({
        title: "Wallet Error",
        description: "No public key available",
        variant: "destructive",
      })
      return
    }

    try {
      setPurchaseState({ assetId: asset.id, txHash: null })

      // Debug logging
      console.log('Building purchase transaction with:', {
        publicKey,
        publicKeyType: typeof publicKey,
        publicKeyLength: publicKey?.length,
        assetId: asset.id,
        price: asset.price
      })

      // Build a proper purchase transaction
      const { buildPurchaseTransaction } = await import("@/services/soroban")
      const txXdr = await buildPurchaseTransaction(publicKey, asset.id, asset.price)

      const { hash } = await signAndSubmitTransaction(txXdr)
      setPurchaseState((prev) => ({ ...prev, txHash: hash }))

      toast({
        title: "Purchase Initiated",
        description: "Your purchase is being processed...",
      })
    } catch (error) {
      setPurchaseState({ assetId: null, txHash: null })
      console.error("Purchase failed:", error)
      
      // Show specific error message
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Search & Filter Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search data assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="browsing">Browsing History</SelectItem>
              <SelectItem value="location">Location Data</SelectItem>
              <SelectItem value="health">Health Data</SelectItem>
              <SelectItem value="financial">Financial Data</SelectItem>
              <SelectItem value="social">Social Media Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{asset.title}</CardTitle>
                    <CardDescription className="mt-2">{asset.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{asset.dataType}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Seller:</span>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {formatPublicKey(asset.seller)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted"
                        onClick={() => copyToClipboard(asset.seller)}
                        title={`Copy full seller ID: ${asset.seller}`}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Database className="h-4 w-4" />
                    <span>Size: {asset.size}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Listed: {new Date(asset.listedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-lg font-semibold">{asset.price} XLM</div>
                    <Button
                      onClick={() => handlePurchase(asset)}
                      disabled={purchaseState.assetId === asset.id || !isConnected}
                    >
                      {purchaseState.assetId === asset.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Purchase
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Database className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Data Assets Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filters"
                : "Be the first to list your data!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
