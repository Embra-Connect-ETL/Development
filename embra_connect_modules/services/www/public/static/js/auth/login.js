/*************************************************
    The following section contains all selectors
    grouped by their respective categories.
**************************************************/
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

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
                }, 500);
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