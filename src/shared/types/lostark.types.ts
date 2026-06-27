// ── 캐릭터 ────────────────────────────────────────────────────────────────────

export interface CharacterInfo {
    ServerName: string;
    CharacterName: string;
    CharacterLevel: number;
    CharacterClassName: string;
    ItemAvgLevel: string;
    ItemMaxLevel: string;
}

export interface StatInfo {
    Type: string;
    Value: string;
    Tooltip: string[];
}

export interface Tendency {
    Type: string;
    Point: number;
    MaxPoint: number;
}

export interface ArmoryProfile {
    CharacterImage: string | null;
    ExpeditionLevel: number;
    PvpGradeName: string;
    TownName: string;
    Title: string | null;
    GuildName: string | null;
    Stats: StatInfo[];
    Tendencies: Tendency[];
    ServerName: string;
    CharacterName: string;
    CharacterLevel: number;
    CharacterClassName: string;
    ItemAvgLevel: string;
    ItemMaxLevel: string;
}

export interface ArmoryEquipment {
    Type: string;
    Name: string;
    Icon: string;
    Grade: string;
    Tooltip: string;
}

export interface EngravingSlot {
    Slot: number;
    Name: string;
    Icon: string;
    Tooltip: string;
}

export interface EngravingEffect {
    Icon: string;
    Name: string;
    Description: string;
}

export interface ArmoryEngravings {
    Engravings: EngravingSlot[];
    Effects: EngravingEffect[];
}

export interface Gem {
    Slot: number;
    Name: string;
    Icon: string;
    Level: number;
    Grade: string;
}

export interface GemEffect {
    GemSlot: number;
    Name: string;
    Description: string;
    Icon: string;
    ClassJobName: string;
}

export interface ArmoryGems {
    Gems: Gem[];
    Effects: GemEffect[];
}

// ── 거래소 ────────────────────────────────────────────────────────────────────

export interface MarketCategory {
    Code: number;
    CodeName: string;
    Subs: Array<{ Code: number; CodeName: string }>;
}

export interface MarketOptions {
    Categories: MarketCategory[];
    ItemGrades: string[];
    ItemTiers: number[];
    Classes: string[];
}

export interface MarketItem {
    Id: number;
    Name: string;
    Grade: string;
    Icon: string;
    BundleCount: number;
    TradeRemainCount: number | null;
    YDayAvgPrice: number;
    RecentPrice: number;
    CurrentMinPrice: number;
}

export interface MarketSearchBody {
    Sort?: string;
    CategoryCode?: number;
    CharacterClass?: string;
    ItemTier?: number;
    ItemGrade?: string;
    ItemName?: string;
    PageNo?: number;
    SortCondition?: string;
}

export interface MarketSearchResponse {
    PageNo: number;
    PageSize: number;
    TotalCount: number;
    Items: MarketItem[];
}

// ── 경매장 ────────────────────────────────────────────────────────────────────

export interface AuctionCategory {
    Code: number;
    CodeName: string;
    Subs: Array<{ Code: number; CodeName: string }>;
}

export interface AuctionOption {
    Value: number | null;
    Class: string | null;
    Text: string;
    IsThreshold: boolean;
    ChildOptions: Array<{ Value: number; Text: string }>;
}

export interface AuctionOptions {
    MaxItemLevel: number;
    ItemGrades: string[];
    ItemTiers: number[];
    Classes: string[];
    Categories: AuctionCategory[];
    SkillOptions: AuctionOption[];
    EtcOptions: AuctionOption[];
}

export interface AuctionInfo {
    StartPrice: number;
    BuyPrice: number | null;
    BidPrice: number;
    EndDate: string;
    BidCount: number;
    BidStartPrice: number;
    IsCompetitive: boolean;
    TradeAllowCount: number;
    UpgradeLevel?: number;
}

export interface AuctionItemOption {
    Type: string;
    OptionName: string;
    OptionNameTripod?: string;
    Value: number;
    IsPenalty: boolean;
    ClassName?: string;
}

export interface AuctionItem {
    Name: string;
    Grade: string;
    Tier: number;
    Level: number | null;
    Icon: string;
    GradeQuality: number | null;
    AuctionInfo: AuctionInfo;
    Options: AuctionItemOption[];
}

export interface AuctionSearchBody {
    ItemLevelMin?: number;
    ItemLevelMax?: number;
    ItemGradeQuality?: number;
    ItemUpgradeLevel?: number;
    ItemTradeAllowCount?: number;
    SkillOptions?: Array<{ FirstOption: number | null; SecondOption: number | null; MinValue?: number; MaxValue?: number }>;
    EtcOptions?: Array<{ FirstOption: number | null; SecondOption: number | null; MinValue?: number; MaxValue?: number }>;
    Sort?: string;
    CategoryCode?: number;
    CharacterClass?: string;
    ItemTier?: number;
    ItemGrade?: string;
    ItemName?: string;
    PageNo?: number;
    SortCondition?: string;
}

export interface AuctionSearchResponse {
    PageNo: number;
    PageSize: number;
    TotalCount: number;
    Items: AuctionItem[];
}
