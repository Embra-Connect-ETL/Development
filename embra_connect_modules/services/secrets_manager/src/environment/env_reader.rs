use dotenvy::dotenv;
use std::env;

#[derive(Debug)]
pub struct EnvironmentConfig {
    pub vault_addr: String,
    pub vault_host_addr: String,
    pub vault_dev_root_token: String,
}

impl EnvironmentConfig {
    pub fn new() -> Self {
        dotenv().ok();

        let vault_addr = env::var_os("VAULT_ADDR")
            .expect("[VAULT_ADDR] must be set.")
            .into_string()
            .unwrap();

        let vault_host_addr = env::var_os("VAULT_HOST_ADDR")
            .expect("[VAULT_HOST_ADDR] must be set.")
            .into_string()
            .unwrap();

        let vault_dev_root_token = env::var_os("VAULT_DEV_ROOT_TOKEN")
            .expect("[VAULT_DEV_ROOT_TOKEN] must be set.")
            .into_string()
            .unwrap();

        Self {
            vault_addr,
            vault_host_addr,
            vault_dev_root_token,
        }
    }
}

impl Default for EnvironmentConfig {
    fn default() -> Self {
        Self::new()
    }
}
