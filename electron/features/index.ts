import { BrowserWindow } from 'electron';
import { registerWindowControlsHandlers } from './windowController';
import { registerSettingsHandlers } from './settings';
import { registerLostArkApiHandlers } from './apiRequestMainPage';
import { registerApiManagement } from './apiKeyManagement';
import { registerCharacterHandlers } from './characterHandlers';
import { registerMarketHandlers } from './marketHandlers';
import { registerAuctionHandlers } from './auctionHandlers';
import { registerLocalStoreHandlers } from './localStoreHandlers';

export const registerFeatureHandlers = (win: BrowserWindow): void => {
    registerWindowControlsHandlers(win);
    registerSettingsHandlers(win);
    registerApiManagement();
    registerLostArkApiHandlers();
    registerCharacterHandlers();
    registerMarketHandlers();
    registerAuctionHandlers();
    registerLocalStoreHandlers();
};
