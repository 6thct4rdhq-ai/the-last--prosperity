// @ts-ignore
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GameState, SimulationResponse, TurnInput, SceneType } from "../types";
import { SCENE_TITLES } from "../constants";

// Initialize Gemini Client
// STRICT: Only read from Vite/Vercel environment variables
const apiKey = import.meta.env.VITE_API_KEY;

// Debug Log
console.log("🔍 System Check: API Key Loaded?", !!apiKey); 

if (!apiKey) {
  console.error("❌ FATAL ERROR: API Key is missing. Please check Vercel Settings -> Environment Variables.");
}

// CRITICAL FIX: Explicitly set apiVersion to 'v1beta' where gemini-1.5-flash lives
const ai = new GoogleGenAI({ 
  apiKey: apiKey || '',
  apiVersion: 'v1beta'
});

// Define the schema for the simulation output (Text)
const simulationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrativeOutcome: {
      type: Type.STRING,
      description: "Specific result of player's federal decree. Describe macroscopic effects: stock markets, border conflicts, energy grid fluctuations, or labor riots. IN CHINESE.",
    },
    visualChanges: {
      type: Type.STRING,
      description: "Abstract description of the atmosphere in the Capital Office. IN CHINESE.",
    },
    deltaFog: {
      type: Type.INTEGER,
      description: "Change in Social Fog level (-5 to +5).",
    },
    deltaClarity: {
      type: Type.INTEGER,
      description: "Change in Social Clarity level (-5 to +5).",
    },
    windows: {
      type: Type.OBJECT,
      properties: {
        warRoom: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "E.g., 红色警戒, 能源过载, 边境冲突" },
            activeThreats: { type: Type.ARRAY, items: { type: Type.STRING } },
            resourceAllocation: { type: Type.INTEGER },
          },
          required: ["status", "activeThreats", "resourceAllocation"]
        },
        media: {
          type: Type.OBJECT,
          properties: {
            headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
            sentiment: { type: Type.STRING, enum: ["狂热", "麻木", "愤怒", "动荡"] },
            trendingTopic: { type: Type.STRING },
          },
          required: ["headlines", "sentiment", "trendingTopic"]
        },
        streetView: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "Visual description of a Federal location (Port, Border, Capital, Slums). Focus on ROBOTS, CLIMATE, and INDUSTRY. MUST BE IN SIMPLIFIED CHINESE." },
            weather: { type: Type.STRING, description: "MUST BE IN CHINESE (e.g. Acid Rain, Heatwave)" },
            crowdMood: { type: Type.STRING, description: "MUST BE IN CHINESE" },
            visualDetails: { type: Type.ARRAY, items: { type: Type.STRING }, description: "MUST BE IN CHINESE" },
          },
          required: ["description", "weather", "crowdMood", "visualDetails"]
        },
        internalReport: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING, description: "Full text of Federal Intelligence/Scientific Report. Topics: Fusion progress, Pandemic vectors, Robot efficiency. Can be biased. IN CHINESE." },
            intelligenceLevel: { type: Type.STRING, enum: ["联邦绝密", "内部限阅", "公开情报"] },
            veracityScore: { type: Type.INTEGER, description: "0-100 truth score." },
          },
          required: ["title", "content", "intelligenceLevel", "veracityScore"]
        },
      },
      required: ["warRoom", "media", "streetView", "internalReport"]
    },
    nextSceneContext: {
      type: Type.STRING,
      description: "Prompt for the NEXT scene context. Focus on the tension of the 'Centennial Transition'. IN CHINESE.",
    },
    newClauses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "6 policy clauses (Federal Laws, Military Orders, Economic Sanctions). IN CHINESE."
    },
    newQuickReplies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
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
    Key Themes: 
    1. **De-globalization**: Borders are closing, trade is difficult.
    2. **Climate Crisis**: Extreme heat, acid rain, rising sea levels are constant threats.
    3. **Cyclical Pandemics**: New virus variants emerge seasonally.
    4. **Fusion Energy**: The "Helios" grid is 98% complete but unstable. It's the ultimate goal.
    5. **Robotics**: "Unconscious Humanoid Robots" (labor drones) have replaced 60% of human jobs (ports, mines, elderly care). They are efficient but hated by the unemployed.
    
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
    3. **Street View Variance**: The street view should sample different parts of the nation: The High-Tech Capital, The Automated Ports (Robots), The Border Walls (Refugees), or The Depressed Industrial Zones.
    4. **Tone**: Serious, Dystopian, High-Stakes, Cold.
    5. **Language**: ALL OUTPUT MUST BE IN SIMPLIFIED CHINESE.

    Generate the next state.
  `;

  try {
    // 1. Generate Text Simulation
    // Using gemini-1.5-flash with v1beta is the most standard configuration
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: simulationSchema,
        systemInstruction: "你是联邦主脑。模拟一个濒临崩溃但在寻求新生的超级大国。核心冲突：人类失业者 vs 机器劳工，旧能源 vs 聚变能源，全球化 vs 孤立主义。"
      }
    });

    if (!response.text) throw new Error("No text returned from simulation engine.");
    const simData = JSON.parse(response.text) as SimulationResponse;

    // 2. Generate Image for Street View
    let generatedImageBase64 = currentState.windows.streetView.image;

    try {
        const imagePrompt = `
            Cinematic shot, 2084 dystopian sci-fi, concept art.
            Subject: ${simData.windows.streetView.description}.
            Atmosphere: ${simData.windows.streetView.weather}, ${simData.windows.streetView.crowdMood}.
            Key Elements: Unconscious humanoid robots (faceless industrial androids), massive industrial structures, heavy weather, high contrast.
            Style: Blade Runner 2049 meets Children of Men. Realistic, gritty, 8k.
            No text.
        `;
        
        // Attempt image generation
        // Using same model for simplicity; in production use specialized image model
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-1.5-flash', 
            contents: { parts: [{ text: imagePrompt }] }
        });
        
    } catch (imgError) {
        console.warn("Image generation skipped:", imgError);
    }

    simData.windows.streetView.image = generatedImageBase64;

    return simData;

  } catch (error) {
    console.error("Simulation Engine Failure:", error);
    throw error;
  }
};