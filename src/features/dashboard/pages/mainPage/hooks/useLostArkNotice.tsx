import { useState, useEffect} from 'react';
import { LostarkNotice } from '../types/Lostark.types';
import { getNotice } from '../../../../../shared/api/IpcMainPage';

/**
 * @interface UseNoticesReturn
 * @description useNotices 훅의 반환 타입을 정의합니다.
 */
interface UseNoticesReturn {
    /** API로부터 받아온 공지사항 데이터 배열 */
    notices: LostarkNotice[];
    /** 데이터 fetching 상태(true: 로딩 중, false: 로딩 완료) */
    loading: boolean;
    /** 데이터 fetching 중 발생한 에러 메시지. 에러가 없으면 null */
    error: string | null;
}

/**
 * @description 로스트아크 공지사항 데이터를 비동기적으로 가져오는 커스텀 훅
 * 데이터 fetching, 로딩, 에러 상태 관리를 모두 캡슐화
 * @returns { UseNoticesReturn } 공지사항 데이터, 로딩 상태, 에러 메시지를 포함하는 객체
 */
export const useNotices = (): UseNoticesReturn => {
    // --- 상태 관리(State Management) ---
    const [ notices, setNotices ] = useState<LostarkNotice[]>([]); // 공지사항 데이터를 저장하는 상태
    const [ loading, setLoading ] = useState<boolean>(true); // 로딩 상태 
    const [ error, setError ] = useState<string | null>(null); // 에러 상태

    /**
     * @description 컴포넌트가 처음 마운트될 때, 공지사항 데이터를 한 번만 요청
     */
    useEffect(() => {
        const fetchNotice = async () => {
            try{
                // IPC 통신을 통해 공지사항 데이터를 비동기적으로 가져옴
                const result = await getNotice();
                if(result) {
                    setNotices(result);
                }
            } catch (err) {
                // `getNotice` 함수에서 throw된 에러를 처리
                if(err instanceof Error) {
                    setError(err.message);
                }
            } finally {
                // 성공/싶래 여부와 관계없이 로딩 상태를 종료
                setLoading(false);
            }
        };
        fetchNotice();
    }, []); // 의존성 배열이 비어 있으므로, 최초 렌더링 시에만 실행

    // 훅을 사용하는 컴포넌트에게 현재 상태(데이터, 로딩, 에러)를 반환 
    return { notices, loading, error};
}