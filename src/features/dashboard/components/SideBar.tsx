import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FiActivity,
  FiBarChart2,
  FiChevronDown,
  FiDollarSign,
  FiDroplet,
  FiHome,
  FiMenu,
  FiPackage,
  FiPercent,
  FiRepeat,
  FiSearch,
  FiSettings,
  FiShoppingCart,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import style from '../style/SideBar.module.css';
import { openSetting } from '../../../shared/api/IpcSetting';

interface MenuItem {
  to: string;
  label: string;
  icon: IconType;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: IconType;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    id: 'trade',
    label: '거래/시세',
    icon: FiShoppingCart,
    items: [
      { to: '/trade/market', label: '거래소', icon: FiShoppingCart },
      { to: '/trade/auction', label: '경매장', icon: FiRepeat },
      { to: '/trade/favorites', label: '즐겨찾기', icon: FiStar },
      { to: '/trade/crystal', label: '크리스탈 시세', icon: FiDroplet },
      { to: '/trade/sniper', label: '경매장 스나이핑', icon: FiTarget },
    ],
  },
  {
    id: 'growth',
    label: '캐릭터/성장',
    icon: FiTrendingUp,
    items: [
      { to: '/growth/character', label: '캐릭터 검색', icon: FiSearch },
      { to: '/growth/enhancement', label: '재련 계산기', icon: FiTrendingUp },
      { to: '/growth/combat-power', label: '전투력 추정', icon: FiBarChart2 },
      { to: '/growth/weekly-gold', label: '주간 골드', icon: FiDollarSign },
    ],
  },
  {
    id: 'calc',
    label: '효율/계산',
    icon: FiActivity,
    items: [
      { to: '/calc/package', label: '패키지 효율', icon: FiPackage },
      { to: '/calc/life-energy', label: '생활의 기운 효율', icon: FaLeaf },
      { to: '/calc/abidos-fusion', label: '아비도스 융화 효율', icon: FiActivity },
      { to: '/calc/fee', label: '수수료 계산기', icon: FiPercent },
      { to: '/calc/raid-auction', label: '레이드 경매 배분기', icon: FiUsers },
    ],
  },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${style.subMenuButton} ${style.active}` : style.subMenuButton;

const SideBar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    trade: true,
    growth: true,
    calc: true,
  });

  const activeGroupIds = useMemo(() => {
    return new Set(
      menuGroups
        .filter(group => group.items.some(item => location.pathname.startsWith(item.to)))
        .map(group => group.id),
    );
  }, [location.pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className={`${style.sidebar} ${isCollapsed ? style.collapsed : ''}`}>
      <nav className={style.menuNav}>
        <div className={style.menuGroup}>
          <button
            type="button"
            className={`${style.menuButton} ${style.toggleButton}`}
            onClick={() => setIsCollapsed(prev => !prev)}
            title={isCollapsed ? '메뉴 펼치기' : '메뉴 접기'}
          >
            <FiMenu className={style.icon} />
            <span className={style.iconLabel}>{isCollapsed ? '펼치기' : '메뉴 접기'}</span>
          </button>

          <NavLink to="/" end className={({ isActive }) => (isActive ? `${style.menuButton} ${style.active}` : style.menuButton)} title="대시보드">
            <FiHome className={style.icon} />
            <span className={style.iconLabel}>대시보드</span>
          </NavLink>

          {menuGroups.map(group => {
            const GroupIcon = group.icon;
            const isOpen = openGroups[group.id];
            const isActiveGroup = activeGroupIds.has(group.id);

            return (
              <div key={group.id} className={style.categoryBlock}>
                <button
                  type="button"
                  className={`${style.menuButton} ${style.categoryButton} ${isActiveGroup ? style.categoryActive : ''}`}
                  onClick={() => toggleGroup(group.id)}
                  title={group.label}
                >
                  <GroupIcon className={style.icon} />
                  <span className={style.iconLabel}>{group.label}</span>
                  <FiChevronDown className={`${style.chevron} ${isOpen ? style.chevronOpen : ''}`} />
                </button>

                {isOpen && !isCollapsed && (
                  <div className={style.subMenu}>
                    {group.items.map(item => {
                      const ItemIcon = item.icon;
                      return (
                        <NavLink key={item.to} to={item.to} className={linkClass} title={item.label}>
                          <ItemIcon className={style.subIcon} />
                          <span className={style.subLabel}>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={style.menuGroup}>
          <button
            type="button"
            className={`${style.menuButton} ${style.settingsButton}`}
            onClick={openSetting}
            title="설정"
          >
            <FiSettings className={style.icon} />
            <span className={style.iconLabel}>설정</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default SideBar;
