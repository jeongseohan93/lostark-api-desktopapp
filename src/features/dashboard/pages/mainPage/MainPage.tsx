import EventComponent from './components/EventComponent';
import style from './style/MainPage.module.css';

const MainPage = () => {
    return (
        <div className={style.mainPageGrid}>
            <div className="event"><EventComponent /></div>
        </div>
    );
};

export default MainPage;