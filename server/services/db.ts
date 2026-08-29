import { BloodGroup, BloodRequest, Donor, Hospital, NotificationItem, User } from '../../src/types';
import { calculateDistanceKm } from './distance';

export interface RequestHistoryEntry {
  id: string;
  requestId: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

export class InMemoryDatabase {
  private users: User[] = [];
  private hospitals: Hospital[] = [];
  private donors: Donor[] = [];
  private requests: BloodRequest[] = [];
  private history: RequestHistoryEntry[] = [];
  private notifications: NotificationItem[] = [];

  constructor() {
    this.seedInitialData();
  }

  public seedInitialData() {
    // 1. Initial Users (Delhi NCR)
    this.users = [
      {
        id: 'usr_pat_1',
        email: 'priya.sharma@example.com',
        fullName: 'Priya Sharma (Patient Attendant)',
        role: 'patient',
        phone: '+91 98101 23456',
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'usr_don_1',
        email: 'rohit.verma@example.com',
        fullName: 'Rohit Verma (Universal O- Donor)',
        role: 'donor',
        phone: '+91 98712 34567',
        associatedId: 'don_1',
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'usr_hosp_1',
        email: 'bloodbank@aiims.edu',
        fullName: 'AIIMS New Delhi Blood Bank Officer',
        role: 'hospital',
        phone: '+91 11 2658 8500',
        associatedId: 'hosp_1',
        createdAt: '2026-08-01T10:00:00Z',
      },
    ];

    // Base coordinates for Delhi NCR (Connaught Place Center: 28.6304, 77.2177)
    const baseLat = 28.6304;
    const baseLng = 77.2177;

    // 2. Initial Hospitals & Inventories (Delhi NCR Major Facilities)
    this.hospitals = [
      {
        id: 'hosp_1',
        userId: 'usr_hosp_1',
        name: 'AIIMS (All India Institute of Medical Sciences)',
        address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
        city: 'New Delhi (South)',
        phone: '+91 11 2658 8500',
        email: 'bloodbank@aiims.edu',
        lat: 28.5672,
        lng: 77.2100,
        inventory: {
          'A+': 18,
          'A-': 5,
          'B+': 14,
          'B-': 4,
          'AB+': 8,
          'AB-': 2,
          'O+': 22,
          'O-': 5,
        },
      },
      {
        id: 'hosp_2',
        userId: 'usr_hosp_2',
        name: 'Safdarjung Hospital & Vardhman Trauma Centre',
        address: 'Ring Road, Opposite AIIMS, New Delhi',
        city: 'New Delhi (South)',
        phone: '+91 11 2616 5060',
        email: 'trauma.blood@safdarjung.nic.in',
        lat: 28.5700,
        lng: 77.2065,
        inventory: {
          'A+': 12,
          'A-': 3,
          'B+': 9,
          'B-': 2,
          'AB+': 4,
          'AB-': 1,
          'O+': 16,
          'O-': 3,
        },
      },
      {
        id: 'hosp_3',
        userId: 'usr_hosp_3',
        name: 'Max Super Speciality Hospital (Saket)',
        address: '1, 2 Press Enclave Marg, Saket Institutional Area',
        city: 'New Delhi (Saket)',
        phone: '+91 11 2651 5050',
        email: 'bloodbank.saket@maxhealthcare.com',
        lat: 28.5284,
        lng: 77.2118,
        inventory: {
          'A+': 15,
          'A-': 4,
          'B+': 12,
          'B-': 3,
          'AB+': 6,
          'AB-': 2,
          'O+': 19,
          'O-': 4,
        },
      },
      {
        id: 'hosp_4',
        userId: 'usr_hosp_4',
        name: 'Fortis Escorts Heart Institute (Okhla)',
        address: 'Okhla Road, Sukhdev Vihar Metro Station, New Delhi',
        city: 'New Delhi (Okhla)',
        phone: '+91 11 4713 5000',
        email: 'bloodbank@fortishealthcare.com',
        lat: 28.5601,
        lng: 77.2838,
        inventory: {
          'A+': 9,
          'A-': 2,
          'B+': 10,
          'B-': 2,
          'AB+': 5,
          'AB-': 1,
          'O+': 11,
          'O-': 2,
        },
      },
      {
        id: 'hosp_5',
        userId: 'usr_hosp_5',
        name: 'Sir Ganga Ram Hospital Blood Bank',
        address: 'Sir Ganga Ram Hospital Marg, Rajinder Nagar, New Delhi',
        city: 'New Delhi (Central)',
        phone: '+91 11 2575 0000',
        email: 'bloodbank@sgrh.com',
        lat: 28.6385,
        lng: 77.1895,
        inventory: {
          'A+': 20,
          'A-': 6,
          'B+': 16,
          'B-': 5,
          'AB+': 7,
          'AB-': 3,
          'O+': 24,
          'O-': 6,
        },
      },
      {
        id: 'hosp_6',
        userId: 'usr_hosp_6',
        name: 'Indraprastha Apollo Hospital (Sarita Vihar)',
        address: 'Delhi-Mathura Road, Sarita Vihar, New Delhi',
        city: 'New Delhi (Sarita Vihar)',
        phone: '+91 11 2692 5858',
        email: 'bloodtransfusion@apollohospitals.com',
        lat: 28.5363,
        lng: 77.2885,
        inventory: {
          'A+': 14,
          'A-': 4,
          'B+': 13,
          'B-': 3,
          'AB+': 6,
          'AB-': 1,
          'O+': 18,
          'O-': 4,
        },
      },
      {
        id: 'hosp_7',
        userId: 'usr_hosp_7',
        name: 'Medanta - The Medicity (Gurugram NCR)',
        address: 'CH Bakhtawar Singh Road, Sector 38, Gurugram, Delhi NCR',
        city: 'Delhi NCR (Gurugram)',
        phone: '+91 124 414 1414',
        email: 'bloodbank@medanta.org',
        lat: 28.4398,
        lng: 77.0425,
        inventory: {
          'A+': 22,
          'A-': 7,
          'B+': 18,
          'B-': 4,
          'AB+': 9,
          'AB-': 3,
          'O+': 26,
          'O-': 7,
        },
      },
    ];

    // 3. Initial Donors (Authentic Indian Names Across Delhi NCR)
    this.donors = [
      {
        id: 'don_1',
        userId: 'usr_don_1',
        name: 'Rohit Verma (Universal Donor)',
        bloodGroup: 'O-',
        age: 28,
        gender: 'Male',
        phone: '+91 98712 34567',
        city: 'Delhi NCR - Hauz Khas',
        lat: 28.5494,
        lng: 77.2001,
        isAvailable: true,
        lastDonationDate: '2026-04-10', // > 90 days ago
        totalDonations: 7,
      },
      {
        id: 'don_2',
        userId: 'usr_don_2',
        name: 'Ananya Deshmukh',
        bloodGroup: 'O+',
        age: 26,
        gender: 'Female',
        phone: '+91 98114 56789',
        city: 'Delhi NCR - Lajpat Nagar',
        lat: 28.5677,
        lng: 77.2433,
        isAvailable: true,
        lastDonationDate: '2026-03-15',
        totalDonations: 4,
      },
      {
        id: 'don_3',
        userId: 'usr_don_3',
        name: 'Vikramjit Singh',
        bloodGroup: 'A+',
        age: 32,
        gender: 'Male',
        phone: '+91 99105 67890',
        city: 'Delhi NCR - Karol Bagh',
        lat: 28.6517,
        lng: 77.1906,
        isAvailable: true,
        lastDonationDate: '2026-02-20',
        totalDonations: 9,
      },
      {
        id: 'don_4',
        userId: 'usr_don_4',
        name: 'Pooja Agarwal',
        bloodGroup: 'B+',
        age: 24,
        gender: 'Female',
        phone: '+91 98188 90123',
        city: 'Delhi NCR - Connaught Place',
        lat: 28.6315,
        lng: 77.2167,
        isAvailable: true,
        lastDonationDate: '2026-05-01',
        totalDonations: 5,
      },
      {
        id: 'don_5',
        userId: 'usr_don_5',
        name: 'Aman Deep Sharma',
        bloodGroup: 'A-',
        age: 34,
        gender: 'Male',
        phone: '+91 97170 12345',
        city: 'Delhi NCR - Janakpuri',
        lat: 28.6219,
        lng: 77.0878,
        isAvailable: true,
        lastDonationDate: '2026-01-11',
        totalDonations: 11,
      },
      {
        id: 'don_6',
        userId: 'usr_don_6',
        name: 'Dr. Sneha Mukherjee',
        bloodGroup: 'B-',
        age: 29,
        gender: 'Female',
        phone: '+91 98102 34567',
        city: 'Delhi NCR - Greater Kailash II',
        lat: 28.5355,
        lng: 77.2410,
        isAvailable: false, // In cooldown
        lastDonationDate: '2026-07-28',
        totalDonations: 3,
      },
      {
        id: 'don_7',
        userId: 'usr_don_7',
        name: 'Karan Mehra',
        bloodGroup: 'AB+',
        age: 30,
        gender: 'Male',
        phone: '+91 98991 23456',
        city: 'Delhi NCR - Noida Sector 18',
        lat: 28.5708,
        lng: 77.3260,
        isAvailable: true,
        lastDonationDate: '2026-03-25',
        totalDonations: 6,
      },
      {
        id: 'don_8',
        userId: 'usr_don_8',
        name: 'Ritu Chaudhury',
        bloodGroup: 'AB-',
        age: 27,
        gender: 'Female',
        phone: '+91 98110 98765',
        city: 'Delhi NCR - Rohini Sector 9',
        lat: 28.7166,
        lng: 77.1194,
        isAvailable: true,
        lastDonationDate: '2026-04-18',
        totalDonations: 4,
      },
      {
        id: 'don_9',
        userId: 'usr_don_9',
        name: 'Suresh Kumar Gupta',
        bloodGroup: 'O+',
        age: 36,
        gender: 'Male',
        phone: '+91 98109 87654',
        city: 'Delhi NCR - Dwarka Sector 12',
        lat: 28.5923,
        lng: 77.0460,
        isAvailable: true,
        lastDonationDate: '2026-05-12',
        totalDonations: 8,
      },
      {
        id: 'don_10',
        userId: 'usr_don_10',
        name: 'Meenakshi Iyer',
        bloodGroup: 'O-',
        age: 25,
        gender: 'Female',
        phone: '+91 99580 12345',
        city: 'Delhi NCR - Mayur Vihar Phase 1',
        lat: 28.6080,
        lng: 77.2950,
        isAvailable: true,
        lastDonationDate: '2026-04-05',
        totalDonations: 5,
      },
      {
        id: 'don_11',
        userId: 'usr_don_11',
        name: 'Mohammad Farooq',
        bloodGroup: 'A+',
        age: 31,
        gender: 'Male',
        phone: '+91 98730 45678',
        city: 'Delhi NCR - Okhla Vihar',
        lat: 28.5580,
        lng: 77.2890,
        isAvailable: true,
        lastDonationDate: '2026-02-14',
        totalDonations: 7,
      },
      {
        id: 'don_12',
        userId: 'usr_don_12',
        name: 'Kavita Nair',
        bloodGroup: 'B+',
        age: 28,
        gender: 'Female',
        phone: '+91 98112 33445',
        city: 'Delhi NCR - Vasant Kunj',
        lat: 28.5244,
        lng: 77.1587,
        isAvailable: true,
        lastDonationDate: '2026-04-30',
        totalDonations: 4,
      },
    ];

    // 4. Initial Blood Requests (Active in Delhi NCR Hospitals)
    this.requests = [
      {
        id: 'req_101',
        requesterId: 'usr_pat_1',
        requesterName: 'Priya Sharma',
        requesterPhone: '+91 98101 23456',
        patientName: 'Rameshwar Sharma (AIIMS ICU)',
        hospitalId: 'hosp_1',
        hospitalName: 'AIIMS (All India Institute of Medical Sciences)',
        locationName: 'AIIMS South Campus Trauma ICU, Bed 12',
        lat: 28.5672,
        lng: 77.2100,
        bloodGroup: 'O-',
        unitsRequired: 2,
        unitsFulfilled: 0,
        emergencyLevel: 'CRITICAL',
        status: 'PENDING',
        notes: 'Emergency vascular surgical transfusion required immediately.',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'req_102',
        requesterId: 'usr_pat_2',
        requesterName: 'Manoj Tiwari',
        requesterPhone: '+91 98115 88221',
        patientName: 'Suman Tiwari',
        hospitalId: 'hosp_3',
        hospitalName: 'Max Super Speciality Hospital (Saket)',
        locationName: 'Max Saket Emergency Ward 4',
        lat: 28.5284,
        lng: 77.2118,
        bloodGroup: 'B+',
        unitsRequired: 1,
        unitsFulfilled: 0,
        emergencyLevel: 'URGENT',
        status: 'PENDING',
        notes: 'Pre-operative platelet and whole blood requirement.',
        createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      },
      {
        id: 'req_103',
        requesterId: 'usr_pat_3',
        requesterName: 'Deepa Roy',
        requesterPhone: '+91 98711 22990',
        patientName: 'Aarav Roy (Safdarjung Oncology)',
        hospitalId: 'hosp_2',
        hospitalName: 'Safdarjung Hospital & Vardhman Trauma Centre',
        locationName: 'Safdarjung Hematology Day Care',
        lat: 28.5700,
        lng: 77.2065,
        bloodGroup: 'A+',
        unitsRequired: 3,
        unitsFulfilled: 0,
        emergencyLevel: 'NORMAL',
        status: 'PENDING',
        notes: 'Chemotherapy-induced severe anemia whole blood support.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'req_104',
        requesterId: 'usr_pat_4',
        requesterName: 'Kunal Kapoor',
        requesterPhone: '+91 98990 11223',
        patientName: 'Sunita Kapoor',
        hospitalId: 'hosp_5',
        hospitalName: 'Sir Ganga Ram Hospital Blood Bank',
        locationName: 'Sir Ganga Ram Surgical Wing',
        lat: 28.6385,
        lng: 77.1895,
        bloodGroup: 'O+',
        unitsRequired: 2,
        unitsFulfilled: 2,
        emergencyLevel: 'URGENT',
        status: 'FULFILLED',
        notes: 'Post-operative stabilization.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        fulfilledAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // 5. Initial Notifications (Delhi NCR Context)
    this.notifications = [
      {
        id: 'notif_1',
        userId: 'usr_don_1',
        title: '🔴 Critical O- Request near Hauz Khas',
        message: 'Patient Rameshwar Sharma urgently requires 2 units of O- blood at AIIMS New Delhi (2.4 km away).',
        type: 'CRITICAL',
        read: false,
        createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif_2',
        userId: 'usr_hosp_1',
        title: 'New Emergency Blood Request',
        message: 'CRITICAL: 2 units of O- requested at AIIMS South Campus Trauma ICU.',
        type: 'CRITICAL',
        read: false,
        createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif_3',
        userId: 'usr_pat_1',
        title: 'Request Broadcast Active',
        message: 'Your emergency request for 2 units of O- blood has been broadcast to verified donors within 10 km in Delhi NCR.',
        type: 'INFO',
        read: true,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
    ];

    // 6. Request History
    this.history = [
      {
        id: 'hist_1',
        requestId: 'req_101',
        action: 'REQUEST_CREATED',
        actor: 'Priya Sharma (Patient Attendant)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        details: 'Created CRITICAL emergency request for 2 units of O- blood at AIIMS.',
      },
      {
        id: 'hist_2',
        requestId: 'req_104',
        action: 'FULFILLED',
        actor: 'Sir Ganga Ram Hospital Admin',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        details: 'Fulfilled 2 units of O+ from hospital inventory. Stock updated from 26 to 24.',
      },
    ];
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.users;
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User): User {
    this.users.push(user);
    return user;
  }

  // --- Hospitals & Inventory ---
  public getHospitals(targetLat?: number, targetLng?: number): Hospital[] {
    if (targetLat !== undefined && targetLng !== undefined) {
      return this.hospitals.map((h) => ({
        ...h,
        distanceKm: calculateDistanceKm(targetLat, targetLng, h.lat, h.lng),
      }));
    }
    return this.hospitals;
  }

  public getHospitalById(id: string): Hospital | undefined {
    return this.hospitals.find((h) => h.id === id);
  }

  public updateHospitalInventory(
    hospitalId: string,
    bloodGroup: BloodGroup,
    newUnits: number
  ): { success: boolean; hospital?: Hospital; error?: string } {
    const hospital = this.hospitals.find((h) => h.id === hospitalId);
    if (!hospital) {
      return { success: false, error: 'Hospital not found' };
    }
    if (newUnits < 0) {
      return { success: false, error: 'Inventory stock cannot be negative' };
    }
    hospital.inventory[bloodGroup] = newUnits;
    return { success: true, hospital };
  }

  public adjustHospitalInventory(
    hospitalId: string,
    bloodGroup: BloodGroup,
    delta: number
  ): { success: boolean; hospital?: Hospital; error?: string } {
    const hospital = this.hospitals.find((h) => h.id === hospitalId);
    if (!hospital) {
      return { success: false, error: 'Hospital not found' };
    }
    const current = hospital.inventory[bloodGroup] || 0;
    const updated = current + delta;
    if (updated < 0) {
      return {
        success: false,
        error: `Insufficient stock! Currently only ${current} unit(s) available.`,
      };
    }
    hospital.inventory[bloodGroup] = updated;
    return { success: true, hospital };
  }

  // --- Donors ---
  public getDonors(targetLat?: number, targetLng?: number): Donor[] {
    if (targetLat !== undefined && targetLng !== undefined) {
      return this.donors.map((d) => ({
        ...d,
        distanceKm: calculateDistanceKm(targetLat, targetLng, d.lat, d.lng),
      }));
    }
    return this.donors;
  }

  public getDonorById(id: string): Donor | undefined {
    return this.donors.find((d) => d.id === id);
  }

  public addDonor(donor: Donor): Donor {
    this.donors.push(donor);
    return donor;
  }

  public updateDonorAvailability(donorId: string, isAvailable: boolean): Donor | undefined {
    const donor = this.donors.find((d) => d.id === donorId);
    if (donor) {
      donor.isAvailable = isAvailable;
    }
    return donor;
  }

  public updateDonorProfile(donorId: string, updates: Partial<Donor>): Donor | undefined {
    const donor = this.donors.find((d) => d.id === donorId);
    if (donor) {
      Object.assign(donor, updates);
    }
    return donor;
  }

  // --- Requests & Fulfillment ---
  public getRequests(): BloodRequest[] {
    return [...this.requests].sort((a, b) => {
      // Sort CRITICAL first, then URGENT, then NORMAL
      const levelPriority = { CRITICAL: 3, URGENT: 2, NORMAL: 1 };
      if (levelPriority[a.emergencyLevel] !== levelPriority[b.emergencyLevel]) {
        return levelPriority[b.emergencyLevel] - levelPriority[a.emergencyLevel];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getRequestById(id: string): BloodRequest | undefined {
    return this.requests.find((r) => r.id === id);
  }

  public createRequest(req: BloodRequest): BloodRequest {
    this.requests.unshift(req);

    // Record in history
    this.history.unshift({
      id: `hist_${Date.now()}`,
      requestId: req.id,
      action: 'REQUEST_CREATED',
      actor: req.requesterName,
      timestamp: req.createdAt,
      details: `Created ${req.emergencyLevel} request for ${req.unitsRequired} unit(s) of ${req.bloodGroup} blood.`,
    });

    // Generate in-app notifications
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: 'usr_hosp_1',
      title: `${req.emergencyLevel === 'CRITICAL' ? '🔴 CRITICAL' : '🟠 NEW'} Blood Request`,
      message: `${req.unitsRequired} unit(s) of ${req.bloodGroup} needed at ${req.locationName}`,
      type: req.emergencyLevel === 'CRITICAL' ? 'CRITICAL' : 'URGENT',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return req;
  }

  public cancelRequest(requestId: string, actorName: string): { success: boolean; request?: BloodRequest; error?: string } {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };
    if (req.status === 'FULFILLED') return { success: false, error: 'Cannot cancel an already fulfilled request' };

    req.status = 'CANCELLED';

    this.history.unshift({
      id: `hist_${Date.now()}`,
      requestId: req.id,
      action: 'REQUEST_CANCELLED',
      actor: actorName,
      timestamp: new Date().toISOString(),
      details: 'Request cancelled by user.',
    });

    return { success: true, request: req };
  }

  public fulfillRequest(
    requestId: string,
    hospitalId: string,
    actorName: string
  ): { success: boolean; request?: BloodRequest; hospital?: Hospital; error?: string } {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };
    if (req.status === 'FULFILLED') return { success: false, error: 'Request is already fulfilled' };

    const hospital = this.hospitals.find((h) => h.id === hospitalId);
    if (!hospital) return { success: false, error: 'Hospital not found' };

    const currentStock = hospital.inventory[req.bloodGroup] || 0;
    if (currentStock < req.unitsRequired) {
      return {
        success: false,
        error: `Insufficient stock in ${hospital.name}! Required: ${req.unitsRequired} units, Available: ${currentStock} units.`,
      };
    }

    // Atomically decrement stock
    hospital.inventory[req.bloodGroup] = currentStock - req.unitsRequired;
    req.status = 'FULFILLED';
    req.unitsFulfilled = req.unitsRequired;
    req.fulfilledAt = new Date().toISOString();

    // Log history
    this.history.unshift({
      id: `hist_${Date.now()}`,
      requestId: req.id,
      action: 'REQUEST_FULFILLED',
      actor: actorName,
      timestamp: req.fulfilledAt,
      details: `Fulfilled ${req.unitsRequired} unit(s) of ${req.bloodGroup} from ${hospital.name}. Remaining inventory: ${hospital.inventory[req.bloodGroup]}.`,
    });

    // Notify requester
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: req.requesterId,
      title: '✅ Blood Request Fulfilled!',
      message: `Your request for ${req.unitsRequired} units of ${req.bloodGroup} has been fulfilled by ${hospital.name}.`,
      type: 'SUCCESS',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, request: req, hospital };
  }

  // --- Notifications ---
  public getNotifications(userId?: string): NotificationItem[] {
    if (userId) {
      return this.notifications.filter((n) => n.userId === userId || n.userId === 'all');
    }
    return this.notifications;
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  }

  public clearNotifications(): void {
    this.notifications = [];
  }

  // --- History ---
  public getRequestHistory(requestId?: string): RequestHistoryEntry[] {
    if (requestId) {
      return this.history.filter((h) => h.requestId === requestId);
    }
    return this.history;
  }
}

// Global Singleton Instance
export const db = new InMemoryDatabase();
