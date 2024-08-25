// [vaultrs] modules.
use vaultrs::api::kv2::responses::SecretVersionMetadata;
use vaultrs::client::{Client, VaultClient, VaultClientSettingsBuilder};
use vaultrs::error::ClientError;
use vaultrs::kv2;

// [JSON] parsing.
use serde::{Deserialize, Serialize};

use anyhow::Error;

#[derive(Debug, Deserialize, Serialize)]
pub struct Secret {
    pub key: String,
    pub password: String,
}

impl Secret {
    pub async fn new(key: &str, password: &str) -> Result<Self, Error> {
        Ok(Secret {
            key: key.to_owned(),
            password: password.to_owned(),
        })
    }

    pub async fn add(client: &VaultClient, mount: &str, path: &str, secret: &Secret) {
        if client.status().await.is_ok() {
            let result = kv2::set(client, mount, path, secret).await;

            match result {
                Ok(_) => println!("\nSecret has been added to vault successfully!"),
                Err(err) => println!("\nFailed to add secret to vault: {:?}", err),
            }
        }
    }

    pub async fn read(client: &VaultClient, mount: &str, path: &str) -> Result<Secret, Error> {
        match kv2::read(client, mount, path).await {
            Ok(secret) => {
                println!("\n[Secret retrieved successfully]\n {:?}", secret);
                Ok(secret)
            }
            Err(err) => {
                println!("\n[Failed to retrieve the secret]\n {:?}", err);
                Err(anyhow::anyhow!(err))
            }
        }
    }

    pub async fn delete(client: &VaultClient, mount: &str, path: &str) {
        match kv2::delete_latest(client, mount, path).await {
            Ok(_) => println!("\n[Secret deleted successfully]\n"),
            Err(err) => println!("\n[Failed to delete secret]\n {:?}", err),
        }
    }
}
