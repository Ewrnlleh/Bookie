"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/lib/wallet-context"
import { Database, Download, Eye, Trash2, Calendar, DollarSign } from "lucide-react"
import { formatPublicKey } from "@/lib/utils"
import { getUserPurchases } from "@/services/soroban"

interface VaultItem {
  id: string
  title: string
  description: string
  dataType: string
  price?: number
  status: "listed" | "sold" | "purchased"
  date: string
  size: string
  earnings?: number
  txHash?: string
}

// Mock data for items user has listed/sold
const mockListedSoldItems: VaultItem[] = [
  {
    id: "1",
    title: "My Browsing History - Q4 2023",
    description: "Personal browsing data from October to December 2023",
    dataType: "browsing",
    price: 100,
    status: "sold",
    date: "2024-01-10",
    size: "1.5 MB",
    earnings: 97.5, // After 2.5% platform fee
  },
  {
    id: "2", 
    title: "Fitness Data - 2023",
    description: "Complete year of fitness tracking data",
    dataType: "fitness",
    price: 250,
    status: "listed",
    date: "2024-01-08",
    size: "3.2 MB",
  },
]

export default function VaultPage() {
  const { isConnected, publicKey } = useWallet()
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([])
  const [purchasedItems, setPurchasedItems] = useState<VaultItem[]>([])

  useEffect(() => {
    if (isConnected && publicKey) {
      // Load user's actual purchases from localStorage
      const userPurchases = getUserPurchases(publicKey)
      const purchasedVaultItems = userPurchases.map(purchase => ({
        id: purchase.id,
        title: purchase.title,
        description: purchase.description,
        dataType: purchase.dataType,
        price: purchase.price,
        status: "purchased" as const,
        date: purchase.purchaseDate,
        size: purchase.size,
        txHash: purchase.txHash
      }))
      setPurchasedItems(purchasedVaultItems)
      
      // Combine with mock listed/sold items
      setVaultItems([...mockListedSoldItems, ...purchasedVaultItems])
      
      console.log('📦 Loaded vault items:', {
        purchased: purchasedVaultItems.length,
        total: mockListedSoldItems.length + purchasedVaultItems.length
      })
    }
  }, [isConnected, publicKey])

  const listedItems = vaultItems.filter((item) => item.status === "listed")
  const soldItems = vaultItems.filter((item) => item.status === "sold")

  const totalEarnings = soldItems.reduce((sum, item) => sum + (item.earnings || 0), 0)

  const getStatusColor = (status: string) => {
    const colors = {
      listed: "bg-blue-100 text-blue-800",
      sold: "bg-green-100 text-green-800",
      purchased: "bg-purple-100 text-purple-800",
    }
    return colors[status as keyof typeof colors]
  }

  const getDataTypeColor = (type: string) => {
    const colors = {
      browsing: "bg-orange-100 text-orange-800",
      fitness: "bg-emerald-100 text-emerald-800",
      shopping: "bg-pink-100 text-pink-800",
      location: "bg-purple-100 text-purple-800",
      social: "bg-yellow-100 text-yellow-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookie Vault</h1>
          <p className="text-gray-600 mb-8">Connect your wallet to view and manage your data assets.</p>
          <Card className="p-8">
            <CardContent className="text-center">
              <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Wallet Connection Required</h3>
              <p className="text-gray-600">Your data vault is secured by your wallet connection.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Bookie Vault</h1>
        <p className="text-gray-600 mb-4">Manage your listed data, track earnings, and access purchased data sets.</p>
        <div className="text-sm text-gray-500">
          Connected: {formatPublicKey(publicKey)}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{listedItems.length}</div>
                <div className="text-sm text-gray-600">Listed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{soldItems.length}</div>
                <div className="text-sm text-gray-600">Sold</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{purchasedItems.length}</div>
                <div className="text-sm text-gray-600">Purchased</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{totalEarnings.toFixed(1)}</div>
                <div className="text-sm text-gray-600">XLM Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="listed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listed">Listed Data ({listedItems.length})</TabsTrigger>
          <TabsTrigger value="sold">Sold Data ({soldItems.length})</TabsTrigger>
          <TabsTrigger value="purchased">Purchased Data ({purchasedItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="listed" className="space-y-4">
          {listedItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Listed Data</h3>
                <p className="text-gray-600 mb-4">You haven't listed any data for sale yet.</p>
                <Button className="bg-blue-600 hover:bg-blue-700">List Your First Data Set</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {listedItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          <Badge className={getDataTypeColor(item.dataType)}>{item.dataType}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">{item.price} XLM</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{item.description}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Database className="w-4 h-4" />
                        {item.size}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sold" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {soldItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getStatusColor(item.status)}>Sold</Badge>
                        <Badge className={getDataTypeColor(item.dataType)}>{item.dataType}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">+{item.earnings} XLM</div>
                      <div className="text-sm text-gray-500">Earned</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{item.description}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Sold: {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Database className="w-4 h-4" />
                      {item.size}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="purchased" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {purchasedItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getStatusColor(item.status)}>Purchased</Badge>
                        <Badge className={getDataTypeColor(item.dataType)}>{item.dataType}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{item.description}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Purchased: {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Database className="w-4 h-4" />
                      {item.size}
                    </div>
                    {item.price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {item.price} XLM
                      </div>
                    )}
                  </div>
                  {item.txHash && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Transaction Hash:</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1">
                          {formatPublicKey(item.txHash)}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (item.txHash && !item.txHash.startsWith('dev_')) {
                              window.open(`https://stellar.expert/explorer/testnet/tx/${item.txHash}`, '_blank')
                            }
                          }}
                          disabled={item.txHash?.startsWith('dev_')}
                        >
                          {item.txHash?.startsWith('dev_') ? 'Mock Tx' : 'View Tx'}
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download Data
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
