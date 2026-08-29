import React, { useState } from 'react';
import {
  Building2,
  Compass,
  Heart,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Phone,
  Radio,
  Sparkles,
  Users,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { BloodGroup, BloodRequest, Donor, Hospital } from '../../types';

interface LiveDelhiMapProps {
  hospitals: Hospital[];
  donors: Donor[];
  requests: BloodRequest[];
  selectedRequest: BloodRequest | null;
  onSelectHospital?: (hospital: Hospital) => void;
  onSelectDonor?: (donor: Donor) => void;
  onSelectRequest?: (request: BloodRequest) => void;
  highlightBloodGroup?: BloodGroup;
}

// Delhi Metro Area Bounding Box
// Lat: ~28.50 to ~28.75, Lng: ~77.05 to ~77.35
const DELHI_BOUNDS = {
  minLat: 28.48,
  maxLat: 28.76,
  minLng: 77.02,
  maxLng: 77.36,
};

export const LiveDelhiMap: React.FC<LiveDelhiMapProps> = ({
  hospitals,
  donors,
  requests,
  selectedRequest,
  onSelectHospital,
  onSelectDonor,
  onSelectRequest,
  highlightBloodGroup,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'HOSPITALS' | 'DONORS' | 'EMERGENCIES'>('ALL');
  const [activeItem, setActiveItem] = useState<{
    type: 'hospital' | 'donor' | 'request';
    data: Hospital | Donor | BloodRequest;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Convert GPS Coordinates (Lat, Lng) to SVG 0-100% coordinates
  const projectCoordinates = (lat: number, lng: number) => {
    // Clamp to Delhi bounds
    const clampedLat = Math.max(DELHI_BOUNDS.minLat, Math.min(DELHI_BOUNDS.maxLat, lat));
    const clampedLng = Math.max(DELHI_BOUNDS.minLng, Math.min(DELHI_BOUNDS.maxLng, lng));

    // X: Longitude (left -> right: 77.02 -> 77.36)
    const x = ((clampedLng - DELHI_BOUNDS.minLng) / (DELHI_BOUNDS.maxLng - DELHI_BOUNDS.minLng)) * 100;
    // Y: Latitude inverted (top is high latitude north: 28.76 -> 28.48)
    const y = ((DELHI_BOUNDS.maxLat - clampedLat) / (DELHI_BOUNDS.maxLat - DELHI_BOUNDS.minLat)) * 100;

    return { x: Math.max(6, Math.min(94, x)), y: Math.max(8, Math.min(92, y)) };
  };

  // Selected request target coordinate
  const requestCoord = selectedRequest ? projectCoordinates(selectedRequest.lat, selectedRequest.lng) : null;

  return (
    <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col">
      {/* Map Control Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-black/80 via-slate-950/80 to-black/80 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white tracking-tight">Delhi NCR Live Emergency & Distance Map</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live GPS
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Interactive proximity routing across AIIMS, Safdarjung, Max, Fortis, Apollo & standby donors
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 p-1 rounded-2xl text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === 'ALL' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Units
          </button>
          <button
            onClick={() => setFilterType('HOSPITALS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'HOSPITALS' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Hospitals ({hospitals.length})
          </button>
          <button
            onClick={() => setFilterType('DONORS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'DONORS' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Donors ({donors.length})
          </button>
          <button
            onClick={() => setFilterType('EMERGENCIES')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'EMERGENCIES' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Emergencies ({requests.filter((r) => r.status === 'PENDING').length})
          </button>
        </div>
      </div>

      {/* Interactive Map Visual Area */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-[#090d16] overflow-hidden select-none">
        {/* Stylized Delhi Map Background Grid & Landmarks */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Radial Delhi Center Ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-red-500/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-blue-500/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-white/20" />

          {/* Delhi Grid lines */}
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.15) 0%, transparent 60%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: '100% 100%, 40px 40px, 40px 40px',
            }}
          />
        </div>

        {/* Yamuna River Stylized Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <path
            d="M 68 0 Q 64 35, 60 55 T 66 100"
            fill="none"
            stroke="#0284c7"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          {/* Ring Road & Expressway Overlays */}
          <ellipse cx="50" cy="50" rx="35" ry="32" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
          <ellipse cx="50" cy="50" rx="20" ry="18" fill="none" stroke="#475569" strokeWidth="1.5" />

          {/* Distance vectors from Selected Request to nearby entities */}
          {selectedRequest &&
            (filterType === 'ALL' || filterType === 'HOSPITALS') &&
            hospitals.slice(0, 4).map((hosp) => {
              const hospCoord = projectCoordinates(hosp.lat, hosp.lng);
              return (
                <line
                  key={`route-hosp-${hosp.id}`}
                  x1={`${requestCoord?.x}%`}
                  y1={`${requestCoord?.y}%`}
                  x2={`${hospCoord.x}%`}
                  y2={`${hospCoord.y}%`}
                  stroke="rgba(59, 130, 246, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              );
            })}

          {selectedRequest &&
            (filterType === 'ALL' || filterType === 'DONORS') &&
            donors
              .filter((d) => d.isAvailable)
              .slice(0, 3)
              .map((d) => {
                const donCoord = projectCoordinates(d.lat, d.lng);
                return (
                  <line
                    key={`route-don-${d.id}`}
                    x1={`${requestCoord?.x}%`}
                    y1={`${requestCoord?.y}%`}
                    x2={`${donCoord.x}%`}
                    y2={`${donCoord.y}%`}
                    stroke="rgba(239, 68, 68, 0.5)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                );
              })}
        </svg>

        {/* Delhi Region Watermark Labels */}
        <div className="absolute top-4 left-6 text-[10px] uppercase font-mono font-bold text-gray-500/50 pointer-events-none">
          North Delhi / Civil Lines
        </div>
        <div className="absolute top-4 right-10 text-[10px] uppercase font-mono font-bold text-gray-500/50 pointer-events-none">
          East Delhi / Mayur Vihar
        </div>
        <div className="absolute bottom-6 left-6 text-[10px] uppercase font-mono font-bold text-gray-500/50 pointer-events-none">
          Gurugram / Dwarka Express
        </div>
        <div className="absolute bottom-6 right-10 text-[10px] uppercase font-mono font-bold text-gray-500/50 pointer-events-none">
          Noida / South-East Delhi
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] uppercase font-mono font-extrabold text-white/20 pointer-events-none tracking-widest">
          Central Delhi (Connaught Place)
        </div>

        {/* 1. RENDER HOSPITALS */}
        {(filterType === 'ALL' || filterType === 'HOSPITALS') &&
          hospitals.map((hosp) => {
            const coord = projectCoordinates(hosp.lat, hosp.lng);
            const isMatchGroupStock = highlightBloodGroup ? (hosp.inventory[highlightBloodGroup] || 0) > 0 : true;

            return (
              <div
                key={hosp.id}
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                onClick={() => {
                  setActiveItem({ type: 'hospital', data: hosp });
                  if (onSelectHospital) onSelectHospital(hosp);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  {/* Pulse for high stock hospitals */}
                  {isMatchGroupStock && (
                    <span className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
                  )}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center shadow-lg shadow-blue-950/80 border-2 border-blue-400/60 group-hover:scale-125 transition-transform duration-200">
                    <Building2 className="w-4 h-4" />
                  </div>

                  {/* Distance / Stock Pill */}
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md bg-black/90 border border-white/20 text-[9px] font-bold text-blue-300 whitespace-nowrap shadow-md group-hover:scale-110 transition-transform">
                    {hosp.distanceKm !== undefined ? `${hosp.distanceKm} km` : 'Delhi'}
                  </span>
                </div>
              </div>
            );
          })}

        {/* 2. RENDER DONORS */}
        {(filterType === 'ALL' || filterType === 'DONORS') &&
          donors.map((donor) => {
            const coord = projectCoordinates(donor.lat, donor.lng);
            const isAvailable = donor.isAvailable;

            return (
              <div
                key={donor.id}
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                onClick={() => {
                  setActiveItem({ type: 'donor', data: donor });
                  if (onSelectDonor) onSelectDonor(donor);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  {isAvailable && (
                    <span className="absolute w-6 h-6 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
                  )}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-[10px] text-white shadow-md border-2 transition-transform duration-200 group-hover:scale-125 ${
                      isAvailable
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-800 border-emerald-400'
                        : 'bg-gray-800 border-gray-600 opacity-60'
                    }`}
                  >
                    {donor.bloodGroup}
                  </div>
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded bg-black/80 text-[8px] font-semibold text-gray-300 whitespace-nowrap">
                    {donor.name.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}

        {/* 3. RENDER ACTIVE EMERGENCY REQUESTS */}
        {(filterType === 'ALL' || filterType === 'EMERGENCIES') &&
          requests
            .filter((r) => r.status === 'PENDING')
            .map((req) => {
              const coord = projectCoordinates(req.lat, req.lng);
              const isSelected = selectedRequest?.id === req.id;
              const isCritical = req.emergencyLevel === 'CRITICAL';

              return (
                <div
                  key={req.id}
                  style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                  onClick={() => {
                    setActiveItem({ type: 'request', data: req });
                    if (onSelectRequest) onSelectRequest(req);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Multi-tier SOS radar pulse */}
                    <span className="absolute w-12 h-12 rounded-full bg-red-600/40 animate-ping pointer-events-none" />
                    <span className="absolute w-8 h-8 rounded-full bg-red-500/30 animate-pulse pointer-events-none" />

                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-900 text-white font-black text-xs flex items-center justify-center shadow-xl shadow-red-900/80 border-2 transition-all group-hover:scale-125 ${
                        isSelected ? 'border-yellow-400 ring-4 ring-yellow-400/40 scale-110' : 'border-red-400'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-white fill-white animate-bounce" />
                    </div>

                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-red-600 border border-white/30 text-[9px] font-black text-white whitespace-nowrap shadow-lg uppercase tracking-wider">
                      SOS: {req.bloodGroup}
                    </span>
                  </div>
                </div>
              );
            })}

        {/* Map Information Hover / Click Modal Card */}
        {activeItem && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-4 rounded-2xl bg-[#0b0f19]/95 border border-white/20 backdrop-blur-xl shadow-2xl z-40 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-md ${
                    activeItem.type === 'hospital'
                      ? 'bg-blue-600'
                      : activeItem.type === 'donor'
                      ? 'bg-emerald-600'
                      : 'bg-red-600'
                  }`}
                >
                  {activeItem.type === 'hospital' ? (
                    <Building2 className="w-4 h-4" />
                  ) : activeItem.type === 'donor' ? (
                    (activeItem.data as Donor).bloodGroup
                  ) : (
                    (activeItem.data as BloodRequest).bloodGroup
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {activeItem.type === 'hospital'
                      ? (activeItem.data as Hospital).name
                      : activeItem.type === 'donor'
                      ? (activeItem.data as Donor).name
                      : (activeItem.data as BloodRequest).patientName}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {activeItem.type === 'hospital'
                      ? (activeItem.data as Hospital).address
                      : activeItem.type === 'donor'
                      ? `${(activeItem.data as Donor).city} • ${(activeItem.data as Donor).totalDonations} Donations`
                      : (activeItem.data as BloodRequest).locationName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Specific context stats */}
            {activeItem.type === 'hospital' && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-red-400" /> {(activeItem.data as Hospital).phone}
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  {Object.values((activeItem.data as Hospital).inventory).reduce((a, b) => a + b, 0)} Units In Stock
                </span>
              </div>
            )}

            {activeItem.type === 'donor' && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-400">Status</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    (activeItem.data as Donor).isAvailable
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {(activeItem.data as Donor).isAvailable ? 'Available for Dispatch' : 'Resting Period'}
                </span>
              </div>
            )}

            {activeItem.type === 'request' && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-red-400 font-bold">
                  {(activeItem.data as BloodRequest).unitsRequired} Unit(s) Required
                </span>
                <span className="text-orange-400 font-bold uppercase text-[10px]">
                  {(activeItem.data as BloodRequest).emergencyLevel}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Footer Legend */}
      <div className="p-3.5 bg-black/60 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" /> Delhi NCR Hospitals
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" /> Verified Donors
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" /> Emergency SOS Beacon
          </span>
          <span className="flex items-center gap-1.5 text-sky-400 font-mono">
            ≈ Yamuna River & Ring Road Grid
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500">
          <span>Center: Connaught Place, New Delhi (28.6304° N, 77.2177° E)</span>
        </div>
      </div>
    </div>
  );
};
