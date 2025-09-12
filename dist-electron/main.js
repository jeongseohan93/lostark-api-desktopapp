import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sqlite3 from "sqlite3";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let settingsWin;
const dbPath = path.join(app.getPath("userData"), "app.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to the database.");
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`);
  }
});
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      sandbox: true,
      contextIsolation: true
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
function createSettingsWindow() {
  settingsWin = new BrowserWindow({
    width: 400,
    height: 500,
    parent: win,
    modal: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  if (VITE_DEV_SERVER_URL) {
    settingsWin.loadURL(`${VITE_DEV_SERVER_URL}/settings.html`);
  } else {
    settingsWin.loadFile(path.join(RENDERER_DIST, "settings.html"));
  }
  settingsWin.once("ready-to-show", () => {
    settingsWin == null ? void 0 : settingsWin.show();
  });
  settingsWin.on("closed", () => {
    settingsWin = null;
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  ipcMain.handle("save-api-key", (_, apiKey) => {
    return new Promise((resolve, reject) => {
      db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, ["api_key", apiKey], (err) => {
        if (err) reject("데이터베이스 저장 실패");
        else resolve("저장 성공");
      });
    });
  });
  ipcMain.handle("check-api-key", () => {
    return new Promise((resolve) => {
      db.get(`SELECT value FROM settings WHERE key = ?`, ["api_key"], (err, row) => {
        if (err) resolve(false);
        else resolve(!!row);
      });
    });
  });
  ipcMain.handle("get-island-info", async () => {
    const apiKey = await new Promise((resolve) => {
      db.get("SELECT value FROM settings WHERE key = ?", ["api_key"], (err, row) => {
        resolve(err || !row ? null : row.value);
      });
    });
    if (!apiKey) throw new Error("API 키가 데이터베이스에 존재하지 않습니다.");
    const response = await fetch("https://developer-lostark.game.onstove.com/gamecontents/calendar", {
      headers: {
        "accept": "application/json",
        "authorization": `bearer ${apiKey}`
      }
    });
    if (!response.ok) throw new Error(`API 서버 오류: ${response.statusText}`);
    return response.json();
  });
  ipcMain.handle("open-settings-window", () => {
    if (!settingsWin) createSettingsWindow();
  });
  ipcMain.handle("close-settings-window", () => {
    settingsWin == null ? void 0 : settingsWin.close();
  });
  ipcMain.handle("delete-api-key", () => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM settings WHERE key = ?`, ["api_key"], function(err) {
        if (err) reject("API 키 삭제 실패");
        else resolve("삭제 성공");
      });
    });
  });
  ipcMain.on("notify-api-key-deleted", () => {
    win == null ? void 0 : win.webContents.send("api-key-deleted-event");
  });
  ipcMain.on("minimize-window", () => {
    win == null ? void 0 : win.minimize();
  });
  ipcMain.on("maximize-window", () => {
    if (win == null ? void 0 : win.isMaximized()) {
      win.unmaximize();
    } else {
      win == null ? void 0 : win.maximize();
    }
  });
  ipcMain.on("close-window", () => {
    win == null ? void 0 : win.close();
  });
});
export {
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
