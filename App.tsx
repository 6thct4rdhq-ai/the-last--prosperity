import React, { useState, useEffect, useRef } from 'react';
import { GameState, TurnInput, SceneType, SCENE_CYCLE } from './types';
import { INITIAL_GAME_STATE, ERA_TITLES, LORE_INTRO_TEXT, DEFAULT_BGM_URL, SCENE_TITLES } from './constants';
import { processTurn } from './services/geminiService';
import { WindowGrid } from './components/WindowGrid';
import { ControlDeck } from './components/ControlDeck';
import { Loader2, Volume2, VolumeX, Power, Disc, Terminal, Save, RotateCcw, MessageSquarePlus } from 'lucide-react';

// ➤ CONFIG: 这里替换成你的问卷链接 (腾讯问卷/Google Forms/Tally)
const FEEDBACK_FORM_URL = "https://tally.so/r/your-form-id"; 

const IntroSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= LORE_INTRO_TEXT.length) {
      setTimeout(onComplete, 1000);
      return;
    }

    const currentLine = LORE_INTRO_TEXT[lineIndex];
    
    if (charIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setCharIndex(charIndex + 1);
      }, 30); // Typing speed
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLineIndex(lineIndex + 1);
        setCharIndex(0);
      }, 600); // Delay between lines
      return () => clearTimeout(timer);
    }
  }, [lineIndex, charIndex, onComplete]);

  return (
    <div className="h-screen w-screen bg-black text-emerald-500 font-mono-tech p-10 flex flex-col justify-center items-center z-50 relative overflow-hidden">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
       <div className="max-w-2xl w-full space-y-4 z-10">
          {LORE_INTRO_TEXT.slice(0, lineIndex + 1).map((line, idx) => (
            <div key={idx} className={`text-lg md:text-2xl ${idx === lineIndex ? 'text-emerald-400 text-shadow-glow' : 'text-emerald-900'}`}>
               {idx === lineIndex ? line.substring(0, charIndex) : line}
               {idx === lineIndex && <span className="inline-block w-3 h-5 bg-emerald-500 ml-1 animate-blink"></span>}
            </div>
          ))}
       </div>
       <div className="absolute bottom-10 right-10 text-xs text-emerald-900 animate-pulse">
          PRESS ESC TO SKIP...
       </div>
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [appState, setAppState] = useState<'START' | 'INTRO' | 'GAME'>('START');
  const [hasSaveFile, setHasSaveFile] = useState(false);
  
  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Logic
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(DEFAULT_BGM_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4; // 40% volume to not overpower text
    }
  }, []);

  // Handle Mute Toggle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Helper to start audio (must be called after user interaction)
  const startAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio autoplay blocked until interaction", e));
    }
  };

  // Check for save file on mount
  useEffect(() => {
    const saved = localStorage.getItem('tlp_save_data');
    if (saved) {
      setHasSaveFile(true);
    }
  }, []);

  // Boot Sequence
  const handleStartClick = () => {
     startAudio();
     setGameState(INITIAL_GAME_STATE);
     setAppState('INTRO');
  };

  const handleIntroComplete = () => {
     setAppState('GAME');
  };

  // Save / Load Logic
  const handleSaveGame = () => {
    try {
      localStorage.setItem('tlp_save_data', JSON.stringify(gameState));
      setHasSaveFile(true);
      alert(">> 系统快照已归档至本地存储核心\n>> SNAPSHOT_SAVED");
    } catch (e) {
      console.error("Save failed", e);
      alert(">> 归档失败：存储扇区错误\n>> SAVE_ERROR");
    }
  };

  const handleLoadGame = () => {
    try {
      startAudio();
      const saved = localStorage.getItem('tlp_save_data');
      if (saved) {
        const parsedState = JSON.parse(saved);
        setGameState(parsedState);
        setAppState('GAME'); // Skip intro on load
      }
    } catch (e) {
      console.error("Load failed", e);
      alert(">> 读取失败：存档文件损坏\n>> CORRUPTED_DATA");
    }
  };

  const handleAction = async (input: TurnInput) => {
    setIsLoading(true);
    
    const currentIdx = SCENE_CYCLE.indexOf(gameState.currentScene);
    const nextSceneIdx = (currentIdx + 1) % SCENE_CYCLE.length;
    const nextScene = SCENE_CYCLE[nextSceneIdx];

    const historyPrefix = input.actionType === 'OBSERVE' ? '[静默观察]' : `[${gameState.year}] ${input.actionType}`;
    const newHistoryItem = `${historyPrefix}: ${input.content.substring(0, 20)}...`;
    
    try {
      // Pass nextScene intention to AI
      const response = await processTurn(gameState, input, nextScene);
      
      setGameState(prev => {
        const newState = {
          ...prev,
          turn: prev.turn + 1,
          socialFog: Math.max(0, Math.min(100, prev.socialFog + response.deltaFog)),
          socialClarity: Math.max(0, Math.min(100, prev.socialClarity + response.deltaClarity)),
          currentScene: nextScene, 
          sceneContext: response.nextSceneContext,
          windows: response.windows,
          availableClauses: response.newClauses,
          availableQuickReplies: response.newQuickReplies,
          history: [...prev.history, newHistoryItem, `>> 结果: ${response.narrativeOutcome}`]
        };
        // Auto-save on turn completion optional, keeping it manual for now to emulate 'roguelike-ish' tension or old OS feel
        // localStorage.setItem('tlp_save_data', JSON.stringify(newState)); 
        return newState;
      });
      setIsLoading(false);
      
    } catch (error) {
      console.error("Turn processing failed", error);
      setIsLoading(false);
      alert("联邦主脑连接超时。正在尝试重新握手...");
    }
  };

  // 1. Start Screen
  if (appState === 'START') {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-zinc-300 font-mono relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
         
         <div className="flex flex-col items-center z-10">
            <div className="mb-10 text-center">
               <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 font-serif-gov">
                 最后的繁荣
               </h1>
               <div className="flex items-center justify-center gap-4 text-zinc-500">
                  <span className="h-[1px] w-12 bg-zinc-800"></span>
                  <span className="text-sm tracking-[0.5em] uppercase">The Last Prosperity</span>
                  <span className="h-[1px] w-12 bg-zinc-800"></span>
               </div>
               <div className="mt-4 text-zinc-600 font-mono text-xs uppercase tracking-widest">
                 Federal Strategic Command System v4.2
               </div>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                 onClick={handleStartClick}
                 className="group relative px-8 py-5 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all overflow-hidden rounded-sm w-full"
              >
                 <span className="relative z-10 font-bold tracking-widest text-sm uppercase text-zinc-300 group-hover:text-emerald-400 transition-colors flex items-center justify-center gap-3">
                   <Power size={16} /> 启动联邦执政协议 Initialize
                 </span>
                 <div className="absolute inset-0 bg-emerald-900/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              </button>

              {hasSaveFile && (
                <button 
                   onClick={handleLoadGame}
                   className="group relative px-8 py-4 bg-zinc-950/50 border border-zinc-800/60 hover:border-amber-500/50 transition-all overflow-hidden rounded-sm w-full"
                >
                   <span className="relative z-10 font-bold tracking-widest text-sm uppercase text-zinc-400 group-hover:text-amber-400 transition-colors flex items-center justify-center gap-3">
                     <RotateCcw size={16} /> 继续上次执政 Resume
                   </span>
                   <div className="absolute inset-0 bg-amber-900/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                </button>
              )}
            </div>
         </div>
      </div>
    );
  }

  // 2. Intro Sequence
  if (appState === 'INTRO') {
    return <IntroSequence onComplete={handleIntroComplete} />;
  }

  // 3. Main Game Loop
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden font-sans text-zinc-200 selection:bg-emerald-900 selection:text-white animate-flicker">
      
      {/* Top Bar */}
      <header className="h-14 md:h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 z-30 shadow-xl shrink-0">
        <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <span className="font-black tracking-widest text-lg font-serif-gov text-white">FEDERAL_OS</span>
              <span className="text-[10px] text-zinc-600 font-mono tracking-wider">COMMANDER_ACCESS</span>
           </div>
           
           <div className="h-8 w-[1px] bg-zinc-800"></div>
           
           <div className="hidden md:flex gap-8 text-sm font-mono-tech text-zinc-400">
              <div className="flex flex-col">
                 <span className="text-[10px] text-zinc-600 mb-0.5">YEAR</span>
                 <span className="text-zinc-200 font-bold text-lg leading-none">{gameState.year}</span>
              </div>
              
              <div className="flex flex-col">
                 <span className="text-[10px] text-zinc-600 mb-0.5">DAY</span>
                 <span className="text-zinc-200 font-bold text-lg leading-none">{gameState.turn}</span>
              </div>

              <div className="flex flex-col">
                 <span className="text-[10px] text-zinc-600 mb-0.5">TIME</span>
                 <span className="text-emerald-500 font-bold text-lg leading-none">
                    {SCENE_TITLES[gameState.currentScene] ? SCENE_TITLES[gameState.currentScene].split(' ')[0] : '00:00'}
                 </span>
              </div>

              <div className="flex flex-col">
                 <span className="text-[10px] text-zinc-600 mb-0.5">PHASE</span>
                 <span className="text-amber-600 font-bold leading-none">{ERA_TITLES[gameState.era]}</span>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-6 md:gap-10">
           {/* Status Indicators */}
           <div className="flex items-center gap-3 text-xs font-mono-tech" title="战略迷雾">
              <span className={`font-bold ${gameState.socialFog > 50 ? 'text-amber-500 animate-pulse' : 'text-zinc-500'}`}>
                 FOG
              </span>
              <div className="w-16 md:w-24 h-2 bg-zinc-900 border border-zinc-800 relative">
                 <div 
                   className="h-full bg-zinc-400 absolute top-0 left-0 transition-all duration-1000" 
                   style={{ width: `${gameState.socialFog}%`, opacity: 0.5 + (gameState.socialFog / 200) }}
                 />
              </div>
           </div>

           <div className="flex items-center gap-3 text-xs font-mono-tech" title="统治力">
              <span className={`font-bold ${gameState.socialClarity < 30 ? 'text-red-500 animate-pulse' : 'text-emerald-600'}`}>
                 STABILITY
              </span>
              <div className="w-16 md:w-24 h-2 bg-zinc-900 border border-zinc-800 relative">
                 <div 
                   className="h-full bg-emerald-600 absolute top-0 left-0 transition-all duration-1000" 
                   style={{ width: `${gameState.socialClarity}%` }}
                 />
              </div>
           </div>
           
           <div className="h-6 w-[1px] bg-zinc-800 mx-2"></div>

           <div className="flex items-center gap-4">
             <a 
               href={FEEDBACK_FORM_URL} 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-zinc-600 hover:text-blue-400 transition-colors" 
               title="提交反馈 / Feedback"
             >
                <MessageSquarePlus size={20} />
             </a>

             <button onClick={handleSaveGame} className="text-zinc-600 hover:text-emerald-400 transition-colors" title="存档 / Save">
                <Save size={20} />
             </button>

             <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-600 hover:text-zinc-300 transition-colors" title="静音 / Mute">
               {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
             </button>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
         
         {/* Left: The Windows (Visualization) */}
         <div className="flex-1 h-[50vh] md:h-full relative bg-[#050505] overflow-hidden">
            <WindowGrid windows={gameState.windows} fogLevel={gameState.socialFog} />
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                 <div className="bg-zinc-900/90 border border-zinc-700 p-8 shadow-2xl flex flex-col items-center max-w-sm text-center rounded">
                    <Loader2 className="animate-spin text-emerald-500 mb-6" size={48} />
                    <div className="font-mono text-lg text-emerald-400 animate-pulse tracking-widest mb-4 font-bold">
                       战略推演中 SIMULATING
                    </div>
                    <div className="text-xs text-zinc-500 font-mono-tech space-y-1 text-left w-full">
                       <div className="animate-pulse">&gt;&gt; Analyzing Federal Sentiment...</div>
                       <div className="animate-pulse delay-100">&gt;&gt; Connecting to Border Satellites...</div>
                       <div className="animate-pulse delay-200">&gt;&gt; Validating Fusion Grid Telemetry...</div>
                    </div>
                 </div>
              </div>
            )}
         </div>

         {/* Right/Bottom: The Control Deck (Input) */}
         <div className="h-[50vh] md:h-full md:w-[480px] lg:w-[550px] shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20">
            <ControlDeck 
              gameState={gameState} 
              onAction={handleAction} 
              disabled={isLoading} 
            />
         </div>

      </main>

      {/* Global Vignette */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-30 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
}