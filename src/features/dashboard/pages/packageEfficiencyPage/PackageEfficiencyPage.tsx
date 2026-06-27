import { useState, useMemo } from 'react';
import { searchMarketItems } from '../../../../shared/api/IpcMarket';
import style from './style/PackageEfficiencyPage.module.css';

interface PackageItem {
    name: string;
    quantity: number;
    price: number;
    totalValue: number;
}

const PackageEfficiencyPage = () => {
    const [items, setItems] = useState<PackageItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [packagePrice, setPackagePrice] = useState(55000);
    const [crystalRate, setCrystalRate] = useState(2500);
    const [priceLoading, setPriceLoading] = useState(false);

    const totalGoldValue = useMemo(
        () => items.reduce((sum, item) => sum + item.totalValue, 0),
        [items]
    );

    const priceInGold = useMemo(() => {
        const crystals = packagePrice / 50;
        return (crystals / 100) * crystalRate;
    }, [packagePrice, crystalRate]);

    const efficiency = useMemo(() => {
        if (priceInGold === 0) return 0;
        return (totalGoldValue / priceInGold) * 100;
    }, [totalGoldValue, priceInGold]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim() || newItemQuantity <= 0) return;

        setPriceLoading(true);
        try {
            const res = await searchMarketItems({ ItemName: newItemName.trim(), PageNo: 1 });
            if (!res.Items || res.Items.length === 0) {
                alert(`"${newItemName}" 아이템을 거래소에서 찾을 수 없습니다.`);
                return;
            }
            const found = res.Items[0];
            const price = found.CurrentMinPrice;

            setItems(prev => [...prev, {
                name: found.Name,
                quantity: newItemQuantity,
                price,
                totalValue: newItemQuantity * price,
            }]);
            setNewItemName('');
            setNewItemQuantity(1);
        } catch (e: unknown) {
            alert(`시세 조회 실패: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setPriceLoading(false);
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={style.pageLayout}>
            <h1>패키지 효율 계산기</h1>

            <div className={style.configSection}>
                <div className={style.configItem}>
                    <label>패키지 가격 (원)</label>
                    <input
                        type='number'
                        value={packagePrice}
                        onChange={e => setPackagePrice(Number(e.target.value))}
                    />
                </div>
                <div className={style.configItem}>
                    <label>크리스탈 시세 (100개당 골드)</label>
                    <input
                        type='number'
                        value={crystalRate}
                        onChange={e => setCrystalRate(Number(e.target.value))}
                    />
                </div>
            </div>

            <form className={style.addItemForm} onSubmit={handleAddItem}>
                <input
                    type='text'
                    placeholder='거래소 아이템 이름 (정확하게 입력)'
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    disabled={priceLoading}
                />
                <input
                    type='number'
                    min='1'
                    value={newItemQuantity}
                    onChange={e => setNewItemQuantity(Number(e.target.value))}
                    disabled={priceLoading}
                />
                <button type='submit' disabled={priceLoading}>
                    {priceLoading ? '시세 조회 중...' : '아이템 추가'}
                </button>
            </form>

            <div className={style.itemList}>
                {items.map((item, index) => (
                    <div key={index} className={style.itemRow}>
                        <span>{item.name} × {item.quantity}</span>
                        <div className={style.itemValue}>
                            <span>{item.price.toLocaleString()} G × {item.quantity} = </span>
                            <span>{item.totalValue.toLocaleString()} G</span>
                            <button onClick={() => handleRemoveItem(index)}>×</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={style.resultSection}>
                <div className={style.resultItem}>
                    <span className={style.label}>패키지 가격 (골드 환산)</span>
                    <span className={style.value}>{Math.round(priceInGold).toLocaleString()} G</span>
                </div>
                <div className={style.resultItem}>
                    <span className={style.label}>내용물 총 가치 (거래소 최저가 기준)</span>
                    <span className={style.value}>{totalGoldValue.toLocaleString()} G</span>
                </div>
                <div className={style.resultItem}>
                    <span className={style.label}>효율</span>
                    <span className={`${style.value} ${efficiency >= 100 ? style.profit : style.loss}`}>
                        {efficiency.toFixed(1)} %
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PackageEfficiencyPage;
