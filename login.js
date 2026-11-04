// 1. Users ki list (username, email aur password)
const users = [
  { username: "admin",  email: "admin@clientvault.com",  password: "admin123" },
  { username: "hassan", email: "hassan@clientvault.com", password: "hassan123" }
];

// 2. HTML ki cheezein pakro (ids bilkul HTML jaisi, capital ke saath)
const loginForm     = document.getElementById("loginForm");
const usernameInput = document.getElementById("Username");
const passwordInput = document.getElementById("Password");
const errorMessage  = document.getElementById("errorMessage");

// 3. Login button dabane par
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const userInput = usernameInput.value.trim();
  const password  = passwordInput.value.trim();

  // Khaali to nahi?
  if (userInput === "" || password === "") {
    errorMessage.textContent = "Please fill both fields.";
    return;
  }

  // Username YA email match ho, aur password bhi match ho
  const user = users.find(u =>
    (u.username === userInput || u.email === userInput) && u.password === password
  );

  if (user) {
    window.location.href = "dashboard.html";   // sahi → agla page khulega
  } else {
    errorMessage.textContent = "Wrong username or password.";  // galat → error
  }
});