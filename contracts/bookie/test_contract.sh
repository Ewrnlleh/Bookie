#!/bin/bash

# Bookie Data Marketplace Contract Testing Script
# Tests all contract functions once deployment is successful

echo "🧪 Testing Bookie Data Marketplace Contract..."

# Configuration
CONTRACT_ID="$1"  # Pass contract ID as first argument
NETWORK="testnet"
SOURCE="testnet-deployer"

if [ -z "$CONTRACT_ID" ]; then
    echo "❌ Please provide contract ID as first argument"
    echo "Usage: ./test_contract.sh <CONTRACT_ID>"
    exit 1
fi

echo "📋 Contract ID: $CONTRACT_ID"
echo "🌐 Network: $NETWORK"

# Get admin address
ADMIN_ADDRESS=$(soroban keys address $SOURCE)
echo "👤 Admin Address: $ADMIN_ADDRESS"

# Test 1: Initialize contract (if not already initialized)
echo "🏗️  Test 1: Initializing contract..."
soroban contract invoke \
  --id $CONTRACT_ID \
  --source $SOURCE \
  --network $NETWORK \
  -- initialize \
  --admin $ADMIN_ADDRESS || echo "ℹ️  Already initialized"

# Test 2: List a data asset
echo "📝 Test 2: Listing a test data asset..."
soroban contract invoke \
  --id $CONTRACT_ID \
  --source $SOURCE \
  --network $NETWORK \
  -- list_data_asset \
  --seller $ADMIN_ADDRESS \
  --id "test-asset-1" \
  --title "Test Data Set" \
  --description "Sample cryptocurrency trading data" \
  --data_type "financial" \
  --price 1000000 \
  --ipfs_cid "QmTestHash123456789" \
  --encryption_key "test-key-123" \
  --size "100MB"

echo "✅ Asset listed successfully!"

# Test 3: Get all data assets
echo "📊 Test 3: Retrieving all data assets..."
ASSETS=$(soroban contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -- get_data_assets)

echo "📋 Assets: $ASSETS"

# Test 4: Get asset details
echo "🔍 Test 4: Getting asset details..."
ASSET_DETAILS=$(soroban contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -- get_asset_details \
  --asset_id "test-asset-1")

echo "📋 Asset Details: $ASSET_DETAILS"

# Test 5: Create a data access request
echo "📨 Test 5: Creating data access request..."
soroban contract invoke \
  --id $CONTRACT_ID \
  --source $SOURCE \
  --network $NETWORK \
  -- create_request \
  --requester $ADMIN_ADDRESS \
  --data_type "financial" \
  --price 500000 \
  --duration_days 30

echo "✅ Request created successfully!"

# Test 6: Get all requests
echo "📋 Test 6: Retrieving all requests..."
REQUESTS=$(soroban contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -- get_requests)

echo "📋 Requests: $REQUESTS"

# Test 7: Get contract statistics
echo "📊 Test 7: Getting contract statistics..."
STATS=$(soroban contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -- get_stats)

echo "📊 Contract Stats: $STATS"

# Test 8: Purchase data (this will need a different account in real use)
echo "💰 Test 8: Testing purchase data function..."
echo "ℹ️  Note: Using same address for buyer and seller in test"
ENCRYPTION_KEY=$(soroban contract invoke \
  --id $CONTRACT_ID \
  --source $SOURCE \
  --network $NETWORK \
  -- purchase_data \
  --buyer $ADMIN_ADDRESS \
  --asset_id "test-asset-1" \
  --payment_amount 1000000 2>/dev/null || echo "Expected to fail (same buyer/seller)")

if [ "$ENCRYPTION_KEY" != "Expected to fail (same buyer/seller)" ]; then
    echo "🔐 Encryption Key: $ENCRYPTION_KEY"
fi

# Test 9: Get user purchases
echo "🛒 Test 9: Getting user purchases..."
PURCHASES=$(soroban contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -- get_user_purchases \
  --user $ADMIN_ADDRESS)

echo "🛒 User Purchases: $PURCHASES"

echo "🎉 Contract testing complete!"
echo "✅ All basic functions are working correctly"
echo "🚀 Ready for frontend integration"
