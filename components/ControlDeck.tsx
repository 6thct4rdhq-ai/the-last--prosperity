
import React, { useState } from 'react';
import { GameState, TurnInput, SceneType, SCENE_CYCLE } from '../types';
import { SCENE_TITLES } from '../constants';
import { Send, MessageSquare, PenTool, Layers, Clock, Fingerprint, Coffee } from 'lucide-react';

interface ControlDeckProps {
  gameState: GameState;
  onAction: (input: TurnInput) => void;
  disabled: boolean;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({ gameState, onAction, disabled }) => {
  const [activeTab, setActiveTab] = useState<'CLAUSE' | 'QUICK' | 'FREE'>('CLAUSE');
  const [assembledClause, setAssembledClause] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  const handleClauseToggle = (clause: string) => {
    if (assembledClause.includes(clause)) {
      setAssembledClause(prev => prev.filter(c => c !== clause));
    } else {
      if (assembledClause.length < 3) {
        setAssembledClause(prev => [...prev, clause]);
      }
    }
  };

  const submitClause = () => {
    if (assembledClause.length === 0) return;
    onAction({
      actionType: 'CLAUSE_ASSEMBLY',
      content: assembledClause.join(' + ')
    });
    setAssembledClause([]);
  };

  const submitQuick = (reply: string) => {
    onAction({
      actionType: 'QUICK_REPLY',
      content: reply
    });
  };

  const submitFree = () => {
    if (!freeText.trim()) return;
    onAction({
      actionType: 'FREE_TEXT',
      content: freeText
    });
    setFreeText('');
  };

  const submitObserve = () => {
    onAction({
      actionType: 'OBSERVE',
      content: '静默观察'
    });
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-800 shadow-2xl z-30 relative">
      
      {/* SCENE TRACKER / SCHEDULE */}
      <div className="bg-black border-b border-zinc-800 p-4">
         <div className="flex items-center gap-2 mb-3 text-xs font-mono text-zinc-500 uppercase tracking-widest">
            <Clock size={12} /> 联邦日程 Federal Schedule
         </div>
         <div className="flex justify-between items-center relative px-2">
             {/* Track Line */}
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-900 -z-0"></div>
             
             {SCENE_CYCLE.map((scene, idx) => {
                 const isCurrent = gameState.currentScene === scene;
                 const isPast = SCENE_CYCLE.indexOf(gameState.currentScene) > idx;
                 
                 return (
                     <div key={scene} className="relative z-10 group flex flex-col items-center">
                         <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                             isCurrent ? 'bg-emerald-500 border-emerald-500 scale-125 shadow-[0_0_10px_#10b981]' : 
                             isPast ? 'bg-zinc-700 border-zinc-700' : 'bg-black border-zinc-800'
                         }`}></div>
                         
                         {/* Tooltip / Label */}
                         <div className={`absolute top-5 whitespace-nowrap text-[10px] font-bold transition-all duration-300 ${
                             isCurrent ? 'text-emerald-400 opacity-100 translate-y-0' : 'text-zinc-600 opacity-0 group-hover:opacity-100 -translate-y-1'
                         }`}>
                             {SCENE_TITLES[scene].split(' ')[0]} {/* Only show time */}
                         </div>
                     </div>
                 );
             })}
         </div>
      </div>

      {/* Current Context */}
      <div className="p-5 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex justify-between items-start mb-4">
          <div>
             <h2 className="text-white font-mono text-xl tracking-wider font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rotate-45 inline-block animate-pulse"></span>
                {SCENE_TITLES[gameState.currentScene]}
             </h2>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-zinc-950 rounded border border-zinc-800 p-1 gap-1">
            {[
              { id: 'CLAUSE', icon: Layers, label: '法案' },
              { id: 'QUICK', icon: MessageSquare, label: '快决' },
              { id: 'FREE', icon: PenTool, label: '手谕' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-sm transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${
                  activeTab === tab.id 
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' 
                  : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-zinc-300 text-sm leading-relaxed font-serif-gov border-l-4 border-emerald-900/50 pl-4 py-2 bg-zinc-950/30">
          "{gameState.sceneContext}"
        </p>
      </div>

      {/* Input Area */}
      <div className="flex-1 overflow-hidden bg-zinc-950 relative flex flex-col">
        <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5 z-0"></div>
        
        <div className="relative z-10 flex-1 p-4 overflow-y-auto custom-scrollbar">
          {/* MODE: CLAUSE ASSEMBLY */}
          {activeTab === 'CLAUSE' && (
            <div className="flex flex-col gap-4 min-h-full">
              <div className="grid grid-cols-1 gap-3">
                {gameState.availableClauses.map((clause, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleClauseToggle(clause)}
                    disabled={disabled}
                    className={`relative group p-4 text-left text-sm font-mono-tech border transition-all duration-200 ${
                      assembledClause.includes(clause)
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 translate-x-1'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="tracking-tight">{clause}</span>
                      {assembledClause.includes(clause) && <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_5px_#34d399]"></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MODE: QUICK REPLY */}
          {activeTab === 'QUICK' && (
            <div className="flex flex-col gap-4">
               {gameState.availableQuickReplies.map((reply, idx) => (
                 <button
                   key={idx}
                   onClick={() => submitQuick(reply)}
                   disabled={disabled}
                   className="w-full p-5 text-left text-sm md:text-base font-serif-gov italic bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-emerald-500/50 hover:text-white transition-all group relative overflow-hidden"
                 >
                   <span className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-800 group-hover:bg-emerald-500 transition-colors"></span>
                   <span className="relative z-10 group-hover:translate-x-2 inline-block transition-transform duration-300">
                     "{reply}"
                   </span>
                 </button>
               ))}
            </div>
          )}

          {/* MODE: FREE TEXT */}
          {activeTab === 'FREE' && (
            <div className="h-full flex flex-col gap-2">
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  disabled={disabled}
                  placeholder="在此输入总统特别行政令..."
                  className="w-full flex-1 bg-black border border-zinc-700 p-6 text-zinc-300 font-mono-tech text-base resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-900 transition-all rounded-sm"
                />
                <div className="text-right text-zinc-600 text-xs font-mono">
                   BYTES: {freeText.length}
                </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-20 flex gap-3">
            
            {/* Primary Action */}
            {(activeTab === 'CLAUSE' || activeTab === 'FREE') && (
              <div className="flex-1 flex flex-col gap-2">
                {activeTab === 'CLAUSE' && (
                    <div className="min-h-[2rem] bg-black border border-dashed border-zinc-700 px-2 flex flex-wrap gap-2 items-center">
                    {assembledClause.length > 0 ? (
                        assembledClause.map((c, i) => (
                            <span key={i} className="bg-emerald-900/30 px-1 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                                {c}
                            </span>
                        ))
                    ) : (
                        <span className="text-zinc-600 text-[10px] font-mono animate-pulse">等待法案组装...</span>
                    )}
                    </div>
                )}
                <button 
                    onClick={activeTab === 'CLAUSE' ? submitClause : submitFree}
                    disabled={disabled || (activeTab === 'CLAUSE' && assembledClause.length === 0) || (activeTab === 'FREE' && !freeText.trim())}
                    className="w-full bg-emerald-800 hover:bg-emerald-700 text-white py-3 font-bold tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-emerald-900/20"
                >
                    {activeTab === 'CLAUSE' ? <><Send size={16}/> 签署法案</> : <><Fingerprint size={16}/> 确认总统令</>}
                </button>
              </div>
            )}

            {/* Observe / Skip Button (Always available or conditional) */}
            <button 
                onClick={submitObserve}
                disabled={disabled}
                className="w-20 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white flex flex-col items-center justify-center gap-1 text-[10px] uppercase font-mono tracking-wide transition-all"
                title="静默观察 - 不下达指令，仅推进时间"
            >
                <Coffee size={18} />
                静默观察
            </button>
        </div>

      </div>
    </div>
  );
};
