onPageLoad();

/*-------------------------
The following content will be excluded when
rendering the file-tree.
----------------------------*/
const excludedItems = ['.git', 'node_modules', '.DS_Store', 'workspace_logs', 'target'];

/*------------------------
Editor starts here.
---------------------------*/
require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs" } });

require(["vs/editor/editor.main"], function () {
    const tabsContainer = document.getElementById("tabs");
    const editorContainer = document.getElementById("editor");
    const fileTree = document.getElementById("file-tree");

    const editors = {}; // Store Monaco editor instances by file path.
    let activeTab = null;
    let files = {}; // Store the file tree data.
    let rootKey = null; // Root folder key for dynamic file structures.

    /****************************
     * Fetch and parse file data.
     ******************************/
    async function loadFiles() {
        const projectId = localStorage.getItem("project_id");
        const token = localStorage.getItem("SESSION_TOKEN");

        try {
            /************************************************************
             * For [local] development i.e. if you're running without
             * the backend service, use:
             * 
             * const response = await fetch("../../../data/files.json");
             **********************************************************/
            const response = await fetch(`${ENDPOINTS.DIRECTORY_MANAGEMENT}/list`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "project_name": projectId, "token": token }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            files = await response.json();

            console.warn("Populating file tree content...");

            /*********************************
             * Dynamically set the [root] key, 
             * original implementation.
             * 
             * rootKey = Object.keys(files)[0]; 
             ***********************************/
            rootKey = Object.keys(files)[0];

            /****************************************************************
             * Store current <rootKey> to local storage.
             * The rootKey represents the top level directory i.e. workspace
             * that the project's source code lives in
             ***************************************************************/
            localStorage.setItem('ROOT_KEY', rootKey);

            /***********************************************************************************
             * Define project identifiers (specific files characteristic of each project type).
             ************************************************************************************/
            const projectIdentifiers = {
                dbt: ["dbt_project.yml"],
                rust: ["Cargo.toml"],
                node: ["package.json"],
            };

            // Variables to store detected project type and key.
            let projectType = null;
            let projectKey = null;

            if (files[rootKey]) {
                // Iterate through projects under the root key.
                for (const key of Object.keys(files[rootKey])) {
                    // Check for each project type.
                    for (const [type, identifiers] of Object.entries(projectIdentifiers)) {
                        if (identifiers.some(file => files[rootKey][key]?.[file])) {
                            projectType = type;
                            projectKey = key;
                            break;
                        }
                    }
                    if (projectKey) break; // Stop if a project is identified.
                }
            }

            if (projectKey && projectType) {
                // Store the project key and type in local storage
                localStorage.setItem('PROJECT_KEY', projectKey);
                localStorage.setItem('PROJECT_TYPE', projectType);
            } else {
                console.log("No recognizable project found in the response.");
            }

            renderFileTree();
        } catch (error) {
            console.error("Failed to load files:", error);
        }
    }

    /***********************************
     * Render file tree in the sidebar. 
     ***********************************/
    function renderFileTree() {
        if (!files[rootKey]) {
            console.error("No valid root folder found in data.");
            fileTree.innerHTML = `
                <p style="font-weight: 400; display: flex; align-items: center; justify-content: center; height: 100%;">
                    ⚠ No files to display.
                </p>
            `;
            return;
        }

        fileTree.innerHTML = createTreeMarkup(files[rootKey]);
    }


    /***************************************************
     * Recursive function to create the file tree HTML. 
     **************************************************/
    function createTreeMarkup(data, path = "") {
        return Object.entries(data)
            .filter(([key]) => !excludedItems.includes(key))
            .map(([key, value]) => {
                const fullPath = path ? `${path}/${key}` : key;

                if (value.content !== undefined) {
                    // File node.
                    return `<li class="file" data-path="${fullPath}" onclick="openFile('${fullPath}')">
                                <ion-icon name="document"></ion-icon> ${value.name}
                            </li>`;
                } else {
                    // Folder node with data-path.
                    return `<li class="folder" data-path="${fullPath}">
                                <ion-icon name="folder"></ion-icon>
                                <span onclick="toggleFolder(this)">${key}</span>
                                <ul class="folder-contents">
                                    ${createTreeMarkup(value, fullPath)}
                                </ul>
                            </li>`;
                }
            })
            .join("");
    }

    /****************************
     * Open a file in the editor. 
     *****************************/
    window.openFile = function (filePath) {
        const fileData = getFileDetails(filePath.split("/"), files[rootKey]);
        if (!fileData) {
            console.error(`File data not found for path: ${filePath}`);
            return;
        }

        if (fileData.binary) {
            alert("Binary files cannot be opened in the editor.");
            return;
        }

        if (editors[filePath]) {
            setActiveTab(filePath);
            return;
        }

        const tab = document.createElement("div");
        tab.className = "tab";
        tab.dataset.path = filePath;
        tab.innerHTML = `
            ${fileData.name} 
            <span onclick="closeTab('${filePath}')">
                <ion-icon name="close-circle"></ion-icon>
            </span>
        `;
        tab.addEventListener("click", () => setActiveTab(filePath));
        tabsContainer.appendChild(tab);

        const newEditor = monaco.editor.create(editorContainer, {
            value: fileData.content,
            language: getLanguage(fileData.name),
            theme: "vs",
            automaticLayout: true,
        });

        editors[filePath] = { editor: newEditor, savedContent: fileData.content, unsaved: false };

        // Track changes
        newEditor.onDidChangeModelContent(() => {
            const editorState = editors[filePath];
            const hasChanges = editorState.savedContent !== newEditor.getValue();
            editorState.unsaved = hasChanges;
            toggleSaveUndoButtons(hasChanges);
        });

        setActiveTab(filePath);
    };

    /** Set a tab as active */
    function setActiveTab(filePath) {
        // Remove placeholder if visible
        updatePlaceholderState();

        // Deactivate all tabs
        Array.from(tabsContainer.children).forEach((tab) => tab.classList.remove("active"));
        Object.values(editors).forEach(({ editor }) => {
            editor.getDomNode().style.display = "none";
        });

        // Locate the tab element for the given file path
        const activeTabElement = Array.from(tabsContainer.children).find(
            (tab) => tab.dataset.path === filePath
        );

        if (!activeTabElement) {
            console.warn(`Attempted to activate a non-existent tab for file path: ${filePath}.`);
            return; // Exit gracefully if the tab no longer exists
        }

        // Activate the selected tab
        activeTabElement.classList.add("active");

        // Show the corresponding editor
        const activeEditor = editors[filePath].editor; // Access the editor instance
        if (activeEditor) {
            activeEditor.getDomNode().style.display = "block";
            activeEditor.layout();
        }

        activeTab = filePath; // Update active tab reference
    }

    /** Close a tab */
    window.closeTab = function (filePath) {
        const editorData = editors[filePath];
        if (editorData && editorData.editor) {
            editorData.editor.dispose(); // Properly dispose of the editor instance
            delete editors[filePath]; // Remove the editor entry from the `editors` object
        }

        // Find and remove the corresponding tab
        const tab = Array.from(tabsContainer.children).find(
            (tab) => tab.dataset.path === filePath
        );
        if (tab) {
            tabsContainer.removeChild(tab);
        }

        // Handle active tab logic when closing the current active tab
        if (activeTab === filePath) {
            const remainingTabs = Object.keys(editors);

            if (remainingTabs.length > 0) {
                setActiveTab(remainingTabs[0]); // Activate another tab if available
            } else {
                activeTab = null; // Clear the active tab reference
            }
        }

        // Always check and update the placeholder state
        updatePlaceholderState();
    };

    /**
     * Updates the placeholder visibility based on the current editor state.
     */
    function updatePlaceholderState() {
        if (Object.keys(editors).length === 0) {
            displayPlaceholder(editorContainer, "No file is open. Select a file to start editing.");
        } else {
            removePlaceholder(editorContainer);
        }
    }

    /** Initialize the placeholder on load */
    function initializeEditor() {
        loadFiles();
        displayPlaceholder(editorContainer, "No file is open. Select a file to start editing.");
    }
    initializeEditor();

    /** Utility: Get file details from the nested structure */
    function getFileDetails(pathParts, currentNode) {
        const [currentPart, ...restParts] = pathParts;
        if (!currentNode || !currentNode[currentPart]) return null;

        if (restParts.length === 0) return currentNode[currentPart];
        return getFileDetails(restParts, currentNode[currentPart]);
    }

    /** Utility: Get language for Monaco Editor */
    function getLanguage(fileName) {
        const ext = fileName.split(".").pop();
        const langMap = {
            js: "javascript",
            html: "html",
            css: "css",
            json: "json",
            yml: "yaml",
            txt: "plaintext",
            sql: "sql",
            rs: "rust",
        };
        return langMap[ext] || "plaintext";
    }

    /** Initialize the file tree and editor */
    loadFiles();

    /** Folder toggle functionality */
    window.toggleFolder = function (folderToggle) {
        const folderContents = folderToggle.nextElementSibling;
        if (folderContents.style.display === "none") {
            folderContents.style.display = "block";
        } else {
            folderContents.style.display = "none";
        }
    };

    function toggleSaveUndoButtons(show) {
        const actionButtons = document.getElementById("action-buttons");
        actionButtons.style.display = show ? "block" : "none";
    }

    window.saveChanges = async function () {
        if (!activeTab) return;

        const { editor, savedContent } = editors[activeTab];
        const updatedContent = editor.getValue();
        const workspace = localStorage.getItem('workspace_id');
        const project = localStorage.getItem("project_id");
        const token = localStorage.getItem("SESSION_TOKEN");

        try {
            // Prepare the full path and request payload
            const payload = {
                file_name: `${workspace}/${activeTab}`,
                workspace_id: workspace,
                project_name: project,
                content: updatedContent,
                is_folder: false,
                token: token
            };

            // [DEBUG] logs
            // console.log(payload);

            const response = await fetch(`${ENDPOINTS.FILE_MANAGEMENT}/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();

            if (!response.ok) throw new Error(`Failed to save changes: ${response.statusText}`);

            editors[activeTab].savedContent = updatedContent;
            editors[activeTab].unsaved = false;
            console.log("Changes saved successfully!");
            showToast("Saving changes", COLOR_CODE.SUCCESS);
            toggleSaveUndoButtons(false);
            loadFiles();
        } catch (error) {
            console.error("Error saving changes:", error);
            alert("Failed to save changes.");
        }
    };

    window.undoChanges = function () {
        if (!activeTab) return;

        const { editor, savedContent } = editors[activeTab];
        editor.setValue(savedContent);
        editors[activeTab].unsaved = false;
        toggleSaveUndoButtons(false);
    }
});


/*------------------------------
THE FOLLOWING SECTION CONTAINS UTILITY
FUNCTION THAT MODIFY THE UI's STATE.
----------------------------------*/

/**
 * Displays a placeholder message inside a container.
 *
 * This function clears any existing content inside the container and inserts a
 * placeholder message with some basic styling.
 * The placeholder is centered and styled for visibility.
 *
 * @param {HTMLElement} container - The container element where the placeholder will
 * be displayed.
 * @param {string} message - The message to be shown in the placeholder.
 */
function displayPlaceholder(container, message) {
    // Avoid creating duplicate placeholders
    if (container.querySelector('.placeholder')) return;

    // Remove any existing content in the container
    container.innerHTML = `
        <div class="placeholder" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            font-size: 1.4em;
            font-weight: 500;
            color: #999;
            text-align: center;
            user-select: none;">
            <ion-icon name="document-outline" style="font-size: 3em; margin-bottom: 0.5em;"></ion-icon>
            ${message}
        </div>
    `;
}

/**
 * Removes the placeholder message from a container.
 *
 * This function looks for an existing placeholder within the container and removes it.
 *
 * @param {HTMLElement} container - The container element from which the placeholder
 * will be removed.
 */
function removePlaceholder(container) {
    const placeholder = container.querySelector('.placeholder');
    if (placeholder) {
        placeholder.remove();
    }
}
