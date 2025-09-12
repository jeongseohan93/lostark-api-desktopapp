"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  invoke: (channel, ...args) => electron.ipcRenderer.invoke(channel, ...args),
  send: (channel, ...args) => electron.ipcRenderer.send(channel, ...args),
  on: (channel, listener) => {
    const subscription = (event, ...args) => listener(...args);
    electron.ipcRenderer.on(channel, subscription);
  },
  removeAllListeners: (channel) => electron.ipcRenderer.removeAllListeners(channel)
});
