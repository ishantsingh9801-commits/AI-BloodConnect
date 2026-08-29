import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/common/Navbar';
import { DemoBanner } from './components/common/DemoBanner';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { NLSearchModal } from './components/patient/NLSearchModal';
import { CreateRequestModal } from './components/patient/CreateRequestModal';
import { DonorDashboard } from './components/donor/DonorDashboard';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { SmartMatchExplainer } from './components/matching/SmartMatchExplainer';
import { DemandAnalytics } from './components/analytics/DemandAnalytics';
import { API } from './lib/api';
import {
  BloodGroup,
  BloodRequest,
  Donor,
  EmergencyLevel,
  Hospital,
  NotificationItem,
  RankedDonorMatch,
  User,
  UserRole,
} from './types';

export default function App() {
  // Navigation & Role State
  const [activeRole, setActiveRole] = useState<UserRole>('patient');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data States
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [donorMatches, setDonorMatches] = useState<RankedDonorMatch[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');

  // Modals & Drawers
  const [isNLSearchOpen, setIsNLSearchOpen] = useState(false);
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Loading flags
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // 1. Initial Load of DB Collections
  const loadData = useCallback(async () => {
    try {
      const [hospList, donorList, reqList, notifList] = await Promise.all([
        API.getHospitals(),
        API.getDonors(),
        API.getRequests(),
        API.getNotifications(),
      ]);

      setHospitals(hospList);
      setDonors(donorList);
      setRequests(reqList);
      setNotifications(notifList);

      if (hospList.length > 0 && !selectedHospitalId) {
        setSelectedHospitalId(hospList[0].id);
      }

      // Default selected request to the first pending request if none selected
      if (!selectedRequest && reqList.length > 0) {
        setSelectedRequest(reqList[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHospitalId, selectedRequest]);

  useEffect(() => {
    loadData();
    // Simulate periodic polling for new notifications & requests
    const interval = setInterval(async () => {
      try {
        const [reqList, notifList] = await Promise.all([
          API.getRequests(),
          API.getNotifications(),
        ]);
        setRequests(reqList);
        setNotifications(notifList);
      } catch (e) {
        // silent catch
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // 2. Fetch Ranked Donor Matches whenever the selected request changes
  const fetchMatchesForRequest = useCallback(async (req: BloodRequest) => {
    setIsLoadingMatches(true);
    try {
      const res = await API.rankDonors(req.bloodGroup, req.lat, req.lng);
      if (res.success && res.matches) {
        setDonorMatches(res.matches);
      }
    } catch (e) {
      console.error('Failed to fetch donor matches:', e);
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      fetchMatchesForRequest(selectedRequest);
    }
  }, [selectedRequest, fetchMatchesForRequest]);

  // 3. Handlers
  const handleRoleChange = async (role: UserRole) => {
    setActiveRole(role);
    // Switch simulated user context
    try {
      const res = await API.login(undefined, undefined, role);
      if (res.success && res.user) {
        setCurrentUser(res.user);
      }
    } catch (e) {
      console.warn('Role switch fallback:', e);
    }
  };

  const handleCreateRequest = async (data: {
    patientName: string;
    bloodGroup: BloodGroup;
    unitsRequired: number;
    emergencyLevel: EmergencyLevel;
    hospitalId?: string;
    hospitalName?: string;
    locationName?: string;
    notes?: string;
  }) => {
    const res = await API.createRequest(data);
    if (res.success && res.data) {
      setSelectedRequest(res.data);
      await loadData();
    }
  };

  const handleCancelRequest = async (id: string) => {
    await API.cancelRequest(id, currentUser?.fullName || 'Requester');
    await loadData();
  };

  const handleToggleDonorAvailability = async (isAvailable: boolean) => {
    const activeDonor = donors[0]; // Active donor in role
    if (activeDonor) {
      await API.toggleDonorAvailability(activeDonor.id, isAvailable);
      await loadData();
      if (selectedRequest) {
        fetchMatchesForRequest(selectedRequest);
      }
    }
  };

  const handleDonorRespond = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
    // Refresh alerts & state
    await loadData();
  };

  const handleUpdateHospitalInventory = async (hospitalId: string, group: BloodGroup, delta: number) => {
    await API.adjustHospitalInventory(hospitalId, group, delta);
    const updated = await API.getHospitals();
    setHospitals(updated);
  };

  const handleFulfillRequest = async (requestId: string, hospitalId: string) => {
    await API.fulfillRequest(requestId, hospitalId, 'Hospital Blood Bank Staff');
    await loadData();
    if (selectedRequest?.id === requestId) {
      const refreshed = await API.getRequests();
      const updatedReq = refreshed.find((r) => r.id === requestId);
      if (updatedReq) setSelectedRequest(updatedReq);
    }
  };

  const handleResetDb = async () => {
    setIsResetting(true);
    try {
      await API.resetDemoDb();
      await loadData();
      setSelectedRequest(null);
      alert('Demo database reset to default pristine state!');
    } finally {
      setIsResetting(false);
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Dynamic Glow Accents for Frosted Glass Theme */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        unreadCount={unreadNotifCount}
        onResetDb={handleResetDb}
        isResetting={isResetting}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Emergency Network Notice Banner */}
      <DemoBanner onTriggerNLSearch={() => setIsNLSearchOpen(true)} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 md:pb-8">
        {isLoading ? (
          <div className="py-32 text-center text-gray-400">
            <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-white">Initializing AI BloodConnect...</p>
            <p className="text-xs text-gray-500 mt-1">Booting in-memory database & compatibility matrix</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* TAB 1: Main Role Dashboard */}
            {activeTab === 'dashboard' && (
              <motion.div
                key={`tab-dashboard-${activeRole}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {activeRole === 'patient' && (
                  <PatientDashboard
                    currentUser={currentUser}
                    requests={requests}
                    hospitals={hospitals}
                    donorMatches={donorMatches}
                    selectedRequest={selectedRequest}
                    onSelectRequest={(r) => setSelectedRequest(r)}
                    onOpenNLSearch={() => setIsNLSearchOpen(true)}
                    onOpenCreateRequest={() => setIsCreateRequestOpen(true)}
                    onCancelRequest={handleCancelRequest}
                    isLoadingMatches={isLoadingMatches}
                  />
                )}

                {activeRole === 'donor' && (
                  <DonorDashboard
                    currentUser={currentUser}
                    donor={donors[0] || null}
                    requests={requests}
                    onToggleAvailability={handleToggleDonorAvailability}
                    onDonorRespond={handleDonorRespond}
                  />
                )}

                {activeRole === 'hospital' && (
                  <HospitalDashboard
                    currentUser={currentUser}
                    hospitals={hospitals}
                    selectedHospitalId={selectedHospitalId}
                    onSelectHospital={(id) => setSelectedHospitalId(id)}
                    requests={requests}
                    onUpdateInventory={handleUpdateHospitalInventory}
                    onFulfillRequest={handleFulfillRequest}
                  />
                )}
              </motion.div>
            )}

            {/* TAB 2: Compatibility & Rules */}
            {activeTab === 'matching' && (
              <motion.div
                key="tab-matching"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <SmartMatchExplainer />
              </motion.div>
            )}

            {/* TAB 3: AI Analytics */}
            {activeTab === 'analytics' && (
              <motion.div
                key="tab-analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <DemandAnalytics />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Modals & Slide-overs */}
      <NLSearchModal
        isOpen={isNLSearchOpen}
        onClose={() => setIsNLSearchOpen(false)}
        onConfirmRequest={handleCreateRequest}
      />

      <CreateRequestModal
        isOpen={isCreateRequestOpen}
        onClose={() => setIsCreateRequestOpen(false)}
        hospitals={hospitals}
        onSubmit={handleCreateRequest}
      />

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkRead={(id) => {
          API.markNotificationRead(id);
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        }}
        onClearAll={() => setNotifications([])}
      />
    </div>
  );
}
