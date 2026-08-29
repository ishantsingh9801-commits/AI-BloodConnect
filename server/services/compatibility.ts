import { BloodGroup, Donor, MatchScoreBreakdown } from '../../src/types';
import { calculateDistanceKm } from './distance';

/**
 * Deterministic Red Blood Cell (RBC) compatibility lookup table.
 * Key: Donor Group -> Array of compatible recipient groups
 */
export const RBC_DONATION_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Can only donate RBCs to AB+
};

/**
 * Deterministic lookup table of which donor blood groups a recipient can safely receive from.
 * Key: Recipient Group -> Array of compatible donor groups
 */
export const RBC_RECIPIENT_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal recipient
};

/**
 * Returns all compatible donor blood groups for a given recipient blood group.
 * Strictly deterministic — no AI or heuristics used.
 */
export function getCompatibleDonorGroups(recipientBloodGroup: BloodGroup): BloodGroup[] {
  return RBC_RECIPIENT_COMPATIBILITY[recipientBloodGroup] || [];
}

/**
 * Checks if a donor blood group is compatible with a recipient blood group.
 */
export function isCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
  const allowedDonors = RBC_RECIPIENT_COMPATIBILITY[recipientGroup];
  return allowedDonors ? allowedDonors.includes(donorGroup) : false;
}

/**
 * Calculates days passed since a given ISO date string.
 */
export function calculateDaysSince(dateString: string): number {
  if (!dateString) return 999;
  const past = new Date(dateString).getTime();
  const now = Date.now();
  const diffTime = Math.max(0, now - past);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Transparent 100-Point Smart Match Score Algorithm
 *
 * Breakdown:
 * 1. Compatibility (40 Points):
 *    - Direct match (same blood group) = 40 pts
 *    - Safe compatible donor (e.g. O- to A+) = 35 pts
 *    - Incompatible = 0 pts (Immediate disqualification)
 *
 * 2. Proximity / Distance (25 Points):
 *    - 0 to 3 km = 25 pts
 *    - 3 to 7 km = 20 pts
 *    - 7 to 15 km = 15 pts
 *    - 15 to 30 km = 10 pts
 *    - > 30 km = 5 pts
 *
 * 3. Availability (20 Points):
 *    - Currently marked as "Available" = 20 pts
 *    - Marked "Unavailable" = 0 pts
 *
 * 4. Medical Eligibility (15 Points):
 *    - >= 90 days since last donation = 15 pts (safe standard interval)
 *    - 60-89 days = 8 pts
 *    - < 60 days = 0 pts (recent donation cooldown)
 */
export function calculateSmartMatchScore(
  donor: Donor,
  recipientGroup: BloodGroup,
  targetLat: number,
  targetLng: number
): MatchScoreBreakdown {
  const compatible = isCompatible(donor.bloodGroup, recipientGroup);
  const distanceKm = calculateDistanceKm(targetLat, targetLng, donor.lat, donor.lng);
  const daysSince = calculateDaysSince(donor.lastDonationDate);
  const isEligible = daysSince >= 90;

  const reasons: string[] = [];

  // 1. Compatibility Score (Max 40)
  let compatibilityScore = 0;
  if (compatible) {
    if (donor.bloodGroup === recipientGroup) {
      compatibilityScore = 40;
      reasons.push(`Exact blood group match (${donor.bloodGroup}) [+40 pts]`);
    } else {
      compatibilityScore = 35;
      reasons.push(`Compatible group (${donor.bloodGroup} for ${recipientGroup}) [+35 pts]`);
    }
  } else {
    compatibilityScore = 0;
    reasons.push(`Incompatible blood group (${donor.bloodGroup} cannot donate RBCs to ${recipientGroup}) [0 pts]`);
  }

  // 2. Distance Score (Max 25)
  let distanceScore = 0;
  if (distanceKm <= 3) {
    distanceScore = 25;
    reasons.push(`Very close proximity (${distanceKm} km) [+25 pts]`);
  } else if (distanceKm <= 7) {
    distanceScore = 20;
    reasons.push(`Moderate proximity (${distanceKm} km) [+20 pts]`);
  } else if (distanceKm <= 15) {
    distanceScore = 15;
    reasons.push(`Medium distance (${distanceKm} km) [+15 pts]`);
  } else if (distanceKm <= 30) {
    distanceScore = 10;
    reasons.push(`Extended distance (${distanceKm} km) [+10 pts]`);
  } else {
    distanceScore = 5;
    reasons.push(`Far distance (${distanceKm} km) [+5 pts]`);
  }

  // 3. Availability Score (Max 20)
  let availabilityScore = 0;
  if (donor.isAvailable) {
    availabilityScore = 20;
    reasons.push('Donor is active and marked as AVAILABLE [+20 pts]');
  } else {
    availabilityScore = 0;
    reasons.push('Donor is currently marked as UNAVAILABLE [0 pts]');
  }

  // 4. Eligibility Score (Max 15)
  let eligibilityScore = 0;
  if (daysSince >= 90) {
    eligibilityScore = 15;
    reasons.push(`Eligible for donation (${daysSince} days since last donation) [+15 pts]`);
  } else if (daysSince >= 60) {
    eligibilityScore = 8;
    reasons.push(`Borderline cooldown (${daysSince} days since last donation) [+8 pts]`);
  } else {
    eligibilityScore = 0;
    reasons.push(`Ineligible due to recent donation (${daysSince} days ago, requires 90 days) [0 pts]`);
  }

  // Total Score (0 - 100)
  // If incompatible, overall score is heavily penalized to 0 for safety
  const totalScore = compatible
    ? compatibilityScore + distanceScore + availabilityScore + eligibilityScore
    : 0;

  return {
    compatibilityScore,
    distanceScore,
    availabilityScore,
    eligibilityScore,
    totalScore,
    isCompatible: compatible,
    distanceKm,
    isAvailable: donor.isAvailable,
    isEligible,
    daysSinceLastDonation: daysSince,
    reasons,
  };
}
