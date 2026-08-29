import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle,
  Lightbulb,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { API } from '../../lib/api';
import { AIInsightResponse, BloodGroup } from '../../types';

export const DemandAnalytics: React.FC = () => {
  const [insights, setInsights] = useState<AIInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await API.getAnalytics();
      if (res.success && res.data) {
        setInsights(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const groups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const maxGroupDemand = insights
    ? Math.max(...(Object.values(insights.groupDemandDistribution) as number[]), 1)
    : 10;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-red-950/50 via-[#131926]/90 to-[#0e121d]/90 border border-red-500/25 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              Gemini 3.7 Flash Engine
            </span>
            <span className="text-xs text-gray-400 font-medium">Regional Blood Demand Forecasting</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            AI Demand Analytics & Insights
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl leading-relaxed">
            Calculates blood group velocity, triage load, and inventory vulnerability across all regional hospitals.
          </p>
        </div>

        <button
          id="refresh-analytics-btn"
          onClick={fetchInsights}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-black/60 hover:bg-black/80 border border-white/15 text-xs font-extrabold text-white transition-all duration-200 cursor-pointer shadow-lg hover:border-white/30 relative z-10 active:scale-95 min-h-[44px]"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-400' : 'group-hover:rotate-180 transition-transform'}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-gray-400 glass-panel rounded-3xl">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-red-500" />
          <p className="text-base font-extrabold text-white">Synthesizing Regional Blood Demand Trends...</p>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">Evaluating live emergency requests, triage levels, and hospital stocks with Gemini model.</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-950/30 border border-red-500/40 rounded-3xl text-center text-red-300 text-xs shadow-2xl">
          <AlertCircle className="w-8 h-8 mx-auto mb-3" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : (
        insights && (
          <div className="space-y-6">
            {/* AI Executive Summary Card */}
            <div className="p-7 rounded-3xl bg-gradient-to-r from-red-950/50 via-[#121622]/90 to-blue-950/40 border border-red-500/30 backdrop-blur-xl relative shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2 text-red-300 font-extrabold text-xs uppercase tracking-wider mb-2.5">
                <Bot className="w-4 h-4 text-red-400" />
                AI Clinical Demand Assessment
              </div>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-semibold">
                "{insights.summary}"
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/[0.08]">
                <div className="p-4 bg-black/40 border border-white/[0.06] rounded-2xl">
                  <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Highest Demand</span>
                  <span className="text-2xl font-black text-red-400">{insights.highestDemandGroup}</span>
                </div>
                <div className="p-4 bg-black/40 border border-white/[0.06] rounded-2xl">
                  <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Total Requests</span>
                  <span className="text-2xl font-black text-white">{insights.totalRequests}</span>
                </div>
                <div className="p-4 bg-black/40 border border-white/[0.06] rounded-2xl">
                  <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Fulfillment Rate</span>
                  <span className="text-2xl font-black text-emerald-400">{insights.fulfilledRatePercent}%</span>
                </div>
                <div className="p-4 bg-black/40 border border-white/[0.06] rounded-2xl">
                  <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Inventory State</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-2">
                    <CheckCircle className="w-4 h-4" /> {insights.inventoryHealth}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid: Blood Demand Distribution + Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Blood Group Distribution Histogram */}
              <div className="lg:col-span-6 glass-panel rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-red-400" />
                    Demand Distribution by Blood Group
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">Total Units Logged</span>
                </div>

                <div className="space-y-3.5 pt-2">
                  {groups.map((group) => {
                    const demand = insights.groupDemandDistribution[group] || 0;
                    const percent = Math.round((demand / maxGroupDemand) * 100);
                    const isTop = group === insights.highestDemandGroup;

                    return (
                      <div key={group} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-8 font-black text-sm ${isTop ? 'text-red-400' : 'text-white'}`}>{group}</span>
                            {isTop && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider">
                                Peak Demand
                              </span>
                            )}
                          </div>
                          <span className="font-extrabold text-gray-200 font-mono">
                            {demand} <span className="text-[10px] font-normal text-gray-400">units</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/[0.04]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isTop
                                ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-sm shadow-red-500'
                                : demand > 0
                                ? 'bg-gradient-to-r from-blue-600 to-blue-400'
                                : 'bg-gray-800'
                            }`}
                            style={{ width: `${Math.max(5, percent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: AI Actionable Recommendations */}
              <div className="lg:col-span-6 glass-panel rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Recommended Operational Actions
                </h3>

                <div className="space-y-3">
                  {insights.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-start gap-3.5"
                    >
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 shadow-sm">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed font-medium">{rec}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/[0.08]">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-2.5 font-mono">Key Clinical Insights</h4>
                  <ul className="space-y-2.5 text-xs text-gray-300">
                    {insights.insights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-red-400 font-bold text-sm leading-none mt-0.5">•</span>
                        <span className="leading-relaxed font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
