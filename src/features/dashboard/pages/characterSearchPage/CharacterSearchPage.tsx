import { useState, useEffect, useMemo } from 'react';
import {
    getCharacterSiblings,
    getArmoryProfiles,
    getArmoryEquipment,
    getArmoryEngravings,
    getArmoryGems,
} from '../../../../shared/api/IpcCharacter';
import type {
    CharacterInfo,
    ArmoryProfile,
    ArmoryEquipment,
    ArmoryEngravings,
    ArmoryGems,
} from '../../../../shared/types/lostark.types';
import type { SavedFormula } from '../combatPowerPage/CombatPowerPage';
import { FORMULA_KEY } from '../combatPowerPage/CombatPowerPage';
import style from './style/CharacterSearchPage.module.css';

interface ArmoryData {
    profile: ArmoryProfile;
    equipment: ArmoryEquipment[];
    engravings: ArmoryEngravings;
    gems: ArmoryGems;
}

const COMBAT_STAT_TYPES = ['치명', '특화', '제압', '신속', '인내', '숙련'];
const EQUIP_ORDER = ['투구', '어깨', '상의', '하의', '장갑', '무기'];

const GRADE_BORDER: Record<string, string> = {
    '일반': '#9d9d9d', '고급': '#1eff00', '희귀': '#0070dd',
    '영웅': '#a335ee', '전설': '#ff8000', '유물': '#e06c30', '고대': '#cca800',
};

const CharacterSearchPage = () => {
    const [searchInput, setSearchInput] = useState('');
    const [siblings, setSiblings] = useState<CharacterInfo[]>([]);
    const [selectedChar, setSelectedChar] = useState<CharacterInfo | null>(null);
    const [armory, setArmory] = useState<ArmoryData | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [armoryLoading, setArmoryLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedFormula, setSavedFormula] = useState<SavedFormula | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem(FORMULA_KEY);
        if (!raw) return;
        try { setSavedFormula(JSON.parse(raw)); } catch { /* ignore */ }
    }, []);

    const loadArmory = async (char: CharacterInfo) => {
        setSelectedChar(char);
        setArmoryLoading(true);
        setError(null);
        setArmory(null);
        try {
            const [profile, equipment, engravings, gems] = await Promise.all([
                getArmoryProfiles(char.CharacterName),
                getArmoryEquipment(char.CharacterName),
                getArmoryEngravings(char.CharacterName),
                getArmoryGems(char.CharacterName),
            ]);
            setArmory({
                profile,
                equipment: equipment ?? [],
                engravings,
                gems,
            });
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setArmoryLoading(false);
        }
    };

    const handleSearch = async () => {
        const name = searchInput.trim();
        if (!name) return;
        setSearchLoading(true);
        setError(null);
        setSiblings([]);
        setSelectedChar(null);
        setArmory(null);
        try {
            const list = await getCharacterSiblings(name);
            setSiblings(list ?? []);
            const target = list?.find(c => c.CharacterName === name) ?? list?.[0];
            if (target) {
                await loadArmory(target);
            } else {
                setError('캐릭터를 찾을 수 없습니다.');
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setSearchLoading(false);
        }
    };

    const estimatedCombatPower = useMemo(() => {
        if (!armory || !savedFormula) return null;
        const { coefficients } = savedFormula;
        const itemAvgLevel = parseFloat(armory.profile.ItemAvgLevel.replace(/,/g, '')) || 0;
        const engravingCount = armory.engravings.Effects?.length ?? 0;
        const totalGemLevel = armory.gems.Gems?.reduce((s, g) => s + g.Level, 0) ?? 0;
        const statMap: Record<string, number> = {};
        armory.profile.Stats?.forEach(s => { statMap[s.Type] = Number(s.Value) || 0; });
        const features = [
            itemAvgLevel, engravingCount, totalGemLevel,
            statMap['치명'] ?? 0, statMap['특화'] ?? 0, statMap['제압'] ?? 0,
            statMap['신속'] ?? 0, statMap['인내'] ?? 0, statMap['숙련'] ?? 0,
        ];
        const pred = coefficients[0] + features.reduce((s, x, i) => s + x * coefficients[i + 1], 0);
        return Math.round(pred);
    }, [armory, savedFormula]);

    const basicStats = armory?.profile.Stats.filter(s => !COMBAT_STAT_TYPES.includes(s.Type)) ?? [];
    const combatStats = armory?.profile.Stats.filter(s => COMBAT_STAT_TYPES.includes(s.Type)) ?? [];
    const sortedEquip = EQUIP_ORDER
        .map(type => armory?.equipment.find(e => e.Type === type))
        .filter(Boolean) as ArmoryEquipment[];

    return (
        <div className={style.searchPage}>
            <div className={style.searchBar}>
                <input
                    type='text'
                    placeholder='캐릭터 명을 입력하세요'
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={searchLoading || armoryLoading}>
                    {searchLoading ? '...' : '검색'}
                </button>
            </div>

            {siblings.length > 0 && (
                <div className={style.siblingsBar}>
                    {siblings.map(char => (
                        <div
                            key={char.CharacterName}
                            className={`${style.siblingCard}${selectedChar?.CharacterName === char.CharacterName ? ' ' + style.activeSibling : ''}`}
                            onClick={() => loadArmory(char)}
                        >
                            <div className={style.sibClassName}>{char.CharacterClassName}</div>
                            <div className={style.sibName}>{char.CharacterName}</div>
                            <div className={style.sibLevel}>{char.ItemAvgLevel}</div>
                        </div>
                    ))}
                </div>
            )}

            {error && <div className={style.errorBox}>{error}</div>}

            {armoryLoading ? (
                <div className={style.loadingBox}>아머리 정보를 불러오는 중...</div>
            ) : armory ? (
                <div className={style.profileContainer}>
                    {/* 왼쪽 컬럼 */}
                    <aside className={style.leftColumn}>
                        <div className={style.levelInfo}>
                            <span>원정대 레벨<p>Lv.{armory.profile.ExpeditionLevel}</p></span>
                            <span>전투 레벨<p>Lv.{armory.profile.CharacterLevel}</p></span>
                        </div>
                        <div className={style.itemLevel}>
                            <p>장착 아이템 레벨</p>
                            <span>Lv.{armory.profile.ItemAvgLevel}</span>
                        </div>
                        {estimatedCombatPower !== null ? (
                            <div className={style.estimatedCp}>
                                <p>추정 전투력 <span className={style.estimatedCpR2}>R² {(savedFormula!.r2 * 100).toFixed(1)}%</span></p>
                                <span>{estimatedCombatPower.toLocaleString()}</span>
                            </div>
                        ) : (
                            <div className={style.estimatedCpLocked}>
                                <p>추정 전투력</p>
                                <span>전투력 역추산 수집기에서 공식 도출 후 표시</span>
                            </div>
                        )}
                        <div className={style.basicInfo}>
                            {armory.profile.Title && (
                                <div className={style.infoRow}>
                                    <label>칭호</label><span>{armory.profile.Title}</span>
                                </div>
                            )}
                            {armory.profile.GuildName && (
                                <div className={style.infoRow}>
                                    <label>길드</label><span>{armory.profile.GuildName}</span>
                                </div>
                            )}
                            {armory.profile.PvpGradeName && (
                                <div className={style.infoRow}>
                                    <label>PVP</label><span>{armory.profile.PvpGradeName}</span>
                                </div>
                            )}
                            {armory.profile.TownName && (
                                <div className={style.infoRow}>
                                    <label>영지</label><span>{armory.profile.TownName}</span>
                                </div>
                            )}
                        </div>
                        {(armory.gems.Gems?.length ?? 0) > 0 && (
                            <div className={style.infoBlock}>
                                <h3>보석</h3>
                                <div className={style.gemGrid}>
                                    {armory.gems.Gems.map((gem, i) => (
                                        <div key={i} className={style.gemSlot} title={`${gem.Name} (Lv.${gem.Level})`}>
                                            <img src={gem.Icon} alt={gem.Name} />
                                            <span>{gem.Level}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* 중앙 컬럼 */}
                    <section className={style.centerColumn}>
                        <div className={style.characterRender}>
                            {armory.profile.CharacterImage && (
                                <img src={armory.profile.CharacterImage} alt={armory.profile.CharacterName} />
                            )}
                        </div>
                        <div className={style.equipment}>
                            <div className={style.equipLeft}>
                                {sortedEquip.slice(0, 3).map(item => (
                                    <div
                                        key={item.Type}
                                        className={style.equipSlot}
                                        style={{ borderColor: GRADE_BORDER[item.Grade] ?? '#444' }}
                                        title={`[${item.Type}] ${item.Name}`}
                                    >
                                        <img src={item.Icon} alt={item.Name} />
                                    </div>
                                ))}
                            </div>
                            <div className={style.equipRight}>
                                {sortedEquip.slice(3, 6).map(item => (
                                    <div
                                        key={item.Type}
                                        className={style.equipSlot}
                                        style={{ borderColor: GRADE_BORDER[item.Grade] ?? '#444' }}
                                        title={`[${item.Type}] ${item.Name}`}
                                    >
                                        <img src={item.Icon} alt={item.Name} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 오른쪽 컬럼 */}
                    <aside className={style.rightColumn}>
                        {basicStats.length > 0 && (
                            <div className={style.infoBlock}>
                                <h3>기본 특성</h3>
                                {basicStats.map(s => (
                                    <div key={s.Type} className={style.statRow}>
                                        <span>{s.Type}</span>
                                        <span>{Number(s.Value).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {combatStats.length > 0 && (
                            <div className={style.infoBlock}>
                                <h3>전투 특성</h3>
                                {combatStats.map(s => (
                                    <div key={s.Type} className={style.statRow}>
                                        <span>{s.Type}</span>
                                        <span>{Number(s.Value).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {(armory.engravings.Effects?.length ?? 0) > 0 && (
                            <div className={style.infoBlock}>
                                <h3>각인 효과</h3>
                                {armory.engravings.Effects.map((eff, i) => (
                                    <div key={i} className={style.engravingRow}>
                                        <img src={eff.Icon} alt={eff.Name} />
                                        <span>{eff.Name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {(armory.profile.Tendencies?.length ?? 0) > 0 && (
                            <div className={style.infoBlock}>
                                <h3>성향</h3>
                                {armory.profile.Tendencies.map(t => (
                                    <div key={t.Type} className={style.virtueRow}>
                                        <label>{t.Type}</label>
                                        <div className={style.progressBar}>
                                            <div style={{ width: `${Math.min(100, (t.Point / t.MaxPoint) * 100)}%` }} />
                                        </div>
                                        <span>{t.Point}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </aside>
                </div>
            ) : null}
        </div>
    );
};

export default CharacterSearchPage;
