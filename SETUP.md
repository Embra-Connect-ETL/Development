# Running the project locally

## Project Structure
The **project** is structured as follows:
```sh
/Development/embra_connect_modules/
├──  README.md  # Project documentation
├──  docker-compose.yml  # Docker configuration
├──  scripts/  # Project scripts
├──  server/  # Server-related code
│  └──  .env  # Symlink pointing to ../.env
├──  services/  # Services folder
│  ├──  dbt/
│  │  └──  .env  # Symlink pointing to ../../.env
│  └──  sdk/
│  └──  .env  # Symlink pointing to ../../.env
├──  symlink/  # Rust project for creating symlinks
│  ├──  Cargo.toml  # Rust project configuration
│  └──  src/
│  └──  main.rs  # Symlink creation logic
└──  .env  # Source .env file at project root
```

This document outlines the steps to set up the project, including its **submodules**, on a fresh **development environment**.

## Prerequisites

Before proceeding, ensure the following tools are installed:

1.  **Git** - To clone the repository and manage submodules.
2.  **Docker** & **Docker Compose**.
3.  **Python** (Version 3.8 or above).
4.  **Node.js** & **npm**.
5.  **bash/zsh** (or equivalent shell).
6.  **Rust** & **Cargo**.

----------

## Step 1: Clone the Repository

```bash
# Clone the main repository with submodules
$ git clone --recurse-submodules <repo-url>

# Navigate to the project directory
$ cd <repo-name>
```

If the **submodules are not cloned** automatically, run:

```bash
$ git submodule update --init --recursive
```

## Step 2: Setup `embra_connect_modules`

The `embra_connect_modules` directory contains essential services, configurations, and symlink utilities.

### 1. Start Docker Services

1.  **Navigate to `embra_connect_modules`:**
    
    ```bash
    $ cd embra_connect_modules    
    ```
    
2.  **Run Docker Compose:** Use `docker-compose.yml` to spin up the required containers.
    
    ```bash
    $ docker-compose up -d
    ```
    
    -   This will start all the necessary services defined in `docker-compose.yml`.
    -   Use `docker-compose logs` to debug any startup issues.
3.  **Verify Services:** Ensure that all containers are running as expected:
    
    ```bash
    $ docker ps
    ```
    
### 2. Create Symlinks

The `embra_connect_modules` directory uses symlinks to link `.env` files in multiple locations.

1.  **Ensure the Source `.env` File Exists** The source `.env` file is located at:
    
    ```bash
    embra_connect_modules/.env
    ```
    
    If this file is missing, create it using the provided **example** configuration.
    
2.  **Run Symlink Utility** The `symlink/` folder contains a Rust-based project for creating symlinks. Run the following commands:
    
    ```bash
    # Navigate to the symlink utility directory
    $ cd symlink
    
    # Build the symlink utility
    $ cargo build --release
    
    # Execute the symlink creation utility
    $ ./target/release/symlink
    ```
    
    This will automatically create **symlinks** to the `.env` file in:
    
    -   `server/.env`
    -   `services/dbt/.env`
    -   `services/sdk/.env`
    
    
## Step 3: Verifying Symlinks

### Unix-like Systems (Linux/macOS)
* Check if the symlinks were created:
```bash
ls  -l  server/.env
ls  -l  services/dbt/.env
ls  -l  services/sdk/.env
```

* Expected Output:
```sh
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
1.  **Editing the Source `.env` File**: **Changes in the root**  `.env` file **will reflect in all symlinked files** because they point to the same source.

2.  **Editing a Symlinked `.env` File**: **Editing any of the symlinked**  `.env` files **updates the root**  `.env` file.

3.  **Deleting the Source `.env` File**: If the root `.env` file is deleted, all symlinks will become **broken**.

4.  **Recreating Symlinks**: **Re**-run the `symlink` crate to recreate the symlinks.


## Common Issues and Fixes

### 1. **Symlink Creation Fails**
-  **Cause**: Insufficient permissions or symlink support is disabled.
-  **Fix**: Ensure you have **write permissions** to the target directories:

```bash
chmod +w server services/dbt services/sdk
```

- On Windows, enable **Developer Mode** to allow symlink creation:

- Go to `Settings > Update & Security > For Developers > Developer Mode`.

-  **Administrator Privileges**:

On Windows, symlink creation may require **Administrator privileges**. Run the terminal as an Administrator.

----------

### 2. **A File Already Exists at the Target Path**
-  **Cause**: A regular file or folder exists where the symlink should be created.
-  **Fix**: Remove the existing file and re-run the program:

```bash
rm server/.env
rm services/dbt/.env
rm services/sdk/.env
cargo run
```
----------

### 3. **Broken Symlinks**
-  **Cause**: The root `.env` file was deleted or moved.
-  **Fix**: Restore the root `.env` file and verify the symlinks:

```bash
find . -type l !  -exec  test  -e  {}  \;  -print
```
**Re**-run the `symlink` crate to **recreate** the symlinks if necessary.

----------

### 4. **Symlink Overwritten with a Regular File**
-  **Cause**: The symlink was replaced with a new file.
-  **Fix**: Delete the incorrect file and recreate the symlink:

```bash
rm server/.env
rm services/dbt/.env
rm services/sdk/.env
cargo run
```
----------

### 5. **Symlink Paths Are Incorrect**
-  **Cause**: The paths in the program are incorrect relative to the root `.env` file.
-  **Fix**: Verify the paths in your Rust program:

```rust
let target_env_paths:  Vec<PathBuf> =  vec![
	PathBuf::from("../server/.env"),
	PathBuf::from("../services/dbt/.env"),
	PathBuf::from("../services/sdk/.env"),
];
```

**NOTE** - If any **changes** that are introduced **modify the current folder structure**, the **paths** should be **updated to match the project structure**.
    
    If needed, symlinks can be created **manually**:
    
    ```bash
    $ ln -s ../.env server/.env
    $ ln -s ../../.env services/dbt/.env
    $ ln -s ../../.env services/sdk/.env
    ```

## Step 4: Final Verification

1.  Confirm all services are **running**:
 
    ```bash
    $ docker ps    
    ```
    
2.  Verify symlinks and services configurations by checking `.env` file paths:
    
    ```bash
    $ ls -l embra_connect_modules/server/.env
    $ ls -l embra_connect_modules/services/dbt/.env
    $ ls -l embra_connect_modules/services/sdk/.env
    ```
    
3.  Test the application **endpoints** and **interfaces** as needed.
    
4.  Refer to the individual `README.md` files in each directory (e.g., `embra_connect_modules/README.md`) for further configuration or troubleshooting.
    
----------

## Additional Notes

### Updating Submodules

-   **Submodules:** Always keep submodules updated:

### 1. Pull the Latest Changes for Submodules
To update all submodules to their latest changes from their respective repositories:

```bash
$ git submodule update --remote --merge
```

-   **What does this command do?**
    -   `--remote` fetches the latest changes from the submodule's remote repository.
    -   `--merge` merges those updates into the currently checked-out branch of the submodule.

### 2. Update Submodules Locally from the Main Project
If changes to the submodules need to be pulled while remaining within this project directory:

```bash
$ git submodule foreach git pull origin main
```

This command will:
-   *Iterate* through all submodules.
-   Pull the *latest changes* from the `main` branch of each submodule.

Verify the changes using:
```bash
$ git status
```

If everything looks correct, commit the updates to the parent repository:

```bash
$ git add .
$ git commit -m "Updated submodules to latest versions"
```
    
-   **Environment Variables:** If the project uses environment variables, ensure they are set correctly. Refer to `.env.example` or the documentation for specific instructions.

## Updating submodules from the main Development repo
To update the submodules in your Git repository and reflect those changes on the actual repositories, follow these steps:

### Step 1: Update Submodule References in Your Repo

1.  **Navigate to the main repository**: If you're not already in the repository's directory, go to it using the command line:
    
    ```bash
    cd <repo-name>
    ```
    
2.  **Update Submodules**: To pull the latest changes for the submodules, run the following command:
    
    ```bash
    git submodule update --remote
    ```
    
    This command updates all the submodules to the latest commit on their respective branches (by default, the `master` or `main` branch). If the submodules use specific branches, the update will reflect those as well.
    

### Step 2: Commit the Changes

Once the submodules are updated, you’ll need to commit the new submodule references (i.e., the updated commits for the submodules).

1.  **Check for Changes**: To see the updated submodule references, run:
    
    ```bash
    git status
    ```
    
    This should show the submodule directories as modified, as they now point to new commits.
    
2.  **Stage the Changes**: Stage the submodule changes (this is necessary because submodules are tracked by commit reference):
    
    ```bash
    git add embra_connect_modules/server/public/pages/connect_ide
    git add embra_connect_modules/services/sdk
    ```
    
3.  **Commit the Changes**: Commit the updated submodule references:
    
    ```bash
    git commit -m "Update submodules to latest commit"
    ```
    
4.  **Push the Changes**: Finally, push the changes to your main repository:
    
    ```bash
    git push
    ```

### Step 3: Push Changes to the Submodule Repositories (Optional)

If you’ve made changes inside the submodules themselves (not just updating them), you'll need to push those changes to the submodule repositories.

1.  **Go to the Submodule Directory**: Navigate to each submodule:
    
    ```bash
    cd embra_connect_modules/server/public/pages/connect_ide
    ```
    
2.  **Push Changes**: If you’ve made changes to the submodule and want to push them, run:
    
    ```bash
    git push
    ```
    
    Repeat the same process for the second submodule:
    
    ```bash
    cd ../services/sdk
    git push
    ```

### Recap

-   Use `git submodule update --remote` to update the submodule to the latest commit.
-   Commit the updated submodule references in your main repo.
-   Optionally, push changes to the submodule repositories if you've made any modifications.

These steps will ensure the changes are reflected **both** in the **main repository** and in the **submodule repositories** if required.


## Troubleshooting

-   **Docker Issues:** Check container logs using `docker-compose logs`.
-   **Symlink Errors:** Verify symlinks were created correctly and point to the correct source `.env` file.
-   **Permission Errors:** Ensure scripts have execute permissions (`chmod +x`).
-   **Dependencies Not Installing:** Verify correct Python/Node.js versions.

If issues persist, refer to the `CONTRIBUTING.md` for guidelines or contact the maintainers.