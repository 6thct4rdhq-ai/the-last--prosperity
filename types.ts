
export enum SceneType {
  MORNING_BRIEF = 'MORNING_BRIEF',
  CABINET_STANDUP = 'CABINET_STANDUP',
  PUBLIC_COMMUNICATION = 'PUBLIC_COMMUNICATION',
  WINDOW_READING = 'WINDOW_READING'
}

// Defined cycle order for the daily loop - 4 key moments
export const SCENE_CYCLE = [
  SceneType.MORNING_BRIEF,        // 08:00
  SceneType.CABINET_STANDUP,      // 14:00
  SceneType.PUBLIC_COMMUNICATION, // 19:00
  SceneType.WINDOW_READING        // 23:00
];

export enum Era {
  PRESENT_DAY = 'Centennial Transition', // 百年转型期
  FUSION_DAWN = 'Fusion Ignition',       // 聚变点火
  LABOR_CRISIS = 'Great Displacement',   // 大替代危机
  ISOLATIONISM = 'Fortress Era'          // 堡垒纪元
}

export interface WindowState {
  warRoom: {
    status: string;
    activeThreats: string[];
    resourceAllocation: number; // 0-100
  };
  media: {
    headlines: string[];
    sentiment: '狂热' | '麻木' | '愤怒' | '动荡';
    trendingTopic: string;
  };
  streetView: {
    description: string;
    weather: string;
    crowdMood: string;
    visualDetails: string[]; 
    image?: string; // Base64 encoded image
  };
  internalReport: {
    title: string;
    content: string; // Fully visible content, might be lying
    intelligenceLevel: '联邦绝密' | '内部限阅' | '公开情报';
    veracityScore: number; // 0-100
  };
}

export interface GameState {
  turn: number;
  year: number;
  era: Era;
  socialFog: number; // 0-100
  socialClarity: number; // 0-100
  currentScene: SceneType;
  sceneContext: string; 
  windows: WindowState;
  history: string[];
  availableClauses: string[];
  availableQuickReplies: string[];
}

export interface TurnInput {
  actionType: 'CLAUSE_ASSEMBLY' | 'QUICK_REPLY' | 'FREE_TEXT' | 'OBSERVE';
  content: string;
}

export interface SimulationResponse {
  narrativeOutcome: string;
  visualChanges: string;
  deltaFog: number;
  deltaClarity: number;
  windows: WindowState;
  nextSceneContext: string;
  newClauses: string[];
  newQuickReplies: string[];
}
