import { useCalendar } from '../context/CalendarContext';
import pageStyle from '../style/MainPage.module.css';
import style from '../style/TodayContent.module.css';

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

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
                        {worldEvents.map(event => (
                            <li key={event.ContentsName} className={style.contentItem}>
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
                                {event.StartTimes && (
                                    <span className={style.time}>
                                        {event.StartTimes.map(formatTime).join(' / ')}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={style.noItemText}>오늘 등장하는 월드 이벤트가 없습니다.</p>
                )
            )}
        </div>
    );
};

export default TodayContentComponent;
