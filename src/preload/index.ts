import { electronAPI } from "@electron-toolkit/preload"
import { contextBridge } from "electron"
import { ipcRenderer } from "electron/renderer"

type Api = {
  goToSignup: () => void,
  goToLogin: () => void,
  goToDashboard: (token: string) => void,
  saveUserToken: (token: string) => void,
  signOutUser: () => void,
  requestWithBody: (path: string, options: RequestInit) => Promise<any>
}

const api: Api = {
  goToSignup: () => ipcRenderer.send("go-to-signup"),
  goToLogin: () => ipcRenderer.send("go-to-login"),
  goToDashboard: (token: string) => ipcRenderer.send("go-to-dashboard", token),
  saveUserToken: (token: string) => ipcRenderer.send("save-user-token", token),
  signOutUser: () => ipcRenderer.send("sign-out-user"),
  requestWithBody: (path: string, options: RequestInit) => ipcRenderer.invoke("request-with-body", path, options)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI)
    contextBridge.exposeInMainWorld("api", api)
    contextBridge.exposeInMainWorld("api_url", process.env["API_URL"])
    contextBridge.exposeInMainWorld("user_token", process.env["USER_TOKEN"])
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.api_url = process.env["API_URL"]
  // @ts-ignore (define in dts)
  window.user_token = process.env["USER_TOKEN"]
}
