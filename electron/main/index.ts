import {
    app,
    BrowserWindow,
    CPUUsage,
    Menu,
    nativeImage,
    Notification,
    shell,
    Tray,
    ipcMain,
    ipcRenderer,
} from "electron";
import { release } from "node:os";
import { join } from "node:path";

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "..");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
    ? join(process.env.DIST_ELECTRON, "../public")
    : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

let cpuTray: Tray;
let ramTray: Tray;
let networkTray: Tray;

async function createWindow() {
    win = new BrowserWindow({
        title: "Main window",
        icon: join(process.env.PUBLIC, "favicon.ico"),
        width: 500,
        height: 200,
        resizable: false,
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        // electron-vite-vue#298
        win.loadURL(url);
        // Open devTool if the app is not packaged
        // win.webContents.openDevTools();
    } else {
        win.loadFile(indexHtml);
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on("did-finish-load", () => {
        win?.webContents.send(
            "main-process-message",
            new Date().toLocaleString()
        );
    });

    // Make all links open with the browser, not with the application
    win.webContents.on("will-navigate", (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    win = null;
    if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on("activate", () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${url}#${arg}`);
    } else {
        childWindow.loadFile(indexHtml, { hash: arg });
    }
});

ipcMain.handle("cpu", (_, visible: boolean, dataURL: string) => {
    const icon = nativeImage.createFromDataURL(dataURL);
    if (cpuTray) {
        cpuTray.setImage(icon);
    } else {
        cpuTray = new Tray(icon);
        const contextMenu = Menu.buildFromTemplate([
            { label: "隐藏", type: "normal" },
        ]);
        cpuTray.setContextMenu(contextMenu);
        cpuTray.setToolTip("CPU");
        cpuTray.addListener("click", () => {
            win.show();
        });
    }
});

ipcMain.handle("ram", (_, visible: boolean, dataURL: string) => {
    const icon = nativeImage.createFromDataURL(dataURL);
    if (ramTray) {
        ramTray.setImage(icon);
    } else {
        ramTray = new Tray(icon);
        const contextMenu = Menu.buildFromTemplate([
            { label: "隐藏", type: "normal" },
        ]);
        ramTray.setContextMenu(contextMenu);
        ramTray.setToolTip("内存");
        ramTray.addListener("click", () => {
            win.show();
        });
    }
});

ipcMain.handle("network", (_, visible: boolean, dataURL: string) => {
    const icon = nativeImage.createFromDataURL(dataURL);
    if (networkTray) {
        networkTray.setImage(icon);
    } else {
        networkTray = new Tray(icon);
        const contextMenu = Menu.buildFromTemplate([
            { label: "隐藏", type: "normal" },
        ]);
        networkTray.setContextMenu(contextMenu);
        networkTray.setToolTip("网络");
        networkTray.addListener("click", () => {
            win.show();
        });
    }
});
