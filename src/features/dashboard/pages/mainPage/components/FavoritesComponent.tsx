import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../../../../shared/context/FavoritesContext';
import style from '../style/FavoritesComponent.module.css';

const GRADE_COLOR: Record<string, string> = {
    일반: '#9d9d9d',
    고급: '#1eff00',
    희귀: '#0070dd',
    영웅: '#a335ee',
    전설: '#ff8000',
    유물: '#e06c30',
    고대: '#cca800',
};

const FavoritesComponent = () => {
    const { favorites, priceHistory, lastPolled } = useFavorites();
    const navigate = useNavigate();

    if (favorites.length === 0) {
        return (
            <div className={style.favoritesBox}>
                <span className={style.label}>즐겨찾기</span>
                <span className={style.hint}>거래소에서 별 버튼으로 아이템을 추가하세요.</span>
            </div>
        );
    }

    return (
        <div className={style.favoritesBox} onClick={() => navigate('/favorites')} style={{ cursor: 'pointer' }}>
            <div className={style.titleRow}>
                <span className={style.label}>즐겨찾기</span>
                {lastPolled && (
                    <span className={style.badge}>
                        {lastPolled.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 갱신
                    </span>
                )}
                <span className={style.seeAll}>상세 보기</span>
            </div>
            <div className={style.itemRow}>
                {favorites.slice(0, 6).map(fav => {
                    const hist = priceHistory[String(fav.id)] ?? [];
                    const latest = hist[hist.length - 1];
                    const prev = hist[hist.length - 2];
                    const diff = latest && prev ? latest.minPrice - prev.minPrice : null;

                    return (
                        <div key={fav.id} className={style.itemChip}>
                            <span className={style.chipName} style={{ color: GRADE_COLOR[fav.grade] ?? '#888' }}>
                                {fav.name}
                            </span>
                            <span className={style.chipPrice}>
                                {latest ? `${latest.minPrice.toLocaleString()} G` : '-'}
                            </span>
                            {diff !== null && (
                                <span className={diff < 0 ? style.down : diff > 0 ? style.up : style.flat}>
                                    {diff < 0 ? '▼' : diff > 0 ? '▲' : '-'}
                                    {diff !== 0 ? Math.abs(diff).toLocaleString() : ''}
                                </span>
                            )}
                        </div>
                    );
                })}
                {favorites.length > 6 && (
                    <span className={style.more}>+{favorites.length - 6}</span>
                )}
            </div>
        </div>
    );
};

export default FavoritesComponent;
