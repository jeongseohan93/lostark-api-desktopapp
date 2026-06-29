import { useState } from 'react';
import { useAuctionSniper, SniperCondition } from '../../../../shared/context/AuctionSniperContext';
import style from './style/AuctionSniperPage.module.css';

const GRADES = ['일반', '고급', '희귀', '영웅', '전설', '유물', '고대'];

interface FormState {
  label: string;
  categoryCode: string;
  grade: string;
  tier: string;
  baselinePrice: string;
  riseAmount: string;
  risePercent: string;
  minQuality: string;
  engravings: { name: string; minLevel: string }[];
  enabled: boolean;
}

const defaultForm = (): FormState => ({
  label: '',
  categoryCode: '',
  grade: '',
  tier: '',
  baselinePrice: '',
  riseAmount: '',
  risePercent: '',
  minQuality: '',
  engravings: [],
  enabled: true,
});

const optionalNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const AuctionSniperPage = () => {
  const {
    conditions,
    hits,
    lastPrices,
    lastPolled,
    polling,
    addCondition,
    removeCondition,
    updateCondition,
    clearHits,
    pollNow,
  } = useAuctionSniper();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());

  const openAdd = () => {
    setForm(defaultForm());
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (condition: SniperCondition) => {
    setForm({
      label: condition.label,
      categoryCode: condition.categoryCode?.toString() ?? '',
      grade: condition.grade ?? '',
      tier: condition.tier?.toString() ?? '',
      baselinePrice: condition.baselinePrice?.toString() ?? '',
      riseAmount: condition.riseAmount?.toString() ?? '',
      risePercent: condition.risePercent?.toString() ?? '',
      minQuality: condition.minQuality?.toString() ?? '',
      engravings: condition.engravings.map(engraving => ({ name: engraving.name, minLevel: engraving.minLevel.toString() })),
      enabled: condition.enabled,
    });
    setEditId(condition.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.label.trim()) return;

    const nextCondition: Omit<SniperCondition, 'id'> = {
      label: form.label.trim(),
      categoryCode: optionalNumber(form.categoryCode),
      grade: form.grade || undefined,
      tier: optionalNumber(form.tier),
      baselinePrice: optionalNumber(form.baselinePrice),
      riseAmount: optionalNumber(form.riseAmount),
      risePercent: optionalNumber(form.risePercent),
      minQuality: optionalNumber(form.minQuality),
      engravings: form.engravings
        .filter(engraving => engraving.name.trim())
        .map(engraving => ({ name: engraving.name.trim(), minLevel: optionalNumber(engraving.minLevel) ?? 1 })),
      enabled: form.enabled,
    };

    if (editId) updateCondition(editId, nextCondition);
    else addCondition(nextCondition);

    setShowForm(false);
  };

  const addEngraving = () => setForm(prev => ({ ...prev, engravings: [...prev.engravings, { name: '', minLevel: '3' }] }));
  const removeEngraving = (index: number) => setForm(prev => ({ ...prev, engravings: prev.engravings.filter((_, idx) => idx !== index) }));
  const updateEngraving = (index: number, field: 'name' | 'minLevel', value: string) => {
    setForm(prev => ({
      ...prev,
      engravings: prev.engravings.map((engraving, idx) => (idx === index ? { ...engraving, [field]: value } : engraving)),
    }));
  };

  return (
    <div className={style.page}>
      <div className={style.header}>
        <div>
          <h2 className={style.title}>경매장 가격 상승 알림</h2>
          <p className={style.pollInfo}>원하는 옵션의 최저가가 기준보다 올랐을 때 알려줍니다.</p>
        </div>
        <div className={style.headerRight}>
          <div className={`${style.statusDot} ${polling ? style.statusDotActive : ''}`} title={polling ? '조회 중' : '대기'} />
          <span className={style.pollInfo}>
            {lastPolled ? `마지막 ${lastPolled.toLocaleTimeString('ko-KR')}` : '미조회'}
          </span>
          <button className={style.pollNowBtn} onClick={pollNow} disabled={polling}>
            {polling ? '조회 중...' : '지금 조회'}
          </button>
          <button className={style.addBtn} onClick={openAdd}>+ 조건 추가</button>
        </div>
      </div>

      {showForm && (
        <div className={style.formCard}>
          <p className={style.formTitle}>{editId ? '조건 수정' : '새 가격 상승 조건'}</p>
          <div className={style.formRow}>
            <div className={style.formField} style={{ flex: 2, minWidth: 180 }}>
              <label>조건 이름 *</label>
              <input
                type="text"
                placeholder="예: 고대 목걸이 치특"
                value={form.label}
                onChange={event => setForm(prev => ({ ...prev, label: event.target.value }))}
              />
            </div>
            <div className={style.formField}>
              <label>카테고리 코드</label>
              <input
                type="number"
                placeholder="예: 200010"
                value={form.categoryCode}
                onChange={event => setForm(prev => ({ ...prev, categoryCode: event.target.value }))}
              />
            </div>
            <div className={style.formField}>
              <label>등급</label>
              <select value={form.grade} onChange={event => setForm(prev => ({ ...prev, grade: event.target.value }))}>
                <option value="">전체</option>
                {GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
              </select>
            </div>
            <div className={style.formField}>
              <label>티어</label>
              <select value={form.tier} onChange={event => setForm(prev => ({ ...prev, tier: event.target.value }))}>
                <option value="">전체</option>
                <option value="1">T1</option>
                <option value="2">T2</option>
                <option value="3">T3</option>
                <option value="4">T4</option>
              </select>
            </div>
          </div>

          <div className={style.formRow}>
            <div className={style.formField}>
              <label>기준가 (G)</label>
              <input
                type="number"
                placeholder="처음 비교할 가격"
                value={form.baselinePrice}
                onChange={event => setForm(prev => ({ ...prev, baselinePrice: event.target.value }))}
              />
            </div>
            <div className={style.formField}>
              <label>상승폭 알림 (G)</label>
              <input
                type="number"
                placeholder="예: 1000"
                value={form.riseAmount}
                onChange={event => setForm(prev => ({ ...prev, riseAmount: event.target.value }))}
              />
            </div>
            <div className={style.formField}>
              <label>상승률 알림 (%)</label>
              <input
                type="number"
                placeholder="예: 5"
                value={form.risePercent}
                onChange={event => setForm(prev => ({ ...prev, risePercent: event.target.value }))}
              />
            </div>
            <div className={style.formField}>
              <label>최소 품질</label>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="0~100"
                value={form.minQuality}
                onChange={event => setForm(prev => ({ ...prev, minQuality: event.target.value }))}
              />
            </div>
          </div>

          <div className={style.formField} style={{ marginBottom: '0.5rem' }}>
            <label>각인 조건</label>
          </div>
          <div className={style.engravingList}>
            {form.engravings.map((engraving, index) => (
              <div key={index} className={style.engravingRow}>
                <input
                  type="text"
                  placeholder="각인명"
                  value={engraving.name}
                  onChange={event => updateEngraving(index, 'name', event.target.value)}
                  style={{ width: 160 }}
                />
                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>레벨</span>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={engraving.minLevel}
                  onChange={event => updateEngraving(index, 'minLevel', event.target.value)}
                  style={{ width: 54 }}
                />
                <button className={style.removeEngBtn} onClick={() => removeEngraving(index)}>×</button>
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

      {conditions.length > 0 ? (
        <>
          <p className={style.sectionTitle}>감시 조건 ({conditions.length})</p>
          <div className={style.conditionList}>
            {conditions.map(condition => (
              <div key={condition.id} className={`${style.condCard} ${condition.enabled ? style.condCardEnabled : ''}`}>
                <div className={style.condLeft}>
                  <span className={style.condLabel}>{condition.label}</span>
                  <div className={style.condTags}>
                    {condition.grade && <span className={style.tag}>{condition.grade}</span>}
                    {condition.tier && <span className={style.tag}>T{condition.tier}</span>}
                    {condition.baselinePrice && <span className={style.tag}>기준 {condition.baselinePrice.toLocaleString()}G</span>}
                    {condition.riseAmount && <span className={`${style.tag} ${style.tagPrice}`}>+{condition.riseAmount.toLocaleString()}G</span>}
                    {condition.risePercent && <span className={`${style.tag} ${style.tagPrice}`}>+{condition.risePercent}%</span>}
                    {condition.minQuality && <span className={style.tag}>품질 {condition.minQuality}+</span>}
                    {lastPrices[condition.id] && <span className={style.tag}>현재 {lastPrices[condition.id].toLocaleString()}G</span>}
                    {condition.engravings.map(engraving => (
                      <span key={`${condition.id}-${engraving.name}`} className={`${style.tag} ${style.tagEngrave}`}>{engraving.name} Lv{engraving.minLevel}+</span>
                    ))}
                  </div>
                </div>
                <div className={style.condRight}>
                  <label className={style.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={condition.enabled}
                      onChange={event => updateCondition(condition.id, { enabled: event.target.checked })}
                    />
                    <span className={style.toggleTrack} />
                    <span className={style.toggleThumb} />
                  </label>
                  <button className={style.editCondBtn} onClick={() => openEdit(condition)}>수정</button>
                  <button className={style.deleteCondBtn} onClick={() => removeCondition(condition.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : !showForm ? (
        <div className={style.empty}>조건이 없습니다. 가격 상승을 보고 싶은 매물 조건을 추가하세요.</div>
      ) : null}

      {hits.length > 0 && (
        <>
          <div className={style.hitsHeader}>
            <p className={style.sectionTitle} style={{ margin: 0 }}>가격 상승 알림</p>
            <span className={style.hitsBadge}>{hits.length}</span>
            <button className={style.clearBtn} onClick={clearHits}>알림 지우기</button>
          </div>
          <div className={style.hitList}>
            {hits.map((hit, index) => (
              <div key={`${hit.conditionId}-${hit.foundAt}-${index}`} className={style.hitCard}>
                <span className={style.hitLabel}>{hit.conditionLabel}</span>
                <span className={style.hitItemName}>{hit.item.Name}</span>
                <span className={style.hitPrice}>{hit.currentPrice.toLocaleString()} G</span>
                <span className={style.hitLabel}>
                  +{hit.riseAmount.toLocaleString()}G / +{hit.risePercent.toFixed(1)}%
                </span>
                <span className={style.hitTime}>{new Date(hit.foundAt).toLocaleTimeString('ko-KR')}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AuctionSniperPage;
