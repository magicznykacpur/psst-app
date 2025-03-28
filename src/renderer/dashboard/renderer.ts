import { Toast } from "bootstrap";

const initDashboardRenderer = () => {
  window.addEventListener("DOMContentLoaded", async () => {
    await getUser();
  })
}

type User = { id: string, createdAt: string, updatedAt: string, username: string, email: string } | null
let user: User = null

const getUser = async () => {
  try {
    const response = await fetch(`${window.api_url}/users/me`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${window.user_token}`
        }
      })

    const body = await response.json()
    
    user = {
      id: body.id,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
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

const setUserLoaderHidden = () => {
  const userLoader = document.getElementById("user-loader")
  if (userLoader) {
    userLoader.classList.add("visually-hidden")
  }
}

const setUsername = () => {
  const userName = document.getElementById("user-name")
  if (userName && user?.username) {
    userName.innerText = user?.username
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