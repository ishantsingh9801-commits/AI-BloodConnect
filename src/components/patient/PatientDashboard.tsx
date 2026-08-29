import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  HeartHandshake,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { BloodGroup, BloodRequest, Donor, Hospital, RankedDonorMatch, User } from '../../types';
import { LiveDelhiMap } from '../common/LiveDelhiMap';

interface PatientDashboardProps {
  currentUser: User | null;
  requests: BloodRequest[];
  hospitals: Hospital[];
  donors?: Donor[];
  donorMatches: RankedDonorMatch[];
  selectedRequest: BloodRequest | null;
  onSelectRequest: (req: BloodRequest) => void;
  onOpenNLSearch: () => void;
  onOpenCreateRequest: () => void;
  onCancelRequest: (id: string) => Promise<void>;
  isLoadingMatches: boolean;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  requests,
  hospitals,
  donors = [],
  donorMatches,
  selectedRequest,
  onSelectRequest,
  onOpenNLSearch,
  onOpenCreateRequest,
  onCancelRequest,
  isLoadingMatches,
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [notifiedDonorId, setNotifiedDonorId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this emergency request?')) return;
    setCancellingId(id);
    try {
      await onCancelRequest(id);
    } finally {
      setCancellingId(null);
    }
  };

  const handleQuickNotify = (donorId: string, donorName: string) => {
    setNotifiedDonorId(donorId);
    setTimeout(() => {
      setNotifiedDonorId(null);
      alert(`Emergency push notification dispatched to donor ${donorName}!`);
    }, 800);
  };

  const currentActiveGroup: BloodGroup = selectedRequest?.bloodGroup || 'O+';

  return (
    <div className="space-y-6">
      {/* Top Banner Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Quick Trigger Cards */}
        <div className="md:col-span-8 bg-gradient-to-br from-red-950/50 via-[#131926]/90 to-[#0e121d]/90 border border-red-500/25 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-black/40">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/35 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-beacon" />
                Emergency Dispatch Portal
              </span>
              <span className="text-xs text-gray-400 font-medium hidden sm:inline">Metro Area Response SLA: &lt; 15 mins</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Need Blood Urgently? <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-rose-400">Find Compatible Donors.</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-xl leading-relaxed">
              Broadcast instant emergency alerts across regional hospital blood banks and verified compatible donors in Metro City.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 relative z-10">
            <button
              id="ai-search-launcher"
              onClick={onOpenNLSearch}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold transition-all shadow-xl shadow-red-950/60 border border-red-400/30 cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-red-200 group-hover:rotate-12 transition-transform" />
              <span>AI Natural Language Search</span>
              <span className="text-[10px] bg-red-800/60 px-1.5 py-0.5 rounded font-mono text-red-200">Gemini</span>
            </button>

            <button
              id="manual-request-launcher"
              onClick={onOpenCreateRequest}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 text-xs font-bold transition-all cursor-pointer shadow-md hover:border-white/25"
            >
              <Plus className="w-4 h-4 text-red-400" />
              <span>Standard Emergency Request</span>
            </button>
          </div>
        </div>

        {/* Quick Triage Summary */}
        <div className="md:col-span-4 glass-panel rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Regional Telemetry</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">LIVE</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                <span className="text-gray-300 font-medium flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Active Registered Donors
                </span>
                <span className="font-bold text-emerald-400">15 Standby</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                <span className="text-gray-300 font-medium flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-red-400" />
                  Hospitals Connected
                </span>
                <span className="font-bold text-white">{hospitals.length} Facilities</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                <span className="text-gray-300 font-medium flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  Active Requests
                </span>
                <span className="font-bold text-red-400">{requests.filter(r => r.status === 'PENDING').length} Pending</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-gray-400">
            <span>Deterministic ABO/Rh Engine</span>
            <span className="text-emerald-400 font-mono font-semibold">100% Deterministic</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Patient Workplace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Requests Queue */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              Your Emergency Requests ({requests.length})
            </h3>
            <span className="text-[10px] text-gray-400 font-medium">Click to inspect</span>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl text-gray-500">
                <HeartHandshake className="w-10 h-10 mx-auto mb-2 opacity-40 text-gray-400" />
                <p className="text-xs font-medium text-gray-300">No active blood requests</p>
                <button
                  onClick={onOpenCreateRequest}
                  className="mt-3 text-xs text-red-400 hover:text-red-300 underline font-semibold cursor-pointer"
                >
                  Create an emergency request
                </button>
              </div>
            ) : (
              requests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                const isCritical = req.emergencyLevel === 'CRITICAL';
                const isFulfilled = req.status === 'FULFILLED';
                const isCancelled = req.status === 'CANCELLED';

                return (
                  <div
                    key={req.id}
                    onClick={() => onSelectRequest(req)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-red-950/30 border-red-500/60 shadow-xl shadow-red-950/50 ring-1 ring-red-500/40'
                        : 'glass-panel hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white font-extrabold text-base flex items-center justify-center shadow-lg shadow-red-950/60 border border-red-400/30">
                          {req.bloodGroup}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-tight">{req.patientName}</h4>
                          <p className="text-[11px] text-gray-300 font-medium">{req.unitsRequired} Unit(s) Required</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isFulfilled ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold tracking-wide">
                            FULFILLED
                          </span>
                        ) : isCancelled ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30 text-[10px] font-extrabold tracking-wide">
                            CANCELLED
                          </span>
                        ) : isCritical ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-500/25 text-red-300 border border-red-500/50 text-[10px] font-extrabold tracking-wide animate-pulse">
                            CRITICAL
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-extrabold tracking-wide">
                            {req.emergencyLevel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-300 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span className="truncate">{req.locationName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>Created {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Action button */}
                    {req.status === 'PENDING' && (
                      <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
                        <span className="text-[11px] text-red-300 font-semibold flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-red-400" /> Matching Donors...
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(req.id);
                          }}
                          disabled={cancellingId === req.id}
                          className="text-[11px] text-gray-400 hover:text-red-400 transition-colors font-medium cursor-pointer"
                        >
                          {cancellingId === req.id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Smart Donor Match Visualization */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Smart Donor Matches (100-Pt Score)
            </h3>
            <span className="text-[11px] font-mono text-red-300 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              Target: {currentActiveGroup} Recipient
            </span>
          </div>

          <div className="glass-panel rounded-3xl p-6 relative shadow-2xl">
            {isLoadingMatches ? (
              <div className="py-16 text-center text-gray-400">
                <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-white">Running Deterministic Compatibility Engine...</p>
                <p className="text-[11px] text-gray-400 mt-1">Calculating ABO/Rh compatibility, Haversine distance, and 90-day safe intervals.</p>
              </div>
            ) : donorMatches.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-3 opacity-80" />
                <h4 className="text-sm font-bold text-white">No Compatible Donors in Range</h4>
                <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  No registered active donors found within standard radius matching {currentActiveGroup} compatibility. Check hospital blood banks on the right.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Top Recommended Match Spotlight */}
                {donorMatches[0] && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/40 via-black/40 to-slate-900/60 border border-red-500/35 relative shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-red-950/60 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Top Ranked Match
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-mono block">Smart Match Score</span>
                        <div className="flex items-baseline justify-end gap-0.5">
                          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">
                            {donorMatches[0].breakdown.totalScore}
                          </span>
                          <span className="text-xs font-semibold text-gray-400">/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-red-900/50 border border-red-400/30">
                          {donorMatches[0].donor.bloodGroup}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-base tracking-tight">{donorMatches[0].donor.name}</h4>
                          <p className="text-xs text-red-300 font-semibold flex items-center gap-1.5 mt-0.5">
                            <Navigation className="w-3 h-3 text-red-400" />
                            {donorMatches[0].donor.city} • {donorMatches[0].breakdown.distanceKm} km away
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            Last donated {donorMatches[0].breakdown.daysSinceLastDonation} days ago • {donorMatches[0].donor.totalDonations} lifetime donations
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuickNotify(donorMatches[0].donor.id, donorMatches[0].donor.name)}
                        disabled={notifiedDonorId === donorMatches[0].donor.id}
                        className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-950/50 cursor-pointer whitespace-nowrap"
                      >
                        {notifiedDonorId === donorMatches[0].donor.id ? 'Alerting...' : 'Alert Donor'}
                      </button>
                    </div>

                    {/* Breakdown Matrix Grid */}
                    <div className="grid grid-cols-4 gap-2 mt-4 pt-3.5 border-t border-white/10 text-center">
                      <div className="p-2 rounded-xl bg-black/50 border border-white/[0.06]">
                        <span className="text-[9px] text-gray-400 uppercase font-mono block">Compat</span>
                        <span className="text-xs font-extrabold text-emerald-400">{donorMatches[0].breakdown.compatibilityScore}/40</span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/[0.06]">
                        <span className="text-[9px] text-gray-400 uppercase font-mono block">Distance</span>
                        <span className="text-xs font-extrabold text-white">{donorMatches[0].breakdown.distanceScore}/25</span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/[0.06]">
                        <span className="text-[9px] text-gray-400 uppercase font-mono block">Availability</span>
                        <span className="text-xs font-extrabold text-blue-400">{donorMatches[0].breakdown.availabilityScore}/20</span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/[0.06]">
                        <span className="text-[9px] text-gray-400 uppercase font-mono block">Interval</span>
                        <span className="text-xs font-extrabold text-amber-400">{donorMatches[0].breakdown.eligibilityScore}/15</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Ranked Matches List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Other Compatible Standby Donors</h4>
                  {donorMatches.slice(1).map((match, idx) => (
                    <div
                      key={match.donor.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                          {match.donor.bloodGroup}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">{match.donor.name}</h5>
                          <p className="text-[11px] text-gray-400">
                            {match.breakdown.distanceKm} km • {match.donor.city}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-red-400">{match.breakdown.totalScore}/100</span>
                        <span className="text-[10px] text-gray-500 font-mono block">Rank #{idx + 2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nearby Hospitals Stock Availability */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-red-400" />
              Hospital Blood Stocks
            </h3>
            <span className="text-[11px] text-red-300 font-bold font-mono">{currentActiveGroup} In Stock</span>
          </div>

          <div className="space-y-3">
            {hospitals.map((hosp) => {
              const stock = hosp.inventory[currentActiveGroup] || 0;
              const isShortage = stock === 0;

              return (
                <div
                  key={hosp.id}
                  className="p-4 rounded-2xl glass-panel-interactive space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{hosp.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{hosp.distanceKm !== undefined ? `${hosp.distanceKm} km away` : hosp.city}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-black ${isShortage ? 'text-red-500' : 'text-emerald-400'}`}>
                        {stock} <span className="text-[10px] font-normal text-gray-400">units</span>
                      </span>
                    </div>
                  </div>

                  {/* Stock progress bar */}
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isShortage ? 'bg-red-600' : stock < 4 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (stock / 20) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                      <Phone className="w-3 h-3 text-red-400" /> {hosp.phone}
                    </span>
                    <span className="text-gray-500 text-[10px] uppercase font-mono">Delhi NCR</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Delhi NCR Dispatch & Distance Radar Map */}
      <div className="pt-2">
        <LiveDelhiMap
          hospitals={hospitals}
          donors={donors}
          requests={requests}
          selectedRequest={selectedRequest}
          highlightBloodGroup={currentActiveGroup}
          onSelectRequest={onSelectRequest}
        />
      </div>
    </div>
  );
};
