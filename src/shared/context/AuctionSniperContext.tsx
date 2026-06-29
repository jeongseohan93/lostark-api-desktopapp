/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { getAuctionsOptions, searchAuctionItems } from '../api/IpcAuction';
import { getLocalData, setLocalData } from '../api/IpcLocalStore';
import type { AuctionItem, AuctionOptions, AuctionSearchBody } from '../types/lostark.types';

export interface SniperCondition {
  id: string;
  label: string;
  categoryCode?: number;
  grade?: string;
  tier?: number;
  baselinePrice?: number;
  riseAmount?: number;
  risePercent?: number;
  minQuality?: number;
  engravings: { name: string; minLevel: number }[];
  enabled: boolean;
}

export interface SnipeHit {
  conditionId: string;
  conditionLabel: string;
  item: AuctionItem;
  foundAt: string;
  previousPrice?: number;
  currentPrice: number;
  riseAmount: number;
  risePercent: number;
}

type LastPriceMap = Record<string, number>;

const CONDITION_KEY = 'loa_sniper_v2';
const LAST_PRICE_KEY = 'loa_sniper_last_prices_v1';
const HIT_KEY = 'loa_sniper_hits_v1';
const POLL_MS = 30 * 60 * 1000;

function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function persist<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  void setLocalData(key, value).catch(() => undefined);
}

function lowestBuyPriceItem(items: AuctionItem[]): AuctionItem | null {
  return items
    .filter(item => item.AuctionInfo.BuyPrice !== null)
    .sort((a, b) => (a.AuctionInfo.BuyPrice ?? Number.MAX_SAFE_INTEGER) - (b.AuctionInfo.BuyPrice ?? Number.MAX_SAFE_INTEGER))[0] ?? null;
}

interface SniperCtx {
  conditions: SniperCondition[];
  hits: SnipeHit[];
  auctionOptions: AuctionOptions | null;
  lastPrices: LastPriceMap;
  lastPolled: Date | null;
  polling: boolean;
  addCondition: (condition: Omit<SniperCondition, 'id'>) => void;
  removeCondition: (id: string) => void;
  updateCondition: (id: string, patch: Partial<SniperCondition>) => void;
  clearHits: () => void;
  pollNow: () => Promise<void>;
}

const Ctx = createContext<SniperCtx | null>(null);

export const useAuctionSniper = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuctionSniper must be used within AuctionSniperProvider');
  return ctx;
};

export const AuctionSniperProvider = ({ children }: { children: ReactNode }) => {
  const [conditions, setConditions] = useState<SniperCondition[]>(() => load(CONDITION_KEY, []));
  const [hits, setHits] = useState<SnipeHit[]>(() => load(HIT_KEY, []));
  const [lastPrices, setLastPrices] = useState<LastPriceMap>(() => load(LAST_PRICE_KEY, {}));
  const [auctionOptions, setAuctionOptions] = useState<AuctionOptions | null>(null);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [polling, setPolling] = useState(false);
  const condRef = useRef(conditions);
  const lastPriceRef = useRef(lastPrices);
  condRef.current = conditions;
  lastPriceRef.current = lastPrices;

  useEffect(() => {
    getAuctionsOptions().then(setAuctionOptions).catch(() => undefined);
  }, []);

  useEffect(() => {
    void Promise.all([
      getLocalData<SniperCondition[]>(CONDITION_KEY, condRef.current).then(setConditions),
      getLocalData<SnipeHit[]>(HIT_KEY, []).then(setHits),
      getLocalData<LastPriceMap>(LAST_PRICE_KEY, {}).then(setLastPrices),
    ]).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  const addCondition = useCallback((condition: Omit<SniperCondition, 'id'>) => {
    setConditions(prev => {
      const next = [...prev, { ...condition, id: crypto.randomUUID() }];
      persist(CONDITION_KEY, next);
      return next;
    });
  }, []);

  const removeCondition = useCallback((id: string) => {
    setConditions(prev => {
      const next = prev.filter(condition => condition.id !== id);
      persist(CONDITION_KEY, next);
      return next;
    });
    setLastPrices(prev => {
      const next = { ...prev };
      delete next[id];
      persist(LAST_PRICE_KEY, next);
      return next;
    });
  }, []);

  const updateCondition = useCallback((id: string, patch: Partial<SniperCondition>) => {
    setConditions(prev => {
      const next = prev.map(condition => (condition.id === id ? { ...condition, ...patch } : condition));
      persist(CONDITION_KEY, next);
      return next;
    });
  }, []);

  const clearHits = useCallback(() => {
    setHits([]);
    persist(HIT_KEY, []);
  }, []);

  const pollNow = useCallback(async () => {
    const activeConditions = condRef.current.filter(condition => condition.enabled);
    if (!activeConditions.length) return;

    setPolling(true);
    const nextLastPrices = { ...lastPriceRef.current };
    const newHits: SnipeHit[] = [];

    for (const condition of activeConditions) {
      try {
        const body: Record<string, unknown> = { PageNo: 1, Sort: 'BUY_PRICE', SortCondition: 'ASC' };
        if (condition.categoryCode) body.CategoryCode = condition.categoryCode;
        if (condition.grade) body.ItemGrade = condition.grade;
        if (condition.tier) body.ItemTier = condition.tier;
        if (condition.engravings.length > 0) {
          body.EtcOptions = condition.engravings.map(engraving => ({
            FirstOption: 3,
            SecondOption: engraving.name,
            MinValue: engraving.minLevel,
          }));
        }

        const res = await searchAuctionItems(body as AuctionSearchBody);
        const lowest = lowestBuyPriceItem(res.Items ?? []);
        if (!lowest) continue;
        if (condition.minQuality && (lowest.GradeQuality ?? 0) < condition.minQuality) continue;

        const currentPrice = lowest.AuctionInfo.BuyPrice ?? 0;
        const previousPrice = nextLastPrices[condition.id] ?? condition.baselinePrice;
        nextLastPrices[condition.id] = currentPrice;

        if (previousPrice === undefined || previousPrice <= 0 || currentPrice <= previousPrice) continue;

        const riseAmount = currentPrice - previousPrice;
        const risePercent = (riseAmount / previousPrice) * 100;
        const amountPassed = condition.riseAmount === undefined || riseAmount >= condition.riseAmount;
        const percentPassed = condition.risePercent === undefined || risePercent >= condition.risePercent;
        if (!amountPassed || !percentPassed) continue;

        const hit: SnipeHit = {
          conditionId: condition.id,
          conditionLabel: condition.label,
          item: lowest,
          foundAt: new Date().toISOString(),
          previousPrice,
          currentPrice,
          riseAmount,
          risePercent,
        };
        newHits.push(hit);

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`[경매장 가격 상승] ${condition.label}`, {
            body: `${previousPrice.toLocaleString()}G -> ${currentPrice.toLocaleString()}G (+${riseAmount.toLocaleString()}G)`,
          });
        }
      } catch {
        // 조건 하나의 조회 실패가 전체 폴링을 막지 않도록 둔다.
      }
    }

    setLastPrices(nextLastPrices);
    persist(LAST_PRICE_KEY, nextLastPrices);

    if (newHits.length > 0) {
      setHits(prev => {
        const next = [...newHits, ...prev].slice(0, 100);
        persist(HIT_KEY, next);
        return next;
      });
    }

    setLastPolled(new Date());
    setPolling(false);
  }, []);

  useEffect(() => {
    pollNow();
    const id = setInterval(pollNow, POLL_MS);
    return () => clearInterval(id);
  }, [pollNow]);

  useEffect(() => {
    if (conditions.length > 0) {
      void pollNow();
    }
  }, [conditions.length, pollNow]);

  return (
    <Ctx.Provider
      value={{
        conditions,
        hits,
        auctionOptions,
        lastPrices,
        lastPolled,
        polling,
        addCondition,
        removeCondition,
        updateCondition,
        clearHits,
        pollNow,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};
