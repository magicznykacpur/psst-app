const initLoginRenderer = () => {
  window.addEventListener("DOMContentLoaded", () => {
    loginFormValidation();
    signupButtonHandler()
  })
}

const loginFormValidation = () => {
  const loginForm = document.getElementById("login-form") as HTMLFormElement

  loginForm.addEventListener("submit", event => {
    if (!loginForm.checkValidity()) {
      event.preventDefault()
      event.stopPropagation()
    }

    loginForm.classList.add("was-validated")
  })
}

const signupButtonHandler = () => {
  const signupButton = document.getElementById("signup-button") as HTMLButtonElement

  signupButton.addEventListener("click", event => {
    event.preventDefault()
    event.stopPropagation()

    window.api.goToSignup()
  })
}

initLoginRenderer()