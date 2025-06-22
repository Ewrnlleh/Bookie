#![cfg(test)]

use super::{BookieContract, BookieContractClient};
use soroban_sdk::{
    testutils::Address as _,
    symbol_short, Address, Env, String,
};

#[test]
fn test_contract_initialization() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BookieContract);
    let client = BookieContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    
    // Contract'ı başlat
    client.initialize(&admin);
    
    // İstatistikleri kontrol et
    let stats = client.get_stats();
    assert_eq!(stats.get(symbol_short!("total_assets")).unwrap(), 0);
}

#[test]
fn test_list_data_asset() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BookieContract);
    let client = BookieContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let seller = Address::generate(&env);
    
    client.initialize(&admin);

    // Veri asset'i listele
    let result = client.list_data_asset(
        &seller,
        &String::from_str(&env, "asset_001"),
        &String::from_str(&env, "Test Sağlık Verisi"),
        &String::from_str(&env, "Anonim sağlık verileri"),
        &String::from_str(&env, "health"),
        &100_000_000i128, // 10 XLM (7 decimal places)
        &String::from_str(&env, "QmTestIPFSHash123"),
        &String::from_str(&env, "encryption_key_123"),
        &String::from_str(&env, "2.5MB"),
    );

    assert!(result.is_ok());

    // Asset'leri listele
    let assets = client.get_data_assets();
    assert_eq!(assets.len(), 1);
    
    let asset = assets.get(0).unwrap();
    assert_eq!(asset.title, String::from_str(&env, "Test Sağlık Verisi"));
    assert_eq!(asset.price, 100_000_000i128);
    assert_eq!(asset.seller, seller);
}

#[test]
fn test_purchase_data_asset() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BookieContract);
    let client = BookieContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    
    client.initialize(&admin);

    // Veri asset'i listele
    client.list_data_asset(
        &seller,
        &String::from_str(&env, "asset_001"),
        &String::from_str(&env, "Test Verisi"),
        &String::from_str(&env, "Test açıklaması"),
        &String::from_str(&env, "health"),
        &100_000_000i128,
        &String::from_str(&env, "QmTestIPFSHash"),
        &String::from_str(&env, "test_encryption_key"),
        &String::from_str(&env, "1MB"),
    ).unwrap();

    // Satın alma işlemi
    let encryption_key = client.purchase_data(
        &buyer,
        &String::from_str(&env, "asset_001"),
        &100_000_000i128,
    );

    assert!(encryption_key.is_ok());
    assert_eq!(encryption_key.unwrap(), String::from_str(&env, "test_encryption_key"));

    // Kullanıcının satın alımlarını kontrol et
    let purchases = client.get_user_purchases(&buyer);
    assert_eq!(purchases.len(), 1);
    
    let purchase = purchases.get(0).unwrap();
    assert_eq!(purchase.buyer, buyer);
    assert_eq!(purchase.asset_id, String::from_str(&env, "asset_001"));
    assert_eq!(purchase.price_paid, 100_000_000i128);
}
