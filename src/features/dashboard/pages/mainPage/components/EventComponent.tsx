import { type MouseEvent, useState } from 'react';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import { useEvent } from '../hooks/useLostArkEvent';
import { openExternal } from '../../../../../shared/api/IpcWindow';
import pageStyle from '../style/MainPage.module.css';
import style from '../style/EventComponent.module.css';

const MAX_EVENT_DOTS = 10;

const EventComponent = () => {
    const { event, loading, error } = useEvent();
    const [emphasizeIndex, setEmphasizeIndex] = useState(0);

    const goPrev = () => {
        setEmphasizeIndex(prev => (prev <= 0 ? event.length - 1 : prev - 1));
    };

    const goNext = () => {
        setEmphasizeIndex(prev => (prev >= event.length - 1 ? 0 : prev + 1));
    };

    const selectTab = (e: MouseEvent<HTMLButtonElement>, index: number) => {
        e.preventDefault();
        setEmphasizeIndex(index);
    };

    if (loading) {
        return (
            <div className={`${pageStyle.card} ${style.eventCard}`}>
                <p className={pageStyle.stateBox}>불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${pageStyle.card} ${style.eventCard}`}>
                <p className={`${pageStyle.stateBox} ${pageStyle.errorBox}`}>{error}</p>
            </div>
        );
    }

    if (!event.length) {
        return (
            <div className={`${pageStyle.card} ${style.eventCard}`}>
                <p className={pageStyle.stateBox}>진행 중인 이벤트가 없습니다.</p>
            </div>
        );
    }

    const current = event[emphasizeIndex] ?? event[0];
    const visibleDots = event.slice(0, MAX_EVENT_DOTS);
    const hiddenDotCount = Math.max(event.length - visibleDots.length, 0);

    return (
        <div className={`${pageStyle.card} ${style.eventCard}`}>
            <div className={style.heroHeader}>
                <span className={style.updateBadge}>UPDATE</span>
                <h2>LOST ARK</h2>
            </div>

            <a
                className={style.heroLink}
                href={current.Link}
                onClick={e => { e.preventDefault(); openExternal(current.Link); }}
            >
                <img src={current.Thumbnail} alt={current.Title} className={style.thumbnail} />
                <span className={style.eventTitle}>{current.Title}</span>
            </a>

            <div className={style.navRow}>
                <button className={style.navBtn} onClick={goPrev} aria-label="이전 이벤트">
                    <SlArrowLeft />
                </button>
                <div className={style.dotList}>
                    {visibleDots.map((ev, index) => (
                        <button
                            key={ev.Link}
                            className={`${style.dot} ${emphasizeIndex === index ? style.activeDot : ''}`}
                            onClick={e => selectTab(e, index)}
                            title={ev.Title}
                            aria-label={`${index + 1}번 이벤트`}
                        />
                    ))}
                    {hiddenDotCount > 0 && <span className={style.moreDot}>+{hiddenDotCount}</span>}
                </div>
                <button className={style.navBtn} onClick={goNext} aria-label="다음 이벤트">
                    <SlArrowRight />
                </button>
            </div>
        </div>
    );
};

export default EventComponent;
