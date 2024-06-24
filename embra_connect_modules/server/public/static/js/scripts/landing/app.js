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
    borderRadius: "64px 21px 64px 32px",
    fontWeight: "300",
    letterSpacing: "1.4px",
    textTransform: "capitalize",
  },
  // Handle callback after click.
  onClick: function () {},
}).showToast();
