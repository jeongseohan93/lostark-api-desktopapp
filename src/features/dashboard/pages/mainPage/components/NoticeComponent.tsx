import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotices } from '../hooks/useLostArkNotice';
import { openExternal } from '../../../../../shared/api/IpcWindow';
import { LostarkNotice } from '../types/Lostark.types';
import pageStyle from '../style/MainPage.module.css';
import style from '../style/NoticeComponent.module.css';

const NOTICES_PER_PAGE = 8;

const NoticesComponent = () => {
    const { notices, loading, error } = useNotices();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;

    const currentNotice = useMemo(() => {
        if (!notices.length) return [];
        const end = currentPage * NOTICES_PER_PAGE;
        return notices.slice(end - NOTICES_PER_PAGE, end);
    }, [notices, currentPage]);

    const totalPages = Math.ceil(notices.length / NOTICES_PER_PAGE);

    const handlePageChange = (page: number) => setSearchParams({ page: page.toString() });

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
        e.preventDefault();
        openExternal(url);
    };

    return (
        <div className={pageStyle.card}>
            <h2 className={pageStyle.cardTitle}>공지사항</h2>

            {loading && <p className={pageStyle.stateBox}>불러오는 중...</p>}
            {error && <p className={`${pageStyle.stateBox} ${pageStyle.errorBox}`}>{error}</p>}

            {!loading && !error && (
                <>
                    <ul className={style.list}>
                        {currentNotice.length > 0 ? (
                            currentNotice.map((notice: LostarkNotice) => (
                                <li key={notice.Link} className={style.noticeItem}>
                                    <a
                                        href={notice.Link}
                                        className={style.noticeLink}
                                        onClick={e => handleClick(e, notice.Link)}
                                    >
                                        <span className={style.typeBadge}>{notice.Type}</span>
                                        <span className={style.title}>{notice.Title}</span>
                                        <span className={style.date}>
                                            {new Date(notice.Date).toLocaleDateString('ko-KR')}
                                        </span>
                                    </a>
                                </li>
                            ))
                        ) : (
                            <p className={pageStyle.stateBox}>표시할 공지사항이 없습니다.</p>
                        )}
                    </ul>

                    {totalPages > 1 && (
                        <div className={style.pagination}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`${style.pageBtn} ${currentPage === page ? style.activePage : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NoticesComponent;
