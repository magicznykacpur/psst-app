"use strict";
const utils = require("@electron-toolkit/utils");
const electron = require("electron");
const fs = require("fs");
const os = require("os");
const path = require("path");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const os__namespace = /* @__PURE__ */ _interopNamespaceDefault(os);
const loadUserConfig = async () => {
  const home = os__namespace.homedir();
  const path2 = `${home}/.psst.config.json`;
  await fs__namespace.readFile(path2, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    return data.split("\n")[1].trim().split(" ")[1].replaceAll('"', "");
  });
};
const createWindow = (tokenValid) => {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  electron.ipcMain.on("go-to-signup", () => {
    mainWindow.loadFile(path.join(__dirname, "../../out/renderer/signup/index.html"));
  });
  electron.ipcMain.on("go-to-login", () => {
    mainWindow.loadFile(path.join(__dirname, "../../out/renderer/login/index.html"));
  });
  electron.ipcMain.on("go-to-dashboard", () => {
    mainWindow.loadFile(path.join(__dirname, "../../out/renderer/dashboard/index.html"));
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  {
    mainWindow.loadFile(path.join(__dirname, "../../out/renderer/login/index.html"));
  }
};
electron.app.whenReady().then(async () => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  const tokenString = await loadUserConfig();
  console.log(tokenString);
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
