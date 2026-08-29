import React from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Compass,
  Heart,
  HeartHandshake,
  HeartPulse,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole, User as UserType } from '../../types';

interface NavbarProps {
  currentUser: UserType | null;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onResetDb: () => void;
  isResetting: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  onRoleChange,
  onOpenNotifications,
  unreadCount,
  onResetDb,
  isResetting,
  activeTab,
  onTabChange,
}) => {
  return (
    <>
      <header className="border-b border-white/[0.08] backdrop-blur-2xl bg-[#080a10]/90 sticky top-0 z-40 shadow-xl shadow-black/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
            onClick={() => onTabChange('dashboard')}
            role="button"
            tabIndex={0}
            aria-label="Go to home dashboard"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-red-900/50 border border-red-500/40 group-hover:scale-105 group-active:scale-95 transition-transform duration-200 shrink-0">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight leading-none whitespace-nowrap">
                  AI BloodConnect
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1 shadow-sm shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden xs:inline">Live</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium leading-none mt-1 hidden xl:block whitespace-nowrap">
                Emergency Availability & Smart Donor Matching
              </p>
              <p className="text-[10px] text-gray-400 font-medium leading-none mt-1 hidden sm:block xl:hidden whitespace-nowrap">
                Emergency Blood & Matching Network
              </p>
            </div>
          </div>

          {/* Navigation Tabs - Desktop */}
          <div className="hidden md:flex items-center gap-1 bg-black/50 border border-white/[0.08] p-1.5 rounded-2xl shadow-inner backdrop-blur-md">
            <button
              id="nav-tab-dashboard"
              onClick={() => onTabChange('dashboard')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                activeTab === 'dashboard'
                  ? 'text-white shadow-lg shadow-red-900/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'dashboard' && (
                <motion.div
                  layoutId="active-desktop-tab"
                  className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl border border-red-500/40"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {activeRole === 'patient' && <User className="w-3.5 h-3.5" />}
                {activeRole === 'donor' && <Heart className="w-3.5 h-3.5" />}
                {activeRole === 'hospital' && <Building2 className="w-3.5 h-3.5" />}
                <span>
                  {activeRole === 'patient' && 'Patient Portal'}
                  {activeRole === 'donor' && 'Donor Portal'}
                  {activeRole === 'hospital' && 'Hospital Portal'}
                </span>
              </span>
            </button>

            <button
              id="nav-tab-matching"
              onClick={() => onTabChange('matching')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                activeTab === 'matching'
                  ? 'text-white shadow-lg shadow-red-900/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'matching' && (
                <motion.div
                  layoutId="active-desktop-tab"
                  className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl border border-red-500/40"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Compatibility</span>
              </span>
            </button>

            <button
              id="nav-tab-map"
              onClick={() => onTabChange('map')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                activeTab === 'map'
                  ? 'text-white shadow-lg shadow-red-900/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'map' && (
                <motion.div
                  layoutId="active-desktop-tab"
                  className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl border border-red-500/40"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-red-400" />
                <span>Delhi Live Map</span>
              </span>
            </button>

            <button
              id="nav-tab-analytics"
              onClick={() => onTabChange('analytics')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                activeTab === 'analytics'
                  ? 'text-white shadow-lg shadow-red-900/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'analytics' && (
                <motion.div
                  layoutId="active-desktop-tab"
                  className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl border border-red-500/40"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>AI Demand Analytics</span>
              </span>
            </button>
          </div>

          {/* Role Switcher & Action Center */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Quick Role Switcher Pills */}
            <div className="flex items-center bg-black/60 border border-white/[0.08] rounded-2xl p-1 text-xs shadow-inner">
              <button
                id="role-switch-patient"
                onClick={() => onRoleChange('patient')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 font-bold flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 ${
                  activeRole === 'patient'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[11px] sm:text-xs">Patient</span>
              </button>
              <button
                id="role-switch-donor"
                onClick={() => onRoleChange('donor')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 font-bold flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 ${
                  activeRole === 'donor'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[11px] sm:text-xs">Donor</span>
              </button>
              <button
                id="role-switch-hospital"
                onClick={() => onRoleChange('hospital')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 font-bold flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 ${
                  activeRole === 'hospital'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[11px] sm:text-xs">Hospital</span>
              </button>
            </div>

            {/* Reset Baseline Data Button */}
            <button
              id="reset-demo-btn"
              onClick={onResetDb}
              disabled={isResetting}
              className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] text-xs transition-all duration-200 disabled:opacity-50 hover:border-white/20 cursor-pointer shadow-sm active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Reset blood banks, inventory & requests to initial baseline"
              aria-label="Reset demo database"
            >
              <RefreshCw className={`w-4 h-4 transition-transform ${isResetting ? 'animate-spin text-red-400' : 'hover:rotate-180 duration-500'}`} />
            </button>

            {/* Notifications Trigger */}
            <button
              id="notifications-btn"
              onClick={onOpenNotifications}
              className="relative p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.08] transition-all duration-200 hover:border-white/20 cursor-pointer shadow-sm active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="In-App Notifications"
              aria-label="Open notifications drawer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-pulse shadow-md shadow-red-900/60 ring-2 ring-[#080a10]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar for Perfect Mobile Usability */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080a10]/95 backdrop-blur-2xl border-t border-white/[0.1] px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'dashboard'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {activeRole === 'patient' && <User className="w-3.5 h-3.5 mb-0.5" />}
            {activeRole === 'donor' && <Heart className="w-3.5 h-3.5 mb-0.5" />}
            {activeRole === 'hospital' && <Building2 className="w-3.5 h-3.5 mb-0.5" />}
            <span>Portal</span>
          </button>

          <button
            onClick={() => onTabChange('matching')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'matching'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5 mb-0.5" />
            <span>Matrix</span>
          </button>

          <button
            onClick={() => onTabChange('map')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'map'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 mb-0.5 text-red-400" />
            <span>Delhi Map</span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'analytics'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 mb-0.5" />
            <span>Analytics</span>
          </button>
        </div>
      </div>
    </>
  );
};

