"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Horizon } from "@stellar/stellar-sdk"

interface AccountData {
  account_id: string
  sequence: string
  balances: Array<{
    balance: string
    asset_type: string
    asset_code?: string
    asset_issuer?: string
  }>
  thresholds: {
    low_threshold: number
    med_threshold: number
    high_threshold: number
  }
  flags: {
    auth_required: boolean
    auth_revocable: boolean
    auth_immutable: boolean
  }
  data: Record<string, string>
  num_sponsoring?: number
  num_sponsored?: number
  subentry_count: number
}

export default function AccountLookupPage() {
  const [accountId, setAccountId] = useState("GDXCDXY67P5L3OXXALM3WXPS6OOYBYFEY6GL5BPGZYNN5IKENJS62AS7")
  const [loading, setLoading] = useState(false)
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const lookupAccount = async () => {
    if (!accountId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an account ID",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setError(null)
    setAccountData(null)

    try {
      const server = new Horizon.Server("https://horizon-testnet.stellar.org")
      const account = await server.loadAccount(accountId.trim())
      
      setAccountData({
        account_id: account.account_id,
        sequence: account.sequence,
        balances: account.balances,
        thresholds: account.thresholds,
        flags: account.flags,
        data: account.data_attr || {},
        num_sponsoring: (account as any).num_sponsoring || 0,
        num_sponsored: (account as any).num_sponsored || 0,
        subentry_count: account.subentry_count
      })

      toast({
        title: "Success",
        description: "Account data loaded successfully"
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Failed to load account"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard"
    })
  }

  const formatBalance = (balance: any) => {
    if (balance.asset_type === "native") {
      return `${parseFloat(balance.balance).toFixed(7)} XLM`
    } else {
      return `${parseFloat(balance.balance).toFixed(7)} ${balance.asset_code}`
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Stellar Account Lookup</h1>
          <p className="text-muted-foreground mt-2">
            Query account details on Stellar Testnet
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Query</CardTitle>
            <CardDescription>
              Enter a Stellar account ID to view account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Stellar account ID (e.g., GDXCD...)"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="font-mono text-sm"
              />
              <Button 
                onClick={lookupAccount} 
                disabled={loading}
                className="shrink-0"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lookup
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {accountData && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Account Information
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${accountData.account_id}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View on Stellar Expert
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Account ID:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                    {accountData.account_id}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(accountData.account_id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Sequence:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {accountData.sequence}
                  </code>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Subentries:</span>
                  <Badge variant="secondary">{accountData.subentry_count}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Sponsoring/Sponsored:</span>
                  <Badge variant="outline">{accountData.num_sponsoring || 0}/{accountData.num_sponsored || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {accountData.balances.map((balance, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {formatBalance(balance)}
                        </div>
                        {balance.asset_type !== "native" && (
                          <div className="text-sm text-muted-foreground">
                            Issuer: {balance.asset_issuer}
                          </div>
                        )}
                      </div>
                      <Badge variant={balance.asset_type === "native" ? "default" : "secondary"}>
                        {balance.asset_type === "native" ? "Native XLM" : "Asset"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Thresholds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {accountData.thresholds.low_threshold}
                    </div>
                    <div className="text-sm text-muted-foreground">Low</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {accountData.thresholds.med_threshold}
                    </div>
                    <div className="text-sm text-muted-foreground">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {accountData.thresholds.high_threshold}
                    </div>
                    <div className="text-sm text-muted-foreground">High</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={accountData.flags.auth_required ? "destructive" : "secondary"}>
                    Auth Required: {accountData.flags.auth_required ? "Yes" : "No"}
                  </Badge>
                  <Badge variant={accountData.flags.auth_revocable ? "destructive" : "secondary"}>
                    Auth Revocable: {accountData.flags.auth_revocable ? "Yes" : "No"}
                  </Badge>
                  <Badge variant={accountData.flags.auth_immutable ? "default" : "secondary"}>
                    Auth Immutable: {accountData.flags.auth_immutable ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {Object.keys(accountData.data).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(accountData.data).map(([key, value], index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="font-medium">{key}:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                          {value}
                        </code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
