import { useState, useEffect } from 'react'
import { getTransactionStatus } from '@/services/soroban'

export type TransactionStatus = 'pending' | 'success' | 'error' | 'not_found'

export function useTransactionStatus(txHash: string | null) {
  const [status, setStatus] = useState<TransactionStatus>('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!txHash) {
      setStatus('not_found')
      return
    }

    // Handle development mode transactions (mock hashes start with 'dev_')
    if (txHash.startsWith('dev_')) {
      console.log('Development mode transaction detected:', txHash)
      setStatus('success')
      return
    }

    let isSubscribed = true
    const checkStatus = async () => {
      try {
        const result = await getTransactionStatus(txHash)
        
        if (!isSubscribed) return
        
        if (result.status === 'SUCCESS') {
          setStatus('success')
        } else if (result.status === 'FAILED') {
          setStatus('error')
          setError(result.resultXdr || 'Transaction failed')
        } else {
          // Keep checking if still pending
          setTimeout(checkStatus, 2000)
        }
      } catch (err) {
        if (!isSubscribed) return
        console.warn('Transaction status check failed:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    checkStatus()
    return () => {
      isSubscribed = false
    }
  }, [txHash])

  return {
    status,
    error,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error'
  }
}
