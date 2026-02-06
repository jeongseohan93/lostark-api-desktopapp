import { useState } from 'react';
import style from './style/CharacterSearchPage.module.css';

// 스크린샷에 보이는 모든 정보를 담은 임시 데이터 객체
const dummyCharacterData = {
    rosterLevel: 359,
    combatLevel: 70,
    itemLevel: '1,748.33',
    attackPower: '2,054.68',
    title: '이클립스',
    guild: '데빌라',
    pvp: '초단',
    estate: 'Ellquines',
    basicStats: {
        attack: 171810,
        hp: 326368,
    },
    combatStats: [
        { name: '치명', value: 73 },
        { name: '특화', value: 1179 },
        { name: '제압', value: 79 },
        { name: '신속', value: 1300 },
        { name: '인내', value: 69 },
        { name: '숙련', value: 75 },
    ],
    engravings: [
        { name: '돌격대장', level: 3 },
        { name: '안정된 상태', level: 0 },
        { name: '선수필승', level: 0 },
    ],
    virtues: {
        intellect: 603,
        courage: 624,
        charm: 534,
        kindness: 0, // 스크린샷에 없음
    },
    equipment: [
        // 머리, 어깨, 상의, 하의, 장갑, 무기
        { type: '머리', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png', level: 21 },
        { type: '어깨', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png', level: 21 },
        { type: '상의', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png', level: 21 },
        { type: '하의', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png', level: 21 },
        { type: '장갑', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png', level: 21 },
        { type: '무기', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png', level: 21 },
    ],
    accessories: [
        // 목걸이, 귀걸이1, 귀걸이2, 반지1, 반지2
        { type: '목걸이', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png' },
        { type: '귀걸이', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png' },
        { type: '귀걸이', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png' },
        { type: '반지', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png' },
        { type: '반지', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/item_grade/icon_item_grade_50.png' },
    ],
};

const CharacterSearchPage = () => {
    const [characterName, setCharacterName] = useState('');

    return (
        <div className={style.searchPage}>
            {/* 상단 검색바 */}
            <div className={style.searchBar}>
                <input 
                    type="text" 
                    placeholder="캐릭터 명을 입력하세요"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                />
                <button>검색</button>
            </div>

            {/* 메인 프로필 */}
            <div className={style.profileContainer}>
                {/* 왼쪽 정보 */}
                <aside className={style.leftColumn}>
                    <div className={style.levelInfo}>
                        <span>원정대 레벨 <p>Lv.{dummyCharacterData.rosterLevel}</p></span>
                        <span>전투 레벨 <p>Lv.{dummyCharacterData.combatLevel}</p></span>
                    </div>
                    <div className={style.itemLevel}>
                        <p>장착 아이템 레벨</p>
                        <span>Lv.{dummyCharacterData.itemLevel}</span>
                    </div>
                    <div className={style.basicInfo}>
                        <div className={style.infoRow}>
                            <label>칭호</label><span>{dummyCharacterData.title}</span>
                        </div>
                        <div className={style.infoRow}>
                            <label>길드</label><span>{dummyCharacterData.guild}</span>
                        </div>
                        <div className={style.infoRow}>
                            <label>PVP</label><span>{dummyCharacterData.pvp}</span>
                        </div>
                        <div className={style.infoRow}>
                            <label>영지</label><span>Lv.70 {dummyCharacterData.estate}</span>
                        </div>
                    </div>
                </aside>

                {/* 중앙 캐릭터 및 장비 */}
                <section className={style.centerColumn}>
                    <div className={style.characterRender}>
                        {/* 요청대로 대체 이미지를 사용합니다. */}
                        <img alt="character" />
                    </div>
                    <div className={style.equipment}>
                        <div className={style.equipLeft}>
                            {dummyCharacterData.equipment.slice(0, 3).map(item => (
                                <div key={item.type} className={style.equipSlot}>
                                    <img src={item.icon} alt={item.type} />
                                    <span>+{item.level}</span>
                                </div>
                            ))}
                        </div>
                        <div className={style.equipRight}>
                             {dummyCharacterData.equipment.slice(3, 6).map(item => (
                                <div key={item.type} className={style.equipSlot}>
                                    <img src={item.icon} alt={item.type} />
                                    <span>+{item.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 오른쪽 상세 정보 */}
                <aside className={style.rightColumn}>
                    <div className={style.infoBlock}>
                        <h3>기본 특성</h3>
                        <div className={style.statRow}><span>공격력</span><span>{dummyCharacterData.basicStats.attack}</span></div>
                        <div className={style.statRow}><span>최대 생명력</span><span>{dummyCharacterData.basicStats.hp}</span></div>
                    </div>
                     <div className={style.infoBlock}>
                        <h3>전투 특성</h3>
                        {dummyCharacterData.combatStats.map(stat => (
                             <div key={stat.name} className={style.statRow}><span>{stat.name}</span><span>{stat.value}</span></div>
                        ))}
                    </div>
                    <div className={style.infoBlock}>
                        <h3>각인 효과</h3>
                        {dummyCharacterData.engravings.map(eng => (
                            <div key={eng.name} className={style.engravingRow}>
                                <img src="https://cdn-lostark.game.onstove.com/efui_iconatlas/ability/ability_216.png" alt="engraving"/>
                                <span>{eng.name} <strong className={style.engLevel}>Lv.{eng.level}</strong></span>
                            </div>
                        ))}
                    </div>
                    <div className={style.infoBlock}>
                        <h3>성향</h3>
                        <div className={style.virtueRow}>
                            <label>지성</label>
                            <div className={style.progressBar}><div style={{width: `${(dummyCharacterData.virtues.intellect / 1000) * 100}%`}}></div></div>
                            <span>{dummyCharacterData.virtues.intellect}</span>
                        </div>
                         <div className={style.virtueRow}>
                            <label>담력</label>
                            <div className={style.progressBar}><div style={{width: `${(dummyCharacterData.virtues.courage / 1000) * 100}%`}}></div></div>
                            <span>{dummyCharacterData.virtues.courage}</span>
                        </div>
                         <div className={style.virtueRow}>
                            <label>매력</label>
                            <div className={style.progressBar}><div style={{width: `${(dummyCharacterData.virtues.charm / 1000) * 100}%`}}></div></div>
                            <span>{dummyCharacterData.virtues.charm}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CharacterSearchPage;