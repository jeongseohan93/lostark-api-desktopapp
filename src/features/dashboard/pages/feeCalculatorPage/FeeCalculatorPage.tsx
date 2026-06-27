import { useState, useMemo } from 'react';
import style from './style/FeeCalculatorPage.module.css';

const FEE = 0.05;

// mode A: 내가 받은 금액 → 원금, 돌려줄 금액 계산
// mode B: 원금 → 내가 올려야 할 금액 계산
type Mode = 'received' | 'original';

const fmt = (n: number) => Math.ceil(n).toLocaleString('ko-KR');

const QUICK_TABLE = [1000, 5000, 10000, 30000, 50000, 100000, 500000, 1000000];

const FeeCalculatorPage = () => {
    const [mode, setMode] = useState<Mode>('received');
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    const parsed = Number(input.replace(/,/g, '')) || 0;

    const calc = useMemo(() => {
        if (!parsed) return null;
        if (mode === 'received') {
            // 받은 금액 = 원금 × 0.95 → 원금 = 받은금액 / 0.95
            const original = parsed / (1 - FEE);
            // 원금을 상대방이 받게 하려면 내가 올려야 할 금액 = 원금 / 0.95
            const toList = original / (1 - FEE);
            return { original, toList, received: parsed };
        } else {
            // 원금 입력 → 상대방이 원금 받으려면 내가 올려야 할 가격
            const toList = parsed / (1 - FEE);
            const received = parsed * (1 - FEE);
            return { original: parsed, toList, received };
        }
    }, [parsed, mode]);

    const copy = (val: number, key: string) => {
        navigator.clipboard.writeText(String(Math.ceil(val)));
        setCopied(key);
        setTimeout(() => setCopied(null), 1500);
    };

    const handleInput = (raw: string) => {
        const digits = raw.replace(/[^\d]/g, '');
        setInput(digits ? Number(digits).toLocaleString('ko-KR') : '');
    };

    return (
        <div className={style.page}>
            <h2 className={style.title}>수수료 계산기</h2>
            <p className={style.desc}>
                경매장·거래소 거래 수수료는 <strong style={{ color: '#facc15' }}>5%</strong>입니다.
                상대에게 원금을 그대로 돌려주려면 수수료를 감안해 더 높은 금액을 올려야 합니다.
            </p>

            {/* Mode tabs */}
            <div className={style.tabs}>
                <button
                    className={`${style.tab} ${mode === 'received' ? style.tabActive : ''}`}
                    onClick={() => { setMode('received'); setInput(''); }}
                >
                    받은 골드로 계산
                </button>
                <button
                    className={`${style.tab} ${mode === 'original' ? style.tabActive : ''}`}
                    onClick={() => { setMode('original'); setInput(''); }}
                >
                    원금으로 계산
                </button>
            </div>

            {/* Input */}
            <div className={style.card}>
                <div className={style.inputRow}>
                    <label>
                        {mode === 'received' ? '내가 받은 골드' : '돌려줘야 할 원금'}
                    </label>
                    <input
                        className={style.goldInput}
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={input}
                        onChange={e => handleInput(e.target.value)}
                    />
                    <span className={style.goldUnit}>G</span>
                </div>

                {calc && (
                    <>
                        <hr className={style.divider} />

                        {mode === 'received' && (
                            <div className={style.resultRow}>
                                <span className={style.resultLabel}>거래된 원금</span>
                                <span className={style.resultValue}>{fmt(calc.original)} G</span>
                                <button
                                    className={`${style.copyBtn} ${copied === 'orig' ? style.copyBtnDone : ''}`}
                                    onClick={() => copy(calc.original, 'orig')}
                                >
                                    {copied === 'orig' ? '복사됨' : '복사'}
                                </button>
                            </div>
                        )}

                        {mode === 'original' && (
                            <div className={style.resultRow}>
                                <span className={style.resultLabel}>수수료 차감 후 수령</span>
                                <span className={`${style.resultValue} ${style.resultValueGreen}`}>{fmt(calc.received)} G</span>
                            </div>
                        )}

                        <div className={style.resultRow}>
                            <span className={style.resultLabel}>
                                {mode === 'received'
                                    ? '원금을 돌려주려면 올려야 할 가격'
                                    : '상대방이 원금 받으려면 올려야 할 가격'}
                            </span>
                            <span className={style.resultValueMain}>{fmt(calc.toList)} G</span>
                            <button
                                className={`${style.copyBtn} ${copied === 'list' ? style.copyBtnDone : ''}`}
                                onClick={() => copy(calc.toList, 'list')}
                            >
                                {copied === 'list' ? '복사됨' : '복사'}
                            </button>
                        </div>

                        <div className={style.resultRow}>
                            <span className={style.resultLabel}>수수료 손실액</span>
                            <span className={style.resultValue} style={{ color: '#f87171' }}>
                                {fmt(calc.toList - calc.original)} G
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Formula */}
            <div className={style.formulaBox}>
                <p className={style.formulaTitle}>계산 공식</p>
                <p className={style.formulaLine}>
                    <strong>원금 복원</strong>: 올려야 할 가격 = 원금 ÷ (1 - 0.05) = 원금 × 1.05263...
                </p>
                <p className={style.formulaLine}>
                    <strong>받은 골드로 역산</strong>: 원금 = 받은금액 ÷ 0.95 &nbsp;|&nbsp; 돌려줄 게시가 = 받은금액 ÷ 0.95²
                </p>
            </div>

            {/* Quick table */}
            <div className={style.tableCard}>
                <p className={style.tableTitle}>빠른 환산표 (원금 기준)</p>
                <table className={style.table}>
                    <thead>
                        <tr>
                            <th>원금</th>
                            <th>수령액 (−5%)</th>
                            <th>원금 복원 게시가</th>
                        </tr>
                    </thead>
                    <tbody>
                        {QUICK_TABLE.map(orig => (
                            <tr key={orig}>
                                <td>{orig.toLocaleString()} G</td>
                                <td className={style.greenCell}>{fmt(orig * 0.95)} G</td>
                                <td className={style.goldCell}>{fmt(orig / 0.95)} G</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Coming soon: spec planner */}
            <div className={style.comingSoonCard}>
                <p className={style.comingSoonTitle}>전투력 스펙업 효율 계산기</p>
                <p className={style.comingSoonDesc}>
                    전투력 공식이 공개되면 장신구·연마·각인·보석별 골드 대비 전투력 증가량을
                    자동 계산해 가장 효율적인 업글 순서를 제안해드립니다.
                </p>
                <span className={style.badge}>공식 공개 후 업데이트 예정</span>
            </div>
        </div>
    );
};

export default FeeCalculatorPage;
