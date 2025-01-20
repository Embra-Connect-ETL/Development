const COMMAND_EXECUTION = "https://ec-connect-ide-1-0.onrender.com";

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

        const response = await fetch(`${COMMAND_EXECUTION}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Handle success case
            const output = result.output || "Command executed successfully (no output)";
            commandLogs.innerHTML = `<pre class="dbt-logs">${output}</pre>`;
            commandStatus.textContent = "Success";
            commandStatus.classList.replace("running", "success");
            downloadLogsButton.disabled = false;
        } else if (result.error) {
            // Handle execution error case
            const error = result.error || "Unknown error occurred during execution.";
            commandLogs.innerHTML = `<p class="default-message">Error:</p><pre>${error}</pre>`;
            commandStatus.textContent = "Error";
            commandStatus.classList.replace("running", "error");
        } else if (result.message) {
            // Handle validation/timeout errors
            const message = result.message || "Something went wrong.";
            commandLogs.innerHTML = `<p class="default-message">Error:</p><pre>${message}</pre>`;
            commandStatus.textContent = "Error";
            commandStatus.classList.replace("running", "error");
        }
    } catch (error) {
        // Handle network or unexpected errors
        console.error("Unexpected error:", error);
        commandLogs.innerHTML = `<p class="default-message">Unexpected error occurred:</p><pre>${error.message}</pre>`;
        commandStatus.textContent = "Error";
        commandStatus.classList.replace("running", "error");
    } finally {
        // Update command history
        updateCommandHistory(command);

        // Reset UI to idle state
        currentCommand = null;
        runCommandButton.disabled = false;
        cancelCommandButton.disabled = true;
        if (commandStatus.textContent === "Running") {
            commandStatus.textContent = "Idle";
            commandStatus.classList.replace("running", "idle");
        }
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

// Load command history into the UI
function loadCommandHistory() {
    const commandHistory = JSON.parse(localStorage.getItem(commandHistoryKey)) || [];
    const commandHistoryContainer = document.getElementById("history-list");

    // Clear existing history display
    commandHistoryContainer.innerHTML = "";

    // If there is no history, show default message
    if (commandHistory.length === 0) {
        const defaultMessage = document.createElement("li");
        defaultMessage.classList.add("default-message");
        defaultMessage.textContent = "Most recent commands will appear here.";
        commandHistoryContainer.appendChild(defaultMessage);
    } else {
        // Populate the history display
        commandHistory.forEach((command, index) => {
            const commandItem = document.createElement("li");
            commandItem.className = "history-item";
            commandItem.textContent = command;
            commandItem.addEventListener("click", () => executeCommand(command)); // Re-execute on click
            commandHistoryContainer.appendChild(commandItem);
        });
    }
}

// Update command history in localStorage and UI
function updateCommandHistory(command) {
    let commandHistory = JSON.parse(localStorage.getItem(commandHistoryKey)) || [];

    // Remove the command if it already exists (to prevent duplicates)
    commandHistory = commandHistory.filter((item) => item !== command);

    // Add the command to the top of the history
    commandHistory.unshift(command);

    // Enforce max history size
    if (commandHistory.length > maxHistory) {
        commandHistory = commandHistory.slice(0, maxHistory);
    }

    // Save updated history back to localStorage
    localStorage.setItem(commandHistoryKey, JSON.stringify(commandHistory));

    // Refresh UI
    loadCommandHistory();
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
    const previousCommand = history.length > 0 ? history[0] : null; // Default to null
    const previousCommandElement = document.getElementById("current-command");

    // Default message when no command history
    if (!previousCommand) {
        previousCommandElement.textContent = "Previous Command: None";
    } else {
        previousCommandElement.textContent = `Previous Command: ${previousCommand}`;
    }

    // Enable or disable the Re-run button
    const rerunButton = document.getElementById("rerun-btn");
    rerunButton.disabled = !previousCommand;
    rerunButton.onclick = () => {
        if (previousCommand) {
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
    // Toggle collapsed state for the command panel
    const isCollapsed = commandRunnerContent.classList.toggle("collapsed");

    // Show or hide overlay based on panel visibility
    editorOverlay.classList.toggle("active", !isCollapsed);

    // Add or remove class for caret rotation
    toggleButton.classList.toggle("expanded", !isCollapsed);
});