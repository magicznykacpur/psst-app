import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge } from "electron";
import { ipcRenderer } from "electron/renderer";
import { Api } from "./types";

const api: Api = {
  getUserToken: () => ipcRenderer.invoke("get-user-token"),
  goToSignup: () => ipcRenderer.send("go-to-signup"),
  goToLogin: () => ipcRenderer.send("go-to-login"),
  goToDashboard: (token: string) => ipcRenderer.send("go-to-dashboard", token),
  saveUserToken: (token: string) => ipcRenderer.send("save-user-token", token),
  signOutUser: () => ipcRenderer.send("sign-out-user"),
  request: (path: string, options: RequestInit) =>
    ipcRenderer.invoke("request", path, options),
  requestWithBody: (path: string, options: RequestInit) =>
    ipcRenderer.invoke("request-with-body", path, options),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("api_url", process.env["API_URL"]);
    contextBridge.exposeInMainWorld("user", {
      token: process.env["USER_TOKEN"],
    });
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
  // @ts-ignore (define in dts)
  window.api_url = process.env["API_URL"];
  // @ts-ignore (define in dts)
  window.user = { token: process.env["USER_TOKEN"] };
}
