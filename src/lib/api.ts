import {
  AIInsightResponse,
  BloodGroup,
  BloodRequest,
  Donor,
  EmergencyLevel,
  Hospital,
  NotificationItem,
  ParsedNLRequest,
  RankedDonorMatch,
  User,
  UserRole,
} from '../types';

export const API = {
  // Auth
  async login(email?: string, password?: string, role?: UserRole): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    return res.json();
  },

  async register(data: {
    email: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    bloodGroup?: BloodGroup;
    age?: number;
    gender?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Hospitals
  async getHospitals(lat?: number, lng?: number): Promise<Hospital[]> {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lng !== undefined) params.append('lng', lng.toString());
    const res = await fetch(`/api/hospitals?${params.toString()}`);
    const data = await res.json();
    return data.data || [];
  },

  async adjustHospitalInventory(
    hospitalId: string,
    bloodGroup: BloodGroup,
    delta: number
  ): Promise<{ success: boolean; hospital?: Hospital; error?: string }> {
    const res = await fetch(`/api/hospitals/${hospitalId}/inventory`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bloodGroup, delta }),
    });
    return res.json();
  },

  async setHospitalInventory(
    hospitalId: string,
    bloodGroup: BloodGroup,
    units: number
  ): Promise<{ success: boolean; hospital?: Hospital; error?: string }> {
    const res = await fetch(`/api/hospitals/${hospitalId}/inventory`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bloodGroup, units }),
    });
    return res.json();
  },

  // Donors
  async getDonors(lat?: number, lng?: number): Promise<Donor[]> {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lng !== undefined) params.append('lng', lng.toString());
    const res = await fetch(`/api/donors?${params.toString()}`);
    const data = await res.json();
    return data.data || [];
  },

  async toggleDonorAvailability(donorId: string, isAvailable: boolean): Promise<{ success: boolean; donor?: Donor }> {
    const res = await fetch(`/api/donors/${donorId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable }),
    });
    return res.json();
  },

  async updateDonorProfile(donorId: string, updates: Partial<Donor>): Promise<{ success: boolean; donor?: Donor }> {
    const res = await fetch(`/api/donors/${donorId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Blood Requests
  async getRequests(): Promise<BloodRequest[]> {
    const res = await fetch('/api/requests');
    const data = await res.json();
    return data.data || [];
  },

  async createRequest(req: {
    patientName: string;
    bloodGroup: BloodGroup;
    unitsRequired: number;
    emergencyLevel: EmergencyLevel;
    hospitalId?: string;
    hospitalName?: string;
    locationName?: string;
    lat?: number;
    lng?: number;
    requesterId?: string;
    requesterName?: string;
    requesterPhone?: string;
    notes?: string;
  }): Promise<{ success: boolean; data?: BloodRequest; error?: string }> {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return res.json();
  },

  async cancelRequest(requestId: string, actorName?: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`/api/requests/${requestId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName }),
    });
    return res.json();
  },

  async fulfillRequest(
    requestId: string,
    hospitalId: string,
    actorName?: string
  ): Promise<{ success: boolean; request?: BloodRequest; hospital?: Hospital; error?: string }> {
    const res = await fetch(`/api/requests/${requestId}/fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitalId, actorName }),
    });
    return res.json();
  },

  // Matching & Compatibility
  async rankDonors(
    recipientGroup: BloodGroup,
    lat?: number,
    lng?: number,
    maxDistanceKm?: number
  ): Promise<{
    success: boolean;
    compatibleDonorGroups: BloodGroup[];
    matchesCount: number;
    matches: RankedDonorMatch[];
  }> {
    const res = await fetch('/api/matching/rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientGroup, targetLat: lat, targetLng: lng, maxDistanceKm }),
    });
    return res.json();
  },

  async getCompatibilityTable(): Promise<{
    success: boolean;
    donorToRecipientMap: Record<BloodGroup, BloodGroup[]>;
    recipientToDonorMap: Record<BloodGroup, BloodGroup[]>;
    scoringWeights: Record<string, string>;
  }> {
    const res = await fetch('/api/matching/compatibility-table');
    return res.json();
  },

  // AI
  async parseNaturalLanguage(query: string): Promise<{ success: boolean; data: ParsedNLRequest }> {
    const res = await fetch('/api/ai/parse-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return res.json();
  },

  async getAnalytics(): Promise<{ success: boolean; data: AIInsightResponse }> {
    const res = await fetch('/api/ai/analytics');
    return res.json();
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    const res = await fetch(`/api/notifications?${params.toString()}`);
    const data = await res.json();
    return data.data || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  // Reset Demo State
  async resetDemoDb(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/db/reset', { method: 'POST' });
    return res.json();
  },
};
