
import React, { useEffect, useState } from 'react';
import { WindowState } from '../types';
import { BarChart, Activity, Globe, Eye, FileText, AlertTriangle, Lock, Cloud, Users, ShieldAlert, CheckCircle, Zap, Radio } from 'lucide-react';

interface WindowGridProps {
  windows: WindowState;
  fogLevel: number;
}

const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 10 }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return <span>{displayed}</span>;
};

const WindowFrame: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  accentColor: string;
  sideLabel?: string;
}> = ({ title, icon, children, accentColor, sideLabel }) => (
  <div className={`relative bg-black/90 backdrop-blur-sm border-2 border-zinc-800 flex flex-col h-full group transition-all duration-500 hover:border-${accentColor}/60 shadow-lg`}>
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 z-20">
      <div className={`flex items-center gap-3 text-sm md:text-base font-black tracking-widest font-mono-tech text-${accentColor}`}>
        {icon}
        {title}
      </div>
      <div className="flex items-center gap-3">
        {sideLabel && <span className="hidden md:block text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{sideLabel}</span>}
        <div className={`w-2 h-2 rounded-full bg-${accentColor} animate-pulse shadow-[0_0_10px_currentColor]`} />
      </div>
    </div>
    
    {/* Content */}
    <div className="relative flex-1 overflow-hidden">
       <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 md:p-6 z-10">
          {children}
       </div>
       {/* Grid Overlay */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none z-0"></div>
    </div>

    {/* Corner Accents */}
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${accentColor} opacity-70`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${accentColor} opacity-70`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${accentColor} opacity-70`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${accentColor} opacity-70`} />
  </div>
);

export const WindowGrid: React.FC<WindowGridProps> = ({ windows, fogLevel }) => {
  // Optimized Fog
  const getFogStyle = (baseOpacity: number = 1) => {
     const opacity = Math.max(0.3, 1 - (fogLevel / 150));
     const blur = fogLevel > 70 ? `blur(${Math.max(0, (fogLevel - 70) / 30)}px)` : 'none';
     const saturate = `saturate(${Math.max(0, 100 - fogLevel)}%)`;
     return { 
       opacity, 
       filter: `${blur} ${saturate}`,
       transition: 'all 2s ease' 
     };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-full w-full p-4 md:p-6 bg-[#0a0a0a]">
      
      {/* 1. WAR ROOM -> NATIONAL SECURITY */}
      <WindowFrame title="联邦安全与能源 NATIONAL DEFENSE" icon={<ShieldAlert />} accentColor="emerald-500" sideLabel="DEFCON_3">
        <div className="font-mono-tech space-y-6" style={getFogStyle()}>
          <div className="flex justify-between border-b border-zinc-800 pb-4 items-end">
            <span className="text-zinc-500 text-xs md:text-sm">安全等级 ALERT LEVEL</span>
            <span className={`text-2xl md:text-3xl font-bold tracking-tighter ${
              windows.warRoom.status.includes('稳') ? 'text-emerald-400' : 'text-amber-500 animate-pulse'
            }`}>
              {windows.warRoom.status}
            </span>
          </div>
          
          <div>
            <span className="text-zinc-500 block mb-3 text-xs font-bold uppercase tracking-wider">战略威胁 THREAT VECTORS</span>
            {windows.warRoom.activeThreats.length === 0 ? (
               <div className="p-4 border border-emerald-900/40 bg-emerald-950/20 text-emerald-400 flex items-center gap-3 text-sm md:text-base rounded">
                  <Lock size={16} /> 
                  <span>全境防御系统在线</span>
               </div>
            ) : (
              <ul className="space-y-3">
                {windows.warRoom.activeThreats.map((threat, i) => (
                  <li key={i} className="text-red-300 border border-red-900/40 bg-red-950/20 p-3 flex items-center gap-3 text-sm md:text-base rounded animate-pulse">
                    <AlertTriangle size={16} className="shrink-0 text-red-500" /> 
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-2">
             <span className="text-zinc-500 block mb-3 text-xs font-bold uppercase tracking-wider">聚变/军用 资源配比</span>
             <div className="relative w-full h-8 bg-zinc-900 border border-zinc-700 rounded-sm overflow-hidden">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[10px] text-white font-bold flex items-center gap-1"><Users size={10}/> 民生福利</div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-[10px] text-white font-bold flex items-center gap-1">聚变研发 <Zap size={10}/></div>
                <div 
                  className="h-full bg-gradient-to-r from-zinc-600 via-emerald-700 to-zinc-600 transition-all duration-1000" 
                  style={{ width: `${windows.warRoom.resourceAllocation}%` }}
                />
                <div 
                   className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_white]"
                   style={{ left: `${windows.warRoom.resourceAllocation}%` }}
                />
             </div>
             <div className="flex justify-between text-xs text-zinc-400 mt-2 font-mono">
                <span>{windows.warRoom.resourceAllocation}%</span>
                <span>{100 - windows.warRoom.resourceAllocation}%</span>
             </div>
          </div>
        </div>
      </WindowFrame>

      {/* 2. MEDIA BOX -> PUBLIC SENTIMENT */}
      <WindowFrame title="民意与热搜 PUBLIC MONITOR" icon={<Radio />} accentColor="rose-500" sideLabel="NET_FEED">
        <div className="font-serif-gov space-y-6" style={getFogStyle()}>
            <div className="border-l-4 border-rose-600 pl-5 py-2 bg-gradient-to-r from-rose-950/10 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                 <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                 <span className="text-[10px] font-sans font-bold text-rose-500 uppercase tracking-widest">TOP STORY</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold leading-snug text-zinc-100">
                <TypewriterText text={windows.media.headlines[0]} speed={15} />
              </h3>
            </div>
            
            <div className="space-y-4 pl-2">
               {windows.media.headlines.slice(1).map((hl, i) => (
                 <div key={i} className="text-zinc-400 text-sm md:text-base border-b border-zinc-800/50 pb-3 flex gap-3">
                   <span className="text-rose-800 font-bold">&gt;&gt;</span> {hl}
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-zinc-800">
              <div className="bg-zinc-900/80 p-3 border border-zinc-800 rounded">
                 <span className="text-[10px] text-zinc-500 uppercase font-bold">国民情绪 SENTIMENT</span>
                 <div className={`font-bold text-lg md:text-xl mt-1 ${
                   windows.media.sentiment.includes('麻木') ? 'text-zinc-400' : 
                   windows.media.sentiment.includes('怒') || windows.media.sentiment.includes('荡') ? 'text-rose-500' : 
                   'text-emerald-400'
                 }`}>{windows.media.sentiment}</div>
              </div>
              <div className="bg-zinc-900/80 p-3 border border-zinc-800 rounded">
                 <span className="text-[10px] text-zinc-500 uppercase font-bold">热议 TAG</span>
                 <div className="font-mono-tech text-sm md:text-base text-zinc-300 mt-1">#{windows.media.trendingTopic}</div>
              </div>
            </div>
        </div>
      </WindowFrame>

      {/* 3. STREET VIEW -> FEDERAL EYE */}
      <WindowFrame title="全境天眼 FEDERAL EYE" icon={<Eye />} accentColor="blue-400" sideLabel="LIVE_SAT_LINK">
        <div className="h-full flex flex-col gap-3" style={getFogStyle()}>
            
            {/* Main Image Container */}
            <div className="relative aspect-video w-full overflow-hidden border border-zinc-700 bg-black group rounded-sm">
                {windows.streetView.image ? (
                    <img 
                        src={windows.streetView.image} 
                        alt="Street View" 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700 scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 font-mono animate-pulse">NO SIGNAL</div>
                )}
                
                {/* Overlay UI */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none"></div>
                <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 text-[10px] font-mono text-red-500 flex items-center gap-1 border border-red-900/50 backdrop-blur-md">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> FEDERAL_CAM_004
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2">
                    {windows.streetView.visualDetails.map((detail, i) => (
                         <span key={i} className="text-[10px] bg-blue-950/80 text-blue-200 px-2 py-1 border border-blue-500/30 backdrop-blur-md font-mono-tech">
                            [{detail}]
                         </span>
                    ))}
                </div>
                
                {/* Scanline */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] z-10"></div>
            </div>
            
            <div className="flex flex-col gap-2 px-1 flex-1 overflow-y-auto custom-scrollbar">
                <p className="text-sm text-zinc-300 leading-relaxed font-light">
                  {windows.streetView.description}
                </p>
                
                <div className="flex items-center gap-6 text-xs font-mono-tech text-zinc-500 mt-auto pt-2 border-t border-zinc-800/50">
                   <div className="flex items-center gap-2"><Cloud size={14}/> {windows.streetView.weather}</div>
                   <div className="flex items-center gap-2"><Users size={14}/> {windows.streetView.crowdMood}</div>
                </div>
            </div>
        </div>
      </WindowFrame>

      {/* 4. INTERNAL REPORT -> INTEL */}
      <WindowFrame title="机要文件 CLASSIFIED" icon={<FileText />} accentColor="amber-500" sideLabel="EYES_ONLY">
        <div className="font-mono-tech space-y-4 relative h-full flex flex-col" style={getFogStyle()}>
           <div className="border-b border-amber-900/30 pb-2 mb-2 flex justify-between items-center opacity-80 shrink-0">
              <span className="text-xs text-amber-700">F.I.S. REPORT // 2084</span>
              <span className="border border-amber-500/50 text-amber-500 px-2 py-0.5 text-[10px] font-bold bg-amber-950/30">
                 {windows.internalReport.intelligenceLevel}
              </span>
           </div>
           
           <h4 className="font-bold text-amber-400 text-lg decoration-amber-800/50 underline underline-offset-8 decoration-2 leading-normal shrink-0">
             {windows.internalReport.title}
           </h4>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed text-sm text-amber-100/90 border-l-2 border-amber-900/30 pl-4 py-2 font-serif-gov">
             {windows.internalReport.content}
           </div>

           {/* Veracity / Reliability Indicator */}
           <div className="shrink-0 pt-4 border-t border-dashed border-amber-900/30">
             <div className="flex justify-between text-[10px] text-amber-600 mb-1 uppercase tracking-wider font-bold">
                <span>情报置信度 Confidence</span>
                <span>{windows.internalReport.veracityScore}%</span>
             </div>
             <div className="w-full h-1 bg-amber-950/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    windows.internalReport.veracityScore > 80 ? 'bg-emerald-600' : 
                    windows.internalReport.veracityScore > 50 ? 'bg-amber-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${windows.internalReport.veracityScore}%` }}
                ></div>
             </div>
             <div className="mt-2 flex items-center gap-2 text-[10px]">
                {windows.internalReport.veracityScore < 60 ? (
                  <span className="text-red-500 flex items-center gap-1 animate-pulse"><ShieldAlert size={10}/> 来源存疑：建议启动反间谍调查</span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={10}/> 来源已由多重加密验证</span>
                )}
             </div>
           </div>
        </div>
      </WindowFrame>

    </div>
  );
};
