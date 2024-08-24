use rocket::{get, routes, launch};
use rocket::fs::{FileServer, relative};

#[launch]
fn rocket() -> _ {
    rocket::build()
	.mount("/", FileServer::from(relative!("public")))
}
