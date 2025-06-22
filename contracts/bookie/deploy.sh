#!/bin/bash

# Bookie Smart Contract Deploy Script for Stellar Testnet
# Bu script contract'ı Stellar Testnet'e deploy eder

set -e

echo "🚀 Bookie Smart Contract Deploy Script"
echo "======================================"

# Gerekli değişkenler
CONTRACT_NAME="bookie"
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Soroban CLI kurulu mu kontrol et
if ! command -v soroban &> /dev/null; then
    echo "❌ Soroban CLI bulunamadı. Lütfen önce Soroban CLI'ı kurun:"
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo "cargo install --locked soroban-cli"
    exit 1
fi

# Rust ve Cargo kurulu mu kontrol et
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo bulunamadı. Lütfen önce Rust'ı kurun:"
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

echo "✅ Gerekli araçlar mevcut"

# wasm32-unknown-unknown target'ı ekle
echo "📦 Rust WASM target'ını ekliyoruz..."
rustup target add wasm32-unknown-unknown

# Contract'ı build et
echo "🔨 Contract'ı build ediyoruz..."
cargo build --target wasm32-unknown-unknown --release

# Optimized WASM dosyasını kontrol et
WASM_FILE="target/wasm32-unknown-unknown/release/${CONTRACT_NAME}.wasm"
if [ ! -f "$WASM_FILE" ]; then
    echo "❌ WASM dosyası bulunamadı: $WASM_FILE"
    exit 1
fi

echo "✅ Contract başarıyla build edildi: $WASM_FILE"

# Wallet identity'si kontrol et (yoksa oluştur)
echo "🔑 Testnet wallet identity'sini kontrol ediyoruz..."
if ! soroban keys ls | grep -q "testnet-deployer"; then
    echo "🆕 Yeni testnet identity'si oluşturuluyor..."
    soroban keys generate testnet-deployer --no-fund
    echo "✅ Yeni identity oluşturuldu: testnet-deployer"
    
    # Public key'i al ve faucet'ten XLM iste
    PUBLIC_KEY=$(soroban keys address testnet-deployer)
    echo "📋 Public Key: $PUBLIC_KEY"
    echo "💰 Testnet faucet'ten XLM almak için: https://friendbot.stellar.org?addr=$PUBLIC_KEY"
    echo "⏳ Lütfen faucet'ten XLM aldıktan sonra devam etmek için Enter'a basın..."
    read
else
    PUBLIC_KEY=$(soroban keys address testnet-deployer)
    echo "✅ Mevcut identity kullanılıyor: $PUBLIC_KEY"
fi

# Network'ü yapılandır
echo "🌐 Soroban network'ünü yapılandırıyoruz..."
soroban network add testnet \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$NETWORK_PASSPHRASE"

echo "✅ Network yapılandırması tamamlandı"

# Contract'ı deploy et
echo "🚀 Contract'ı Stellar Testnet'e deploy ediyoruz..."

CONTRACT_ID=$(soroban contract deploy \
    --wasm "$WASM_FILE" \
    --source testnet-deployer \
    --network testnet)

if [ $? -eq 0 ] && [ ! -z "$CONTRACT_ID" ]; then
    echo "🎉 Contract başarıyla deploy edildi!"
    echo "📋 Contract ID: $CONTRACT_ID"
    echo "🌐 Network: $NETWORK"
    echo "🔗 RPC URL: $RPC_URL"
    
    # Contract ID'yi .env dosyasına kaydet
    echo ""
    echo "📝 Frontend .env.local dosyasına eklenecek:"
    echo "NEXT_PUBLIC_BOOKIE_CONTRACT_ID=$CONTRACT_ID"
    
    # Contract'ı initialize et
    echo ""
    echo "🔧 Contract'ı initialize ediyoruz..."
    soroban contract invoke \
        --id "$CONTRACT_ID" \
        --source testnet-deployer \
        --network testnet \
        -- initialize \
        --admin "$PUBLIC_KEY"
    
    if [ $? -eq 0 ]; then
        echo "✅ Contract başarıyla initialize edildi!"
        echo ""
        echo "🎯 Deploy tamamlandı! Şimdi frontend'de aşağıdaki ayarları yapın:"
        echo "1. .env.local dosyasında:"
        echo "   NEXT_PUBLIC_BOOKIE_CONTRACT_ID=$CONTRACT_ID"
        echo "2. Contract şu anda aktif ve kullanıma hazır!"
        echo ""
        echo "📊 Contract test etmek için:"
        echo "soroban contract invoke --id $CONTRACT_ID --source testnet-deployer --network testnet -- get_stats"
    else
        echo "⚠️  Contract deploy edildi ancak initialize edilemedi"
        echo "📋 Contract ID: $CONTRACT_ID"
        echo "🔧 Manuel initialize için:"
        echo "soroban contract invoke --id $CONTRACT_ID --source testnet-deployer --network testnet -- initialize --admin $PUBLIC_KEY"
    fi
    
else
    echo "❌ Contract deploy edilemedi"
    exit 1
fi

echo ""
echo "🎉 Deploy işlemi tamamlandı!"
