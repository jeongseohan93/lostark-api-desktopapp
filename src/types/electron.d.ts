import { LostArkEvent, LostarkNotice, CalendarResponse } from '../features/dashboard/pages/mainPage/types/Lostark.types';
import {
    CharacterInfo, ArmoryProfile, ArmoryEquipment, ArmoryEngravings, ArmoryGems,
    MarketOptions, MarketSearchBody, MarketSearchResponse,
    AuctionOptions, AuctionSearchBody, AuctionSearchResponse,
} from '../shared/types/lostark.types';

export interface IElectronAPI {
    // 창 제어
    minimizeWindow:  () => void;
    maximizeWindow:  () => void;
    closeWindow:     () => void;
    resizeWindow:    (width: number, height: number) => void;
    openExternalLink:(url: string) => Promise<{ success: boolean }>;

    // 설정 창
    openSettingWindow:  () => Promise<void>;
    closeSettingWindow: () => void;

    // API 키 관리
    saveApiKey:   (apiKey: string) => Promise<{ success: boolean }>;
    checkApiKey:  () => Promise<string | null>;
    deleteApiKey: () => Promise<{ success: boolean; message?: string }>;
    notifyApiKeyUpdated: () => void;
    onApiKeyDeleted: (callback: () => void) => void;
    removeApiKeyDeletedListener: () => void;

    // 대시보드 메인
    getContentInfo: () => Promise<CalendarResponse>;
    getNoticeInfo:  () => Promise<LostarkNotice[]>;
    getEventInfo:   () => Promise<LostArkEvent[]>;

    // 캐릭터 검색
    getCharacterSiblings: (name: string) => Promise<CharacterInfo[]>;
    getArmoryProfiles:    (name: string) => Promise<ArmoryProfile>;
    getArmoryEquipment:   (name: string) => Promise<ArmoryEquipment[]>;
    getArmoryEngravings:  (name: string) => Promise<ArmoryEngravings>;
    getArmoryGems:        (name: string) => Promise<ArmoryGems>;

    // 거래소
    getMarketsOptions: () => Promise<MarketOptions>;
    searchMarketItems: (body: MarketSearchBody) => Promise<MarketSearchResponse>;

    // 경매장
    getAuctionsOptions: () => Promise<AuctionOptions>;
    searchAuctionItems: (body: AuctionSearchBody) => Promise<AuctionSearchResponse>;

    // 로컬 DB 저장소
    getLocalData:    (key: string) => Promise<string | null>;
    setLocalData:    (key: string, value: string) => Promise<{ success: boolean }>;
    deleteLocalData: (key: string) => Promise<{ success: boolean }>;

    // 시스템
    onMainProcessMessage: (callback: (message: MainProcessMessage) => void) => void;
}

export interface MainProcessMessage {
    type: 'info' | 'warning' | 'error';
    content: string;
}

declare global {
    interface Window {
        lostarkAPI: IElectronAPI;
    }
}
