import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      goToSignup: () => void,
      goToLogin: () => void,
      goToDashboard: () => void,
    }
  }
}
