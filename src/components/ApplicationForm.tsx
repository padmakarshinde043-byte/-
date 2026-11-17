import React, { useState, useEffect } from 'react';
import {
  ApplicationFormData,
  Gender,
  OccupationType,
  TargetLevel,
  PaymentFrequency,
} from '../types/index';
import {
  EXECUTIVE_BODIES,
  OFFICIAL_POSTS,
  CONTRIBUTION_OPTIONS,
  MARATHA_SEVA_SANGH_WINGS,
  MAHARASHTRA_DISTRICTS,
  MAHARASHTRA_DIVISIONS,
  OCCUPATION_TYPES,
} from '../utils/constants';
import { calculateAge, validateApplication } from '../utils/logic';
import { submitApplicationToFirestore } from '../utils/firestoreService';
import { FamilyTable } from './FamilyTable';
import { PhotoUpload } from './PhotoUpload';
import { SignaturePad } from './SignaturePad';
import {
  User,
  MapPin,
  Briefcase,
  CreditCard,
  AlertCircle,
  FileText,
  Send,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface ApplicationFormProps {
  onSubmitSuccess: (application: ApplicationFormData) => void;
}

const STORAGE_KEY = 'mss_application_draft_2026';

const initialFormData: ApplicationFormData = {
  targetLevel: 'राज्य कार्यकारिणी',
  division: 'पुणे / पश्चिम महाराष्ट्र विभाग',
  targetDistrict: 'पुणे',
  targetWing: 'संभाजी ब्रिगेड',
  targetPost: 'अध्यक्ष',

  fullName: '',
  gender: 'पुरुष',
  dob: '',
  age: '',
  mobile: '',
  alternateMobile: '',
  email: '',
  houseNo: '',
  street: '',
  village: '',
  post: '',
  taluka: '',
  district: 'पुणे',
  pincode: '',
  occupationType: 'व्यवसाय',
  designationOrBusiness: '',
  isLifeMember: false,
  lifeMemberSince: '',
  lifeMemberNo: '',
  isPoliticalActive: false,
  politicalParty: '',
  politicalDesignation: '',

  monthlyContribution: null,
  customContribution: undefined,
  paymentFrequency: 'सहामाही',

  familyMembers: [],
  photoUrl: '',
  signatureUrl: '',
  agreedToTerms: true,
  submissionDate: new Date().toLocaleDateString('en-GB'),
  submissionPlace: '',
};

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState<ApplicationFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...initialFormData, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error reading draft:', e);
    }
    return initialFormData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomContribution, setIsCustomContribution] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      console.error('Draft save failed:', e);
    }
  }, [formData]);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const computedAge = calculateAge(val);
    setFormData((prev) => ({
      ...prev,
      dob: val,
      age: computedAge > 0 ? computedAge : '',
    }));
    if (errors.dob) {
      setErrors((prev) => ({ ...prev, dob: '' }));
    }
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateApplication(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstErrorKey = Object.keys(validation.errors)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const savedApplication = await submitApplicationToFirestore(formData);
      localStorage.removeItem(STORAGE_KEY);
      onSubmitSuccess(savedApplication);
    } catch (err) {
      console.error('Firestore submission failed:', err);
      setSubmitError(
        'अर्ज जमा करताना तांत्रिक अडचण आली आहे. कृपया इंटरनेट तपासून पुन्हा प्रयत्न करा.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-noto">
      {/* Main Form Card with Light Sky Blue & Classic Navy Theme */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-sky-200 overflow-hidden text-lg">
        {/* Form Header Title */}
        <div className="bg-gradient-to-r from-sky-100 via-sky-50 to-blue-50 text-[#0f294a] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-sky-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-noto tracking-tight text-[#0f294a]">
              इच्छुक पदाधिकारी माहिती संकलन नमुना अर्ज
            </h2>
            <p className="text-base text-[#1e4070] font-medium mt-1">
              मराठा सेवा संघ केंद्रीय कार्यालय, महाराष्ट्र | अंतिम मुदत: 30 नोव्हेंबर 2026
            </p>
          </div>
          <span className="self-start sm:self-auto text-base bg-white text-[#133b6e] px-3.5 py-1 rounded-md border border-sky-300 font-bold shadow-2xs">
            {formData.targetLevel}
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-8 text-lg">
          {/* ============================================================== */}
          {/* 0. सुरुवातीचा प्रश्न: चार कार्यकारिणी पैकी निवड */}
          {/* ============================================================== */}
          <section id="field-targetLevel" className="bg-sky-50/50 border border-sky-200 rounded-xl p-5 sm:p-6 space-y-5">
            <div className="flex items-start gap-3 pb-3 border-b border-sky-200">
              <Building2 className="w-7 h-7 text-[#133b6e] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0f294a] font-noto">
                  सुरुवातीचा प्रश्न: आपण खालील 4 पैकी कोणत्या कार्यकारिणीसाठी अर्ज करत आहात? <span className="text-rose-600">*</span>
                </h3>
                <p className="text-base text-slate-700 mt-1">
                  मराठा सेवा संघ राज्य, विभागीय, जिल्हा किंवा इतर 33 कक्षांपैकी आपली इच्छित कार्यकारिणी निवडा.
                </p>
              </div>
            </div>

            {/* 4 पर्याय - Compact Horizontal Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {EXECUTIVE_BODIES.map((body) => (
                <label
                  key={body}
                  className={`flex items-center gap-2.5 p-3.5 rounded-lg border text-base cursor-pointer transition-colors ${
                    formData.targetLevel === body
                      ? 'bg-sky-100 text-[#0f294a] border-[#133b6e] ring-1 ring-sky-500 font-bold shadow-2xs'
                      : 'bg-white border-sky-200 text-slate-800 hover:bg-sky-50/80 font-semibold'
                  }`}
                >
                  <input
                    type="radio"
                    name="targetLevel"
                    value={body}
                    checked={formData.targetLevel === body}
                    onChange={() => handleInputChange('targetLevel', body as TargetLevel)}
                    className="w-4 h-4 accent-[#133b6e] flex-shrink-0"
                  />
                  <span className="leading-snug">{body}</span>
                </label>
              ))}
            </div>
            {errors.targetLevel && (
              <p className="text-base text-rose-700 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5" /> {errors.targetLevel}
              </p>
            )}

            {/* Sub-selection: Division / District / Wing & Post */}
            <div className="pt-4 border-t border-sky-200 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {formData.targetLevel === 'विभागीय कार्यकारिणी' && (
                <div id="field-division" className="space-y-2">
                  <label className="block text-lg font-bold text-slate-900">
                    संबंधित विभाग निवडा <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => handleInputChange('division', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg bg-white focus:outline-none focus:border-[#133b6e] font-semibold"
                  >
                    {MAHARASHTRA_DIVISIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.targetLevel === 'जिल्हा कार्यकारिणी' && (
                <div id="field-targetDistrict" className="space-y-2">
                  <label className="block text-lg font-bold text-slate-900">
                    संबंधित जिल्हा निवडा <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.targetDistrict || formData.district}
                    onChange={(e) => {
                      handleInputChange('targetDistrict', e.target.value);
                      handleInputChange('district', e.target.value);
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg bg-white focus:outline-none focus:border-[#133b6e] font-semibold"
                  >
                    {MAHARASHTRA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.targetLevel === 'इतर कक्ष कार्यकारिणी' && (
                <div id="field-targetWing" className="space-y-2 sm:col-span-2">
                  <label className="block text-lg font-bold text-slate-900">
                    मराठा सेवा संघ प्रणित 33 कक्षांपैकी कक्ष निवडा <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.targetWing}
                    onChange={(e) => handleInputChange('targetWing', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg bg-white font-bold text-slate-900 focus:outline-none focus:border-[#133b6e]"
                  >
                    {MARATHA_SEVA_SANGH_WINGS.map((wing) => (
                      <option key={wing} value={wing}>
                        {wing}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 08. 10 Official Posts Dropdown */}
              <div id="field-targetPost" className="space-y-2 sm:col-span-2">
                <label className="block text-lg font-bold text-slate-900">
                  08. इच्छुक पद निवडा <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.targetPost}
                  onChange={(e) => handleInputChange('targetPost', e.target.value)}
                  className="w-full sm:w-[32rem] px-4 py-3 rounded-lg border border-sky-300 text-lg bg-white font-bold text-[#0f294a] focus:outline-none focus:border-[#133b6e]"
                >
                  {OFFICIAL_POSTS.map((post, idx) => (
                    <option key={post} value={post}>
                      {idx + 1}. {post}
                    </option>
                  ))}
                </select>
                {errors.targetPost && (
                  <p className="text-base text-rose-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-5 h-5" /> {errors.targetPost}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* भाग 1: वैयक्तिक माहिती */}
          {/* ============================================================== */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5 pb-2.5 border-b-2 border-sky-200">
              <User className="w-6 h-6 text-[#133b6e]" />
              <h3 className="text-xl font-bold text-[#0f294a] font-noto">
                भाग 1: वैयक्तिक माहिती
              </h3>
            </div>

            {/* 01. संपूर्ण नाव */}
            <div id="field-fullName" className="space-y-2">
              <label className="block text-lg font-bold text-slate-900">
                01. संपूर्ण नाव <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="पहिले नाव, वडिलांचे/पतीचे नाव, आडनाव"
                className={`w-full px-4 py-3 rounded-lg border text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-sky-100 ${
                  errors.fullName
                    ? 'border-rose-500 bg-rose-50/30'
                    : 'border-sky-200 focus:border-[#133b6e]'
                }`}
              />
              {errors.fullName && (
                <p className="text-base text-rose-700 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-5 h-5" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* 02. लिंग, 03. जन्म तारीख व वय */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div id="field-gender" className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  02. लिंग <span className="text-rose-600">*</span>
                </label>
                <div className="flex gap-5 pt-2">
                  {(['पुरुष', 'स्त्री', 'इतर'] as Gender[]).map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer text-lg font-semibold text-slate-900">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={() => handleInputChange('gender', g)}
                        className="w-5 h-5 accent-[#133b6e]"
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div id="field-dob" className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  03. जन्म दिनांक <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={handleDobChange}
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg font-semibold focus:outline-none focus:border-[#133b6e]"
                />
                {errors.dob && (
                  <p className="text-base text-rose-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-5 h-5" /> {errors.dob}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  वय
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.age ? `${formData.age} वर्षे` : ''}
                  placeholder="जन्मतारीख निवडा"
                  className="w-full px-4 py-3 rounded-lg border border-sky-100 bg-sky-50/60 text-slate-900 text-lg font-bold font-mono"
                />
              </div>
            </div>

            {/* 04. मोबाईल नं. & 05. ई-मेल */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div id="field-mobile" className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  04. मोबाईल नं. <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  placeholder="10 अंकी मोबाईल नं."
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg font-mono font-bold focus:outline-none focus:border-[#133b6e]"
                />
                {errors.mobile && (
                  <p className="text-base text-rose-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-5 h-5" /> {errors.mobile}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  पर्यायी मोबाईल नं.
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.alternateMobile || ''}
                  onChange={(e) => handleInputChange('alternateMobile', e.target.value)}
                  placeholder="पर्यायी संपर्क"
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg font-mono font-semibold focus:outline-none focus:border-[#133b6e]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  05. ई-मेल
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg font-semibold focus:outline-none focus:border-[#133b6e]"
                />
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* भाग 2: कायमचा पत्ता */}
          {/* ============================================================== */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5 pb-2.5 border-b-2 border-sky-200">
              <MapPin className="w-6 h-6 text-[#133b6e]" />
              <h3 className="text-xl font-bold text-[#0f294a] font-noto">
                भाग 2: कायमचा पत्ता
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  घर नं.
                </label>
                <input
                  type="text"
                  value={formData.houseNo}
                  onChange={(e) => handleInputChange('houseNo', e.target.value)}
                  placeholder="घर क्रमांक / निवास"
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg font-semibold focus:outline-none focus:border-[#133b6e]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  गल्ली / नगर / कॉलनी
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="रस्ता / गल्ली"
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg font-semibold focus:outline-none focus:border-[#133b6e]"
                />
              </div>

              <div id="field-village" className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  गाव / शहर <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  placeholder="गाव किंवा शहराचे नाव"
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg font-semibold focus:outline-none focus:border-[#133b6e]"
                />
                {errors.village && (
                  <p className="text-base text-rose-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-5 h-5" /> {errors.village}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  पोस्ट
                </label>
                <input
                  type="text"
                  value={formData.post}
                  onChange={(e) => handleInputChange('post', e.target.value)}
                  placeholder="पोस्ट ऑफिस"
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg font-semibold focus:outline-none focus:border-[#133b6e]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  तालुका
                </label>
                <input
                  type="text"
                  value={formData.taluka}
                  onChange={(e) => handleInputChange('taluka', e.target.value)}
                  placeholder="तालुका"
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg font-semibold focus:outline-none focus:border-[#133b6e]"
                />
              </div>

              <div id="field-district" className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  जिल्हा <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg bg-white focus:outline-none focus:border-[#133b6e] font-semibold"
                >
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="block text-lg font-bold text-slate-900">
                  पिन कोड
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="उदा. 411030"
                  className="w-full sm:w-64 px-4 py-3 rounded-lg border border-sky-200 text-lg font-mono font-bold focus:outline-none focus:border-[#133b6e]"
                />
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* भाग 3: व्यवसाय माहिती */}
          {/* ============================================================== */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5 pb-2.5 border-b-2 border-sky-200">
              <Briefcase className="w-6 h-6 text-[#133b6e]" />
              <h3 className="text-xl font-bold text-[#0f294a] font-noto">
                भाग 3: व्यवसाय माहिती
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  व्यवसाय प्रकार <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.occupationType}
                  onChange={(e) => handleInputChange('occupationType', e.target.value as OccupationType)}
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg bg-white focus:outline-none focus:border-[#133b6e] font-semibold"
                >
                  {OCCUPATION_TYPES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-900">
                  सेवेतील पदनाम / व्यवसायाचे नाव
                </label>
                <input
                  type="text"
                  value={formData.designationOrBusiness}
                  onChange={(e) => handleInputChange('designationOrBusiness', e.target.value)}
                  placeholder="पदनाम किंवा व्यवसायाचे स्वरूप"
                  className="w-full px-4 py-3 rounded-lg border border-sky-200 text-lg font-semibold focus:outline-none focus:border-[#133b6e]"
                />
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* भाग 4: सभासदत्व व राजकीय सक्रियता */}
          {/* ============================================================== */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5 pb-2.5 border-b-2 border-sky-200">
              <ShieldCheck className="w-6 h-6 text-[#133b6e]" />
              <h3 className="text-xl font-bold text-[#0f294a] font-noto">
                भाग 4: सभासदत्व व राजकीय सक्रियता
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 09. आजीवन सभासद */}
              <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-5 space-y-4">
                <label className="block text-lg font-bold text-slate-900">
                  09. मराठा सेवा संघाचे आजीवन सभासद आहात का ?
                </label>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2.5 cursor-pointer text-lg font-bold text-slate-900">
                    <input
                      type="radio"
                      name="isLifeMember"
                      checked={formData.isLifeMember === true}
                      onChange={() => handleInputChange('isLifeMember', true)}
                      className="w-5 h-5 accent-[#133b6e]"
                    />
                    <span>होय</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-lg font-bold text-slate-900">
                    <input
                      type="radio"
                      name="isLifeMember"
                      checked={formData.isLifeMember === false}
                      onChange={() => handleInputChange('isLifeMember', false)}
                      className="w-5 h-5 accent-[#133b6e]"
                    />
                    <span>नाही</span>
                  </label>
                </div>

                {formData.isLifeMember && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-sky-200">
                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1">केव्हापासून:</label>
                      <input
                        type="text"
                        value={formData.lifeMemberSince || ''}
                        onChange={(e) => handleInputChange('lifeMemberSince', e.target.value)}
                        placeholder="उदा. 2018"
                        className="w-full px-3.5 py-2.5 text-base border border-sky-200 rounded-lg font-semibold focus:outline-none focus:border-[#133b6e] bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1">सभासद क्रमांक:</label>
                      <input
                        type="text"
                        value={formData.lifeMemberNo || ''}
                        onChange={(e) => handleInputChange('lifeMemberNo', e.target.value)}
                        placeholder="LM-1234"
                        className="w-full px-3.5 py-2.5 text-base border border-sky-200 rounded-lg font-mono font-bold focus:outline-none focus:border-[#133b6e] bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 10. राजकीय पक्षात सक्रियता */}
              <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-5 space-y-4">
                <label className="block text-lg font-bold text-slate-900">
                  10. आपण किंवा कुटुंबातील सदस्य राजकीय पक्षात सक्रिय आहेत काय ?
                </label>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2.5 cursor-pointer text-lg font-bold text-slate-900">
                    <input
                      type="radio"
                      name="isPoliticalActive"
                      checked={formData.isPoliticalActive === true}
                      onChange={() => handleInputChange('isPoliticalActive', true)}
                      className="w-5 h-5 accent-[#133b6e]"
                    />
                    <span>होय</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-lg font-bold text-slate-900">
                    <input
                      type="radio"
                      name="isPoliticalActive"
                      checked={formData.isPoliticalActive === false}
                      onChange={() => handleInputChange('isPoliticalActive', false)}
                      className="w-5 h-5 accent-[#133b6e]"
                    />
                    <span>नाही</span>
                  </label>
                </div>

                {formData.isPoliticalActive && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-sky-200">
                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1">पक्ष:</label>
                      <input
                        type="text"
                        value={formData.politicalParty || ''}
                        onChange={(e) => handleInputChange('politicalParty', e.target.value)}
                        placeholder="पक्षाचे नाव"
                        className="w-full px-3.5 py-2.5 text-base border border-sky-200 rounded-lg font-semibold focus:outline-none focus:border-[#133b6e] bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1">पदनाम:</label>
                      <input
                        type="text"
                        value={formData.politicalDesignation || ''}
                        onChange={(e) => handleInputChange('politicalDesignation', e.target.value)}
                        placeholder="पद"
                        className="w-full px-3.5 py-2.5 text-base border border-sky-200 rounded-lg font-semibold focus:outline-none focus:border-[#133b6e] bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* भाग 5: दरमहा स्वैच्छिक रक्कम */}
          {/* ============================================================== */}
          <section className="bg-sky-50/50 border border-sky-200 rounded-xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-sky-200">
              <CreditCard className="w-6 h-6 text-[#133b6e]" />
              <div>
                <h3 className="text-xl font-bold text-[#0f294a] font-noto">
                  11. दरमहा रक्कम
                </h3>
                <span className="text-sm sm:text-base text-slate-700 font-semibold">
                  हे योगदान ऐच्छिक आहे, बंधनकारक नाही.
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-lg font-bold text-slate-900">
                कार्यकारिणीवर निवड झाल्यानंतर मराठा सेवा संघास दरमहा स्वैच्छिक योगदान देण्याचा पर्याय निवडा:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {CONTRIBUTION_OPTIONS.map((opt) => (
                  <label
                    key={opt.amount}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-base sm:text-lg cursor-pointer transition-colors ${
                      formData.monthlyContribution === opt.amount && !isCustomContribution
                        ? 'bg-sky-100 text-[#0f294a] border-[#133b6e] ring-1 ring-sky-500 font-bold shadow-2xs'
                        : 'bg-white text-slate-800 border-sky-200 hover:bg-sky-50 font-semibold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="monthlyContribution"
                      checked={formData.monthlyContribution === opt.amount && !isCustomContribution}
                      onChange={() => {
                        setIsCustomContribution(false);
                        handleInputChange('monthlyContribution', opt.amount);
                      }}
                      className="w-4 h-4 accent-[#133b6e] flex-shrink-0"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}

                <label
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-base sm:text-lg cursor-pointer transition-colors ${
                    isCustomContribution
                      ? 'bg-sky-100 text-[#0f294a] border-[#133b6e] ring-1 ring-sky-500 font-bold shadow-2xs'
                      : 'bg-white text-slate-800 border-sky-200 hover:bg-sky-50 font-semibold'
                  }`}
                >
                  <input
                    type="radio"
                    name="monthlyContribution"
                    checked={isCustomContribution}
                    onChange={() => {
                      setIsCustomContribution(true);
                      handleInputChange('monthlyContribution', 6000);
                    }}
                    className="w-4 h-4 accent-[#133b6e] flex-shrink-0"
                  />
                  <span>इतर रक्कम</span>
                </label>

                <label
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-base sm:text-lg cursor-pointer transition-colors col-span-2 sm:col-span-2 ${
                    formData.monthlyContribution === null
                      ? 'bg-sky-100 text-[#0f294a] border-[#133b6e] ring-1 ring-sky-500 font-bold shadow-2xs'
                      : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50 font-semibold'
                  }`}
                >
                  <input
                    type="radio"
                    name="monthlyContribution"
                    checked={formData.monthlyContribution === null}
                    onChange={() => {
                      setIsCustomContribution(false);
                      handleInputChange('monthlyContribution', null);
                    }}
                    className="w-4 h-4 accent-[#133b6e] flex-shrink-0"
                  />
                  <span>ऐच्छिक / नंतर ठरवीन</span>
                </label>
              </div>

              {isCustomContribution && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-base font-bold text-slate-900">ऐच्छिक रक्कम रु.:</span>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={formData.monthlyContribution || ''}
                    onChange={(e) => handleInputChange('monthlyContribution', Number(e.target.value) || null)}
                    placeholder="उदा. 7000"
                    className="w-48 px-4 py-2.5 rounded-lg border border-sky-300 bg-white text-lg font-bold font-mono focus:outline-none focus:border-[#133b6e]"
                  />
                </div>
              )}
            </div>

            {/* 12. योगदान जमा करण्याची पद्धत */}
            <div className="space-y-3 pt-4 border-t border-sky-200">
              <label className="block text-lg font-bold text-slate-900">
                12. आर्थिक योगदान जमा करण्याची पद्धती:
              </label>

              <div className="flex flex-wrap gap-4">
                {(['सहामाही', 'वार्षिक'] as PaymentFrequency[]).map((freq) => (
                  <label
                    key={freq}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg border text-lg cursor-pointer font-bold transition-colors ${
                      formData.paymentFrequency === freq
                        ? 'bg-sky-100 text-[#0f294a] border-[#133b6e] ring-1 ring-sky-500'
                        : 'bg-white text-slate-800 border-sky-200 hover:bg-sky-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentFrequency"
                      checked={formData.paymentFrequency === freq}
                      onChange={() => handleInputChange('paymentFrequency', freq)}
                      className="w-4 h-4 accent-[#133b6e]"
                    />
                    <span>{freq}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* भाग 6: कौटुंबिक माहिती तक्ता */}
          {/* ============================================================== */}
          <section className="space-y-5">
            <FamilyTable
              members={formData.familyMembers}
              onChange={(members) => handleInputChange('familyMembers', members)}
            />
          </section>

          {/* ============================================================== */}
          {/* भाग 7: फोटो व स्वाक्षरी */}
          {/* ============================================================== */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5 pb-2.5 border-b-2 border-sky-200">
              <FileText className="w-6 h-6 text-[#133b6e]" />
              <h3 className="text-xl font-bold text-[#0f294a] font-noto">
                भाग 7: फोटो व स्वाक्षरी
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PhotoUpload
                photoUrl={formData.photoUrl}
                onChange={(url) => handleInputChange('photoUrl', url)}
              />

              <SignaturePad
                signatureUrl={formData.signatureUrl}
                onChange={(url) => handleInputChange('signatureUrl', url)}
              />
            </div>
          </section>

          {/* ============================================================== */}
          {/* भाग 8: आदर्श आचारसंहिता, ठिकाण/दिनांक व हमीपत्र */}
          {/* ============================================================== */}
          <section id="field-agreedToTerms" className="bg-sky-50/50 border border-sky-200 rounded-xl p-5 sm:p-6 space-y-4">
            <h3 className="text-xl font-bold text-[#0f294a] font-noto">
              13. आदर्श आचारसंहिता व हमीपत्र
            </h3>
            <div className="bg-white p-4 rounded-lg border border-sky-200 text-slate-800 text-base leading-relaxed space-y-2">
              <p>
                मराठा सेवा संघाच्या आदर्श आचारसंहितेचे पालन करणे बंधनकारक राहील. राज्य/संबंधित कार्यकारिणीतील पदाचा कालावधी 3 वर्षांचा राहील. परंतु आचारसंहितेचे पालन न केल्यास पदाधिकाऱ्याला पदमुक्त करण्याचे सर्व अधिकार वरिष्ठ कार्यकारिणीला व केंद्रीय कार्यालयाला असतील.
              </p>
            </div>

            {/* ठिकाण व दिनांक */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              <div className="space-y-1.5">
                <label className="block text-base font-bold text-slate-900">
                  ठिकाण
                </label>
                <input
                  type="text"
                  value={formData.submissionPlace}
                  onChange={(e) => handleInputChange('submissionPlace', e.target.value)}
                  placeholder="उदा. पुणे / गाव"
                  className="w-full px-4 py-2.5 rounded-lg border border-sky-200 bg-white text-base font-semibold focus:outline-none focus:border-[#133b6e]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-base font-bold text-slate-900">
                  दिनांक
                </label>
                <input
                  type="text"
                  value={formData.submissionDate}
                  onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-sky-200 bg-white text-base font-mono font-bold focus:outline-none focus:border-[#133b6e]"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                className="w-6 h-6 accent-[#133b6e] rounded mt-0.5 flex-shrink-0"
              />
              <span className="text-lg font-bold text-slate-900">
                मी वरील सर्व नियम, अटी व आचारसंहिता वाचली असून मला ती मान्य आहे आणि मी माझी माहिती सत्य व अचूक भरली आहे. <span className="text-rose-600">*</span>
              </span>
            </label>
            {errors.agreedToTerms && (
              <p className="text-base text-rose-700 font-bold flex items-center gap-1">
                <AlertCircle className="w-5 h-5" /> {errors.agreedToTerms}
              </p>
            )}
          </section>

          {/* ============================================================== */}
          {/* सबमिट बटन */}
          {/* ============================================================== */}
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-base font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="pt-5 border-t border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-base text-slate-700 font-semibold">
              * चिन्हांकित माहिती भरणे अनिवार्य आहे.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-xl text-xl font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-6 h-6" />
              <span>{isSubmitting ? 'माहिती सबमिट होत आहे...' : 'अधिकृत अर्ज सबमिट करा'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
