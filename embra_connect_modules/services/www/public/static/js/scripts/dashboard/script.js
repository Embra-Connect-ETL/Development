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
  const TARGET_URL = `${ENDPOINTS.WORKSPACES_PAGE}?session=${encodeURIComponent(sessionToken)}&owner=${encodeURIComponent(sessionOwner)}`;

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