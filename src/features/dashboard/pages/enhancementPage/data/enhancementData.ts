export interface MaterialReq {
    marketName: string;   // 거래소 검색명
    bundleSize: number;   // 묶음 단위
    qty: number;          // 시도당 필요 수량
}

export interface EnhancementLevel {
    level: number;             // 강화 목표 레벨 (+N 달성하기 위한 시도)
    baseSuccessRate: number;   // 기본 성공확률 (0~1)
    maxPity: number;           // 연속 실패 보정 최대 횟수 (0 = 없음)
    pityCap: number;           // pity 누적당 확률 증가 (기본 성공확률 * pityCap)
    materials: MaterialReq[];
}

// T3 고대 장비 (1302급) 기준 근사치 — 실제 게임 패치에 따라 변동 가능
export const ENHANCEMENT_TABLE: EnhancementLevel[] = [
    // ── Lv 1~6 (파괴석/수호석 결정) ───────────────────
    { level: 1,  baseSuccessRate: 0.75, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '파괴석 결정', bundleSize: 10, qty: 120 }, { marketName: '수호석 결정', bundleSize: 10, qty: 60 }] },
    { level: 2,  baseSuccessRate: 0.72, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '파괴석 결정', bundleSize: 10, qty: 180 }, { marketName: '수호석 결정', bundleSize: 10, qty: 90 }] },
    { level: 3,  baseSuccessRate: 0.69, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '파괴석 결정', bundleSize: 10, qty: 240 }, { marketName: '수호석 결정', bundleSize: 10, qty: 120 }] },
    { level: 4,  baseSuccessRate: 0.66, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '파괴석 결정', bundleSize: 10, qty: 300 }, { marketName: '수호석 결정', bundleSize: 10, qty: 150 }] },
    { level: 5,  baseSuccessRate: 0.63, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '파괴석 결정', bundleSize: 10, qty: 360 }, { marketName: '수호석 결정', bundleSize: 10, qty: 180 }] },
    { level: 6,  baseSuccessRate: 0.60, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '파괴석 결정', bundleSize: 10, qty: 420 }, { marketName: '수호석 결정', bundleSize: 10, qty: 210 }] },
    // ── Lv 7~12 (명예의 파괴석/수호석 결정) ───────────
    { level: 7,  baseSuccessRate: 0.57, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '명예의 파괴석', bundleSize: 10, qty: 120 }, { marketName: '명예의 수호석', bundleSize: 10, qty: 60 }] },
    { level: 8,  baseSuccessRate: 0.54, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '명예의 파괴석', bundleSize: 10, qty: 180 }, { marketName: '명예의 수호석', bundleSize: 10, qty: 90 }] },
    { level: 9,  baseSuccessRate: 0.51, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '명예의 파괴석', bundleSize: 10, qty: 240 }, { marketName: '명예의 수호석', bundleSize: 10, qty: 120 }] },
    { level: 10, baseSuccessRate: 0.48, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '명예의 파괴석', bundleSize: 10, qty: 300 }, { marketName: '명예의 수호석', bundleSize: 10, qty: 150 }] },
    { level: 11, baseSuccessRate: 0.45, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '명예의 파괴석', bundleSize: 10, qty: 360 }, { marketName: '명예의 수호석', bundleSize: 10, qty: 180 }] },
    { level: 12, baseSuccessRate: 0.42, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '명예의 파괴석', bundleSize: 10, qty: 420 }, { marketName: '명예의 수호석', bundleSize: 10, qty: 210 }] },
    // ── Lv 13~14 ──────────────────────────────────────
    { level: 13, baseSuccessRate: 0.39, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '명예의 파괴석', bundleSize: 10, qty: 480 }, { marketName: '명예의 수호석', bundleSize: 10, qty: 240 }, { marketName: '명예의 돌파석', bundleSize: 1, qty: 2 }] },
    { level: 14, baseSuccessRate: 0.36, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '명예의 파괴석', bundleSize: 10, qty: 540 }, { marketName: '명예의 수호석', bundleSize: 10, qty: 270 }, { marketName: '명예의 돌파석', bundleSize: 1, qty: 4 }] },
    // ── Lv 15 (특수) ──────────────────────────────────
    { level: 15, baseSuccessRate: 0.15, maxPity: 6, pityCap: 0.10,
      materials: [{ marketName: '명예의 파괴석', bundleSize: 10, qty: 1500 }, { marketName: '명예의 수호석', bundleSize: 10, qty: 750 }, { marketName: '명예의 돌파석', bundleSize: 1, qty: 30 }] },
    // ── Lv 16~19 ──────────────────────────────────────
    { level: 16, baseSuccessRate: 0.10, maxPity: 9, pityCap: 0.10,
      materials: [{ marketName: '정제된 파괴석', bundleSize: 10, qty: 800 }, { marketName: '정제된 수호석', bundleSize: 10, qty: 400 }, { marketName: '경이로운 명예의 돌파석', bundleSize: 1, qty: 15 }] },
    { level: 17, baseSuccessRate: 0.08, maxPity: 11, pityCap: 0.10,
      materials: [{ marketName: '정제된 파괴석', bundleSize: 10, qty: 1200 }, { marketName: '정제된 수호석', bundleSize: 10, qty: 600 }, { marketName: '경이로운 명예의 돌파석', bundleSize: 1, qty: 25 }] },
    { level: 18, baseSuccessRate: 0.06, maxPity: 14, pityCap: 0.10,
      materials: [{ marketName: '정제된 파괴석', bundleSize: 10, qty: 1600 }, { marketName: '정제된 수호석', bundleSize: 10, qty: 800 }, { marketName: '찬란한 명예의 돌파석', bundleSize: 1, qty: 15 }] },
    { level: 19, baseSuccessRate: 0.04, maxPity: 16, pityCap: 0.10,
      materials: [{ marketName: '정제된 파괴석', bundleSize: 10, qty: 2000 }, { marketName: '정제된 수호석', bundleSize: 10, qty: 1000 }, { marketName: '찬란한 명예의 돌파석', bundleSize: 1, qty: 30 }] },
    // ── Lv 20~25 (빙하의 숨결 등) ─────────────────────
    { level: 20, baseSuccessRate: 0.03, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '빙하의 숨결', bundleSize: 10, qty: 600 }, { marketName: '운명의 돌파석', bundleSize: 1, qty: 10 }] },
    { level: 21, baseSuccessRate: 0.025, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '빙하의 숨결', bundleSize: 10, qty: 900 }, { marketName: '운명의 돌파석', bundleSize: 1, qty: 20 }] },
    { level: 22, baseSuccessRate: 0.02, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '빙하의 숨결', bundleSize: 10, qty: 1200 }, { marketName: '운명의 돌파석', bundleSize: 1, qty: 35 }] },
    { level: 23, baseSuccessRate: 0.015, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '빙하의 숨결', bundleSize: 10, qty: 1500 }, { marketName: '운명의 돌파석', bundleSize: 1, qty: 55 }] },
    { level: 24, baseSuccessRate: 0.01, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '빙하의 숨결', bundleSize: 10, qty: 2000 }, { marketName: '운명의 돌파석', bundleSize: 1, qty: 80 }] },
    { level: 25, baseSuccessRate: 0.005, maxPity: 0, pityCap: 0,
      materials: [{ marketName: '빙하의 숨결', bundleSize: 10, qty: 2500 }, { marketName: '운명의 돌파석', bundleSize: 1, qty: 120 }] },
];

// 기댓값 시도 횟수 계산 (pity 포함)
export function expectedAttempts(lv: EnhancementLevel): number {
    if (lv.maxPity === 0) return 1 / lv.baseSuccessRate;
    // pity 시뮬 (Monte Carlo 간략화 → 상태 기반 정확 계산)
    let total = 0;
    const simRuns = 100_000;
    for (let i = 0; i < simRuns; i++) {
        let attempts = 0;
        let fails = 0;
        while (attempts < 10_000) {
            attempts++;
            const rate = Math.min(1, lv.baseSuccessRate + fails * lv.pityCap);
            if (Math.random() < rate) break;
            fails = Math.min(fails + 1, lv.maxPity);
        }
        total += attempts;
    }
    return total / simRuns;
}
