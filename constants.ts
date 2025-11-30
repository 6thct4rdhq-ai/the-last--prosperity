import { GameState, SceneType, Era } from './types';

export const INITIAL_GAME_STATE: GameState = {
  turn: 1,
  year: 2084,
  era: Era.PRESENT_DAY,
  socialFog: 20,
  socialClarity: 80,
  currentScene: SceneType.MORNING_BRIEF,
  sceneContext: "联邦最高执政官阁下，欢迎入主白金宫。目前处于【百年转型】的最关键节点：聚变反应堆组将在六个月后尝试并网；边境难民潮因气候恶化达到峰值；而港口的工人们正在抗议新一批'提坦'级无意识机器人的部署。在这个去全球化的时代，您需要驾驶这艘巨轮穿过风暴。",
  history: [],
  availableClauses: [
    "签署《边境自动化防卫法案》",
    "启动战略粮食储备投放",
    "强制征用私营聚变公司算力",
    "镇压港口反机械化暴动",
    "削减联邦养老金以补贴能源网",
    "对特定贸易区实施疫情封锁"
  ],
  availableQuickReplies: [
    "为了聚变并网，一切代价都是允许的。",
    "优先安抚工会，暂缓机器人部署。",
    "启动三级防疫响应，封锁边境。",
    "无视噪音，维持现状。"
  ],
  windows: {
    warRoom: {
      status: "橙色警戒",
      activeThreats: ["极端热浪II级", "南部港口罢工", "境外数据渗透"],
      resourceAllocation: 75
    },
    media: {
      headlines: ["联邦能源部：聚变点火倒计时180天", "失业率攀升：机器是否真的能养活人类？", "边境隔离墙外的哭声"],
      sentiment: "麻木",
      trendingTopic: "最后的人类工作"
    },
    streetView: {
      description: "联邦首都第一重工区。灰色的天空下，一列列‘提坦’型号人形机器人正整齐划一地搬运着聚变反应堆的重型组件。它们没有面孔，只有统一的工业编码。远处，失业的人群隔着铁丝网冷冷地注视着这些不知疲倦的钢铁替代者。空气中弥漫着臭氧和酸雨的味道。",
      weather: "酸性雾霾",
      crowdMood: "压抑",
      visualDetails: ["无面机器人队列", "铁丝网", "巨型冷却塔"],
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==" 
    },
    internalReport: {
      title: "联邦安全局早报 #2084-05-12",
      content: "南部边境的‘气候难民’压力已接近临界值。我们的无人机侦测到邻国正在试图通过黑客手段干扰我们的聚变电网频率。建议立即提升网络防御等级，并授权在边境使用非致命性声波武器驱散人群。",
      intelligenceLevel: "联邦绝密",
      veracityScore: 88
    }
  }
};

export const SCENE_TITLES: Record<SceneType, string> = {
  [SceneType.MORNING_BRIEF]: "08:00 联邦安全简报",
  [SceneType.CABINET_STANDUP]: "14:00 宏观经济调控",
  [SceneType.PUBLIC_COMMUNICATION]: "19:00 全境广播讲话",
  [SceneType.WINDOW_READING]: "23:00 战略复盘",
};

export const ERA_TITLES: Record<Era, string> = {
  [Era.PRESENT_DAY]: "百年转型阵痛期",
  [Era.FUSION_DAWN]: "无限能源纪元",
  [Era.LABOR_CRISIS]: "大替代危机",
  [Era.ISOLATIONISM]: "孤岛堡垒"
};

export const LORE_INTRO_TEXT = [
  "系统自检中... 联邦中央主脑在线。",
  "时间: 2084年",
  "地点: 联邦首都 (Federal Capital)",
  "--------------------------------",
  "这是一个属于巨物与微尘的时代。",
  "全球化已死，气候崩溃，旧世界分崩离析。",
  "唯一的希望是六个月后的【聚变并网】。",
  "如果成功，我们将获得无限能源；如果失败，文明将退回黑暗。",
  "与此同时，数以亿计的无意识机器人正在接管港口、矿井与边境。",
  "人类正在失去工作的权利，但也可能从劳役中解放。",
  "你是这个庞大联邦的最高执政官。",
  "你需要平衡财阀、工会、军队与暴民。",
  "为了人类的存续，还是为了资本的永生？",
  "...",
  "祝你好运，总统阁下。"
];

export const DEFAULT_BGM_URL = "https://assets.mixkit.co/music/preview/mixkit-cinematic-mystery-trailer-2680.mp3";