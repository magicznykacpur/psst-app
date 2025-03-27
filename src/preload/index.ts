import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge } from 'electron'
import { ipcRenderer } from 'electron/renderer'

type Api = {
  goToSignup: () => void,
  goToLogin: () => void,
}

const api: Api = {
  goToSignup: () => ipcRenderer.send("go-to-signup"),
  goToLogin: () => ipcRenderer.send("go-to-login"),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
