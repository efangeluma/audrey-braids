const profileBtn = document.getElementById("profileBtn");
const profileMenu = document.getElementById("dropdownMenu");
profileBtn.addEventListener("click", () => {
    profileMenu.style.display =
        profileMenu.style.display === "block" ? "none" : "block";
});
document.addEventListener("click", (e) => {
    if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.style.display = "none";
    }
});
//for logout functionality
document.getElementById("logoutForm").addEventListener("submit", function(e) {
    e.preventDefault();
const logOut = document.getElementById("logOut");
logOut.addEventListener("click", () => {
    // Clear user session or authentication tokens here
    alert("You have been logged out.");
    window.location.href = "index.html"; // Redirect to homepage or login page
});
});