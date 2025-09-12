import { useState, useEffect } from "react";
import TitleBar from "./TitleBar";

// API 응답 데이터 구조에 맞는 타입 정의 (동일)
interface RewardItem {
    Name: string;
    Icon: string;
    Grade: string;
    StartTimes: string[] | null;
}
interface LevelRewardItems {
    ItemLevel: number;
    Items: RewardItem[];
}
interface ContentsCalendar {
    CategoryName: string;
    ContentsName: string;
    ContentsIcon: string;
    MinItemLevel: number;
    StartTimes: string[];
    Location: string;
    RewardItems: LevelRewardItems[];
}

const Dashboard = () => {
    const [islandData, setIslandData] = useState<ContentsCalendar[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIslandData = async () => {
            try {
                // --- 이 부분이 수정되었습니다 ---
                // window.electronAPI.getIslandInfo() 대신 ipcRenderer.invoke를 사용합니다.
                const responseData: ContentsCalendar[] = await window.ipcRenderer.invoke('get-island-info');

                const today = new Date().toISOString().slice(0, 10);
                
                const adventureIslands = responseData.filter(item => 
                    item.CategoryName === "모험 섬" &&
                    item.StartTimes && // StartTimes가 null이 아닌 경우만 필터링
                    item.StartTimes.some(startTime => 
                        startTime.startsWith(today)
                    )
                );
                
                setIslandData(adventureIslands);

            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchIslandData();
    }, []);

    const formatTimes = (times: string[] | null): string => {
        if (!times) return '시간 정보 없음';
        const formatted = times
            .filter(time => time.startsWith(new Date().toISOString().slice(0, 10)))
            .map(time => time.split('T')[1].slice(0, 5));
        
        return formatted.join('시, ') + '시';
    };

    const getItemGradeColor = (grade: string): string => {
        switch (grade) {
            case '전설': return '#ff6600';
            case '영웅': return '#9933cc';
            case '희귀': return '#3366ff';
            case '고급': return '#6699ff';
            case '일반': return '#666666';
            default: return '#000000';
        }
    };
    
    const getClearRewards = (rewardItems: LevelRewardItems[]) => {
        const today = new Date().toISOString().slice(0, 10);
        const clearRewards = rewardItems.flatMap(levelReward =>
            levelReward.Items.filter(item => 
                item.StartTimes && item.StartTimes.some(time => time.startsWith(today)) &&
                item.Name !== '전설 ~ 고급 카드 팩 III'
            )
        );
        return clearRewards;
    };

    const handleOpenSettings = () => {
        window.ipcRenderer.invoke('open-settings-window');
    }

    // --- 추가된 스타일 ---
    const dashboardContainerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    };

    const contentAreaStyle: React.CSSProperties = {
        flex: 1,
        overflowY: 'overlay', // 스크롤 바 공간 제거
    };
    // --- 여기까지 ---

    return (
        // --- 추가된 div ---
        <div style={dashboardContainerStyle}>
            <TitleBar />
            
            {/* --- 추가된 div --- */}
            <div style={contentAreaStyle}>
                {/* ▼▼▼▼▼▼ 기존 코드는 여기부터 일체 변경 없습니다 ▼▼▼▼▼▼ */}
                <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h2>오늘의 모험 섬 정보</h2>
                        <button onClick={handleOpenSettings} style={{ padding: '8px 12px', cursor: 'pointer' }}>
                                설정
                        </button>
                    </div>
                    {error && <p style={{ color: 'red' }}>오류: {error}</p>}
                    
                    {!islandData ? (
                        <p>데이터를 불러오는 중...</p>
                    ) : islandData.length > 0 ? (
                        islandData.map((island, index) => (
                            <div key={index} style={{
                                display: 'flex', alignItems: 'flex-start', marginBottom: '20px',
                                border: '1px solid #ddd', padding: '15px', borderRadius: '8px'
                            }}>
                                <img 
                                    src={island.ContentsIcon} 
                                    alt={island.ContentsName}
                                    style={{ width: '64px', height: '64px', marginRight: '20px', borderRadius: '50%' }}
                                />
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{island.ContentsName}</h3>
                                    <p style={{ margin: '0' }}>
                                        <strong style={{ color: '#007bff' }}>등장 시간:</strong> {formatTimes(island.StartTimes)}
                                    </p>
                                    <p style={{ margin: '5px 0 0 0' }}>
                                        <strong style={{ color: '#28a745' }}>최소 아이템 레벨:</strong> {island.MinItemLevel}
                                    </p>
                                    <div style={{ marginTop: '10px' }}>
                                        <strong style={{ color: '#6c757d' }}>주요 보상:</strong>
                                        <ul style={{ listStyleType: 'none', padding: 0, margin: '5px 0 0 0' }}>
                                            {getClearRewards(island.RewardItems).map((rewardItem, itemIndex) => (
                                                <li key={itemIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                                    <img 
                                                        src={rewardItem.Icon} 
                                                        alt={rewardItem.Name} 
                                                        style={{ width: '24px', height: '24px', marginRight: '8px' }}
                                                    />
                                                    <span style={{ color: getItemGradeColor(rewardItem.Grade) }}>
                                                        {rewardItem.Name} ({rewardItem.Grade})
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>오늘 예정된 모험 섬이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;