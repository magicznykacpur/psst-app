import * as fs from "fs"
import * as os from "os"
import { electronApp, optimizer } from "@electron-toolkit/utils"
import { app, BrowserWindow, ipcMain, shell } from "electron"
import { join } from "path"
import { config } from "dotenv"

config()

const loadUserConfig = async (): Promise<string | void> => {
  const home = os.homedir()
  const path = `${home}/.psst.config.json`

  await fs.readFile(path, "utf-8", (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    return data.split("\n")[1].trim().split(" ")[1].replaceAll("\"", "")
  })
}

const checkTokenValidity = async (tokenString): Promise<boolean> => {
  const response = await fetch(`${process.env.API_URL}/validity`, {
    method: "POST",
    body: JSON.stringify({ "token": tokenString })
  })

  return response.status === 200
}

const createWindow = async () => {
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

  ipcMain.on("go-to-signup", () => {
    mainWindow.loadFile(join(__dirname, "../../out/renderer/signup/index.html"))
  })

  ipcMain.on("go-to-login", () => {
    mainWindow.loadFile(join(__dirname, "../../out/renderer/login/index.html"))
  })

  ipcMain.on("go-to-dashboard", () => {
    mainWindow.loadFile(join(__dirname, "../../out/renderer/dashboard/index.html"))
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.loadFile(join(__dirname, "../../out/renderer/login/index.html"))
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow().then(() => {
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
