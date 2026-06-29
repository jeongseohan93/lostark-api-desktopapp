import { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFavorites } from '../../../../shared/context/FavoritesContext';
import type {
  AuctionFavorite,
  AuctionFavoriteSnapshot,
  FavoriteItem,
  PriceSnapshot,
} from '../../../../shared/context/FavoritesContext';
import style from './style/FavoritesPage.module.css';

const GRADE_COLOR: Record<string, string> = {
  일반: '#9d9d9d',
  고급: '#1eff00',
  희귀: '#0070dd',
  영웅: '#a335ee',
  전설: '#ff8000',
  유물: '#e06c30',
  고대: '#dcc269',
};

const formatTs = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatGold = (value: number) => `${Math.round(value).toLocaleString()} G`;

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: number }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={style.tooltip}>
      <p className={style.tooltipLabel}>{label !== undefined ? formatTs(label) : ''}</p>
      {payload.map(point => (
        <p key={point.name} style={{ color: point.color }}>
          {point.name}: {formatGold(point.value)}
        </p>
      ))}
    </div>
  );
};

const EmptyChart = ({ text }: { text: string }) => (
  <div className={style.noChart}>{text}</div>
);

const MarketFavoriteCard = ({ fav }: { fav: FavoriteItem }) => {
  const { priceHistory, priceAlerts, removeFavorite, setPriceAlert, lastPolled } = useFavorites();
  const [alertInput, setAlertInput] = useState('');
  const [editing, setEditing] = useState(false);
  const history: PriceSnapshot[] = priceHistory[String(fav.id)] ?? [];
  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const currentAlert = priceAlerts[String(fav.id)];
  const diff = latest && previous ? latest.minPrice - previous.minPrice : null;
  const gradeColor = GRADE_COLOR[fav.grade] ?? '#d4d4d8';

  const saveAlert = () => {
    const value = Number(alertInput.replace(/,/g, ''));
    if (Number.isFinite(value) && value > 0) setPriceAlert(fav.id, value);
    setEditing(false);
    setAlertInput('');
  };

  const chartData = history.map(point => ({
    ts: point.ts,
    최저가: point.minPrice,
    전일평균: point.avgPrice,
  }));

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
              <span className={style.currentPrice}>{formatGold(latest.minPrice)}</span>
              {diff !== null && (
                <span className={diff <= 0 ? style.downText : style.upText}>
                  {diff > 0 ? '+' : ''}{formatGold(diff)}
                </span>
              )}
              {lastPolled && (
                <span className={style.polledAt}>
                  갱신 {lastPolled.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </>
          ) : (
            <span className={style.noData}>시세 수집 대기</span>
          )}
        </div>

        <div className={style.cardActions}>
          {currentAlert !== undefined && (
            <span className={style.alertBadge}>
              목표 {formatGold(currentAlert)}
              <button className={style.clearAlert} onClick={() => setPriceAlert(fav.id, null)}>×</button>
            </span>
          )}
          {editing ? (
            <div className={style.alertInput}>
              <input
                type="number"
                placeholder="목표가"
                value={alertInput}
                onChange={event => setAlertInput(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && saveAlert()}
                autoFocus
              />
              <button onClick={saveAlert}>저장</button>
              <button onClick={() => { setEditing(false); setAlertInput(''); }}>취소</button>
            </div>
          ) : (
            <button className={style.setAlertBtn} onClick={() => setEditing(true)}>
              가격 알림
            </button>
          )}
          <button className={style.removeBtn} onClick={() => removeFavorite(fav.id)}>삭제</button>
        </div>
      </div>

      {chartData.length >= 2 ? (
        <div className={style.chartWrap}>
          <ResponsiveContainer width="100%" height={168}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="ts" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTs} tick={{ fill: '#71717a', fontSize: 10 }} tickCount={5} scale="time" />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#71717a', fontSize: 10 }} width={56} tickFormatter={value => Number(value).toLocaleString()} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#a1a1aa' }} />
              <Line type="monotone" dataKey="최저가" stroke="#facc15" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="전일평균" stroke="#60a5fa" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyChart text={chartData.length === 0 ? '앱 시작 또는 수동 갱신 후 시세가 저장됩니다.' : '차트 표시는 시세 기록이 2개 이상 필요합니다.'} />
      )}
    </div>
  );
};

const AuctionFavoriteCard = ({ fav }: { fav: AuctionFavorite }) => {
  const { auctionPriceHistory, removeAuctionFavorite } = useFavorites();
  const history: AuctionFavoriteSnapshot[] = auctionPriceHistory[fav.id] ?? [];
  const latest = fav.latestItem ?? history[history.length - 1];
  const previous = history[history.length - 2];
  const diff = latest && previous ? latest.buyPrice - previous.buyPrice : null;
  const chartData = history.map(point => ({
    ts: point.ts,
    최저가: point.buyPrice,
  }));

  return (
    <div className={style.card}>
      <div className={style.cardHeader}>
        <div className={style.itemInfo}>
          {latest?.icon && <img src={latest.icon} alt={latest.itemName} className={style.itemIcon} />}
          <div>
            <span className={style.itemName}>{fav.label}</span>
            <span className={style.grade}>경매장 조건</span>
          </div>
        </div>

        <div className={style.priceRow}>
          {latest ? (
            <>
              <span className={style.currentPrice}>{formatGold(latest.buyPrice)}</span>
              {diff !== null && (
                <span className={diff <= 0 ? style.downText : style.upText}>
                  {diff > 0 ? '+' : ''}{formatGold(diff)}
                </span>
              )}
              <span className={style.polledAt}>{latest.itemName}</span>
            </>
          ) : (
            <span className={style.noData}>매물 갱신 대기</span>
          )}
        </div>

        <div className={style.cardActions}>
          <button className={style.removeBtn} onClick={() => removeAuctionFavorite(fav.id)}>삭제</button>
        </div>
      </div>

      {chartData.length >= 2 ? (
        <div className={style.chartWrap}>
          <ResponsiveContainer width="100%" height={168}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="ts" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTs} tick={{ fill: '#71717a', fontSize: 10 }} tickCount={5} scale="time" />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#71717a', fontSize: 10 }} width={56} tickFormatter={value => Number(value).toLocaleString()} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="최저가" stroke="#a78bfa" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyChart text={chartData.length === 0 ? '앱 시작 또는 수동 갱신 후 최저가 매물이 저장됩니다.' : '차트 표시는 시세 기록이 2개 이상 필요합니다.'} />
      )}
    </div>
  );
};

const FavoritesPage = () => {
  const { favorites, auctionFavorites, lastPolled, pollPrices, polling } = useFavorites();
  const isEmpty = favorites.length === 0 && auctionFavorites.length === 0;

  return (
    <div className={style.page}>
      <div className={style.header}>
        <div>
          <h2 className={style.title}>즐겨찾기</h2>
          <span className={style.status}>
            {lastPolled
              ? `마지막 갱신 ${lastPolled.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
              : '앱 시작 시 자동 갱신'}
          </span>
        </div>
        <button className={style.refreshBtn} onClick={pollPrices} disabled={polling}>
          {polling ? '갱신 중...' : '지금 갱신'}
        </button>
      </div>

      {isEmpty ? (
        <div className={style.empty}>
          <p>즐겨찾기가 없습니다.</p>
          <p className={style.emptySub}>거래소 아이템이나 경매장 검색 조건을 즐겨찾기로 추가하세요.</p>
        </div>
      ) : (
        <>
          {favorites.length > 0 && (
            <section className={style.section}>
              <h3 className={style.sectionTitle}>거래소 아이템</h3>
              <div className={style.cardList}>
                {favorites.map(fav => <MarketFavoriteCard key={fav.id} fav={fav} />)}
              </div>
            </section>
          )}

          {auctionFavorites.length > 0 && (
            <section className={style.section}>
              <h3 className={style.sectionTitle}>경매장 조건</h3>
              <div className={style.cardList}>
                {auctionFavorites.map(fav => <AuctionFavoriteCard key={fav.id} fav={fav} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage;
