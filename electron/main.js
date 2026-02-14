const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { initDB } = require("../backend/src/database/db");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    const isDev = !app.isPackaged;
    if (isDev) {
        win.loadURL("http://localhost:3001");
    } else {
        win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
    }
}

ipcMain.handle("download-file", async (event, { url, filename }) => {
    const { filePath } = await dialog.showSaveDialog({
        defaultPath: filename,
    });

    if (!filePath) return;

    const response = await axios.get(url, { responseType: "arraybuffer" });

    fs.writeFileSync(filePath, response.data);
});

app.whenReady().then(async () => {
    global.__USER_DATA_PATH__ = app.getPath("userData");

    await initDB();
    // start backend
    require("../backend/server");
    createWindow();
});
