import { useCalendar } from "../context/CalendarContext";
import { CalendarRewardItemGroup } from "../types/Lostark.types";
import style from "../style/TodayIsland.module.css";

const RewardItemsDisplay = ({ rewardItems} : { rewardItems: CalendarRewardItemGroup[] }) => {
    const allItems = rewardItems.flatMap(group => group.Items);
    return(
        <div className={style.rewardContainer}>
            { allItems.slice(0,5).map((item, index) => (
                <img 
                    key={index}
                    src={item.Icon}
                    alt={item.Name}
                    title={item.Name}
                    className={`${style.rewardIcon} ${style['Grade-' + item.Grade]}`}
                />
            ))}
        </div>
    )
}

const TodayIslandComponent = () => {
    const { adventureIslands, loading, error } = useCalendar();

    if(loading) {
        return <div className={style.islandBox}><p>모험 섬 정보를 불러오는 중...</p></div>
    }

    if(error) {
        return <div className={`${style.islandBox} ${style.errorBox}`}><p>오류: {error}</p></div>
    }

    return (
        <div>
            <h2>오늘의 모험 섬</h2>
            <ul>
                {adventureIslands.length > 0 ? (
                    adventureIslands.map(island => (
                        <li key={island.ContentsName} className={style.contentItem}>
                            <img src={island.ContentsIcon} alt={island.ContentsName} className={style.icon} />
                            <div className={style.info}>
                                <div className={style.nameLine}>
                                    <span className={style.name}>{island.ContentsName}</span>
                                    <span className={style.itemLevel}>(Lv.{island.MinItemLevel})</span>
                                </div>
                                <span className={style.time}>{island.StartTimes?.join(' / ')}</span>
                                <RewardItemsDisplay rewardItems={island.RewardItems} />
                            </div>
                        </li>
                    ))
                ) : (
                    <p className={style.noItemText}>오늘 등장하는 모험 섬이 없습니다.</p>
                )}
            </ul>
        </div>
    );
};

export default TodayIslandComponent;