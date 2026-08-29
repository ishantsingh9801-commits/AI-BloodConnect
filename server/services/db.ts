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
    // 1. Initial Users
    this.users = [
      {
        id: 'usr_pat_1',
        email: 'demo.patient@example.com',
        fullName: 'Sarah Jenkins (Patient/Attendant)',
        role: 'patient',
        phone: '+1 (555) 234-5678',
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'usr_don_1',
        email: 'demo.donor@example.com',
        fullName: 'John Doe (Universal O- Donor)',
        role: 'donor',
        phone: '+1 (555) 345-6789',
        associatedId: 'don_1',
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'usr_hosp_1',
        email: 'demo.hospital@example.com',
        fullName: 'Alpha General Hospital Admin',
        role: 'hospital',
        phone: '+1 (555) 456-7890',
        associatedId: 'hosp_1',
        createdAt: '2026-08-01T10:00:00Z',
      },
    ];

    // Base coordinates for City Center: (12.9716, 77.5946) or (37.7749, -122.4194)
    const baseLat = 12.9716;
    const baseLng = 77.5946;

    // 2. Initial Hospitals & Inventories (Demo Data)
    this.hospitals = [
      {
        id: 'hosp_1',
        userId: 'usr_hosp_1',
        name: 'Hospital Alpha (Metro Central)',
        address: '142 Health Boulevard, Sector 4',
        city: 'Metro City',
        phone: '+1 (555) 456-7890',
        email: 'alpha.bloodbank@example.com',
        lat: baseLat + 0.015,
        lng: baseLng + 0.012,
        inventory: {
          'A+': 12,
          'A-': 3,
          'B+': 8,
          'B-': 2,
          'AB+': 5,
          'AB-': 1,
          'O+': 15,
          'O-': 3,
        },
      },
      {
        id: 'hosp_2',
        userId: 'usr_hosp_2',
        name: 'Hospital Beta (City Care)',
        address: '88 West Avenue, Downtown',
        city: 'Metro City',
        phone: '+1 (555) 678-1234',
        email: 'beta.care@example.com',
        lat: baseLat - 0.022,
        lng: baseLng - 0.018,
        inventory: {
          'A+': 7,
          'A-': 2,
          'B+': 4,
          'B-': 1,
          'AB+': 3,
          'AB-': 0,
          'O+': 6,
          'O-': 2,
        },
      },
      {
        id: 'hosp_3',
        userId: 'usr_hosp_3',
        name: 'St. Jude Blood Bank & Trauma Center',
        address: '500 Mercy Road, North District',
        city: 'Metro City',
        phone: '+1 (555) 890-4321',
        email: 'stjude.blood@example.com',
        lat: baseLat + 0.035,
        lng: baseLng - 0.028,
        inventory: {
          'A+': 18,
          'A-': 5,
          'B+': 14,
          'B-': 4,
          'AB+': 6,
          'AB-': 2,
          'O+': 22,
          'O-': 6,
        },
      },
      {
        id: 'hosp_4',
        userId: 'usr_hosp_4',
        name: 'Apex Super Specialty Hospital',
        address: '77 Silicon Expressway, East Zone',
        city: 'Metro City',
        phone: '+1 (555) 321-9876',
        email: 'apex.emergency@example.com',
        lat: baseLat - 0.045,
        lng: baseLng + 0.038,
        inventory: {
          'A+': 9,
          'A-': 1,
          'B+': 11,
          'B-': 3,
          'AB+': 4,
          'AB-': 0,
          'O+': 10,
          'O-': 1,
        },
      },
      {
        id: 'hosp_5',
        userId: 'usr_hosp_5',
        name: 'Lifeline Red Cross Blood Center',
        address: '12 Civic Center Circle',
        city: 'Metro City',
        phone: '+1 (555) 765-4321',
        email: 'lifeline.rc@example.com',
        lat: baseLat + 0.008,
        lng: baseLng - 0.015,
        inventory: {
          'A+': 25,
          'A-': 8,
          'B+': 20,
          'B-': 6,
          'AB+': 9,
          'AB-': 3,
          'O+': 30,
          'O-': 7,
        },
      },
    ];

    // 3. Initial Donors (25+ diverse demo donors)
    this.donors = [
      {
        id: 'don_1',
        userId: 'usr_don_1',
        name: 'John Doe (Demo Universal)',
        bloodGroup: 'O-',
        age: 29,
        gender: 'Male',
        phone: '+1 (555) 345-6789',
        city: 'Metro City - Central',
        lat: baseLat + 0.012,
        lng: baseLng + 0.009,
        isAvailable: true,
        lastDonationDate: '2026-04-10', // > 90 days ago
        totalDonations: 6,
      },
      {
        id: 'don_2',
        userId: 'usr_don_2',
        name: 'Emily Davis',
        bloodGroup: 'O+',
        age: 26,
        gender: 'Female',
        phone: '+1 (555) 234-8765',
        city: 'Metro City - Downtown',
        lat: baseLat - 0.018,
        lng: baseLng - 0.014,
        isAvailable: true,
        lastDonationDate: '2026-03-15', // > 90 days ago
        totalDonations: 4,
      },
      {
        id: 'don_3',
        userId: 'usr_don_3',
        name: 'Rahul Sharma',
        bloodGroup: 'A+',
        age: 32,
        gender: 'Male',
        phone: '+1 (555) 876-5432',
        city: 'Metro City - North District',
        lat: baseLat + 0.028,
        lng: baseLng - 0.021,
        isAvailable: true,
        lastDonationDate: '2026-02-20',
        totalDonations: 8,
      },
      {
        id: 'don_4',
        userId: 'usr_don_4',
        name: 'Priya Patel',
        bloodGroup: 'B+',
        age: 24,
        gender: 'Female',
        phone: '+1 (555) 987-1234',
        city: 'Metro City - East Sector',
        lat: baseLat - 0.032,
        lng: baseLng + 0.025,
        isAvailable: true,
        lastDonationDate: '2026-05-01', // > 90 days ago
        totalDonations: 3,
      },
      {
        id: 'don_5',
        userId: 'usr_don_5',
        name: 'David Miller',
        bloodGroup: 'A-',
        age: 35,
        gender: 'Male',
        phone: '+1 (555) 432-6789',
        city: 'Metro City - South Zone',
        lat: baseLat - 0.040,
        lng: baseLng - 0.030,
        isAvailable: true,
        lastDonationDate: '2026-01-11',
        totalDonations: 11,
      },
      {
        id: 'don_6',
        userId: 'usr_don_6',
        name: 'Ananya Rao',
        bloodGroup: 'B-',
        age: 27,
        gender: 'Female',
        phone: '+1 (555) 654-7890',
        city: 'Metro City - Central Hills',
        lat: baseLat + 0.019,
        lng: baseLng + 0.015,
        isAvailable: false, // Currently busy
        lastDonationDate: '2026-07-20', // Recent
        totalDonations: 2,
      },
      {
        id: 'don_7',
        userId: 'usr_don_7',
        name: 'Michael Chang',
        bloodGroup: 'AB+',
        age: 31,
        gender: 'Male',
        phone: '+1 (555) 543-9871',
        city: 'Metro City - Tech Park',
        lat: baseLat - 0.025,
        lng: baseLng + 0.035,
        isAvailable: true,
        lastDonationDate: '2026-03-25',
        totalDonations: 5,
      },
      {
        id: 'don_8',
        userId: 'usr_don_8',
        name: 'Elena Rostova',
        bloodGroup: 'AB-',
        age: 28,
        gender: 'Female',
        phone: '+1 (555) 321-4567',
        city: 'Metro City - West End',
        lat: baseLat + 0.011,
        lng: baseLng - 0.032,
        isAvailable: true,
        lastDonationDate: '2026-04-18',
        totalDonations: 4,
      },
      {
        id: 'don_9',
        userId: 'usr_don_9',
        name: 'Vikram Singh',
        bloodGroup: 'O+',
        age: 30,
        gender: 'Male',
        phone: '+1 (555) 789-6543',
        city: 'Metro City - Midtown',
        lat: baseLat + 0.005,
        lng: baseLng + 0.007,
        isAvailable: true,
        lastDonationDate: '2026-05-12',
        totalDonations: 7,
      },
      {
        id: 'don_10',
        userId: 'usr_don_10',
        name: 'Sophia Martinez',
        bloodGroup: 'O-',
        age: 25,
        gender: 'Female',
        phone: '+1 (555) 123-7890',
        city: 'Metro City - Harbor Area',
        lat: baseLat + 0.048,
        lng: baseLng + 0.040,
        isAvailable: true,
        lastDonationDate: '2026-04-05',
        totalDonations: 5,
      },
      {
        id: 'don_11',
        userId: 'usr_don_11',
        name: 'Ahmed Hassan',
        bloodGroup: 'A+',
        age: 33,
        gender: 'Male',
        phone: '+1 (555) 876-0011',
        city: 'Metro City - North Suburbs',
        lat: baseLat + 0.052,
        lng: baseLng - 0.015,
        isAvailable: true,
        lastDonationDate: '2026-02-14',
        totalDonations: 9,
      },
      {
        id: 'don_12',
        userId: 'usr_don_12',
        name: 'Kavita Nair',
        bloodGroup: 'B+',
        age: 29,
        gender: 'Female',
        phone: '+1 (555) 432-8877',
        city: 'Metro City - Green Park',
        lat: baseLat - 0.015,
        lng: baseLng + 0.018,
        isAvailable: true,
        lastDonationDate: '2026-04-30',
        totalDonations: 4,
      },
      {
        id: 'don_13',
        userId: 'usr_don_13',
        name: 'Lucas Wright',
        bloodGroup: 'O+',
        age: 38,
        gender: 'Male',
        phone: '+1 (555) 654-1122',
        city: 'Metro City - Old Town',
        lat: baseLat + 0.022,
        lng: baseLng - 0.010,
        isAvailable: false,
        lastDonationDate: '2026-08-01', // 28 days ago (ineligible)
        totalDonations: 12,
      },
      {
        id: 'don_14',
        userId: 'usr_don_14',
        name: 'Chloe Bennett',
        bloodGroup: 'A-',
        age: 23,
        gender: 'Female',
        phone: '+1 (555) 998-3344',
        city: 'Metro City - Riverside',
        lat: baseLat - 0.038,
        lng: baseLng - 0.022,
        isAvailable: true,
        lastDonationDate: '2026-03-02',
        totalDonations: 2,
      },
      {
        id: 'don_15',
        userId: 'usr_don_15',
        name: 'Arjun Verma',
        bloodGroup: 'B-',
        age: 26,
        gender: 'Male',
        phone: '+1 (555) 223-7788',
        city: 'Metro City - Tech Boulevard',
        lat: baseLat + 0.031,
        lng: baseLng + 0.029,
        isAvailable: true,
        lastDonationDate: '2026-04-22',
        totalDonations: 3,
      },
    ];

    // 4. Initial Blood Requests (Active and historic)
    this.requests = [
      {
        id: 'req_101',
        requesterId: 'usr_pat_1',
        requesterName: 'Sarah Jenkins',
        requesterPhone: '+1 (555) 234-5678',
        patientName: 'Robert Jenkins (ICU Trauma)',
        hospitalId: 'hosp_1',
        hospitalName: 'Hospital Alpha (Metro Central)',
        locationName: 'Hospital Alpha ICU, Ward 3',
        lat: baseLat + 0.015,
        lng: baseLng + 0.012,
        bloodGroup: 'O-',
        unitsRequired: 2,
        unitsFulfilled: 0,
        emergencyLevel: 'CRITICAL',
        status: 'PENDING',
        notes: 'Emergency surgical transfusion required post-accident.',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      },
      {
        id: 'req_102',
        requesterId: 'usr_pat_2',
        requesterName: 'Marcus Vance',
        requesterPhone: '+1 (555) 443-8822',
        patientName: 'Clara Vance',
        hospitalId: 'hosp_2',
        hospitalName: 'Hospital Beta (City Care)',
        locationName: 'Hospital Beta Emergency Room',
        lat: baseLat - 0.022,
        lng: baseLng - 0.018,
        bloodGroup: 'B+',
        unitsRequired: 1,
        unitsFulfilled: 0,
        emergencyLevel: 'URGENT',
        status: 'PENDING',
        notes: 'Platelet and whole blood requirement before scheduled cardiac procedure.',
        createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(), // 42 mins ago
      },
      {
        id: 'req_103',
        requesterId: 'usr_pat_3',
        requesterName: 'Deepa Roy',
        requesterPhone: '+1 (555) 887-2299',
        patientName: 'Dev Roy',
        hospitalId: 'hosp_3',
        hospitalName: 'St. Jude Blood Bank & Trauma Center',
        locationName: 'St. Jude Oncology Wing',
        lat: baseLat + 0.035,
        lng: baseLng - 0.028,
        bloodGroup: 'A+',
        unitsRequired: 3,
        unitsFulfilled: 0,
        emergencyLevel: 'NORMAL',
        status: 'PENDING',
        notes: 'Routine scheduled transfusion for thalassemia management.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'req_104',
        requesterId: 'usr_pat_4',
        requesterName: 'William Taylor',
        requesterPhone: '+1 (555) 776-5544',
        patientName: 'Emma Taylor',
        hospitalId: 'hosp_1',
        hospitalName: 'Hospital Alpha (Metro Central)',
        locationName: 'Hospital Alpha Maternity Wing',
        lat: baseLat + 0.015,
        lng: baseLng + 0.012,
        bloodGroup: 'O+',
        unitsRequired: 2,
        unitsFulfilled: 2,
        emergencyLevel: 'URGENT',
        status: 'FULFILLED',
        notes: 'Post-delivery stabilization.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        fulfilledAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // 5. Initial Notifications
    this.notifications = [
      {
        id: 'notif_1',
        userId: 'usr_don_1',
        title: '🔴 Critical O- Request in Your Area',
        message: 'Patient Robert Jenkins urgently requires 2 units of O- blood at Hospital Alpha (2.1 km away).',
        type: 'CRITICAL',
        read: false,
        createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif_2',
        userId: 'usr_hosp_1',
        title: 'New Emergency Blood Request',
        message: 'CRITICAL: 2 units of O- requested at Alpha General ICU.',
        type: 'CRITICAL',
        read: false,
        createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif_3',
        userId: 'usr_pat_1',
        title: 'Request Broadcast Active',
        message: 'Your emergency request for 2 units of O- blood has been broadcast to 4 compatible donors within 5 km.',
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
        actor: 'Sarah Jenkins (Patient)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        details: 'Created CRITICAL emergency request for 2 units of O- blood.',
      },
      {
        id: 'hist_2',
        requestId: 'req_104',
        action: 'FULFILLED',
        actor: 'Hospital Alpha Admin',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        details: 'Fulfilled 2 units of O+ from hospital inventory. Stock updated from 17 to 15.',
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
