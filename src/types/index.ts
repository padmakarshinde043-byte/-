export interface FamilyMember {
  id: string;
  srNo: number;
  fullName: string;
  relation: string;
  dob: string;
  occupation: string;
  education: string;
}

export type Gender = 'पुरुष' | 'स्त्री' | 'इतर';

export type OccupationType =
  | 'शासकीय सेवा'
  | 'खाजगी सेवा'
  | 'उद्योग'
  | 'व्यवसाय'
  | 'शेती'
  | 'सेवा निवृत्त'
  | 'विद्यार्थी'
  | 'इतर';

export type TargetLevel =
  | 'राज्य कार्यकारिणी'
  | 'विभागीय कार्यकारिणी'
  | 'जिल्हा कार्यकारिणी'
  | 'इतर कक्ष कार्यकारिणी';

export type PaymentFrequency = 'सहामाही' | 'वार्षिक';

export type ApplicationStatus = 'प्रलंबित' | 'तपासणी सुरू' | 'मंजूर' | 'नाकारले';

export interface ApplicationFormData {
  id?: string;
  createdAt?: string;
  status?: ApplicationStatus;

  // ०. मुख्य निवड: चार कार्यकारिणी पैकी कोणती कार्यकारिणी
  targetLevel: TargetLevel;
  division?: string;        // विभागीय निवडल्यास विभाग
  targetDistrict?: string;  // जिल्हा कार्यकारिणी असल्यास जिल्हा
  targetWing: string;       // इतर कक्ष असल्यास ३३ पैकी कक्ष

  // इच्छुक पद (१० पदे)
  targetPost: string;

  // ०१. संपूर्ण नाव
  fullName: string;

  // ०२. लिंग
  gender: Gender;

  // ०३. जन्म दिनांक व वय
  dob: string;
  age: number | string;

  // ०४. मोबाईल नं.
  mobile: string;
  alternateMobile?: string;

  // ०५. ई मेल
  email: string;

  // ०६. कायमचा पत्ता
  houseNo: string;
  street: string;
  village: string;
  post: string;
  taluka: string;
  district: string;
  pincode: string;

  // ०७. व्यवसाय
  occupationType: OccupationType;
  designationOrBusiness: string;

  // ०९. मराठा सेवा संघाचे आजीवन सभासद आहात का ?
  isLifeMember: boolean;
  lifeMemberSince?: string;
  lifeMemberNo?: string;

  // १०. आपण किंवा आपल्या कुटूंबातील इतर सदस्य राजकीय पक्षात सक्रिय आहेत काय ?
  isPoliticalActive: boolean;
  politicalParty?: string;
  politicalDesignation?: string;

  // ११. दरमहा किमान रक्कम रुपये (१, २, ३, ४, ५ हजार रुपये - ऐच्छिक)
  monthlyContribution?: number | null;
  customContribution?: number;

  // १२. आर्थिक योगदान जमा करण्याची पद्धत
  paymentFrequency?: PaymentFrequency;

  // कौटुंबिक माहिती
  familyMembers: FamilyMember[];

  // फोटो व स्वाक्षरी
  photoUrl: string;
  signatureUrl: string;

  // १३. हमीपत्र व आचारसंहिता
  agreedToTerms: boolean;
  submissionDate: string;
  submissionPlace: string;
}

export interface AdminUser {
  username: string;
  name: string;
  role: string;
}
