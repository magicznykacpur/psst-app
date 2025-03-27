import { ElectronAPI } from '@electron-toolkit/preload'

type Api = {
  goToSignup: () => void,
  goToLogin: () => void,
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
