class Notifications {
  static displayToasterMessage(message) {
    /**
     * @name displayToasterMessage
     * @description Display <toaster> messages.
     * @param {string} message
     * @returns {Promise<void>}
     * */

    Toastify({
      text: `${message}`,
      duration: 3000,
      newWindow: true,
      close: false,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#f38041",
        color: "#ffffff",
        borderRadius: "9px 21px 64px 32px",
        fontWeight: "300",
        letterSpacing: "1.4px",
        textTransform: "capitalize",
        boxShadow: "0 1rem 1rem 0 rgba(0, 0, 0, .1)",
      },
      // Handle callback after click.
      onClick: function () {},
    }).showToast();
  }
}

//////////////////////////
//// Preloader logic. ////
//////////////////////////
const iframe = document.getElementById("editor");
const pageContent = document.getElementById("page-content");
const loader = document.getElementById("loader");

loader.style.display = "block";
iframe.style.display = "none";

// Set a timeout to handle cases where the iframe/<editor> takes too long to load.
const loadTimeout = setTimeout(() => {
  loader.style.display = "none";
  iframe.style.display = "none";

  // Placeholder message incase the editor fails to load.
  pageContent.innerHTML = `
    <div id="iframe-error-response">
        <div class="message">
            <img src="" class="message-img" />
            <p>Something went wrong...</p>
        </div>
    </div>
  `;

  Notifications.displayToasterMessage("Failed to load editor");
}, 7000);

iframe.onload = function () {
  // Clear the timeout since the iframe loaded successfully
  clearTimeout(loadTimeout);
  loader.style.display = "none";
  iframe.style.display = "block";

  setTimeout(() => {
    Notifications.displayToasterMessage("Setting up editor");
  }, 900);
};

// Handle <iframe> errors.
iframe.onerror = function () {
  // Clear timeout in case of any errors.
  clearTimeout(loadTimeout);
  loader.style.display = "none";
  iframe.style.display = "none";

  Notifications.displayToasterMessage("Failed to load content.");
};
