import React from 'react';
import { Activity, Radio, ShieldCheck, Sparkles, Zap } from 'lucide-react';

interface DemoBannerProps {
  onTriggerNLSearch?: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onTriggerNLSearch }) => {
  return (
    <div className="bg-gradient-to-r from-red-950/30 via-[#0c101c]/80 to-blue-950/30 border-y border-white/[0.06] px-4 py-2 text-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-gray-300 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-emerald-400">
              Live System Status
            </span>
          </div>

          <span className="hidden sm:inline text-gray-600">•</span>

          <span className="text-gray-300 font-medium flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
            3 Connected Blood Banks
          </span>

          <span className="hidden sm:inline text-gray-600">•</span>

          <span className="text-gray-300 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            Deterministic RBC Matching Matrix Active
          </span>

          <span className="hidden lg:inline text-gray-600">•</span>

          <span className="hidden lg:inline text-gray-400 text-[10px] font-mono">
            Dispatch SLA &lt; 15 mins
          </span>
        </div>

        {onTriggerNLSearch && (
          <button
            onClick={onTriggerNLSearch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600/30 to-red-700/30 text-red-200 border border-red-500/40 hover:bg-red-600/40 hover:text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-md shadow-red-950/40 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400 group-hover:rotate-12 transition-transform" />
            <span>AI Emergency Search</span>
            <span className="text-[10px] bg-red-500/30 px-1.5 py-0.2 rounded font-mono text-red-300 ml-1">Gemini</span>
          </button>
        )}
      </div>
    </div>
  );
};
