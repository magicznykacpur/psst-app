const init = () => {
  window.addEventListener("DOMContentLoaded", () => {
    loginFormValidation();
    signupButtonHandler();
  });
}

const signupButtonHandler = () => {
  const signupButton = document.getElementById("signup-button") as HTMLButtonElement

  signupButton.addEventListener("click", () => {
    window.api.goToSubmit()
  })
}

const loginFormValidation = () => {
  const form = document.getElementById("login-form") as HTMLFormElement;

  form?.addEventListener("submit", event => {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }

    form.classList.add('was-validated')

    const email: string | null = (document.getElementById("email") as HTMLInputElement)?.value;
    const password: string | null = (document.getElementById("password") as HTMLInputElement)?.value;

    console.log(`emai: ${email}, password ${password}`);
  })
}

init();
