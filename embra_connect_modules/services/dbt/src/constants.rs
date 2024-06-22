use dotenv::dotenv;

#[derive(Debug)]
pub struct Constants {
    pub url: String,
    pub dbt_api_token: String,
}

impl<'a> Constants {
    pub fn init() -> Self {
        // load <ENVIRONMENT VARIABLES>
        dotenv().ok();

        let dbt_api_url_config = std::env::var("DBT_API_URL").expect("[DBT_API_URL] must be set");
        let dbt_api_token_config =
            std::env::var("DBT_API_TOKEN").expect("[DBT_API_TOKEN] must be set");

        let _constants = Constants {
            url: dbt_api_url_config,
            dbt_api_token: dbt_api_token_config,
        };

        _constants
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::Constants;
    use dotenv::dotenv;

    #[test]
    fn constants_test() {
        // Initialize <ENVIRONMENT VARIABLES>
        dotenv().ok();

        let dbt_api_url_config = std::env::var("DBT_API_URL").expect("[DBT_API_URL] must be set");
        let dbt_api_token_config =
            std::env::var("DBT_API_TOKEN").expect("[DBT_API_TOKEN] must be set");

        let constants = Constants {
            url: dbt_api_url_config,
            dbt_api_token: dbt_api_token_config,
        };

        assert_eq!(constants.url, Constants::init().url);
        assert_eq!(constants.dbt_api_token, Constants::init().dbt_api_token);
    }
}
