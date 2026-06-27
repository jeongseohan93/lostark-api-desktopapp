import { useState, useEffect, useCallback } from 'react';
import { searchMarketItems } from '../../../../shared/api/IpcMarket';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import style from './style/CrystalTrackerPage.module.css';

// 블루 크리스탈 100개 기준 골드 시세
const CRYSTAL_MARKET_NAME = '블루 크리스탈';
const CRYSTAL_BUNDLE = 100;
const STORAGE_KEY = 'loa_crystal_history_v1';
const POLL_MS = 30 * 60 * 1000;
const MAX_HISTORY = 200;

interface CrystalSnapshot {
    ts: number;      // Unix ms
    price: number;   // 골드 per 100 crystals
    source: 'api' | 'manual';
}

function loadHistory(): CrystalSnapshot[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}

function saveHistory(h: CrystalSnapshot[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(-MAX_HISTORY)));
}

function fmtTime(ts: number) {
    const d = new Date(ts);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function fmtDate(ts: number) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const CrystalTrackerPage = () => {
    const [history, setHistory] = useState<CrystalSnapshot[]>(loadHistory);
    const [fetching, setFetching] = useState(false);
    const [lastPolled, setLastPolled] = useState<Date | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const [manualInput, setManualInput] = useState('');

    // converter
    const [convertGold, setConvertGold] = useState('');
    const [convertCrystal, setConvertCrystal] = useState('');

    const currentPrice = history.length > 0 ? history[history.length - 1].price : null;
    const prevPrice = history.length > 1 ? history[history.length - 2].price : null;
    const priceDiff = currentPrice !== null && prevPrice !== null ? currentPrice - prevPrice : null;

    const pushSnapshot = useCallback((price: number, source: 'api' | 'manual') => {
        setHistory(prev => {
            const next = [...prev, { ts: Date.now(), price, source }].slice(-MAX_HISTORY);
            saveHistory(next);
            return next;
        });
    }, []);

    const fetchPrice = useCallback(async () => {
        setFetching(true);
        setApiError(null);
        try {
            const res = await searchMarketItems({ ItemName: CRYSTAL_MARKET_NAME, PageNo: 1 });
            const item = res.Items?.[0];
            if (item) {
                pushSnapshot(item.CurrentMinPrice, 'api');
            } else {
                setApiError('API 조회 결과 없음. 수동 입력을 사용하세요.');
            }
        } catch (e) {
            setApiError(e instanceof Error ? e.message : '조회 실패');
        } finally {
            setFetching(false);
            setLastPolled(new Date());
        }
    }, [pushSnapshot]);

    useEffect(() => {
        fetchPrice();
        const id = setInterval(fetchPrice, POLL_MS);
        return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logManual = () => {
        const price = Number(manualInput);
        if (!price) return;
        pushSnapshot(price, 'manual');
        setManualInput('');
    };

    const clearHistory = () => {
        if (!confirm('히스토리를 삭제할까요?')) return;
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    // converter
    const latestPrice = currentPrice ?? 0;
    const convertedCrystal = convertGold && latestPrice
        ? Math.floor((Number(convertGold) / latestPrice) * CRYSTAL_BUNDLE)
        : null;
    const convertedGold = convertCrystal && latestPrice
        ? Math.round((Number(convertCrystal) / CRYSTAL_BUNDLE) * latestPrice)
        : null;

    // chart data (최근 48개)
    const chartData = history.slice(-48).map(s => ({
        time: fmtTime(s.ts),
        price: s.price,
    }));

    const priceMin = chartData.length ? Math.min(...chartData.map(d => d.price)) * 0.97 : 0;
    const priceMax = chartData.length ? Math.max(...chartData.map(d => d.price)) * 1.03 : 100;

    return (
        <div className={style.page}>
            <div className={style.header}>
                <h2 className={style.title}>크리스탈 시세 추적기</h2>
                <button className={style.fetchBtn} onClick={fetchPrice} disabled={fetching}>
                    {fetching ? '조회 중...' : '지금 조회'}
                </button>
                {lastPolled && (
                    <span className={style.pollInfo}>마지막: {lastPolled.toLocaleTimeString('ko-KR')} · 30분마다 자동 갱신</span>
                )}
            </div>

            {/* 현재 시세 히어로 */}
            <div className={style.heroCard}>
                <div className={style.heroLeft}>
                    <span className={style.heroLabel}>현재 블루 크리스탈 시세</span>
                    <span className={style.heroPrice}>
                        {currentPrice !== null ? currentPrice.toLocaleString() : '—'} G
                    </span>
                    <span className={style.heroCrystal}>100 크리스탈 기준</span>
                </div>
                <div className={style.heroRight}>
                    {priceDiff !== null && (
                        <span className={`${style.changeBadge} ${priceDiff > 0 ? style.up : priceDiff < 0 ? style.down : style.flat}`}>
                            {priceDiff > 0 ? '▲' : priceDiff < 0 ? '▼' : '—'} {Math.abs(priceDiff).toLocaleString()} G
                        </span>
                    )}
                    {priceDiff !== null && <span className={style.changeLabel}>직전 대비</span>}
                </div>
            </div>

            {apiError && (
                <div style={{ color: '#f87171', fontSize: '0.82rem', padding: '0.5rem 0.75rem', background: 'rgba(248,113,113,0.08)', borderRadius: '6px', border: '1px solid #f87171' }}>
                    {apiError}
                </div>
            )}

            {/* 수동 입력 */}
            <div className={style.manualCard}>
                <p className={style.sectionLabel ?? ''} style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>
                    수동 가격 입력
                </p>
                <div className={style.manualRow}>
                    <div className={style.manualField}>
                        <label>100 크리스탈 가격 (G)</label>
                        <input
                            type="number"
                            placeholder="예: 1650"
                            value={manualInput}
                            onChange={e => setManualInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && logManual()}
                        />
                    </div>
                    <button className={style.logBtn} onClick={logManual}>기록</button>
                    <span className={style.manualHint}>API 미지원 시 직접 입력해도 히스토리에 저장됩니다.</span>
                </div>
            </div>

            {/* 차트 */}
            {chartData.length > 1 && (
                <div className={style.chartCard}>
                    <p className={style.chartTitle}>시세 히스토리 (최근 48회)</p>
                    <div className={style.chartWrap}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#52525b' }} interval="preserveStartEnd" />
                                <YAxis domain={[priceMin, priceMax]} tick={{ fontSize: 10, fill: '#52525b' }} width={55} tickFormatter={(v: number) => v.toLocaleString()} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '6px', fontSize: '0.8rem' }}
                                    formatter={(v: unknown) => [`${(v as number).toLocaleString()} G`, '100크리스탈']}
                                />
                                <Line type="monotone" dataKey="price" stroke="#60a5fa" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* 환산기 */}
            {currentPrice && (
                <div className={style.converterCard}>
                    <p style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>
                        빠른 환산기
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div className={style.convertRow}>
                            <div className={style.convertField}>
                                <label>골드</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={convertGold}
                                    onChange={e => setConvertGold(e.target.value)}
                                />
                            </div>
                            <span className={style.convertArrow}>→</span>
                            <span className={style.convertResult}>
                                {convertedCrystal !== null ? convertedCrystal.toLocaleString() : '—'}
                            </span>
                            <span className={style.convertUnit}>크리스탈</span>
                        </div>
                        <div className={style.convertRow}>
                            <div className={style.convertField}>
                                <label>크리스탈</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={convertCrystal}
                                    onChange={e => setConvertCrystal(e.target.value)}
                                />
                            </div>
                            <span className={style.convertArrow}>→</span>
                            <span className={style.convertResult}>
                                {convertedGold !== null ? convertedGold.toLocaleString() : '—'}
                            </span>
                            <span className={style.convertUnit}>G</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 히스토리 테이블 */}
            <div className={style.historyCard}>
                <p style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>
                    기록 목록 (최근 {Math.min(history.length, 20)}개)
                </p>
                {history.length === 0 ? (
                    <div className={style.empty}>아직 기록이 없습니다.</div>
                ) : (
                    <>
                        <table className={style.table}>
                            <thead>
                                <tr><th>시각</th><th>가격 (100크리스탈)</th><th>변동</th><th>출처</th></tr>
                            </thead>
                            <tbody>
                                {[...history].reverse().slice(0, 20).map((s, i, arr) => {
                                    const prev = arr[i + 1];
                                    const diff = prev ? s.price - prev.price : null;
                                    return (
                                        <tr key={s.ts}>
                                            <td>{fmtDate(s.ts)}</td>
                                            <td className={style.priceCell}>{s.price.toLocaleString()} G</td>
                                            <td className={diff === null ? '' : diff > 0 ? style.upCell : diff < 0 ? style.downCell : ''}>
                                                {diff === null ? '—' : diff > 0 ? `▲ ${diff.toLocaleString()}` : diff < 0 ? `▼ ${Math.abs(diff).toLocaleString()}` : '—'}
                                            </td>
                                            <td className={style.sourceCell}>{s.source === 'api' ? 'API' : '수동'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <button className={style.clearBtn} onClick={clearHistory}>히스토리 초기화</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CrystalTrackerPage;
