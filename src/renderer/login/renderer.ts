import { Toast } from "bootstrap"
import * as fs from "fs"
import * as os from "os"

const initLoginRenderer = () => {
  window.addEventListener("DOMContentLoaded", async () => {
    await redirectUserIfLoggedIn();
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
        window.api.goToDashboard()
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

const apiURL = "http://localhost:42069/api"

const getJWTToken = async (email: string, password: string) => {
  try {
    const response = await fetch(`${apiURL}/login`, {
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

const redirectUserIfLoggedIn = async () => {
  const tokenString = await loadUserConfig()
  const tokenValid = await checkTokenValidity(tokenString)

  tokenValid && console.log("redirecting to dashboard")
}

const loadUserConfig = async (): Promise<string | void> => {
  const home = os.homedir()
  const path = `${home}/.psst.config.json`

  await fs.readFile(path, "utf-8", (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    return data.split("\n")[1].trim().split(" ")[1].replaceAll("\"", "")
  })
}

const checkTokenValidity = async (tokenString): Promise<boolean> => {
  const response = await fetch(`${apiURL}/validity`, {
    method: "POST",
    body: JSON.stringify({ "token": tokenString })
  })

  return response.status === 200
}

initLoginRenderer()