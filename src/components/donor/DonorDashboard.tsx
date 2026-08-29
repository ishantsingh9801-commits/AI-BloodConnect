import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  HeartHandshake,
  MapPin,
  Navigation,
  Phone,
  Power,
  Radio,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  UserCheck,
  Zap,
} from 'lucide-react';
import { BloodGroup, BloodRequest, Donor, User } from '../../types';

interface DonorDashboardProps {
  currentUser: User | null;
  donor: Donor | null;
  requests: BloodRequest[];
  onToggleAvailability: (isAvailable: boolean) => Promise<void>;
  onDonorRespond: (requestId: string, action: 'ACCEPT' | 'DECLINE') => Promise<void>;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  currentUser,
  donor,
  requests,
  onToggleAvailability,
  onDonorRespond,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [respondedMap, setRespondedMap] = useState<Record<string, 'ACCEPTED' | 'DECLINED'>>({});

  const donorBloodGroup: BloodGroup = donor?.bloodGroup || 'O-';
  const isAvailable = donor?.isAvailable ?? true;

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggleAvailability(!isAvailable);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAction = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
    setRespondingId(requestId);
    try {
      await onDonorRespond(requestId, action);
      setRespondedMap((prev) => ({ ...prev, [requestId]: action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED' }));
    } finally {
      setRespondingId(null);
    }
  };

  // Filter requests that are compatible with this donor's blood group
  const compatibleRequests = requests.filter((r) => {
    if (r.status !== 'PENDING') return false;
    // O- can donate to any group; otherwise exact group match or compatible
    if (donorBloodGroup === 'O-') return true;
    if (donorBloodGroup === 'O+') return ['O+', 'A+', 'B+', 'AB+'].includes(r.bloodGroup);
    if (donorBloodGroup === 'A-') return ['A-', 'A+', 'AB-', 'AB+'].includes(r.bloodGroup);
    if (donorBloodGroup === 'A+') return ['A+', 'AB+'].includes(r.bloodGroup);
    if (donorBloodGroup === 'B-') return ['B-', 'B+', 'AB-', 'AB+'].includes(r.bloodGroup);
    if (donorBloodGroup === 'B+') return ['B+', 'AB+'].includes(r.bloodGroup);
    if (donorBloodGroup === 'AB-') return ['AB-', 'AB+'].includes(r.bloodGroup);
    return r.bloodGroup === 'AB+';
  });

  return (
    <div className="space-y-6">
      {/* Donor Profile Header & Status Toggle Card */}
      <div className="bg-gradient-to-br from-red-950/50 via-[#131926]/90 to-[#0e121d]/90 border border-red-500/25 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-black/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-3xl text-white shadow-2xl shadow-red-900/50 border border-red-400/30">
              {donorBloodGroup}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Welcome, {donor?.name || currentUser?.fullName || 'John Doe (Donor)'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-extrabold tracking-wide uppercase">
                  {donorBloodGroup === 'O-' ? '⭐ Universal RBC Donor' : 'Verified Lifesaver'}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 font-medium">
                {donor?.city || 'Metro City Central'} • Age: {donor?.age || 29} • Phone: {donor?.phone || '+1 (555) 345-6789'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mt-2 font-medium">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-red-400" />
                  Last Donated: {donor?.lastDonationDate || '2026-04-10'}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Eligible for Donation (Safe interval &gt;90d)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Availability Toggle Card */}
          <div className="flex flex-col items-start md:items-end gap-2.5 bg-black/50 p-4 rounded-2xl border border-white/[0.08] w-full md:w-auto shadow-inner">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              Emergency Availability Switch
            </span>
            <button
              id="donor-availability-toggle"
              onClick={handleToggle}
              disabled={isUpdating}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xl cursor-pointer ${
                isAvailable
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-950/60 hover:bg-emerald-500/30 ring-1 ring-emerald-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              <Power className={`w-4 h-4 ${isAvailable ? 'text-emerald-400 animate-beacon' : 'text-gray-500'}`} />
              <span>{isAvailable ? 'STATUS: ACTIVE FOR CALLS' : 'STATUS: UNAVAILABLE'}</span>
            </button>
            <p className="text-[11px] text-gray-400">
              {isAvailable ? '✅ You are discoverable for emergency matching.' : '⏸️ You will not receive emergency dispatch alerts.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Compatible Emergency Requests & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Emergency Broadcasts */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Compatible Nearby Requests ({compatibleRequests.length})
            </h3>
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Sorted by Emergency Level</span>
          </div>

          <div className="space-y-3">
            {compatibleRequests.length === 0 ? (
              <div className="p-12 text-center glass-panel rounded-3xl text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-60" />
                <h4 className="text-sm font-bold text-white">No Pending Emergencies For Your Group</h4>
                <p className="text-xs text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  All current regional requests for {donorBloodGroup} have been fulfilled. The system will broadcast an instant alert if a patient requires your blood group.
                </p>
              </div>
            ) : (
              compatibleRequests.map((req) => {
                const isCritical = req.emergencyLevel === 'CRITICAL';
                const responseStatus = respondedMap[req.id];

                return (
                  <div
                    key={req.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCritical
                        ? 'bg-red-950/30 border-red-500/40 ring-1 ring-red-500/30 shadow-lg shadow-red-950/40'
                        : 'glass-panel hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                            Required: <span className="font-bold text-white">{req.unitsRequired} Units</span> • {req.locationName}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Attendant / Contact: <span className="text-gray-300">{req.requesterName}</span> ({req.requesterPhone})
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {responseStatus === 'ACCEPTED' ? (
                          <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                            <CheckCircle className="w-4 h-4 text-emerald-400" /> Accepted — Hospital Alerted
                          </span>
                        ) : responseStatus === 'DECLINED' ? (
                          <span className="px-3.5 py-2 rounded-xl bg-gray-800 text-gray-400 text-xs font-medium border border-gray-700">
                            Declined
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAction(req.id, 'ACCEPT')}
                              disabled={respondingId === req.id}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-950/60 transition-all cursor-pointer border border-red-400/30"
                            >
                              {respondingId === req.id ? 'Confirming...' : 'Accept to Donate'}
                            </button>
                            <button
                              onClick={() => handleAction(req.id, 'DECLINE')}
                              disabled={respondingId === req.id}
                              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white text-xs transition-all border border-white/10 cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {req.notes && (
                      <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-gray-300 leading-relaxed">
                        <span className="text-gray-400 font-semibold">Clinical Note: </span>
                        {req.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Donation History & Guidelines */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <HeartHandshake className="w-3.5 h-3.5 text-red-400" />
            Donation History & Lifetime Impact
          </h3>

          <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 bg-black/40 border border-white/[0.06] rounded-2xl">
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Total Donations</span>
                <span className="text-2xl font-black text-white">{donor?.totalDonations || 6}</span>
              </div>
              <div className="p-3.5 bg-black/40 border border-white/[0.06] rounded-2xl">
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Lives Impacted</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">
                  ~{((donor?.totalDonations || 6) * 3)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recent Activity Timeline</h4>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs space-y-1">
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Whole Blood (450ml)</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>
                </div>
                <p className="text-[11px] text-gray-400">Hospital Alpha Blood Bank • April 10, 2026</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs space-y-1">
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Emergency Response ({donorBloodGroup})</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>
                </div>
                <p className="text-[11px] text-gray-400">City Trauma Center • January 14, 2026</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
              <span className="font-bold block text-[11px] text-blue-300 mb-1">💡 90-Day Safe Interval Protocol:</span>
              Human RBC regeneration takes approximately 8-12 weeks. Maintaining this threshold ensures donor hemodynamic stability.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
