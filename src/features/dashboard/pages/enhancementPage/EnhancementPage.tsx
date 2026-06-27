import { useState, useMemo, useCallback } from 'react';
import { ENHANCEMENT_TABLE, expectedAttempts } from './data/enhancementData';
import { searchMarketItems } from '../../../../shared/api/IpcMarket';
import style from './style/EnhancementPage.module.css';

interface Prices { [marketName: string]: number; }

const EnhancementPage = () => {
    const [fromLevel, setFromLevel] = useState(14);
    const [toLevel, setToLevel] = useState(17);
    const [prices, setPrices] = useState<Prices>({});
    const [manualPrices, setManualPrices] = useState<Prices>({});
    const [fetching, setFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const levels = useMemo(() => ENHANCEMENT_TABLE.slice(fromLevel, toLevel), [fromLevel, toLevel]);

    const getPrice = (name: string) => manualPrices[name] ?? prices[name] ?? 0;

    const fetchPrices = useCallback(async () => {
        setFetching(true);
        setFetchError(null);
        const needed = [...new Set(levels.flatMap(l => l.materials.map(m => m.marketName)))];
        const result: Prices = {};
        try {
            for (const name of needed) {
                const res = await searchMarketItems({ ItemName: name, PageNo: 1 });
                const item = res.Items?.[0];
                if (item) result[name] = item.CurrentMinPrice;
            }
            setPrices(result);
        } catch (e: unknown) {
            setFetchError(e instanceof Error ? e.message : '가격 조회 실패');
        } finally {
            setFetching(false);
        }
    }, [levels]);

    const calcResult = useMemo(() => {
        const levelDetails = levels.map(lv => {
            const exp = expectedAttempts(lv);
            let goldPerAttempt = 0;
            const mats: { name: string; totalQty: number; goldCost: number }[] = [];
            for (const mat of lv.materials) {
                const pricePerBundle = getPrice(mat.marketName);
                const pricePerUnit = pricePerBundle / mat.bundleSize;
                const totalQty = mat.qty;
                const goldCost = pricePerUnit * totalQty * exp;
                goldPerAttempt += goldCost;
                mats.push({ name: mat.marketName, totalQty: Math.ceil(totalQty * exp), goldCost: Math.round(goldCost) });
            }
            return { level: lv.level, successRate: lv.baseSuccessRate, exp, goldPerAttempt, mats };
        });

        const totalExpected = levelDetails.reduce((s, l) => s + l.goldPerAttempt, 0);
        const totalMats: Record<string, { qty: number; gold: number }> = {};
        for (const ld of levelDetails) {
            for (const m of ld.mats) {
                if (!totalMats[m.name]) totalMats[m.name] = { qty: 0, gold: 0 };
                totalMats[m.name].qty += m.totalQty;
                totalMats[m.name].gold += m.goldCost;
            }
        }

        return { levelDetails, totalExpected, totalMats };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [levels, prices, manualPrices]);

    const hasPrices = Object.keys(prices).length > 0 || Object.keys(manualPrices).length > 0;

    return (
        <div className={style.page}>
            <h2 className={style.title}>재련 비용 계산기</h2>

            {/* 강화 범위 선택 */}
            <div className={style.rangeRow}>
                <div className={style.rangeBox}>
                    <label>시작 단계</label>
                    <select value={fromLevel} onChange={e => setFromLevel(Number(e.target.value))}>
                        {ENHANCEMENT_TABLE.map(l => (
                            <option key={l.level} value={l.level - 1}>+{l.level - 1}</option>
                        ))}
                    </select>
                </div>
                <span className={style.arrow}>→</span>
                <div className={style.rangeBox}>
                    <label>목표 단계</label>
                    <select value={toLevel} onChange={e => setToLevel(Number(e.target.value))}>
                        {ENHANCEMENT_TABLE.map(l => (
                            <option key={l.level} value={l.level} disabled={l.level <= fromLevel}>+{l.level}</option>
                        ))}
                    </select>
                </div>
                <button className={style.fetchBtn} onClick={fetchPrices} disabled={fetching}>
                    {fetching ? '조회 중...' : '거래소 가격 불러오기'}
                </button>
            </div>

            {fetchError && <div className={style.error}>{fetchError}</div>}

            {/* 재료 가격 입력 */}
            <div className={style.priceGrid}>
                <p className={style.subTitle}>재료 가격 (묶음당 G · 수동 입력 가능)</p>
                {[...new Set(levels.flatMap(l => l.materials.map(m => m.marketName)))].map(name => (
                    <div key={name} className={style.priceRow}>
                        <span className={style.matName}>{name}</span>
                        <span className={style.bundleLabel}>묶음({ENHANCEMENT_TABLE.flatMap(l => l.materials).find(m => m.marketName === name)?.bundleSize ?? 1}개)</span>
                        <input
                            type='number'
                            className={style.priceInput}
                            placeholder={prices[name] ? String(prices[name]) : '가격 입력'}
                            value={manualPrices[name] ?? prices[name] ?? ''}
                            onChange={e => setManualPrices(p => ({ ...p, [name]: Number(e.target.value) }))}
                        />
                        <span className={style.goldLabel}>G</span>
                    </div>
                ))}
            </div>

            {hasPrices && (
                <>
                    {/* 결과 요약 */}
                    <div className={style.resultBox}>
                        <div className={style.resultTotal}>
                            <span>+{fromLevel} → +{toLevel} 예상 비용</span>
                            <span className={style.totalGold}>{Math.round(calcResult.totalExpected).toLocaleString()} G</span>
                        </div>
                        <div className={style.matSummary}>
                            {Object.entries(calcResult.totalMats).map(([name, { qty, gold }]) => (
                                <div key={name} className={style.matRow}>
                                    <span>{name}</span>
                                    <span className={style.matQty}>{qty.toLocaleString()}개</span>
                                    <span className={style.matGold}>{gold.toLocaleString()} G</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 단계별 상세 */}
                    <div className={style.levelTable}>
                        <p className={style.subTitle}>단계별 상세</p>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>단계</th>
                                    <th>성공확률</th>
                                    <th>평균 시도</th>
                                    <th>단계 예상 비용</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calcResult.levelDetails.map(ld => (
                                    <tr key={ld.level}>
                                        <td>+{ld.level - 1} → +{ld.level}</td>
                                        <td>{(ld.successRate * 100).toFixed(1)}%</td>
                                        <td>{ld.exp.toFixed(1)}회</td>
                                        <td className={style.goldCell}>{Math.round(ld.goldPerAttempt).toLocaleString()} G</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {!hasPrices && (
                <div className={style.hint}>
                    강화 구간 선택 후 "거래소 가격 불러오기" 버튼을 누르거나 재료 가격을 직접 입력하세요.
                </div>
            )}

            <p className={style.note}>* 재료 수량·확률은 근사치입니다. 실제 게임 내 수치와 다를 수 있습니다.</p>
        </div>
    );
};

export default EnhancementPage;
