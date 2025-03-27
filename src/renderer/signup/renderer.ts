const initSignupRenderer = () => {
  window.addEventListener("DOMContentLoaded", () => {
    signupFormValidation();
    goToLogin()
  })
}

const signupFormValidation = () => {
  const signupForm = document.getElementById("signup-form") as HTMLFormElement

  signupForm.addEventListener("submit", event => {
    if (!signupForm.checkValidity()) {
      event.preventDefault()
      event.stopPropagation()
    }

    signupForm.classList.add("was-validated")
  })
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