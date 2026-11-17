import { ApplicationFormData } from '../types/index';
import { OFFICIAL_NOTICE } from './constants';

/**
 * जन्म तारखेवरून वय मोजणे (Calculate age from DOB)
 */
export function calculateAge(dobString: string, referenceDate: Date = new Date()): number {
  if (!dobString) return 0;

  let birthDate: Date;
  if (dobString.includes('/')) {
    const parts = dobString.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        birthDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else {
        birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    } else {
      birthDate = new Date(dobString);
    }
  } else if (dobString.includes('-')) {
    const parts = dobString.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        birthDate = new Date(dobString);
      } else {
        birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    } else {
      birthDate = new Date(dobString);
    }
  } else {
    birthDate = new Date(dobString);
  }

  if (isNaN(birthDate.getTime())) return 0;

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const m = referenceDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

/**
 * अर्ज नोंदणी क्रमांक तयार करणे (Generate official application ID)
 */
export function generateApplicationId(sequenceNumber: number): string {
  const padded = String(sequenceNumber).padStart(4, '0');
  return `MSS-2026-${padded}`;
}

/**
 * फॉर्म व्हॅलिडेशन (Validate application data)
 * टीप: वापरकर्त्याच्या सूचनेनुसार दरमहा रक्कम ऐच्छिक आहे (कम्पल्सरी नाही).
 */
export function validateApplication(data: Partial<ApplicationFormData>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // १. कार्यकारिणी निवड (सुरुवातीचा प्रश्न)
  if (!data.targetLevel) {
    errors.targetLevel = 'कृपया आपण कोणत्या कार्यकारिणीसाठी अर्ज करत आहात ते निवडा.';
  } else if (data.targetLevel === 'विभागीय कार्यकारिणी' && !data.division) {
    errors.division = 'कृपया विभाग निवडा.';
  } else if (data.targetLevel === 'इतर कक्ष कार्यकारिणी' && !data.targetWing) {
    errors.targetWing = 'कृपया कक्ष निवडा.';
  }

  // २. इच्छुक पद
  if (!data.targetPost || !data.targetPost.trim()) {
    errors.targetPost = 'कृपया इच्छुक पद निवडा.';
  }

  // ३. वैयक्तिक माहिती
  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = 'कृपया आपले संपूर्ण नाव प्रविष्ट करा.';
  }

  if (!data.gender) {
    errors.gender = 'कृपया लिंग निवडा.';
  }

  if (!data.dob) {
    errors.dob = 'कृपया जन्म दिनांक निवडा.';
  }

  if (!data.mobile || !data.mobile.trim()) {
    errors.mobile = 'कृपया 10 अंकी मोबाईल नंबर टाका.';
  } else {
    const cleanedMobile = data.mobile.replace(/\D/g, '');
    if (cleanedMobile.length !== 10) {
      errors.mobile = 'मोबाईल नंबर अचूक 10 अंकी असावा.';
    }
  }

  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'कृपया वैध ई-मेल पत्ता प्रविष्ट करा.';
    }
  }

  if (!data.village || !data.village.trim()) {
    errors.village = 'कृपया गाव / शहर प्रविष्ट करा.';
  }

  if (!data.district || !data.district.trim()) {
    errors.district = 'कृपया जिल्हा निवडा.';
  }

  if (!data.occupationType) {
    errors.occupationType = 'कृपया व्यवसाय निवडा.';
  }

  // हमीपत्र
  if (!data.agreedToTerms) {
    errors.agreedToTerms = 'मराठा सेवा संघाच्या आचार संहितेची संमती देणे आवश्यक आहे.';
  }

  // टीप: monthlyContribution ऐच्छिक आहे, त्यामुळे त्यावर error नाही.

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * CSV फील्ड सुरक्षित बनवणे (Escape CSV field)
 */
export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Excel व Google Sheet साठी एकसमान मराठी स्तंभ शीर्षके (अर्जावरील प्रक्रिया/स्थिती स्तंभाशिवाय)
 */
export const APPLICATION_EXPORT_HEADERS: string[] = [
  'नोंदणी क्र.',
  'अर्ज दिनांक',
  'कार्यकारिणी स्तर',
  'विभाग / जिल्हा / कक्ष तपशील',
  'इच्छुक पद',
  'संपूर्ण नाव',
  'लिंग',
  'जन्म दिनांक',
  'वय',
  'मोबाईल नं.',
  'पर्यायी मोबाईल',
  'ई-मेल',
  'घर क्र.',
  'गल्ली / नगर / कॉलनी',
  'गाव / शहर',
  'पोस्ट',
  'तालुका',
  'जिल्हा',
  'पिन कोड',
  'व्यवसाय प्रकार',
  'पदनाम / व्यवसायाचे नाव',
  'आजीवन सभासद',
  'आजीवन सभासद क्र. व वर्ष',
  'राजकीय सक्रियता',
  'राजकीय पक्ष व पद',
  'मासिक योगदान',
  'योगदान पद्धत',
  'कौटुंबिक सदस्य संख्या',
  'कौटुंबिक माहिती तपशील',
  'हमीपत्र संमती',
  'अर्ज ठिकाण',
];

/**
 * अर्जाची संपूर्ण माहिती Excel / Google Sheet रांगेत रूपांतरित करणे
 */
export function applicationToExportRow(app: ApplicationFormData): (string | number)[] {
  const familyDetails = (app.familyMembers || [])
    .map(
      (f, i) =>
        `${i + 1}) ${f.fullName} - ${f.relation}, जन्म: ${f.dob || '-'}, शिक्षण: ${f.education || '-'}, व्यवसाय: ${f.occupation || '-'}`
    )
    .join('; ');

  const bodyDetails =
    app.targetLevel === 'विभागीय कार्यकारिणी'
      ? app.division || ''
      : app.targetLevel === 'इतर कक्ष कार्यकारिणी'
      ? app.targetWing || ''
      : app.targetLevel === 'जिल्हा कार्यकारिणी'
      ? app.targetDistrict || app.district || ''
      : 'महाराष्ट्र राज्य';

  const submittedDate = app.submissionDate
    ? app.submissionDate
    : app.createdAt
    ? new Date(app.createdAt).toLocaleDateString('en-GB')
    : '';

  return [
    app.id || '',
    submittedDate,
    app.targetLevel || '',
    bodyDetails,
    app.targetPost || '',
    app.fullName || '',
    app.gender || '',
    app.dob || '',
    app.age || '',
    app.mobile || '',
    app.alternateMobile || '',
    app.email || '',
    app.houseNo || '',
    app.street || '',
    app.village || '',
    app.post || '',
    app.taluka || '',
    app.district || '',
    app.pincode || '',
    app.occupationType || '',
    app.designationOrBusiness || '',
    app.isLifeMember ? 'होय' : 'नाही',
    app.isLifeMember ? `${app.lifeMemberNo || '-'} / ${app.lifeMemberSince || '-'}` : '-',
    app.isPoliticalActive ? 'होय' : 'नाही',
    app.isPoliticalActive ? `${app.politicalParty || '-'} - ${app.politicalDesignation || '-'}` : '-',
    app.monthlyContribution ? `रु. ${app.monthlyContribution}/-` : 'ऐच्छिक',
    app.paymentFrequency || 'सहामाही',
    (app.familyMembers || []).length,
    familyDetails || '-',
    app.agreedToTerms ? 'मान्य' : 'नाही',
    app.submissionPlace || '',
  ];
}

/**
 * सर्व अर्जांचा मराठी UTF-8 CSV तयार करणे
 */
export function generateCsvContent(applications: ApplicationFormData[]): string {
  const rows = applications.map((app) =>
    applicationToExportRow(app).map(escapeCsvField).join(',')
  );

  return '\uFEFF' + [APPLICATION_EXPORT_HEADERS.map(escapeCsvField).join(','), ...rows].join('\r\n');
}

export interface ApplicationSummary {
  total: number;
  byStatus: {
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
  byLevel: {
    state: number;
    division: number;
    district: number;
    wings: number;
  };
  totalMonthlyPledge: number;
}

/**
 * सर्व प्राप्त अर्जांचा गोषवारा तयार करणे (Generate Summary Overview for Admin)
 */
export function summarizeApplications(applications: ApplicationFormData[]): ApplicationSummary {
  const byStatus = {
    pending: 0,
    inReview: 0,
    approved: 0,
    rejected: 0,
  };
  const byLevel = {
    state: 0,
    division: 0,
    district: 0,
    wings: 0,
  };
  let totalMonthlyPledge = 0;

  for (const app of applications) {
    const status = app.status || 'प्रलंबित';
    if (status === 'मंजूर') byStatus.approved += 1;
    else if (status === 'तपासणी सुरू') byStatus.inReview += 1;
    else if (status === 'नाकारले') byStatus.rejected += 1;
    else byStatus.pending += 1;

    if (app.targetLevel === 'राज्य कार्यकारिणी') byLevel.state += 1;
    else if (app.targetLevel === 'विभागीय कार्यकारिणी') byLevel.division += 1;
    else if (app.targetLevel === 'जिल्हा कार्यकारिणी') byLevel.district += 1;
    else if (app.targetLevel === 'इतर कक्ष कार्यकारिणी') byLevel.wings += 1;

    totalMonthlyPledge += Number(app.monthlyContribution) || 0;
  }

  return {
    total: applications.length,
    byStatus,
    byLevel,
    totalMonthlyPledge,
  };
}

/**
 * WhatsApp वर अर्ज पाठवण्यासाठी लिंक (WhatsApp Share URL)
 */
export function buildWhatsAppShareUrl(
  app: ApplicationFormData,
  targetPhone: string = OFFICIAL_NOTICE.whatsappNumber
): string {
  const cleanPhone = targetPhone.replace(/\D/g, '');
  const bodySub =
    app.targetLevel === 'विभागीय कार्यकारिणी'
      ? ` (${app.division})`
      : app.targetLevel === 'इतर कक्ष कार्यकारिणी'
      ? ` (${app.targetWing})`
      : '';

  const contributionText = app.monthlyContribution
    ? `रु. ${app.monthlyContribution}/- (${app.paymentFrequency || 'सहामाही'})`
    : 'ऐच्छिक';

  const message = `*जय जिजाऊ ! जय शिवराय !!*
*मराठा सेवा संघ - इच्छुक पदाधिकारी अर्ज 2026*
संदर्भ पत्र: ${OFFICIAL_NOTICE.letterNo}
नोंदणी क्र: ${app.id || 'नवीन अर्ज'}

*अर्जदाराची माहिती:*
• संपूर्ण नाव: ${app.fullName}
• मोबाईल: ${app.mobile}
• जिल्हा: ${app.district} (तालुका: ${app.taluka || '-'})
• व्यवसाय: ${app.occupationType} (${app.designationOrBusiness || '-'})

*इच्छुक कार्यकारिणी व पद:*
• कार्यकारिणी: ${app.targetLevel}${bodySub}
• इच्छुक पद: ${app.targetPost}

*मासिक योगदान:* ${contributionText}
*आजीवन सभासद:* ${app.isLifeMember ? 'होय' : 'नाही'}

_मराठा सेवा संघाच्या आचार संहितेचे पालन करण्यास मी वचनबद्ध आहे._
सादरकर्ता: ${app.fullName}
ठिकाण: ${app.submissionPlace || app.village} | दिनांक: ${app.submissionDate}`;

  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * ई-मेल वर पाठवण्यासाठी लिंक (Email Share URL)
 */
export function buildEmailShareUrl(
  app: ApplicationFormData,
  targetEmail: string = OFFICIAL_NOTICE.email
): string {
  const subject = `मराठा सेवा संघ पदाधिकारी अर्ज - ${app.fullName} (${app.targetLevel} - ${app.targetPost})`;
  const bodySub =
    app.targetLevel === 'विभागीय कार्यकारिणी'
      ? ` (${app.division})`
      : app.targetLevel === 'इतर कक्ष कार्यकारिणी'
      ? ` (${app.targetWing})`
      : '';

  const contributionText = app.monthlyContribution
    ? `रु. ${app.monthlyContribution}/- (${app.paymentFrequency || 'सहामाही'})`
    : 'ऐच्छिक';

  const body = `जय जिजाऊ ! जय शिवराय !!

प्रति,
मा. धनंजय पाटील साहेब,
केंद्रीय कार्यालयीन सचिव,
मराठा सेवा संघ, महाराष्ट्र

संदर्भ: केंद्रीय कार्यालय पत्र जा. क्र. 32/2026-27 दिनांक 05-11-2026

महोदय,
मी खालीलप्रमाणे मराठा सेवा संघात कार्य करण्यासाठी माझा इच्छुक पदाधिकारी माहिती अर्ज सादर करीत आहे:

नोंदणी क्र: ${app.id || 'MSS-2026'}
संपूर्ण नाव: ${app.fullName}
लिंग: ${app.gender} | जन्म दिनांक: ${app.dob} (वय: ${app.age})
मोबाईल नं.: ${app.mobile} | ई-मेल: ${app.email || '-'}
पत्ता: ${app.houseNo ? app.houseNo + ', ' : ''}${app.street ? app.street + ', ' : ''}${app.village}, ता. ${app.taluka || '-'}, जि. ${app.district} - ${app.pincode}
व्यवसाय: ${app.occupationType} - ${app.designationOrBusiness || '-'}

इच्छुक कार्यकारिणी: ${app.targetLevel}${bodySub}
इच्छुक पद: ${app.targetPost}
आजीवन सभासद: ${app.isLifeMember ? 'होय (क्र. ' + (app.lifeMemberNo || '-') + ')' : 'नाही'}

मासिक आर्थिक योगदान: ${contributionText}
कौटुंबिक सदस्य संख्या: ${(app.familyMembers || []).length}

मी मराठा सेवा संघाच्या आदर्श आचार संहितेचे तंतोतंत पालन करण्याचे मान्य करतो.

आपला नम्र,
${app.fullName}
ठिकाण: ${app.submissionPlace || app.village}
दिनांक: ${app.submissionDate}`;

  return `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
