use dbt_service::args::Args;
#[allow(unused_imports)]
use std::{env, io};
use warp::Filter;

#[tokio::main]
async fn main() {
    // Display status message
    println!(
        r#"
        [DBT_SERVICE] IS RUNNING ON PORT [3000]    
    "#
    );

    // println!("Please provide a valid DBT_API_TOKEN before proceeding...");

    // Flush this output stream, ensuring that all intermediately buffered contents reach their destination
    // io::stdout().flush().unwrap();

    // Read token from user input
    // let mut token = String::new();

    // io::stdin()
    //     .read_line(&mut token)
    //     .expect("Failed to read input...");

    // let user_token: &str = token.trim();

    // Add <USER> defined token to ENVIRONMENT
    // env::set_var("DBT_API_TOKEN", user_token);

    // Retrieve <USER> defined token from ENVIRONMENT
    // env::var("DBT_API_TOKEN").unwrap();

    // let arguments = Args {
    //     token: "dbt_dioiIHPIF90NLKN.NM".to_string(), // -> dbt_dioiIHPIF90NLKN.NM
    // };

    // let result = arguments.init_admin_request();
    // println!("\n{}", result);

    // Define filter path
    // let endpoint = warp::path("dbt").map(move || warp::reply::json(&result));

    // [REQUEST] format
    // GET /dbt?command=curl&method=GET&token=dbtu_zh2EVPYZ29VnVsuhyYThdnlIWOz7j8OALYOk7Zo
    // [RESPONSE] => {"data":[{"allow_partial_parsing":false,"allow_repo_caching":false,"billing_email_address":"johndoe@gmail.com"...}}

    // Alternative [REQUEST] format
    // GET /dbt?token=dbtu_zh2EVPYZ29VnVsuhyYThdnlIWOz7j8OALYOk7Zo

    // CORS setup
    let cors = warp::cors()
        .allow_any_origin()
        .allow_methods(vec!["GET", "POST", "DELETE"]);

    let endpoint = warp::get()
        .and(warp::path("dbt"))
        .and(warp::query().map(|a: Args| format!("{}", a.init_admin_request())))
        .with(cors);

    // Serve the results
    warp::serve(endpoint).run(([0, 0, 0, 0], 3000)).await;
}

#[cfg(test)]
mod integration_tests {
    use dbt_service::args::Args;
    #[allow(unused_imports)]
    use std::io;

    #[tokio::test]
    async fn test() {
        // Reading the [TOKEN] via CLI
        let mut token = String::new();

        println!("Please provide a valid DBT_API_TOKEN before proceeding...");

        // Read user input
        io::stdin()
            .read_line(&mut token)
            .expect("Failed to read input...");

        // Trim white space
        let user_token = token.trim();

        let test_arguments = Args {
            token: user_token.to_string(),
        };

        assert_eq!(user_token, test_arguments.token);
    }
}
