extern crate diesel;
use super::{model, schema::embra, BaseConfig, RelationalDatabase};
use diesel::{pg::PgConnection, Connection, QueryDsl, RunQueryDsl};
use model::Embra;
// use schema::embra::dsl::*;

pub struct PostgresAdapter {
    connection_string: String,
}

impl PostgresAdapter {
    pub fn new(config: BaseConfig) -> Self {
        PostgresAdapter {
            connection_string: config.generate_connection_string(RelationalDatabase::POSTGRESQL),
        }
    }

    pub fn establish_connection(&self) -> PgConnection {
        if let Ok(connection) = PgConnection::establish(self.connection_string.as_str()) {
            connection
        } else {
            panic!("Error connecting to {}", self.connection_string)
        }
    }

    pub fn fetch_data(self) {
        let results = embra::table
            .limit(2)
            .load::<Embra>(&mut self.establish_connection())
            .expect("error reading from db");

        for result in results {
            println!("{}", result.id);
        }
    }
}
