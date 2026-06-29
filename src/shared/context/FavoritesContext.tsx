/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import type { AuctionItem, AuctionSearchBody, MarketItem } from '../types/lostark.types';
import { searchAuctionItems } from '../api/IpcAuction';
import { searchMarketItems } from '../api/IpcMarket';
import { getLocalData, setLocalData } from '../api/IpcLocalStore';

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

export interface AuctionFavorite {
  id: string;
  label: string;
  body: AuctionSearchBody;
  addedAt: string;
  latestItem?: AuctionFavoriteSnapshot;
}

export interface AuctionFavoriteSnapshot {
  ts: number;
  itemName: string;
  grade: string;
  icon: string;
  buyPrice: number;
  bidPrice: number;
  endDate: string;
}

type PriceHistory = Record<string, PriceSnapshot[]>;
type AuctionPriceHistory = Record<string, AuctionFavoriteSnapshot[]>;
type PriceAlerts = Record<string, number>;

const FAV_KEY = 'loa_favorites_v2';
const HIST_KEY = 'loa_price_history_v2';
const ALERT_KEY = 'loa_price_alerts_v2';
const AUCTION_FAV_KEY = 'loa_auction_favorites_v1';
const AUCTION_HIST_KEY = 'loa_auction_price_history_v1';
const POLL_INTERVAL_MS = 30 * 60 * 1000;
const MAX_HISTORY_DAYS = 30;

function loadJSON<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function persistJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  void setLocalData(key, value).catch(() => undefined);
}

function pruneHistory<T extends { ts: number }>(history: T[]): T[] {
  const cutoff = Date.now() - MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000;
  return history.filter(point => point.ts >= cutoff);
}

function getLowestAuctionItem(items: AuctionItem[]): AuctionItem | null {
  return items
    .filter(item => item.AuctionInfo.BuyPrice !== null)
    .sort((a, b) => (a.AuctionInfo.BuyPrice ?? Number.MAX_SAFE_INTEGER) - (b.AuctionInfo.BuyPrice ?? Number.MAX_SAFE_INTEGER))[0] ?? null;
}

function toAuctionSnapshot(item: AuctionItem): AuctionFavoriteSnapshot {
  return {
    ts: Date.now(),
    itemName: item.Name,
    grade: item.Grade,
    icon: item.Icon,
    buyPrice: item.AuctionInfo.BuyPrice ?? 0,
    bidPrice: item.AuctionInfo.BidPrice,
    endDate: item.AuctionInfo.EndDate,
  };
}

interface FavoritesCtx {
  favorites: FavoriteItem[];
  auctionFavorites: AuctionFavorite[];
  priceHistory: PriceHistory;
  auctionPriceHistory: AuctionPriceHistory;
  priceAlerts: PriceAlerts;
  addFavorite: (item: MarketItem) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  addAuctionFavorite: (label: string, body: AuctionSearchBody) => void;
  removeAuctionFavorite: (id: string) => void;
  isAuctionFavorite: (body: AuctionSearchBody) => boolean;
  setPriceAlert: (id: number, price: number | null) => void;
  pollPrices: () => Promise<void>;
  lastPolled: Date | null;
  polling: boolean;
}

const Ctx = createContext<FavoritesCtx | null>(null);

export const useFavorites = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => loadJSON(FAV_KEY, []));
  const [auctionFavorites, setAuctionFavorites] = useState<AuctionFavorite[]>(() => loadJSON(AUCTION_FAV_KEY, []));
  const [priceHistory, setPriceHistory] = useState<PriceHistory>(() => loadJSON(HIST_KEY, {}));
  const [auctionPriceHistory, setAuctionPriceHistory] = useState<AuctionPriceHistory>(() => loadJSON(AUCTION_HIST_KEY, {}));
  const [priceAlerts, setPriceAlertsState] = useState<PriceAlerts>(() => loadJSON(ALERT_KEY, {}));
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [polling, setPolling] = useState(false);

  const favRef = useRef(favorites);
  const auctionFavRef = useRef(auctionFavorites);
  const alertRef = useRef(priceAlerts);
  favRef.current = favorites;
  auctionFavRef.current = auctionFavorites;
  alertRef.current = priceAlerts;

  useEffect(() => {
    void Promise.all([
      getLocalData<FavoriteItem[]>(FAV_KEY, favRef.current).then(setFavorites),
      getLocalData<AuctionFavorite[]>(AUCTION_FAV_KEY, auctionFavRef.current).then(setAuctionFavorites),
      getLocalData<PriceHistory>(HIST_KEY, {}).then(setPriceHistory),
      getLocalData<AuctionPriceHistory>(AUCTION_HIST_KEY, {}).then(setAuctionPriceHistory),
      getLocalData<PriceAlerts>(ALERT_KEY, {}).then(setPriceAlertsState),
    ]).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  const addFavorite = useCallback((item: MarketItem) => {
    setFavorites(prev => {
      if (prev.some(fav => fav.id === item.Id)) return prev;
      const next = [...prev, {
        id: item.Id,
        name: item.Name,
        grade: item.Grade,
        icon: item.Icon,
        bundleCount: item.BundleCount,
        addedAt: new Date().toISOString(),
      }];
      persistJSON(FAV_KEY, next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const next = prev.filter(fav => fav.id !== id);
      persistJSON(FAV_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favorites.some(fav => fav.id === id), [favorites]);

  const addAuctionFavorite = useCallback((label: string, body: AuctionSearchBody) => {
    const normalized: AuctionSearchBody = { ...body, PageNo: 1, Sort: 'BUY_PRICE', SortCondition: 'ASC' };
    const key = JSON.stringify(normalized);

    setAuctionFavorites(prev => {
      if (prev.some(fav => JSON.stringify(fav.body) === key)) return prev;
      const next = [...prev, {
        id: crypto.randomUUID(),
        label: label.trim() || '경매장 조건',
        body: normalized,
        addedAt: new Date().toISOString(),
      }];
      persistJSON(AUCTION_FAV_KEY, next);
      return next;
    });
  }, []);

  const removeAuctionFavorite = useCallback((id: string) => {
    setAuctionFavorites(prev => {
      const next = prev.filter(fav => fav.id !== id);
      persistJSON(AUCTION_FAV_KEY, next);
      return next;
    });
  }, []);

  const isAuctionFavorite = useCallback((body: AuctionSearchBody) => {
    const normalized = JSON.stringify({ ...body, PageNo: 1, Sort: 'BUY_PRICE', SortCondition: 'ASC' });
    return auctionFavorites.some(fav => JSON.stringify(fav.body) === normalized);
  }, [auctionFavorites]);

  const setPriceAlert = useCallback((id: number, price: number | null) => {
    setPriceAlertsState(prev => {
      const next = { ...prev };
      if (price === null) delete next[String(id)];
      else next[String(id)] = price;
      persistJSON(ALERT_KEY, next);
      return next;
    });
  }, []);

  const pollPrices = useCallback(async () => {
    const marketFavs = favRef.current;
    const auctionFavs = auctionFavRef.current;
    const alerts = alertRef.current;
    if (!marketFavs.length && !auctionFavs.length) return;

    setPolling(true);
    const marketSnaps: Record<string, PriceSnapshot> = {};
    const auctionSnaps: Record<string, AuctionFavoriteSnapshot> = {};

    for (const fav of marketFavs) {
      try {
        const res = await searchMarketItems({ ItemName: fav.name, PageNo: 1 });
        const found = res.Items?.find(item => item.Id === fav.id) ?? res.Items?.[0];
        if (!found) continue;

        const snap: PriceSnapshot = {
          ts: Date.now(),
          minPrice: found.CurrentMinPrice,
          avgPrice: found.YDayAvgPrice,
        };
        marketSnaps[String(fav.id)] = snap;

        const target = alerts[String(fav.id)];
        if (
          target !== undefined
          && found.CurrentMinPrice <= target
          && typeof Notification !== 'undefined'
          && Notification.permission === 'granted'
        ) {
          new Notification(`[가격 알림] ${fav.name}`, {
            body: `현재 최저가 ${found.CurrentMinPrice.toLocaleString()}G / 목표가 ${target.toLocaleString()}G`,
          });
        }
      } catch {
        // 개별 즐겨찾기 조회 실패는 다음 항목 갱신을 막지 않는다.
      }
    }

    for (const fav of auctionFavs) {
      try {
        const res = await searchAuctionItems({ ...fav.body, PageNo: 1, Sort: 'BUY_PRICE', SortCondition: 'ASC' });
        const lowest = getLowestAuctionItem(res.Items ?? []);
        if (!lowest) continue;
        auctionSnaps[fav.id] = toAuctionSnapshot(lowest);
      } catch {
        // 개별 경매장 조건 조회 실패는 다음 조건 갱신을 막지 않는다.
      }
    }

    if (Object.keys(marketSnaps).length > 0) {
      setPriceHistory(prev => {
        const next = { ...prev };
        for (const [id, snap] of Object.entries(marketSnaps)) {
          next[id] = pruneHistory([...(next[id] ?? []), snap]);
        }
        persistJSON(HIST_KEY, next);
        return next;
      });
    }

    if (Object.keys(auctionSnaps).length > 0) {
      setAuctionPriceHistory(prev => {
        const next = { ...prev };
        for (const [id, snap] of Object.entries(auctionSnaps)) {
          next[id] = pruneHistory([...(next[id] ?? []), snap]);
        }
        persistJSON(AUCTION_HIST_KEY, next);
        return next;
      });

      setAuctionFavorites(prev => {
        const next = prev.map(fav => (auctionSnaps[fav.id] ? { ...fav, latestItem: auctionSnaps[fav.id] } : fav));
        persistJSON(AUCTION_FAV_KEY, next);
        return next;
      });
    }

    setLastPolled(new Date());
    setPolling(false);
  }, []);

  useEffect(() => {
    pollPrices();
    const id = setInterval(pollPrices, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [pollPrices]);

  useEffect(() => {
    if (favorites.length > 0 || auctionFavorites.length > 0) {
      void pollPrices();
    }
  }, [auctionFavorites.length, favorites.length, pollPrices]);

  return (
    <Ctx.Provider
      value={{
        favorites,
        auctionFavorites,
        priceHistory,
        auctionPriceHistory,
        priceAlerts,
        addFavorite,
        removeFavorite,
        isFavorite,
        addAuctionFavorite,
        removeAuctionFavorite,
        isAuctionFavorite,
        setPriceAlert,
        pollPrices,
        lastPolled,
        polling,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};
