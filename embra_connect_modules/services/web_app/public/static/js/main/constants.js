/****************************************
    The following section
    contains the [BASE] url and necessary
    [ENDPOINT] definitions.
*****************************************/
const BASE_URL = "http://localhost";

const PORT = Object.freeze({
    AUTH_SERVICE: 9000,
    EDITOR_SERVICE: 7000,
    WORKSPACE_SERVICE: 7000,
    PROJECT_SERVICE: 7000,
    BASE: 8000 // To do - Replace with [krakend] port
});

const PAGES = Object.freeze({
    BASE: "/index.html",
    // User management.
    LOGIN: "/pages/login/index.html",
    REGISTER: "/pages/register/index.html",

    // Dashboard, Editor & Config pages.
    DASHBOARD: "/pages/dashboard/index.html",
    EDITOR: "/pages/editor/index.html",
    CONFIG: "/pages/config.html",

    // Workspace & Project management.
    WORKSPACES: "/pages/workspaces/index.html",
    PROJECTS: "/pages/projects/index.html"
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
    /*******************************************
    * The following endpoints are responsible
    * for page navigation.
    *******************************************/

    // User management.
    REGISTRATION: `${BASE_URL}:${PORT.AUTH_SERVICE}${ROUTES.REGISTER}`,
    LOGIN: `${BASE_URL}:${PORT.AUTH_SERVICE}${ROUTES.LOGIN}`,
    AUTHORIZATION: `${BASE_URL}:${PORT.AUTH_SERVICE}${ROUTES.SESSION_VALIDATION}`,

    // File management.
    DIRECTORY_MANAGEMENT: `${BASE_URL}:${PORT.EDITOR_SERVICE}${ROUTES.DIRECTORY_MANAGEMENT}`,
    FILE_MANAGEMENT: `${BASE_URL}:${PORT.EDITOR_SERVICE}`,

    // Workspace & Project management.
    WORKSPACE_MANAGEMENT: `${BASE_URL}:${PORT.WORKSPACE_SERVICE}${ROUTES.WORKSPACE_MANAGEMENT}`,
    PROJECT_MANAGEMENT: `${BASE_URL}:${PORT.PROJECT_SERVICE}${ROUTES.PROJECT_MANAGEMENT}`,


    /*******************************************
     * The following endpoints are responsible
     * for page navigation.
     *******************************************/

    // User management.
    REGISTRATION_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.REGISTER}`,
    LOGIN_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.LOGIN}`,

    // Analytics.
    DASHBOARD_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.DASHBOARD}`,

    // File management.
    EDITOR_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.BASE}`,

    // Connection management.
    CONFIG_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.CONFIG}`,

    // Workspace & Project management.
    WORKSPACES_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.WORKSPACES}`,
    PROJECTS_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.PROJECTS}`
});

// [DEBUG] logs.
for (let key in ENDPOINTS) {
    if (ENDPOINTS.hasOwnProperty(key)) {
        console.log(key, ENDPOINTS[key])
        console.log("\n");
    }
}

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
            borderRadius: "8px 22px 26px 32px",
            fontWeight: "600",
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
            console.warn("Session expired.");
            showToast("Session expired", COLOR_CODE.WARNING);

            /***************************************
             * Clear invalid token i.e token, owner,
             * workspace & project info etc.  
             ************************************/
            localStorage.removeItem("SESSION_TOKEN");
            localStorage.removeItem("SESSION_OWNER");
            localStorage.removeItem("PROJECT_KEY");
            localStorage.removeItem("workspace_id");
            localStorage.removeItem("project_id");

            redirectToLogin();
            return false;
        }
    } catch (error) {
        console.error("Failed to validate session:", error);
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