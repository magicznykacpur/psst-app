import { contextBridge } from "electron";

export const electronApi = {
    "versions": {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron
    }
}

process.once("loaded", () => {
    contextBridge.exposeInMainWorld('electronApi', electronApi)
})
