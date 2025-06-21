#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, String, Vec};
use soroban_sdk::contracttype; // contracttype attribute'unu import et

// Satıştaki her bir veri parçasını temsil eden yapı
#[contracttype]
#[derive(Clone)] // Clone trait'ini ekleyin
pub struct DataAsset {
    pub owner: Address,         // Verinin sahibi
    pub ipfs_cid: String,       // IPFS'teki adresi
    pub price: i128,            // Fiyatı (Stellar'ın temel birimi cinsinden)
    pub is_sold: bool,          // Satılıp satılmadığı
}

#[contract]
pub struct DataMarketplace;

#[contractimpl]
impl DataMarketplace {
    // Yeni bir veriyi satışa çıkarmak için fonksiyon
    // Dışarıdan birisi bu fonksiyonu çağırdığında yeni bir varlık oluşturulur.
    pub fn list_data(env: soroban_sdk::Env, owner: Address, ipfs_cid: String, price: i128) -> u64 {
        owner.require_auth(); // Bu işlemi sadece cüzdan sahibi yapabilir.

        let asset_id_key = symbol_short!("next_id");
        let mut asset_id: u64 = env.storage().instance().get(&asset_id_key).unwrap_or(0);

        let asset = DataAsset {
            owner,
            ipfs_cid,
            price,
            is_sold: false,
        };

        // Veriyi depolamaya kaydediyoruz.
        env.storage().instance().set(&asset_id, &asset);
        env.storage().instance().set(&asset_id_key, &(asset_id + 1));

        asset_id // Frontend'e göstermek için ID'yi geri döndür.
    }

    // Bir veriyi satın almak için fonksiyon
    pub fn buy_data(env: soroban_sdk::Env, buyer: Address, asset_id: u64, token_contract_id: Address) {
        buyer.require_auth();

        let mut asset: DataAsset = env.storage().instance().get(&asset_id).expect("Asset not found");
        assert!(!asset.is_sold, "This asset has already been sold");

        // Ödemeyi alıcıdan satıcıya transfer et
        // Burası için Stellar'ın token transfer örneğine bakmak gerekir.
        // Soroban SDK'sından token sözleşmesi client'ını kullanarak transferi gerçekleştirin.
        use soroban_sdk::token;
        let token_client = token::Client::new(&env, &token_contract_id);
        token_client.transfer(&buyer, &asset.owner, &asset.price);

        asset.is_sold = true;
        env.storage().instance().set(&asset_id, &asset);
    }
    
    // Satıştaki bir varlığın detaylarını getirmek için
    pub fn get_asset(env: soroban_sdk::Env, asset_id: u64) -> DataAsset {
        env.storage().instance().get(&asset_id).expect("Asset not found")
    }

    // Tüm varlıkları listelemek için (Bu fonksiyon, mevcut Soroban depolama yapısında büyük veri setleri için verimsiz olabilir,
    // ancak MVP için basitleştirilmiş bir yaklaşımdır. Gerçek uygulamalarda indeksleme veya olaylar kullanılır.)
    pub fn get_all_assets(env: soroban_sdk::Env, start_id: u64, limit: u64) -> Vec<DataAsset> {
        let mut assets = Vec::new(&env);
        let next_id: u64 = env.storage().instance().get(&symbol_short!("next_id")).unwrap_or(0);
        let end_id = (start_id + limit).min(next_id);
        for i in start_id..end_id {
            if let Some(asset) = env.storage().instance().get(&i) {
                assets.push_back(asset);
            }
        }
        assets
    }
}