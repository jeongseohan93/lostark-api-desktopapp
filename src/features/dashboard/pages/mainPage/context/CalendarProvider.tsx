import { ReactNode, useMemo, useState, useEffect } from 'react';
import { CalendarContext } from './CalendarContext';
import { CalendarEvent } from '../types/Lostark.types';
import { getContentInfo } from '../../../../../shared/api/IpcMainPage';

function scheduleEventNotifications(events: CalendarEvent[]) {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission();

    const now = Date.now();
    const timers: ReturnType<typeof setTimeout>[] = [];

    const addTimer = (name: string, isoTime: string) => {
        const start = new Date(isoTime).getTime();
        const notices = [
            { delta: 10 * 60 * 1000, label: '10분 후 시작!' },
            { delta: 1 * 60 * 1000,  label: '1분 후 시작!' },
        ];
        for (const { delta, label } of notices) {
            const fireAt = start - delta;
            if (fireAt > now) {
                timers.push(setTimeout(() => {
                    if (Notification.permission === 'granted') {
                        new Notification(`⚔️ ${name}`, { body: label });
                    }
                }, fireAt - now));
            }
        }
    };

    for (const event of events) {
        if (!event.StartTimes) continue;
        for (const t of event.StartTimes) addTimer(event.ContentsName, t);
    }

    return () => timers.forEach(clearTimeout);
}

/**
 * @interface CalendarProviderProps
 * @description CalendarProvider 컴포넌트의 props 타입 정의
 */
interface CalendarProviderProps {
    /** Provider가 감싸게 될 자식 컴포넌트 */
    children: ReactNode;
}

/**
 * @description 애플리케이션에 캘린더 관련 데이터를 제공하는 Context Provider 컴포넌트
 * 컴포넌트 마운트 시 Main Process로부터 캘린더 데이터를 비동기적으로 가져오고,
 * '오늘' 날짜에 해당하는 이벤트(모험 섬, 필드보스 등)를 필터링하여 하위 컴포넌트에 제공
 * @param {CalendarProviderProps} props - Provider 컴포넌트의 props 객체
 */
export const CalendarProvider = ({ children }: CalendarProviderProps) => {
    // --- 상태 관리(state management) ---
    const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]); // API로부터 받아온 모든 이벤트 원본 배열
    const [loading, setLoading] = useState<boolean>(true); // 데이터 로딩 상태
    const [error, setError] = useState<string | null>(null); // 데이터 fetching 중 발생한 에러 메시지

    /**
     * @description 컴포넌트가 처음 마운트될 때, Main Process로부터 캘린더 데이터 조회를 한 번만 요청
     */
    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const result = await getContentInfo();
                // IPC 통신을 통해 캘린더 데이터를 비동기적으로 가져옴
                if (result && Array.isArray(result)) {
                    setAllEvents(result);
                } else {
                    setAllEvents([]); // 예기치 않은 타입의 결과가 올 경우 빈 배열로 초기화
                }
            } catch (err) {
                // 에러 발생 시 에러 상태를 업데이트하고, 이벤트 배열을 비웁니다.
                if (err instanceof Error) setError(err.message);
                setAllEvents([]);
            } finally {
                // 성공/실패 여부와 관계없이 로딩 상태를 종료
                setLoading(false);
            }
        };
        fetchCalendarData();
    }, []); // 의존성 배열이 비어 있으므로, 이 effect는 최초 렌더링 시에만 실행

    // 오늘 날짜를 YYYY-MM-DD 형식의 문자열로 미리 만들어 놓기
    // toLocaleDateString의 포맷 변환 로직이 반복되는 것을 방지
    const todayString = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').slice(0, -1);


    const adventureIslands = useMemo(
        () => allEvents.filter(event => {
            const isAdventureIsland = event.CategoryName === '모험 섬';
            // 모험 섬이 아니거나 시작 시간이 없으면 필터링에서 제외합니다.
            if (!isAdventureIsland || !event.StartTimes) return false;

            // StartTimes 배열에 오늘 날짜와 일치하는 시간이 하나라도 있는지 확인
            const isToday = event.StartTimes.some(time => 
                new Date(time).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').slice(0, -1) === todayString
            );

            return isToday;
        }),
        [allEvents, todayString] // allEvents나 todayString이 변경될 때만 재계산
    );

    /**
     * @description 필드보스 및 카오스게이트 이벤트 필터링
     * 'useMemo'를 사용하여 불필요한 재연산을 방지
     */

    const worldEvents = useMemo(
        () => {
            const todayWorldEvents = allEvents.filter(event => {
                const isWorldEvent = event.CategoryName === '필드보스' || event.CategoryName === '카오스게이트';
                if (!isWorldEvent || !event.StartTimes) return false;

                const isToday = event.StartTimes.some(time =>
                    new Date(time).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').slice(0, -1) === todayString
                );

                return isToday;
            });

            const chaosGateEvents = todayWorldEvents.filter(event => event.CategoryName === '카오스게이트');
            if (chaosGateEvents.length <= 1) return todayWorldEvents;

            const chaosGateStartTimes = Array.from(new Set(
                chaosGateEvents.flatMap(event => event.StartTimes ?? []).filter(time =>
                    new Date(time).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').slice(0, -1) === todayString
                )
            )).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

            const mergedChaosGate: CalendarEvent = {
                ...chaosGateEvents[0],
                ContentsName: '카오스게이트',
                StartTimes: chaosGateStartTimes,
            };

            let hasAddedChaosGate = false;
            return todayWorldEvents.reduce<CalendarEvent[]>((events, event) => {
                if (event.CategoryName !== '카오스게이트') {
                    events.push(event);
                    return events;
                }

                if (!hasAddedChaosGate) {
                    events.push(mergedChaosGate);
                    hasAddedChaosGate = true;
                }

                return events;
            }, []);
        },
        [allEvents, todayString]
    );

    // 이벤트 데이터가 로드되면 알림 타이머 설정
    useEffect(() => {
        if (!allEvents.length) return;
        const cleanup = scheduleEventNotifications(allEvents);
        return cleanup;
    }, [allEvents]);

    // Context에 제공할 최종 값 객체
    const value = {
        loading,
        error,
        adventureIslands,
        worldEvents
    };

    // CalendarContext.Provider를 통해 `value`를 하위 컴포넌트에 제공
    // 이제 이 Provider로 감싸진 모든 컴포넌트는 `useCalendar` 훅을 통해 'value'에 접근
    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
};