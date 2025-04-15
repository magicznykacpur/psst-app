import { Toast } from "bootstrap";

const initLoginRenderer = () => {
  window.addEventListener("DOMContentLoaded", async () => {
    loginFormSubmitHandler();
    signupButtonHandler();
  });
};

const loginFormSubmitHandler = () => {
  const loginForm = document.getElementById("login-form") as HTMLFormElement;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (loginForm.checkValidity()) {
      const email = (document.getElementById("email") as HTMLInputElement)
        .value;
      const password = (document.getElementById("password") as HTMLInputElement)
        .value;

      const token = await getJWTToken(email, password);

      if (!token) {
        invalidLoginDetailsToast();
      } else {
        window.api.saveUserToken(token);
        window.api.goToDashboard(token);
      }
    }

    loginForm.classList.add("was-validated");
  });
};

const invalidLoginDetailsToast = () => {
  const toast = document.getElementById("invalid-login-details");
  const toastBootstrap = Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
};

const signupButtonHandler = () => {
  const signupButton = document.getElementById(
    "signup-button"
  ) as HTMLButtonElement;

  signupButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    window.api.goToSignup();
  });
};

const getJWTToken = async (email: string, password: string) => {
  try {
    const data = await window.api.requestWithBody(`${window.api_url}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    });

    return data.token;
  } catch (error) {
    console.error(error);
  }
};

initLoginRenderer();
