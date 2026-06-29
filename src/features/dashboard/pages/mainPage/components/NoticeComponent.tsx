import { type MouseEvent } from 'react';
import { FiChevronRight, FiStar } from 'react-icons/fi';
import { useNotices } from '../hooks/useLostArkNotice';
import { openExternal } from '../../../../../shared/api/IpcWindow';
import { LostarkNotice } from '../types/Lostark.types';
import pageStyle from '../style/MainPage.module.css';
import style from '../style/NoticeComponent.module.css';

const NOTICE_VIEW_COUNT = 8;
const NOTICE_LIST_URL = 'https://lostark.game.onstove.com/News/Notice/List';

const NoticesComponent = () => {
    const { notices, loading, error } = useNotices();
    const currentNotice = notices.slice(0, NOTICE_VIEW_COUNT);

    const handleClick = (e: MouseEvent<HTMLAnchorElement>, url: string) => {
        e.preventDefault();
        openExternal(url);
    };

    return (
        <div className={`${pageStyle.card} ${style.noticeCard}`}>
            <div className={style.headerRow}>
                <h2 className={pageStyle.cardTitle}>공지사항</h2>
                <a
                    href={NOTICE_LIST_URL}
                    className={style.moreLink}
                    onClick={e => handleClick(e, NOTICE_LIST_URL)}
                >
                    전체보기
                    <FiChevronRight />
                </a>
            </div>

            {loading && <p className={pageStyle.stateBox}>불러오는 중...</p>}
            {error && <p className={`${pageStyle.stateBox} ${pageStyle.errorBox}`}>{error}</p>}

            {!loading && !error && (
                currentNotice.length > 0 ? (
                    <ul className={style.list}>
                        {currentNotice.map((notice: LostarkNotice) => (
                            <li key={notice.Link} className={style.noticeItem}>
                                <a
                                    href={notice.Link}
                                    className={style.noticeLink}
                                    onClick={e => handleClick(e, notice.Link)}
                                >
                                    <FiStar className={style.noticeIcon} />
                                    <span className={style.noticeBody}>
                                        <span className={style.title}>{notice.Title}</span>
                                        <span className={style.meta}>
                                            <span>{notice.Type}</span>
                                            <span>{new Date(notice.Date).toLocaleDateString('ko-KR')}</span>
                                        </span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={pageStyle.stateBox}>표시할 공지사항이 없습니다.</p>
                )
            )}
        </div>
    );
};

export default NoticesComponent;
