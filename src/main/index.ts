import { electronApp, optimizer } from "@electron-toolkit/utils"
import { config } from "dotenv"
import { app, BrowserWindow, ipcMain, shell } from "electron"
import { promises } from "fs"
import { homedir } from "os"
import { join } from "path"

config()

const loadUserToken = async (): Promise<string> => {
  const configPath = `${homedir()}/.psst.config.json`

  const file = await promises.readFile(configPath, "utf-8")

  return file.split(":")[1].replaceAll("}", "").replaceAll("\"", "")
}

const checkTokenValidity = async (tokenString): Promise<boolean> => {
  const response = await fetch(`${process.env.API_URL}/validity`, {
    method: "POST",
    body: JSON.stringify({ "token": tokenString })
  })

  return response.status === 200
}

const saveUserToken = async (token: string): Promise<void> => {
  const configPath = `${homedir()}/.psst.config.json`
  const stringifiedConfig = JSON.stringify({ "token": token })

  try {
    await promises.writeFile(configPath, stringifiedConfig)
  } catch (err) {
    console.error(err)
  }
}

const createWindow = (tokenValid: boolean) => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  const outPath = "../../out/renderer"
  const signupPath = `${outPath}/signup/index.html`
  const loginPath = `${outPath}/login/index.html`
  const dashboardPath = `${outPath}/dashboard/index.html`

  ipcMain.on("go-to-signup", () => {
    mainWindow.loadFile(join(__dirname, signupPath))
  })

  ipcMain.on("go-to-login", () => {
    mainWindow.loadFile(join(__dirname, loginPath))
  })

  ipcMain.on("go-to-dashboard", () => {
    mainWindow.loadFile(join(__dirname, dashboardPath))
  })

  ipcMain.on("save-user-token", async (_, token) => {
    await saveUserToken(token)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const mainWindowScreen = tokenValid ? dashboardPath : loginPath
  mainWindow.loadFile(join(__dirname, mainWindowScreen))
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const tokenString = await loadUserToken()
  const tokenValidity = await checkTokenValidity(tokenString)

  createWindow(tokenValidity)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(tokenValidity)
  }

  )
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
