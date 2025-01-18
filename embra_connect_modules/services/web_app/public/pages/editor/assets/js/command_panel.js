const COMMAND_EXECUTION = "http://localhost:7000";

const commandHistoryKey = "commandHistory"; // Local storage key for command history
const maxHistory = 5; // Max commands to store in history
let currentCommand = null;

document.addEventListener("DOMContentLoaded", () => {
    loadCommandHistory();
    updatePreviousCommand();
});

// Execute command
async function executeCommand(command) {
    const runCommandButton = document.querySelector(".run-command-btn");
    const cancelCommandButton = document.getElementById("cancel-btn");
    const commandStatus = document.getElementById("command-status");
    const commandLogs = document.getElementById("command-logs");
    const downloadLogsButton = document.getElementById("download-logs-btn");

    runCommandButton.disabled = true;
    cancelCommandButton.disabled = false;
    downloadLogsButton.disabled = true;

    commandStatus.textContent = "Running";
    commandStatus.classList.replace("idle", "running");
    commandLogs.innerHTML = `<p class="recent-execution-log">Executing command: ${command}...</p>`;
    currentCommand = command;

    try {
        const payload = {
            workspace_id: localStorage.getItem("workspace_id"),
            project_id: localStorage.getItem("project_id"),
            project_type: localStorage.getItem("PROJECT_TYPE"),
            command: command,
            token: localStorage.getItem("SESSION_TOKEN"),
        };

        // Simulate command execution (replace with this block for running tests without relying on API calls)
        // await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(`${COMMAND_EXECUTION}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to execute command");

        const result = await response.json();
        if (result.status !== "success") throw new Error("Command execution failed");

        saveCommandToHistory(command);
        loadCommandHistory();
        updatePreviousCommand();
        commandLogs.innerHTML = `<p>Command executed successfully: ${command}</p>`;
        downloadLogsButton.disabled = false;
    } catch (error) {
        commandLogs.innerHTML = `<p class="default-message">Error: ${error.message}</p>`;
        commandStatus.textContent = "Error";
        commandStatus.classList.replace("running", "error");
    } finally {
        currentCommand = null;
        runCommandButton.disabled = false;
        cancelCommandButton.disabled = true;
        commandStatus.textContent = "Idle";
        commandStatus.classList.replace("running", "idle");
    }
}

// Cancel command
function cancelCommand() {
    if (!currentCommand) {
        alert("No command to cancel.");
        return;
    }

    // To do - Implement cancel command logic
    console.log(`Canceling command: ${currentCommand}`);
    currentCommand = null;
    document.getElementById("command-status").textContent = "Idle";
    document.getElementById("command-status").classList.replace("running", "idle");
    document.getElementById("cancel-btn").disabled = true;
    document.querySelector(".run-command-btn").disabled = false;
}

// Load command history
function loadCommandHistory() {
    const historyList = document.getElementById("history-list");
    const history = JSON.parse(localStorage.getItem(commandHistoryKey)) || [];

    historyList.innerHTML = history.length
        ? history.map(cmd => `<li>${cmd}</li>`).join("")
        : `<li class="default-message">
                <ion-icon name="hammer"></ion-icon>
                Most recent commands will appear here.
            </li>`;
}

// Save command to history
function saveCommandToHistory(command) {
    let history = JSON.parse(localStorage.getItem(commandHistoryKey)) || [];
    history = [command, ...history.slice(0, maxHistory - 1)];
    localStorage.setItem(commandHistoryKey, JSON.stringify(history));
}

// Update the "Previous Command" UI
function updatePreviousCommand() {
    const history = JSON.parse(localStorage.getItem(commandHistoryKey)) || [];
    const previousCommand = history[0] || "None";
    const previousCommandElement = document.getElementById("current-command");
    previousCommandElement.textContent = `Previous Command: ${previousCommand}`;

    // Enable or disable the Re-run button
    const rerunButton = document.getElementById("rerun-btn");
    rerunButton.disabled = previousCommand === "None";
    rerunButton.onclick = () => {
        if (previousCommand !== "None") {
            executeCommand(previousCommand);
        }
    };
}

// Event listeners
document.querySelector(".run-command-btn").addEventListener("click", () => {
    const commandInput = document.getElementById("command-input");
    const command = commandInput.value.trim();

    if (command) {
        executeCommand(command);
        commandInput.value = ""; // Clear input
    } else {
        alert("Please enter a command before running.");
    }
});

document.getElementById("cancel-btn").addEventListener("click", cancelCommand);

// Toggle Command Panel
const toggleButton = document.getElementById("toggle-command-panel");
const commandRunnerContent = document.getElementById("command-panel-content");
const editorOverlay = document.getElementById("editor-overlay");

toggleButton.addEventListener("click", () => {
    const isCollapsed = commandRunnerContent.classList.toggle("collapsed");
    toggleButton.classList.toggle("collapse", isCollapsed);

    // Show or hide overlay based on panel visibility
    editorOverlay.classList.toggle("active", !isCollapsed);

    // Update caret icon
    const icon = toggleButton.querySelector("ion-icon");
    icon.name = isCollapsed ? "chevron-up-outline" : "chevron-down-outline";
});
