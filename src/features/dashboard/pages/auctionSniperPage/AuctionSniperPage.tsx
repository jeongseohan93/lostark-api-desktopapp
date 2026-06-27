import { useState } from 'react';
import { useAuctionSniper, SniperCondition } from '../../../../shared/context/AuctionSniperContext';
import style from './style/AuctionSniperPage.module.css';

const GRADES = ['일반', '고급', '희귀', '영웅', '전설', '유물', '고대'];

interface FormState {
    label: string;
    categoryCode: string;
    grade: string;
    tier: string;
    maxBuyPrice: string;
    minQuality: string;
    engravings: { name: string; minLevel: string }[];
    enabled: boolean;
}

const defaultForm = (): FormState => ({
    label: '',
    categoryCode: '',
    grade: '',
    tier: '',
    maxBuyPrice: '',
    minQuality: '',
    engravings: [],
    enabled: true,
});

const AuctionSniperPage = () => {
    const { conditions, hits, lastPolled, polling, addCondition, removeCondition, updateCondition, clearHits, pollNow } = useAuctionSniper();
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(defaultForm());

    const openAdd = () => { setForm(defaultForm()); setEditId(null); setShowForm(true); };

    const openEdit = (c: SniperCondition) => {
        setForm({
            label: c.label,
            categoryCode: c.categoryCode?.toString() ?? '',
            grade: c.grade ?? '',
            tier: c.tier?.toString() ?? '',
            maxBuyPrice: c.maxBuyPrice?.toString() ?? '',
            minQuality: c.minQuality?.toString() ?? '',
            engravings: c.engravings.map(e => ({ name: e.name, minLevel: e.minLevel.toString() })),
            enabled: c.enabled,
        });
        setEditId(c.id);
        setShowForm(true);
    };

    const handleSave = () => {
        if (!form.label.trim()) return;
        const patch: Omit<SniperCondition, 'id'> = {
            label: form.label.trim(),
            categoryCode: form.categoryCode ? Number(form.categoryCode) : undefined,
            grade: form.grade || undefined,
            tier: form.tier ? Number(form.tier) : undefined,
            maxBuyPrice: form.maxBuyPrice ? Number(form.maxBuyPrice) : undefined,
            minQuality: form.minQuality ? Number(form.minQuality) : undefined,
            engravings: form.engravings.filter(e => e.name.trim()).map(e => ({ name: e.name.trim(), minLevel: Number(e.minLevel) || 1 })),
            enabled: form.enabled,
        };
        if (editId) {
            updateCondition(editId, patch);
        } else {
            addCondition(patch);
        }
        setShowForm(false);
    };

    const addEngraving = () => setForm(f => ({ ...f, engravings: [...f.engravings, { name: '', minLevel: '3' }] }));
    const removeEngraving = (i: number) => setForm(f => ({ ...f, engravings: f.engravings.filter((_, idx) => idx !== i) }));
    const updateEngraving = (i: number, field: 'name' | 'minLevel', val: string) =>
        setForm(f => ({ ...f, engravings: f.engravings.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }));

    return (
        <div className={style.page}>
            {/* Header */}
            <div className={style.header}>
                <h2 className={style.title}>경매장 스나이핑</h2>
                <div className={style.headerRight}>
                    <div className={`${style.statusDot} ${polling ? style.statusDotActive : ''}`} title={polling ? '폴링 중' : '대기'} />
                    <span className={style.pollInfo}>
                        {lastPolled ? `마지막: ${lastPolled.toLocaleTimeString('ko-KR')}` : '미조회'}
                    </span>
                    <button className={style.pollNowBtn} onClick={pollNow} disabled={polling}>
                        {polling ? '조회 중...' : '지금 조회'}
                    </button>
                    <button className={style.addBtn} onClick={openAdd}>+ 조건 추가</button>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className={style.formCard}>
                    <p className={style.formTitle}>{editId ? '조건 수정' : '새 스나이핑 조건'}</p>
                    <div className={style.formRow}>
                        <div className={style.formField} style={{ flex: 2, minWidth: 160 }}>
                            <label>이름 *</label>
                            <input
                                type="text"
                                placeholder="예: 강화 각인 헬멧"
                                value={form.label}
                                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                            />
                        </div>
                        <div className={style.formField}>
                            <label>카테고리 코드</label>
                            <input
                                type="number"
                                placeholder="예: 200010"
                                value={form.categoryCode}
                                onChange={e => setForm(f => ({ ...f, categoryCode: e.target.value }))}
                            />
                        </div>
                        <div className={style.formField}>
                            <label>등급</label>
                            <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}>
                                <option value="">전체</option>
                                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className={style.formField}>
                            <label>티어</label>
                            <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                                <option value="">전체</option>
                                <option value="1">T1</option>
                                <option value="2">T2</option>
                                <option value="3">T3</option>
                            </select>
                        </div>
                    </div>
                    <div className={style.formRow}>
                        <div className={style.formField}>
                            <label>즉구가 상한 (G)</label>
                            <input
                                type="number"
                                placeholder="최대 즉구가"
                                value={form.maxBuyPrice}
                                onChange={e => setForm(f => ({ ...f, maxBuyPrice: e.target.value }))}
                            />
                        </div>
                        <div className={style.formField}>
                            <label>최소 품질</label>
                            <input
                                type="number"
                                placeholder="0~100"
                                min={0}
                                max={100}
                                value={form.minQuality}
                                onChange={e => setForm(f => ({ ...f, minQuality: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Engravings */}
                    <div className={style.formField} style={{ marginBottom: '0.5rem' }}>
                        <label>각인 조건</label>
                    </div>
                    <div className={style.engravingList}>
                        {form.engravings.map((eng, i) => (
                            <div key={i} className={style.engravingRow}>
                                <input
                                    type="text"
                                    placeholder="각인명"
                                    value={eng.name}
                                    onChange={e => updateEngraving(i, 'name', e.target.value)}
                                    style={{ width: 160 }}
                                />
                                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>레벨 ≥</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={3}
                                    value={eng.minLevel}
                                    onChange={e => updateEngraving(i, 'minLevel', e.target.value)}
                                    style={{ width: 50 }}
                                />
                                <button className={style.removeEngBtn} onClick={() => removeEngraving(i)}>✕</button>
                            </div>
                        ))}
                        <button className={style.addEngBtn} onClick={addEngraving}>+ 각인 추가</button>
                    </div>

                    <div className={style.formActions}>
                        <button className={style.saveBtn} onClick={handleSave}>저장</button>
                        <button className={style.cancelBtn} onClick={() => setShowForm(false)}>취소</button>
                    </div>
                </div>
            )}

            {/* Conditions */}
            {conditions.length > 0 && (
                <>
                    <p className={style.sectionTitle}>스나이핑 조건 ({conditions.length})</p>
                    <div className={style.conditionList}>
                        {conditions.map(c => (
                            <div key={c.id} className={`${style.condCard} ${c.enabled ? style.condCardEnabled : ''}`}>
                                <div className={style.condLeft}>
                                    <span className={style.condLabel}>{c.label}</span>
                                    <div className={style.condTags}>
                                        {c.grade && <span className={style.tag}>{c.grade}</span>}
                                        {c.tier && <span className={style.tag}>T{c.tier}</span>}
                                        {c.maxBuyPrice && <span className={`${style.tag} ${style.tagPrice}`}>≤ {c.maxBuyPrice.toLocaleString()} G</span>}
                                        {c.minQuality && <span className={style.tag}>품질 ≥ {c.minQuality}</span>}
                                        {c.engravings.map(e => (
                                            <span key={e.name} className={`${style.tag} ${style.tagEngrave}`}>{e.name} Lv{e.minLevel}+</span>
                                        ))}
                                    </div>
                                </div>
                                <div className={style.condRight}>
                                    <label className={style.toggleSwitch}>
                                        <input
                                            type="checkbox"
                                            checked={c.enabled}
                                            onChange={e => updateCondition(c.id, { enabled: e.target.checked })}
                                        />
                                        <span className={style.toggleTrack} />
                                        <span className={style.toggleThumb} />
                                    </label>
                                    <button className={style.editCondBtn} onClick={() => openEdit(c)}>수정</button>
                                    <button className={style.deleteCondBtn} onClick={() => removeCondition(c.id)}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {conditions.length === 0 && !showForm && (
                <div className={style.empty}>
                    조건이 없습니다. "+ 조건 추가" 버튼으로 스나이핑 조건을 만들어보세요.
                </div>
            )}

            {/* Hits */}
            {hits.length > 0 && (
                <>
                    <div className={style.hitsHeader}>
                        <p className={style.sectionTitle} style={{ margin: 0 }}>발견된 아이템</p>
                        <span className={style.hitsBadge}>{hits.length}</span>
                        <button className={style.clearBtn} onClick={clearHits}>목록 지우기</button>
                    </div>
                    <div className={style.hitList}>
                        {hits.map((h, i) => (
                            <div key={i} className={style.hitCard}>
                                <span className={style.hitLabel}>{h.conditionLabel}</span>
                                <span className={style.hitItemName}>{h.item.Name}</span>
                                <span className={style.hitPrice}>
                                    {h.item.AuctionInfo.BuyPrice?.toLocaleString() ?? '?'} G
                                </span>
                                <span className={style.hitTime}>
                                    {new Date(h.foundAt).toLocaleTimeString('ko-KR')}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default AuctionSniperPage;
