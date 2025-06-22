use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Symbol, String, Vec, Map
};

#[contract]
pub struct BookieContract;

// Hata tipleri - Sadece enum olarak
#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    DataAssetNotFound = 1,
    InsufficientPayment = 2,
    UnauthorizedAccess = 3,
    AssetAlreadyPurchased = 4,
    InvalidPrice = 5,
}

// Veri asset yapısı
#[derive(Clone)]
#[contracttype]
pub struct DataAsset {
    pub id: String,
    pub title: String,
    pub description: String,
    pub data_type: String,
    pub price: i128,
    pub seller: Address,
    pub ipfs_cid: String,
    pub encryption_key: String,
    pub listed_date: u64,
    pub size: String,
    pub is_active: bool,
}

// Satın alma kaydı
#[derive(Clone)]
#[contracttype]
pub struct PurchaseRecord {
    pub buyer: Address,
    pub asset_id: String,
    pub price_paid: i128,
    pub purchase_date: u64,
    pub access_granted: bool,
}

// Veri erişim talebi
#[derive(Clone)]
#[contracttype]
pub struct DataAccessRequest {
    pub requester: Address,
    pub data_type: String,
    pub price: i128,
    pub duration_days: u32,
    pub approved: bool,
    pub created_date: u64,
}

#[contract]
pub struct BookieContract;

#[contractimpl]
impl BookieContract {
    
    /// Contract'ı başlatır
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("init"), &true);
    }

    /// Yeni veri asset'i listeler
    pub fn list_data_asset(
        env: Env,
        seller: Address,
        id: String,
        title: String,
        description: String,
        data_type: String,
        price: i128,
        ipfs_cid: String,
        encryption_key: String,
        size: String,
    ) {
        // Seller yetkilendirmesi
        seller.require_auth();
        
        // Fiyat kontrolü
        if price <= 0 {
            panic!("Invalid price");
        }

        let asset = DataAsset {
            id: id.clone(),
            title,
            description,
            data_type,
            price,
            seller,
            ipfs_cid,
            encryption_key,
            listed_date: env.ledger().timestamp(),
            size,
            is_active: true,
        };

        // Asset'i storage'a kaydet
        let key = symbol_short!("asset");
        env.storage().persistent().set(&(key, id), &asset);
        
        // Asset listesini güncelle
        let mut asset_list: Vec<String> = env.storage().instance()
            .get(&symbol_short!("assets")).unwrap_or(Vec::new(&env));
        asset_list.push_back(asset.id.clone());
        env.storage().instance().set(&symbol_short!("assets"), &asset_list);
    }

    /// Veri asset'ini satın alır
    pub fn purchase_data(
        env: Env,
        buyer: Address,
        asset_id: String,
        payment_amount: i128,
    ) -> String {
        // Buyer yetkilendirmesi
        buyer.require_auth();

        // Asset'i bul
        let asset_key = (symbol_short!("asset"), asset_id.clone());
        let asset: DataAsset = env.storage().persistent()
            .get(&asset_key).expect("Data asset not found");

        // Fiyat kontrolü
        if payment_amount < asset.price {
            panic!("Insufficient payment");
        }

        // Önceden satın alınmış mı kontrol et
        let purchase_key = (symbol_short!("purchase"), buyer.clone(), asset_id.clone());
        if env.storage().persistent().has(&purchase_key) {
            panic!("Asset already purchased");
        }

        // Satın alma kaydı oluştur
        let purchase = PurchaseRecord {
            buyer: buyer.clone(),
            asset_id: asset_id.clone(),
            price_paid: asset.price,
            purchase_date: env.ledger().timestamp(),
            access_granted: true,
        };

        env.storage().persistent().set(&purchase_key, &purchase);

        // Satın alma geçmişini güncelle
        let mut buyer_purchases: Vec<String> = env.storage().persistent()
            .get(&(symbol_short!("buyerpurc"), buyer.clone()))
            .unwrap_or(Vec::new(&env));
        buyer_purchases.push_back(asset_id.clone());
        env.storage().persistent().set(
            &(symbol_short!("buyerpurc"), buyer),
            &buyer_purchases
        );

        // Encryption key'i döndür
        asset.encryption_key
    }

    /// Veri erişim talebi oluşturur
    pub fn create_request(
        env: Env,
        requester: Address,
        data_type: String,
        price: i128,
        duration_days: u32,
    ) {
        requester.require_auth();

        let request = DataAccessRequest {
            requester: requester.clone(),
            data_type,
            price,
            duration_days,
            approved: false,
            created_date: env.ledger().timestamp(),
        };

        let mut requests: Vec<DataAccessRequest> = env.storage().instance()
            .get(&symbol_short!("requests")).unwrap_or(Vec::new(&env));
        requests.push_back(request);
        env.storage().instance().set(&symbol_short!("requests"), &requests);
    }

    /// Veri erişim talebini onaylar
    pub fn approve_request(env: Env, index: u32) {
        let admin: Address = env.storage().instance()
            .get(&symbol_short!("admin")).unwrap();
        admin.require_auth();

        let mut requests: Vec<DataAccessRequest> = env.storage().instance()
            .get(&symbol_short!("requests")).unwrap_or(Vec::new(&env));
        
        if let Some(mut req) = requests.get(index) {
            req.approved = true;
            requests.set(index, req);
            env.storage().instance().set(&symbol_short!("requests"), &requests);
        }
    }

    /// Tüm veri asset'lerini döndürür
    pub fn get_data_assets(env: Env) -> Vec<DataAsset> {
        let asset_list: Vec<String> = env.storage().instance()
            .get(&symbol_short!("assets")).unwrap_or(Vec::new(&env));
        
        let mut assets = Vec::new(&env);
        for asset_id in asset_list.iter() {
            let asset_key = (symbol_short!("asset"), asset_id);
            if let Some(asset) = env.storage().persistent().get::<_, DataAsset>(&asset_key) {
                if asset.is_active {
                    assets.push_back(asset);
                }
            }
        }
        assets
    }

    /// Veri erişim taleplerini döndürür
    pub fn get_requests(env: Env) -> Vec<DataAccessRequest> {
        env.storage().instance()
            .get(&symbol_short!("requests")).unwrap_or(Vec::new(&env))
    }

    /// Kullanıcının satın aldığı asset'leri döndürür
    pub fn get_user_purchases(env: Env, user: Address) -> Vec<PurchaseRecord> {
        let purchase_list: Vec<String> = env.storage().persistent()
            .get(&(symbol_short!("buyerpurc"), user.clone()))
            .unwrap_or(Vec::new(&env));
        
        let mut purchases = Vec::new(&env);
        for asset_id in purchase_list.iter() {
            let purchase_key = (symbol_short!("purchase"), user.clone(), asset_id);
            if let Some(purchase) = env.storage().persistent().get::<_, PurchaseRecord>(&purchase_key) {
                purchases.push_back(purchase);
            }
        }
        purchases
    }

    /// Asset'in detaylarını döndürür
    pub fn get_asset_details(env: Env, asset_id: String) -> Option<DataAsset> {
        let asset_key = (symbol_short!("asset"), asset_id);
        env.storage().persistent().get(&asset_key)
    }

    /// Contract istatistiklerini döndürür
    pub fn get_stats(env: Env) -> Map<Symbol, i128> {
        let mut stats = Map::new(&env);
        
        let asset_list: Vec<String> = env.storage().instance()
            .get(&symbol_short!("assets")).unwrap_or(Vec::new(&env));
        stats.set(symbol_short!("assets"), asset_list.len() as i128);
        
        let requests: Vec<DataAccessRequest> = env.storage().instance()
            .get(&symbol_short!("requests")).unwrap_or(Vec::new(&env));
        stats.set(symbol_short!("requests"), requests.len() as i128);
        
        stats
    }
}
