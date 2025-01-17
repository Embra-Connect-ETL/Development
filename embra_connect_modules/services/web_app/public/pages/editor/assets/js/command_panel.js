const COMMAND_EXECUTION = "http://localhost:7000";

let currentCommand = null;
const commandHistoryKey = "commandHistory"; // Local storage key for command history
const maxHistory = 5; // Max commands to display in history

document.addEventListener("DOMContentLoaded", () => {
    loadCommandHistory();
});

// Execute command
async function executeCommand(command) {
    const runCommandButton = document.querySelector('.run-command-btn');
    const cancelCommandButton = document.getElementById('cancel-btn');
    const commandStatus = document.getElementById('command-status');
    const commandLogs = document.getElementById('command-logs');
    const historyList = document.getElementById('history-list');
    const downloadLogsButton = document.getElementById("download-logs-btn");

    runCommandButton.disabled = true;
    cancelCommandButton.disabled = false;
    downloadLogsButton.disabled = true;

    commandStatus.textContent = "Running";
    commandStatus.classList.replace("idle", "running");
    commandLogs.innerHTML = `<p class="recent-execution-log">Executing command: ${command}...</p>`;
    currentCommand = command;
    const token = localStorage.getItem("SESSION_TOKEN");
    const workspaceId = localStorage.getItem("workspace_id");
    const projectName = localStorage.getItem("project_id");
    const projectType = localStorage.getItem("PROJECT_TYPE");


    try {
        let payload = {
            workspace_id: workspaceId,
            project_id: projectName,
            project_type: projectType,
            command: command,
            token: token
        };

        console.log(payload);


        // const response = await fetch(`${COMMAND_EXECUTION}/execute`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(payload),
        // });

        // if (!response.ok) throw new Error("Failed to execute command");

        // const result = await response.json();
        // if (result.status !== "success") throw new Error("Command execution failed");

        // commandLogs.innerHTML = `<p>Command executed successfully:</p><pre>${JSON.stringify(result, null, 2)}</pre>`;
        saveCommandToHistory(command);
        loadCommandHistory();
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
async function cancelCommand() {
    if (!currentCommand) return alert("No command to cancel.");
    console.log(`Canceling command: ${currentCommand}`);

    // Simulate cancel
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
            </li>
        `;
}

// Save command to history
function saveCommandToHistory(command) {
    let history = JSON.parse(localStorage.getItem(commandHistoryKey)) || [];
    history = [command, ...history.slice(0, maxHistory - 1)];
    localStorage.setItem(commandHistoryKey, JSON.stringify(history));
}

// Event listeners
document.querySelector('.run-command-btn').addEventListener('click', () => {
    const commandInput = document.getElementById('command-input');
    const command = commandInput.value.trim();

    if (command) {
        executeCommand(command);

        setTimeout(() => {
            commandInput.value = "";
        }, 1000);
    } else {
        alert("Please enter a command before running.");
    }
});

document.getElementById('cancel-btn').addEventListener('click', cancelCommand);


// Event listeners for Run and Cancel buttons
document.querySelector('.run-command-btn').addEventListener('click', () => {
    const commandInput = document.getElementById('command-input');
    const command = commandInput.value.trim();

    if (command) {
        console.log("Executing command:", command);
        executeCommand(command); // Execute the command asynchronously
        commandInput.value = ''; // Clear the input field after submission
    } else {
        alert('Please enter a command before running.');
    }
});

document.getElementById('cancel-btn').addEventListener('click', cancelCommand);

// Re-run Command Button
document.getElementById("rerun-btn").addEventListener("click", () => {
    console.log("Re-running command...");
    // Logic to re-run the selected command
});

// Download Logs Button
document.getElementById("download-logs-btn").addEventListener("click", () => {
    console.log("Downloading logs...");
    // Generate and download a logs file (optional implementation)
});

/*-------------------
Toggle Command Panel
---------------------*/
const toggleButton = document.getElementById('toggle-command-panel');
const commandRunnerContent = document.getElementById('command-panel-content');
const editorOverlay = document.getElementById('editor-overlay');

toggleButton.addEventListener('click', () => {
    const isCollapsed = commandRunnerContent.classList.toggle('collapsed');
    toggleButton.classList.toggle('collapse', isCollapsed);

    // Show or hide the overlay based on panel visibility
    if (isCollapsed) {
        editorOverlay.classList.remove('active');
    } else {
        editorOverlay.classList.add('active');
    }

    // Update the caret icon
    const icon = toggleButton.querySelector('ion-icon');
    icon.name = isCollapsed ? 'chevron-up-outline' : 'chevron-down-outline';
});
