import { useState } from 'react';
import { useEvent } from '../hooks/useLostArkEvent';
import { openExternal } from '../../../../../shared/api/IpcWindow';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import pageStyle from '../style/MainPage.module.css';
import style from '../style/EventComponent.module.css';

const EVENT_VIEW_COUNT = 4;

const EventComponent = () => {
    const { event, loading, error } = useEvent();
    const [startIndex, setStartIndex] = useState(0);
    const [emphasizeIndex, setEmphasizeIndex] = useState(0);

    const goPrev = () => {
        setEmphasizeIndex(prev => {
            if (prev <= 0) {
                const lastIdx = event.length - 1;
                setStartIndex(Math.max(0, event.length - EVENT_VIEW_COUNT));
                return lastIdx;
            }
            const next = prev - 1;
            setStartIndex(prevStart => (next - prevStart < 1 && prevStart > 0 ? prevStart - 1 : prevStart));
            return next;
        });
    };

    const goNext = () => {
        setEmphasizeIndex(prev => {
            if (prev >= event.length - 1) {
                setStartIndex(0);
                return 0;
            }
            const next = prev + 1;
            setStartIndex(prevStart => {
                const lastPossible = event.length - EVENT_VIEW_COUNT;
                if (prevStart >= lastPossible) return prevStart;
                return next - prevStart > 2 ? prevStart + 1 : prevStart;
            });
            return next;
        });
    };

    const selectTab = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
        e.preventDefault();
        setEmphasizeIndex(index);
        if (index > 2) {
            setStartIndex(Math.min(index - 2, event.length - EVENT_VIEW_COUNT));
        } else {
            setStartIndex(0);
        }
    };

    if (loading) return <div className={pageStyle.card}><p className={pageStyle.stateBox}>불러오는 중...</p></div>;
    if (error) return <div className={pageStyle.card}><p className={`${pageStyle.stateBox} ${pageStyle.errorBox}`}>{error}</p></div>;
    if (!event.length) return <div className={pageStyle.card}><p className={pageStyle.stateBox}>진행 중인 이벤트가 없습니다.</p></div>;

    const visibleTabs = event.slice(startIndex, startIndex + EVENT_VIEW_COUNT);
    const current = event[emphasizeIndex];

    return (
        <div className={pageStyle.card}>
            <h2 className={pageStyle.cardTitle}>이벤트</h2>
            <a onClick={e => { e.preventDefault(); openExternal(current.Link); }} style={{ cursor: 'pointer' }}>
                <img src={current.Thumbnail} alt={current.Title} className={style.thumbnail} />
            </a>
            <div className={style.navRow}>
                <button className={style.navBtn} onClick={goPrev}><SlArrowLeft /></button>
                <div className={style.tabList}>
                    {visibleTabs.map((ev, i) => {
                        const actualIdx = startIndex + i;
                        return (
                            <button
                                key={ev.Link}
                                className={`${style.tab} ${emphasizeIndex === actualIdx ? style.active : ''}`}
                                onClick={e => selectTab(e, actualIdx)}
                                title={ev.Title}
                            >
                                {ev.Title}
                            </button>
                        );
                    })}
                </div>
                <button className={style.navBtn} onClick={goNext}><SlArrowRight /></button>
            </div>
        </div>
    );
};

export default EventComponent;
