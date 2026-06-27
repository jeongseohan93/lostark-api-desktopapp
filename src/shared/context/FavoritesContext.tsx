import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import type { MarketItem } from '../types/lostark.types';
import { searchMarketItems } from '../api/IpcMarket';

export interface FavoriteItem {
    id: number;
    name: string;
    grade: string;
    icon: string;
    bundleCount: number;
    addedAt: string;
}

export interface PriceSnapshot {
    ts: number;
    minPrice: number;
    avgPrice: number;
}

type PriceHistory = Record<string, PriceSnapshot[]>;
type PriceAlerts = Record<string, number>;

const FAV_KEY = 'loa_favorites_v2';
const HIST_KEY = 'loa_price_history_v2';
const ALERT_KEY = 'loa_price_alerts_v2';
const POLL_INTERVAL_MS = 30 * 60 * 1000; // 30분
const MAX_HISTORY_DAYS = 30;

function loadJSON<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
}

function pruneHistory(history: PriceSnapshot[]): PriceSnapshot[] {
    const cutoff = Date.now() - MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000;
    return history.filter(p => p.ts >= cutoff);
}

interface FavoritesCtx {
    favorites: FavoriteItem[];
    priceHistory: PriceHistory;
    priceAlerts: PriceAlerts;
    addFavorite: (item: MarketItem) => void;
    removeFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
    setPriceAlert: (id: number, price: number | null) => void;
    lastPolled: Date | null;
}

const Ctx = createContext<FavoritesCtx | null>(null);

export const useFavorites = () => {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
    return ctx;
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>(() => loadJSON(FAV_KEY, []));
    const [priceHistory, setPriceHistory] = useState<PriceHistory>(() => loadJSON(HIST_KEY, {}));
    const [priceAlerts, setPriceAlertsState] = useState<PriceAlerts>(() => loadJSON(ALERT_KEY, {}));
    const [lastPolled, setLastPolled] = useState<Date | null>(null);
    const favRef = useRef(favorites);
    const alertRef = useRef(priceAlerts);
    favRef.current = favorites;
    alertRef.current = priceAlerts;

    const addFavorite = useCallback((item: MarketItem) => {
        setFavorites(prev => {
            if (prev.some(f => f.id === item.Id)) return prev;
            const next = [...prev, {
                id: item.Id, name: item.Name, grade: item.Grade,
                icon: item.Icon, bundleCount: item.BundleCount,
                addedAt: new Date().toISOString(),
            }];
            localStorage.setItem(FAV_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const removeFavorite = useCallback((id: number) => {
        setFavorites(prev => {
            const next = prev.filter(f => f.id !== id);
            localStorage.setItem(FAV_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isFavorite = useCallback((id: number) => favorites.some(f => f.id === id), [favorites]);

    const setPriceAlert = useCallback((id: number, price: number | null) => {
        setPriceAlertsState(prev => {
            const next = { ...prev };
            if (price === null) delete next[String(id)];
            else next[String(id)] = price;
            localStorage.setItem(ALERT_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const pollPrices = useCallback(async () => {
        const favs = favRef.current;
        const alerts = alertRef.current;
        if (!favs.length) return;

        const newSnaps: Record<string, PriceSnapshot> = {};
        for (const fav of favs) {
            try {
                const res = await searchMarketItems({ ItemName: fav.name, PageNo: 1 });
                const found = res.Items?.find((it: MarketItem) => it.Id === fav.id)
                    ?? res.Items?.[0];
                if (!found) continue;
                const snap: PriceSnapshot = {
                    ts: Date.now(),
                    minPrice: found.CurrentMinPrice,
                    avgPrice: found.YDayAvgPrice,
                };
                newSnaps[String(fav.id)] = snap;

                // 가격 알림 체크
                const target = alerts[String(fav.id)];
                if (target !== undefined && found.CurrentMinPrice <= target) {
                    if (Notification.permission === 'granted') {
                        new Notification(`[가격 알림] ${fav.name}`, {
                            body: `현재 최저가 ${found.CurrentMinPrice.toLocaleString()}G ≤ 목표가 ${target.toLocaleString()}G`,
                        });
                    }
                }
            } catch { /* 개별 실패 무시 */ }
        }

        setPriceHistory(prev => {
            const next = { ...prev };
            for (const [id, snap] of Object.entries(newSnaps)) {
                next[id] = pruneHistory([...(next[id] ?? []), snap]);
            }
            localStorage.setItem(HIST_KEY, JSON.stringify(next));
            return next;
        });
        setLastPolled(new Date());
    }, []);

    // 앱 시작 시 1회 즉시 수집, 이후 30분마다 반복
    useEffect(() => {
        if (!favorites.length) return;
        pollPrices();
        const id = setInterval(pollPrices, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 마운트 시 1회만 시작

    return (
        <Ctx.Provider value={{ favorites, priceHistory, priceAlerts, addFavorite, removeFavorite, isFavorite, setPriceAlert, lastPolled }}>
            {children}
        </Ctx.Provider>
    );
};
