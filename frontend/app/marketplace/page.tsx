"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/lib/simple-wallet-context"
import { useToast } from "@/hooks/use-toast"
import { Search, ShoppingCart, Database, Calendar, User } from "lucide-react"
import { transactionService } from "@/services/simple-soroban"

// Mock data for demonstration
const mockAssets = [
  {
    id: "asset-1",
    title: "Personal Fitness Data",
    description: "6 months of fitness tracking data including steps, heart rate, and workout logs",
    dataType: "Health & Fitness",
    price: 25,
    seller: "GD2I2...",
    size: "2.3 MB",
    listedDate: "2024-12-15"
  },
  {
    id: "asset-2", 
    title: "Social Media Interactions",
    description: "Anonymized social media engagement patterns and interaction data",
    dataType: "Social Media",
    price: 15,
    seller: "GC8XY...",
    size: "1.8 MB",
    listedDate: "2024-12-14"
  },
  {
    id: "asset-3",
    title: "Shopping Behavior Dataset",
    description: "E-commerce browsing and purchase behavior data from 2024",
    dataType: "E-commerce",
    price: 40,
    seller: "GA9ZK...",
    size: "5.1 MB", 
    listedDate: "2024-12-13"
  }
]

export default function MarketplacePage() {
  const { isConnected, connect, signTransaction, publicKey } = useWallet()
  const { toast } = useToast()
  const [assets] = useState(mockAssets)
  const [filteredAssets, setFilteredAssets] = useState(mockAssets)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [purchasing, setPurchasing] = useState<string | null>(null)

  // Filter assets based on search and type
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterAssets(term, filterType)
  }

  const handleFilterChange = (type: string) => {
    setFilterType(type)
    filterAssets(searchTerm, type)
  }

  const filterAssets = (search: string, type: string) => {
    let filtered = assets

    if (search) {
      filtered = filtered.filter(asset =>
        asset.title.toLowerCase().includes(search.toLowerCase()) ||
        asset.description.toLowerCase().includes(search.toLowerCase()) ||
        asset.dataType.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (type !== "all") {
      filtered = filtered.filter(asset => asset.dataType === type)
    }

    setFilteredAssets(filtered)
  }

  const handlePurchase = async (assetId: string, price: number) => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase data assets.",
        variant: "destructive",
      })
      return
    }

    setPurchasing(assetId)

    try {
      // Build a test transaction
      const txXdr = await transactionService.buildTestTransaction(publicKey!)
      
      // Sign the transaction
      const signedXdr = await signTransaction(txXdr)
      
      // Submit the transaction
      const result = await transactionService.submitTransaction(signedXdr)

      toast({
        title: "Purchase Successful!",
        description: `Data asset purchased successfully. Transaction: ${result.hash.substring(0, 8)}...`,
      })

    } catch (error) {
      console.error("Purchase failed:", error)
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to purchase asset",
        variant: "destructive",
      })
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Marketplace</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and purchase high-quality datasets from verified sellers. 
            All data is encrypted and privacy-protected.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
              <SelectItem value="Social Media">Social Media</SelectItem>
              <SelectItem value="E-commerce">E-commerce</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-800">Wallet Required</h3>
                  <p className="text-amber-700">Connect your wallet to purchase data assets</p>
                </div>
                <Button onClick={connect} variant="outline">
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{asset.title}</CardTitle>
                    <CardDescription className="mt-2">{asset.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{asset.dataType}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Asset Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>{asset.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{asset.listedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <User className="h-4 w-4" />
                      <span>Seller: {asset.seller}</span>
                    </div>
                  </div>

                  {/* Price and Purchase */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-2xl font-bold text-green-600">
                      ${asset.price}
                    </div>
                    <Button
                      onClick={() => handlePurchase(asset.id, asset.price)}
                      disabled={!isConnected || purchasing === asset.id}
                      className="flex items-center gap-2"
                    >
                      {purchasing === asset.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
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

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No assets found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
