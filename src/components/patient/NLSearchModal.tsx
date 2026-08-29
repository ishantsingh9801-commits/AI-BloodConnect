import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Bot, Check, Loader2, Sparkles, X, Zap } from 'lucide-react';
import { API } from '../../lib/api';
import { BloodGroup, EmergencyLevel, ParsedNLRequest } from '../../types';

interface NLSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRequest: (req: {
    patientName: string;
    bloodGroup: BloodGroup;
    unitsRequired: number;
    emergencyLevel: EmergencyLevel;
    hospitalName?: string;
    locationName?: string;
    notes?: string;
  }) => Promise<void>;
}

const SAMPLE_QUERIES = [
  'I urgently need 2 units of O- blood near AIIMS Delhi for accident ICU patient.',
  'Critical emergency: Require 3 bags of B+ blood at Max Super Speciality Hospital Saket right now.',
  'Need 1 unit of A- negative blood near Safdarjung Hospital for trauma surgery.',
  'Looking for 2 units of O+ blood near Sir Ganga Ram Hospital for post-operative support.',
];

export const NLSearchModal: React.FC<NLSearchModalProps> = ({ isOpen, onClose, onConfirmRequest }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedNLRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editable fields once parsed
  const [patientName, setPatientName] = useState('Emergency Patient (Delhi NCR)');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [units, setUnits] = useState<number>(2);
  const [emergencyLevel, setEmergencyLevel] = useState<EmergencyLevel>('CRITICAL');
  const [locationName, setLocationName] = useState('AIIMS South Trauma ICU');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleParse = async (textToParse?: string) => {
    const q = textToParse || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await API.parseNaturalLanguage(q);
      if (res.success && res.data) {
        setParsedResult(res.data);
        if (res.data.bloodGroup) setBloodGroup(res.data.bloodGroup);
        if (res.data.unitsRequired) setUnits(res.data.unitsRequired);
        if (res.data.emergencyLevel) setEmergencyLevel(res.data.emergencyLevel);
        if (res.data.hospitalName || res.data.locationName) {
          setLocationName(res.data.hospitalName || res.data.locationName || 'AIIMS Delhi Emergency Ward');
        }
        if (res.data.notes) setNotes(res.data.notes);
        if (res.data.patientName) setPatientName(res.data.patientName);
      } else {
        setError('Could not confidently parse the blood request. Please check input.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process AI natural language query.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispatch = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmRequest({
        patientName: patientName || 'Emergency Patient',
        bloodGroup,
        unitsRequired: units,
        emergencyLevel,
        hospitalName: locationName,
        locationName,
        notes: notes || parsedResult?.aiExplanation || 'Created via AI Natural Language Search',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0f1422]/95 border border-red-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-red-950/60 via-[#131926]/90 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 border border-red-400/40 flex items-center justify-center text-white shadow-lg shadow-red-950/60">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  AI Emergency Query Parser
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5 font-medium">
                Describe the situation in plain words — the AI extracts blood group, quantity, and triage level.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Text Input Area */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 font-mono">
              Describe Emergency Blood Requirement
            </label>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='e.g. "I urgently need 2 units of O- blood near Hospital Alpha for trauma patient..."'
                rows={3}
                className="w-full bg-black/60 border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 leading-relaxed font-medium"
              />
              <button
                onClick={() => handleParse()}
                disabled={isLoading || !query.trim()}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-lg shadow-red-950/60 cursor-pointer border border-red-400/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract & Match</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Samples */}
          <div>
            <span className="text-[11px] text-gray-400 block mb-2 font-mono uppercase font-bold">Quick Demo Scenarios:</span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUERIES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(sample);
                    handleParse(sample);
                  }}
                  className="text-left text-xs bg-black/40 hover:bg-black/60 text-gray-300 border border-white/10 hover:border-red-500/40 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-medium"
                >
                  "{sample.slice(0, 48)}..."
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl text-xs text-red-300 flex items-center gap-2.5 shadow-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Extracted Structured Card */}
          {parsedResult && (
            <div className="p-5 bg-black/40 border border-red-500/30 rounded-2xl space-y-4 animate-in fade-in duration-300 shadow-xl ring-1 ring-red-500/20">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-beacon" />
                  <span className="text-xs font-extrabold text-emerald-300">Extraction Confidence: {Math.round(parsedResult.confidence * 100)}%</span>
                </div>
                <span className="text-[11px] text-gray-300 font-medium">{parsedResult.aiExplanation}</span>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1 font-mono font-bold">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-black/80 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  >
                    {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1 font-mono font-bold">Units Required</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={units}
                    onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-black/80 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1 font-mono font-bold">Emergency Level</label>
                  <select
                    value={emergencyLevel}
                    onChange={(e) => setEmergencyLevel(e.target.value as EmergencyLevel)}
                    className="w-full bg-black/80 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  >
                    <option value="CRITICAL">🔴 CRITICAL (Immediate Life Threat)</option>
                    <option value="URGENT">🟠 URGENT (Within 2-4 Hours)</option>
                    <option value="NORMAL">🟢 NORMAL (Scheduled Transfusion)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1 font-mono font-bold">Hospital / Location</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-black/80 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1 font-mono font-bold">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-black/80 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/[0.08] bg-black/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleDispatch}
            disabled={!parsedResult || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-40 text-white text-xs font-extrabold transition-all shadow-xl shadow-red-950/60 cursor-pointer border border-red-400/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Broadcasting Request...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm & Broadcast Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
