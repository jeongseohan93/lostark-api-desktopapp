import { useMemo, useState } from 'react';
import { searchMarketItems } from '../../../../shared/api/IpcMarket';
import style from './style/AbidosFusionPage.module.css';

interface MaterialInput {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const initialMaterials: MaterialInput[] = [
  { id: crypto.randomUUID(), name: '아비도스 유물', quantity: 20, price: 0 },
  { id: crypto.randomUUID(), name: '희귀한 유물', quantity: 40, price: 0 },
  { id: crypto.randomUUID(), name: '영롱한 생명의 돌파석', quantity: 1, price: 0 },
];

const toNumber = (value: string) => {
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const AbidosFusionPage = () => {
  const [fusionItemName, setFusionItemName] = useState('아비도스 융화 재료');
  const [targetQuantity, setTargetQuantity] = useState(100);
  const [marketPrice, setMarketPrice] = useState(0);
  const [craftYield, setCraftYield] = useState(10);
  const [craftFee, setCraftFee] = useState(0);
  const [greatSuccessRate, setGreatSuccessRate] = useState(0);
  const [energyUsed, setEnergyUsed] = useState(3000);
  const [materials, setMaterials] = useState<MaterialInput[]>(initialMaterials);
  const [loadingName, setLoadingName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const materialTotal = useMemo(
    () => materials.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [materials],
  );

  const result = useMemo(() => {
    const expectedYield = craftYield * (1 + greatSuccessRate / 100);
    const craftsNeeded = expectedYield > 0 ? targetQuantity / expectedYield : 0;
    const directBuyCost = targetQuantity * marketPrice;
    const directCraftCost = craftsNeeded * (materialTotal + craftFee);
    const savedGold = directBuyCost - directCraftCost;
    const goldPerEnergy = energyUsed > 0 ? savedGold / energyUsed : 0;

    return {
      expectedYield,
      craftsNeeded,
      directBuyCost,
      directCraftCost,
      savedGold,
      goldPerEnergy,
    };
  }, [craftFee, craftYield, energyUsed, greatSuccessRate, marketPrice, materialTotal, targetQuantity]);

  const updateMaterial = (id: string, patch: Partial<MaterialInput>) => {
    setMaterials(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addMaterial = () => {
    setMaterials(prev => [...prev, { id: crypto.randomUUID(), name: '', quantity: 1, price: 0 }]);
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(item => item.id !== id));
  };

  const fetchMarketPrice = async (name: string, onPrice: (price: number) => void) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoadingName(trimmed);
    setMessage(null);
    try {
      const res = await searchMarketItems({ ItemName: trimmed, PageNo: 1 });
      const found = res.Items?.find(item => item.Name === trimmed) ?? res.Items?.[0];
      if (!found) {
        setMessage(`${trimmed} 거래소 시세를 찾지 못했습니다.`);
        return;
      }
      onPrice(found.CurrentMinPrice);
      setMessage(`${found.Name} 최저가 ${found.CurrentMinPrice.toLocaleString()}G를 반영했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingName(null);
    }
  };

  const isCraftBetter = result.savedGold > 0;

  return (
    <div className={style.page}>
      <header className={style.header}>
        <div>
          <h2 className={style.title}>아비도스 융화 효율</h2>
          <p className={style.subtitle}>거래소 구매와 직접 생활/제작 비용을 비교합니다.</p>
        </div>
        <div className={`${style.recommendBadge} ${isCraftBetter ? style.good : style.bad}`}>
          {isCraftBetter ? '직접 제작 우세' : '거래소 구매 우세'}
        </div>
      </header>

      <div className={style.summaryGrid}>
        <div className={style.summaryCard}>
          <span className={style.summaryLabel}>거래소 구매</span>
          <strong>{Math.round(result.directBuyCost).toLocaleString()} G</strong>
        </div>
        <div className={style.summaryCard}>
          <span className={style.summaryLabel}>직접 제작</span>
          <strong>{Math.round(result.directCraftCost).toLocaleString()} G</strong>
        </div>
        <div className={style.summaryCard}>
          <span className={style.summaryLabel}>차이</span>
          <strong className={isCraftBetter ? style.positive : style.negative}>
            {Math.round(result.savedGold).toLocaleString()} G
          </strong>
        </div>
        <div className={style.summaryCard}>
          <span className={style.summaryLabel}>생기 1당</span>
          <strong>{result.goldPerEnergy.toFixed(2)} G</strong>
        </div>
      </div>

      <div className={style.contentGrid}>
        <section className={style.panel}>
          <h3 className={style.panelTitle}>완성품 기준</h3>
          <div className={style.fieldGrid}>
            <label className={style.fieldWide}>
              <span>융화 재료명</span>
              <div className={style.inlineInput}>
                <input value={fusionItemName} onChange={e => setFusionItemName(e.target.value)} />
                <button
                  type="button"
                  onClick={() => fetchMarketPrice(fusionItemName, setMarketPrice)}
                  disabled={loadingName === fusionItemName.trim()}
                >
                  시세
                </button>
              </div>
            </label>
            <label>
              <span>필요 수량</span>
              <input type="number" min={1} value={targetQuantity} onChange={e => setTargetQuantity(toNumber(e.target.value))} />
            </label>
            <label>
              <span>거래소 단가</span>
              <input type="number" min={0} value={marketPrice} onChange={e => setMarketPrice(toNumber(e.target.value))} />
            </label>
            <label>
              <span>1회 제작 수량</span>
              <input type="number" min={1} value={craftYield} onChange={e => setCraftYield(toNumber(e.target.value))} />
            </label>
            <label>
              <span>제작 수수료</span>
              <input type="number" min={0} value={craftFee} onChange={e => setCraftFee(toNumber(e.target.value))} />
            </label>
            <label>
              <span>대성공 기대값 (%)</span>
              <input type="number" min={0} value={greatSuccessRate} onChange={e => setGreatSuccessRate(toNumber(e.target.value))} />
            </label>
            <label>
              <span>사용 생기</span>
              <input type="number" min={0} value={energyUsed} onChange={e => setEnergyUsed(toNumber(e.target.value))} />
            </label>
          </div>
          {message && <p className={style.message}>{message}</p>}
        </section>

        <section className={style.panel}>
          <div className={style.panelHeader}>
            <h3 className={style.panelTitle}>직접 생활 재료</h3>
            <button type="button" className={style.addButton} onClick={addMaterial}>재료 추가</button>
          </div>
          <div className={style.materialList}>
            {materials.map(item => (
              <div key={item.id} className={style.materialRow}>
                <input
                  className={style.materialName}
                  value={item.name}
                  placeholder="재료명"
                  onChange={e => updateMaterial(item.id, { name: e.target.value })}
                />
                <input
                  type="number"
                  min={0}
                  value={item.quantity}
                  onChange={e => updateMaterial(item.id, { quantity: toNumber(e.target.value) })}
                  aria-label="필요 수량"
                />
                <input
                  type="number"
                  min={0}
                  value={item.price}
                  onChange={e => updateMaterial(item.id, { price: toNumber(e.target.value) })}
                  aria-label="단가"
                />
                <button
                  type="button"
                  onClick={() => fetchMarketPrice(item.name, price => updateMaterial(item.id, { price }))}
                  disabled={loadingName === item.name.trim()}
                >
                  시세
                </button>
                <button type="button" className={style.removeButton} onClick={() => removeMaterial(item.id)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={style.breakdown}>
        <div>
          <span>예상 제작 횟수</span>
          <strong>{result.craftsNeeded.toFixed(2)}회</strong>
        </div>
        <div>
          <span>대성공 반영 1회 기대 수량</span>
          <strong>{result.expectedYield.toFixed(2)}개</strong>
        </div>
        <div>
          <span>1회 재료 원가</span>
          <strong>{materialTotal.toLocaleString()} G</strong>
        </div>
        <div>
          <span>기회비용 반영</span>
          <strong>재료를 팔았을 때의 골드 기준</strong>
        </div>
      </section>
    </div>
  );
};

export default AbidosFusionPage;
