/*************************************************
    The following section contains all selectors
    grouped by their respective categories.
**************************************************/
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

/****************************************
    The following section
    contains the [BASE] url and necessary
    [ENDPOINT] definitions.
*****************************************/
const BASE_URL = "http://localhost";

const PORT = Object.freeze({
    AUTH: 9000,
    EDITOR: 7000,
    GENERAL: 8000
});

const PAGES = Object.freeze({
    BASE: "/index.html",
    LOGIN: "/login/index.html",
    DASHBOARD: "/pages/dashboard.html",
    CONFIG: "/pages/config.html"
});

const ROUTES = Object.freeze({
    REGISTER: "/register",
    LOGIN: "/login"
});

const ENDPOINTS = Object.freeze({
    REGISTRATION: `${BASE_URL}:${PORT.AUTH}${ROUTES.REGISTER}`,
    LOGIN: `${BASE_URL}:${PORT.AUTH}${ROUTES.LOGIN}`,
    REGISTRATION_PAGE: `${BASE_URL}:${PORT.AUTH}${PAGES.BASE}`,
    LOGIN_PAGE: `${BASE_URL}:${PORT.AUTH}${PAGES.LOGIN}`,
    DASHBOARD_PAGE: `${BASE_URL}:${PORT.GENERAL}${PAGES.DASHBOARD}`,
    EDITOR_PAGE: `${BASE_URL}:${PORT.EDITOR}${PAGES.BASE}`,
    CONFIG_PAGE: `${BASE_URL}:${PORT.GENERAL}${PAGES.CONFIG}`
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
 * These functions are designed to simplify common tasks 
 * such as showing notifications (e.g., `showToast`).
****************************************************/
function showToast(message, backgroundColor) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: backgroundColor,
            color: "#ffffff",
            borderRadius: "9px 21px 56px 32px",
            fontWeight: "300",
            letterSpacing: "1.4px",
            textTransform: "capitalize",
            boxShadow: "0 1rem 1rem 0 rgba(0, 0, 0, .05)",
        }
    }).showToast();
}

/****************************
 * The following section 
 * handles user registration.
 *****************************/
document.getElementById("registeration-btn").addEventListener("click", async function (event) {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    /***************
    * Validate input.
    *****************/
    if (!email || !password) {
        showToast("Email and password cannot be empty.", COLOR_CODE.FAILURE);
        return;
    }

    const PAYLOAD = { email, password };

    try {
        /*********************
        * Make the request.
        **********************/
        const response = await fetch(`${ENDPOINTS.REGISTRATION}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(PAYLOAD),
            credentials: 'same-origin',
        });

        /*********************
        * Handle the response.
        **********************/
        if (response.ok) {
            showToast("User registered!", COLOR_CODE.SUCCESS);

            /**************************
            * Redirect to login page.
            ***************************/
            setTimeout(() => {
                window.location.href = `${ENDPOINTS.LOGIN_PAGE}`;
            }, 2000);
        } else {
            const errorData = await response.json();
            console.error("Registration failed:", errorData);
            showToast(errorData.message || "Registration failed", COLOR_CODE.FAILURE);
        }
    } catch (error) {
        showToast("Something went wrong.", COLOR_CODE.FAILURE);
        console.error("[REGISTRATION]", error);
    }
});

/**********************************
 * The following section cleans up
 * all [SESSION] related keys.
 *********************************/
document.addEventListener("DOMContentLoaded", () => {

    const SESSION_KEYS = [
        "SESSION_OWNER",
        "SESSION_TOKEN",
        "workspace_id",
        "project_id"
    ];

    SESSION_KEYS.forEach(key => localStorage.removeItem(key));
});