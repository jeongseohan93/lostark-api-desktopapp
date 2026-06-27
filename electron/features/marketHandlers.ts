import { ipcMain } from 'electron';
import { requireClient } from './apiRequestMainPage';

export const registerMarketHandlers = () => {
    ipcMain.handle('get:markets-options',  () => requireClient().getMarketsOptions());
    ipcMain.handle('search:market-items',  (_, body) => requireClient().searchMarketItems(body));
};
