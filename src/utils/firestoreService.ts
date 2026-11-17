import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { ApplicationFormData, FamilyMember } from '../types/index';
import { db, handleFirestoreError, OperationType } from './firebase';
import { calculateAge } from './logic';
import { SheetSyncResult } from './googleSheets';

const APPLICATIONS_COLLECTION = 'applications';
const APPS_CACHE_KEY = 'mss_cached_applications_v1';
const SHEET_CONFIG_STORAGE_KEY = 'mss_google_sheet_config_v1';

let memoryApplicationsCache: ApplicationFormData[] | null = null;
let memoryCacheTimestamp: number | null = null;

function trimToMax(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function generateClientApplicationId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const suffix = Date.now().toString(36).slice(-3).toUpperCase();
  return `MSS-2026-${randomDigits}${suffix}`;
}

function sanitizeFamilyMembers(
  members: FamilyMember[] | undefined
): FamilyMember[] {
  if (!Array.isArray(members)) return [];
  return members.slice(0, 15).map((m, idx) => ({
    id: trimToMax(m.id || `fm-${idx + 1}`, 40),
    srNo: typeof m.srNo === 'number' ? m.srNo : idx + 1,
    fullName: trimToMax(m.fullName, 150) || '-',
    relation: trimToMax(m.relation, 50),
    dob: trimToMax(m.dob, 30),
    occupation: trimToMax(m.occupation, 100),
    education: trimToMax(m.education, 100),
  }));
}

function writeLocalApplicationsCache(apps: ApplicationFormData[]) {
  memoryApplicationsCache = apps;
  memoryCacheTimestamp = Date.now();
  try {
    sessionStorage.setItem(
      APPS_CACHE_KEY,
      JSON.stringify({ timestamp: memoryCacheTimestamp, apps })
    );
  } catch {
    // Ignore storage quota issues (photos may exceed sessionStorage 5MB)
  }
}

function readLocalApplicationsCache(): {
  apps: ApplicationFormData[];
  timestamp: number;
} | null {
  if (memoryApplicationsCache && memoryCacheTimestamp) {
    return { apps: memoryApplicationsCache, timestamp: memoryCacheTimestamp };
  }
  try {
    const raw = sessionStorage.getItem(APPS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      timestamp?: number;
      apps?: ApplicationFormData[];
    };
    if (Array.isArray(parsed.apps) && typeof parsed.timestamp === 'number') {
      memoryApplicationsCache = parsed.apps;
      memoryCacheTimestamp = parsed.timestamp;
      return { apps: parsed.apps, timestamp: parsed.timestamp };
    }
  } catch {
    // Ignore parse error
  }
  return null;
}

export async function submitApplicationToFirestore(
  formData: ApplicationFormData
): Promise<ApplicationFormData> {
  const id = generateClientApplicationId();
  const path = `${APPLICATIONS_COLLECTION}/${id}`;

  const parsedAge =
    typeof formData.age === 'number' && !Number.isNaN(formData.age)
      ? Math.max(0, Math.min(120, Math.round(formData.age)))
      : calculateAge(formData.dob);

  const cleanedMobile = String(formData.mobile || '')
    .replace(/\D/g, '')
    .slice(0, 10);

  const sanitizedMembers = sanitizeFamilyMembers(formData.familyMembers);

  const payload = {
    id,
    targetLevel: formData.targetLevel,
    division: trimToMax(formData.division, 100),
    targetDistrict: trimToMax(formData.targetDistrict, 100),
    targetWing:
      trimToMax(formData.targetWing, 150) || 'मराठा सेवा संघ (मुख्य कक्ष)',
    targetPost: trimToMax(formData.targetPost, 80),
    fullName: trimToMax(formData.fullName, 150),
    gender: formData.gender,
    dob: trimToMax(formData.dob, 30),
    age: parsedAge,
    mobile: cleanedMobile,
    alternateMobile: trimToMax(formData.alternateMobile, 15),
    email: trimToMax(formData.email, 150),
    houseNo: trimToMax(formData.houseNo, 120),
    street: trimToMax(formData.street, 150),
    village: trimToMax(formData.village, 120),
    post: trimToMax(formData.post, 120),
    taluka: trimToMax(formData.taluka, 120),
    district: trimToMax(formData.district, 100),
    pincode: trimToMax(formData.pincode, 10),
    occupationType: trimToMax(formData.occupationType, 60),
    designationOrBusiness: trimToMax(formData.designationOrBusiness, 180),
    isLifeMember: Boolean(formData.isLifeMember),
    lifeMemberSince: trimToMax(formData.lifeMemberSince, 30),
    lifeMemberNo: trimToMax(formData.lifeMemberNo, 50),
    isPoliticalActive: Boolean(formData.isPoliticalActive),
    politicalParty: trimToMax(formData.politicalParty, 120),
    politicalDesignation: trimToMax(formData.politicalDesignation, 120),
    monthlyContribution:
      typeof formData.monthlyContribution === 'number' &&
      !Number.isNaN(formData.monthlyContribution)
        ? Math.max(0, Math.min(1000000, formData.monthlyContribution))
        : null,
    paymentFrequency: formData.paymentFrequency || 'सहामाही',
    familyMembers: sanitizedMembers,
    photoUrl: trimToMax(formData.photoUrl, 250000),
    signatureUrl: trimToMax(formData.signatureUrl, 250000),
    agreedToTerms: true,
    submissionDate:
      trimToMax(formData.submissionDate, 30) ||
      new Date().toLocaleDateString('en-GB'),
    submissionPlace: trimToMax(formData.submissionPlace, 120),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, APPLICATIONS_COLLECTION, id), payload);
    const createdItem: ApplicationFormData = {
      ...formData,
      id,
      age: parsedAge,
      mobile: cleanedMobile,
      familyMembers: sanitizedMembers,
      createdAt: new Date().toISOString(),
    };

    const existing = readLocalApplicationsCache();
    if (existing) {
      writeLocalApplicationsCache([createdItem, ...existing.apps]);
    }

    return createdItem;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

function mapDocToApplication(
  raw: Record<string, unknown>
): ApplicationFormData {
  const ts = raw.createdAt as Timestamp | string | undefined;
  const createdAtIso =
    ts && typeof (ts as Timestamp).toDate === 'function'
      ? (ts as Timestamp).toDate().toISOString()
      : typeof ts === 'string'
      ? ts
      : new Date().toISOString();

  return {
    ...(raw as unknown as ApplicationFormData),
    createdAt: createdAtIso,
  };
}

/**
 * Fetches applications once via getDocs (limit 500) and caches in memory/sessionStorage
 * to avoid continuous real-time listener reads and preserve Firestore free-tier quota.
 */
export async function fetchApplicationsFromFirestore(
  forceRefresh = false
): Promise<{ apps: ApplicationFormData[]; fetchedAt: number; fromCache: boolean }> {
  if (!forceRefresh) {
    const cached = readLocalApplicationsCache();
    if (cached) {
      return {
        apps: cached.apps,
        fetchedAt: cached.timestamp,
        fromCache: true,
      };
    }
  }

  const q = query(
    collection(db, APPLICATIONS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(500)
  );

  try {
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((d) =>
      mapDocToApplication(d.data() as Record<string, unknown>)
    );
    writeLocalApplicationsCache(list);
    return {
      apps: list,
      fetchedAt: memoryCacheTimestamp || Date.now(),
      fromCache: false,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, APPLICATIONS_COLLECTION);
  }
}

export function getStoredSheetConfig(): SheetSyncResult | null {
  try {
    const raw = localStorage.getItem(SHEET_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SheetSyncResult;
  } catch {
    return null;
  }
}

export function saveStoredSheetConfig(config: SheetSyncResult): void {
  try {
    localStorage.setItem(SHEET_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore localStorage failure
  }
}
