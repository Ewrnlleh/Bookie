'use client'

import { useEffect, useState } from 'react'

export default function DebugEnv() {
  const [env, setEnv] = useState<any>({})

  useEffect(() => {
    setEnv({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BOOKIE_CONTRACT_ID: process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID,
      NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
      NEXT_PUBLIC_FORCE_REAL_TRANSACTIONS: process.env.NEXT_PUBLIC_FORCE_REAL_TRANSACTIONS,
    })
  }, [])

  const forceRealTransactions = process.env.NEXT_PUBLIC_FORCE_REAL_TRANSACTIONS === 'true'
  const contractId = process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID || "YOUR_CONTRACT_ID"
  const isDevelopment = !forceRealTransactions && (process.env.NODE_ENV === 'development' || contractId === "YOUR_CONTRACT_ID")

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Environment Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Environment Variables:</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(env, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Computed Values:</h2>
          <div className="space-y-2 text-sm">
            <div><strong>forceRealTransactions:</strong> {String(forceRealTransactions)}</div>
            <div><strong>contractId:</strong> {contractId}</div>
            <div><strong>isDevelopment:</strong> {String(isDevelopment)}</div>
            <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</div>
            <div><strong>Contract ID check:</strong> {contractId === "YOUR_CONTRACT_ID" ? "PLACEHOLDER" : "REAL"}</div>
          </div>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Analysis:</h2>
          <div className="text-sm space-y-1">
            {isDevelopment ? (
              <div className="text-red-600">⚠️ Currently in DEVELOPMENT mode - transactions will be mocked</div>
            ) : (
              <div className="text-green-600">✅ Currently in PRODUCTION mode - transactions will be real</div>
            )}
            {!forceRealTransactions && (
              <div className="text-yellow-600">Note: FORCE_REAL_TRANSACTIONS is not enabled</div>
            )}
            {contractId === "YOUR_CONTRACT_ID" && (
              <div className="text-red-600">❌ Contract ID is still placeholder</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
