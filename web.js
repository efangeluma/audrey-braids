/*
const
*/

//for making sure a field is not left empty
const myAge = document.getElementById('myAge');
myAge.addEventListener('submit' , function (event) { 
    const input = document.getElementById('username'); //(.trim) removes empty spaces the user might have typed
    if(input.Value.trim() === "" ) {
        event.preventDefault(); //stops the form from being submitted
        alert("please fill out this field!")
        input.style.border = "2px solid red" //visual feedback
    }
})
document.getElementById("ageForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const birthDateInput = document.getElementById("birthDate").value;
    const Message = document.getElementById("message");
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
    if (age >= 16) {
        alert("Access granted. You are old enough.");
        window.location.href = "info.html"; // Redirect to login/sign-up page
    } else {
        alert("Access denied. You must be at least 16 years old.");
    }
});
