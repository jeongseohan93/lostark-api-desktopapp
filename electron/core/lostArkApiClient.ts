import axios from 'axios';
import { LOSTARK_API } from './lostArkEndPoint';

export class LostArkApiClient {
    private apiKey: string;

    constructor(apiKey: string) {
        if (!apiKey) throw new Error('API키가 필요합니다.');
        this.apiKey = apiKey;
    }

    private get headers() {
        return { authorization: `bearer ${this.apiKey}` };
    }

    private async _get<T>(url: string): Promise<T> {
        try {
            const res = await axios.get<T>(url, { headers: this.headers });
            return res.data;
        } catch (error) {
            throw this._parseError(error);
        }
    }

    private async _post<T, B = unknown>(url: string, body: B): Promise<T> {
        try {
            const res = await axios.post<T>(url, body, { headers: this.headers });
            return res.data;
        } catch (error) {
            throw this._parseError(error);
        }
    }

    private _parseError(error: unknown): Error {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status ?? '알 수 없음';
            return new Error(`로스트아크 API 요청 실패: ${status}`);
        }
        if (error instanceof Error) return new Error(`로스트아크 API 요청 실패: ${error.message}`);
        return new Error('로스트아크 API 요청 실패: 알 수 없는 오류');
    }

    // ── 기존 ──────────────────────────────────────────────
    getNotice()   { return this._get(LOSTARK_API.NOTICES); }
    getEvents()   { return this._get(LOSTARK_API.EVENTS); }
    getCalendar() { return this._get(LOSTARK_API.CALENDAR); }

    // ── 캐릭터 ────────────────────────────────────────────
    getCharacterSiblings(name: string)  { return this._get(LOSTARK_API.CHARACTER_SIBLINGS(name)); }
    getArmoryProfiles(name: string)     { return this._get(LOSTARK_API.ARMORY_PROFILES(name)); }
    getArmoryEquipment(name: string)    { return this._get(LOSTARK_API.ARMORY_EQUIPMENT(name)); }
    getArmoryEngravings(name: string)   { return this._get(LOSTARK_API.ARMORY_ENGRAVINGS(name)); }
    getArmoryGems(name: string)         { return this._get(LOSTARK_API.ARMORY_GEMS(name)); }

    // ── 거래소 ────────────────────────────────────────────
    getMarketsOptions()               { return this._get(LOSTARK_API.MARKETS_OPTIONS); }
    searchMarketItems<B>(body: B)     { return this._post(LOSTARK_API.MARKETS_ITEMS, body); }

    // ── 경매장 ────────────────────────────────────────────
    getAuctionsOptions()              { return this._get(LOSTARK_API.AUCTIONS_OPTIONS); }
    searchAuctionItems<B>(body: B)    { return this._post(LOSTARK_API.AUCTIONS_ITEMS, body); }
}
