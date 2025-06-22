#!/bin/bash

# Freighter Integration Verification Script
echo "🔍 Verifying Freighter Integration..."

# Check if Freighter API is properly installed
echo "📦 Checking dependencies..."
cd /Users/can/Desktop/bookie001/frontend
npm list @stellar/freighter-api 2>/dev/null && echo "✅ @stellar/freighter-api installed" || echo "❌ @stellar/freighter-api missing"
npm list @stellar/stellar-sdk 2>/dev/null && echo "✅ @stellar/stellar-sdk installed" || echo "❌ @stellar/stellar-sdk missing"

# Check if key files exist
echo ""
echo "📁 Checking implementation files..."
[ -f "lib/simple-wallet-context.tsx" ] && echo "✅ Wallet context exists" || echo "❌ Wallet context missing"
[ -f "components/simple-wallet-connect.tsx" ] && echo "✅ Wallet component exists" || echo "❌ Wallet component missing"
[ -f "components/freighter-test.tsx" ] && echo "✅ Test component exists" || echo "❌ Test component missing"

# Check for proper imports in wallet context
echo ""
echo "🔍 Verifying API imports..."
grep -q "@stellar/freighter-api" lib/simple-wallet-context.tsx && echo "✅ Freighter API imported" || echo "❌ Freighter API not imported"
grep -q "isConnected" lib/simple-wallet-context.tsx && echo "✅ isConnected method used" || echo "❌ isConnected method missing"
grep -q "requestAccess" lib/simple-wallet-context.tsx && echo "✅ requestAccess method used" || echo "❌ requestAccess method missing"
grep -q "signTransaction" lib/simple-wallet-context.tsx && echo "✅ signTransaction method used" || echo "❌ signTransaction method missing"

# Build test
echo ""
echo "🏗️ Testing build..."
npm run build > /dev/null 2>&1 && echo "✅ Build successful" || echo "❌ Build failed"

echo ""
echo "🎉 Freighter integration verification complete!"
echo ""
echo "📋 To test the integration:"
echo "1. Install Freighter extension: https://freighter.app/"
echo "2. Start dev server: npm run dev"
echo "3. Open http://localhost:3002"
echo "4. Click 'Connect Wallet' in header"
echo "5. Approve connection in Freighter"
echo "6. Verify wallet address appears in header"
