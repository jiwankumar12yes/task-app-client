const loginBtn = document.getElementById("login");
const signupBtn = document.getElementById("signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginEmail = document.getElementById("email-login");
const loginPassword = document.getElementById("login-password");
const signupName = document.getElementById("name");
const signupPassword = document.getElementById("password");
const signupEmail = document.getElementById("email");
const loginToSignUpTab = document.getElementById("logToSignup");
const submitLogin = document.getElementById("submit-loginBtn");
const submitSignup = document.getElementById("sign-upBtn");
const toggleButton = document.getElementById("navToggleBtn");
const navMenu = document.getElementById("navbarMenu");

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const API_BASE_URL = "https://task-app-backend-cruj.onrender.com/api/v1/auth";
const api = axios.create({ baseURL: API_BASE_URL });

toggleButton.addEventListener("click", () => {
  if (navMenu.classList.contains("d-none")) {
    navMenu.classList.remove("d-none");
    navMenu.classList.add("d-block");
  } else {
    navMenu.classList.remove("d-block");
    navMenu.classList.add("d-none");
  }
});

function openLoginTab() {
  signupForm.reset();
  const inputs = signupForm.querySelectorAll("input");
  inputs.forEach((input) => {
    input.classList.remove("is-valid", "is-invalid");
  });
  signupForm.classList.add("d-none");
  signupBtn.classList.remove("active-tab");
  loginForm.classList.remove("d-none");
  loginBtn.classList.add("active-tab");
}

function openSignupTab() {
  loginForm.reset();
  const inputs = loginForm.querySelectorAll("input");
  inputs.forEach((input) => {
    input.classList.remove("is-valid", "is-invalid");
  });
  loginForm.classList.add("d-none");
  loginBtn.classList.remove("active-tab");
  signupBtn.classList.add("active-tab");
  signupForm.classList.remove("d-none");
  signupForm.classList.add("d-block");
}

function onEmailChange(event) {
  const inputElement = event.target;
  const emailValue = inputElement.value;
  const isValidEmail = emailRegex.test(emailValue);
  if (isValidEmail) {
    inputElement.classList.add("is-valid");
    inputElement.classList.remove("is-invalid");
  } else {
    inputElement.classList.remove("is-valid");
    inputElement.classList.add("is-invalid");
  }
}

function onPasswordChange(event) {
  // debugger;
  const inputElement = event.target;
  const passwordValue = inputElement.value;
  if (passwordValue.length >= 4) {
    inputElement.classList.add("is-valid");
    inputElement.classList.remove("is-invalid");
  } else {
    inputElement.classList.remove("is-valid");
    inputElement.classList.add("is-invalid");
  }
}

function onNameChange() {
  const nameValue = signupName.value;
  if (nameValue.length >= 3) {
    signupName.classList.add("is-valid");
    signupName.classList.remove("is-invalid");
  } else {
    signupName.classList.remove("is-valid");
    signupName.classList.add("is-invalid");
  }
}

async function sendLogin() {
  const email = loginEmail.value;
  const password = loginPassword.value;
  try {
    const response = await api.post("/login", {
      email: email,
      password: password,
    });

    const result = response.data;

    Toastify({
      text: result.message,
      duration: 1500,
      style: {
        background: "green",
      },
    }).showToast();
    localStorage.setItem("userName", result.data.user.name);
    localStorage.setItem("accessToken", result.data.accessToken);
    location.replace("/dashboard.html");
  } catch (error) {
    Toastify({
      text: error.response ? error.response.data.message : error.message,
      duration: 1500,
      style: {
        background: "red",
      },
    }).showToast();
  } finally {
    loginEmail.value = "";
    loginPassword.value = "";
    loginEmail.classList.remove("is-valid", "is-invalid");
    loginPassword.classList.remove("is-valid", "is-invalid");
  }
}

async function sendSignup() {
  const name = signupName.value;
  const email = signupEmail.value;
  const password = signupPassword.value;

  try {
    const response = await api.post("/register", { name, email, password });
    const result = response.data;
    Toastify({
      text: result.message,
      duration: 1500,
      style: {
        background: "green",
      },
    }).showToast();
  } catch (error) {
    Toastify({
      text: error.response ? error.response.data.message : error.message,
      duration: 1500,
      style: {
        background: "red",
      },
    }).showToast();
  } finally {
    signupName.value = "";
    signupEmail.value = "";
    signupPassword.value = "";
    signupEmail.classList.remove("is-valid", "is-invalid");
    signupPassword.classList.remove("is-valid", "is-invalid");
    signupName.classList.remove("is-valid", "is-invalid");
  }
}

loginBtn.addEventListener("click", openLoginTab);
signupBtn.addEventListener("click", openSignupTab);

loginEmail.addEventListener("input", onEmailChange);
loginPassword.addEventListener("input", onPasswordChange);
signupEmail.addEventListener("input", onEmailChange);
signupPassword.addEventListener("input", onPasswordChange);
signupName.addEventListener("input", onNameChange);
loginToSignUpTab.addEventListener("click", openSignupTab);

submitLogin.addEventListener("click", () => {
  if (
    loginEmail.value !== null &&
    loginEmail.value.length > 0 &&
    loginPassword.value.length >= 4
  ) {
    sendLogin();
  } else {
    Toastify({
      text: "Kindly check email and password",
      duration: 1500,
    }).showToast();
  }
});

submitSignup.addEventListener("click", (event) => {
  event.preventDefault();
  let message = "";
  if (signupName.value.length < 3) {
    message = "Name should be at least 3 character";
  } else if (
    signupEmail.value.length !== null &&
    signupEmail.value.length < 4
  ) {
    message = "check your email";
  } else if (signupPassword.value.length < 4) {
    message = "password should be at least 4 character";
  }
  if (message !== "") {
    Toastify({
      text: message,
      duration: 1500,
      style: {
        background: "red",
      },
    }).showToast();
  } else {
    sendSignup();
  }
});
