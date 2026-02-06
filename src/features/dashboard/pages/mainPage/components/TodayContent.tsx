import { useCalendar } from "../context/CalendarContext";

const TodayContentComponent = () => {

    const { worldEvents, loading, error } = useCalendar();

    if(loading) {
        return (
            <div>
                <p>콘텐츠 정보를 불러오는 중...</p>
            </div>
        );
    }

    if(error) {
        return (
            <div>
                <p>오류: {error}</p>
            </div>
        );
    }

    return (    
        <div>
            <h2>필드보스 & 카게</h2>
            <ul>
                {worldEvents.length > 0 ? (
                    worldEvents.map(event => (
                        <li key={event.ContentsName}>
                            <img src ={event.ContentsIcon} alt = {event.CategoryName}/>
                            <div>
                                <span>{event.ContentsName}</span>
                                <span>(Lv.{event.MinItemLevel})</span>
                            </div>
                            <span>
                                {event.CategoryName}
                            </span>
                        </li>
                    ))
                    ) : (
                        <p>오늘 등장하는 월드 이벤트가 없습니다.</p>
                    )
                }
                
            </ul>
        </div>
    );   
};

export default TodayContentComponent;