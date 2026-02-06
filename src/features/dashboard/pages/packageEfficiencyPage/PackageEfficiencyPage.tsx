import { useState, useMemo } from 'react';
import style from './style/PackageEfficiencyPage.module.css';

// 임시 아이템 타입 (나중에 API 응답 타입으로 대체)
interface PackageItem {
    name: string;
    quantity: number;
    price: number; // 개당 골드 가격
    totalValue: number;
}

const PackageEfficiencyPage = () => {
    // 1. 상태 관리
    const [items, setItems] = useState<PackageItem[]>([]); // 패키지에 포함된 아이템 목록
    const [newItemName, setNewItemName] = useState(''); // 새로 추가할 아이템 이름
    const [newItemQuantity, setNewItemQuantity] = useState(1); // 새로 추가할 아이템 수량

    // 패키지 가격 상태
    const [packagePrice, setPackagePrice] = useState(55000); // 현금 가격 (원)
    
    // 로아샵 크리스탈 <-> 골드 교환 비율 (임시값, 나중에 API로 가져올 수 있음)
    const [crystalRate, setCrystalRate] = useState(2500); // 100 크리스탈 당 골드

    // 2. 총 가치 계산
    const totalGoldValue = useMemo(() => {
        return items.reduce((sum, item) => sum + item.totalValue, 0);
    }, [items]);

    // 현금 가격을 골드 가치로 환산 (55000원 -> 1100 크리스탈 -> 골드)
    const priceInGold = useMemo(() => {
        const crystals = (packagePrice / 500); // 500원당 10 크리스탈 가정
        return (crystals / 100) * crystalRate;
    }, [packagePrice, crystalRate]);

    // 효율 계산
    const efficiency = useMemo(() => {
        if (priceInGold === 0) return 0;
        return (totalGoldValue / priceInGold) * 100;
    }, [totalGoldValue, priceInGold]);


    // 3. 아이템 추가 핸들러
    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || newItemQuantity <= 0) return;

        // TODO: 나중에 이 부분에서 실제 거래소 API를 호출하여 아이템 시세를 가져옵니다.
        // const price = await window.lostarkAPI.getMarketItemPrice(newItemName);
        const dummyPrice = Math.floor(Math.random() * 100) + 10; // 임시 가격 (10 ~ 110 골드)

        const newItem: PackageItem = {
            name: newItemName,
            quantity: newItemQuantity,
            price: dummyPrice,
            totalValue: newItemQuantity * dummyPrice,
        };

        setItems(prevItems => [...prevItems, newItem]);
        setNewItemName('');
        setNewItemQuantity(1);
    };

    // 4. 아이템 삭제 핸들러
    const handleRemoveItem = (index: number) => {
        setItems(prevItems => prevItems.filter((_, i) => i !== index));
    };

    return (
        <div className={style.pageLayout}>
            <h1>패키지 효율 계산기</h1>

            <div className={style.configSection}>
                <div className={style.configItem}>
                    <label>패키지 가격 (원)</label>
                    <input 
                        type="number"
                        value={packagePrice}
                        onChange={(e) => setPackagePrice(Number(e.target.value))}
                    />
                </div>
                <div className={style.configItem}>
                    <label>크리스탈 시세 (100개당 골드)</label>
                    <input 
                        type="number"
                        value={crystalRate}
                        onChange={(e) => setCrystalRate(Number(e.target.value))}
                    />
                </div>
            </div>

            <form className={style.addItemForm} onSubmit={handleAddItem}>
                <input 
                    type="text"
                    placeholder="아이템 이름"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                />
                <input 
                    type="number"
                    min="1"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                />
                <button type="submit">아이템 추가</button>
            </form>

            <div className={style.itemList}>
                {items.map((item, index) => (
                    <div key={index} className={style.itemRow}>
                        <span>{item.name} x {item.quantity}</span>
                        <div className={style.itemValue}>
                            <span>{item.totalValue.toLocaleString()} G</span>
                            <button onClick={() => handleRemoveItem(index)}>X</button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className={style.resultSection}>
                <div className={style.resultItem}>
                    <span className={style.label}>패키지 가격 (골드 환산)</span>
                    <span className={style.value}>{priceInGold.toLocaleString()} G</span>
                </div>
                 <div className={style.resultItem}>
                    <span className={style.label}>내용물 총 가치</span>
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