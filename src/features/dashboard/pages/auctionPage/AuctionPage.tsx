import { useState, useEffect, useCallback } from 'react';
import { getAuctionsOptions, searchAuctionItems } from '../../../../shared/api/IpcAuction';
import type { AuctionOptions, AuctionItem, AuctionSearchBody } from '../../../../shared/types/lostark.types';
import style from './style/AuctionPage.module.css';

const formatRemaining = (dateStr: string): string => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return '종료';
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    if (h >= 24) return `${Math.floor(h / 24)}일 ${h % 24}시간`;
    return `${h}시간 ${m}분`;
};

const AuctionPage = () => {
    const [options, setOptions] = useState<AuctionOptions | null>(null);
    const [selectedCategoryCode, setSelectedCategoryCode] = useState<number | undefined>(undefined);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedTier, setSelectedTier] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [itemName, setItemName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<AuctionItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentBody, setCurrentBody] = useState<AuctionSearchBody | null>(null);

    useEffect(() => {
        getAuctionsOptions()
            .then(setOptions)
            .catch(e => setError(e instanceof Error ? e.message : String(e)));
    }, []);

    const doSearch = useCallback(async (body: AuctionSearchBody) => {
        setLoading(true);
        setError(null);
        try {
            const res = await searchAuctionItems(body);
            setItems(res.Items ?? []);
            setTotalCount(res.TotalCount ?? 0);
            setCurrentPage(body.PageNo ?? 1);
            setCurrentBody(body);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
            setItems([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const buildBody = (): AuctionSearchBody => {
        const body: AuctionSearchBody = { Sort: 'BUY_PRICE', PageNo: 1 };
        if (selectedCategoryCode !== undefined) body.CategoryCode = selectedCategoryCode;
        if (selectedGrade) body.ItemGrade = selectedGrade;
        if (selectedTier) body.ItemTier = Number(selectedTier);
        if (selectedClass) body.CharacterClass = selectedClass;
        if (itemName.trim()) body.ItemName = itemName.trim();
        return body;
    };

    const handleSearch = () => doSearch(buildBody());

    const handleReset = () => {
        setSelectedCategoryCode(undefined);
        setSelectedGrade('');
        setSelectedTier('');
        setSelectedClass('');
        setItemName('');
        setItems([]);
        setTotalCount(0);
        setCurrentBody(null);
        setError(null);
    };

    const handleCategorySelect = (code: number) => {
        setSelectedCategoryCode(code);
        const body: AuctionSearchBody = { Sort: 'BUY_PRICE', CategoryCode: code, PageNo: 1 };
        if (selectedGrade) body.ItemGrade = selectedGrade;
        if (selectedTier) body.ItemTier = Number(selectedTier);
        if (selectedClass) body.CharacterClass = selectedClass;
        if (itemName.trim()) body.ItemName = itemName.trim();
        doSearch(body);
    };

    const goToPage = (page: number) => {
        if (!currentBody) return;
        doSearch({ ...currentBody, PageNo: page });
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / 10));
    const gradeClass = (grade: string) => style[`grade-${grade}`] ?? '';
    const isInitial = !currentBody && !loading && !error;

    const keyEngravings = (item: AuctionItem) =>
        item.Options.filter(o => o.Type === 'ABILITY_ENGRAVE').slice(0, 3);

    return (
        <div className={style.auctionLayout}>
            <aside className={style.sidebar}>
                <p className={style.sidebarTitle}>카테고리</p>
                <ul className={style.categoryList}>
                    {options?.Categories.map(cat => (
                        <li key={cat.Code}>
                            {cat.Subs.length > 0 ? (
                                <details>
                                    <summary>{cat.CodeName}</summary>
                                    <ul className={style.subList}>
                                        {cat.Subs.map(sub => (
                                            <li
                                                key={sub.Code}
                                                className={`${style.subItem}${selectedCategoryCode === sub.Code ? ' ' + style.activeCategory : ''}`}
                                                onClick={() => handleCategorySelect(sub.Code)}
                                            >
                                                {sub.CodeName}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            ) : (
                                <div
                                    className={`${style.subItem}${selectedCategoryCode === cat.Code ? ' ' + style.activeCategory : ''}`}
                                    onClick={() => handleCategorySelect(cat.Code)}
                                >
                                    {cat.CodeName}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </aside>

            <main className={style.mainContent}>
                <div className={style.searchContainer}>
                    <div className={style.filterGrid}>
                        <div className={style.filterItem}>
                            <label>아이템 명</label>
                            <input
                                type='text'
                                placeholder='아이템 이름을 입력해주세요.'
                                value={itemName}
                                onChange={e => setItemName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className={style.filterItem}>
                            <label>직업</label>
                            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                <option value=''>전체</option>
                                {options?.Classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className={style.filterItem}>
                            <label>아이템 티어</label>
                            <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)}>
                                <option value=''>전체 티어</option>
                                {options?.ItemTiers.map(t => <option key={t} value={String(t)}>티어 {t}</option>)}
                            </select>
                        </div>
                        <div className={style.filterItem}>
                            <label>아이템 등급</label>
                            <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                                <option value=''>전체 등급</option>
                                {options?.ItemGrades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className={style.searchActions}>
                        <button className={style.searchButton} onClick={handleSearch} disabled={loading}>
                            {loading ? '...' : '검색'}
                        </button>
                        <button className={style.resetButton} onClick={handleReset} disabled={loading}>↻</button>
                    </div>
                </div>

                <p className={style.infoText}>
                    최신 데이터 반영은 최대 10분 정도 소요될 수 있으며, 게임과 다소 차이가 있을 수 있으니 양해 부탁 드립니다.
                </p>

                <div className={style.itemResult}>
                    {loading ? (
                        <div className={style.stateBox}>검색 중...</div>
                    ) : error ? (
                        <div className={style.stateBox} style={{ color: '#f87171' }}>{error}</div>
                    ) : isInitial ? (
                        <div className={style.stateBox}>카테고리나 아이템명으로 검색하세요.</div>
                    ) : items.length === 0 ? (
                        <div className={style.noResults}>
                            <div className={style.noResultsIcon}>+</div>
                            <p>검색 결과가 없습니다.</p>
                        </div>
                    ) : (
                        <>
                            <table className={style.itemTable}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>아이템</th>
                                        <th>품질</th>
                                        <th>각인</th>
                                        <th>즉구가</th>
                                        <th>입찰가</th>
                                        <th>종료</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx} className={style.itemRow}>
                                            <td>
                                                <div className={style.itemCell}>
                                                    <img className={style.itemIcon} src={item.Icon} alt={item.Name} />
                                                    <div>
                                                        <div className={`${style.itemName} ${gradeClass(item.Grade)}`}>
                                                            {item.Name}
                                                        </div>
                                                        <div className={style.itemGrade}>{item.Grade}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={style.quality}>
                                                {item.GradeQuality !== null ? item.GradeQuality : '-'}
                                            </td>
                                            <td className={style.options}>
                                                {keyEngravings(item).map((opt, i) => (
                                                    <span
                                                        key={i}
                                                        className={`${style.optTag}${opt.IsPenalty ? ' ' + style.penalty : ''}`}
                                                    >
                                                        {opt.OptionName} {opt.Value}
                                                    </span>
                                                ))}
                                            </td>
                                            <td className={style.goldPrice}>
                                                {item.AuctionInfo.BuyPrice !== null
                                                    ? item.AuctionInfo.BuyPrice.toLocaleString()
                                                    : '-'}
                                            </td>
                                            <td className={style.goldPrice}>
                                                {item.AuctionInfo.BidPrice.toLocaleString()}
                                            </td>
                                            <td className={style.endTime}>
                                                {formatRemaining(item.AuctionInfo.EndDate)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {totalCount > 0 && (
                                <div className={style.pagination}>
                                    <button className={style.pageBtn} onClick={() => goToPage(1)} disabled={currentPage <= 1 || loading}>«</button>
                                    <button className={style.pageBtn} onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1 || loading}>‹</button>
                                    <span className={style.pageInfo}>{currentPage} / {totalPages}</span>
                                    <button className={style.pageBtn} onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages || loading}>›</button>
                                    <button className={style.pageBtn} onClick={() => goToPage(totalPages)} disabled={currentPage >= totalPages || loading}>»</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AuctionPage;
