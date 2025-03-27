import { Toast } from "bootstrap"

const initLoginRenderer = () => {
  window.addEventListener("DOMContentLoaded", () => {
    loginFormSubmitHandler();
    signupButtonHandler();
  })
}

const loginFormSubmitHandler = () => {
  const loginForm = document.getElementById("login-form") as HTMLFormElement

  loginForm.addEventListener("submit", async event => {
    event.preventDefault()
    event.stopPropagation()

    if (loginForm.checkValidity()) {
      const email = (document.getElementById("email") as HTMLInputElement).value
      const password = (document.getElementById("password") as HTMLInputElement).value

      const token = await getJWTToken(email, password)

      if (!token) {
        invalidLoginDetailsToast()
      } else {
        succesfullyLoggedInToast()
      }
    }

    loginForm.classList.add("was-validated")
  })
}

const succesfullyLoggedInToast = () => {
  const toast = document.getElementById('login-successful')
  const toastBootstrap = Toast.getOrCreateInstance(toast)
  toastBootstrap.show()
}

const invalidLoginDetailsToast = () => {
  const toast = document.getElementById('invalid-login-details')
  const toastBootstrap = Toast.getOrCreateInstance(toast)
  toastBootstrap.show()
}

const signupButtonHandler = () => {
  const signupButton = document.getElementById("signup-button") as HTMLButtonElement

  signupButton.addEventListener("click", event => {
    event.preventDefault()
    event.stopPropagation()

    window.api.goToSignup()
  })
}

const apiURL = "http://localhost:42069/api/login"

const getJWTToken = async (email: string, password: string) => {
  try {
    const response = await fetch(apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "email": email, "password": password })
    })

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error(error)
  }
}

initLoginRenderer()