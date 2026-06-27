import { useCalendar } from '../context/CalendarContext';
import { CalendarRewardItemGroup } from '../types/Lostark.types';
import pageStyle from '../style/MainPage.module.css';
import style from '../style/TodayIsland.module.css';

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

const RewardItemsDisplay = ({ rewardItems }: { rewardItems: CalendarRewardItemGroup[] }) => {
    const allItems = rewardItems.flatMap(g => g.Items);
    return (
        <div className={style.rewardContainer}>
            {allItems.slice(0, 5).map((item, i) => (
                <img
                    key={i}
                    src={item.Icon}
                    alt={item.Name}
                    title={item.Name}
                    className={`${style.rewardIcon} ${style[('Grade-' + item.Grade) as keyof typeof style]}`}
                />
            ))}
        </div>
    );
};

const TodayIslandComponent = () => {
    const { adventureIslands, loading, error } = useCalendar();

    return (
        <div className={pageStyle.card}>
            <h2 className={pageStyle.cardTitle}>오늘의 모험 섬</h2>

            {loading && <p className={pageStyle.stateBox}>불러오는 중...</p>}
            {error && <p className={`${pageStyle.stateBox} ${pageStyle.errorBox}`}>{error}</p>}

            {!loading && !error && (
                adventureIslands.length > 0 ? (
                    <ul className={style.list}>
                        {adventureIslands.map(island => (
                            <li key={island.ContentsName} className={style.contentItem}>
                                <img src={island.ContentsIcon} alt={island.ContentsName} className={style.icon} />
                                <div className={style.info}>
                                    <div className={style.nameLine}>
                                        <span className={style.name}>{island.ContentsName}</span>
                                        <span className={style.itemLevel}>Lv.{island.MinItemLevel}</span>
                                    </div>
                                    {island.StartTimes && (
                                        <span className={style.time}>
                                            {island.StartTimes.map(formatTime).join(' / ')}
                                        </span>
                                    )}
                                    <RewardItemsDisplay rewardItems={island.RewardItems} />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={style.noItemText}>오늘 등장하는 모험 섬이 없습니다.</p>
                )
            )}
        </div>
    );
};

export default TodayIslandComponent;
