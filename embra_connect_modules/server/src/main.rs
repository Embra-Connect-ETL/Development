use rocket::fs::{relative, FileServer};
use rocket::launch;

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", FileServer::from(relative!("public")))
        .mount(
            "/editor",
            FileServer::from(relative!("connect_ide/editor/assets")),
        )
}
