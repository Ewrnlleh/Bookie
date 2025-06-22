#!/bin/bash

# Bookie Smart Contract Test Script
# Bu script deploy edilmiş contract'ı test eder

set -e

echo "🧪 Bookie Smart Contract Test Script"
echo "==================================="

# Contract ID'yi .env.local'dan al veya parametre olarak al
if [ -z "$1" ]; then
    if [ -f "../../frontend/.env.local" ]; then
        CONTRACT_ID=$(grep "NEXT_PUBLIC_BOOKIE_CONTRACT_ID=" ../../frontend/.env.local | cut -d'=' -f2)
        if [ -z "$CONTRACT_ID" ]; then
            echo "❌ Contract ID bulunamadı. Lütfen parametre olarak verin:"
            echo "Usage: ./test.sh <CONTRACT_ID>"
            exit 1
        fi
    else
        echo "❌ .env.local dosyası bulunamadı ve Contract ID verilmedi."
        echo "Usage: ./test.sh <CONTRACT_ID>"
        exit 1
    fi
else
    CONTRACT_ID="$1"
fi

echo "📋 Test edilecek Contract ID: $CONTRACT_ID"

# Testnet network'ü kullan
NETWORK="testnet"
DEPLOYER_KEY="testnet-deployer"

# Deployer adresini al
DEPLOYER_ADDRESS=$(soroban keys address $DEPLOYER_KEY)
echo "🔑 Deployer Address: $DEPLOYER_ADDRESS"

echo ""
echo "🧪 Contract fonksiyonlarını test ediyoruz..."

# 1. Contract istatistiklerini al
echo ""
echo "📊 1. Contract İstatistikleri:"
soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$DEPLOYER_KEY" \
    --network "$NETWORK" \
    -- get_stats

# 2. Veri asset'i listele
echo ""
echo "📦 2. Veri Asset'i Listeliyoruz:"
soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$DEPLOYER_KEY" \
    --network "$NETWORK" \
    -- list_data_asset \
    --seller "$DEPLOYER_ADDRESS" \
    --id "test_health_data_001" \
    --title "Test Sağlık Verisi" \
    --description "Anonim hasta verileri test seti" \
    --data_type "health" \
    --price "100000000" \
    --ipfs_cid "QmTestHealthData123456789" \
    --encryption_key "health_encryption_key_123" \
    --size "2.5MB"

if [ $? -eq 0 ]; then
    echo "✅ Veri asset'i başarıyla listelendi"
else
    echo "❌ Veri asset'i listelenirken hata oluştu"
fi

# 3. Tüm asset'leri listele
echo ""
echo "📋 3. Tüm Asset'leri Listeliyoruz:"
soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$DEPLOYER_KEY" \
    --network "$NETWORK" \
    -- get_data_assets

# 4. İkinci bir asset ekle
echo ""
echo "📦 4. İkinci Asset Ekliyoruz:"
soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$DEPLOYER_KEY" \
    --network "$NETWORK" \
    -- list_data_asset \
    --seller "$DEPLOYER_ADDRESS" \
    --id "test_finance_data_002" \
    --title "Test Finans Verisi" \
    --description "Anonim finansal işlem verileri" \
    --data_type "finance" \
    --price "200000000" \
    --ipfs_cid "QmTestFinanceData987654321" \
    --encryption_key "finance_encryption_key_456" \
    --size "5.0MB"

# 5. Veri erişim talebi oluştur
echo ""
echo "📨 5. Veri Erişim Talebi Oluşturuyoruz:"
soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$DEPLOYER_KEY" \
    --network "$NETWORK" \
    -- create_request \
    --requester "$DEPLOYER_ADDRESS" \
    --data_type "medical_research" \
    --price "50000000" \
    --duration_days "30"

# 6. Tüm talepleri listele
echo ""
echo "📋 6. Tüm Talepleri Listeliyoruz:"
soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$DEPLOYER_KEY" \
    --network "$NETWORK" \
    -- get_requests

# 7. Talebi onayla
echo ""
echo "✅ 7. İlk Talebi Onaylıyoruz:"
soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$DEPLOYER_KEY" \
    --network "$NETWORK" \
    -- approve_request \
    --index "0"

# 8. Güncel istatistikleri al
echo ""
echo "📊 8. Güncel İstatistikler:"
soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$DEPLOYER_KEY" \
    --network "$NETWORK" \
    -- get_stats

# 9. Asset detaylarını al
echo ""
echo "🔍 9. Asset Detaylarını Alıyoruz:"
soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$DEPLOYER_KEY" \
    --network "$NETWORK" \
    -- get_asset_details \
    --asset_id "test_health_data_001"

echo ""
echo "🎉 Test senaryosu tamamlandı!"
echo ""
echo "📝 Test Özeti:"
echo "- ✅ Contract initialize edildi"
echo "- ✅ 2 adet veri asset'i eklendi"
echo "- ✅ 1 adet veri erişim talebi oluşturuldu"
echo "- ✅ Talep onaylandı"
echo "- ✅ Tüm sorgular çalıştırıldı"
echo ""
echo "🌐 Contract şu anda Stellar Testnet'te aktif ve çalışıyor!"
echo "🔗 Contract ID: $CONTRACT_ID"
echo ""
echo "💡 Frontend'den test etmek için:"
echo "1. Freighter wallet'ı kurun"
echo "2. Testnet'e geçin"
echo "3. Friendbot'tan XLM alın"
echo "4. http://localhost:3004/marketplace adresini ziyaret edin"
