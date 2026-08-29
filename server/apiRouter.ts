import { Router } from 'express';
import { db } from './services/db';
import {
  calculateSmartMatchScore,
  getCompatibleDonorGroups,
  isCompatible,
  RBC_DONATION_COMPATIBILITY,
  RBC_RECIPIENT_COMPATIBILITY,
} from './services/compatibility';
import { parseEmergencyQuery, generateBloodDemandInsights } from './services/gemini';
import { BloodGroup, BloodRequest, EmergencyLevel, RankedDonorMatch, UserRole } from '../src/types';

export const apiRouter = Router();

// -------------------------------------------------------------
// 1. AUTHENTICATION & DEMO ROLES
// -------------------------------------------------------------
apiRouter.post('/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  if (role) {
    const user = db.getUsers().find((u) => u.role === role);
    if (user) {
      return res.json({ success: true, user, token: `demo_token_${user.id}` });
    }
  }

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found with this email' });
  }

  return res.json({
    success: true,
    user,
    token: `token_${user.id}`,
    message: 'Authenticated successfully',
  });
});

apiRouter.post('/auth/register', (req, res) => {
  const { email, fullName, role, phone, bloodGroup, age, gender, hospitalName, address } = req.body;

  if (!email || !fullName || !role) {
    return res.status(400).json({ success: false, error: 'Missing required registration fields' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists' });
  }

  const userId = `usr_${Date.now()}`;
  let associatedId: string | undefined;

  if (role === 'donor') {
    const donorId = `don_${Date.now()}`;
    associatedId = donorId;
    db.addDonor({
      id: donorId,
      userId,
      name: fullName,
      bloodGroup: (bloodGroup as BloodGroup) || 'O+',
      age: Number(age) || 25,
      gender: gender || 'Male',
      phone: phone || '+1 (555) 000-0000',
      city: 'Metro City',
      lat: 12.9716 + (Math.random() - 0.5) * 0.05,
      lng: 77.5946 + (Math.random() - 0.5) * 0.05,
      isAvailable: true,
      lastDonationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalDonations: 1,
    });
  }

  const newUser = db.addUser({
    id: userId,
    email,
    fullName,
    role: role as UserRole,
    phone,
    associatedId,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, user: newUser, token: `token_${newUser.id}` });
});

// -------------------------------------------------------------
// 2. HOSPITALS & BLOOD INVENTORY
// -------------------------------------------------------------
apiRouter.get('/hospitals', (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : 12.9716;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : 77.5946;
  const hospitals = db.getHospitals(lat, lng);
  res.json({ success: true, count: hospitals.length, data: hospitals });
});

apiRouter.get('/hospitals/:id', (req, res) => {
  const hospital = db.getHospitalById(req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, error: 'Hospital not found' });
  }
  res.json({ success: true, data: hospital });
});

apiRouter.patch('/hospitals/:id/inventory', (req, res) => {
  const { id } = req.params;
  const { bloodGroup, units, delta } = req.body;

  if (!bloodGroup) {
    return res.status(400).json({ success: false, error: 'Blood group is required' });
  }

  if (delta !== undefined) {
    const result = db.adjustHospitalInventory(id, bloodGroup as BloodGroup, Number(delta));
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  }

  if (units === undefined || units < 0) {
    return res.status(400).json({ success: false, error: 'Units must be a non-negative number' });
  }

  const result = db.updateHospitalInventory(id, bloodGroup as BloodGroup, Number(units));
  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

// -------------------------------------------------------------
// 3. DONORS & AVAILABILITY
// -------------------------------------------------------------
apiRouter.get('/donors', (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : 12.9716;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : 77.5946;
  const donors = db.getDonors(lat, lng);
  res.json({ success: true, count: donors.length, data: donors });
});

apiRouter.patch('/donors/:id/availability', (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  if (typeof isAvailable !== 'boolean') {
    return res.status(400).json({ success: false, error: 'isAvailable boolean is required' });
  }

  const donor = db.updateDonorAvailability(id, isAvailable);
  if (!donor) {
    return res.status(404).json({ success: false, error: 'Donor not found' });
  }
  res.json({ success: true, donor });
});

apiRouter.put('/donors/:id/profile', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const donor = db.updateDonorProfile(id, updates);
  if (!donor) {
    return res.status(404).json({ success: false, error: 'Donor not found' });
  }
  res.json({ success: true, donor });
});

// -------------------------------------------------------------
// 4. BLOOD REQUESTS & FULFILLMENT
// -------------------------------------------------------------
apiRouter.get('/requests', (req, res) => {
  const requests = db.getRequests();
  res.json({ success: true, count: requests.length, data: requests });
});

apiRouter.post('/requests', (req, res) => {
  const {
    requesterId,
    requesterName,
    requesterPhone,
    patientName,
    hospitalId,
    hospitalName,
    locationName,
    lat,
    lng,
    bloodGroup,
    unitsRequired,
    emergencyLevel,
    notes,
  } = req.body;

  if (!patientName || !bloodGroup || !unitsRequired) {
    return res.status(400).json({
      success: false,
      error: 'Patient name, blood group, and required units are mandatory',
    });
  }

  const newRequest: BloodRequest = {
    id: `req_${Date.now()}`,
    requesterId: requesterId || 'usr_pat_1',
    requesterName: requesterName || 'Demo Patient Requester',
    requesterPhone: requesterPhone || '+1 (555) 234-5678',
    patientName,
    hospitalId,
    hospitalName: hospitalName || 'Metro Central Facility',
    locationName: locationName || hospitalName || 'Emergency Ward',
    lat: Number(lat) || 12.9716,
    lng: Number(lng) || 77.5946,
    bloodGroup: bloodGroup as BloodGroup,
    unitsRequired: Math.max(1, Number(unitsRequired) || 1),
    unitsFulfilled: 0,
    emergencyLevel: (emergencyLevel as EmergencyLevel) || 'URGENT',
    status: 'PENDING',
    notes,
    createdAt: new Date().toISOString(),
  };

  const created = db.createRequest(newRequest);
  res.status(201).json({ success: true, data: created });
});

apiRouter.patch('/requests/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { actorName } = req.body;
  const result = db.cancelRequest(id, actorName || 'User');
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

apiRouter.post('/requests/:id/fulfill', (req, res) => {
  const { id } = req.params;
  const { hospitalId, actorName } = req.body;

  if (!hospitalId) {
    return res.status(400).json({ success: false, error: 'Hospital ID is required for inventory deduction' });
  }

  const result = db.fulfillRequest(id, hospitalId, actorName || 'Hospital Staff');
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// -------------------------------------------------------------
// 5. SMART DONOR MATCHING & COMPATIBILITY
// -------------------------------------------------------------
apiRouter.post('/matching/rank', (req, res) => {
  const { recipientGroup, targetLat, targetLng, maxDistanceKm } = req.body;

  if (!recipientGroup) {
    return res.status(400).json({ success: false, error: 'Recipient blood group is required' });
  }

  const lat = targetLat !== undefined ? Number(targetLat) : 12.9716;
  const lng = targetLng !== undefined ? Number(targetLng) : 77.5946;
  const maxDistance = maxDistanceKm ? Number(maxDistanceKm) : 50;

  const allDonors = db.getDonors(lat, lng);

  const scoredMatches: RankedDonorMatch[] = allDonors
    .map((donor) => {
      const breakdown = calculateSmartMatchScore(donor, recipientGroup as BloodGroup, lat, lng);
      return {
        donor,
        breakdown,
        status: 'PENDING' as const,
      };
    })
    .filter((m) => m.breakdown.isCompatible && m.breakdown.distanceKm <= maxDistance)
    .sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore);

  const compatibleGroups = getCompatibleDonorGroups(recipientGroup as BloodGroup);

  res.json({
    success: true,
    recipientGroup,
    compatibleDonorGroups: compatibleGroups,
    matchesCount: scoredMatches.length,
    matches: scoredMatches,
  });
});

apiRouter.get('/matching/compatibility-table', (req, res) => {
  res.json({
    success: true,
    donorToRecipientMap: RBC_DONATION_COMPATIBILITY,
    recipientToDonorMap: RBC_RECIPIENT_COMPATIBILITY,
    scoringWeights: {
      compatibility: '40 points max (40 for exact match, 35 for safe compatible, 0 for incompatible)',
      distance: '25 points max (25 for <=3km, 20 for <=7km, 15 for <=15km, 10 for <=30km, 5 for >30km)',
      availability: '20 points (20 if Available, 0 if Unavailable)',
      eligibility: '15 points (15 if >=90 days since last donation, 8 for 60-89 days, 0 for <60 days)',
      total: '100 points total maximum',
    },
  });
});

// -------------------------------------------------------------
// 6. GEMINI AI ENDPOINTS
// -------------------------------------------------------------
apiRouter.post('/ai/parse-request', async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'Query string is required' });
  }

  const parsed = await parseEmergencyQuery(query);
  res.json({ success: true, data: parsed });
});

apiRouter.get('/ai/analytics', async (req, res) => {
  const requests = db.getRequests();
  const hospitals = db.getHospitals();
  const insights = await generateBloodDemandInsights(requests, hospitals);
  res.json({ success: true, data: insights });
});

// -------------------------------------------------------------
// 7. NOTIFICATIONS & HISTORY & RESET
// -------------------------------------------------------------
apiRouter.get('/notifications', (req, res) => {
  const userId = req.query.userId as string | undefined;
  const notifications = db.getNotifications(userId);
  res.json({ success: true, count: notifications.length, data: notifications });
});

apiRouter.patch('/notifications/:id/read', (req, res) => {
  db.markNotificationAsRead(req.params.id);
  res.json({ success: true });
});

apiRouter.post('/notifications/clear', (req, res) => {
  db.clearNotifications();
  res.json({ success: true });
});

apiRouter.get('/history', (req, res) => {
  const requestId = req.query.requestId as string | undefined;
  const history = db.getRequestHistory(requestId);
  res.json({ success: true, data: history });
});

apiRouter.post('/db/reset', (req, res) => {
  db.seedInitialData();
  res.json({ success: true, message: 'Demo database reset to default pristine state' });
});

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI BloodConnect API', timestamp: new Date().toISOString() });
});
