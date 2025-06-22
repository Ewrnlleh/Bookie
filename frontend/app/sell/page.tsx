"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/lib/wallet-context"
import { useAuth } from "@/lib/auth-context" 
import { useToast } from "@/hooks/use-toast"
import { Upload, Shield, DollarSign } from "lucide-react"
import { listDataAsset, signTransactionWithPasskey } from "@/services/soroban"

export default function SellDataPage() {
  const { isConnected, publicKey, signAndSubmitTransaction } = useWallet()
  const { isAuthenticated, authenticate } = useAuth()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dataType: "",
    price: "",
    file: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      // Check wallet connection
      if (!isConnected || !publicKey) {
        toast({
          title: "Wallet Required",
          description: "Please connect your wallet to list data",
          variant: "destructive",
        })
        return
      }

      if (!formData.file) {
        toast({
          title: "File Required", 
          description: "Please select a file to upload",
          variant: "destructive",
        })
        return
      }

      // 1. Upload file/metadata to IPFS
      // TODO: Implement IPFS upload
      const mockIpfsCid = "Qm..."
      
      // 2. Generate unique asset ID
      const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 3. Create data asset listing transaction
      const tx = await listDataAsset({
        seller: publicKey,
        id: assetId,
        title: formData.title,
        description: formData.description,
        dataType: formData.dataType,
        price: parseInt(formData.price),
        ipfsCid: mockIpfsCid,
        encryptionKey: `key_${Date.now()}`, // TODO: Generate proper encryption key
        size: `${(formData.file.size / 1024 / 1024).toFixed(2)}MB`
      })

      // 4. Sign and submit transaction using wallet
      const { hash } = await signAndSubmitTransaction(tx)

      toast({
        title: "Success!",
        description: `Your data was successfully listed. Transaction hash: ${hash}`,
      })

      // Clear form
      setFormData({
        title: "",
        description: "",
        dataType: "",
        price: "",
        file: null,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to list data",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>List Your Data</CardTitle>
            <CardDescription>
              Share your data securely on the marketplace. All data is encrypted and you maintain full
              control.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="E.g., 3 Months Browser History"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your data..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Data Type</Label>
                <Select
                  value={formData.dataType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, dataType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="browsing">Browsing History</SelectItem>
                    <SelectItem value="location">Location Data</SelectItem>
                    <SelectItem value="health">Health Data</SelectItem>
                    <SelectItem value="financial">Financial Data</SelectItem>
                    <SelectItem value="social">Social Media Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (XLM)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="100"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <Input id="file" type="file" onChange={handleFileChange} required />
                <p className="text-sm text-gray-500">
                  File will be encrypted before upload. Max size: 100MB
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isUploading || !isConnected}
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    List Data Securely
                  </span>
                )}
              </Button>

              {!isConnected && (
                <p className="text-sm text-red-500 text-center">
                  Please connect your wallet to list data
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
