import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Building2,
  CheckCircle,
  Clock,
  HeartPulse,
  Layers,
  MapPin,
  Minus,
  Plus,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { BloodGroup, BloodRequest, Hospital, User } from '../../types';

interface HospitalDashboardProps {
  currentUser: User | null;
  hospitals: Hospital[];
  selectedHospitalId: string;
  onSelectHospital: (id: string) => void;
  requests: BloodRequest[];
  onUpdateInventory: (hospitalId: string, group: BloodGroup, delta: number) => Promise<void>;
  onFulfillRequest: (requestId: string, hospitalId: string) => Promise<void>;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  currentUser,
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  requests,
  onUpdateInventory,
  onFulfillRequest,
}) => {
  const [updatingGroup, setUpdatingGroup] = useState<string | null>(null);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const handleAdjust = async (group: BloodGroup, delta: number) => {
    if (!activeHospital) return;
    const currentVal = activeHospital.inventory[group] || 0;
    if (delta < 0 && currentVal <= 0) return;

    setUpdatingGroup(group);
    setFeedbackMsg(null);
    try {
      await onUpdateInventory(activeHospital.id, group, delta);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to update inventory' });
    } finally {
      setUpdatingGroup(null);
    }
  };

  const handleFulfill = async (req: BloodRequest) => {
    if (!activeHospital) return;
    const available = activeHospital.inventory[req.bloodGroup] || 0;
    if (available < req.unitsRequired) {
      alert(
        `Insufficient stock! Hospital currently has ${available} units of ${req.bloodGroup}, but ${req.unitsRequired} units are requested.`
      );
      return;
    }

    setFulfillingId(req.id);
    setFeedbackMsg(null);
    try {
      await onFulfillRequest(req.id, activeHospital.id);
      setFeedbackMsg({
        type: 'success',
        text: `Successfully fulfilled Request #${req.id.slice(-6)} for ${req.patientName}. Inventory automatically updated!`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to fulfill request' });
    } finally {
      setFulfillingId(null);
    }
  };

  // Pending emergency requests
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const fulfilledCount = requests.filter((r) => r.status === 'FULFILLED').length;

  // Calculate total blood units
  const totalStockUnits = activeHospital
    ? BLOOD_GROUPS.reduce((acc, g) => acc + (activeHospital.inventory[g] || 0), 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Hospital Top Bar & Switcher */}
      <div className="bg-gradient-to-br from-red-950/50 via-[#131926]/90 to-[#0e121d]/90 border border-red-500/25 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-black/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-2xl shadow-blue-900/40 border border-blue-400/30">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{activeHospital?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                  Verified Blood Bank Facility
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 font-medium">
                {activeHospital?.address} • Phone: {activeHospital?.phone} • {activeHospital?.totalBeds} Critical Care Beds
              </p>
            </div>
          </div>

          {/* Hospital Switcher for Demo evaluation */}
          <div className="flex items-center gap-2.5 bg-black/50 p-2.5 rounded-2xl border border-white/[0.08] w-full md:w-auto shadow-inner">
            <span className="text-[10px] text-gray-400 font-mono uppercase pl-2 font-semibold">Facility Switcher:</span>
            <select
              value={activeHospital?.id}
              onChange={(e) => onSelectHospital(e.target.value)}
              className="bg-black/80 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold cursor-pointer"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.08] relative z-10">
          <div className="p-4 bg-black/40 border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Total Blood Stock</span>
            <span className="text-2xl font-black text-white">{totalStockUnits} <span className="text-xs text-gray-400 font-normal">units</span></span>
          </div>
          <div className="p-4 bg-black/40 border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Emergency Queue</span>
            <span className="text-2xl font-black text-red-400">{pendingRequests.length} <span className="text-xs text-gray-400 font-normal">pending</span></span>
          </div>
          <div className="p-4 bg-black/40 border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Fulfilled Transfusions</span>
            <span className="text-2xl font-black text-emerald-400">{fulfilledCount}</span>
          </div>
          <div className="p-4 bg-black/40 border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Stock Reserve Health</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-beacon" /> OPERATIONAL (Safe)
            </span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Grid: Inventory Management + Emergency Fulfill Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive 8-Blood-Group Stock Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Real-Time Blood Bank Inventory (8 Groups)
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">Instant Demo Stock Mod</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BLOOD_GROUPS.map((group) => {
              const count = activeHospital?.inventory[group] || 0;
              const isLow = count < 4;
              const isEmpty = count === 0;

              return (
                <div
                  key={group}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEmpty
                      ? 'bg-red-950/30 border-red-500/40 ring-1 ring-red-500/20'
                      : isLow
                      ? 'bg-orange-950/30 border-orange-500/40'
                      : 'glass-panel hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-white">{group}</span>
                    <span
                      className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                        isEmpty
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : isLow
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isEmpty ? 'DEPLETED' : isLow ? 'LOW' : 'STABLE'}
                    </span>
                  </div>

                  <div className="my-3 text-center">
                    <span className="text-3xl font-black text-white">{count}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-mono block mt-0.5">Units In Stock</span>
                  </div>

                  {/* Stock Bar */}
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-3.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isEmpty ? 'bg-red-600' : isLow ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (count / 20) * 100)}%` }}
                    />
                  </div>

                  {/* Interactive Adjustment Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`inv-dec-${group}`}
                      onClick={() => handleAdjust(group, -1)}
                      disabled={count <= 0 || updatingGroup === group}
                      className="flex-1 py-2.5 rounded-xl bg-black/50 hover:bg-black/80 disabled:opacity-30 border border-white/10 text-white flex items-center justify-center transition-all duration-200 cursor-pointer font-bold active:scale-95 hover:border-white/30"
                      title="Decrease 1 unit"
                      aria-label={`Decrease ${group} stock`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      id={`inv-inc-${group}`}
                      onClick={() => handleAdjust(group, 1)}
                      disabled={updatingGroup === group}
                      className="flex-1 py-2.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-white flex items-center justify-center transition-all duration-200 cursor-pointer font-bold active:scale-95 hover:border-red-400"
                      title="Add 1 unit"
                      aria-label={`Increase ${group} stock`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Emergency Fulfill Queue */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Incoming Emergency Requests Queue ({pendingRequests.length})
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">One-click Stock Dispatch</span>
          </div>

          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="p-12 text-center glass-panel rounded-3xl text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-60" />
                <h4 className="text-sm font-bold text-white">Emergency Queue Clear</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  No active pending blood requests require hospital stock dispatch at this moment.
                </p>
              </div>
            ) : (
              pendingRequests.map((req) => {
                const stockAvailable = activeHospital?.inventory[req.bloodGroup] || 0;
                const canFulfill = stockAvailable >= req.unitsRequired;
                const isCritical = req.emergencyLevel === 'CRITICAL';

                return (
                  <div
                    key={req.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCritical
                        ? 'bg-red-950/30 border-red-500/40 ring-1 ring-red-500/30 shadow-lg shadow-red-950/40'
                        : 'glass-panel hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-lg flex items-center justify-center shadow-md shadow-red-950/50 border border-red-400/30">
                          {req.bloodGroup}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-white tracking-tight">{req.patientName}</h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isCritical
                                  ? 'bg-red-500/25 text-red-300 border border-red-500/50 animate-pulse'
                                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              }`}
                            >
                              {req.emergencyLevel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 mt-0.5 font-medium">
                            Demand: <span className="font-bold text-white">{req.unitsRequired} Units</span> • {req.locationName}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Facility Stock: <span className={canFulfill ? 'text-emerald-400 font-bold font-mono' : 'text-red-400 font-bold font-mono'}>{stockAvailable} Units</span>
                          </p>
                        </div>
                      </div>

                      {/* Fulfill Action */}
                      <div>
                        <button
                          id={`fulfill-btn-${req.id}`}
                          onClick={() => handleFulfill(req)}
                          disabled={fulfillingId === req.id || !canFulfill}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-lg ${
                            canFulfill
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-950/50 border border-emerald-400/30 cursor-pointer active:scale-95 hover:scale-[1.02]'
                              : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-70'
                          }`}
                        >
                          {fulfillingId === req.id ? 'Dispatching...' : canFulfill ? 'Fulfill & Dispatch' : 'Low Stock'}
                        </button>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-gray-300">
                        {req.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
