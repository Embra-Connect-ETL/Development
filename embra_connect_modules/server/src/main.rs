use rocket::fs::{relative, FileServer};
use rocket::launch;

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", FileServer::from(relative!("public")))
}
