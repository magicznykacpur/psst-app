import { app, BrowserWindow } from "electron"
import * as path from "path"

const createWindow = () => {
    const win: BrowserWindow = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, './src/preload.ts')
        }
    })

    win.loadFile('../index.html')
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})