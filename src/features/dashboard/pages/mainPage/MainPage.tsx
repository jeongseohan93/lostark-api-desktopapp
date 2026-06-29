import { CalendarProvider } from './context/CalendarProvider';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiSettings } from 'react-icons/fi';
import EventComponent from './components/EventComponent';
import NoticesComponent from './components/NoticeComponent';
import TodayContentComponent from './components/TodayContent';
import TodayIslandComponent from './components/TodayIsLand';
import FavoritesComponent from './components/FavoritesComponent';
import { openSetting } from '../../../../shared/api/IpcSetting';
import style from './style/MainPage.module.css';

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <CalendarProvider>
            <div className={style.launcherPage}>
                <div className={style.brandStrip}>
                    <div className={style.gameEmblem}>LA</div>
                    <div className={style.brandCopy}>
                        <span className={style.statePill}>LIVE</span>
                        <h1>LOST ARK</h1>
                    </div>
                </div>

                <div className={style.eventArea}>
                    <EventComponent />
                </div>
                <div className={style.noticesArea}>
                    <NoticesComponent />
                </div>
                <div className={style.islandArea}>
                    <TodayIslandComponent />
                </div>
                <div className={style.worldArea}>
                    <TodayContentComponent />
                </div>
                <div className={style.favoritesArea}>
                    <FavoritesComponent />
                </div>

                <footer className={style.launcherDock}>
                    <div className={style.dockIdentity}>
                        <span className={style.dockIcon}>LA</span>
                        <strong>LOST ARK</strong>
                    </div>
                    <div className={style.dockActions}>
                        <button className={style.playButton} onClick={() => navigate('/market')}>
                            <FiPlay />
                            거래소 보기
                        </button>
                        <button className={style.iconButton} onClick={openSetting} aria-label="설정 열기">
                            <FiSettings />
                        </button>
                    </div>
                </footer>
            </div>
        </CalendarProvider>
    );
};

export default MainPage;
