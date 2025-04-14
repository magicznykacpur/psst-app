import { electronApp, optimizer } from "@electron-toolkit/utils";
import { config } from "dotenv";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { promises } from "fs";
import { homedir } from "os";
import { join } from "path";

config();

const loadUserToken = async (): Promise<string> => {
  const configPath = `${homedir()}/.psst.config.json`;

  const file = await promises.readFile(configPath, "utf-8");

  return file.split(":")[1].replaceAll("}", "").replaceAll('"', "");
};

const checkTokenValidity = async (tokenString): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.API_URL}/validity`, {
      method: "POST",
      body: JSON.stringify({ token: tokenString }),
    });
    return response.status === 200;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const saveUserToken = async (token: string): Promise<void> => {
  const configPath = `${homedir()}/.psst.config.json`;
  const stringifiedConfig = JSON.stringify({ token: token });

  try {
    await promises.writeFile(configPath, stringifiedConfig);
  } catch (err) {
    console.error(err);
  }
};

const clearUserToken = async (): Promise<void> => {
  const configPath = `${homedir()}/.psst.config.json`;
  const stringifiedConfig = JSON.stringify({ token: "" });

  try {
    await promises.writeFile(configPath, stringifiedConfig);
  } catch (err) {
    console.error(err);
  }
};

const loadBasedOnEnv = (mainWindow: BrowserWindow, path: string) => {
  if (!process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadFile(join(__dirname, path));
  } else {
    mainWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/${path}`);
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

  ipcMain.on("go-to-signup", () => {
    loadBasedOnEnv(mainWindow, signupPath)
  });

  ipcMain.on("go-to-login", () => {
    loadBasedOnEnv(mainWindow, loginPath)
  });

  ipcMain.on("go-to-dashboard", () => {
    loadBasedOnEnv(mainWindow, dashboardPath)
  });

  ipcMain.on("save-user-token", async (_, token) => {
    await saveUserToken(token);
  });

  ipcMain.on("sign-out-user", async () => {
    await clearUserToken();
    loadBasedOnEnv(mainWindow, loginPath)
  });

  ipcMain.handle("request-with-body", async (_, url: string, options: RequestInit) => {
    try {
      const response = await fetch(url, options);
      
      if (!["POST", "PUT", "DELETE"].includes(options.method ?? "") ) {
        const body = await response.json();
        return body
      }
    } catch (e) {
      console.error(e)
    }
  });

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
