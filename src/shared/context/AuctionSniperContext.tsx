import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { searchAuctionItems, getAuctionsOptions } from '../api/IpcAuction';
import type { AuctionOptions, AuctionItem } from '../types/lostark.types';

export interface SniperCondition {
    id: string;
    label: string;           // 사용자 지정 이름
    categoryCode?: number;
    grade?: string;
    tier?: number;
    maxBuyPrice?: number;    // 즉구가 상한
    minQuality?: number;     // 최소 품질
    engravings: { name: string; minLevel: number }[]; // 각인 조건
    enabled: boolean;
}

export interface SnipeHit {
    conditionId: string;
    conditionLabel: string;
    item: AuctionItem;
    foundAt: string; // ISO
}

const KEY = 'loa_sniper_v1';
const POLL_MS = 30 * 60 * 1000;

function load<T>(key: string, fb: T): T {
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fb; } catch { return fb; }
}

interface SniperCtx {
    conditions: SniperCondition[];
    hits: SnipeHit[];
    auctionOptions: AuctionOptions | null;
    lastPolled: Date | null;
    polling: boolean;
    addCondition: (c: Omit<SniperCondition, 'id'>) => void;
    removeCondition: (id: string) => void;
    updateCondition: (id: string, patch: Partial<SniperCondition>) => void;
    clearHits: () => void;
    pollNow: () => void;
}

const Ctx = createContext<SniperCtx | null>(null);
export const useAuctionSniper = () => {
    const c = useContext(Ctx);
    if (!c) throw new Error('useAuctionSniper must be used within AuctionSniperProvider');
    return c;
};

export const AuctionSniperProvider = ({ children }: { children: ReactNode }) => {
    const [conditions, setConditions] = useState<SniperCondition[]>(() => load(KEY, []));
    const [hits, setHits] = useState<SnipeHit[]>([]);
    const [auctionOptions, setAuctionOptions] = useState<AuctionOptions | null>(null);
    const [lastPolled, setLastPolled] = useState<Date | null>(null);
    const [polling, setPolling] = useState(false);
    const condRef = useRef(conditions);
    condRef.current = conditions;

    useEffect(() => {
        getAuctionsOptions().then(setAuctionOptions).catch(() => {});
    }, []);

    const persist = (c: SniperCondition[]) => localStorage.setItem(KEY, JSON.stringify(c));

    const addCondition = useCallback((c: Omit<SniperCondition, 'id'>) => {
        setConditions(prev => {
            const next = [...prev, { ...c, id: crypto.randomUUID() }];
            persist(next);
            return next;
        });
    }, []);

    const removeCondition = useCallback((id: string) => {
        setConditions(prev => { const n = prev.filter(c => c.id !== id); persist(n); return n; });
    }, []);

    const updateCondition = useCallback((id: string, patch: Partial<SniperCondition>) => {
        setConditions(prev => { const n = prev.map(c => c.id === id ? { ...c, ...patch } : c); persist(n); return n; });
    }, []);

    const clearHits = useCallback(() => setHits([]), []);

    const pollNow = useCallback(async () => {
        const conds = condRef.current.filter(c => c.enabled);
        if (!conds.length) return;
        setPolling(true);

        const newHits: SnipeHit[] = [];
        for (const cond of conds) {
            try {
                const body: Record<string, unknown> = { PageNo: 1, Sort: 'BUY_PRICE', SortCondition: 'ASC' };
                if (cond.categoryCode) body.CategoryCode = cond.categoryCode;
                if (cond.grade) body.ItemGrade = cond.grade;
                if (cond.tier) body.ItemTier = cond.tier;
                if (cond.maxBuyPrice) body.BuyPrice = cond.maxBuyPrice;

                if (cond.engravings.length > 0) {
                    body.EtcOptions = cond.engravings.map(e => ({
                        FirstOption: 3,    // ABILITY_ENGRAVE type
                        SecondOption: e.name,
                        MinValue: e.minLevel,
                    }));
                }

                const res = await searchAuctionItems(body);
                const items: AuctionItem[] = res.Items ?? [];

                for (const item of items) {
                    if (cond.maxBuyPrice && item.AuctionInfo.BuyPrice && item.AuctionInfo.BuyPrice > cond.maxBuyPrice) continue;
                    if (cond.minQuality && (item.AuctionInfo as { Quality?: number }).Quality !== undefined) {
                        if (((item.AuctionInfo as { Quality?: number }).Quality ?? 0) < cond.minQuality) continue;
                    }

                    newHits.push({
                        conditionId: cond.id,
                        conditionLabel: cond.label,
                        item,
                        foundAt: new Date().toISOString(),
                    });

                    if (Notification.permission === 'granted') {
                        new Notification(`[경매장 스나이핑] ${cond.label}`, {
                            body: `${item.Name} — 즉구가 ${item.AuctionInfo.BuyPrice?.toLocaleString() ?? '?'} G`,
                        });
                    }
                    break; // 조건당 첫 발견 아이템만
                }
            } catch { /* 개별 실패 무시 */ }
        }

        if (newHits.length > 0) {
            setHits(prev => [...newHits, ...prev].slice(0, 100));
        }
        setLastPolled(new Date());
        setPolling(false);
    }, []);

    useEffect(() => {
        if (!conditions.length) return;
        pollNow();
        const id = setInterval(pollNow, POLL_MS);
        return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Ctx.Provider value={{ conditions, hits, auctionOptions, lastPolled, polling, addCondition, removeCondition, updateCondition, clearHits, pollNow }}>
            {children}
        </Ctx.Provider>
    );
};
