import { ipcMain } from 'electron';
import { LostArkApiClient } from '../core/lostArkApiClient';
import { getApiKey } from '../core/apiKeyManagement';

// LostArkApiClient 인스턴스를 저장하기 위한 변수
// 앱 전체에서 단 하나의 API 클라이언트 인스턴스를 유지하기 위해 모듈 스코프에 선언
// 초기에는 클라이언트가 없으므로 null로 설정, 초기화 성공 시 인스턴스 할당(객체를 만들어 메모리에 할당)
let apiClient: LostArkApiClient | null = null;

// 저장된 API키를 사용하여 LostArkApiClient를 초기화하는 함수
// 앱이 시작될 때 호출되는 API를 사용할 준비
// 초기화 성공 여부를 boolean 값으로 반환
export const initializeApiClient = async () => {
    try { 

        // apiKeyMangement.ts에 정의된 함수를 통해 저장된 API 키를 비동기적으로 'apiKey' 상수에 할당
        const apiKey = await getApiKey();

        // 가져온 API 키를 사용하여 LostArkApiClient의 새 인스턴스를 생성
        apiClient = new LostArkApiClient(apiKey);
        console.log('로스트아크api 클라이언트 초기화 완');

        // 초기화 성공 시 true를 반환
        return true;
    } catch (error) {

        // API 키를 가져오거나 클라이언트 생성 중 오류가 발생하면 catch 블록 실행
        console.error('🚨 로스트아크 API 클라이언트 초기화 실패:', error);

        // 실패 시 apiClient를 다시 null로 설정, 잘못된 클라이언트가 사용되는 것 방지
        apiClient = null; 
        
        // 초기화 실패 시 false반환
        return false;
    }
}

const requireClient = () => {
    if (!apiClient) throw new Error('API 클라이언트가 준비되지 않았습니다. API 키를 확인해주세요.');
    return apiClient;
};

export const registerLostArkApiHandlers = async () => {
    await initializeApiClient();

    ipcMain.handle('get:lostark-api-notices', () => requireClient().getNotice());
    ipcMain.handle('get:lostark-api-events', () => requireClient().getEvents());
    ipcMain.handle('get:lostark-api-calendar', () => requireClient().getCalendar());
}

