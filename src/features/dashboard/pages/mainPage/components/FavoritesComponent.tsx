import style from '../style/FavoritesComponent.module.css';

const FavoritesComponent = () => {
    return (
        <div className={style.favoritesBox}>
            <span className={style.label}>즐겨찾기</span>
            <span className={style.badge}>준비 중</span>
            <span className={style.hint}>경매장 연동 후 이용 가능합니다.</span>
        </div>
    );
};

export default FavoritesComponent;
