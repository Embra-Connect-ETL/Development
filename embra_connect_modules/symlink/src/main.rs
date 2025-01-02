#![allow(unused)]
use std::fs;
use std::os::unix::fs as unix_fs;
#[cfg(target_os = "windows")]
use std::os::windows::fs as windows_fs;
use std::path::{Path, PathBuf};
use std::process::Command;

fn main() {
    /*----------------
    Source .env file
    -----------------*/
    let source_env_path = Path::new("../.env");

    /*--------------------------------------
    Target .env file paths

    Note -> We might not need to generate
    symlinks for all projects.
    ----------------------------------------*/
    let target_env_paths: Vec<PathBuf> = vec![
        PathBuf::from("../server/.env"),
        PathBuf::from("../services/dbt/.env"),
        PathBuf::from("../services/sdk/.env"),
        PathBuf::from("../services/generic-auth-module/.env"),
        PathBuf::from("../services/connect_ide/server/.env"),
    ];

    /*------------------------------------
    Create symlinks for each target path
    -------------------------------------*/
    for target_path in target_env_paths {
        if target_path.exists() {
            match target_path.symlink_metadata() {
                Ok(metadata) if metadata.file_type().is_symlink() => {
                    println!("Symlink already exists: {}", target_path.display());
                }
                _ => {
                    println!(
                        "A file or folder exists at {}, cannot create symlink.",
                        target_path.display()
                    );
                }
            }
        } else {
            match create_symlink(&source_env_path, &target_path) {
                Ok(_) => println!("Symlink created at {}", target_path.display()),
                Err(e) => eprintln!("Error creating symlink: {}", e),
            }
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn create_symlink(source: &Path, target: &Path) -> std::io::Result<()> {
    unix_fs::symlink(source, target)?;
    println!("Symlink created on Unix-like system");
    Ok(())
}

#[cfg(target_os = "windows")]
fn create_symlink(source: &Path, target: &Path) -> std::io::Result<()> {
    windows_fs::symlink_file(source, target)?;
    println!("Symlink created on Windows");
    Ok(())
}
