The following is a step-by-step guide for **initializing** and **updating submodules** when cloning the repository or pulling changes.

### 1. **Cloning the Repository with Submodules**

After cloning the repository, you can **initialize** and fetch the submodule(s) by running the following command:

```bash
git clone --recurse-submodules https://github.com/Embra-Connect-ETL/Development.git
```

This command will:

-   Clone the main repository (`Development.git`).
-   Automatically initialize and fetch the submodule (`Connect-IDE`) as well.

### 2. **Initializing Submodules After Cloning**

If someone has already cloned the repository without the `--recurse-submodules` option, they can initialize the submodule by running:

```bash
git submodule update --init --recursive
```

This command will:

-   Initialize the submodule(s) defined in `.gitmodules`.
-   Fetch the latest commit for the submodule(s).

### 3. **Fetching Updates for Submodules**

When the submodule is updated in the remote repository (e.g., new commits are pushed), collaborators will need to fetch and update the submodule to reflect these changes. To do this, run the following commands:

-   **Update the main repository** (if you haven't already):
    
    ```bash
    git pull origin master
    ```
    
-   **Update the submodule(s)**:
    
    ```bash
    git submodule update --recursive --remote
    ```
    
    This will:
    
    -   Fetch the latest commits for the submodule from its remote repository.
    -   Update the submodule in your local repository to match the latest version.

### 4. **Committing Submodule Changes**

If you or someone else has made changes to the submodule (e.g., checked out a different branch or made changes to the submodule's content), those changes need to be committed in the main repository.

After updating the submodule, check the status of the submodule:

```bash
git status
```

If the **submodule** has been **updated** (i.e., its commit ID has changed), commit the new state of the submodule:

```bash
git add .gitmodules embra_connect_modules/
git commit -m "Update Connect-IDE submodule"
git push origin master
```

This will commit the submodule reference change to the main repository, allowing others to pull the updated submodule reference.

### 5. **Removing or Deleting a Submodule**

If someone needs to remove a submodule for any reason, they can follow these steps:

-   Delete the submodule directory:
    
    ```bash
    rm -rf embra_connect_modules/server/public/pages/connect_ide
    ```
    
-   Remove the submodule from `.gitmodules`:
    
    ```bash
    git rm --cached embra_connect_modules/server/public/pages/connect_ide
    ```
    
-   Commit the removal:
    
    ```bash
    git commit -m "Remove Connect-IDE submodule"
    git push origin master
    ```
    

This ensures that the submodule is removed from both the working directory and `.gitmodules`, and the change is reflected in the repository.

----------

### Summary of Commands:

-   **Clone with submodules:**
    
    ```bash
    git clone --recurse-submodules <repository_url>
    ```
    
-   **Initialize submodules after cloning:**
    
    ```bash
    git submodule update --init --recursive
    ```
    
-   **Update submodules after fetching updates:**
    
    ```bash
    git submodule update --recursive --remote
    ```
    
-   **Commit submodule changes:**
    
    ```bash
    git add .gitmodules embra_connect_modules/
    git commit -m "Update Connect-IDE submodule"
    git push origin master
    ```
    

These steps should make it easy for all collaborators to work with the submodules.

## The following section can be helpful incase of any issues

## 1. Deinitialize and remove the submodule
```bash
git submodule deinit -f embra_connect_modules/server/public/pages/connect_ide
rm -rf embra_connect_modules/server/public/pages/connect_ide
git rm --cached embra_connect_modules/server/public/pages/connect_ide
```

## 2. Commit the removal of the submodule
```bash
git add .gitmodules
git add embra_connect_modules/server/public/pages/connect_ide
git commit -m "Removed submodule embra_connect_modules/server/public/pages/connect_ide"
```

## 3. Re-add the submodule at the new location
```bash
git submodule add https://github.com/Embra-Connect-ETL/Connect-IDE.git embra_connect_modules/services/connect_ide
```

## 4. Commit the re-added submodule
```bash
git add .gitmodules
git add embra_connect_modules/services/connect_ide
git commit -m "Re-added submodule embra_connect_modules/services/connect_ide"
```

## 5. Push the changes
```bash
git push origin master  # or 'git push origin main' if you're working with 'main'
```
