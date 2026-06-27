import { Routes, Route } from 'react-router-dom'; 
import SideBar from '../dashboard/components/SideBar';
import TitleBar from '../../shared/component/WindowControls/TitleBar';
import { useWindowSize } from '../../shared/hooks/useWindoResize';
import style from './style/DashBoard.module.css';

import MainPage from './pages/mainPage/MainPage';
import MarketPage from './pages/marketPage/MarketPage';
import ActionPage from './pages/auctionPage/AuctionPage';
import PackageEfficiencyPage from './pages/packageEfficiencyPage/PackageEfficiencyPage';
import CharacterSearchPage from './pages/characterSearchPage/CharacterSearchPage';
import EnergyOfLifePage from './pages/energyOfLifePage/EnergyOfLifePage';
import CombatPowerPage from './pages/combatPowerPage/CombatPowerPage';

const DashBoard = () => {
    useWindowSize(1200, 700);
  return (
    <div className={style.appLayout}>
      <TitleBar />
      <div className={style.mainContent}>
        <SideBar />
        <main className={style.contentArea}>
          <Routes>
            <Route index element={<MainPage />}/>
            <Route path = "/market" element={<MarketPage />}/>
            <Route path = "/auction" element={<ActionPage/>}/>
            <Route path = "/chSearch" element={<CharacterSearchPage/>}/>
            <Route path = "/package" element={<PackageEfficiencyPage/>}/>
            <Route path = "/lifeEnergy" element={<EnergyOfLifePage/>}/>
            <Route path = "/combatPower" element={<CombatPowerPage/>}/>
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashBoard;