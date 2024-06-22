#![allow(dead_code)]
mod model;
pub mod postgresql_adapter;
mod schema;

#[derive(Debug)]
pub enum RelationalDatabase {
    MYSQL,
    SQLSEVER,
    POSTGRESQL,
}
#[derive(Debug)]
pub struct BaseConfig {
    host: String,
    username: String,
    password: String,
    database_name: String,
}

impl BaseConfig {
    pub fn new(host: String, username: String, password: String, database_name: String) -> Self {
        BaseConfig {
            host,
            username,
            password,
            database_name,
        }
    }

    pub fn generate_connection_string(&self, db_type: RelationalDatabase) -> String {
        match db_type {
            RelationalDatabase::POSTGRESQL => {
                format!(
                    "postgres://{}:{}@{}/{}",
                    self.username, self.password, self.host, self.database_name
                )
            }

            RelationalDatabase::SQLSEVER => {
                format!("")
            }

            RelationalDatabase::MYSQL => {
                format!("")
            }
        }
    }
}
