let wrapper;

function preloader() {
  wrapper = setTimeout(showPage, 3000);
}

function showPage() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("app").style.display = "block";

  setTimeout(() => {
    Toastify({
      text: "Welcome!",
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
  }, 900);
}
