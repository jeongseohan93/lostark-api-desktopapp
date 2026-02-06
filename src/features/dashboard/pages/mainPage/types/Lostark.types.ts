export interface LostArkEvent {
    Title: string;
    Thumbnail: string;
    Link: string;
    startDate: string;
    EndDate: string;
}

export interface LostarkNotice {
    Title: string;
    Date: string;
    Link: string;
    Type: string;
}

export interface CalendarEvent {
    CategoryName: string;
    ContentsName: string;
    ContentsIcon: string;
    MinItemLevel: number;
    StartTimes: string[] | null;
    Location: string;
    RewardItems: CalendarRewardItemGroup[];
}

export interface CalendarRewardItemGroup {
  ItemLevel: number;
  Items: CalendarRewardItem[];
}

export interface CalendarRewardItem {
  Name: string;
  Icon: string;
  Grade: string;
  StartTimes: string[] | null;
}

export type CalendarResponse = CalendarEvent[];


