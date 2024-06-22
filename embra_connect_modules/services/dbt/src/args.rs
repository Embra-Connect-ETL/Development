// API URL format -> https://cloud.getdbt.com/api/v2/accounts/
use crate::constants::Constants;
use crate::serialize::EncodedData;
use std::process::{Command, Output};

// Third party crates
use serde::Deserialize;
use serde_json::Value;

#[derive(Debug, Deserialize)]
pub struct Args {
    pub token: String,
}

impl Args {
    /// Creates a request to the DBT administrative API
    pub fn init_admin_request(&self) -> Value {
        // Extract [ENCODED] data
        let data = EncodedData {
            encoded_data: self.token.clone(),
        };

        // Debugging -> Print the [ENCODED] data to the [CONSOLE]
        // println!("[DEBUG -> [SRC] args.rs]\n {:?}\n", data.encoded_data);

        let decoded_data = data.decode_url_data();

        let output = Command::new("curl")
            .arg("--request")
            .arg("GET")
            .arg(Constants::init().url.trim())
            .arg("--header")
            .arg("Content-Type: application/json")
            .arg("--header")
            .arg(format!("Authorization: Token {}", decoded_data))
            .output()
            .expect("Failed to execute command...");

        self.verify_request_output_status(output)
    }

    /// Verify <init_admin_request> output status
    pub fn verify_request_output_status(&self, output: Output) -> Value {
        if output.status.success() {
            println!("\t\n* * * REQUEST COMPLETED SUCCESSFULLY * * *");

            let response = String::from_utf8_lossy(&output.stdout).to_string();

            // Sanitize the response -> Remove escape characters
            let filtered_response = response.replace("\\", "");

            // Parse response
            let parsed_response: Value =
                serde_json::from_str(&filtered_response).expect("\n\nFailed to parse JSON response\nTry checking the [DBT_API_URL] | [DBT_API_TOKEN]");

            // Print <parsed_response> -> Debugging
            println!("\n* * * DISPLAYING <parsed_response> * * *\n");
            println!("{:?}", parsed_response);

            parsed_response
        } else {
            eprintln!("REQUEST FAILED: {:?}", output.status);
            eprintln!("{}", String::from_utf8_lossy(&output.stderr));

            // Return an empty JSON response
            let parsed_response: Value =
                serde_json::from_str("").expect("Failed to parse JSON parse...");

            parsed_response
        }
    }
}
