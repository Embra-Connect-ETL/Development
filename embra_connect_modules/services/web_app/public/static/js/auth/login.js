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
    LOGIN: "/register/index.html",
    LOGIN: "/login/index.html",
    DASHBOARD: "/pages/dashboard/index.html",
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
    EDITOR_PAGE: `${BASE_URL}:${PORT.GENERAL}${PAGES.BASE}`,
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

/*****************************
 * The following section 
 * handles user authentication.
 *****************************/
document.getElementById("login-btn").addEventListener("click", async function (event) {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    /*****************
    * Validate input.
    *****************/
    if (!email || !password) {
        showToast("Email and password cannot be empty.", COLOR_CODE.FAILURE);
        return;
    }

    const PAYLOAD = { email, password };

    try {
        /****************
        * Create request.
        *****************/
        const response = await fetch(`${ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(PAYLOAD),
            credentials: 'same-origin',
        });

        /*********************
         * Validate response.
         **********************/

        console.log(response);

        if (response.status == 200) {
            const RESPONSE_DATA = await response.json();

            if (RESPONSE_DATA.status == 200) {
                showToast("Login successful.", COLOR_CODE.SUCCESS);

                const TOKEN = RESPONSE_DATA.token;

                /************************
                * Redirect to Dashboard.
                ************************/
                const TARGET_URL = `${ENDPOINTS.DASHBOARD_PAGE}?session=${encodeURIComponent(TOKEN)}&owner=${encodeURIComponent(email)}`;

                setTimeout(() => {
                    window.location.href = TARGET_URL;
                }, 2000);
            } else {
                showToast("Login failed.", COLOR_CODE.FAILURE);
            }
        } else {
            const error = await response.text();
            throw new Error(error || "Something went wrong.");
        }
    } catch (error) {
        showToast("Something went wrong", COLOR_CODE.FAILURE);
        console.error("[AUTHENTICATION]", error);
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



