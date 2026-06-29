export interface RewardItem {
    Name: string;
    Icon: string;
    Grade: string;
    StartTimes: string[] | null;
}

export interface LevelRewardItems {
    ItemLevel: number;
    Items: RewardItem[];
}

export interface ContentsCalendar {
    CategoryName: string;
    ContentsName: string;
    ContentsIcon: string;
    MinItemLevel: number;
    StartTimes: string[];
    Location: string;
    RewardItems: LevelRewardItems[];
}

export interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}
