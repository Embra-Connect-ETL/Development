/*************************************************
    The following section contains all selectors
    grouped by their respective categories.
**************************************************/
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

/****************************
 * The following section 
 * handles user registration.
 *****************************/
document.getElementById("registeration-btn").addEventListener("click", async function (event) {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // const passwordSchema = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');

    /***************
    * Validate input.
    *****************/
    if (!email || !password) {
        showToast("Email and password cannot be empty.", COLOR_CODE.FAILURE);
        return;
    }else if(!emailRegex.test(email)){
        showToast("Invalid email address format.", COLOR_CODE.FAILURE);
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
            }, 500);
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