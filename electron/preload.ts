import { MainProcessMessage } from '../src/types/electron';
import { contextBridge, ipcRenderer } from 'electron';

export const lostarkAPI = {
    // ── 창 제어 ───────────────────────────────────────────
    minimizeWindow:  () => ipcRenderer.send('minimize:window'),
    maximizeWindow:  () => ipcRenderer.send('maximize:window'),
    closeWindow:     () => ipcRenderer.send('close:window'),
    resizeWindow:    (width: number, height: number) => ipcRenderer.send('resize:window', { width, height }),

    // ── 설정 창 ───────────────────────────────────────────
    openSettingWindow:  () => ipcRenderer.invoke('open:setting-window'),
    closeSettingWindow: () => ipcRenderer.send('close:settings-window'),
    openExternalLink:   (url: string) => ipcRenderer.invoke('shell:open-external', url),

    // ── API 키 관리 ───────────────────────────────────────
    saveApiKey:   (apiKey: string) => ipcRenderer.invoke('save:api-key', apiKey),
    checkApiKey:  () => ipcRenderer.invoke('check:api-key'),
    deleteApiKey: () => ipcRenderer.invoke('delete:api-key'),
    notifyApiKeyUpdated: () => ipcRenderer.send('api-key-updated'),
    onApiKeyDeleted: (callback: () => void) => {
        ipcRenderer.removeAllListeners('event:api-key-deleted');
        ipcRenderer.on('event:api-key-deleted', callback);
    },
    removeApiKeyDeletedListener: () => ipcRenderer.removeAllListeners('event:api-key-deleted'),

    // ── 대시보드 메인 ─────────────────────────────────────
    getContentInfo: () => ipcRenderer.invoke('get:lostark-api-calendar'),
    getNoticeInfo:  () => ipcRenderer.invoke('get:lostark-api-notices'),
    getEventInfo:   () => ipcRenderer.invoke('get:lostark-api-events'),

    // ── 캐릭터 검색 ───────────────────────────────────────
    getCharacterSiblings: (name: string) => ipcRenderer.invoke('get:character-siblings', name),
    getArmoryProfiles:    (name: string) => ipcRenderer.invoke('get:armory-profiles', name),
    getArmoryEquipment:   (name: string) => ipcRenderer.invoke('get:armory-equipment', name),
    getArmoryEngravings:  (name: string) => ipcRenderer.invoke('get:armory-engravings', name),
    getArmoryGems:        (name: string) => ipcRenderer.invoke('get:armory-gems', name),

    // ── 거래소 ────────────────────────────────────────────
    getMarketsOptions:  () => ipcRenderer.invoke('get:markets-options'),
    searchMarketItems:  (body: unknown) => ipcRenderer.invoke('search:market-items', body),

    // ── 경매장 ────────────────────────────────────────────
    getAuctionsOptions: () => ipcRenderer.invoke('get:auctions-options'),
    searchAuctionItems: (body: unknown) => ipcRenderer.invoke('search:auction-items', body),

    // ── 시스템 메시지 ─────────────────────────────────────
    onMainProcessMessage: (callback: (message: MainProcessMessage) => void) => {
        ipcRenderer.on('main-process-message', (_event, message: MainProcessMessage) => callback(message));
    },
};

contextBridge.exposeInMainWorld('lostarkAPI', lostarkAPI);
