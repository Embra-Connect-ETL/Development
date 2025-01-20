/**********************************************
 * The following section contains [DEFAULT]
 * values that's specific to side ba  logic.
 **********************************************/
const FILE_MODIFICATION = "https://ec-connect-ide-1-0.onrender.com"

/*****************************
 * The following logic saves
 *  the state of open folders.
 *******************************/
function saveFolderState() {
    const openFolders = Array.from(document.querySelectorAll(".folder-contents"))
        /********************************
         * Ensure the selected element
         * has a valid `data-path`.
         ********************************/
        .filter((folder) => folder.style.display === "block" && folder.dataset.path)
        .map((folder) => folder.dataset.path);

    // [DEBUG] logs.
    console.warn("Updating folder state: ", openFolders);

    // Save active/open folders.
    localStorage.setItem("openFolders", JSON.stringify(openFolders || []));
}

/**********************************************
 * The following logic toggles folder 
 * visibility and stores them in localStorage.
 ***********************************************/
function toggleFolder(element) {
    const folderContents = element.nextElementSibling;

    if (!folderContents || !folderContents.dataset.path) {
        console.error("Missing `data-path` attribute on folder contents");
        return;
    }

    // Toggle visibility.
    folderContents.style.display = folderContents.style.display === "none" ? "block" : "none";

    // Update localStorage.
    const path = folderContents.dataset.path;
    const openFolders = JSON.parse(localStorage.getItem("openFolders") || "[]");

    if (folderContents.style.display === "block") {
        if (!openFolders.includes(path)) openFolders.push(path);
    } else {
        const index = openFolders.indexOf(path);
        if (index > -1) openFolders.splice(index, 1);
    }

    // [DEBUG] logs.
    console.warn("Updating openFolders in localStorage:", openFolders);

    // Save active/open folders.
    localStorage.setItem("openFolders", JSON.stringify(openFolders));
}

/*********************************************
 * The following logic restores open folders
 * from localStorage when the page loads.
 ********************************************/
document.addEventListener("DOMContentLoaded", () => {
    const openFolders = JSON.parse(localStorage.getItem("openFolders") || "[]");

    // [DEBUG] logs.
    console.warn("Restoring folder state from localStorage:", openFolders);

    openFolders.forEach((path) => {
        const folderContents = document.querySelector(`[data-path="${path}"]`);
        if (folderContents) {
            folderContents.style.display = "block";
        }
    });
});

/**********************************
 * The follwoing section contains
 * [Context Menu] logic i.e. Rename,
 * Delete.
 ***********************************/
const contextMenu = document.getElementById("context-menu");
let targetElement = null;

document.addEventListener("contextmenu", (event) => {
    const clickedElement = event.target.closest(".file, .folder");

    if (clickedElement) {
        event.preventDefault();
        targetElement = clickedElement;

        // [DEBUG] logs.
        console.log("Displaying context menu for:", targetElement.dataset.path);

        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.classList.add("active");
    } else {
        contextMenu.classList.remove("active");
    }
});

document.addEventListener("click", (event) => {
    if (!contextMenu.contains(event.target)) {
        contextMenu.classList.remove("active");
    }
});

/********************
 * [RENAME] option.
 ********************/
document.getElementById("rename-option").addEventListener("click", async () => {
    const currentName = targetElement.dataset.path; // e.g., "folder1"
    const newName = prompt("Enter the new name:", currentName);
    const projectName = localStorage.getItem("project_id");
    const workspaceId = localStorage.getItem("workspace_id");

    /*********************
    * Validate [SESSION].
    *********************/
    const token = getSessionToken();

    if (!token) {
        showToast("Session invalid", COLOR_CODE.WARNING);
        redirectToLogin();
        return;
    }

    if (!validateToken(token)) {
        showToast("Session invalid", COLOR_CODE.WARNING);
        redirectToLogin();
        return;
    }

    const PAYLOAD = {
        project_name: projectName,
        workspace_id: workspaceId,
        old_name: `${workspaceId}/${currentName}`,
        new_name: `${workspaceId}/${newName}`,
        token: token
    };

    if (newName && newName !== currentName) {
        // Send rename request
        const response = await fetch(`${FILE_MODIFICATION}/rename`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(PAYLOAD),
        });

        if (response.ok) {
            showToast("Rename successful", COLOR_CODE.SUCCESS);
            renderFileTree();
        } else {
            const result = await response.json();
            showToast(result.message || "Rename failed!", COLOR_CODE.FAILURE);
        }
    }
});

/********************
 * [DELETE] option.
 ********************/
document.getElementById("delete-option").addEventListener("click", async () => {
    const targetName = targetElement.dataset.path; // Path of the file or folder
    const isFolder = targetElement.classList.contains("folder"); // Determine if it's a folder
    const workspaceId = localStorage.getItem("workspace_id");
    const projectName = localStorage.getItem("project_id");
    const token = getSessionToken();

    if (!validateToken(token)) {
        showToast("Session invalid", COLOR_CODE.WARNING);
        redirectToLogin();
    }

    const PAYLOAD = {
        workspace_id: workspaceId,
        project_name: projectName,
        name: targetName,
        is_folder: isFolder,
        token: token
    };

    const confirmDelete = confirm(
        `Are you sure you want to delete "${targetName}"? This action cannot be undone.`
    );

    if (confirmDelete) {
        // Send delete request
        const response = await fetch(`${FILE_MODIFICATION}/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(PAYLOAD),
        });

        if (response.ok) {
            const result = await response.json();
            showToast(result.message, COLOR_CODE.SUCCESS);
        } else {
            const result = await response.json();
            showToast(result.message || "Delete failed!", COLOR_CODE.FAILURE);
        }
    }
});

/***************************************
 * The follwoing section handles
 * navigating back to the projects page.
 ***************************************/
document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = ENDPOINTS.PROJECTS_PAGE;
})