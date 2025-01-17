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
    EDITOR_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.EDITOR}`,

    // Connection management.
    CONFIG_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.CONFIG}`,

    // Workspace & Project management.
    WORKSPACES_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.WORKSPACES}`,
    PROJECTS_PAGE: `${BASE_URL}:${PORT.BASE}${PAGES.PROJECTS}`
});

// [DEBUG] logs.
for (let key in ENDPOINTS) {
    if (ENDPOINTS.hasOwnProperty(key)) {
        console.warn(key, ENDPOINTS[key])
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
    const workspaceId = params.get("workspace_id") || "n/a";
    const projectId = params.get("project_id") || "n/a";
    const credentials = params.get("owner");
    const urlToken = params.get("session");


    /**********************************
    Chack for existing [SESSION] info.
    ***********************************/
    const storedCredentials = localStorage.getItem("SESSION_OWNER");
    const storedToken = localStorage.getItem("SESSION_TOKEN");

    if (urlToken && credentials) {
        localStorage.setItem("SESSION_TOKEN", urlToken);
        localStorage.setItem("SESSION_OWNER", credentials);
        localStorage.setItem("workspace_id", workspaceId);
        localStorage.setItem("project_id", projectId);

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
        redirectToLogin();
    }
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
            const SESSION_KEYS = [
                "SESSION_TOKEN",
                "SESSION_OWNER",
                "PROJECT_KEY",
                "PROJECT_TYPE",
                "ROOT_KEY",
                "workspace_id",
                "project_id"
            ];

            SESSION_KEYS.forEach(key => localStorage.removeItem(key));

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
 * handles [SESSION] owner retrieval.
 **************************************/
function getUserCredentials() {
    return localStorage.getItem("SESSION_OWNER") || "EC User";
}