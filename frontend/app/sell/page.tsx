"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/lib/simple-wallet-context"
import { useToast } from "@/hooks/use-toast"
import { Upload, DollarSign, Lock, Database } from "lucide-react"

export default function SellPage() {
  const { isConnected, connect, publicKey } = useWallet()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dataType: "",
    price: "",
    file: null as File | null
  })
  const [uploading, setUploading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to sell data assets.",
        variant: "destructive",
      })
      return
    }

    if (!formData.file) {
      toast({
        title: "File Required", 
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // Simulate file upload and tokenization
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: "Data Asset Created!",
        description: "Your data has been encrypted and listed on the marketplace.",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        dataType: "",
        price: "",
        file: null
      })

    } catch (error) {
      console.error("Upload failed:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload and tokenize your data asset.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sell Your Data</h1>
          <p className="text-xl text-gray-600">
            Upload, encrypt, and monetize your personal data while maintaining complete privacy control.
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <Card className="border-amber-200 bg-amber-50 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-800">Wallet Required</h3>
                  <p className="text-amber-700">Connect your wallet to sell data assets</p>
                </div>
                <Button onClick={connect} variant="outline">
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Create Data Asset
            </CardTitle>
            <CardDescription>
              Fill in the details below to list your data on the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset Title</label>
                <Input
                  placeholder="e.g., Personal Fitness Data 2024"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your data asset, what it contains, and its potential uses..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Data Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Type</label>
                <Select value={formData.dataType} onValueChange={(value) => handleInputChange("dataType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Location Data">Location Data</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Educational">Educational</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    placeholder="25"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="pl-10"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {formData.file ? formData.file.name : "Click to upload or drag and drop"}
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".csv,.json,.xlsx,.txt"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: CSV, JSON, XLSX, TXT (Max 10MB)
                  </p>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-800 mb-1">Privacy Protection</h4>
                    <p className="text-blue-700">
                      Your data will be encrypted client-side before upload. Only buyers with the proper decryption key can access the data content.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={!isConnected || uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Encrypting & Uploading...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Create Data Asset
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
