import { useState } from 'react';
import style from './style/AuctionPage.module.css';

// 임시 카테고리 데이터
const dummyCategories = [
    { name: '전체', sub: [] }, { name: '장비 상자', sub: [] }, { name: '아바타', sub: [] },
    { name: '각인서', sub: [] }, { name: '강화 재료', sub: [] }, { name: '전투용품', sub: [] },
    { name: '요리', sub: [] }, { name: '생활', sub: [] }, { name: '모험의 서', sub: [] },
    { name: '항해', sub: [] }, { name: '펫', sub: [] }, { name: '탈것', sub: [] },
    { name: '기타', sub: [] }, { name: '보석 상자', sub: [] }
];

const AuctionPage = () => {
    // 나중에 실제 상태 관리로 변경될 임시 상태
    const [activeTab, setActiveTab] = useState('거래소 검색');

    return (
        <div className={style.auctionLayout}>
            {/* 왼쪽: 카테고리 사이드바 */}
            <aside className={style.sidebar}>
                <ul className={style.categoryList}>
                    {dummyCategories.map(cat => (
                        <li key={cat.name} className={cat.name === '전체' ? style.activeCategory : ''}>
                            {cat.name}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* 오른쪽: 메인 콘텐츠 */}
            <main className={style.mainContent}>
                <div className={style.tabContainer}>
                    {['거래소 검색', '관심 목록', '내 거래'].map(tabName => (
                        <button 
                            key={tabName}
                            className={`${style.tabButton} ${activeTab === tabName ? style.activeTab : ''}`}
                            onClick={() => setActiveTab(tabName)}
                        >
                            {tabName}
                        </button>
                    ))}
                </div>

                <div className={style.searchContainer}>
                    <div className={style.filterGrid}>
                        <div className={style.filterItem}>
                            <label>아이템 명</label>
                            <input type="text" placeholder="아이템 이름을 입력해주세요." />
                        </div>
                        <div className={style.filterItem}>
                            <label>직업</label>
                            <select><option>전체</option><option>워로드</option></select>
                        </div>
                        <div className={style.filterItem}>
                            <label>아이템 티어</label>
                            <select><option>전체 티어</option></select>
                        </div>
                        <div className={style.filterItem}>
                            <label>아이템 등급</label>
                            <select><option>전체 등급</option></select>
                        </div>
                    </div>
                    <div className={style.searchActions}>
                        <button className={style.searchButton}>검색</button>
                        <button className={style.resetButton}>↻</button>
                    </div>
                </div>
                
                <p className={style.infoText}>
                    최신 데이터 반영은 최대 10분 정도 소요될 수 있으며, 게임과 다소 차이가 있을 수 있으니 양해 부탁 드립니다.
                </p>

                <div className={style.itemResult}>
                    <table className={style.itemTable}>
                        <thead>
                            <tr>
                                <th>등급</th>
                                <th>전일 평균 거래가</th>
                                <th>최근 거래가</th>
                                <th>최저가</th>
                                <th>시세</th>
                                <th>구매</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 현재는 비어있는 상태 */}
                            <tr>
                                <td colSpan={6} className={style.noResults}>
                                    <div className={style.noResultsIcon}>+</div>
                                    <p>검색 결과가 없습니다.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AuctionPage;