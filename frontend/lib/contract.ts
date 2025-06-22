// Bookie Data Marketplace Contract Configuration
// Contract WASM Hash: 1483fbeecd3a0e137f3ac4532e154c027547af1bbcf4f665ad86d0b693dbb5a1

// Contract deployed addresses (will be updated when deployment succeeds)
export const CONTRACT_ADDRESSES = {
  testnet: '', // To be filled when deployment works
  futurenet: '', // To be filled when deployment works  
  local: '', // For local testing
} as const;

// Contract WASM hash (successfully installed on networks)
export const CONTRACT_WASM_HASH = '1483fbeecd3a0e137f3ac4532e154c027547af1bbcf4f665ad86d0b693dbb5a1';

// Network configurations
export const NETWORKS = {
  testnet: {
    rpc: 'https://soroban-testnet.stellar.org',
    passphrase: 'Test SDF Network ; September 2015',
    name: 'testnet'
  },
  futurenet: {
    rpc: 'https://rpc-futurenet.stellar.org',
    passphrase: 'Test SDF Future Network ; October 2022',
    name: 'futurenet'
  },
  local: {
    rpc: 'http://localhost:8000/soroban/rpc',
    passphrase: 'Standalone Network ; February 2017',
    name: 'local'
  }
} as const;

export type NetworkName = keyof typeof NETWORKS;

// Default network for development
export const DEFAULT_NETWORK: NetworkName = 'testnet';

// Contract function names (matching the Rust implementation)
export const CONTRACT_FUNCTIONS = {
  // Core functions
  initialize: 'initialize',
  listDataAsset: 'list_data_asset',
  purchaseData: 'purchase_data',
  createRequest: 'create_request',
  approveRequest: 'approve_request',
  
  // View functions
  getDataAssets: 'get_data_assets',
  getRequests: 'get_requests',
  getUserPurchases: 'get_user_purchases',
  getAssetDetails: 'get_asset_details',
  getStats: 'get_stats',
} as const;

// Contract types (matching Rust structs)
export interface DataAsset {
  id: string;
  title: string;
  description: string;
  data_type: string;
  price: bigint;
  seller: string;
  ipfs_cid: string;
  encryption_key: string;
  listed_date: bigint;
  size: string;
  is_active: boolean;
}

export interface PurchaseRecord {
  buyer: string;
  asset_id: string;
  price_paid: bigint;
  purchase_date: bigint;
  access_granted: boolean;
}

export interface DataAccessRequest {
  requester: string;
  data_type: string;
  price: bigint;
  duration_days: number;
  approved: boolean;
  created_date: bigint;
}

// Contract deployment status
export const DEPLOYMENT_STATUS = {
  wasmInstalled: true,
  wasmHash: CONTRACT_WASM_HASH,
  deploymentPending: true, // XDR processing issue needs resolution
  contractWorking: true,
  lastUpdate: '2025-06-22',
  note: 'Contract WASM successfully installed on testnet and futurenet. Deployment pending XDR issue resolution.'
} as const;