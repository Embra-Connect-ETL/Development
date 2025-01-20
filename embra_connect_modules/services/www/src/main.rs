#![allow(unused)]
use rocket::fairing::{Fairing, Info, Kind};
use rocket::fs::{relative, FileServer};
use rocket::http::Header;
use rocket::{launch, routes};
use rocket::{Request, Response};
use std::path::PathBuf;
use std::env;

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, PATCH, PUT, DELETE, HEAD, OPTIONS, GET",
        ));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    }
}
/*-----------------------------------------
Handle [RESPONSE] to preflight [REQUESTS].
------------------------------------------*/
#[rocket::options("/<_route_args..>")]
pub async fn options(_route_args: Option<std::path::PathBuf>) -> rocket::http::Status {
    rocket::http::Status::Ok
}

#[launch]
fn rocket() -> _ {
    let current_dir = env::current_dir().expect("Failed to get current directory");
    let public_path: PathBuf = current_dir.join("./public");

    dbg!(&public_path);

    rocket::build()
        .attach(CORS)
        .mount("/", FileServer::from(public_path))
        .mount("/", routes![options])
}
