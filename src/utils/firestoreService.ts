import {
  collection,
  doc,
  getDoc,
  onSnapshot,
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
const SETTINGS_COLLECTION = 'settings';
const GOOGLE_SHEET_DOC_ID = 'googleSheet';

function trimToMax(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function generateClientApplicationId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const suffix = Date.now().toString(36).slice(-3).toUpperCase();
  return `MSS-2026-${randomDigits}${suffix}`;
}

function sanitizeFamilyMembers(members: FamilyMember[] | undefined): FamilyMember[] {
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
    targetWing: trimToMax(formData.targetWing, 150) || 'मराठा सेवा संघ (मुख्य कक्ष)',
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
    return {
      ...formData,
      id,
      age: parsedAge,
      mobile: cleanedMobile,
      familyMembers: sanitizedMembers,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

function mapDocToApplication(raw: Record<string, unknown>): ApplicationFormData {
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

export function subscribeApplicationsFromFirestore(
  onData: (apps: ApplicationFormData[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(
    collection(db, APPLICATIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) =>
        mapDocToApplication(d.data() as Record<string, unknown>)
      );
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, APPLICATIONS_COLLECTION);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function fetchSheetConfigFromFirestore(): Promise<SheetSyncResult | null> {
  const path = `${SETTINGS_COLLECTION}/${GOOGLE_SHEET_DOC_ID}`;
  try {
    const snap = await getDoc(
      doc(db, SETTINGS_COLLECTION, GOOGLE_SHEET_DOC_ID)
    );
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      spreadsheetId: String(data.spreadsheetId || ''),
      spreadsheetUrl: String(data.spreadsheetUrl || ''),
      sheetTitle: String(data.sheetTitle || 'अर्ज यादी'),
      syncedCount: Number(data.syncedCount || 0),
      lastSyncedAt: String(data.lastSyncedAt || ''),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveSheetConfigToFirestore(
  config: SheetSyncResult
): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/${GOOGLE_SHEET_DOC_ID}`;
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, GOOGLE_SHEET_DOC_ID), {
      spreadsheetId: trimToMax(config.spreadsheetId, 150),
      spreadsheetUrl: trimToMax(config.spreadsheetUrl, 400),
      sheetTitle: trimToMax(config.sheetTitle, 120) || 'अर्ज यादी',
      syncedCount: Math.max(0, Math.min(100000, Number(config.syncedCount) || 0)),
      lastSyncedAt: trimToMax(config.lastSyncedAt, 60),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
