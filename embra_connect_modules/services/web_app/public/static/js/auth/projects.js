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

        if (response.ok) {
            console.warn("Session is valid.");
            return true;
        } else {
            console.warn("Session invalid or expired.");

            /***************************************
             * Clear invalid token i.e token, owner,
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
        redirectToLogin();
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

/*************************************
 * The following [Utility] function
 * handles [SESSION] owner retrieval.
 **************************************/
function getUserCredentials() {
    return localStorage.getItem("SESSION_OWNER") || "EC User";
}

/*****************************
    Handle token extraction, 
    validation, and fallback
******************************/
function handleToken() {
    const params = new URLSearchParams(window.location.search);
    const credentials = params.get("owner");
    const urlToken = params.get("session");
    const workspaceId = params.get("workspace_id");
    const storedToken = localStorage.getItem("SESSION_TOKEN");

    if (urlToken && credentials && workspaceId) {
        localStorage.setItem("SESSION_TOKEN", urlToken);
        localStorage.setItem("SESSION_OWNER", credentials);
        localStorage.setItem("workspace_id", workspaceId);

        /***********************************
        * Clean up URL (remove url params.)
        ************************************/
        window.history.replaceState({}, document.title, window.location.pathname);

        console.warn("Session info. updated.");
    } else if (storedToken) {
        // [TO DO] -  Validate if necessary [IMPORTANT]
        console.warn("Using existing Session info.");
    } else {
        console.warn("Session info. not found. Redirecting to login.");
        redirectToLogin();
    }
}

onPageLoad();

// Function to render projects
function renderProjects(projects) {
    const container = document.querySelector(".user-projects");
    container.innerHTML = ""; // Clear existing entries

    if (projects.length === 0) {
        container.innerHTML = `
            <p class="no-projects-message">This workspace has no projects. Click "Create Project" to get started!</p>
        `;
    } else {
        projects.forEach((project) => {
            container.innerHTML += `
                <div class="project-entry" data-id="${project.project_id}">
                    <h2 class="project-title" title="Click to open project" data-id="${project.project_id}">
                        <ion-icon name="albums" class="project-entry-icon"></ion-icon>
                        ${project.tag}
                    </h2>
                    <div class="project-section-divider">
                        <p class="project-creation-date">
                            ${new Date(parseInt(project.createdAt.$date.$numberLong)).toDateString()}
                        </p>
                        <div class="project-action-btns">
                            <button class="update-project-btn" data-id="${project.project_id}" data-name="${project.tag}">
                                <ion-icon name="create" class="project-entry-btn-icon"></ion-icon>
                            </button>
                            <button class="delete-project-btn" data-id="${project.project_id}" data-name="${project.tag}">
                                <ion-icon name="trash-bin" class="project-entry-btn-icon"></ion-icon>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    attachEventListeners(); // Always attach event listeners
}

/*********************************************
 * The following logic handles fetching
 * and displaying projects within the workspace.
 ************************************************/
async function fetchProjects() {
    const workspaceId = localStorage.getItem("workspace_id");

    /*********************
    * Validate [SESSION].
    *********************/
    const token = getSessionToken();

    if (!token, !workspaceId) {
        showToast("Failed to identify workspace", COLOR_CODE.FAILURE);
        redirectToLogin();
        return false;
    }

    try {
        const response = await fetch(`${ENDPOINTS.WORKSPACE_MANAGEMENT}/projects/owner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "workspace_id": workspaceId, "token": token }),
        });

        if (!response.ok) {
            showToast("Failed to load workspace projects", COLOR_CODE.FAILURE);
            throw new Error("Failed to fetch projects.");
        }

        const projects = await response.json();

        // [DEBUG] logs
        console.log(projects);

        renderProjects(projects);
    } catch (error) {
        console.error(error.message);
        showToast("Failed to load workspace projects, Please try again.", COLOR_CODE.FAILURE);
    }
}

/******************************
 * The following logic handles
 * project creation.
 ******************************/
async function createProject(projectName) {
    const workspaceId = localStorage.getItem("workspace_id");
    const projectTYpe = document.getElementById("project-type").value;
    const token = getSessionToken();

    const data = {
        workspace_id: workspaceId,
        name: projectName,
        project_type: projectTYpe,
        token: token
    };

    if (!token) {
        showToast("Session invalid", COLOR_CODE.WARNING);
        redirectToLogin();
        return;
    }

    try {
        const response = await fetch(`${ENDPOINTS.PROJECT_MANAGEMENT}/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            showToast("Failed to create project.", COLOR_CODE.FAILURE);
            throw new Error("Failed to create project.");
        }

        showToast("Project created successfully.", COLOR_CODE.WARNING);
        closeModal(); // Close modal after creation
        fetchProjects(); // Reload workspaces
    } catch (error) {
        console.error(error.message);
        showToast("Failed to create project. Please try again.", COLOR_CODE.FAILURE);
    }
}

/******************************
 * The following logic updates
 * an existing project.
 ******************************/
async function updateProject(projectId, oldName) {
    const workspaceId = localStorage.getItem("workspace_id");
    const token = getSessionToken();
    if (!token) {
        showToast("Session invalid", COLOR_CODE.WARNING);
        redirectToLogin();
        return;
    }

    const newName = prompt(`Update project name (current: ${oldName}):`);
    if (!newName) return;

    try {
        const response = await fetch(`${ENDPOINTS.PROJECT_MANAGEMENT}/update/${projectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: oldName, // Include the current name in the request
                new_name: newName,
                workspace_id: workspaceId,
                token: token,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update project.");
        }

        showToast("Project updated successfully!", COLOR_CODE.SUCCESS);
        fetchProjects(); // Reload projects

    } catch (error) {
        console.error(error.message);
        showToast("Failed to update project. Please try again.", COLOR_CODE.FAILURE);
    }
}


/******************************
 * The following logic deletes
 * an existing project.
 ******************************/
async function deleteProject(projectId, projectName) {
    const workspaceId = localStorage.getItem("workspace_id");
    const token = getSessionToken();
    if (!token) {
        showToast("Session invalid", COLOR_CODE.WARNING);
        redirectToLogin();
        return;
    }

    if (!confirm(`Are you sure you want to delete the project: "${projectName}"?`)) return;

    try {
        const response = await fetch(`${ENDPOINTS.PROJECT_MANAGEMENT}/delete/${projectId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: projectName,
                workspace_id: workspaceId,
                token: token
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to delete project.");
        }

        alert("Project deleted successfully!");
        fetchProjects(); // Reload projects
    } catch (error) {
        console.error(error.message);
        alert("Error deleting project. Please try again.");
    }
}

// Modal controls
function openModal() {
    document.getElementById("create-project-modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("create-project-modal").classList.add("hidden");
    document.getElementById("new-project-name").value = ""; // Clear input
}

// Attach event listeners to UI elements
function attachEventListeners() {
    // Add click event to navigate to IDE
    document.querySelectorAll(".project-title").forEach((title) => {
        title.addEventListener("click", async (e) => {
            const workspaceId = localStorage.getItem("workspace_id");
            const projectId = e.currentTarget.dataset.id;
            const owner = localStorage.getItem("SESSION_OWNER");

            // Get token from local storage
            const token = localStorage.getItem("SESSION_TOKEN");
            if (!token) {
                showToast("Session expired. Please log in again.", COLOR_CODE.FAILURE);

                localStorage.removeItem("SESSION_OWNER");
                localStorage.removeItem("workspace_id");

                setTimeout(() => {
                    window.location.href = ENDPOINTS.LOGIN_PAGE;
                }, 2000);
                return;
            }

            // Store the workspace ID in local storage
            localStorage.setItem("workspace_id", workspaceId);

            // Build the target URL for the projects page
            const TARGET_URL = `${ENDPOINTS.EDITOR_PAGE}?session=${encodeURIComponent(token)}&workspace_id=${encodeURIComponent(workspaceId)}&project_id=${encodeURIComponent(projectId)}&owner=${encodeURIComponent(owner)}`;

            // Provide visual feedback
            showToast("Launching Connect IDE", COLOR_CODE.WARNING);

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = TARGET_URL;
            }, 2000);
        });
    });

    // Open modal for creating a project
    document.querySelector(".project-side-panel-action-btns .side-panel-action-btn:first-child")
        .addEventListener("click", openModal);

    // Handle modal actions
    document.getElementById("create-project-btn").addEventListener("click", () => {
        const workspaceId = localStorage.getItem("workspace_id");
        const projectName = document.getElementById("new-project-name").value.trim();

        if (!projectName) {
            showToast("Project name cannot be empty.", COLOR_CODE.FAILURE);
            return;
        }
        createProject(projectName);
    });

    document.getElementById("cancel-project-btn").addEventListener("click", closeModal);

    // Update project buttons
    document.querySelectorAll(".update-project-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
            const projectId = e.target.closest("button").dataset.id;
            const oldName = e.target.closest("button").dataset.name;
            updateProject(projectId, oldName);
        })
    );

    // Delete project buttons
    document.querySelectorAll(".delete-project-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
            const projectId = e.target.closest("button").dataset.id;
            const projectName = e.target.closest("button").dataset.name;
            deleteProject(projectId, projectName);
        })
    );

    // Back button
    document.querySelector(".project-side-panel-action-btns .side-panel-action-btn:nth-child(2)")
        .addEventListener("click", () => {
            // Navigate to the previous page
            window.history.back();
        });

    // Log Out button
    document
        .querySelector(".project-side-panel-action-btns .side-panel-action-btn:nth-child(3)")
        .addEventListener("click", () => {
            if (confirm("Are you sure you want to log out?")) {
                // Clear session token
                localStorage.removeItem("SESSION_TOKEN");
                localStorage.removeItem("SESSION_OWNER");
                localStorage.removeItem("workspace_id");

                // Manipulate browser history to prevent back navigation
                history.replaceState(null, null, ENDPOINTS.LOGIN_PAGE);
                history.pushState(null, null, ENDPOINTS.LOGIN_PAGE);

                // Notify the user and redirect
                alert("You have been logged out.");
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



// Initial load
document.addEventListener("DOMContentLoaded", fetchProjects);

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

