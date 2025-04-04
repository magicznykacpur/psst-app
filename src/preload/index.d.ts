import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      goToSignup: () => void,
      goToLogin: () => void,
      goToDashboard: (token: string) => void,
      saveUserToken: (token: string) => void,
      signOutUser: () => void,
    },
    api_url: string,
    user_token: string
  }
}
