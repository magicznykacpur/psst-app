"use strict";
const preload = require("@electron-toolkit/preload");
const electron = require("electron");
const renderer = require("electron/renderer");
const api = {
  goToSubmit: () => renderer.ipcRenderer.send("go-to-submit")
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
