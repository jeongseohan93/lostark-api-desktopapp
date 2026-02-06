import { useState } from 'react';
import style from './style/MarketPage.module.css';

// 임시 데이터 (나중에 API로 대체)
const dummyCategories = [
    { name: '전체', sub: [] },
    { name: '장비', sub: ['무기', '방어구', '장신구'] },
    { name: '아바타', sub: ['무기', '상의', '하의'] },
    { name: '각인서', sub: [] },
    { name: '강화 재료', sub: [] },
];


const MarketPage = () => {
    // 나중에 실제 상태 관리로 변경될 임시 상태
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className={style.marketLayout}>
            {/* 왼쪽: 카테고리 사이드바 */}
            <aside className={style.sidebar}>
                <h2 className={style.title}>거래소</h2>
                <ul className={style.categoryList}>
                    {dummyCategories.map(cat => (
                        <li key={cat.name}>
                            <details open={cat.name === '전체'}>
                                <summary>{cat.name}</summary>
                                {cat.sub.length > 0 && (
                                    <ul>
                                        {cat.sub.map(subCat => <li key={subCat}>{subCat}</li>)}
                                    </ul>
                                )}
                            </details>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* 오른쪽: 메인 콘텐츠 */}
            <main className={style.mainContent}>
                <div className={style.filterBar}>
                    <select><option>전체 티어</option></select>
                    <select><option>전체 등급</option></select>
                    <input 
                        type="text" 
                        placeholder="아이템 이름" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className={style.searchButton}>🔍</button>
                </div>

                <div className={style.itemList}>
                    <table className={style.itemTable}>
                        <thead>
                            <tr>
                                <th>등급</th>
                                <th>아이템 이름</th>
                                <th>전일 평균 거래가</th>
                                <th>최근 거래가</th>
                                <th>최저가</th>
                                <th>남은 수량</th>
                            </tr>
                        </thead>
                        <tbody>
                            
                        </tbody>
                    </table>
                </div>

                <div className={style.pagination}>
                    <button>&lt;&lt;</button>
                    <button>&lt;</button>
                    <span>1 / 1</span>
                    <button>&gt;</button>
                    <button>&gt;&gt;</button>
                </div>
            </main>
        </div>
    );
};

export default MarketPage;