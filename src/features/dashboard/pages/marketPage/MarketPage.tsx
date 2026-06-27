import { useState, useEffect, useCallback } from 'react';
import { getMarketsOptions, searchMarketItems } from '../../../../shared/api/IpcMarket';
import type { MarketOptions, MarketItem, MarketSearchBody } from '../../../../shared/types/lostark.types';
import { useFavorites } from '../../../../shared/context/FavoritesContext';
import style from './style/MarketPage.module.css';

const MarketPage = () => {
    const [options, setOptions] = useState<MarketOptions | null>(null);
    const [selectedCategoryCode, setSelectedCategoryCode] = useState<number | undefined>(undefined);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedTier, setSelectedTier] = useState('');
    const [itemName, setItemName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<MarketItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentBody, setCurrentBody] = useState<MarketSearchBody | null>(null);

    useEffect(() => {
        getMarketsOptions()
            .then(setOptions)
            .catch(e => setError(e instanceof Error ? e.message : String(e)));
    }, []);

    const doSearch = useCallback(async (body: MarketSearchBody) => {
        setLoading(true);
        setError(null);
        try {
            const res = await searchMarketItems(body);
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

    const buildBody = (): MarketSearchBody => {
        const body: MarketSearchBody = { PageNo: 1 };
        if (selectedCategoryCode !== undefined) body.CategoryCode = selectedCategoryCode;
        if (selectedGrade) body.ItemGrade = selectedGrade;
        if (selectedTier) body.ItemTier = Number(selectedTier);
        if (itemName.trim()) body.ItemName = itemName.trim();
        return body;
    };

    const handleSearch = () => doSearch(buildBody());

    const handleCategorySelect = (code: number) => {
        setSelectedCategoryCode(code);
        const body: MarketSearchBody = { CategoryCode: code, PageNo: 1 };
        if (selectedGrade) body.ItemGrade = selectedGrade;
        if (selectedTier) body.ItemTier = Number(selectedTier);
        if (itemName.trim()) body.ItemName = itemName.trim();
        doSearch(body);
    };

    const goToPage = (page: number) => {
        if (!currentBody) return;
        doSearch({ ...currentBody, PageNo: page });
    };

    const { addFavorite, removeFavorite, isFavorite } = useFavorites();
    const totalPages = Math.max(1, Math.ceil(totalCount / 10));
    const gradeClass = (grade: string) => style[`grade-${grade}`] ?? '';
    const isInitial = !currentBody && !loading && !error;

    return (
        <div className={style.marketLayout}>
            <aside className={style.sidebar}>
                <p className={style.sidebarTitle}>카테고리</p>
                <ul className={style.categoryList}>
                    {options?.Categories.map(cat => (
                        <li key={cat.Code} className={style.categoryItem}>
                            {cat.Subs.length > 0 ? (
                                <details>
                                    <summary>{cat.CodeName}</summary>
                                    <ul className={style.subList}>
                                        {cat.Subs.map(sub => (
                                            <li
                                                key={sub.Code}
                                                className={`${style.subItem}${selectedCategoryCode === sub.Code ? ' ' + style.active : ''}`}
                                                onClick={() => handleCategorySelect(sub.Code)}
                                            >
                                                {sub.CodeName}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            ) : (
                                <div
                                    className={`${style.subItem}${selectedCategoryCode === cat.Code ? ' ' + style.active : ''}`}
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
                <div className={style.filterBar}>
                    <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)}>
                        <option value=''>전체 티어</option>
                        {options?.ItemTiers.map(t => (
                            <option key={t} value={String(t)}>티어 {t}</option>
                        ))}
                    </select>
                    <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                        <option value=''>전체 등급</option>
                        {options?.ItemGrades.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                    <input
                        type='text'
                        placeholder='아이템 이름'
                        value={itemName}
                        onChange={e => setItemName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <button className={style.searchBtn} onClick={handleSearch} disabled={loading}>
                        {loading ? '검색 중...' : '검색'}
                    </button>
                </div>

                <div className={style.resultBox}>
                    {loading ? (
                        <div className={style.stateBox}>검색 중...</div>
                    ) : error ? (
                        <div className={style.stateBox} style={{ color: '#f87171' }}>{error}</div>
                    ) : isInitial ? (
                        <div className={style.stateBox}>카테고리나 아이템명으로 검색하세요.</div>
                    ) : items.length === 0 ? (
                        <div className={style.stateBox}>검색 결과가 없습니다.</div>
                    ) : (
                        <div className={style.tableWrapper}>
                            <table className={style.itemTable}>
                                <thead>
                                    <tr>
                                        <th>아이템</th>
                                        <th>묶음</th>
                                        <th>전일 평균</th>
                                        <th>최근 거래가</th>
                                        <th>최저가</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item: MarketItem) => (
                                        <tr key={item.Id}>
                                            <td>
                                                <div className={style.itemCell}>
                                                    <img className={style.itemIcon} src={item.Icon} alt={item.Name} />
                                                    <div>
                                                        <div className={`${style.itemName} ${gradeClass(item.Grade)}`}>
                                                            {item.Name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={style.itemBundle}>{item.BundleCount}</span></td>
                                            <td className={style.goldPrice}>{item.YDayAvgPrice.toLocaleString()}</td>
                                            <td className={style.goldPrice}>{item.RecentPrice.toLocaleString()}</td>
                                            <td className={style.goldPrice}>{item.CurrentMinPrice.toLocaleString()}</td>
                                            <td>
                                                <button
                                                    className={`${style.starBtn}${isFavorite(item.Id) ? ' ' + style.starred : ''}`}
                                                    onClick={() => isFavorite(item.Id) ? removeFavorite(item.Id) : addFavorite(item)}
                                                    title={isFavorite(item.Id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                                                >★</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalCount > 0 && (
                        <div className={style.pagination}>
                            <button className={style.pageBtn} onClick={() => goToPage(1)} disabled={currentPage <= 1 || loading}>«</button>
                            <button className={style.pageBtn} onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1 || loading}>‹</button>
                            <span className={style.pageInfo}>{currentPage} / {totalPages}</span>
                            <button className={style.pageBtn} onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages || loading}>›</button>
                            <button className={style.pageBtn} onClick={() => goToPage(totalPages)} disabled={currentPage >= totalPages || loading}>»</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MarketPage;
