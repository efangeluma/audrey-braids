document.getElementById("ageForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const birthDateInput = document.getElementById("birthDate").value;
    const Message = document.getElementById("message");
    const userPw = document.getElementById("userPw").value;
    const confirmPw = document.getElementById("confirmPw").value;
    if (!birthDateInput) {
        Message.textContent = "Please enter your date of birth.";
        return;
    }
    const birthDate = new Date(birthDateInput);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const daydiff = today.getDate() - birthDate.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && daydiff < 0)) {
        age--;
    }
    if (age < 16) {
        alert("Access denied. You must be at least 16 years old.");
        return;
    }
    if (userPw.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }
    if (userPw !== confirmPw) {
        alert("Passwords do not match. Please try again.");
        return;
    }
    if (userPw === confirmPw && userPw.length >= 8 && age >= 16) {
        alert("Access granted. You are old enough and your password is valid.");
        window.location.href = "info.html"; // Redirect to login/sign-up page
    } else {
        alert("Access denied. Please check your inputs.");
    }
    window.location.href = "index.html"; // Redirect to login/sign-up page
});