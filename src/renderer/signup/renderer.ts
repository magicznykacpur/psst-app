import { Toast } from "bootstrap"

const initSignupRenderer = () => {
  window.addEventListener("DOMContentLoaded", () => {
    createAccountFormHandler();
    goToLogin()
  })
}

const createAccountFormHandler = () => {
  const signupForm = document.getElementById("signup-form") as HTMLFormElement

  signupForm.addEventListener("submit", async event => {
    event.preventDefault()
    event.stopPropagation()

    if (signupForm.checkValidity()) {
      const email = (document.getElementById("email") as HTMLInputElement).value
      const username = (document.getElementById("username") as HTMLInputElement).value
      const password = (document.getElementById("password") as HTMLInputElement).value

      const status = await createUser(email, username, password)

      if (status === 201) {
        accountCreatedToast()
      } else {
        accountCreationErrorToast()
      }
    }

    signupForm.classList.add("was-validated")
  })
}


const accountCreatedToast = () => {
  const toast = document.getElementById('signup-successful')
  const toastBootstrap = Toast.getOrCreateInstance(toast)
  toastBootstrap.show()
}

const accountCreationErrorToast = () => {
  const toast = document.getElementById('signup-error')
  const toastBootstrap = Toast.getOrCreateInstance(toast)
  toastBootstrap.show()
}

const apiURL = "http://localhost:42069/api/users"

const createUser = async (email: string, username: string, password: string): Promise<number | void> => {
  try {
    const response = await fetch(apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "email": email, "user_name": username, "password": password })
    })

    return response.status
  } catch (error) {
    console.error(error)
  }
}

const goToLogin = () => {
  const goToLoginButton = document.getElementById("go-to-login-button") as HTMLButtonElement

  goToLoginButton.addEventListener("click", event => {
    event.preventDefault()
    event.stopPropagation()

    window.api.goToLogin()
  })
}

initSignupRenderer()