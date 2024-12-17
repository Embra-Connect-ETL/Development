# Setup for Local Development
## Step #1
### `symlink` creation

This `symlink` crate creates **symbolic links** (*symlinks*) to a **single source** `.env` file located at the **project root**. The symlinks ensure that multiple target directories **share the same environment variables** without duplicating the `.env` file.

## Project Structure

The **project** is structured as follows:

```sh
/Development/embra_connect_modules/
├── README.md                  # Project documentation
├── docker-compose.yml         # Docker configuration
├── scripts/                   # Project scripts
├── server/                    # Server-related code
│   └── .env                   # Symlink pointing to ../.env
├── services/                  # Services folder
│   ├── dbt/
│   │   └── .env               # Symlink pointing to ../../.env
│   └── sdk/
│       └── .env               # Symlink pointing to ../../.env
├── symlink/                   # Rust project for creating symlinks
│   ├── Cargo.toml             # Rust project configuration
│   └── src/
│       └── main.rs            # Symlink creation logic
└── .env                       # Source .env file at project root
```

## How It Works

1.  The `symlink` crate identifies the **source** `.env` file in the **project root** (`./.env`).
2.  It **creates** symbolic links (`.env`) in the following **target directories**:
    -   `server/.env`
    -   `services/dbt/.env`
    -   `services/sdk/.env`
3.  If a symlink **already exists**, it **skips** creation. If a regular file exists, it reports an **error**.


## Setup and Usage
### Prerequisites

-   [Rust](https://www.rust-lang.org/) installed on your system.
-   Write permissions to the target directories.

### Steps to Run

1.  Navigate to the **symlink** project folder:
    
    ```bash
    cd symlink
    ```
    
2.  Run the program:
    
    ```bash
    cargo run
    ```
    
3.  The program will attempt to **create symlinks** in the specified **target directories**.
    
----------

## Verifying Symlinks

### Unix-like Systems (Linux/macOS)

* Check if the symlinks were created:

```bash
ls -l server/.env
ls -l services/dbt/.env
ls -l services/sdk/.env
```

* Expected Output:

```plaintext
server/.env -> ../.env
services/dbt/.env -> ../../.env
services/sdk/.env -> ../../.env

```

### Windows

* To verify symlinks on Windows, run:

```cmd
dir server\.env
```

## Behavior of Symlinks

1.  **Editing the Source `.env` File**:  
    **Changes in the root** `.env` file **will reflect in all symlinked files** because they point to the same source.
    
2.  **Editing a Symlinked `.env` File**:  
    **Editing any of the symlinked** `.env` files **updates the root** `.env` file.
    
3.  **Deleting the Source `.env` File**:  
    If the root `.env` file is deleted, all symlinks will become **broken**.
    
4.  **Recreating Symlinks**:  
    **Re**-run the `symlink` crate to recreate the symlinks.
    


## Common Issues and Fixes

### 1. **Symlink Creation Fails**

-   **Cause**: Insufficient permissions or symlink support is disabled.
    
-   **Fix**:
    
    -   Ensure you have write permissions to the target directories:
        
        ```bash
        chmod +w server services/dbt services/sdk
        ```
        
    -   On Windows, enable **Developer Mode** to allow symlink creation:
        -   Go to `Settings > Update & Security > For Developers > Developer Mode`.
-   **Administrator Privileges**:  
    On Windows, symlink creation may require Administrator privileges. Run the terminal as an Administrator.
    

----------

### 2. **A File Already Exists at the Target Path**

-   **Cause**: A regular file or folder exists where the symlink should be created.
-   **Fix**: Remove the existing file and re-run the program:
    
    ```bash
    rm server/.env
    rm services/dbt/.env
    rm services/sdk/.env
    cargo run
    ```
----------

### 3. **Broken Symlinks**

-   **Cause**: The root `.env` file was deleted or moved.
-   **Fix**: Restore the root `.env` file and verify the symlinks:
    
    ```bash
    find . -type l ! -exec test -e {} \; -print
    ```
    
    **Re**-run the `symlink` crate to **recreate** the symlinks if necessary.
----------

### 4. **Symlink Overwritten with a Regular File**

-   **Cause**: The symlink was replaced with a new file.
-   **Fix**: Delete the incorrect file and recreate the symlink:
    
    ```bash
    rm server/.env
    rm services/dbt/.env
    rm services/sdk/.env
    cargo run
    ```
----------

### 5. **Symlink Paths Are Incorrect**

-   **Cause**: The paths in the program are incorrect relative to the root `.env` file.
-   **Fix**: Verify the paths in your Rust program:

```rust
let target_env_paths: Vec<PathBuf> = vec![
    PathBuf::from("../server/.env"),
    PathBuf::from("../services/dbt/.env"),
    PathBuf::from("../services/sdk/.env"),
];
```

**NOTE** - If any **changes** that are introduced **modify the current folder structure**, the **paths** should be **updated to match the project structure**.

## Notes

-   **Cross-Platform Support**: This program works on both Unix-like systems (Linux/macOS) and Windows.
-   **Safety**: Existing files are **not overwritten**. If a file exists where a symlink is intended, the program will skip the operation and print a warning.