import { useState, useMemo } from 'react';
import style from './style/RaidAuctionPage.module.css';

interface Member {
    id: string;
    name: string;
    isFree: boolean; // 프리 = 골드 배분 미참여
}

interface BidRecord {
    id: string;
    itemName: string;
    winnerId: string;
    amount: number;
}

// distribution: 'others' = 낙찰금을 비낙찰자에게만 분배, 'all' = 낙찰자 포함 전체 분배
type DistMode = 'others' | 'all';

const uid = () => crypto.randomUUID();

const STORAGE_KEY = 'loa_raid_auction_v1';

function loadSession() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? null;
    } catch { return null; }
}

function saveSession(data: object) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const RaidAuctionPage = () => {
    const saved = loadSession();

    const [members, setMembers] = useState<Member[]>(saved?.members ?? []);
    const [bids, setBids] = useState<BidRecord[]>(saved?.bids ?? []);
    const [distMode, setDistMode] = useState<DistMode>(saved?.distMode ?? 'others');

    const [newMemberName, setNewMemberName] = useState('');
    const [bidItem, setBidItem] = useState('');
    const [bidWinner, setBidWinner] = useState('');
    const [bidAmount, setBidAmount] = useState('');

    const persist = (m: Member[], b: BidRecord[], dm: DistMode) => saveSession({ members: m, bids: b, distMode: dm });

    const addMember = () => {
        const name = newMemberName.trim();
        if (!name || members.some(m => m.name === name)) return;
        const next = [...members, { id: uid(), name, isFree: false }];
        setMembers(next);
        persist(next, bids, distMode);
        setNewMemberName('');
    };

    const toggleFree = (id: string) => {
        const next = members.map(m => m.id === id ? { ...m, isFree: !m.isFree } : m);
        setMembers(next);
        persist(next, bids, distMode);
    };

    const removeMember = (id: string) => {
        const next = members.filter(m => m.id !== id);
        setMembers(next);
        persist(next, bids, distMode);
    };

    const addBid = () => {
        const amount = Number(bidAmount);
        if (!bidWinner || !amount) return;
        const winner = members.find(m => m.id === bidWinner);
        if (!winner) return;
        const next = [...bids, { id: uid(), itemName: bidItem.trim() || '아이템', winnerId: bidWinner, amount }];
        setBids(next);
        persist(members, next, distMode);
        setBidItem('');
        setBidAmount('');
    };

    const removeBid = (id: string) => {
        const next = bids.filter(b => b.id !== id);
        setBids(next);
        persist(members, next, distMode);
    };

    const changeDistMode = (dm: DistMode) => {
        setDistMode(dm);
        persist(members, bids, dm);
    };

    const reset = () => {
        if (!confirm('현재 세션을 초기화할까요?')) return;
        setMembers([]); setBids([]); setDistMode('others');
        localStorage.removeItem(STORAGE_KEY);
    };

    // 배분 계산
    const result = useMemo(() => {
        // paid: 낙찰자가 지불한 금액
        // received: 받은 골드
        const paid: Record<string, number> = {};
        const received: Record<string, number> = {};
        members.forEach(m => { paid[m.id] = 0; received[m.id] = 0; });

        const eligibleMembers = members.filter(m => !m.isFree);

        for (const bid of bids) {
            paid[bid.winnerId] = (paid[bid.winnerId] ?? 0) + bid.amount;

            if (distMode === 'others') {
                // 낙찰자 제외 프리 아닌 인원에게 배분
                const recipients = eligibleMembers.filter(m => m.id !== bid.winnerId);
                if (!recipients.length) continue;
                const share = bid.amount / recipients.length;
                for (const m of recipients) {
                    received[m.id] = (received[m.id] ?? 0) + share;
                }
            } else {
                // 모든 프리 아닌 인원에게 배분 (낙찰자 포함)
                if (!eligibleMembers.length) continue;
                const share = bid.amount / eligibleMembers.length;
                for (const m of eligibleMembers) {
                    received[m.id] = (received[m.id] ?? 0) + share;
                }
            }
        }

        return members.map(m => ({
            ...m,
            paid: paid[m.id] ?? 0,
            received: received[m.id] ?? 0,
            net: (received[m.id] ?? 0) - (paid[m.id] ?? 0),
        }));
    }, [members, bids, distMode]);

    const totalBids = bids.reduce((s, b) => s + b.amount, 0);

    const getMemberName = (id: string) => members.find(m => m.id === id)?.name ?? id;

    const getSharePerBid = (bid: BidRecord) => {
        const eligible = members.filter(m => !m.isFree);
        if (distMode === 'others') {
            const n = eligible.filter(m => m.id !== bid.winnerId).length;
            return n > 0 ? Math.floor(bid.amount / n) : 0;
        } else {
            return eligible.length > 0 ? Math.floor(bid.amount / eligible.length) : 0;
        }
    };

    return (
        <div className={style.page}>
            <div className={style.header}>
                <h2 className={style.title}>레이드 경매 배분기</h2>
                <button className={style.resetBtn} onClick={reset}>세션 초기화</button>
            </div>

            {/* 파티 구성 */}
            <div className={style.setupCard}>
                <p className={style.sectionLabel}>파티 구성</p>
                <div className={style.memberGrid}>
                    {members.map(m => (
                        <div key={m.id} className={`${style.memberChip} ${m.isFree ? style.memberChipFree : ''}`}>
                            <input
                                className={style.memberName}
                                value={m.name}
                                maxLength={12}
                                onChange={e => {
                                    const next = members.map(x => x.id === m.id ? { ...x, name: e.target.value } : x);
                                    setMembers(next);
                                    persist(next, bids, distMode);
                                }}
                            />
                            <button
                                className={`${style.freeToggle} ${m.isFree ? style.freeToggleOn : ''}`}
                                onClick={() => toggleFree(m.id)}
                                title="프리 토글"
                            >
                                {m.isFree ? '프리' : '일반'}
                            </button>
                            <button className={style.removeMemberBtn} onClick={() => removeMember(m.id)}>✕</button>
                        </div>
                    ))}
                </div>
                <div className={style.addMemberRow}>
                    <input
                        className={style.addMemberInput}
                        placeholder="닉네임 입력"
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addMember()}
                        maxLength={12}
                    />
                    <button className={style.addMemberBtn} onClick={addMember}>+ 추가</button>
                </div>
                <div className={style.distributionRow}>
                    <label>배분 방식</label>
                    <div className={style.radioGroup}>
                        <label className={style.radioLabel}>
                            <input type="radio" name="dist" checked={distMode === 'others'} onChange={() => changeDistMode('others')} />
                            낙찰자 제외 배분
                        </label>
                        <label className={style.radioLabel}>
                            <input type="radio" name="dist" checked={distMode === 'all'} onChange={() => changeDistMode('all')} />
                            전원 배분 (낙찰자 포함)
                        </label>
                    </div>
                </div>
            </div>

            {/* 낙찰 입력 */}
            <div className={style.bidCard}>
                <p className={style.sectionLabel}>낙찰 입력 (총 {bids.length}건 · {totalBids.toLocaleString()} G)</p>
                <div className={style.bidRow}>
                    <div className={style.bidField}>
                        <label>아이템명</label>
                        <input
                            placeholder="예: 유물 목걸이"
                            value={bidItem}
                            onChange={e => setBidItem(e.target.value)}
                        />
                    </div>
                    <div className={style.bidField}>
                        <label>낙찰자</label>
                        <select value={bidWinner} onChange={e => setBidWinner(e.target.value)}>
                            <option value="">선택</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div className={style.bidField}>
                        <label>낙찰가 (G)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={bidAmount}
                            onChange={e => setBidAmount(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addBid()}
                        />
                    </div>
                    <button className={style.addBidBtn} onClick={addBid}>추가</button>
                </div>

                {bids.length > 0 && (
                    <div className={style.bidHistory}>
                        {bids.map((b, i) => (
                            <div key={b.id} className={style.bidItem}>
                                <span className={style.bidIdx}>{i + 1}</span>
                                <span className={style.bidItemName}>{b.itemName}</span>
                                <span className={style.bidWinner}>{getMemberName(b.winnerId)}</span>
                                <span className={style.bidAmount}>{b.amount.toLocaleString()} G</span>
                                <span className={style.bidShare}>1인당 +{getSharePerBid(b).toLocaleString()} G</span>
                                <button className={style.removeBidBtn} onClick={() => removeBid(b.id)}>✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 정산 결과 */}
            {members.length > 0 && bids.length > 0 && (
                <div className={style.resultCard}>
                    <p className={style.sectionLabel} style={{ color: '#c4b5fd' }}>정산 결과</p>
                    <table className={style.resultTable}>
                        <thead>
                            <tr>
                                <th>닉네임</th>
                                <th>지불 (낙찰)</th>
                                <th>수령 (배분)</th>
                                <th>순수익</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.map(m => (
                                <tr key={m.id}>
                                    <td className={style.tdName}>
                                        {m.name}
                                        {m.isFree && <span className={style.tdFree}> (프리)</span>}
                                    </td>
                                    <td className={style.tdPaid}>
                                        {m.paid > 0 ? `−${Math.round(m.paid).toLocaleString()} G` : '—'}
                                    </td>
                                    <td className={style.tdReceived}>
                                        {m.received > 0 ? `+${Math.round(m.received).toLocaleString()} G` : '—'}
                                    </td>
                                    <td className={m.net >= 0 ? style.tdNetPos : style.tdNetNeg}>
                                        {m.net >= 0 ? '+' : ''}{Math.round(m.net).toLocaleString()} G
                                    </td>
                                </tr>
                            ))}
                            <tr className={style.totalRow}>
                                <td colSpan={2} style={{ textAlign: 'left', color: '#a1a1aa' }}>총 낙찰금</td>
                                <td colSpan={2} style={{ color: '#facc15' }}>{totalBids.toLocaleString()} G</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {members.length === 0 && (
                <div style={{ color: '#52525b', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>
                    파티원을 추가하고 낙찰 내역을 입력하면 자동으로 배분을 계산합니다.
                </div>
            )}
        </div>
    );
};

export default RaidAuctionPage;
