import { Navigate, Routes, Route } from 'react-router-dom';
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
import FavoritesPage from './pages/favoritesPage/FavoritesPage';
import WeeklyGoldPage from './pages/weeklyGoldPage/WeeklyGoldPage';
import EnhancementPage from './pages/enhancementPage/EnhancementPage';
import AuctionSniperPage from './pages/auctionSniperPage/AuctionSniperPage';
import FeeCalculatorPage from './pages/feeCalculatorPage/FeeCalculatorPage';
import RaidAuctionPage from './pages/raidAuctionPage/RaidAuctionPage';
import CrystalTrackerPage from './pages/crystalTrackerPage/CrystalTrackerPage';
import AbidosFusionPage from './pages/abidosFusionPage/AbidosFusionPage';
import { FavoritesProvider } from '../../shared/context/FavoritesContext';
import { AuctionSniperProvider } from '../../shared/context/AuctionSniperContext';

const DashBoard = () => {
    useWindowSize(1200, 700);
  return (
    <FavoritesProvider>
      <AuctionSniperProvider>
      <div className={style.appLayout}>
        <TitleBar />
        <div className={style.mainContent}>
          <SideBar />
          <main className={style.contentArea}>
            <Routes>
              <Route index element={<MainPage />}/>

              <Route path="/trade/market" element={<MarketPage />} />
              <Route path="/trade/auction" element={<ActionPage />} />
              <Route path="/trade/favorites" element={<FavoritesPage />} />
              <Route path="/trade/crystal" element={<CrystalTrackerPage />} />
              <Route path="/trade/sniper" element={<AuctionSniperPage />} />

              <Route path="/growth/character" element={<CharacterSearchPage />} />
              <Route path="/growth/enhancement" element={<EnhancementPage />} />
              <Route path="/growth/combat-power" element={<CombatPowerPage />} />
              <Route path="/growth/weekly-gold" element={<WeeklyGoldPage />} />

              <Route path="/calc/package" element={<PackageEfficiencyPage />} />
              <Route path="/calc/life-energy" element={<EnergyOfLifePage />} />
              <Route path="/calc/abidos-fusion" element={<AbidosFusionPage />} />
              <Route path="/calc/fee" element={<FeeCalculatorPage />} />
              <Route path="/calc/raid-auction" element={<RaidAuctionPage />} />

              <Route path="/market" element={<Navigate to="/trade/market" replace />} />
              <Route path="/auction" element={<Navigate to="/trade/auction" replace />} />
              <Route path="/favorites" element={<Navigate to="/trade/favorites" replace />} />
              <Route path="/crystalTracker" element={<Navigate to="/trade/crystal" replace />} />
              <Route path="/auctionSniper" element={<Navigate to="/trade/sniper" replace />} />
              <Route path="/chSearch" element={<Navigate to="/growth/character" replace />} />
              <Route path="/enhancement" element={<Navigate to="/growth/enhancement" replace />} />
              <Route path="/combatPower" element={<Navigate to="/growth/combat-power" replace />} />
              <Route path="/weeklyGold" element={<Navigate to="/growth/weekly-gold" replace />} />
              <Route path="/package" element={<Navigate to="/calc/package" replace />} />
              <Route path="/lifeEnergy" element={<Navigate to="/calc/life-energy" replace />} />
              <Route path="/abidosFusion" element={<Navigate to="/calc/abidos-fusion" replace />} />
              <Route path="/feeCalc" element={<Navigate to="/calc/fee" replace />} />
              <Route path="/raidAuction" element={<Navigate to="/calc/raid-auction" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      </AuctionSniperProvider>
    </FavoritesProvider>
  );
};

export default DashBoard;
