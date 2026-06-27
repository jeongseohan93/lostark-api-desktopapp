import { ipcMain } from 'electron';
import { requireClient } from './apiRequestMainPage';

export const registerCharacterHandlers = () => {
    ipcMain.handle('get:character-siblings',  (_, name: string) => requireClient().getCharacterSiblings(name));
    ipcMain.handle('get:armory-profiles',     (_, name: string) => requireClient().getArmoryProfiles(name));
    ipcMain.handle('get:armory-equipment',    (_, name: string) => requireClient().getArmoryEquipment(name));
    ipcMain.handle('get:armory-engravings',   (_, name: string) => requireClient().getArmoryEngravings(name));
    ipcMain.handle('get:armory-gems',         (_, name: string) => requireClient().getArmoryGems(name));
};
