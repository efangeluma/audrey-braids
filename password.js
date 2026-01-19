document.getElementById("userPw").addEventListener("submit", function(e) {
    e.preventDefault();
document.getElementById("confirmPw").addEventListener("submit", function(e) {
    e.preventDefault();
    const pwInput = document.getElementById("userPw").value;
    const confirmPwInput = document.getElementById("confirmPw").value;
})
    if (pwInput === confirmPwInput) {
        alert("Password confirmed successfully!");
        window.location.href = "index.html";
    } else {
        alert("Passwords do not match. Please try again.");
    }
});