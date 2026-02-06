import { useState, useEffect } from 'react';
import { LostArkEvent } from '../types/Lostark.types';
import { getEvent } from '../../../../../shared/api/IpcMainPage';

/**
 * @interface UseEventReturn
 * @description `useEvent` 훅이 반환하는 객체의 타입 정의
 */
interface UseEventReturn {
    /** API로부터 받아온 이벤트 데이터 배열 */
    event: LostArkEvent[];
    /** 데이터 fetching 상태(true: 로딩 중, false: 로딩 완료) */
    loading: boolean;
    /** 데이터 fetchting 중 발생한 에러 메시지, 에러가 없으면 null */
    error: string | null;
}

/**
 * @description Lost Ark 이벤트 데이터를 Main Process로부터 비동기적으로 가져오는 커스텀 훅
 * 데이터 fetching, 로딩 상태, 에러 상태 관리를 모두 캡슐화하여 UI 컴포넌트의 로직을 단순히
 * @returns {UseEventReturn} 이벤트 데이터 배열, 로딩 상태, 에러 상태를 포함하는 객체 반환
 */
export const useEvent = (): UseEventReturn => {
    // --- 상태 관리(state management) ---
    const [ event, setEvent ] = useState<LostArkEvent[]>([]); // 이벤트 데이터를 저장하는 상태
    const [ loading, setLoading ] = useState<boolean>(true); // 로딩 상태
    const [ error, setError ] = useState<string | null>(null); // 에러 상태 
    
    /**
     * @description 컴포넌트가 처음 마운트될 때, 이벤트 데이터를 한 번만 요청
     */
    useEffect(() => {
        const fetchEvent = async() => {
            try{
                // IPC 통신을 통해 이벤트 데이터를 비동기적으로 가져옵니다.
                const result = await getEvent();
                if(result){
                    setEvent(result);
                }
            } catch (err) {
                // `getEvent` 함수에서 throw된 에러를 처리
                if(err instanceof Error) {
                    setError(err.message);
                }
            } finally {
                // 성공/실패 여부와 관계없이 로딩 상태를 종료
                setLoading(false);
            }
        };
        fetchEvent();
    }, []); // 의존성 배열이 비어 있으므로, 최초 렌더링 시에만 실행

    // 훅을 사용하는 컴포넌트에게 현재 상태(데이터, 로딩, 에러)를 반환
    return { event, loading, error};
}