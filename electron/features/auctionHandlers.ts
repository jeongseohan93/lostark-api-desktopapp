import { ipcMain } from 'electron';
import { requireClient } from './apiRequestMainPage';

export const registerAuctionHandlers = () => {
    ipcMain.handle('get:auctions-options', () => requireClient().getAuctionsOptions());
    ipcMain.handle('search:auction-items', (_, body) => requireClient().searchAuctionItems(body));
};
