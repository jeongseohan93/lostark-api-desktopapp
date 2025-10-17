import { createContext, useContext } from 'react';
import { CalendarEvent } from '../types/Lostark.types';

/**
 * @interface CalendarContextType
 * @description CalendarContext를 통해 컴포넌트들에게 제공될 상태(state)의 타입을 정의
 */
interface CalendarContextType {
    /** 데이터 로딩 상태 (true: 로딩 중, false: 로딩 완료) */
    loading: boolean;
    /** fetching 중 발생한 에러 메시지. 에러가 없으면 null */
    error: string | null;
    /** 필터링된 모험 섬 데이터 배열 */
    adventureIslands : CalendarEvent[];
    /** 필터링된 필드보스/카오스게이트 데이터 배열 */
    worldEvents: CalendarEvent[];
}

/**
 * @description 캘린더 관련 상태를 하위 컴포넌트들에게 전파(propagate) 하기 위한 React Context 객체
 * Provider를 통해 `CalendarContextType` 형태의 값을 주입받아, `useCalendar` 훅을 통해 소비
 * 초기값으로 `undefined`를 설정하여, Provider가 없는 경우를 감지할 수 있도록 합니다.
 */
export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
    // useContext 훅을 사용하여 CalendarContext의 현재 값을 가져옴
    const context = useContext(CalendarContext);

    // context가 undefined인 경우, 개발자에게 실수를 알려주기 위해 의도적으로 에러를 발생
    // 이는 이 훅이 반드시 CalendarProvider의 하위에서만 사용되어야 함을 강제하는 안전장치
    if(!context) {
        throw new Error('useCalendar는 CalendarProvider 안에서만 사용해야 합니다.')
    }

    // context가 유효한 경우 해당 값을 반환
    return context;
}