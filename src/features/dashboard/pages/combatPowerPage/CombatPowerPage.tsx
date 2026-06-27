import { useState, useEffect } from 'react';
import {
    getArmoryProfiles,
    getArmoryEngravings,
    getArmoryGems,
} from '../../../../shared/api/IpcCharacter';
import type { ArmoryProfile, ArmoryEngravings, ArmoryGems } from '../../../../shared/types/lostark.types';
import { linearRegression } from './utils/regression';
import type { RegressionResult } from './utils/regression';
import style from './style/CombatPowerPage.module.css';

const STORAGE_KEY = 'loa_cp_dataset';

const COMBAT_STAT_TYPES = ['치명', '특화', '제압', '신속', '인내', '숙련'];
const FEATURE_NAMES = ['아이템 레벨', '각인 효과 수', '보석 합산 레벨', '치명', '특화', '제압', '신속', '인내', '숙련'];
const MIN_POINTS = 30;

interface DataPoint {
    id: string;
    characterName: string;
    serverName: string;
    className: string;
    itemAvgLevel: number;
    engravingCount: number;
    totalGemLevel: number;
    치명: number; 특화: number; 제압: number;
    신속: number; 인내: number; 숙련: number;
    combatPower: number;
    createdAt: string;
}

interface FetchedData {
    profile: ArmoryProfile;
    engravings: ArmoryEngravings;
    gems: ArmoryGems;
}

const loadDataset = (): DataPoint[] => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
        return [];
    }
};

const saveDataset = (data: DataPoint[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const extractFeatures = (dp: DataPoint): number[] => [
    dp.itemAvgLevel, dp.engravingCount, dp.totalGemLevel,
    dp.치명, dp.특화, dp.제압, dp.신속, dp.인내, dp.숙련,
];

const fmt = (n: number) => Math.round(n).toLocaleString();
const fmtCoeff = (n: number) =>
    `${n >= 0 ? '+' : ''}${n.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CombatPowerPage = () => {
    const [dataset, setDataset] = useState<DataPoint[]>(loadDataset);
    const [searchName, setSearchName] = useState('');
    const [fetching, setFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [fetched, setFetched] = useState<FetchedData | null>(null);
    const [cpInput, setCpInput] = useState('');
    const [regression, setRegression] = useState<RegressionResult | null>(null);
    const [predictName, setPredictName] = useState('');
    const [predicting, setPredicting] = useState(false);
    const [predictResult, setPredictResult] = useState<number | null>(null);

    useEffect(() => {
        saveDataset(dataset);
    }, [dataset]);

    const handleFetch = async () => {
        const name = searchName.trim();
        if (!name) return;
        setFetching(true);
        setFetchError(null);
        setFetched(null);
        setPredictResult(null);
        try {
            const [profile, engravings, gems] = await Promise.all([
                getArmoryProfiles(name),
                getArmoryEngravings(name),
                getArmoryGems(name),
            ]);
            setFetched({ profile, engravings, gems });
        } catch (e: unknown) {
            setFetchError(e instanceof Error ? e.message : String(e));
        } finally {
            setFetching(false);
        }
    };

    const handleSave = () => {
        if (!fetched) return;
        const cp = Number(cpInput.replace(/,/g, ''));
        if (!cp || cp <= 0) {
            alert('인게임 전투력을 정확히 입력해주세요.');
            return;
        }

        const { profile, engravings, gems } = fetched;
        const itemAvgLevel = parseFloat(profile.ItemAvgLevel.replace(/,/g, '')) || 0;
        const engravingCount = engravings.Effects?.length ?? 0;
        const totalGemLevel = gems.Gems?.reduce((s, g) => s + g.Level, 0) ?? 0;

        const statMap: Record<string, number> = {};
        profile.Stats?.forEach(s => { statMap[s.Type] = Number(s.Value) || 0; });

        const point: DataPoint = {
            id: Date.now().toString(),
            characterName: profile.CharacterName,
            serverName: profile.ServerName,
            className: profile.CharacterClassName,
            itemAvgLevel,
            engravingCount,
            totalGemLevel,
            치명: statMap['치명'] ?? 0,
            특화: statMap['특화'] ?? 0,
            제압: statMap['제압'] ?? 0,
            신속: statMap['신속'] ?? 0,
            인내: statMap['인내'] ?? 0,
            숙련: statMap['숙련'] ?? 0,
            combatPower: cp,
            createdAt: new Date().toISOString(),
        };

        setDataset(prev => {
            const exists = prev.findIndex(d => d.characterName === point.characterName);
            if (exists >= 0) {
                const updated = [...prev];
                updated[exists] = point;
                return updated;
            }
            return [...prev, point];
        });
        setCpInput('');
        setFetched(null);
        setSearchName('');
        setRegression(null);
    };

    const handleDelete = (id: string) => {
        setDataset(prev => prev.filter(d => d.id !== id));
        setRegression(null);
    };

    const handleClearAll = () => {
        if (window.confirm('모든 수집 데이터를 삭제하시겠습니까?')) {
            setDataset([]);
            setRegression(null);
        }
    };

    const handleAnalyze = () => {
        if (dataset.length < MIN_POINTS) return;
        const X = dataset.map(extractFeatures);
        const y = dataset.map(d => d.combatPower);
        setRegression(linearRegression(X, y, FEATURE_NAMES));
        setPredictResult(null);
    };

    const handlePredict = async () => {
        if (!regression || !predictName.trim()) return;
        setPredicting(true);
        setPredictResult(null);
        try {
            const [profile, engravings, gems] = await Promise.all([
                getArmoryProfiles(predictName.trim()),
                getArmoryEngravings(predictName.trim()),
                getArmoryGems(predictName.trim()),
            ]);
            const itemAvgLevel = parseFloat(profile.ItemAvgLevel.replace(/,/g, '')) || 0;
            const engravingCount = engravings.Effects?.length ?? 0;
            const totalGemLevel = gems.Gems?.reduce((s, g) => s + g.Level, 0) ?? 0;
            const statMap: Record<string, number> = {};
            profile.Stats?.forEach(s => { statMap[s.Type] = Number(s.Value) || 0; });

            const features = [
                itemAvgLevel, engravingCount, totalGemLevel,
                statMap['치명'] ?? 0, statMap['특화'] ?? 0, statMap['제압'] ?? 0,
                statMap['신속'] ?? 0, statMap['인내'] ?? 0, statMap['숙련'] ?? 0,
            ];
            setPredictResult(Math.round(regression.predict(features)));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : String(e));
        } finally {
            setPredicting(false);
        }
    };

    const r2Color = !regression ? '' : regression.r2 >= 0.95 ? style.r2Value : regression.r2 >= 0.8 ? style.r2Mid : style.r2Bad;

    const profileStat = (type: string) => {
        const s = fetched?.profile.Stats?.find(st => st.Type === type);
        return s ? Number(s.Value).toLocaleString() : '0';
    };

    return (
        <div className={style.page}>
            {/* 헤더 */}
            <div className={style.header}>
                <h2 className={style.headerTitle}>
                    전투력 역추산 수집기
                    <span>— 인게임 전투력과 API 데이터를 모아 공식을 도출합니다</span>
                </h2>
                <div className={style.searchRow}>
                    <input
                        type='text'
                        placeholder='캐릭터명 입력'
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleFetch()}
                    />
                    <button className={style.fetchBtn} onClick={handleFetch} disabled={fetching}>
                        {fetching ? '불러오는 중...' : 'API 불러오기'}
                    </button>
                </div>
                <span className={style.countBadge}>수집 {dataset.length}개</span>
            </div>

            {fetchError && <p className={style.error}>{fetchError}</p>}

            {/* 입력 영역 */}
            <div className={style.inputGrid}>
                {/* 캐릭터 정보 */}
                <div className={style.card}>
                    <p className={style.cardTitle}>불러온 캐릭터 정보</p>
                    {!fetched ? (
                        <div className={style.placeholder}>캐릭터명을 입력하고 API를 불러오세요.</div>
                    ) : (
                        <>
                            <p className={style.charName}>{fetched.profile.CharacterName}</p>
                            <p className={style.charClass}>
                                {fetched.profile.ServerName} · {fetched.profile.CharacterClassName}
                            </p>
                            <div className={style.statGrid}>
                                <div className={style.statItem}>
                                    <span className={style.statLabel}>아이템 레벨</span>
                                    <span className={style.statValueGold}>{fetched.profile.ItemAvgLevel}</span>
                                </div>
                                <div className={style.statItem}>
                                    <span className={style.statLabel}>각인 효과</span>
                                    <span className={style.statValue}>{fetched.engravings.Effects?.length ?? 0}개</span>
                                </div>
                                <div className={style.statItem}>
                                    <span className={style.statLabel}>보석 합산</span>
                                    <span className={style.statValue}>
                                        Lv.{fetched.gems.Gems?.reduce((s, g) => s + g.Level, 0) ?? 0}
                                    </span>
                                </div>
                                {COMBAT_STAT_TYPES.map(t => (
                                    <div key={t} className={style.statItem}>
                                        <span className={style.statLabel}>{t}</span>
                                        <span className={style.statValue}>{profileStat(t)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* 전투력 입력 */}
                <div className={style.card}>
                    <p className={style.cardTitle}>인게임 전투력 입력</p>
                    <div className={style.cpInputArea}>
                        <div className={style.cpInputRow}>
                            <input
                                className={style.cpInput}
                                type='text'
                                placeholder='전투력 숫자 입력'
                                value={cpInput}
                                onChange={e => setCpInput(e.target.value)}
                                disabled={!fetched}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                            />
                            <button
                                className={style.saveBtn}
                                onClick={handleSave}
                                disabled={!fetched || !cpInput}
                            >
                                저장
                            </button>
                        </div>
                        <p className={style.cpHint}>
                            인게임에서 <strong>캐릭터 정보 → 전투 정보</strong> 탭에서<br />
                            확인할 수 있는 전투력 수치를 입력해주세요.<br />
                            같은 캐릭터를 다시 저장하면 기존 데이터가 갱신됩니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* 데이터 테이블 */}
            <div className={style.tableSection}>
                <div className={style.tableSectionHeader}>
                    <h3 className={style.tableSectionTitle}>수집된 데이터</h3>
                    {dataset.length > 0 && (
                        <button className={style.clearBtn} onClick={handleClearAll}>전체 삭제</button>
                    )}
                </div>
                <div className={style.tableWrapper}>
                    {dataset.length === 0 ? (
                        <div className={style.emptyTable}>
                            데이터가 없습니다. {MIN_POINTS}개 이상 모이면 공식을 도출할 수 있습니다.
                        </div>
                    ) : (
                        <table className={style.dataTable}>
                            <thead>
                                <tr>
                                    <th className={style.tdLeft}>캐릭터</th>
                                    <th>아이템 레벨</th>
                                    <th>각인</th>
                                    <th>보석 합산</th>
                                    <th>치명</th>
                                    <th>신속</th>
                                    <th>특화</th>
                                    <th>전투력</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataset.map(dp => (
                                    <tr key={dp.id}>
                                        <td className={style.tdLeft}>
                                            <div>{dp.characterName}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#71717a' }}>
                                                {dp.serverName} · {dp.className}
                                            </div>
                                        </td>
                                        <td>{dp.itemAvgLevel.toFixed(2)}</td>
                                        <td>{dp.engravingCount}</td>
                                        <td>Lv.{dp.totalGemLevel}</td>
                                        <td>{dp.치명.toLocaleString()}</td>
                                        <td>{dp.신속.toLocaleString()}</td>
                                        <td>{dp.특화.toLocaleString()}</td>
                                        <td className={style.tdGold}>{fmt(dp.combatPower)}</td>
                                        <td>
                                            <button
                                                className={style.deleteRowBtn}
                                                onClick={() => handleDelete(dp.id)}
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 분석 영역 */}
            <div className={style.analysisSection}>
                <div className={style.analysisSectionHeader}>
                    <h3 className={style.analysisSectionTitle}>
                        공식 분석 (선형 회귀)
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {dataset.length < MIN_POINTS && (
                            <span className={style.lockedHint}>
                                {dataset.length} / {MIN_POINTS}개 — {MIN_POINTS - dataset.length}개 더 필요
                            </span>
                        )}
                        <button
                            className={style.analyzeBtn}
                            onClick={handleAnalyze}
                            disabled={dataset.length < MIN_POINTS}
                        >
                            회귀 분석 실행
                        </button>
                    </div>
                </div>

                {regression ? (
                    <>
                        <div className={style.formulaBox}>
                            <div className={style.r2Row}>
                                <span className={style.r2Label}>정확도 R²</span>
                                <span className={r2Color}>
                                    {(regression.r2 * 100).toFixed(2)} %
                                </span>
                                <span className={style.r2Label}>
                                    {regression.r2 >= 0.95 ? '(매우 정확)' : regression.r2 >= 0.8 ? '(보통)' : '(데이터 더 필요)'}
                                </span>
                            </div>
                            <div className={style.formulaText}>
                                <span className={style.formulaVar}>전투력</span>
                                {' = '}
                                <span className={style.formulaCoeff}>
                                    {fmtCoeff(regression.coefficients[0])}
                                </span>
                                {regression.featureNames.map((name, i) => (
                                    <span key={name}>
                                        {' '}
                                        <span className={style.formulaCoeff}>
                                            {fmtCoeff(regression.coefficients[i + 1])}
                                        </span>
                                        {' × '}
                                        <span className={style.formulaVar}>{name}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 예측 */}
                        <div className={style.predictRow}>
                            <input
                                type='text'
                                placeholder='예측할 캐릭터명'
                                value={predictName}
                                onChange={e => setPredictName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handlePredict()}
                            />
                            <button
                                className={style.predictBtn}
                                onClick={handlePredict}
                                disabled={predicting || !predictName.trim()}
                            >
                                {predicting ? '조회 중...' : '전투력 예측'}
                            </button>
                            {predictResult !== null && (
                                <span className={style.predictResult}>
                                    예측 전투력: {fmt(predictResult)}
                                </span>
                            )}
                        </div>
                    </>
                ) : (
                    <p style={{ color: '#52525b', fontSize: '0.875rem', margin: 0 }}>
                        {dataset.length >= MIN_POINTS
                            ? '위 버튼을 눌러 공식을 도출하세요.'
                            : `데이터를 ${MIN_POINTS}개 이상 수집한 후 분석이 가능합니다.`}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CombatPowerPage;
