import { Toast } from "bootstrap";

const initDashboardRenderer = () => {
  window.addEventListener("DOMContentLoaded", async () => {
    await getUser();
    initHeaderDropdownListener();
    initSignoutUser()
  })
}

type User = { id: string, createdAt: string, updatedAt: string, username: string, email: string } | null
let user: User = null

const getUser = async () => {
  const paramToken = new URLSearchParams(window.location.search).get("user-token")
  const userToken = paramToken === null ? window.user_token : paramToken

  try {
    const response = await fetch(`${window.api_url}/users/me`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      }
    )

    const body = await response.json()

    user = {
      id: body.id,
      createdAt: body.created_at,
      updatedAt: body.updated_at,
      username: body.username,
      email: body.email
    }

    setUserLoaderHidden()
    setUsername()
  } catch (error) {
    console.log(error)
    promptToast("couldn't retrieve user data")
  }
}

const initSignoutUser = () => {
  const signOutButton = document.getElementById("sign-out") as HTMLDivElement

  signOutButton.addEventListener("click", () => {
    window.api.signOutUser()
  })
}

const setUserLoaderHidden = () => {
  const userLoader = document.getElementById("user-loader") as HTMLDivElement
  userLoader.classList.add("visually-hidden")
}

const setUsername = () => {
  const userName = document.getElementById("user-name")
  if (userName && user?.username) {
    userName.innerText = user?.username
  }
}

const initHeaderDropdownListener = () => {
  const headerDropdownButton = document.getElementById("header-dropdown-button") as HTMLButtonElement

  headerDropdownButton.addEventListener("click", () => {
    if (headerDropdownButton.classList.contains("show")) {
      toggleHeaderDropdown("hide")
    } else {
      toggleHeaderDropdown("show")
    }
  })

  const dropdownMenu = document.getElementById("header-dropdown-menu") as HTMLUListElement
  document.addEventListener("click", (event: MouseEvent) => {
    if ((event.target as HTMLElement).contains(dropdownMenu)) {
      toggleHeaderDropdown("hide")
    }
  })
}

const toggleHeaderDropdown = (toggle: "show" | "hide") => {
  const dropdownButton = document.getElementById("header-dropdown-button") as HTMLButtonElement
  const dropdownMenu = document.getElementById("header-dropdown-menu") as HTMLUListElement

  if (toggle === "show") {
    dropdownButton.classList.add("show")
    dropdownMenu.classList.add("show")
  } else {
    dropdownButton.classList.remove("show")
    dropdownMenu.classList.remove("show")
  }
}

const promptToast = (message: string) => {
  const toastBody = document.getElementById("dashboard-toast-body")
  if (toastBody) {
    toastBody.innerText = message
  }

  const toast = document.getElementById("dashboard-toast")
  const toastBootstrap = Toast.getOrCreateInstance(toast)
  toastBootstrap.show()
}

initDashboardRenderer()