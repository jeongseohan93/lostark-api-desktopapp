import { useState, useMemo } from 'react';
import { searchMarketItems } from '../../../../shared/api/IpcMarket';
import style from './style/EnergyOfLifePage.module.css';

interface GatheredItem {
    name: string;
    quantity: number;
}

interface EfficiencyResult {
    id: number;
    activityName: string;
    energyUsed: number;
    totalGoldValue: number;
    goldPerEnergy: number;
}

const EnergyOfLifePage = () => {
    const [activityName, setActivityName] = useState('고고학');
    const [energyUsed, setEnergyUsed] = useState(1000);
    const [gatheredItems, setGatheredItems] = useState<GatheredItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [results, setResults] = useState<EfficiencyResult[]>([]);
    const [calculating, setCalculating] = useState(false);

    const handleAddItem = (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (!newItemName.trim() || newItemQuantity <= 0) return;
        setGatheredItems(prev => [...prev, { name: newItemName.trim(), quantity: newItemQuantity }]);
        setNewItemName('');
        setNewItemQuantity(1);
    };

    const handleRemoveItem = (index: number) => {
        setGatheredItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleCalculate = async () => {
        if (gatheredItems.length === 0 || energyUsed <= 0) {
            alert('사용한 생기와 획득 아이템을 1개 이상 추가해주세요.');
            return;
        }

        setCalculating(true);
        try {
            let totalValue = 0;
            const notFound: string[] = [];

            for (const item of gatheredItems) {
                const res = await searchMarketItems({ ItemName: item.name, PageNo: 1 });
                if (res.Items && res.Items.length > 0) {
                    totalValue += res.Items[0].CurrentMinPrice * item.quantity;
                } else {
                    notFound.push(item.name);
                }
            }

            if (notFound.length > 0) {
                alert(`다음 아이템을 거래소에서 찾지 못했습니다:\n${notFound.join(', ')}\n\n찾은 아이템만으로 계산합니다.`);
            }

            setResults(prev => [...prev, {
                id: Date.now(),
                activityName,
                energyUsed,
                totalGoldValue: totalValue,
                goldPerEnergy: totalValue / energyUsed,
            }]);
            setGatheredItems([]);
        } catch (e: unknown) {
            alert(`계산 실패: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setCalculating(false);
        }
    };

    const handleDeleteResult = (id: number) => {
        setResults(prev => prev.filter(r => r.id !== id));
    };

    const mostEfficient = useMemo(() => {
        if (results.length === 0) return null;
        return results.reduce((max, cur) => cur.goldPerEnergy > max.goldPerEnergy ? cur : max, results[0]);
    }, [results]);

    return (
        <div className={style.pageLayout}>
            <h1>생기 효율 계산기</h1>

            <div className={style.inputSection}>
                <h3>활동 기록 추가</h3>
                <div className={style.mainInputs}>
                    <input
                        type='text'
                        value={activityName}
                        onChange={e => setActivityName(e.target.value)}
                        placeholder='활동 이름 (예: 고고학)'
                        disabled={calculating}
                    />
                    <input
                        type='number'
                        value={energyUsed}
                        onChange={e => setEnergyUsed(Number(e.target.value))}
                        placeholder='사용한 생기'
                        disabled={calculating}
                    />
                </div>
                <form onSubmit={handleAddItem} className={style.addItemForm}>
                    <input
                        type='text'
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        placeholder='획득 아이템 이름 (거래소 이름 정확히)'
                        disabled={calculating}
                    />
                    <input
                        type='number'
                        value={newItemQuantity}
                        onChange={e => setNewItemQuantity(Number(e.target.value))}
                        placeholder='수량'
                        disabled={calculating}
                        min='1'
                    />
                    <button type='submit' disabled={calculating}>추가</button>
                </form>
                <div className={style.gatheredList}>
                    {gatheredItems.map((item, index) => (
                        <span
                            key={index}
                            className={style.itemTag}
                            onClick={() => handleRemoveItem(index)}
                            title='클릭하여 제거'
                        >
                            {item.name} × {item.quantity} ✕
                        </span>
                    ))}
                </div>
                <button
                    onClick={handleCalculate}
                    className={style.calculateButton}
                    disabled={calculating || gatheredItems.length === 0}
                >
                    {calculating ? '시세 조회 중...' : '계산하기'}
                </button>
            </div>

            <div className={style.resultSection}>
                <h3>효율 비교 <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 400 }}>(거래소 최저가 기준)</span></h3>
                <table className={style.resultTable}>
                    <thead>
                        <tr>
                            <th>활동</th>
                            <th>소모 생기</th>
                            <th>총 수익 (G)</th>
                            <th>생기 1당 수익 (G)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                                    아직 계산된 활동이 없습니다.
                                </td>
                            </tr>
                        ) : results.map(res => (
                            <tr key={res.id} className={res.id === mostEfficient?.id ? style.highlightRow : ''}>
                                <td>{res.activityName}{res.id === mostEfficient?.id ? ' 🏆' : ''}</td>
                                <td>{res.energyUsed.toLocaleString()}</td>
                                <td>{res.totalGoldValue.toLocaleString()}</td>
                                <td>{res.goldPerEnergy.toFixed(2)}</td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteResult(res.id)}
                                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EnergyOfLifePage;
