// auth.js

// Replace with your backend URL
const BASE_URL = "http://127.0.0.1:8000";
// login() - fixed
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString()   // <-- REQUIRED: convert to string
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    window.location.href = "dashboard.html";
  } else {
    const error = await res.json().catch(()=>({detail:"Login failed"}));
    alert(error.detail || "Login failed");
  }
}

// REGISTER FUNCTION (JSON is correct)
async function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!username || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  if (res.ok) {
    const data = await res.json();
    console.log("Registration successful:", data);
    alert("Registration successful! Please login.");
    window.location.href = "login.html";
  } else {
    const error = await res.json();
    alert(error.detail || "Registration failed");
  }
}
