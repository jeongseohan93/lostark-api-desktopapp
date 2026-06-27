import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = '/home/user/lostark-api-desktopapp';
const SHOT_DIR = '/tmp/shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const MOCK_API = `
window.lostarkAPI = {
  minimizeWindow: () => {}, maximizeWindow: () => {}, closeWindow: () => {},
  resizeWindow: () => {}, openSettingWindow: async () => {}, closeSettingWindow: () => {},
  openExternalLink: async () => {}, saveApiKey: async () => true,
  checkApiKey: async () => 'test-key', deleteApiKey: async () => true,
  notifyApiKeyUpdated: () => {}, onApiKeyDeleted: () => {}, removeApiKeyDeletedListener: () => {},
  getContentInfo: async () => ([
    { CategoryName: '모험 섬', ContentsName: '소나기 섬', ContentsIcon: '', MinItemLevel: 1302,
      StartTimes: [new Date(Date.now() + 12*60*1000).toISOString(), new Date(Date.now() + 72*60*1000).toISOString()], Location: '바다', RewardItems: [] },
    { CategoryName: '필드보스', ContentsName: '코엔', ContentsIcon: '', MinItemLevel: 1340,
      StartTimes: [new Date(Date.now() + 9*60*1000).toISOString()], Location: '아르데타인', RewardItems: [] },
    { CategoryName: '카오스게이트', ContentsName: '카오스게이트', ContentsIcon: '', MinItemLevel: 1415,
      StartTimes: [new Date(Date.now() + 55*60*1000).toISOString()], Location: '로웰야', RewardItems: [] },
  ]),
  getNoticeInfo: async () => ([
    { Title: '[점검] 6월 27일 정기 점검 안내', Date: '2026-06-27T05:00:00', Type: 'EVENT', Link: '#' },
  ]),
  getEventInfo: async () => ([
    { Title: '여름 이벤트', StartDate: '2026-06-01T00:00:00', EndDate: '2026-07-01T00:00:00', ThumbnailImageUrl: '', RewardIconUrl: '' },
  ]),
  getCharacterSiblings: async () => ([]),
  getArmoryProfiles: async () => null,
  getArmoryEquipment: async () => [],
  getArmoryEngravings: async () => ({ Effects: [] }),
  getArmoryGems: async () => ({ Gems: [] }),
  getMarketsOptions: async () => ({
    Categories: [
      { Subs: [{ Code: 50010, CodeName: '강화 재료' }], Code: 50000, CodeName: '재료' },
    ],
    ItemGrades: ['일반', '고급'], ItemTiers: [1, 2, 3], Classes: [],
  }),
  searchMarketItems: async (body) => ({
    PageNo: 1, PageSize: 10, TotalCount: 3,
    Items: [
      { Id: 1001, Name: '파괴석 결정', Grade: '일반', Icon: '', BundleCount: 10, TradeRemainCount: null, YDayAvgPrice: 18.5, RecentPrice: 18, CurrentMinPrice: 17 },
      { Id: 1002, Name: '수호석 결정', Grade: '일반', Icon: '', BundleCount: 10, TradeRemainCount: null, YDayAvgPrice: 12.0, RecentPrice: 11, CurrentMinPrice: 11 },
      { Id: 1003, Name: '명예의 파편 주머니(소)', Grade: '희귀', Icon: '', BundleCount: 1, TradeRemainCount: null, YDayAvgPrice: 320, RecentPrice: 315, CurrentMinPrice: 310 },
    ],
  }),
  getAuctionsOptions: async () => ({ Categories: [], ItemGrades: [], ItemTiers: [], Classes: [], SkillOptions: [], EtcOptions: [] }),
  searchAuctionItems: async () => ({ PageNo: 1, PageSize: 10, TotalCount: 0, Items: [] }),
  onMainProcessMessage: () => {},
};

// Pre-load favorites for demo
const favs = [
  { id: 1001, name: '파괴석 결정', grade: '일반', icon: '', bundleCount: 10, addedAt: new Date().toISOString() },
  { id: 1002, name: '수호석 결정', grade: '일반', icon: '', bundleCount: 10, addedAt: new Date().toISOString() },
  { id: 1003, name: '명예의 파편 주머니(소)', grade: '희귀', icon: '', bundleCount: 1, addedAt: new Date().toISOString() },
];
const now = Date.now();
const hist = {};
// Generate 10 data points over last 5 hours
for (const fav of favs) {
  hist[String(fav.id)] = Array.from({ length: 10 }, (_, i) => ({
    ts: now - (9-i) * 30 * 60 * 1000,
    minPrice: fav.id === 1001 ? 17 + Math.round(Math.sin(i * 0.8) * 2) : fav.id === 1002 ? 11 + Math.round(Math.sin(i * 0.6) * 1.5) : 310 - i * 2,
    avgPrice: fav.id === 1001 ? 18.5 : fav.id === 1002 ? 12 : 320,
  }));
}
localStorage.setItem('loa_favorites_v2', JSON.stringify(favs));
localStorage.setItem('loa_price_history_v2', JSON.stringify(hist));
localStorage.setItem('loa_price_alerts_v2', JSON.stringify({ '1001': 15 }));
`;

async function main() {
  const server = await createServer({
    configFile: false,
    root: APP_DIR,
    plugins: [react()],
    server: { port: 5175 },
    define: { 'process.env': '{}' },
  });
  await server.listen();
  console.log('Vite server at 5175');

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript(MOCK_API);

  // Market page with star buttons
  await page.goto('http://localhost:5175/market', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  // Click category to load items
  await page.evaluate(() => {
    const details = document.querySelector('details');
    if (details) details.open = true;
  });
  await page.waitForTimeout(300);
  const sub = page.locator('text=강화 재료').first();
  if (await sub.isVisible()) { await sub.click(); await page.waitForTimeout(1500); }
  await page.screenshot({ path: path.join(SHOT_DIR, '02c-market-starred.png') });
  console.log('Market with stars screenshot saved');

  // Favorites page
  await page.goto('http://localhost:5175/favorites', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SHOT_DIR, '08-favorites.png') });
  console.log('Favorites page screenshot saved');

  // Dashboard with favorites widget
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '01b-dashboard-favorites.png') });
  console.log('Dashboard with favorites screenshot saved');

  await browser.close();
  await server.close();
  console.log('Done!');
}

main().catch(console.error);
