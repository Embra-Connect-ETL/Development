let wrapper;
const PROFILE_NAME = document.querySelector(".profile-link");

////////////////////////////////////////////////
///////////// <utility> classes ////////////////
////////////////////////////////////////////////
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

/////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////