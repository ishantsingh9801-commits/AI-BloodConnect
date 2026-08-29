import React, { useState } from 'react';
import { AlertCircle, Check, HeartPulse, Loader2, X } from 'lucide-react';
import { BloodGroup, EmergencyLevel, Hospital } from '../../types';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  onSubmit: (data: {
    patientName: string;
    bloodGroup: BloodGroup;
    unitsRequired: number;
    emergencyLevel: EmergencyLevel;
    hospitalId?: string;
    hospitalName?: string;
    locationName?: string;
    notes?: string;
  }) => Promise<void>;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  onSubmit,
}) => {
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [units, setUnits] = useState(2);
  const [emergencyLevel, setEmergencyLevel] = useState<EmergencyLevel>('CRITICAL');
  const [hospitalId, setHospitalId] = useState(hospitals[0]?.id || '');
  const [customLocation, setCustomLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Patient name is required');
      return;
    }

    const selectedHospital = hospitals.find((h) => h.id === hospitalId);
    const locationName = customLocation.trim() || selectedHospital?.name || 'Emergency Department';

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        patientName: patientName.trim(),
        bloodGroup,
        unitsRequired: units,
        emergencyLevel,
        hospitalId: selectedHospital ? selectedHospital.id : undefined,
        hospitalName: selectedHospital ? selectedHospital.name : undefined,
        locationName,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0f1422]/95 border border-red-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-red-950/60 via-[#131926]/90 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 border border-red-400/40 flex items-center justify-center text-white shadow-lg shadow-red-950/60">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg tracking-tight">Create Emergency Blood Request</h2>
              <p className="text-xs text-gray-300 font-medium">Broadcasts instant alerts to compatible donors & regional hospitals.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl text-xs text-red-300 flex items-center gap-2.5 shadow-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 font-mono">
              Patient Name / Attendant Info *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Robert Jenkins (ICU Bed 4)"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-medium placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 font-mono">
                Required Blood Group *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full bg-black/60 border border-white/15 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-semibold"
              >
                {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 font-mono">
                Number of Units *
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={units}
                onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-black/60 border border-white/15 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 font-mono">
              Emergency Level *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEmergencyLevel('CRITICAL')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all text-center cursor-pointer ${
                  emergencyLevel === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-300 border-red-500/80 shadow-lg shadow-red-950/60 ring-1 ring-red-400/40'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                🔴 CRITICAL
              </button>
              <button
                type="button"
                onClick={() => setEmergencyLevel('URGENT')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all text-center cursor-pointer ${
                  emergencyLevel === 'URGENT'
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/80 shadow-lg shadow-orange-950/60 ring-1 ring-orange-400/40'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                🟠 URGENT
              </button>
              <button
                type="button"
                onClick={() => setEmergencyLevel('NORMAL')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all text-center cursor-pointer ${
                  emergencyLevel === 'NORMAL'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/80 shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400/40'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                🟢 NORMAL
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 font-mono">
              Select Destination Hospital / Blood Bank
            </label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-semibold"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.distanceKm !== undefined ? `${h.distanceKm} km away` : h.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 font-mono">
              Specific Ward / Room / Location Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. ICU Wing B, Room 304"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 font-mono">
              Clinical Notes / Urgency Reason (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Emergency surgery scheduled at 2:00 PM..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 placeholder-gray-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-40 text-white text-xs font-extrabold transition-all shadow-xl shadow-red-950/60 cursor-pointer border border-red-400/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Dispatch Blood Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
