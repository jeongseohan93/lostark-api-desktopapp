import { useState, useMemo } from 'react';
import style from './style/EnergyOfLifePage.module.css';

// 획득 아이템 타입
interface GatheredItem {
    name: string;
    quantity: number;
}

// 계산 결과 타입
interface EfficiencyResult {
    id: number;
    activityName: string;
    energyUsed: number;
    totalGoldValue: number;
    goldPerEnergy: number;
}

const EnergyOfLifePage = () => {
    // 1. 상태 관리
    // 입력 폼을 위한 상태
    const [activityName, setActivityName] = useState('고고학');
    const [energyUsed, setEnergyUsed] = useState(1000);
    const [gatheredItems, setGatheredItems] = useState<GatheredItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    
    // 최종 계산 결과 목록
    const [results, setResults] = useState<EfficiencyResult[]>([]);

    // 2. 핸들러 함수들
    // 획득 아이템 목록에 아이템 추가
    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || newItemQuantity <= 0) return;
        setGatheredItems(prev => [...prev, { name: newItemName, quantity: newItemQuantity }]);
        setNewItemName('');
        setNewItemQuantity(1);
    };

    // 메인 계산 실행 함수
    const handleCalculate = async () => {
        if (gatheredItems.length === 0 || energyUsed <= 0) {
            alert('사용한 생기와 획득 아이템을 1개 이상 추가해주세요.');
            return;
        }

        let totalValue = 0;
        for (const item of gatheredItems) {
            // TODO: 실제 거래소 API를 호출하여 아이템 시세 가져오기
            // const price = await window.lostarkAPI.getMarketItemPrice(item.name);
            const dummyPrice = Math.floor(Math.random() * 20) + 1; // 1 ~ 20 골드 임시 가격
            totalValue += item.quantity * dummyPrice;
        }

        const newResult: EfficiencyResult = {
            id: Date.now(),
            activityName: activityName,
            energyUsed: energyUsed,
            totalGoldValue: totalValue,
            goldPerEnergy: totalValue / energyUsed,
        };

        setResults(prev => [...prev, newResult]);
        // 입력 폼 초기화
        setGatheredItems([]);
    };

    // 가장 효율이 좋은 항목을 찾기 위한 useMemo
    const mostEfficient = useMemo(() => {
        if (results.length === 0) return null;
        return results.reduce((max, current) => current.goldPerEnergy > max.goldPerEnergy ? current : max, results[0]);
    }, [results]);

    return (
        <div className={style.pageLayout}>
            <h1>생기 효율 계산기</h1>

            <div className={style.inputSection}>
                <h3>활동 기록 추가</h3>
                <div className={style.mainInputs}>
                    <input type="text" value={activityName} onChange={e => setActivityName(e.target.value)} placeholder="활동 이름 (예: 고고학)"/>
                    <input type="number" value={energyUsed} onChange={e => setEnergyUsed(Number(e.target.value))} placeholder="사용한 생기" />
                </div>
                <form onSubmit={handleAddItem} className={style.addItemForm}>
                    <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="획득 아이템 이름" />
                    <input type="number" value={newItemQuantity} onChange={e => setNewItemQuantity(Number(e.target.value))} placeholder="수량" />
                    <button type="submit">추가</button>
                </form>
                <div className={style.gatheredList}>
                    {gatheredItems.map((item, index) => (
                        <span key={index} className={style.itemTag}>{item.name} x {item.quantity}</span>
                    ))}
                </div>
                <button onClick={handleCalculate} className={style.calculateButton}>계산하기</button>
            </div>

            <div className={style.resultSection}>
                <h3>효율 비교</h3>
                <table className={style.resultTable}>
                    <thead>
                        <tr>
                            <th>활동</th>
                            <th>소모 생기</th>
                            <th>총 수익 (G)</th>
                            <th>생기 1당 수익 (G)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map(res => (
                            <tr key={res.id} className={res.id === mostEfficient?.id ? style.highlightRow : ''}>
                                <td>{res.activityName}</td>
                                <td>{res.energyUsed.toLocaleString()}</td>
                                <td>{res.totalGoldValue.toLocaleString()}</td>
                                <td>{res.goldPerEnergy.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EnergyOfLifePage;