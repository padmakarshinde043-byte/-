import React, { useEffect } from 'react';
import { ApplicationFormData } from '../types/index';
import { OFFICIAL_NOTICE } from '../utils/constants';
import { Printer, X } from 'lucide-react';

interface FormPrintReplicaProps {
  application: ApplicationFormData;
  onClose: () => void;
}

export const FormPrintReplica: React.FC<FormPrintReplicaProps> = ({ application, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const bodyTitle =
    application.targetLevel === 'इतर कक्ष कार्यकारिणी'
      ? `${application.targetWing} इच्छुक पदाधिकारी माहिती`
      : `${application.targetLevel}वर इच्छुक पदाधिकारी माहिती`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white text-slate-900 rounded-xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-sky-300">
        {/* Modal Bar - Hidden in Print */}
        <div className="no-print bg-sky-50 text-[#0f294a] px-4 py-3 flex items-center justify-between border-b border-sky-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm sm:text-base font-noto">
              अधिकृत अर्ज प्रपत्र - {application.id || 'MSS-2026'}
            </span>
            <span className="text-xs bg-sky-100 px-2.5 py-0.5 rounded text-[#0f294a] border border-sky-300 font-mono font-semibold">
              {application.targetLevel} - {application.targetPost}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              प्रिंट / PDF डाऊनलोड
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-[#133b6e] hover:text-[#091e3a] p-1 rounded hover:bg-sky-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-sky-50/60">
          <div
            id="printable-replica-document"
            className="bg-white max-w-[800px] mx-auto border-2 border-slate-800 p-6 sm:p-8 shadow-sm text-slate-900 text-sm sm:text-base font-['Noto_Sans_Devanagari','Mukta',sans-serif] leading-relaxed"
          >
            {/* Header: Jijau (Left) - Logo (Center) - Shivaji Maharaj (Right) */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 mb-2">
                <span>जय जिजाऊ !</span>
                <span className="text-slate-800">
                  नोंदणी क्रमांक: <strong className="text-slate-950 font-mono text-base">{application.id || 'MSS-2026'}</strong>
                </span>
                <span>जय शिवराय !!</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Jijau Portrait */}
                <div className="w-20 h-24 sm:w-24 sm:h-28 border border-sky-300 p-0.5 flex flex-col items-center justify-center bg-sky-50/40 rounded">
                  <img
                    src={OFFICIAL_NOTICE.jijauPortraitPath}
                    alt="राजमाता जिजाऊ"
                    className="w-full h-full object-cover object-top rounded-xs"
                  />
                </div>

                {/* Central Emblem & Title */}
                <div className="text-center flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-1 flex items-center justify-center rounded-full overflow-hidden bg-white">
                    <img
                      src={OFFICIAL_NOTICE.mssLogoPath}
                      alt="मराठा सेवा संघ लोगो"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f294a] font-noto tracking-wide">
                    मराठा सेवा संघ
                  </h2>
                  <div className="mt-1.5 bg-sky-100 text-[#0f294a] border border-sky-300 font-bold text-sm sm:text-base py-1 px-4 rounded inline-block tracking-wide">
                    {bodyTitle}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    संदर्भ पत्र: {OFFICIAL_NOTICE.letterNo} | दिनांक: {OFFICIAL_NOTICE.letterDate}
                  </p>
                </div>

                {/* Shivaji Maharaj Portrait */}
                <div className="w-20 h-24 sm:w-24 sm:h-28 border border-sky-300 p-0.5 flex flex-col items-center justify-center bg-sky-50/40 rounded">
                  <img
                    src={OFFICIAL_NOTICE.shivajiPortraitPath}
                    alt="छत्रपती शिवाजी महाराज"
                    className="w-full h-full object-cover object-top rounded-xs"
                  />
                </div>
              </div>
            </div>

            {/* Official Table */}
            <div className="border border-slate-700 divide-y divide-slate-700 text-sm sm:text-base">
              {/* कार्यकारिणी स्तर व पद */}
              <div className="flex flex-col sm:flex-row bg-sky-50/60 font-semibold">
                <div className="w-full sm:w-56 bg-sky-100/80 p-3 font-bold text-[#0f294a] border-b sm:border-b-0 sm:border-r border-slate-700">
                  कार्यकारिणी व इच्छुक पद
                </div>
                <div className="flex-1 p-3 flex flex-wrap gap-4 items-center">
                  <span>स्तर: <strong>{application.targetLevel}</strong></span>
                  {application.division && <span>विभाग: <strong>{application.division}</strong></span>}
                  {application.targetDistrict && application.targetLevel === 'जिल्हा कार्यकारिणी' && (
                    <span>जिल्हा: <strong>{application.targetDistrict}</strong></span>
                  )}
                  {application.targetWing && application.targetLevel === 'इतर कक्ष कार्यकारिणी' && (
                    <span>कक्ष: <strong>{application.targetWing}</strong></span>
                  )}
                  <span>08. इच्छुक पद: <strong className="text-[#133b6e] underline">{application.targetPost}</strong></span>
                </div>
              </div>

              {/* 01. संपूर्ण नाव */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  01. संपूर्ण नाव
                </div>
                <div className="flex-1 p-3 font-bold text-slate-900 text-base">
                  {application.fullName || '-'}
                </div>
              </div>

              {/* 02. लिंग */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  02. लिंग
                </div>
                <div className="flex-1 p-3 flex gap-8 items-center font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-4 h-4 border border-slate-700 rounded-xs inline-flex items-center justify-center text-xs font-bold ${application.gender === 'पुरुष' ? 'bg-[#133b6e] text-white' : ''}`}>
                      {application.gender === 'पुरुष' ? '✓' : ''}
                    </span>
                    पुरुष
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-4 h-4 border border-slate-700 rounded-xs inline-flex items-center justify-center text-xs font-bold ${application.gender === 'स्त्री' ? 'bg-[#133b6e] text-white' : ''}`}>
                      {application.gender === 'स्त्री' ? '✓' : ''}
                    </span>
                    स्त्री
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-4 h-4 border border-slate-700 rounded-xs inline-flex items-center justify-center text-xs font-bold ${application.gender === 'इतर' ? 'bg-[#133b6e] text-white' : ''}`}>
                      {application.gender === 'इतर' ? '✓' : ''}
                    </span>
                    इतर
                  </span>
                </div>
              </div>

              {/* 03. जन्म दिनांक व वय */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  03. जन्म दिनांक व वय
                </div>
                <div className="flex-1 p-3 flex items-center justify-between font-medium">
                  <div>
                    <span className="text-slate-600">जन्म दिनांक: </span>
                    <strong className="text-slate-900 font-mono">{application.dob || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600">वय: </span>
                    <strong className="text-slate-900">{application.age ? `${application.age} वर्षे` : '-'}</strong>
                  </div>
                </div>
              </div>

              {/* 04. मोबाईल नं. */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  04. मोबाईल नं.
                </div>
                <div className="flex-1 p-3 flex flex-wrap gap-4 items-center">
                  <span className="font-mono font-bold text-slate-900 text-base">{application.mobile || '-'}</span>
                  {application.alternateMobile && (
                    <span className="text-slate-600 text-sm">
                      पर्यायी: <span className="font-mono">{application.alternateMobile}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 05. ई मेल */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  05. ई मेल
                </div>
                <div className="flex-1 p-3 font-mono text-slate-900">
                  {application.email || '-'}
                </div>
              </div>

              {/* 06. कायमचा पत्ता */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  06. कायमचा पत्ता
                </div>
                <div className="flex-1 p-3 space-y-1">
                  <div className="grid grid-cols-2 gap-3 text-sm sm:text-base font-medium">
                    <div>
                      <span className="text-slate-600">घर नं: </span>
                      <span>{application.houseNo || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">गल्ली/नगर/कॉलोनी: </span>
                      <span>{application.street || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">गाव/शहर: </span>
                      <strong className="text-slate-900">{application.village || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600">पोस्ट: </span>
                      <span>{application.post || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">तालुका: </span>
                      <span>{application.taluka || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">जिल्हा: </span>
                      <strong className="text-slate-900">{application.district || '-'}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-600">पिन कोड: </span>
                      <strong className="font-mono">{application.pincode || '-'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 07. व्यवसाय */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  07. व्यवसाय
                </div>
                <div className="flex-1 p-3 space-y-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-sky-100 px-2.5 py-1 rounded font-semibold text-[#0f294a] text-sm border border-sky-200">
                      {application.occupationType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 text-sm">सेवेतील पदनाम / व्यवसायाचे नाव: </span>
                    <strong className="text-slate-900">{application.designationOrBusiness || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* 09. आजीवन सभासदत्व */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  09. आजीवन सभासदत्व
                </div>
                <div className="flex-1 p-3 flex flex-wrap items-center gap-6 font-medium">
                  <div>
                    <span className="text-slate-600">आजीवन सभासद: </span>
                    <strong>{application.isLifeMember ? 'होय' : 'नाही'}</strong>
                  </div>
                  {application.isLifeMember && (
                    <>
                      <div>
                        <span className="text-slate-600">सभासद क्र: </span>
                        <strong className="font-mono">{application.lifeMemberNo || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-600">केव्हापासून: </span>
                        <span>{application.lifeMemberSince || '-'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 10. राजकीय सक्रियता */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  10. राजकीय सक्रियता
                </div>
                <div className="flex-1 p-3 flex flex-wrap items-center gap-6 font-medium">
                  <div>
                    <span className="text-slate-600">सक्रिय: </span>
                    <strong>{application.isPoliticalActive ? 'होय' : 'नाही'}</strong>
                  </div>
                  {application.isPoliticalActive && (
                    <>
                      <div>
                        <span className="text-slate-600">पक्ष: </span>
                        <strong>{application.politicalParty || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-600">पदनाम: </span>
                        <span>{application.politicalDesignation || '-'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 11. मासिक योगदान */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  11. मासिक योगदान संकल्प
                </div>
                <div className="flex-1 p-3">
                  {application.monthlyContribution ? (
                    <>
                      स्वैच्छिक योगदान रक्कम:{' '}
                      <strong className="text-base font-bold text-slate-900 underline font-mono">
                        रु. {application.monthlyContribution}/-
                      </strong>
                    </>
                  ) : (
                    <span className="text-slate-500 italic">ऐच्छिक</span>
                  )}
                </div>
              </div>

              {/* 12. योगदान पद्धत */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  12. योगदान जमा पद्धत
                </div>
                <div className="flex-1 p-3">
                  कबुल केलेले आर्थिक योगदान पद्धत:{' '}
                  <strong className="text-[#0f294a] bg-sky-100 px-2.5 py-1 rounded font-semibold border border-sky-200">
                    {application.paymentFrequency || 'सहामाही'}
                  </strong>
                </div>
              </div>

              {/* 13. आचारसंहिता */}
              <div className="flex flex-col sm:flex-row bg-sky-50/40">
                <div className="w-full sm:w-56 bg-slate-100 p-3 font-bold border-b sm:border-b-0 sm:border-r border-slate-700">
                  13. आदर्श आचारसंहिता
                </div>
                <div className="flex-1 p-3 text-xs sm:text-sm text-slate-800 leading-normal font-medium">
                  मराठा सेवा संघाच्या आदर्श आचार संहितेचे पालन करणे मजवर बंधनकारक राहील. कार्यकारिणीतील पदाचा कालावधी 3 वर्षांचा राहील. परंतु आचार संहितेचे पालन न केल्यास पदमुक्त करण्याचे सर्व अधिकार कार्यकारिणीला असतील.
                  <div className="mt-1.5 font-bold text-[#0f294a]">
                    [✓] अर्जदाराने हमीपत्र वाचून मान्य केले आहे.
                  </div>
                </div>
              </div>
            </div>

            {/* Photo & Signature Section */}
            <div className="mt-6 pt-6 border-t-2 border-slate-800 grid grid-cols-2 gap-6 items-end">
              <div>
                <div className="w-28 h-36 sm:w-32 sm:h-40 border-2 border-slate-800 bg-sky-50/40 flex items-center justify-center overflow-hidden">
                  {application.photoUrl ? (
                    <img
                      src={application.photoUrl}
                      alt="अर्जदार फोटो"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-500 font-bold text-center p-2">
                      फोटो
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-700 mt-1.5">
                  ठिकाण: <strong>{application.submissionPlace || application.village}</strong>
                </div>
                <div className="text-xs text-slate-700">
                  दिनांक: <strong>{application.submissionDate}</strong>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="w-48 sm:w-56 h-24 border-b-2 border-slate-800 flex items-center justify-center p-1 bg-sky-50/30">
                  {application.signatureUrl ? (
                    <img
                      src={application.signatureUrl}
                      alt="स्वाक्षरी"
                      className="max-h-20 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">स्वाक्षरी</span>
                  )}
                </div>
                <span className="text-sm font-bold text-slate-900 mt-1.5 block">
                  अर्जदाराची स्वाक्षरी
                </span>
                <span className="text-xs text-slate-700 block font-medium">
                  {application.fullName}
                </span>
              </div>
            </div>

            {/* Page 2: कौटुंबिक माहिती तक्ता */}
            <div className="page-break mt-10 pt-8 border-t-2 border-dashed border-sky-300">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg font-noto text-[#0f294a]">
                  ❖ कौटुंबिक माहिती ❖
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                  अर्जदार: {application.fullName} | नोंदणी क्र. {application.id || 'MSS-2026'}
                </p>
              </div>

              <table className="w-full text-left text-sm border border-slate-700 border-collapse">
                <thead>
                  <tr className="bg-sky-100/80 border-b border-slate-700 text-[#0f294a] font-bold">
                    <th className="p-2 text-center w-14 border-r border-slate-700">अ.क्र.</th>
                    <th className="p-2 border-r border-slate-700">कुटूंबातील सदस्याचे संपूर्ण नाव</th>
                    <th className="p-2 border-r border-slate-700">नाते</th>
                    <th className="p-2 border-r border-slate-700">जन्म दिनांक / वय</th>
                    <th className="p-2 border-r border-slate-700">व्यवसाय</th>
                    <th className="p-2">शिक्षण</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 font-medium">
                  {application.familyMembers && application.familyMembers.length > 0 ? (
                    application.familyMembers.map((m, idx) => (
                      <tr key={m.id || idx}>
                        <td className="p-2 text-center font-bold border-r border-slate-700">
                          {idx + 1}
                        </td>
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-700">
                          {m.fullName || '-'}
                        </td>
                        <td className="p-2 border-r border-slate-700">{m.relation || '-'}</td>
                        <td className="p-2 border-r border-slate-700">{m.dob || '-'}</td>
                        <td className="p-2 border-r border-slate-700">{m.occupation || '-'}</td>
                        <td className="p-2">{m.education || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                        कोणतीही माहिती नोंदवलेली नाही.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="mt-10 text-right text-xs sm:text-sm text-slate-700 font-semibold">
                <p>मराठा सेवा संघ केंद्रीय कार्यालय, महाराष्ट्र</p>
                <p>सचिव कार्यालय: {OFFICIAL_NOTICE.secretaryName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="no-print bg-sky-50 px-6 py-4 border-t border-sky-200 flex items-center justify-between">
          <span className="text-sm text-[#0f294a] font-medium">
            टीप: 'प्रिंट / PDF डाऊनलोड' वर क्लिक करून आपण संपूर्ण मूळ फॉर्म सेव्ह करू शकता.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-md text-sm font-semibold transition-colors cursor-pointer"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
};
