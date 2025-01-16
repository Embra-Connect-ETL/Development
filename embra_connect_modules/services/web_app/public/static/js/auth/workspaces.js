/****************************************
    The following section
    contains the [BASE] url and necessary
    [ENDPOINT] definitions.
*****************************************/
const BASE_URL = "http://localhost";

const PORT = Object.freeze({
    AUTH: 9000,
    EDITOR: 7000,
    WORKSPACES: 7000,
    PROJECTS: 7000,
    GENERAL: 8000
});

const PAGES = Object.freeze({
    BASE: "/index.html",
    LOGIN: "/login/index.html",
    DASHBOARD: "/pages/dashboard.html",
    CONFIG: "/pages/config.html",
    WORKSPACES: "/workspaces/index.html",
    PROJECTS: "/projects/index.html"
});

const ROUTES = Object.freeze({
    REGISTER: "/register",
    LOGIN: "/login",
    SESSION_VALIDATION: "/validate_token",
    WORKSPACE_MANAGEMENT: "/workspace",
    PROJECT_MANAGEMENT: "/project",
    DIRECTORY_MANAGEMENT: "/directory"
});

const ENDPOINTS = Object.freeze({
    // User management.
    REGISTRATION: `${BASE_URL}:${PORT.AUTH}${ROUTES.REGISTER}`,
    LOGIN: `${BASE_URL}:${PORT.AUTH}${ROUTES.LOGIN}`,
    AUTHORIZATION: `${BASE_URL}:${PORT.AUTH}${ROUTES.SESSION_VALIDATION}`,
    REGISTRATION_PAGE: `${BASE_URL}:${PORT.AUTH}${PAGES.BASE}`,
    LOGIN_PAGE: `${BASE_URL}:${PORT.AUTH}${PAGES.LOGIN}`,

    // Analytics.
    DASHBOARD_PAGE: `${BASE_URL}:${PORT.GENERAL}${PAGES.DASHBOARD}`,

    // File management.
    EDITOR_PAGE: `${BASE_URL}:${PORT.EDITOR}${PAGES.BASE}`,
    DIRECTORY_MANAGEMENT: `${BASE_URL}:${PORT.EDITOR}${ROUTES.DIRECTORY_MANAGEMENT}`,
    FILE_MANAGEMENT: `${BASE_URL}:${PORT.EDITOR}`,

    // Connection management.
    CONFIG_PAGE: `${BASE_URL}:${PORT.GENERAL}${PAGES.CONFIG}`,

    // Workspace management.
    WORKSPACE_PAGE: `${BASE_URL}:${PORT.AUTH}${PAGES.WORKSPACES}`,
    WORKSPACE_MANAGEMENT: `${BASE_URL}:${PORT.WORKSPACES}${ROUTES.WORKSPACE_MANAGEMENT}`,

    // Project management.
    PROJECT_PAGE: `${BASE_URL}:${PORT.AUTH}${PAGES.PROJECTS}`,
    PROJECT_MANAGEMENT: `${BASE_URL}:${PORT.PROJECTS}${ROUTES.PROJECT_MANAGEMENT}`
});

/**********************************
    The following section contains
    the [COLOR] codes for the
    different toaster messages.
**********************************/
const COLOR_CODE = Object.freeze({
    SUCCESS: '#ffa07a',  // Amber for success.
    FAILURE: '#ff6347',  // Tomato for failure.
    WARNING: '#ffa88f'   // Khaki (neutral) for warnings.
});

/****************************************************
 * Utility Functions
 * 
 * These functions are designed to simplify common tasks 
 * such as showing notifications (e.g., `showToast`,
 * `validateToken`, `onPageLoad`, `handleToken`,
 * `getSessionToken`).
****************************************************/
function showToast(message, backgroundColor) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
            background: backgroundColor,
            color: "#ffffff",
            borderRadius: "9px 21px 36px 32px",
            fontWeight: "300",
            letterSpacing: "1.4px",
            textTransform: "capitalize",
            boxShadow: "0 1rem 1rem 0 rgba(0, 0, 0, .05)",
        }
    }).showToast();
}

/****************************************
 * The following [Utility] function
 *  handles redirects to the login page.
 ****************************************/
function redirectToLogin() {
    window.location.href = ENDPOINTS.LOGIN_PAGE;
}

/*****************************************
 * The following [Utility] function
 * handles [SESSION] i.e token validation
 *****************************************/
async function validateToken(token) {
    try {
        const response = await fetch(ENDPOINTS.AUTHORIZATION, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'same-origin'
        });

        console.warn("Performing routine session check...");

        if (response.ok) {
            console.warn("Session is valid.");
            return true;
        } else {
            console.warn("Session invalid or expired.");

            /***************************************
             * Clear invalid [SESSION] i.e token, owner,
             * workspace & project info etc.  
             ************************************/
            localStorage.removeItem("SESSION_TOKEN");
            localStorage.removeItem("SESSION_OWNER");
            localStorage.removeItem("workspace_id");
            localStorage.removeItem("project_id");

            redirectToLogin();
            return false;
        }
    } catch (error) {
        console.error("Error validating session:", error);
        redirectToLogin()
        return false;
    }
}

/*********************************************
 * The following [Utility] function
 * handles [SESSION] validation on page load.
 *********************************************/
async function onPageLoad() {
    handleToken();
    const token = localStorage.getItem("SESSION_TOKEN");
    if (token) { await validateToken(token); }
}

/*************************************
 * The following [Utility] function
 * handles [SESSION] token retrieval.
 **************************************/
function getSessionToken() {
    return localStorage.getItem("SESSION_TOKEN");
}

/*****************************
    Handle token extraction, 
    validation, and fallback
******************************/
function handleToken() {
    const params = new URLSearchParams(window.location.search);
    const credentials = params.get("owner");
    const urlToken = params.get("session");

    /**********************************
    Check for existing [SESSION] info.
    ***********************************/
    const storedCredentials = localStorage.getItem("SESSION_OWNER");
    const storedToken = localStorage.getItem("SESSION_TOKEN");

    if (urlToken && credentials) {
        localStorage.setItem("SESSION_TOKEN", urlToken);
        localStorage.setItem("SESSION_OWNER", credentials);

        /***********************************
         * Clean up URL (remove url params.)
         ************************************/
        window.history.replaceState({}, document.title, window.location.pathname);

        console.warn("Session info. updated.");

    } else if (storedToken && storedCredentials) {
        // [TO DO] -  Validate if necessary [IMPORTANT]
        console.warn("Using existing Session info.");
    } else {
        console.warn("Session info. not found. Redirecting to login.");
        redirectToLogin()
    }
}

onPageLoad();

/****************************************************
 * The following logic handles workspace rendering.  
 * It will create a list of workspaces
 * owned by the user on the workspace UI.
 ***********************************************/
function renderWorkspaces(workspaces) {
    const container = document.querySelector(".user-workspaces");
    container.innerHTML = ""; // Clear existing entries

    if (workspaces.length === 0) {
        container.innerHTML = `
            <p class="no-workspaces-message">No workspaces have been created yet. Click "Create Workspace" to get started!</p>
        `;
    } else {
        workspaces.forEach((workspace) => {
            container.innerHTML += `
                <div class="workspace-entry" data-id="${workspace.workspace_id}">
                    <h2 class="workspace-title" title="Click to open workspace" data-id="${workspace.workspace_id}">
                        <ion-icon name="albums" class="workspace-entry-icon"></ion-icon>
                        ${workspace.tag}
                    </h2>
                    <div class="workspace-section-divider">
                        <p class="workspace-creation-date">
                            ${new Date(parseInt(workspace.createdAt.$date.$numberLong)).toDateString()}
                        </p>
                        <div class="workspace-action-btns">
                            <button class="update-workspace-btn" data-id="${workspace.workspace_id}" data-name="${workspace.tag}">
                                <ion-icon name="create" class="workspace-entry-btn-icon"></ion-icon>
                            </button>
                            <button class="delete-workspace-btn" data-id="${workspace.workspace_id}" data-name="${workspace.tag}">
                                <ion-icon name="trash-bin" class="workspace-entry-btn-icon"></ion-icon>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    attachEventListeners(); // Always attach event listeners
}

/****************************************
 * The following logic handles fetching
 * and displaying the owner's workspaces.
 *****************************************/
async function fetchWorkspaces() {

    /*********************
     * Validate [SESSION].
     *********************/
    const token = getSessionToken();

    if (!token) {
        showToast("Session invalid", COLOR_CODE.WARNING);
        redirectToLogin()
        return;
    }

    if (!validateToken(token)) {
        showToast("Session invalid", COLOR_CODE.WARNING);
        redirectToLogin()
        return;
    }

    try {
        const response = await fetch(`${ENDPOINTS.WORKSPACE_MANAGEMENT}/owner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch workspaces.");
        }

        const workspaces = await response.json();

        renderWorkspaces(workspaces);
    } catch (error) {
        showToast("Failed to load workspaces", COLOR_CODE.FAILURE);
        console.error(error.message);
    }
}

/*****************************
 * The following logic handles
 * workspace creation.
 ******************************/
async function createWorkspace(workspaceName) {
    const token = getSessionToken();
    if (!token) {
        showToast("Session expired", COLOR_CODE.WARNING);
        redirectToLogin();
        return;
    }

    try {
        const response = await fetch(`${ENDPOINTS.WORKSPACE_MANAGEMENT}/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: workspaceName, token }),
        });

        if (!response.ok) {
            throw new Error("Failed to create workspace.");
        }

        showToast("Workspace created successfully!");
        closeModal(); 
        fetchWorkspaces(); // Reload workspaces
    } catch (error) {
        console.error(error.message);
        alert("Error creating workspace. Please try again.");
    }
}

// Update an existing workspace
async function updateWorkspace(workspaceId, oldName) {
    const token = getSessionToken();
    if (!token) {
        alert("No session token found. Please log in.");
        return;
    }

    const newName = prompt(`Update workspace name (current: ${oldName}):`);
    if (!newName) return;

    try {
        const response = await fetch(`${ENDPOINTS.WORKSPACE_MANAGEMENT}/update/${workspaceId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: oldName, // Include the current name in the request
                new_name: newName,
                token,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update workspace.");
        }

        alert("Workspace updated successfully!");
        fetchWorkspaces(); // Reload workspaces
    } catch (error) {
        console.error(error.message);
        alert("Error updating workspace. Please try again.");
    }
}


// Delete a workspace
async function deleteWorkspace(workspaceId, workspaceName) {
    const token = getSessionToken();
    if (!token) {
        alert("No session token found. Please log in.");
        return;
    }

    if (!confirm(`Are you sure you want to delete the workspace: "${workspaceName}"?`)) return;

    try {
        const response = await fetch(`${ENDPOINTS.WORKSPACE_MANAGEMENT}/delete/${workspaceId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: workspaceName, token }),
        });

        console.log({ name: workspaceName, token });


        if (!response.ok) {
            throw new Error("Failed to delete workspace.");
        }

        alert("Workspace deleted successfully!");
        fetchWorkspaces(); // Reload workspaces
    } catch (error) {
        console.error(error.message);
        alert("Error deleting workspace. Please try again.");
    }
}

// Modal controls
function openModal() {
    document.getElementById("create-workspace-modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("create-workspace-modal").classList.add("hidden");
    document.getElementById("new-workspace-name").value = ""; // Clear input
}

// Attach event listeners to UI elements
function attachEventListeners() {
    // Add click event to navigate to projects page
    document.querySelectorAll(".workspace-title").forEach((title) => {
        title.addEventListener("click", async (e) => {
            const workspaceId = e.currentTarget.dataset.id;
            const owner = localStorage.getItem("SESSION_OWNER");

            // Get token from local storage
            const token = localStorage.getItem("SESSION_TOKEN");
            if (!token) {
                showToast("Session expired. Redirecting to log in.", COLOR_CODE.WARNING);
                setTimeout(() => {
                    window.location.href = ENDPOINTS.LOGIN_PAGE;
                }, 2000);
                return;
            }

            // Store the workspace ID in local storage
            localStorage.setItem("workspace_id", workspaceId);

            // Build the target URL for the projects page
            const TARGET_URL = `${ENDPOINTS.PROJECT_PAGE}?session=${encodeURIComponent(token)}&workspace_id=${encodeURIComponent(workspaceId)}&owner=${encodeURIComponent(owner)}`;

            // Provide visual feedback
            showToast("Opening projects", COLOR_CODE.WARNING);

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = TARGET_URL;
            }, 2000);
        });
    });

    // Open modal for creating a workspace
    document.querySelector(".workspace-side-panel-action-btns .side-panel-action-btn:first-child")
        .addEventListener("click", openModal);

    // Handle modal actions
    document.getElementById("create-workspace-btn").addEventListener("click", () => {
        const workspaceName = document.getElementById("new-workspace-name").value.trim();
        if (!workspaceName) {
            alert("Workspace name cannot be empty.");
            return;
        }
        createWorkspace(workspaceName);
    });

    document.getElementById("cancel-workspace-btn").addEventListener("click", closeModal);

    // Update workspace buttons
    document.querySelectorAll(".update-workspace-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
            const workspaceId = e.target.closest("button").dataset.id;
            const oldName = e.target.closest("button").dataset.name;
            updateWorkspace(workspaceId, oldName);
        })
    );

    // Delete workspace buttons
    document.querySelectorAll(".delete-workspace-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
            const workspaceId = e.target.closest("button").dataset.id;
            const workspaceName = e.target.closest("button").dataset.name;
            deleteWorkspace(workspaceId, workspaceName);
        })
    );

    // Back button
    document.querySelector(".workspace-side-panel-action-btns .side-panel-action-btn:nth-child(2)")
        .addEventListener("click", () => {
            localStorage.removeItem("workspace_id");
            // Navigate to the previous page
            window.history.back();
        });

    // Log Out button
    document
        .querySelector(".workspace-side-panel-action-btns .side-panel-action-btn:nth-child(3)")
        .addEventListener("click", () => {
            if (confirm("Are you sure you want to log out?")) {
                // Clear session info.
                localStorage.removeItem("SESSION_OWNER");
                localStorage.removeItem("SESSION_TOKEN");

                // Manipulate browser history to prevent back navigation
                history.replaceState(null, null, ENDPOINTS.LOGIN_PAGE);
                history.pushState(null, null, ENDPOINTS.LOGIN_PAGE);

                // Notify the user and redirect
                showToast("You have been logged out.", COLOR_CODE.WARNING);
                window.location.href = ENDPOINTS.LOGIN_PAGE;
            }
        });

    // Prevent back navigation to restricted pages
    window.addEventListener("popstate", () => {
        const token = localStorage.getItem("SESSION_TOKEN");
        if (!token) {
            window.location.href = ENDPOINTS.LOGIN_PAGE;
        }
    });
}

// Retrieve user credentials
function getUserCredentials() {
    return localStorage.getItem("SESSION_OWNER") || "EC User";
}

// Initial load
document.addEventListener("DOMContentLoaded", fetchWorkspaces);

document.addEventListener("DOMContentLoaded", () => {
    // Set profile info.
    const profileInfo = document.querySelector(".profile-area");
    const credentials = getUserCredentials();

    if (credentials) {
        profileInfo.innerHTML += `
            <a href="#" class="profile-info">
                <ion-icon name="person-circle" class="profile-icon"></ion-icon>
                ${credentials}
            </a>
        `;
    } else {
        profileInfo.innerHTML += `
            <a href="#" class="profile-info">
                <ion-icon name="person-circle" class="profile-icon"></ion-icon>
                Guest
            </a>
        `;
    }
});


// To do - Hook up back logic to workspace_id removal
document.addEventListener("DOMContentLoaded", () => {
    // Storing the workspace_id is not necessary on this page.
    localStorage.removeItem("workspace_id");
});

