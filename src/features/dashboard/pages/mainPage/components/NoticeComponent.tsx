import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotices } from "../hooks/useLostArkNotice";
import { openExternal } from "../../../../../shared/api/IpcWindow";
import { LostarkNotice } from "../types/Lostark.types";

const NoticesComponent = () => {

  const { notices, loading, error } = useNotices();

  const [ searchParams, setSearchParams ] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const noticesPerPage = 8;

  /**
   * @description 현재 페이지에 보여줄 공지사항 목록을 계산
   * useMemo를 사용하여 `notices`나 currentPage`가 변경될 때만 재계산하도록 성능 최적화
   */

  const currentNotice = useMemo(() => {
    if(notices.length === 0) return [];

    const indexOfLastNotice = currentPage * noticesPerPage;
    const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;

    return notices.slice(indexOfFirstNotice, indexOfLastNotice);
  }, [notices, currentPage]);

  const handlePageChange = (pageNumber: number) => {
    setSearchParams({page: pageNumber.toString()});
  }

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, url: string ) => {

    event.preventDefault();

    openExternal(url);
  }

  if(loading) {
    return (
      <div>
        <p>공지사항 불러오는 중...</p>
      </div>
    )
  }

  if(error) {
    return (
      <div>
        <h2>공지사항</h2>
        <p>오류가 발생 : {error}</p>
      </div>
    )
  }

  const totalPages = Math.ceil(notices.length / noticesPerPage); 

  return (
    <div>
      <h2>공지사항</h2>
      <ul> 
        {currentNotice.length > 0 ? (
          currentNotice.map((notice: LostarkNotice) => (
            <li>
              <a
                href={notice.Link}
                onClick={(e) => handleLinkClick(e, notice.Link)}
              >
                <span>{notice.Title}</span>
                <span>
                  {new Date(notice.Date).toDateString()}
                </span>
              </a>

            </li>
          ))
        ) : (
          <p>표시할 공지사항이 없습니다.</p>
        )}
      </ul>

      <div>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>
    </div>
  )
}

export default NoticesComponent;