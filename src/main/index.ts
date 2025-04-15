import { electronApp, optimizer } from "@electron-toolkit/utils";
import { config } from "dotenv";
import { app, BrowserWindow, ipcMain, LoadURLOptions, shell } from "electron";
import { join } from "path";
import {
  checkTokenValidity,
  clearUserToken,
  loadUserToken,
  saveUserToken,
  userToken,
} from "./token";

config();

const loadBasedOnEnv = (
  mainWindow: BrowserWindow,
  path: string,
  options?: LoadURLOptions
) => {
  if (!process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadFile(join(__dirname, path));
  } else {
    mainWindow.loadURL(
      `${process.env["ELECTRON_RENDERER_URL"]}/${path}`,
      options
    );
  }
};

const createWindow = (tokenValid: boolean) => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  const signupPath = "signup/index.html";
  const loginPath = "login/index.html";
  const dashboardPath = "dashboard/index.html";

  ipcMain.handle("get-token", () => {
    return userToken;
  });

  ipcMain.on("go-to-signup", () => {
    loadBasedOnEnv(mainWindow, signupPath);
  });

  ipcMain.on("go-to-login", () => {
    loadBasedOnEnv(mainWindow, loginPath);
  });

  ipcMain.on("go-to-dashboard", () => {
    loadBasedOnEnv(mainWindow, dashboardPath);
  });

  ipcMain.on("save-user-token", async (_, token) => {
    await saveUserToken(token);
  });

  ipcMain.on("sign-out-user", async () => {
    await clearUserToken();
    loadBasedOnEnv(mainWindow, loginPath);
  });

  ipcMain.handle(
    "request-with-body",
    async (_, url: string, options: RequestInit): Promise<any | void> => {
      try {
        const response = await fetch(url, options);
        const body = await response.json();
        return body;
      } catch (e) {
        console.error((e as Error).message);
      }
    }
  );

  ipcMain.handle(
    "request",
    async (_, url: string, options: RequestInit): Promise<number | void> => {
      try {
        const response = await fetch(url, options);

        return response.status;
      } catch (e) {
        console.error((e as Error).message);
      }
    }
  );

  mainWindow.on("ready-to-show", () => {
    mainWindow.showInactive();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  const homePath = tokenValid ? dashboardPath : loginPath;
  loadBasedOnEnv(mainWindow, homePath);
};

app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const tokenString = await loadUserToken();
  const tokenValidity = await checkTokenValidity(tokenString);
  process.env.USER_TOKEN = tokenString;

  createWindow(tokenValidity);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(tokenValidity);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
