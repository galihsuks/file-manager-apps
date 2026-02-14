const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { initDB } = require("../backend/src/database/db");

// start backend
require("../backend/server");

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

    win.loadURL("http://localhost:3001");
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
    await initDB();
    createWindow();
});
