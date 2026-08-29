import React from 'react';
import { AlertCircle, CheckCircle, Clock, Info, Trash2, X } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0f1422]/95 border-l border-red-500/25 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-red-950/60 via-[#131926]/90 to-transparent">
          <div className="flex items-center gap-2.5">
            <h2 className="font-extrabold text-white text-base tracking-tight">In-App Notifications</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold font-mono">
              {notifications.length} Total
            </span>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-gray-400 hover:text-red-400 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                title="Clear all notifications"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <Info className="w-12 h-12 mb-3 opacity-40 text-gray-400" />
              <p className="text-sm font-bold text-white">No new notifications</p>
              <p className="text-xs mt-1 text-gray-400 max-w-xs leading-relaxed">
                You will receive alerts when blood requests are created, broadcast, or fulfilled.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isCritical = n.type === 'CRITICAL';
              const isSuccess = n.type === 'SUCCESS';

              return (
                <div
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isCritical
                      ? 'bg-red-950/40 border-red-500/40 hover:bg-red-950/60 ring-1 ring-red-500/20'
                      : isSuccess
                      ? 'bg-emerald-950/40 border-emerald-500/40 hover:bg-emerald-950/60 ring-1 ring-emerald-500/20'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  } ${!n.read ? 'ring-1 ring-white/30' : 'opacity-80'}`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5">
                      {isCritical ? (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      ) : isSuccess ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-beacon" />
                        )}
                      </div>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed font-medium">{n.message}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-2 font-mono">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3.5 border-t border-white/[0.08] text-center bg-black/60 text-[10px] text-gray-400 font-mono">
          Simulated Real-Time Alert Dispatch Telemetry
        </div>
      </div>
    </div>
  );
};
