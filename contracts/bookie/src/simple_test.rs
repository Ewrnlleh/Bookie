use soroban_sdk::{contract, contractimpl, contractmeta, Address, Env, String};

contractmeta!(key = "Description", val = "Simple test contract");

#[contract]
pub struct SimpleContract;

#[contractimpl]
impl SimpleContract {
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&"admin", &admin);
    }
    
    pub fn hello(env: Env, to: Address) -> String {
        String::from_str(&env, "Hello World")
    }
}
