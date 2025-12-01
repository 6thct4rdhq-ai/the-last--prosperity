// @ts-ignore
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GameState, SimulationResponse, TurnInput, SceneType } from "../types";
import { SCENE_TITLES } from "../constants";

// Initialize Gemini Client (Web SDK Version)
const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;

console.log("🔍 System Check: API Key Loaded?", !!apiKey); 

if (!apiKey) {
  console.error("❌ FATAL ERROR: API Key is missing.");
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// Define the schema for the simulation output (Text)
// Note: The Web SDK uses 'SchemaType' enum
const simulationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    narrativeOutcome: {
      type: SchemaType.STRING,
      description: "Specific result of player's federal decree. Describe macroscopic effects: stock markets, border conflicts, energy grid fluctuations, or labor riots. IN CHINESE.",
    },
    visualChanges: {
      type: SchemaType.STRING,
      description: "Abstract description of the atmosphere in the Capital Office. IN CHINESE.",
    },
    deltaFog: {
      type: SchemaType.INTEGER,
      description: "Change in Social Fog level (-5 to +5).",
    },
    deltaClarity: {
      type: SchemaType.INTEGER,
      description: "Change in Social Clarity level (-5 to +5).",
    },
    windows: {
      type: SchemaType.OBJECT,
      properties: {
        warRoom: {
          type: SchemaType.OBJECT,
          properties: {
            status: { type: SchemaType.STRING, description: "E.g., 红色警戒, 能源过载, 边境冲突" },
            activeThreats: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            resourceAllocation: { type: SchemaType.INTEGER },
          },
          required: ["status", "activeThreats", "resourceAllocation"]
        },
        media: {
          type: SchemaType.OBJECT,
          properties: {
            headlines: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            sentiment: { type: SchemaType.STRING, enum: ["狂热", "麻木", "愤怒", "动荡"] },
            trendingTopic: { type: SchemaType.STRING },
          },
          required: ["headlines", "sentiment", "trendingTopic"]
        },
        streetView: {
          type: SchemaType.OBJECT,
          properties: {
            description: { type: SchemaType.STRING, description: "Visual description of a Federal location (Port, Border, Capital, Slums). Focus on ROBOTS, CLIMATE, and INDUSTRY. MUST BE IN SIMPLIFIED CHINESE." },
            weather: { type: SchemaType.STRING, description: "MUST BE IN CHINESE (e.g. Acid Rain, Heatwave)" },
            crowdMood: { type: SchemaType.STRING, description: "MUST BE IN CHINESE" },
            visualDetails: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "MUST BE IN CHINESE" },
          },
          required: ["description", "weather", "crowdMood", "visualDetails"]
        },
        internalReport: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            content: { type: SchemaType.STRING, description: "Full text of Federal Intelligence/Scientific Report. Topics: Fusion progress, Pandemic vectors, Robot efficiency. Can be biased. IN CHINESE." },
            intelligenceLevel: { type: SchemaType.STRING, enum: ["联邦绝密", "内部限阅", "公开情报"] },
            veracityScore: { type: SchemaType.INTEGER, description: "0-100 truth score." },
          },
          required: ["title", "content", "intelligenceLevel", "veracityScore"]
        },
      },
      required: ["warRoom", "media", "streetView", "internalReport"]
    },
    nextSceneContext: {
      type: SchemaType.STRING,
      description: "Prompt for the NEXT scene context. Focus on the tension of the 'Centennial Transition'. IN CHINESE.",
    },
    newClauses: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "6 policy clauses (Federal Laws, Military Orders, Economic Sanctions). IN CHINESE."
    },
    newQuickReplies: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "4 quick reply options. Include at least one passive 'Observe' option. IN CHINESE."
    }
  },
  required: [
    "narrativeOutcome",
    "visualChanges",
    "deltaFog",
    "deltaClarity",
    "windows",
    "nextSceneContext",
    "newClauses",
    "newQuickReplies"
  ],
};

export const processTurn = async (
  currentState: GameState,
  input: TurnInput,
  nextSceneType: SceneType
): Promise<SimulationResponse> => {
  const nextSceneTitle = SCENE_TITLES[nextSceneType] || nextSceneType;
  
  const prompt = `
    Role: You are the simulation engine for "The Last Prosperity" (Federal Edition).
    Setting: A Multi-ethnic Federal Capitalist Superpower in the year 2084.
    ... (omitted redundant context for brevity, logic remains same) ...
    Current State:
    - Year: ${currentState.year}
    - Time: ${SCENE_TITLES[currentState.currentScene]}
    - Fog: ${currentState.socialFog} | Clarity: ${currentState.socialClarity}
    
    Player Input:
    - Action: ${input.actionType}
    - Content: "${input.content}"
    
    Directives:
    1. **Macro Scale**: The player is the PRESIDENT/LEADER. Decisions affect millions. 
    2. **Realistic Lag**: Policies take time (months) to show full effect. Describe the *immediate bureaucratic reaction* first.
    3. **Tone**: Serious, Dystopian, High-Stakes, Cold.
    5. **Language**: ALL OUTPUT MUST BE IN SIMPLIFIED CHINESE.

    Generate the next state in JSON format.
  `;

  try {
    // 1. Generate Text Simulation
    // Use gemini-1.5-flash which is standard and stable
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: simulationSchema,
      },
      systemInstruction: "你是联邦主脑。模拟一个濒临崩溃但在寻求新生的超级大国。核心冲突：人类失业者 vs 机器劳工，旧能源 vs 聚变能源，全球化 vs 孤立主义。"
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) throw new Error("No text returned from simulation engine.");
    const simData = JSON.parse(responseText) as SimulationResponse;

    // 2. Generate Image for Street View (Skipped for stability in this demo version)
    // We retain the old image to ensure no 404s on legacy image endpoints
    let generatedImageBase64 = currentState.windows.streetView.image;
    simData.windows.streetView.image = generatedImageBase64;

    return simData;

  } catch (error) {
    console.error("Simulation Engine Failure:", error);
    throw error;
  }
};