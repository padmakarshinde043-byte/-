import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAge,
  generateApplicationId,
  validateApplication,
  escapeCsvField,
  generateCsvContent,
  buildWhatsAppShareUrl,
  summarizeApplications,
} from './logic';
import { ApplicationFormData } from '../types/index';

test('calculateAge calculates correct age from ISO date string', () => {
  const refDate = new Date('2026-11-16');
  assert.equal(calculateAge('1990-05-15', refDate), 36);
  assert.equal(calculateAge('2000-11-20', refDate), 25);
  assert.equal(calculateAge('2000-11-10', refDate), 26);
});

test('generateApplicationId creates formatted MSS IDs', () => {
  assert.equal(generateApplicationId(1), 'MSS-2026-0001');
  assert.equal(generateApplicationId(42), 'MSS-2026-0042');
});

test('validateApplication requires executive body and post selection', () => {
  const emptyResult = validateApplication({});
  assert.equal(emptyResult.isValid, false);
  assert.ok(emptyResult.errors.targetLevel);
  assert.ok(emptyResult.errors.targetPost);
});

test('validateApplication passes when monthlyContribution is omitted (non-compulsory)', () => {
  const validDataWithoutContribution: Partial<ApplicationFormData> = {
    targetLevel: 'राज्य कार्यकारिणी',
    targetWing: 'मराठा सेवा संघ (मुख्य कक्ष)',
    targetPost: 'अध्यक्ष',
    fullName: 'रणजीत गायकवाड',
    gender: 'पुरुष',
    dob: '1988-06-12',
    mobile: '9876543210',
    village: 'पुणे',
    district: 'पुणे',
    occupationType: 'व्यवसाय',
    agreedToTerms: true,
    // Note: monthlyContribution is completely omitted here
  };
  const result = validateApplication(validDataWithoutContribution);
  assert.equal(result.isValid, true);
  assert.equal(result.errors.monthlyContribution, undefined);
});

test('validateApplication requires division if divisional executive is selected', () => {
  const divData: Partial<ApplicationFormData> = {
    targetLevel: 'विभागीय कार्यकारिणी',
    targetPost: 'उपाध्यक्ष',
    fullName: 'अमोल जाधव',
    gender: 'पुरुष',
    dob: '1990-01-01',
    mobile: '9876543210',
    village: 'पुणे',
    district: 'पुणे',
    occupationType: 'खाजगी सेवा',
    agreedToTerms: true,
  };
  const result = validateApplication(divData);
  assert.equal(result.isValid, false);
  assert.ok(result.errors.division);
});

test('generateCsvContent prefixes UTF-8 BOM and outputs rows', () => {
  const sampleApps: ApplicationFormData[] = [
    {
      id: 'MSS-2026-0001',
      createdAt: '2026-11-16T10:00:00.000Z',
      fullName: 'सुहास देशमुख',
      gender: 'पुरुष',
      dob: '1985-04-10',
      age: 41,
      mobile: '9822001122',
      email: 'suhas@example.com',
      houseNo: '12',
      street: 'टिळक रोड',
      village: 'पुणे',
      post: 'पुणे',
      taluka: 'हवेली',
      district: 'पुणे',
      pincode: '411030',
      occupationType: 'व्यवसाय',
      designationOrBusiness: 'उद्योग',
      targetLevel: 'राज्य कार्यकारिणी',
      targetWing: 'मराठा सेवा संघ (मुख्य कक्ष)',
      targetPost: 'अध्यक्ष',
      isLifeMember: true,
      isPoliticalActive: false,
      monthlyContribution: null,
      familyMembers: [],
      photoUrl: '',
      signatureUrl: '',
      agreedToTerms: true,
      submissionDate: '16/11/2026',
      submissionPlace: 'पुणे',
      status: 'मंजूर',
    },
  ];

  const csv = generateCsvContent(sampleApps);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.ok(csv.includes('सुहास देशमुख'));
  assert.ok(csv.includes('राज्य कार्यकारिणी'));
  assert.ok(csv.includes('अध्यक्ष'));
  assert.ok(!csv.split('\r\n')[0].includes('स्थिती'));
});

test('summarizeApplications aggregates status counts, 4 executive body counts, and monthly pledge total', () => {
  const baseApp = {
    fullName: 'Test',
    gender: 'पुरुष' as const,
    dob: '1990-01-01',
    age: 36,
    mobile: '9876543210',
    email: '',
    houseNo: '',
    street: '',
    village: 'पुणे',
    post: '',
    taluka: '',
    district: 'पुणे',
    pincode: '',
    occupationType: 'व्यवसाय' as const,
    designationOrBusiness: '',
    targetWing: 'संभाजी ब्रिगेड',
    targetPost: 'अध्यक्ष',
    isLifeMember: false,
    isPoliticalActive: false,
    familyMembers: [],
    photoUrl: '',
    signatureUrl: '',
    agreedToTerms: true,
    submissionDate: '16/11/2026',
    submissionPlace: 'पुणे',
  };

  const summary = summarizeApplications([
    { ...baseApp, targetLevel: 'राज्य कार्यकारिणी', status: 'मंजूर', monthlyContribution: 5000 },
    { ...baseApp, targetLevel: 'विभागीय कार्यकारिणी', status: 'तपासणी सुरू', monthlyContribution: 3000 },
    { ...baseApp, targetLevel: 'जिल्हा कार्यकारिणी', status: 'प्रलंबित', monthlyContribution: 2000 },
    { ...baseApp, targetLevel: 'इतर कक्ष कार्यकारिणी', status: 'नाकारले', monthlyContribution: null },
  ]);

  assert.equal(summary.total, 4);
  assert.equal(summary.byStatus.approved, 1);
  assert.equal(summary.byStatus.inReview, 1);
  assert.equal(summary.byStatus.pending, 1);
  assert.equal(summary.byStatus.rejected, 1);
  assert.equal(summary.byLevel.state, 1);
  assert.equal(summary.byLevel.division, 1);
  assert.equal(summary.byLevel.district, 1);
  assert.equal(summary.byLevel.wings, 1);
  assert.equal(summary.totalMonthlyPledge, 10000);
});
