#![no_std]
use soroban_sdk::{contractimpl, contracttype, Address, Env, Symbol, BytesN, Vec, String, Map, IntoVal};

#[derive(Clone)]
#[contracttype]
pub struct DataAccessRequest {
    pub requester: Address,
    pub data_type: Symbol,
    pub price: i128,
    pub duration_days: u32,
    pub approved: bool,
}

pub struct BookieContract;

#[contractimpl]
impl BookieContract {
    pub fn create_request(
        env: Env,
        requester: Address,
        data_type: Symbol,
        price: i128,
        duration_days: u32,
    ) {
        let mut requests: Vec<DataAccessRequest> = env.storage().get(&Symbol::short("requests")).unwrap_or(Vec::new(&env));
        let req = DataAccessRequest {
            requester,
            data_type,
            price,
            duration_days,
            approved: false,
        };
        requests.push_back(req);
        env.storage().set(&Symbol::short("requests"), &requests);
    }

    pub fn approve_request(env: Env, index: u32) {
        let mut requests: Vec<DataAccessRequest> = env.storage().get(&Symbol::short("requests")).unwrap_or(Vec::new(&env));
        if let Some(mut req) = requests.get(index) {
            req.approved = true;
            requests.set(index, req);
            env.storage().set(&Symbol::short("requests"), &requests);
        }
    }

    pub fn get_requests(env: Env) -> Vec<DataAccessRequest> {
        env.storage().get(&Symbol::short("requests")).unwrap_or(Vec::new(&env))
    }
}
