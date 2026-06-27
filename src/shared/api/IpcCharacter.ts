const api = () => {
    if (!window.lostarkAPI) throw new Error('IPC bridge is not available.');
    return window.lostarkAPI;
};

export const getCharacterSiblings = (name: string) => api().getCharacterSiblings(name);
export const getArmoryProfiles    = (name: string) => api().getArmoryProfiles(name);
export const getArmoryEquipment   = (name: string) => api().getArmoryEquipment(name);
export const getArmoryEngravings  = (name: string) => api().getArmoryEngravings(name);
export const getArmoryGems        = (name: string) => api().getArmoryGems(name);
