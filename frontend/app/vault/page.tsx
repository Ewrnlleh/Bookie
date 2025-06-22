"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/simple-wallet-context"
import { useToast } from "@/hooks/use-toast"
import { Vault, Download, Eye, DollarSign, Calendar, Database } from "lucide-react"

// Mock data for user's assets
const mockOwnedAssets = [
  {
    id: "owned-1",
    title: "My Fitness Journey 2024",
    description: "Personal workout and health data",
    dataType: "Health & Fitness",
    price: 30,
    status: "active",
    purchases: 3,
    earnings: 90,
    listedDate: "2024-12-10"
  }
]

const mockPurchasedAssets = [
  {
    id: "purchased-1", 
    title: "E-commerce Behavior Dataset",
    description: "Shopping patterns and preferences data",
    dataType: "E-commerce",
    price: 25,
    purchaseDate: "2024-12-14",
    seller: "GA9ZK...",
    downloadUrl: "#"
  }
]

export default function VaultPage() {
  const { isConnected, connect, publicKey } = useWallet()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"owned" | "purchased">("owned")

  const handleDownload = (assetId: string) => {
    toast({
      title: "Download Started",
      description: "Your purchased data asset is being prepared for download.",
    })
    // In a real app, this would decrypt and download the file
  }

  const handleViewDetails = (assetId: string) => {
    toast({
      title: "Asset Details",
      description: "Detailed analytics and performance metrics coming soon.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Vault</h1>
          <p className="text-xl text-gray-600">
            Manage your data assets and track your earnings from the marketplace.
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <Card className="border-amber-200 bg-amber-50 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-800">Wallet Required</h3>
                  <p className="text-amber-700">Connect your wallet to access your vault</p>
                </div>
                <Button onClick={connect} variant="outline">
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isConnected && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$90.00</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assets Listed</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">Active on marketplace</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Purchased Assets</CardTitle>
                  <Vault className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">Available for download</p>
                </CardContent>
              </Card>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("owned")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "owned"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  My Listed Assets
                </button>
                <button
                  onClick={() => setActiveTab("purchased")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "purchased"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Purchased Assets
                </button>
              </nav>
            </div>

            {/* Content based on active tab */}
            {activeTab === "owned" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Your Listed Data Assets</h2>
                {mockOwnedAssets.map((asset) => (
                  <Card key={asset.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{asset.title}</CardTitle>
                          <CardDescription>{asset.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">{asset.dataType}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Price</p>
                          <p className="font-semibold text-green-600">${asset.price}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Purchases</p>
                          <p className="font-semibold">{asset.purchases}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Earnings</p>
                          <p className="font-semibold text-green-600">${asset.earnings}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Listed Date</p>
                          <p className="font-semibold">{asset.listedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(asset.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Badge variant={asset.status === "active" ? "default" : "secondary"}>
                          {asset.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "purchased" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Your Purchased Assets</h2>
                {mockPurchasedAssets.map((asset) => (
                  <Card key={asset.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{asset.title}</CardTitle>
                          <CardDescription>{asset.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">{asset.dataType}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Price Paid</p>
                          <p className="font-semibold">${asset.price}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Purchase Date</p>
                          <p className="font-semibold">{asset.purchaseDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Seller</p>
                          <p className="font-semibold">{asset.seller}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownload(asset.id)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Data
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty States */}
            {activeTab === "owned" && mockOwnedAssets.length === 0 && (
              <div className="text-center py-12">
                <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No listed assets</h3>
                <p className="text-gray-500">Start selling your data to see your assets here</p>
              </div>
            )}

            {activeTab === "purchased" && mockPurchasedAssets.length === 0 && (
              <div className="text-center py-12">
                <Vault className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No purchased assets</h3>
                <p className="text-gray-500">Visit the marketplace to purchase data assets</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
