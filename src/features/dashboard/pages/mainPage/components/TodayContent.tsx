import { useCalendar } from '../context/CalendarContext';
import { CalendarEvent } from '../types/Lostark.types';
import pageStyle from '../style/MainPage.module.css';
import style from '../style/TodayContent.module.css';

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

const getSortedStartTimes = (event: CalendarEvent) =>
    [...(event.StartTimes ?? [])].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

const getVisibleStartTimes = (event: CalendarEvent) => {
    const startTimes = getSortedStartTimes(event);
    const visibleCount = event.CategoryName === '카오스게이트' ? 3 : 4;

    return {
        startTimes,
        visibleStartTimes: startTimes.slice(0, visibleCount),
        hiddenCount: Math.max(startTimes.length - visibleCount, 0),
    };
};

const TodayContentComponent = () => {
    const { worldEvents, loading, error } = useCalendar();

    return (
        <div className={pageStyle.card}>
            <h2 className={pageStyle.cardTitle}>필드보스 & 카오스게이트</h2>

            {loading && <p className={pageStyle.stateBox}>불러오는 중...</p>}
            {error && <p className={`${pageStyle.stateBox} ${pageStyle.errorBox}`}>{error}</p>}

            {!loading && !error && (
                worldEvents.length > 0 ? (
                    <ul className={style.list}>
                        {worldEvents.map(event => {
                            const { startTimes, visibleStartTimes, hiddenCount } = getVisibleStartTimes(event);
                            const isChaosGate = event.CategoryName === '카오스게이트';

                            return (
                                <li
                                    key={`${event.CategoryName}-${event.ContentsName}`}
                                    className={`${style.contentItem} ${isChaosGate ? style.chaosGateItem : ''}`}
                                >
                                    <img src={event.ContentsIcon} alt={event.ContentsName} className={style.icon} />
                                    <div className={style.info}>
                                        <span className={style.name}>{event.ContentsName}</span>
                                        <div className={style.meta}>
                                            <span className={style.itemLevel}>Lv.{event.MinItemLevel}</span>
                                            <span className={`${style.categoryBadge} ${style[('categoryBadge-' + event.CategoryName) as keyof typeof style]}`}>
                                                {event.CategoryName}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={style.timeGroup} title={startTimes.map(formatTime).join(' / ')}>
                                        {visibleStartTimes.map(time => (
                                            <span key={time} className={style.timeChip}>{formatTime(time)}</span>
                                        ))}
                                        {hiddenCount > 0 && (
                                            <span className={`${style.timeChip} ${style.moreTime}`}>+{hiddenCount}</span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className={style.noItemText}>오늘 등장하는 월드 이벤트가 없습니다.</p>
                )
            )}
        </div>
    );
};

export default TodayContentComponent;
