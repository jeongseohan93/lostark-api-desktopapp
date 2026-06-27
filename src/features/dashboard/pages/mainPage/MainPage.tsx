import { CalendarProvider } from './context/CalendarProvider';
import EventComponent from './components/EventComponent';
import NoticesComponent from './components/NoticeComponent';
import TodayContentComponent from './components/TodayContent';
import TodayIslandComponent from './components/TodayIsLand';
import FavoritesComponent from './components/FavoritesComponent';
import style from './style/MainPage.module.css';

const MainPage = () => {
    return (
        <CalendarProvider>
            <div className={style.mainPageGrid}>
                <div className={style.favoritesArea}>
                    <FavoritesComponent />
                </div>
                <div className={style.islandArea}>
                    <TodayIslandComponent />
                </div>
                <div className={style.worldArea}>
                    <TodayContentComponent />
                </div>
                <div className={style.eventArea}>
                    <EventComponent />
                </div>
                <div className={style.noticesArea}>
                    <NoticesComponent />
                </div>
            </div>
        </CalendarProvider>
    );
};

export default MainPage;
