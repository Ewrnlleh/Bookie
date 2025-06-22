'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NetworkDebugPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testFreighterAvailability = async () => {
    try {
      addResult('🔍 Testing Freighter availability...')
      
      // Check if Freighter is installed
      if (!window.freighterApi) {
        addResult('❌ Freighter not detected - please install the Freighter extension')
        return
      }
      
      addResult('✅ Freighter detected')
      
      // Test Freighter's isConnected method
      const isConnected = await window.freighterApi.isConnected()
      addResult(`📡 Freighter connected: ${isConnected}`)
      
      // Test Freighter's getNetworkDetails
      try {
        const networkDetails = await window.freighterApi.getNetworkDetails()
        addResult(`🌐 Network: ${networkDetails.networkPassphrase}`)
        addResult(`🔗 Network URL: ${networkDetails.networkUrl}`)
      } catch (networkError: any) {
        addResult(`❌ Network details error: ${networkError.message}`)
      }
      
      // Test Freighter's getAddress (if connected)
      if (isConnected) {
        try {
          const address = await window.freighterApi.getAddress()
          const publicKey = typeof address === 'string' ? address : address.address
          addResult(`👤 Public Key: ${publicKey?.substring(0, 10)}...`)
        } catch (addressError: any) {
          addResult(`❌ Address error: ${addressError.message}`)
        }
      }
      
    } catch (error: any) {
      addResult(`❌ Freighter error: ${error.message}`)
      console.error('Freighter test error:', error)
    }
  }

  const testStellarNetworkConnectivity = async () => {
    try {
      addResult('🔍 Testing Stellar Testnet connectivity...')
      
      // Test Stellar RPC endpoint
      const rpcUrl = 'https://soroban-testnet.stellar.org'
      try {
        addResult(`📡 Testing RPC: ${rpcUrl}`)
        const rpcResponse = await fetch(rpcUrl, {
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
        
        if (rpcResponse.ok) {
          const rpcData = await rpcResponse.json()
          addResult(`✅ RPC Health: ${JSON.stringify(rpcData)}`)
        } else {
          addResult(`❌ RPC Error: ${rpcResponse.status} ${rpcResponse.statusText}`)
        }
      } catch (rpcError: any) {
        addResult(`❌ RPC Network Error: ${rpcError.message}`)
        console.error('RPC Error:', rpcError)
      }
      
      // Test Horizon endpoint
      try {
        addResult('📡 Testing Horizon API...')
        const horizonResponse = await fetch('https://horizon-testnet.stellar.org/')
        if (horizonResponse.ok) {
          addResult('✅ Horizon API accessible')
        } else {
          addResult(`❌ Horizon Error: ${horizonResponse.status}`)
        }
      } catch (horizonError: any) {
        addResult(`❌ Horizon Network Error: ${horizonError.message}`)
      }
      
      // Test Friendbot
      try {
        addResult('📡 Testing Friendbot...')
        const friendbotResponse = await fetch('https://friendbot.stellar.org', { method: 'GET' })
        if (friendbotResponse.ok) {
          addResult('✅ Friendbot accessible')
        } else {
          addResult(`❌ Friendbot Error: ${friendbotResponse.status}`)
        }
      } catch (friendbotError: any) {
        addResult(`❌ Friendbot Network Error: ${friendbotError.message}`)
      }
      
    } catch (error: any) {
      addResult(`❌ Network test error: ${error.message}`)
      console.error('Network test error:', error)
    }
  }

  const testSorobanService = async () => {
    try {
      addResult('🔍 Testing Soroban service configuration...')
      
      // Import and test our Soroban service
      const { getClient } = await import('@/services/soroban')
      
      addResult('📦 Soroban service imported successfully')
      
      // Test getting client
      try {
        const client = getClient()
        addResult('✅ Soroban client created')
        
        // Test a simple RPC call
        const healthCheck = await client.getHealth()
        addResult(`✅ Soroban RPC Health: ${JSON.stringify(healthCheck)}`)
        
      } catch (clientError: any) {
        addResult(`❌ Soroban client error: ${clientError.message}`)
        console.error('Soroban client error:', clientError)
      }
      
    } catch (error: any) {
      addResult(`❌ Soroban service error: ${error.message}`)
      console.error('Soroban service error:', error)
    }
  }

  const runAllTests = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      await testFreighterAvailability()
      await testStellarNetworkConnectivity()
      await testSorobanService()
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Network Debugging</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Connectivity Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button onClick={testFreighterAvailability} disabled={isLoading}>
                  Test Freighter
                </Button>
                <Button onClick={testStellarNetworkConnectivity} disabled={isLoading}>
                  Test Stellar Network
                </Button>
                <Button onClick={testSorobanService} disabled={isLoading}>
                  Test Soroban Service
                </Button>
                <Button onClick={runAllTests} disabled={isLoading} variant="default">
                  {isLoading ? 'Running Tests...' : 'Run All Tests'}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={clearResults} variant="outline" size="sm">
                  Clear Results
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">Click "Run All Tests" to start debugging...</p>
              ) : (
                <div className="space-y-1 font-mono text-sm">
                  {testResults.map((result, index) => (
                    <div key={index} className={
                      result.includes('❌') ? 'text-red-600' :
                      result.includes('✅') ? 'text-green-600' :
                      result.includes('🔍') ? 'text-blue-600' :
                      'text-gray-700'
                    }>
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
