const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    downloadFile: (url, filename) =>
        ipcRenderer.invoke("download-file", { url, filename }),
});
