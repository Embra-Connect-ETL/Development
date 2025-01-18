/**
 * Adds a smooth scroll behavior to tabs when clicked.
 * 
 * This function listens for the 'click' event on a container of tabs. When a tab is 
 * clicked, it scrolls the tab into view with smooth scrolling, aligning the tab in 
 * the center horizontally and nearest vertically.
 * 
 * behavior: 'smooth', - Enables smooth scrolling.
 * block: 'nearest', - Aligns vertically (if needed, but horizontal matters here).
 * inline: 'center', -  Centers the tab horizontally in the view.
 */
document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.getElementById('tabs');

    /**
     * Handles the click event on the tabs container.
     * 
     * @param {Event} event - The click event triggered by the user.
     */
    tabsContainer.addEventListener('click', (event) => {
        const clickedTab = event.target.closest('.tab'); // Target DOM element via selector
        if (clickedTab) {
            clickedTab.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    });
});
