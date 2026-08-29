export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type EmergencyLevel = 'CRITICAL' | 'URGENT' | 'NORMAL';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'FULFILLED' | 'CANCELLED';

export type UserRole = 'patient' | 'donor' | 'hospital' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  associatedId?: string; // donorId or hospitalId
  createdAt: string;
}

export interface BloodInventoryItem {
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  lastUpdated: string;
  status: 'SURPLUS' | 'ADEQUATE' | 'LOW' | 'CRITICAL_SHORTAGE';
}

export interface Hospital {
  id: string;
  userId: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  inventory: Record<BloodGroup, number>;
  distanceKm?: number;
}

export interface Donor {
  id: string;
  userId: string;
  name: string;
  bloodGroup: BloodGroup;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  city: string;
  lat: number;
  lng: number;
  isAvailable: boolean;
  lastDonationDate: string; // YYYY-MM-DD
  totalDonations: number;
  distanceKm?: number;
}

export interface MatchScoreBreakdown {
  compatibilityScore: number; // Max 40
  distanceScore: number;      // Max 25
  availabilityScore: number;  // Max 20
  eligibilityScore: number;   // Max 15
  totalScore: number;         // Max 100
  isCompatible: boolean;
  distanceKm: number;
  isAvailable: boolean;
  isEligible: boolean;
  daysSinceLastDonation: number;
  reasons: string[];
}

export interface RankedDonorMatch {
  donor: Donor;
  breakdown: MatchScoreBreakdown;
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  patientName: string;
  hospitalId?: string;
  hospitalName?: string;
  locationName: string;
  lat: number;
  lng: number;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsFulfilled?: number;
  emergencyLevel: EmergencyLevel;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  fulfilledAt?: string;
  matchedDonorsCount?: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'URGENT' | 'SUCCESS' | 'INFO';
  read: boolean;
  createdAt: string;
  actionLink?: string;
}

export interface AIInsightResponse {
  summary: string;
  highestDemandGroup: BloodGroup;
  totalRequests: number;
  fulfilledRatePercent: number;
  criticalRequestsCount: number;
  inventoryHealth: 'SAFE' | 'WARNING' | 'CRITICAL';
  groupDemandDistribution: Record<BloodGroup, number>;
  insights: string[];
  recommendations: string[];
}

export interface ParsedNLRequest {
  bloodGroup?: BloodGroup;
  unitsRequired?: number;
  emergencyLevel?: EmergencyLevel;
  hospitalName?: string;
  locationName?: string;
  patientName?: string;
  notes?: string;
  confidence: number;
  rawQuery: string;
  aiExplanation?: string;
}
