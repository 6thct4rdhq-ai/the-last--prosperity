// @ts-ignore
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GameState, SimulationResponse, TurnInput, SceneType } from "../types";
import { SCENE_TITLES } from "../constants";

// Initialize Gemini Client
const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;

// Debug Log
console.log("🔍 System Check: API Key Loaded?", !!apiKey); 

if (!apiKey) {
  console.error("❌ FATAL ERROR: API Key is missing. Check Vercel Settings.");
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// Define Schema
const simulationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    narrativeOutcome: { type: SchemaType.STRING },
    visualChanges: { type: SchemaType.STRING },
    deltaFog: { type: SchemaType.INTEGER },
    deltaClarity: { type: SchemaType.INTEGER },
    windows: {
      type: SchemaType.OBJECT,
      properties: {
        warRoom: {
          type: SchemaType.OBJECT,
          properties: {
            status: { type: SchemaType.STRING },
            activeThreats: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            resourceAllocation: { type: SchemaType.INTEGER },
          }
        },
        media: {
          type: SchemaType.OBJECT,
          properties: {
            headlines: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            sentiment: { type: SchemaType.STRING },
            trendingTopic: { type: SchemaType.STRING },
          }
        },
        streetView: {
          type: SchemaType.OBJECT,
          properties: {
            description: { type: SchemaType.STRING },
            weather: { type: SchemaType.STRING },
            crowdMood: { type: SchemaType.STRING },
            visualDetails: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          }
        },
        internalReport: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            content: { type: SchemaType.STRING },
            intelligenceLevel: { type: SchemaType.STRING },
            veracityScore: { type: SchemaType.INTEGER },
          }
        },
      }
    },
    nextSceneContext: { type: SchemaType.STRING },
    newClauses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    newQuickReplies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
  }
};

export const processTurn = async (
  currentState: GameState,
  input: TurnInput,
  nextSceneType: SceneType
): Promise<SimulationResponse> => {
  const nextSceneTitle = SCENE_TITLES[nextSceneType] || nextSceneType;
  
  const prompt = `
    Role: You are the simulation engine for "The Last Prosperity".
    Current Year: ${currentState.year}. Scene: ${nextSceneTitle}.
    State: Fog ${currentState.socialFog}, Clarity ${currentState.socialClarity}.
    Player Action: ${input.actionType} - "${input.content}".
    
    Task: Simulate the consequences. Generate JSON response.
    Language: Simplified Chinese.
    Tone: Dystopian, Serious, Cyberpunk.
  `;

  try {
    // 1. Generate Text Simulation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: simulationSchema,
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) throw new Error("No text returned");
    const simData = JSON.parse(responseText) as SimulationResponse;

    // 2. Keep old image (Stability)
    simData.windows.streetView.image = currentState.windows.streetView.image;

    return simData;

  } catch (error) {
    console.error("Simulation Engine Failure:", error);
    throw error;
  }
};