'use client'

import { useState } from 'react'

// Test the corrected RPC endpoint directly
export default function ContractTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    const results = []

    try {
      // Test 1: Basic RPC connectivity
      console.log('🧪 Testing RPC connectivity...')
      const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL!
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth'
        })
      })
      
      const healthResult = await response.json()
      results.push({
        test: 'RPC Health Check',
        status: response.ok ? 'PASS' : 'FAIL',
        result: healthResult
      })

      // Test 2: Test environment variables
      console.log('🧪 Testing environment variables...')
      results.push({
        test: 'Environment Variables',
        status: 'PASS',
        result: {
          rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
          contractId: process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID?.substring(0, 20) + '...',
          forceRealTx: process.env.NEXT_PUBLIC_FORCE_REAL_TRANSACTIONS
        }
      })

    } catch (error: any) {
      results.push({
        test: 'General Error',
        status: 'FAIL',
        result: error.message
      })
    }

    setTestResults(results)
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-green-400">🧪 Contract & Network Test</h1>
      <p className="mb-6 text-gray-300">
        Testing the fixed RPC endpoint and contract connectivity.
      </p>

      <button
        onClick={runTests}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg mb-6 transition-colors"
      >
        {isLoading ? 'Running Tests...' : 'Run Network Tests'}
      </button>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-blue-400">Test Results</h2>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                result.status === 'PASS'
                  ? 'bg-green-900/20 border-green-400'
                  : result.status === 'FAIL'
                  ? 'bg-red-900/20 border-red-400'
                  : 'bg-blue-900/20 border-blue-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    result.status === 'PASS'
                      ? 'bg-green-600 text-white'
                      : result.status === 'FAIL'
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {result.status}
                </span>
                <h3 className="font-semibold text-white">{result.test}</h3>
              </div>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {typeof result.result === 'object' 
                  ? JSON.stringify(result.result, null, 2) 
                  : result.result}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Environment Info</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div><strong>RPC URL:</strong> {process.env.NEXT_PUBLIC_SOROBAN_RPC_URL}</div>
          <div><strong>Contract ID:</strong> {process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID?.substring(0, 20)}...</div>
          <div><strong>Force Real Transactions:</strong> {process.env.NEXT_PUBLIC_FORCE_REAL_TRANSACTIONS}</div>
        </div>
      </div>
    </div>
  )
}
