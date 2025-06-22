// Simple Node.js script to test the transaction mode logic

// Simulate environment variables
process.env.NODE_ENV = 'development'
process.env.NEXT_PUBLIC_FORCE_REAL_TRANSACTIONS = 'true'
process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID = 'YOUR_CONTRACT_ID'

console.log('🧪 Testing Transaction Mode Logic...\n')

// Simulate the logic from soroban.ts
const contractId = process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID || "YOUR_CONTRACT_ID"

function isValidContractId(contractId) {
  if (!contractId || contractId === "YOUR_CONTRACT_ID") {
    return false
  }
  
  // For testing, we'll simulate Contract validation
  // In real code, this would use: new Contract(contractId)
  return contractId.length === 56 && contractId.startsWith('C')
}

const contractIdIsValid = isValidContractId(contractId)
const forceRealTransactions = process.env.NEXT_PUBLIC_FORCE_REAL_TRANSACTIONS === 'true'

// Updated logic
const isDevelopment = (
  process.env.NODE_ENV === 'development' || 
  contractId === "YOUR_CONTRACT_ID" || 
  !contractIdIsValid
) || (!forceRealTransactions)

console.log('📊 Environment Variables:')
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`  FORCE_REAL_TRANSACTIONS: ${process.env.NEXT_PUBLIC_FORCE_REAL_TRANSACTIONS}`)
console.log(`  CONTRACT_ID: ${contractId}`)

console.log('\n🔍 Logic Results:')
console.log(`  contractIdIsValid: ${contractIdIsValid}`)
console.log(`  forceRealTransactions: ${forceRealTransactions}`)
console.log(`  isDevelopment: ${isDevelopment}`)

console.log('\n🎯 Transaction Mode:')
if (isDevelopment) {
  console.log('  ✅ DEVELOPMENT MODE - Will create mock transactions')
  console.log('  🔧 Transactions will have dev_ prefix')
  console.log('  💰 No real XLM will be spent')
  console.log('  📦 Purchases will be tracked to vault with mock hash')
} else {
  console.log('  🚀 PRODUCTION MODE - Will create real transactions')
  console.log('  💳 Real XLM will be spent from wallet')
  console.log('  🌐 Transactions will be submitted to Stellar network')
  console.log('  🔗 Purchases will be tracked to vault with real hash')
}

console.log('\n🧪 Test Complete!')
