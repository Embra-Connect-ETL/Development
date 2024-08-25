#![allow(unused)]
pub mod environment;
pub mod models;
pub mod state;

// [async].
use tokio::main;

// [secrets_manager] modules.
use models::session::Secret;
use state::state_management::State;

#[main]
async fn main() {
    /*
        Usage examples.
    */

    let state = State::init().await.unwrap();
    let client = state.client;

    // let secret = Secret {
    //     key: "key_aSeR9E90RVldsddvsWWFbvSfdf".to_owned(),
    //     password: "pwd_aSeR9E90RVldsddvsWWFbvSfdf".to_owned(),
    // };

    // Store secret.
    // Secret::add(&client, "secret", "user_secret", &secret).await;

    // Read secret.
    // Secret::read(&client, "secret", "user_secret").await;

    // Delete secret.
    // Secret::delete(&client, "secret", "user_secret").await;
}
