/**********************************************
 * The following section contains [DEFAULT]
 * values that's specific to side ba  logic.
 **********************************************/
const FILE_FOLDER_CREATION = "https://ec-connect-ide-1-0.onrender.com";

// Modal Element References
const modal = document.getElementById('custom-modal');
const modalInput = document.getElementById('modal-input');
const modalPath = document.getElementById('modal-path');
const modalProceedBtn = document.getElementById('modal-proceed-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalTitle = document.getElementById('modal-title');

// Assume the project name is set dynamically in a global or DOM attribute
const projectName = document.getElementById('file-tree').dataset.projectName; // Adjust as necessary

let actionType = null; // "file" or "folder"

// Open Modal Function
function openModal(type) {
    actionType = type;
    modalTitle.innerHTML = `
    <ion-icon name="add-circle" class="add-icon"></ion-icon>
    Add ${type === 'file' ? 'File' : 'Folder'}
    `;
    modalInput.value = '';
    modalPath.value = '';
    modal.classList.remove('hidden');
}

// Close Modal Function
function closeModal() {
    modal.classList.add('hidden');
}

// Handle Proceed Button Click
modalProceedBtn.addEventListener('click', async () => {
    const name = modalInput.value.trim();
    const path = modalPath.value.trim();
    const workspaceId = localStorage.getItem("workspace_id");
    const projectName = localStorage.getItem("project_id");
    const token = getSessionToken();

    if (!validateToken(token)) {
        showToast("Session invalid", COLOR_CODE.WARNING);
        redirectToLogin();
    }

    if (!name) {
        showToast("Name cannot be empty", COLOR_CODE.WARNING);
        return;
    }

    const fullPath = path ? `${path}/${name}` : name;

    try {
        // Call API to update JSON
        await updateJson({
            name: fullPath,
            workspace_id: workspaceId,
            project_name: projectName,
            is_folder: actionType === 'folder',
            token: token
        });

        showToast(`${actionType === 'file' ? 'File' : 'Folder'} created successfully!`, COLOR_CODE.SUCCESS);

        closeModal();

        /**********************************
            To do: Reload the file tree 
        *********************************/

    } catch (error) {
        console.error("Error: ", error);
        showToast(`Failed to create ${actionType}.`, COLOR_CODE.FAILURE);
        closeModal();
    }
});

modalCancelBtn.addEventListener('click', () => {
    closeModal();
});

document.getElementById('add-file-btn').addEventListener('click', () => openModal('file'));
document.getElementById('add-folder-btn').addEventListener('click', () => openModal('folder'));

/*--------------------
Create files/folders
--------------------*/
async function updateJson(data) {
    try {
        const response = await fetch(`${FILE_FOLDER_CREATION}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        return await response.json();
    } catch (error) {
        console.error("Error updating JSON:", error);
        return { success: false };
    }
}