import { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useFavorites } from '../../../../shared/context/FavoritesContext';
import type { FavoriteItem, PriceSnapshot } from '../../../../shared/context/FavoritesContext';
import style from './style/FavoritesPage.module.css';

const GRADE_COLOR: Record<string, string> = {
    '일반': '#9d9d9d', '고급': '#1eff00', '희귀': '#0070dd',
    '영웅': '#a335ee', '전설': '#ff8000', '유물': '#e06c30', '고대': '#cca800',
};

const formatTs = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: number }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={style.tooltip}>
            <p className={style.tooltipLabel}>{label !== undefined ? formatTs(label) : ''}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name === 'minPrice' ? '최저가' : '전일 평균'}: {p.value.toLocaleString()} G
                </p>
            ))}
        </div>
    );
};

const ItemCard = ({ fav }: { fav: FavoriteItem }) => {
    const { priceHistory, priceAlerts, removeFavorite, setPriceAlert, lastPolled } = useFavorites();
    const [alertInput, setAlertInput] = useState('');
    const [editing, setEditing] = useState(false);

    const history: PriceSnapshot[] = priceHistory[String(fav.id)] ?? [];
    const latest = history[history.length - 1];
    const currentAlert = priceAlerts[String(fav.id)];

    const handleSaveAlert = () => {
        const v = parseFloat(alertInput);
        if (!isNaN(v) && v > 0) { setPriceAlert(fav.id, v); }
        setEditing(false);
        setAlertInput('');
    };

    const chartData = history.map(p => ({ ts: p.ts, minPrice: p.minPrice, avgPrice: p.avgPrice }));

    const gradeColor = GRADE_COLOR[fav.grade] ?? '#888';

    return (
        <div className={style.card}>
            <div className={style.cardHeader}>
                <div className={style.itemInfo}>
                    {fav.icon && <img src={fav.icon} alt={fav.name} className={style.itemIcon} />}
                    <div>
                        <span className={style.itemName} style={{ color: gradeColor }}>{fav.name}</span>
                        <span className={style.grade}>{fav.grade}</span>
                    </div>
                </div>
                <div className={style.priceRow}>
                    {latest ? (
                        <>
                            <span className={style.currentPrice}>{latest.minPrice.toLocaleString()} G</span>
                            {lastPolled && (
                                <span className={style.polledAt}>
                                    수집: {lastPolled.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className={style.noData}>데이터 수집 중...</span>
                    )}
                </div>
                <div className={style.cardActions}>
                    {currentAlert !== undefined ? (
                        <span className={style.alertBadge}>
                            목표가 {currentAlert.toLocaleString()} G
                            <button className={style.clearAlert} onClick={() => setPriceAlert(fav.id, null)}>×</button>
                        </span>
                    ) : null}
                    {editing ? (
                        <div className={style.alertInput}>
                            <input
                                type='number'
                                placeholder='목표가 (G)'
                                value={alertInput}
                                onChange={e => setAlertInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSaveAlert()}
                                autoFocus
                            />
                            <button onClick={handleSaveAlert}>저장</button>
                            <button onClick={() => { setEditing(false); setAlertInput(''); }}>취소</button>
                        </div>
                    ) : (
                        <button className={style.setAlertBtn} onClick={() => setEditing(true)}>
                            🔔 {currentAlert !== undefined ? '알림 수정' : '알림 설정'}
                        </button>
                    )}
                    <button className={style.removeBtn} onClick={() => removeFavorite(fav.id)}>★ 해제</button>
                </div>
            </div>

            {chartData.length >= 2 ? (
                <div className={style.chartWrap}>
                    <ResponsiveContainer width='100%' height={160}>
                        <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                            <CartesianGrid strokeDasharray='3 3' stroke='#3f3f46' />
                            <XAxis
                                dataKey='ts'
                                type='number'
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={formatTs}
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                tickCount={5}
                                scale='time'
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                width={48}
                                tickFormatter={v => v.toLocaleString()}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                formatter={(value: string) => value === 'minPrice' ? '최저가' : '전일 평균'}
                                wrapperStyle={{ fontSize: '0.75rem', color: '#a1a1aa' }}
                            />
                            <Line type='monotone' dataKey='minPrice' stroke='#facc15' dot={false} strokeWidth={2} />
                            <Line type='monotone' dataKey='avgPrice' stroke='#60a5fa' dot={false} strokeWidth={1.5} strokeDasharray='4 2' />
                            {currentAlert !== undefined && (
                                <Line
                                    type='monotone'
                                    dataKey={() => currentAlert}
                                    stroke='#f87171'
                                    dot={false}
                                    strokeWidth={1}
                                    strokeDasharray='6 3'
                                    name='target'
                                    legendType='none'
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className={style.noChart}>
                    {chartData.length === 0
                        ? '첫 가격 데이터 수집 중... (30분마다 자동 수집)'
                        : '차트를 그리려면 데이터가 2개 이상 필요합니다.'}
                </div>
            )}
        </div>
    );
};

const FavoritesPage = () => {
    const { favorites, lastPolled } = useFavorites();

    return (
        <div className={style.page}>
            <div className={style.header}>
                <h2 className={style.title}>즐겨찾기</h2>
                <span className={style.status}>
                    {lastPolled
                        ? `마지막 수집: ${lastPolled.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} · 30분마다 자동 수집`
                        : '수집 대기 중...'}
                </span>
            </div>

            {favorites.length === 0 ? (
                <div className={style.empty}>
                    <p>즐겨찾기한 아이템이 없습니다.</p>
                    <p className={style.emptySub}>거래소에서 아이템 옆 ★ 버튼을 눌러 추가하세요.</p>
                </div>
            ) : (
                <div className={style.cardList}>
                    {favorites.map(fav => <ItemCard key={fav.id} fav={fav} />)}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
