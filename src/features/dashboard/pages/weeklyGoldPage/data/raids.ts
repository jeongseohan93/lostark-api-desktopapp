export interface RaidGate {
    name: string;
    gold: number;
}

export interface Raid {
    id: string;
    name: string;
    difficulty: '노말' | '하드' | '싱글';
    minItemLevel: number;
    gates: RaidGate[];
    maxChars: number; // 주간 최대 골드 수령 가능 캐릭터 수 (골드 지급)
}

// 골드는 패치에 따라 변동될 수 있음 — 기본값 기준 (2024년 말 ~ 2025년)
export const DEFAULT_RAIDS: Raid[] = [
    // ── 발탄 ──────────────────────────────────────────
    {
        id: 'valtan-normal',
        name: '발탄',
        difficulty: '노말',
        minItemLevel: 1415,
        gates: [{ name: '관문 1', gold: 500 }, { name: '관문 2', gold: 1000 }],
        maxChars: 6,
    },
    {
        id: 'valtan-hard',
        name: '발탄',
        difficulty: '하드',
        minItemLevel: 1445,
        gates: [{ name: '관문 1', gold: 800 }, { name: '관문 2', gold: 1600 }],
        maxChars: 6,
    },
    // ── 비아키스 ──────────────────────────────────────
    {
        id: 'biakiss-normal',
        name: '비아키스',
        difficulty: '노말',
        minItemLevel: 1430,
        gates: [{ name: '관문 1', gold: 700 }, { name: '관문 2', gold: 1300 }],
        maxChars: 6,
    },
    {
        id: 'biakiss-hard',
        name: '비아키스',
        difficulty: '하드',
        minItemLevel: 1460,
        gates: [{ name: '관문 1', gold: 900 }, { name: '관문 2', gold: 1900 }],
        maxChars: 6,
    },
    // ── 쿠크세이튼 ────────────────────────────────────
    {
        id: 'kukku-normal',
        name: '쿠크세이튼',
        difficulty: '노말',
        minItemLevel: 1475,
        gates: [{ name: '관문 1', gold: 1000 }, { name: '관문 2', gold: 1200 }, { name: '관문 3', gold: 2200 }],
        maxChars: 6,
    },
    // ── 아브렐슈드 ────────────────────────────────────
    {
        id: 'abrel-normal',
        name: '아브렐슈드',
        difficulty: '노말',
        minItemLevel: 1490,
        gates: [{ name: '관문 1', gold: 1000 }, { name: '관문 2', gold: 1500 }, { name: '관문 3', gold: 2000 }, { name: '관문 4', gold: 3000 }],
        maxChars: 6,
    },
    {
        id: 'abrel-hard',
        name: '아브렐슈드',
        difficulty: '하드',
        minItemLevel: 1540,
        gates: [{ name: '관문 1', gold: 1500 }, { name: '관문 2', gold: 2500 }, { name: '관문 3', gold: 3500 }, { name: '관문 4', gold: 5000 }],
        maxChars: 6,
    },
    // ── 카양겔 ────────────────────────────────────────
    {
        id: 'kayangel-normal',
        name: '카양겔',
        difficulty: '노말',
        minItemLevel: 1540,
        gates: [{ name: '관문 1', gold: 1200 }, { name: '관문 2', gold: 1500 }, { name: '관문 3', gold: 2500 }],
        maxChars: 6,
    },
    {
        id: 'kayangel-hard',
        name: '카양겔',
        difficulty: '하드',
        minItemLevel: 1580,
        gates: [{ name: '관문 1', gold: 1800 }, { name: '관문 2', gold: 2200 }, { name: '관문 3', gold: 3500 }],
        maxChars: 6,
    },
    // ── 일리아칸 ──────────────────────────────────────
    {
        id: 'illiakan-normal',
        name: '일리아칸',
        difficulty: '노말',
        minItemLevel: 1580,
        gates: [{ name: '관문 1', gold: 1500 }, { name: '관문 2', gold: 2000 }, { name: '관문 3', gold: 4000 }],
        maxChars: 6,
    },
    {
        id: 'illiakan-hard',
        name: '일리아칸',
        difficulty: '하드',
        minItemLevel: 1600,
        gates: [{ name: '관문 1', gold: 2000 }, { name: '관문 2', gold: 3000 }, { name: '관문 3', gold: 6500 }],
        maxChars: 6,
    },
    // ── 상아탑 ────────────────────────────────────────
    {
        id: 'ivory-normal',
        name: '상아탑',
        difficulty: '노말',
        minItemLevel: 1600,
        gates: [{ name: '관문 1', gold: 2000 }, { name: '관문 2', gold: 2500 }, { name: '관문 3', gold: 3000 }, { name: '관문 4', gold: 5000 }],
        maxChars: 6,
    },
    {
        id: 'ivory-hard',
        name: '상아탑',
        difficulty: '하드',
        minItemLevel: 1620,
        gates: [{ name: '관문 1', gold: 3000 }, { name: '관문 2', gold: 4000 }, { name: '관문 3', gold: 5000 }, { name: '관문 4', gold: 8000 }],
        maxChars: 6,
    },
    // ── 에키드나 ──────────────────────────────────────
    {
        id: 'akidna-normal',
        name: '에키드나',
        difficulty: '노말',
        minItemLevel: 1620,
        gates: [{ name: '관문 1', gold: 4000 }, { name: '관문 2', gold: 7000 }],
        maxChars: 6,
    },
    {
        id: 'akidna-hard',
        name: '에키드나',
        difficulty: '하드',
        minItemLevel: 1630,
        gates: [{ name: '관문 1', gold: 5500 }, { name: '관문 2', gold: 10000 }],
        maxChars: 6,
    },
    // ── 베히모스 ──────────────────────────────────────
    {
        id: 'behemoth-normal',
        name: '베히모스',
        difficulty: '노말',
        minItemLevel: 1640,
        gates: [{ name: '관문 1', gold: 5000 }, { name: '관문 2', gold: 8000 }],
        maxChars: 6,
    },
    {
        id: 'behemoth-hard',
        name: '베히모스',
        difficulty: '하드',
        minItemLevel: 1660,
        gates: [{ name: '관문 1', gold: 7000 }, { name: '관문 2', gold: 12000 }],
        maxChars: 6,
    },
];

export const raidGoldTotal = (raid: Raid) => raid.gates.reduce((s, g) => s + g.gold, 0);
