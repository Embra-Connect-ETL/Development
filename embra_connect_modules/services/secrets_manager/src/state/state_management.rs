use std::sync::Arc;

// [vaultrs] modules.
use vaultrs::client::{Client, VaultClient, VaultClientSettingsBuilder};
use vaultrs::kv2;

// [secrets_manager] modules.
use crate::environment::env_reader::EnvironmentConfig;
use crate::models::session::Secret;

// [error] handling.
use anyhow::{Error, Ok};

pub struct State {
    pub client: Arc<VaultClient>,
}

impl State {
    pub async fn init() -> Result<Self, Error> {
        let env_config = EnvironmentConfig::new();

        let client = VaultClient::new(
            VaultClientSettingsBuilder::default()
                .address(env_config.vault_host_addr)
                .token(env_config.vault_dev_root_token)
                .build()
                .unwrap(),
        )
        .unwrap();

        Ok(Self {
            client: Arc::new(client),
        })
    }
}
