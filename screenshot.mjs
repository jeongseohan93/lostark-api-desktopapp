import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { createServer as createHttpServer } from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = '/tmp/shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

// Mock data for the app
const MOCK_API = `
window.lostarkAPI = {
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  closeWindow: () => {},
  resizeWindow: () => {},
  openSettingWindow: async () => {},
  closeSettingWindow: () => {},
  openExternalLink: async (url) => {},

  saveApiKey: async (key) => true,
  checkApiKey: async () => 'test-api-key-12345',
  deleteApiKey: async () => true,
  notifyApiKeyUpdated: () => {},
  onApiKeyDeleted: (cb) => {},
  removeApiKeyDeletedListener: () => {},

  getContentInfo: async () => ([
    { CategoryName: '로헨델', StartTimes: [new Date().toISOString()], ContentsIcon: '', ContentsName: '카오스 게이트', MinItemLevel: 1415 },
    { CategoryName: '아르데타인', StartTimes: [new Date().toISOString()], ContentsIcon: '', ContentsName: '필드보스', MinItemLevel: 1340 },
    { CategoryName: '크로커스', StartTimes: [new Date().toISOString()], ContentsIcon: '', ContentsName: '모험 섬', MinItemLevel: 1302 },
  ]),
  getNoticeInfo: async () => ([
    { Title: '[점검] 6월 27일 정기 점검 안내', Date: '2026-06-27T05:00:00', Type: 'EVENT', Link: '#' },
    { Title: '[업데이트] 신규 레이드 "에키드나" 추가', Date: '2026-06-25T00:00:00', Type: 'UPDATE', Link: '#' },
    { Title: '[이벤트] 여름맞이 이벤트 기간 연장', Date: '2026-06-24T00:00:00', Type: 'EVENT', Link: '#' },
  ]),
  getEventInfo: async () => ([
    { Title: '여름 이벤트', StartDate: '2026-06-01T00:00:00', EndDate: '2026-07-01T00:00:00', ThumbnailImageUrl: '', RewardIconUrl: '' },
    { Title: '레이드 보상 강화 이벤트', StartDate: '2026-06-15T00:00:00', EndDate: '2026-06-30T00:00:00', ThumbnailImageUrl: '', RewardIconUrl: '' },
  ]),

  getCharacterSiblings: async (name) => ([
    { ServerName: '아브렐슈드', CharacterName: '루피나', CharacterClassName: '워로드', ItemAvgLevel: '1680.00', CharacterLevel: 60, ExpeditionLevel: 82 },
    { ServerName: '아브렐슈드', CharacterName: '펠리아', CharacterClassName: '소서리스', ItemAvgLevel: '1640.00', CharacterLevel: 60, ExpeditionLevel: 82 },
    { ServerName: '아브렐슈드', CharacterName: '카린나', CharacterClassName: '아르카나', ItemAvgLevel: '1620.00', CharacterLevel: 60, ExpeditionLevel: 82 },
  ]),
  getArmoryProfiles: async (name) => ({
    CharacterName: name || '루피나',
    CharacterClassName: '워로드',
    ServerName: '아브렐슈드',
    CharacterLevel: 60,
    ExpeditionLevel: 82,
    ItemAvgLevel: '1680.00',
    CharacterImage: null,
    Title: '영원의 수호자',
    GuildName: '불꽃길드',
    PvpGradeName: '다이아몬드',
    TownName: '로웰야 영지',
    Stats: [
      { Type: '최대 생명력', Value: '284500' },
      { Type: '공격력', Value: '38600' },
      { Type: '치명', Value: '1200' },
      { Type: '특화', Value: '2800' },
      { Type: '제압', Value: '380' },
      { Type: '신속', Value: '950' },
      { Type: '인내', Value: '250' },
      { Type: '숙련', Value: '320' },
    ],
    Tendencies: [
      { Type: '지성', Point: 1200, MaxPoint: 1500 },
      { Type: '담력', Point: 800, MaxPoint: 1500 },
      { Type: '매력', Point: 1350, MaxPoint: 1500 },
      { Type: '친절', Point: 950, MaxPoint: 1500 },
    ],
  }),
  getArmoryEquipment: async (name) => ([
    { Type: '투구', Name: '불의 에스더 투구', Grade: '고대', Icon: '' },
    { Type: '어깨', Name: '불의 에스더 어깨', Grade: '고대', Icon: '' },
    { Type: '상의', Name: '불의 에스더 상의', Grade: '고대', Icon: '' },
    { Type: '하의', Name: '불의 에스더 하의', Grade: '고대', Icon: '' },
    { Type: '장갑', Name: '불의 에스더 장갑', Grade: '고대', Icon: '' },
    { Type: '무기', Name: '불꽃의 검', Grade: '고대', Icon: '' },
  ]),
  getArmoryEngravings: async (name) => ({
    Engravings: [],
    Effects: [
      { Name: '돌격대장', Icon: '', Description: '레벨 3' },
      { Name: '원한', Icon: '', Description: '레벨 3' },
      { Name: '예리한 둔기', Icon: '', Description: '레벨 3' },
      { Name: '저주받은 인형', Icon: '', Description: '레벨 3' },
      { Name: '기습의 달인', Icon: '', Description: '레벨 3' },
    ],
  }),
  getArmoryGems: async (name) => ({
    Gems: [
      { Slot: 0, Name: '10레벨 멸화의 보석', Level: 10, Icon: '' },
      { Slot: 1, Name: '10레벨 홍염의 보석', Level: 10, Icon: '' },
      { Slot: 2, Name: '9레벨 멸화의 보석', Level: 9, Icon: '' },
      { Slot: 3, Name: '9레벨 홍염의 보석', Level: 9, Icon: '' },
      { Slot: 4, Name: '8레벨 보석', Level: 8, Icon: '' },
    ],
    Effects: [],
  }),

  getMarketsOptions: async () => ({
    Categories: [
      { Subs: [{ Code: 50010, CodeName: '강화 재료' }, { Code: 50020, CodeName: '재련 재료' }], Code: 50000, CodeName: '재료' },
      { Subs: [{ Code: 70010, CodeName: '강화석' }, { Code: 70020, CodeName: '파편' }], Code: 70000, CodeName: '화폐 재화' },
    ],
    ItemGrades: ['일반', '고급', '희귀', '영웅', '전설', '유물', '고대'],
    ItemTiers: [1, 2, 3],
    Classes: ['버서커', '소서리스', '워로드'],
  }),
  searchMarketItems: async (body) => ({
    PageNo: 1,
    PageSize: 10,
    TotalCount: 2,
    Items: [
      {
        Id: 1001,
        Name: '파괴석 결정',
        Grade: '일반',
        Icon: '',
        BundleCount: 10,
        TradeRemainCount: null,
        YDayAvgPrice: 18.5,
        RecentPrice: 18,
        CurrentMinPrice: 17,
      },
      {
        Id: 1002,
        Name: '수호석 결정',
        Grade: '일반',
        Icon: '',
        BundleCount: 10,
        TradeRemainCount: null,
        YDayAvgPrice: 12.0,
        RecentPrice: 11,
        CurrentMinPrice: 11,
      },
    ],
  }),

  getAuctionsOptions: async () => ({
    Categories: [
      { Subs: [{ Code: 200010, CodeName: '목걸이' }, { Code: 200020, CodeName: '귀걸이' }, { Code: 200030, CodeName: '반지' }], Code: 200000, CodeName: '장신구' },
    ],
    ItemGrades: ['영웅', '전설', '유물', '고대'],
    ItemTiers: [3],
    Classes: ['버서커', '소서리스', '워로드'],
    SkillOptions: [],
    EtcOptions: [
      { Type: 'ABILITY_ENGRAVE', Values: [
        { Value: 1, Text: '원한' },
        { Value: 2, Text: '돌격대장' },
      ]}
    ],
  }),
  searchAuctionItems: async (body) => ({
    PageNo: 1,
    PageSize: 10,
    TotalCount: 2,
    Items: [
      {
        Name: '고대 목걸이 - 원한/돌격대장',
        Grade: '고대',
        Tier: 3,
        Icon: '',
        AuctionInfo: {
          StartPrice: 5000,
          BuyPrice: 50000,
          BidPrice: 6000,
          EndDate: new Date(Date.now() + 3600000 * 5).toISOString(),
          BidCount: 3,
          BidStartPrice: 5000,
          IsCompetitive: true,
          TradeAllowCount: 1,
        },
        Options: [
          { Type: 'ABILITY_ENGRAVE', OptionName: '원한', OptionNameTripod: '', Value: 5, IsPenalty: false, ClassName: '' },
          { Type: 'ABILITY_ENGRAVE', OptionName: '돌격대장', OptionNameTripod: '', Value: 5, IsPenalty: false, ClassName: '' },
          { Type: 'ABILITY_ENGRAVE', OptionName: '저주받은 인형', OptionNameTripod: '', Value: -1, IsPenalty: true, ClassName: '' },
        ],
      },
    ],
  }),

  onMainProcessMessage: (cb) => {},
};
`;

async function startViteServer() {
  const { createServer } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;

  const server = await createServer({
    configFile: false,
    root: __dirname,
    plugins: [react()],
    server: { port: 5174 },
    define: { 'process.env': '{}' },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
  });

  await server.listen();
  console.log('Vite server started at http://localhost:5174');
  return server;
}

async function takeScreenshots() {
  let server;
  let browser;

  try {
    server = await startViteServer();

    browser = await chromium.launch({
      executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const context = await browser.newContext({
      viewport: { width: 1400, height: 900 },
    });

    const page = await context.newPage();

    // Inject mock API before any page scripts run
    await page.addInitScript(MOCK_API);

    const routes = [
      { path: '/', name: '01-dashboard' },
      { path: '/market', name: '02-market' },
      { path: '/auction', name: '03-auction' },
      { path: '/chSearch', name: '04-character-search' },
      { path: '/package', name: '05-package' },
      { path: '/lifeEnergy', name: '06-life-energy' },
      { path: '/combatPower', name: '07-combat-power' },
    ];

    for (const route of routes) {
      console.log(`Navigating to ${route.path}...`);
      await page.goto(`http://localhost:5174${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const shot = path.join(SHOT_DIR, `${route.name}.png`);
      await page.screenshot({ path: shot, fullPage: false });
      console.log(`Screenshot saved: ${shot}`);
    }

    // Take character search with loaded data
    console.log('Testing character search with data...');
    await page.goto('http://localhost:5174/chSearch', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.fill('input[placeholder]', '루피나');
    await page.click('button:has-text("검색")');
    await page.waitForTimeout(2000);
    const shotSearch = path.join(SHOT_DIR, '04b-character-search-loaded.png');
    await page.screenshot({ path: shotSearch });
    console.log(`Screenshot saved: ${shotSearch}`);

    // Market with category click
    console.log('Testing market page...');
    await page.goto('http://localhost:5174/market', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const matBtn = page.locator('text=재료').first();
    if (await matBtn.isVisible()) {
      await matBtn.click();
      await page.waitForTimeout(300);
      const subBtn = page.locator('text=강화 재료').first();
      if (await subBtn.isVisible()) {
        await subBtn.click();
        await page.waitForTimeout(1500);
      }
    }
    await page.screenshot({ path: path.join(SHOT_DIR, '02b-market-loaded.png') });
    console.log('Market loaded screenshot saved');

    console.log('\nAll screenshots done! Check /tmp/shots/');

  } finally {
    if (browser) await browser.close();
    if (server) await server.close();
  }
}

takeScreenshots().catch(console.error);
