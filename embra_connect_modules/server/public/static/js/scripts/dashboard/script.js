/*********************************
 * The following section contains
 * the dashboard's initial [STATE]
 **********************************/
const DASHBOARD_STATE = {
  kpis: {
    modelsProcessed: 0,
    modelsProcessedPeriod: "THIS MONTH",
  },
  analyticsOverview: {
    title: "Analytics Overview",
    info: "See how your data performs/grows and how you can improve it",
    suggestedSteps: [
      { name: "Define Objectives", active: true },
      { name: "Collect Relevant Data", active: false },
      { name: "Cleanse and Prepare Data", active: false },
      { name: "Choose Metrics", active: false },
    ],
  },
  trendAnalysis: {
    title: "Trend Analysis",
    info: "Pinpoint issues with minimal, easy-to-interpret visualizations",
    expanded: false,
    chartData: null, // Placeholder for dynamic chart data
  },
  activityLog: [
    {
      name: "Daily Run",
      environment: "Deployment",
      timestamp: "Jan 25, 2024, 3:00 PM GMT+3",
      duration: "1m, 15s",
    },
  ],
  user: {
    name: localStorage.getItem("SESSION_OWNER") || "EC User",
  }
};

/*************************************************
    The following section contains all selectors
    grouped by their respective categories.
**************************************************/
const profile_name = document.querySelector(".profile-link");
const kpiCard = document.getElementById("kpi-card");
const analyticsTitle = document.getElementById("analytics-title");
const analyticsInfo = document.getElementById("analytics-info");
const suggestedSteps = document.getElementById("suggested-steps");
const activityList = document.getElementById("activity-list");
const trendTitle = document.getElementById("trend-title");
const trendInfo = document.getElementById("trend-info");



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

/*****************************
  Handle token extraction, 
  validation, and fallback
******************************/
function handleToken() {
  const params = new URLSearchParams(window.location.search);
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

/*************************************
* The following [Utility] function
* handles [SESSION] owner retrieval.
**************************************/
function getUserCredentials() {
  return localStorage.getItem("SESSION_OWNER") || "EC User";
}

onPageLoad();

/****************************************
 * The following logic handles dashboard
 * content population.
 ***************************************/
document.addEventListener("DOMContentLoaded", () => {
  kpiCard.innerHTML = `
      <h3 class="card-title">
          <p class="card-value">
              <ion-icon name="stats-chart" class="model-stats-icon"></ion-icon>
              ${DASHBOARD_STATE.kpis.modelsProcessed}
          </p>
          Models Processed
          <span class="sub-title">
              ${DASHBOARD_STATE.kpis.modelsProcessedPeriod}
          </span>
      </h3>
      <ion-icon name="server" class="server-icon"></ion-icon>
  `;

  /***********************************
   * Populate Analytics Overview card.
   ***********************************/
  analyticsTitle.textContent = DASHBOARD_STATE.analyticsOverview.title;
  analyticsInfo.textContent = DASHBOARD_STATE.analyticsOverview.info;

  /*******************************
   * Populate suggested steps on
   * Analytics Overview card.
   ********************************/
  DASHBOARD_STATE.analyticsOverview.suggestedSteps.forEach(step => {
    const li = document.createElement("li");
    li.classList.add("suggested-step");
    if (step.active) {
      li.classList.add("active");
    }
    li.innerHTML = `<ion-icon name="information-circle" class="suggestion-icon"></ion-icon>${step.name}`;
    suggestedSteps.appendChild(li);
  });

  /*********************************
   * Populate Trand Analysis card.
   ********************************/
  trendTitle.textContent = DASHBOARD_STATE.trendAnalysis.title;
  trendInfo.textContent = DASHBOARD_STATE.trendAnalysis.info;

  /****************************
   * Populate Activity section.
   *****************************/
  DASHBOARD_STATE.activityLog.forEach(activity => {
    const li = document.createElement("li");
    li.classList.add("activity");
    li.innerHTML = `
          <div class="main-activity-info">
              <h2 class="activity-name">
                  <ion-icon name="checkmark-circle" class="check-icon"></ion-icon>
                  ${activity.name}
              </h2>
              <p class="activity-environment">
                  ${activity.environment}
              </p>
          </div>
          <div class="time-triggered">
              <p class="duration-details">
                  <ion-icon name="stopwatch" class="watch-icon"></ion-icon>
                  ${activity.timestamp}
              </p>
              <h3 class="time-taken">
                  Duration ${activity.duration}
              </h3>
          </div>
      `;
    activityList.appendChild(li);
  });
});

/********************************************
 * Logic for navigating to the Workspace page.
 ********************************************/
document.querySelector(".link-item .navigate-to-workspaces-page").addEventListener("click", (event) => {
  event.preventDefault();

  // Retrieve session information.
  const sessionToken = localStorage.getItem("SESSION_TOKEN");
  const sessionOwner = localStorage.getItem("SESSION_OWNER");

  if (!sessionToken || !sessionOwner) {
    showToast("Session information missing. Please log in again.", COLOR_CODE.FAILURE);
    return;
  }

  // Construct the target URL.
  const TARGET_URL = `${ENDPOINTS.WORKSPACE_PAGE}?session=${encodeURIComponent(sessionToken)}&owner=${encodeURIComponent(sessionOwner)}`;

  // Navigate to the Workspace page.
  window.location.href = TARGET_URL;
});

// Set profile info.
document.addEventListener("DOMContentLoaded", () => {
  const profileInfo = document.querySelector(".profile-link");
  const credentials = getUserCredentials();

  if (credentials) {
    profileInfo.innerHTML += credentials;

  } else {
    profileInfo.innerHTML += "EC User";
  }
});