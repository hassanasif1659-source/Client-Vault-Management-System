// 1. Users who can log in (username, email, password, name shown on the website)
const users = [
  { username: "hassan", email: "hassan@clientvault.com", password: "hassan123",
    name: "Mr. Hassan Asif", role: "Branch Manager" },
  { username: "admin", email: "admin@clientvault.com", password: "admin123",
    name: "Mr. Hassan Asif", role: "Branch Manager" }
];

// 2. Get the form parts from the HTML
const loginForm     = document.getElementById("loginForm");
const usernameInput = document.getElementById("Username");
const passwordInput = document.getElementById("Password");
const errorMessage  = document.getElementById("errorMessage");

// 3. When the Login button is pressed
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const userInput = usernameInput.value.trim();
  const password  = passwordInput.value.trim();

  // Empty fields?
  if (userInput === "" || password === "") {
    errorMessage.textContent = "Please fill both fields.";
    return;
  }

  // Username OR email must match, and the password must match
  const user = users.find(u =>
    (u.username === userInput || u.email === userInput) && u.password === password
  );

  if (user) {
    // Remember who logged in, then open the dashboard
    sessionStorage.setItem("cvUser", JSON.stringify({ name: user.name, role: user.role }));
    window.location.href = "dashboard.html";
  } else {
    errorMessage.textContent = "Wrong username or password.";
  }
});
