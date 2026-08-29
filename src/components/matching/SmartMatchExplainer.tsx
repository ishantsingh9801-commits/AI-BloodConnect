import React, { useState } from 'react';
import {
  Activity,
  Award,
  Check,
  CheckCircle,
  HelpCircle,
  Info,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BloodGroup } from '../../types';

const ALL_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const RBC_COMPATIBILITY_MATRIX: Record<BloodGroup, BloodGroup[]> = {
  // Donor -> Recipients it can give to
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export const SmartMatchExplainer: React.FC = () => {
  const [selectedDonorGroup, setSelectedDonorGroup] = useState<BloodGroup>('O-');
  const [selectedRecipientGroup, setSelectedRecipientGroup] = useState<BloodGroup>('A+');

  const recipientsForSelectedDonor = RBC_COMPATIBILITY_MATRIX[selectedDonorGroup] || [];
  const isDirectlyCompatible = recipientsForSelectedDonor.includes(selectedRecipientGroup);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-950/50 via-[#131926]/90 to-[#0e121d]/90 border border-red-500/25 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-black/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Deterministic Clinical Rule Engine
            </span>
            <span className="text-xs text-gray-400 font-medium">100% Medical Accuracy Assurance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            ABO / Rh Compatibility & 100-Point Smart Match System
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-3xl leading-relaxed">
            AI BloodConnect strictly separates biological logic from probabilistic AI. Red Blood Cell (RBC) compatibility is 100% deterministic based on antigen-antibody agglutination laws, while Gemini AI is isolated to natural language query processing and demand forecasting.
          </p>
        </div>
      </div>

      {/* 100-Point Formula Breakdown Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-red-400" />
          The 100-Point Smart Donor Match Algorithm Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl glass-panel space-y-2 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white uppercase tracking-tight">1. Biological Fit</span>
              <span className="text-lg font-black text-red-400 font-mono">40 Pts</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              40 pts for exact match (e.g. O+ to O+), 35 pts for safe universal donor match (e.g. O- to A+), 0 pts if incompatible.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-panel space-y-2 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white uppercase tracking-tight">2. Proximity & ETA</span>
              <span className="text-lg font-black text-blue-400 font-mono">25 Pts</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Haversine formula: 25 pts for ≤3km, 20 pts for ≤7km, 15 pts for ≤15km, 10 pts for ≤30km, 5 pts for &gt;30km.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-panel space-y-2 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white uppercase tracking-tight">3. Live Availability</span>
              <span className="text-lg font-black text-emerald-400 font-mono">20 Pts</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              20 pts if donor switch is toggled [AVAILABLE] in real-time, 0 pts if toggled [UNAVAILABLE] or offline.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-panel space-y-2 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white uppercase tracking-tight">4. Safe Interval</span>
              <span className="text-lg font-black text-amber-400 font-mono">15 Pts</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              15 pts if &ge;90 days since last donation, 8 pts for 60–89 days, 0 pts if &lt;60 days (medically protected interval).
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Compatibility Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Selector */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 space-y-5 shadow-2xl">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Interactive Compatibility Tester
          </h3>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-2 font-mono">
                Select Donor Blood Group:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ALL_GROUPS.map((g) => (
                  <button
                    key={g}
                    id={`matrix-donor-${g}`}
                    onClick={() => setSelectedDonorGroup(g)}
                    className={`py-2.5 rounded-xl font-extrabold text-xs border transition-all duration-200 cursor-pointer active:scale-95 min-h-[42px] flex items-center justify-center ${
                      selectedDonorGroup === g
                        ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/60 ring-1 ring-red-400/40'
                        : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-2 font-mono">
                Select Recipient (Patient) Blood Group:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ALL_GROUPS.map((g) => (
                  <button
                    key={g}
                    id={`matrix-recipient-${g}`}
                    onClick={() => setSelectedRecipientGroup(g)}
                    className={`py-2.5 rounded-xl font-extrabold text-xs border transition-all duration-200 cursor-pointer active:scale-95 min-h-[42px] flex items-center justify-center ${
                      selectedRecipientGroup === g
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-950/60 ring-1 ring-blue-400/40'
                        : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Evaluation Result */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedDonorGroup}-${selectedRecipientGroup}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={`p-4 rounded-2xl border mt-4 flex items-center gap-3.5 ${
                  isDirectlyCompatible
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/20'
                    : 'bg-red-950/30 border-red-500/40 text-red-300 ring-1 ring-red-500/20'
                }`}
              >
                {isDirectlyCompatible ? (
                  <CheckCircle className="w-7 h-7 flex-shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="w-7 h-7 flex-shrink-0 text-red-400" />
                )}
                <div>
                  <h4 className="text-xs font-extrabold text-white">
                    {isDirectlyCompatible
                      ? `SAFE: Donor ${selectedDonorGroup} CAN donate to Recipient ${selectedRecipientGroup}`
                      : `INCOMPATIBLE: Donor ${selectedDonorGroup} CANNOT donate to Recipient ${selectedRecipientGroup}`}
                  </h4>
                  <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed font-medium">
                    {isDirectlyCompatible
                      ? `${selectedDonorGroup === 'O-' ? 'Universal donor RBC cells have neither A nor B antigens and no Rh factor.' : 'Antigen antibodies match clinical safety criteria.'}`
                      : `Risk of acute hemolytic transfusion reaction due to incompatible antigen/antibody agglutination.`}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Full Reference Matrix Table */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Full Red Blood Cell (RBC) Compatibility Matrix
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Row: Donor | Col: Recipient</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-gray-400">
                  <th className="p-2.5 text-left font-bold text-white">Donor \ Recipient</th>
                  {ALL_GROUPS.map((r) => (
                    <th key={r} className="p-2.5 font-bold text-white">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ALL_GROUPS.map((d) => {
                  const allowed = RBC_COMPATIBILITY_MATRIX[d] || [];
                  return (
                    <tr key={d} className="hover:bg-white/5 transition-colors">
                      <td className="p-2.5 text-left font-black text-red-400">{d}</td>
                      {ALL_GROUPS.map((r) => {
                        const canGive = allowed.includes(r);
                        return (
                          <td key={r} className="p-2.5">
                            {canGive ? (
                              <span className="inline-flex w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 items-center justify-center font-bold text-xs shadow-sm">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex w-6 h-6 rounded-lg bg-white/[0.04] text-gray-600 items-center justify-center font-bold text-xs">
                                -
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
