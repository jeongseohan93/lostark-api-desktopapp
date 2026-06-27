const BASE_URL = 'https://developer-lostark.game.onstove.com';

const enc = (name: string) => encodeURIComponent(name);

export const LOSTARK_API = {
    // 기존
    NOTICES:  `${BASE_URL}/news/notices`,
    EVENTS:   `${BASE_URL}/news/events`,
    CALENDAR: `${BASE_URL}/gamecontents/calendar`,

    // 캐릭터 / 병영
    CHARACTER_SIBLINGS:  (name: string) => `${BASE_URL}/characters/${enc(name)}/siblings`,
    ARMORY_PROFILES:     (name: string) => `${BASE_URL}/armories/characters/${enc(name)}/profiles`,
    ARMORY_EQUIPMENT:    (name: string) => `${BASE_URL}/armories/characters/${enc(name)}/equipment`,
    ARMORY_ENGRAVINGS:   (name: string) => `${BASE_URL}/armories/characters/${enc(name)}/engravings`,
    ARMORY_GEMS:         (name: string) => `${BASE_URL}/armories/characters/${enc(name)}/gems`,
    ARMORY_COMBAT_SKILLS:(name: string) => `${BASE_URL}/armories/characters/${enc(name)}/combat-skills`,

    // 거래소
    MARKETS_OPTIONS: `${BASE_URL}/markets/options`,
    MARKETS_ITEMS:   `${BASE_URL}/markets/items`,

    // 경매장
    AUCTIONS_OPTIONS: `${BASE_URL}/auctions/options`,
    AUCTIONS_ITEMS:   `${BASE_URL}/auctions/items`,
};
