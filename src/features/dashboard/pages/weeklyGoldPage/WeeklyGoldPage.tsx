import { useState, useMemo } from 'react';
import { DEFAULT_RAIDS, Raid } from './data/raids';
import style from './style/WeeklyGoldPage.module.css';

const STORAGE_KEY = 'loa_weekly_gold_v1';
const MAX_GOLD_CHARS = 6;

interface Character {
    id: string;
    name: string;
    itemLevel: number;
    enabled: boolean;
}

interface RaidSelection {
    [raidId: string]: boolean[]; // 관문별 선택 여부
}

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as { chars: Character[]; raidOverrides: Record<string, number[]>; selections: Record<string, Record<string, boolean[]>> };
    } catch { return null; }
}

const DIFF_COLOR: Record<string, string> = { 노말: '#60a5fa', 하드: '#f87171', 싱글: '#34d399' };

const WeeklyGoldPage = () => {
    const saved = useMemo(() => loadData(), []);
    const [raids] = useState<Raid[]>(DEFAULT_RAIDS);
    const [chars, setChars] = useState<Character[]>(saved?.chars ?? []);
    const [selections, setSelections] = useState<Record<string, RaidSelection>>(saved?.selections ?? {});
    const [nameInput, setNameInput] = useState('');
    const [levelInput, setLevelInput] = useState('');
    const [editGoldRaidId, setEditGoldRaidId] = useState<string | null>(null);
    const [raidGoldOverrides, setRaidGoldOverrides] = useState<Record<string, number[]>>(saved?.raidOverrides ?? {});

    const persist = (c: Character[], s: Record<string, RaidSelection>, o: Record<string, number[]>) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ chars: c, selections: s, raidOverrides: o }));
    };

    const addChar = () => {
        const name = nameInput.trim();
        const level = parseFloat(levelInput.replace(/,/g, ''));
        if (!name || isNaN(level)) return;
        const newChar: Character = { id: crypto.randomUUID(), name, itemLevel: level, enabled: true };
        const next = [...chars, newChar].sort((a, b) => b.itemLevel - a.itemLevel);
        setChars(next);
        setNameInput('');
        setLevelInput('');
        persist(next, selections, raidGoldOverrides);
    };

    const removeChar = (id: string) => {
        const next = chars.filter(c => c.id !== id);
        setChars(next);
        persist(next, selections, raidGoldOverrides);
    };

    const toggleChar = (id: string) => {
        const next = chars.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c);
        setChars(next);
        persist(next, selections, raidGoldOverrides);
    };

    const getGateGold = (raid: Raid, gateIdx: number) => {
        return raidGoldOverrides[raid.id]?.[gateIdx] ?? raid.gates[gateIdx].gold;
    };

    const toggleGate = (charId: string, raidId: string, gateIdx: number) => {
        setSelections(prev => {
            const charSel = { ...(prev[charId] ?? {}) };
            const raidGates = [...(charSel[raidId] ?? raids.find(r => r.id === raidId)!.gates.map(() => false))];
            raidGates[gateIdx] = !raidGates[gateIdx];
            charSel[raidId] = raidGates;
            const next = { ...prev, [charId]: charSel };
            persist(chars, next, raidGoldOverrides);
            return next;
        });
    };

    const charGold = (char: Character) => {
        if (!char.enabled) return 0;
        let total = 0;
        for (const raid of raids) {
            if (char.itemLevel < raid.minItemLevel) continue;
            const gates = selections[char.id]?.[raid.id] ?? raid.gates.map(() => true);
            gates.forEach((on, i) => { if (on) total += getGateGold(raid, i); });
        }
        return total;
    };

    // 주간 최대 골드 수령 캐릭터 제한
    const goldChars = chars.filter(c => c.enabled).slice(0, MAX_GOLD_CHARS);
    const totalWeeklyGold = goldChars.reduce((s, c) => s + charGold(c), 0);

    const updateGateGold = (raidId: string, gateIdx: number, val: number) => {
        setRaidGoldOverrides(prev => {
            const gatesCopy = [...(prev[raidId] ?? raids.find(r => r.id === raidId)!.gates.map(g => g.gold))];
            gatesCopy[gateIdx] = val;
            const next = { ...prev, [raidId]: gatesCopy };
            persist(chars, selections, next);
            return next;
        });
    };

    return (
        <div className={style.page}>
            <div className={style.header}>
                <h2 className={style.title}>주간 골드 수익 계산기</h2>
                <div className={style.totalBadge}>
                    주간 예상 골드 <span>{totalWeeklyGold.toLocaleString()} G</span>
                    <span className={style.charLimit}>({goldChars.length}/{MAX_GOLD_CHARS} 캐릭터)</span>
                </div>
            </div>

            {/* 캐릭터 입력 */}
            <div className={style.charInputRow}>
                <input
                    className={style.input}
                    placeholder='캐릭터명'
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addChar()}
                />
                <input
                    className={style.input}
                    placeholder='아이템 레벨 (예: 1680)'
                    value={levelInput}
                    onChange={e => setLevelInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addChar()}
                    style={{ width: 180 }}
                />
                <button className={style.addBtn} onClick={addChar}>캐릭터 추가</button>
            </div>

            {chars.length === 0 ? (
                <div className={style.empty}>캐릭터를 추가하면 레이드별 예상 골드를 계산합니다.</div>
            ) : (
                <div className={style.tableWrap}>
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th className={style.thChar}>캐릭터</th>
                                {raids.map(raid => (
                                    <th key={raid.id} className={style.thRaid}>
                                        <div className={style.raidName}>{raid.name}</div>
                                        <div className={style.raidDiff} style={{ color: DIFF_COLOR[raid.difficulty] }}>{raid.difficulty}</div>
                                        <div className={style.raidIlvl}>Lv.{raid.minItemLevel}</div>
                                        <div
                                            className={style.raidGoldTotal}
                                            onClick={() => setEditGoldRaidId(editGoldRaidId === raid.id ? null : raid.id)}
                                            title='클릭하여 골드 수정'
                                        >
                                            {raid.gates.reduce((s, _, i) => s + getGateGold(raid, i), 0).toLocaleString()} G ✎
                                        </div>
                                        {editGoldRaidId === raid.id && (
                                            <div className={style.goldEditor}>
                                                {raid.gates.map((gate, i) => (
                                                    <div key={i} className={style.gateEdit}>
                                                        <span>{gate.name}</span>
                                                        <input
                                                            type='number'
                                                            value={getGateGold(raid, i)}
                                                            onChange={e => updateGateGold(raid.id, i, Number(e.target.value))}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </th>
                                ))}
                                <th className={style.thGold}>주간 골드</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {chars.map((char, idx) => {
                                const isGoldChar = char.enabled && goldChars.includes(char);
                                return (
                                    <tr key={char.id} className={!char.enabled ? style.rowDisabled : idx < MAX_GOLD_CHARS ? '' : style.rowNoGold}>
                                        <td className={style.tdChar}>
                                            <label className={style.charLabel}>
                                                <input type='checkbox' checked={char.enabled} onChange={() => toggleChar(char.id)} />
                                                <span className={style.charName}>{char.name}</span>
                                                <span className={style.charLevel}>{char.itemLevel.toLocaleString()}</span>
                                                {!isGoldChar && char.enabled && (
                                                    <span className={style.noGoldBadge}>골드 외</span>
                                                )}
                                            </label>
                                        </td>
                                        {raids.map(raid => {
                                            const canEnter = char.itemLevel >= raid.minItemLevel;
                                            const gates = selections[char.id]?.[raid.id] ?? raid.gates.map(() => true);
                                            return (
                                                <td key={raid.id} className={style.tdRaid}>
                                                    {canEnter ? (
                                                        <div className={style.gateRow}>
                                                            {raid.gates.map((_, i) => (
                                                                <button
                                                                    key={i}
                                                                    className={`${style.gateBtn}${gates[i] && char.enabled ? ' ' + style.gateOn : ''}`}
                                                                    onClick={() => toggleGate(char.id, raid.id, i)}
                                                                    disabled={!char.enabled}
                                                                    title={`${raid.gates[i].name} ${getGateGold(raid, i).toLocaleString()}G`}
                                                                >
                                                                    {i + 1}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className={style.na}>—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className={style.tdGold}>
                                            <span className={isGoldChar ? style.goldValue : style.goldValueGray}>
                                                {charGold(char).toLocaleString()} G
                                            </span>
                                        </td>
                                        <td>
                                            <button className={style.removeBtn} onClick={() => removeChar(char.id)}>×</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <p className={style.note}>
                * 골드는 원정대 기준 상위 {MAX_GOLD_CHARS}캐릭터까지 수령 가능합니다. 레이드명 클릭 시 골드 수동 수정 가능.
            </p>
        </div>
    );
};

export default WeeklyGoldPage;
