document.addEventListener("DOMContentLoaded", function() {

  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookies");
  const rejectBtn = document.getElementById("reject-cookies");

  const cookieChoice = localStorage.getItem("cookieConsent");

  if (!cookieChoice) {
    banner.style.display = "block";
  }

  acceptBtn.addEventListener("click", function() {
    localStorage.setItem("cookieConsent", "accepted");
    banner.style.display = "none";
  });

  rejectBtn.addEventListener("click", function() {
    localStorage.setItem("cookieConsent", "rejected");
    banner.style.display = "none";
  });

});
