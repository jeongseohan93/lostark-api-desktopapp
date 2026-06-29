import { useCalendar } from '../context/CalendarContext';
import { CalendarEvent, CalendarRewardItemGroup } from '../types/Lostark.types';
import pageStyle from '../style/MainPage.module.css';
import style from '../style/TodayIsland.module.css';

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

const getSortedStartTimes = (event: CalendarEvent) =>
    [...(event.StartTimes ?? [])].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

const getVisibleStartTimes = (event: CalendarEvent) => {
    const startTimes = getSortedStartTimes(event);
    const visibleCount = 3;

    return {
        startTimes,
        visibleStartTimes: startTimes.slice(0, visibleCount),
        hiddenCount: Math.max(startTimes.length - visibleCount, 0),
    };
};

const RewardItemsDisplay = ({ rewardItems }: { rewardItems: CalendarRewardItemGroup[] }) => {
    const allItems = rewardItems.flatMap(group => group.Items);
    const visibleItems = allItems.slice(0, 4);
    const hiddenCount = Math.max(allItems.length - visibleItems.length, 0);

    return (
        <div className={style.rewardContainer}>
            {visibleItems.map((item, i) => (
                <img
                    key={`${item.Name}-${i}`}
                    src={item.Icon}
                    alt={item.Name}
                    title={item.Name}
                    className={`${style.rewardIcon} ${style[('Grade-' + item.Grade) as keyof typeof style]}`}
                />
            ))}
            {hiddenCount > 0 && (
                <span className={style.moreReward}>+{hiddenCount}</span>
            )}
        </div>
    );
};

const TodayIslandComponent = () => {
    const { adventureIslands, loading, error } = useCalendar();

    return (
        <div className={pageStyle.card}>
            <h2 className={pageStyle.cardTitle}>오늘의 모험섬</h2>

            {loading && <p className={pageStyle.stateBox}>불러오는 중...</p>}
            {error && <p className={`${pageStyle.stateBox} ${pageStyle.errorBox}`}>{error}</p>}

            {!loading && !error && (
                adventureIslands.length > 0 ? (
                    <ul className={style.list}>
                        {adventureIslands.map(island => {
                            const { startTimes, visibleStartTimes, hiddenCount } = getVisibleStartTimes(island);

                            return (
                                <li key={island.ContentsName} className={style.contentItem}>
                                    <img src={island.ContentsIcon} alt={island.ContentsName} className={style.icon} />
                                    <div className={style.info}>
                                        <div className={style.nameLine}>
                                            <span className={style.name}>{island.ContentsName}</span>
                                            <span className={style.itemLevel}>Lv.{island.MinItemLevel}</span>
                                        </div>
                                        <div className={style.timeGroup} title={startTimes.map(formatTime).join(' / ')}>
                                            {visibleStartTimes.map(time => (
                                                <span key={time} className={style.timeChip}>{formatTime(time)}</span>
                                            ))}
                                            {hiddenCount > 0 && (
                                                <span className={`${style.timeChip} ${style.moreTime}`}>+{hiddenCount}</span>
                                            )}
                                        </div>
                                        <RewardItemsDisplay rewardItems={island.RewardItems} />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className={style.noItemText}>오늘 등장하는 모험섬이 없습니다.</p>
                )
            )}
        </div>
    );
};

export default TodayIslandComponent;
