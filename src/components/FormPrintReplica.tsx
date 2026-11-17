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
    <div className="print-modal-root fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#291003]/75 backdrop-blur-sm overflow-y-auto">
      <div className="print-modal-shell relative bg-white text-[#29150b] rounded-xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden my-auto border-2 border-[#c2410c]">
        {/* Modal Top Bar - Hidden in Print */}
        <div className="no-print bhagwa-texture-medium text-[#431407] px-4 py-2.5 flex items-center justify-between border-b border-[#e5ab75]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm sm:text-base font-noto text-[#5c1d05]">
              अधिकृत अर्ज प्रपत्र - {application.id || 'MSS-2026'}
            </span>
            <span className="text-xs bg-white/90 px-2.5 py-0.5 rounded text-[#7c2d12] border border-[#df9c5c] font-mono font-bold">
              {application.targetLevel} - {application.targetPost}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bhagwa-texture-deep hover:brightness-95 text-white rounded-md text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer border border-[#9a3412]"
            >
              <Printer className="w-4 h-4" />
              प्रिंट / PDF डाऊनलोड
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-[#7c2d12] hover:text-[#431407] p-1 rounded hover:bg-[#fed7aa] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Single-Page A4 Printable Document */}
        <div className="print-scroll-area flex-1 overflow-y-auto p-3 sm:p-5 bg-[#fff8f0]">
          <div
            id="printable-replica-document"
            className="bg-white max-w-[780px] mx-auto border-2 border-[#7c2d12] p-3.5 sm:p-4 shadow-sm text-[#29150b] text-xs font-['Noto_Sans_Devanagari','Mukta',sans-serif] leading-snug"
          >
            {/* Compact Header Ribbon */}
            <div className="bhagwa-texture-deep text-white px-3 py-1 rounded-xs flex items-center justify-between text-[11px] font-bold mb-2">
              <span>जय जिजाऊ !</span>
              <span>
                नोंदणी क्रमांक: <strong className="font-mono text-xs">{application.id || 'MSS-2026'}</strong>
              </span>
              <span>जय शिवराय !!</span>
            </div>

            {/* Portraits + Central Emblem + Title */}
            <div className="border-b-2 border-[#7c2d12] pb-2 mb-2 flex items-center justify-between gap-3">
              <div className="w-14 h-16 border border-[#df9c5c] p-0.5 bg-[#fff5e8] rounded-xs flex-shrink-0">
                <img
                  src={OFFICIAL_NOTICE.jijauPortraitPath}
                  alt="राजमाता जिजाऊ"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="text-center flex-1 leading-tight">
                <div className="w-11 h-11 mx-auto mb-0.5 flex items-center justify-center rounded-full overflow-hidden bg-white border border-[#df9c5c]">
                  <img
                    src={OFFICIAL_NOTICE.mssLogoPath}
                    alt="मराठा सेवा संघ लोगो"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#7c2d12] font-noto tracking-wide leading-none">
                  मराठा सेवा संघ
                </h2>
                <div className="mt-1 bhagwa-texture-medium text-[#431407] border border-[#df9c5c] font-bold text-[11px] py-0.5 px-3 rounded inline-block">
                  {bodyTitle}
                </div>
                <p className="text-[10px] text-[#7c2d12] mt-0.5 font-semibold">
                  संदर्भ पत्र: {OFFICIAL_NOTICE.letterNo} | दिनांक: {OFFICIAL_NOTICE.letterDate}
                </p>
              </div>

              <div className="w-14 h-16 border border-[#df9c5c] p-0.5 bg-[#fff5e8] rounded-xs flex-shrink-0">
                <img
                  src={OFFICIAL_NOTICE.shivajiPortraitPath}
                  alt="छत्रपती शिवाजी महाराज"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Compact Single-Page Official Details Table */}
            <div className="border border-[#7c2d12] divide-y divide-[#9a3412]/50 text-[11.5px]">
              {/* Row 1: कार्यकारिणी व इच्छुक पद */}
              <div className="flex bg-[#fff8ef]">
                <div className="w-40 flex-shrink-0 bhagwa-texture-medium px-2 py-1 font-bold text-[#431407] border-r border-[#7c2d12]/60">
                  कार्यकारिणी व पद
                </div>
                <div className="flex-1 px-2 py-1 flex flex-wrap gap-x-4 gap-y-0.5 items-center font-medium">
                  <span>स्तर: <strong>{application.targetLevel}</strong></span>
                  {application.targetLevel === 'विभागीय कार्यकारिणी' && application.division && (
                    <span>विभाग: <strong>{application.division}</strong></span>
                  )}
                  {application.targetDistrict && application.targetLevel === 'जिल्हा कार्यकारिणी' && (
                    <span>जिल्हा: <strong>{application.targetDistrict}</strong></span>
                  )}
                  {application.targetWing && application.targetLevel === 'इतर कक्ष कार्यकारिणी' && (
                    <span>कक्ष: <strong>{application.targetWing}</strong></span>
                  )}
                  <span>
                    08. इच्छुक पद: <strong className="text-[#9a3412] underline">{application.targetPost}</strong>
                  </span>
                </div>
              </div>

              {/* Row 2: 01. संपूर्ण नाव */}
              <div className="flex">
                <div className="w-40 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                  01. संपूर्ण नाव
                </div>
                <div className="flex-1 px-2 py-1 font-bold text-[#29150b] text-xs">
                  {application.fullName || '-'}
                </div>
              </div>

              {/* Row 3: 02. लिंग & 03. जन्म दिनांक व वय */}
              <div className="grid grid-cols-2 divide-x divide-[#7c2d12]/50">
                <div className="flex">
                  <div className="w-40 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                    02. लिंग
                  </div>
                  <div className="flex-1 px-2 py-1 flex gap-3 items-center font-semibold">
                    {(['पुरुष', 'स्त्री', 'इतर'] as const).map((g) => (
                      <span key={g} className="inline-flex items-center gap-1">
                        <span
                          className={`w-3.5 h-3.5 border border-[#7c2d12] rounded-xs inline-flex items-center justify-center text-[10px] font-bold ${
                            application.gender === g ? 'bg-[#c2410c] text-white' : ''
                          }`}
                        >
                          {application.gender === g ? '✓' : ''}
                        </span>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-32 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                    03. जन्म दिनांक / वय
                  </div>
                  <div className="flex-1 px-2 py-1 flex items-center justify-between gap-2">
                    <strong className="font-mono">{application.dob || '-'}</strong>
                    <span>
                      वय: <strong>{application.age ? `${application.age} वर्षे` : '-'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: 04. मोबाईल नं. & 05. ई मेल */}
              <div className="grid grid-cols-2 divide-x divide-[#7c2d12]/50">
                <div className="flex">
                  <div className="w-40 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                    04. मोबाईल नं.
                  </div>
                  <div className="flex-1 px-2 py-1 font-mono font-bold">
                    {application.mobile || '-'}
                    {application.alternateMobile ? ` / ${application.alternateMobile}` : ''}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-32 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                    05. ई-मेल
                  </div>
                  <div className="flex-1 px-2 py-1 font-mono truncate">
                    {application.email || '-'}
                  </div>
                </div>
              </div>

              {/* Row 5: 06. कायमचा पत्ता */}
              <div className="flex">
                <div className="w-40 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                  06. कायमचा पत्ता
                </div>
                <div className="flex-1 px-2 py-1 grid grid-cols-3 gap-x-3 gap-y-0.5 text-[11px]">
                  <div>
                    <span className="text-[#7c2d12]">घर नं: </span>
                    <strong>{application.houseNo || '-'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#7c2d12]">गल्ली/नगर: </span>
                    <strong>{application.street || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[#7c2d12]">गाव/शहर: </span>
                    <strong>{application.village || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[#7c2d12]">पोस्ट: </span>
                    <span>{application.post || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[#7c2d12]">तालुका: </span>
                    <span>{application.taluka || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[#7c2d12]">जिल्हा: </span>
                    <strong>{application.district || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[#7c2d12]">पिन कोड: </span>
                    <strong className="font-mono">{application.pincode || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* Row 6: 07. व्यवसाय */}
              <div className="flex">
                <div className="w-40 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                  07. व्यवसाय
                </div>
                <div className="flex-1 px-2 py-1 flex flex-wrap items-center gap-3">
                  <span className="bg-[#ffedd5] px-2 py-0.5 rounded font-bold text-[#5c1d05] border border-[#df9c5c]">
                    {application.occupationType}
                  </span>
                  <span>
                    <span className="text-[#7c2d12]">पदनाम / स्वरूप: </span>
                    <strong>{application.designationOrBusiness || '-'}</strong>
                  </span>
                </div>
              </div>

              {/* Row 7: 09. आजीवन सभासदत्व & 10. राजकीय सक्रियता */}
              <div className="grid grid-cols-2 divide-x divide-[#7c2d12]/50">
                <div className="flex">
                  <div className="w-40 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                    09. आजीवन सभासद
                  </div>
                  <div className="flex-1 px-2 py-1">
                    <strong>{application.isLifeMember ? 'होय' : 'नाही'}</strong>
                    {application.isLifeMember && (
                      <span className="ml-2 text-[10.5px]">
                        (क्र: <strong className="font-mono">{application.lifeMemberNo || '-'}</strong>, पासून: {application.lifeMemberSince || '-'})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-32 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                    10. राजकीय सक्रियता
                  </div>
                  <div className="flex-1 px-2 py-1">
                    <strong>{application.isPoliticalActive ? 'होय' : 'नाही'}</strong>
                    {application.isPoliticalActive && (
                      <span className="ml-2 text-[10.5px]">
                        ({application.politicalParty || '-'} - {application.politicalDesignation || '-'})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 8: 11. मासिक योगदान & 12. पद्धत */}
              <div className="grid grid-cols-2 divide-x divide-[#7c2d12]/50">
                <div className="flex">
                  <div className="w-40 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                    11. मासिक योगदान
                  </div>
                  <div className="flex-1 px-2 py-1">
                    {application.monthlyContribution ? (
                      <strong className="font-mono text-[#9a3412]">
                        रु. {application.monthlyContribution}/-
                      </strong>
                    ) : (
                      <span className="text-[#8c5a3c] italic">ऐच्छिक</span>
                    )}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-32 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                    12. जमा पद्धत
                  </div>
                  <div className="flex-1 px-2 py-1">
                    <strong className="text-[#5c1d05] bg-[#ffedd5] px-2 py-0.5 rounded border border-[#df9c5c]">
                      {application.paymentFrequency || 'सहामाही'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Row 9: 13. आदर्श आचारसंहिता */}
              <div className="flex bg-[#fffaf4]">
                <div className="w-40 flex-shrink-0 bg-[#fff3e4] px-2 py-1 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60">
                  13. आदर्श आचारसंहिता
                </div>
                <div className="flex-1 px-2 py-1 text-[10.5px] leading-snug">
                  मराठा सेवा संघाच्या आदर्श आचार संहितेचे पालन करणे मजवर बंधनकारक राहील. पदाचा कालावधी 3 वर्षांचा राहील; आचारसंहिता भंग झाल्यास पदमुक्त करण्याचे अधिकार कार्यकारिणीला असतील.{' '}
                  <strong className="text-[#9a3412]">[✓] हमीपत्र मान्य आहे.</strong>
                </div>
              </div>
            </div>

            {/* Compact Photo, Place/Date & Signature Strip */}
            <div className="mt-2 pt-2 border-t border-[#7c2d12] flex items-end justify-between gap-4">
              <div className="flex items-end gap-3">
                <div className="w-16 h-20 border border-[#7c2d12] bg-[#fff8f0] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {application.photoUrl ? (
                    <img
                      src={application.photoUrl}
                      alt="अर्जदार फोटो"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-[#8c5a3c] font-bold text-center p-1">
                      फोटो
                    </span>
                  )}
                </div>
                <div className="text-[11px] space-y-0.5 text-[#431407]">
                  <div>
                    ठिकाण: <strong>{application.submissionPlace || application.village || '-'}</strong>
                  </div>
                  <div>
                    दिनांक: <strong className="font-mono">{application.submissionDate}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="w-40 h-14 border-b border-[#7c2d12] flex items-center justify-center p-0.5 bg-[#fffaf4]">
                  {application.signatureUrl ? (
                    <img
                      src={application.signatureUrl}
                      alt="स्वाक्षरी"
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-[#8c5a3c]">स्वाक्षरी</span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-[#5c1d05] mt-0.5 block">
                  अर्जदाराची स्वाक्षरी ({application.fullName || 'अर्जदार'})
                </span>
              </div>
            </div>

            {/* Family Members Table on the SAME A4 Page (Zero page-break) */}
            <div className="mt-2 pt-2 border-t border-dashed border-[#c2410c]/70">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-xs font-noto text-[#7c2d12]">
                  ❖ कौटुंबिक माहिती ❖
                </h3>
                <span className="text-[10.5px] text-[#7c2d12] font-medium">
                  अर्जदार: {application.fullName} | नोंदणी क्र. {application.id || 'MSS-2026'}
                </span>
              </div>

              <table className="w-full text-left text-[10.5px] border border-[#7c2d12] border-collapse">
                <thead>
                  <tr className="bhagwa-texture-medium border-b border-[#7c2d12] text-[#431407] font-bold">
                    <th className="px-1.5 py-1 text-center w-10 border-r border-[#7c2d12]/60">अ.क्र.</th>
                    <th className="px-1.5 py-1 border-r border-[#7c2d12]/60">कुटुंबातील सदस्याचे संपूर्ण नाव</th>
                    <th className="px-1.5 py-1 border-r border-[#7c2d12]/60">नाते</th>
                    <th className="px-1.5 py-1 border-r border-[#7c2d12]/60">जन्म दिनांक / वय</th>
                    <th className="px-1.5 py-1 border-r border-[#7c2d12]/60">व्यवसाय</th>
                    <th className="px-1.5 py-1">शिक्षण</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7c2d12]/40 font-medium">
                  {application.familyMembers && application.familyMembers.length > 0 ? (
                    application.familyMembers.map((m, idx) => (
                      <tr key={m.id || idx}>
                        <td className="px-1.5 py-0.5 text-center font-bold border-r border-[#7c2d12]/50">
                          {idx + 1}
                        </td>
                        <td className="px-1.5 py-0.5 font-bold text-[#29150b] border-r border-[#7c2d12]/50">
                          {m.fullName || '-'}
                        </td>
                        <td className="px-1.5 py-0.5 border-r border-[#7c2d12]/50">{m.relation || '-'}</td>
                        <td className="px-1.5 py-0.5 border-r border-[#7c2d12]/50">{m.dob || '-'}</td>
                        <td className="px-1.5 py-0.5 border-r border-[#7c2d12]/50">{m.occupation || '-'}</td>
                        <td className="px-1.5 py-0.5">{m.education || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-2 py-1.5 text-center text-[#8c5a3c] italic">
                        कोणतीही कौटुंबिक माहिती नोंदवलेली नाही.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#7c2d12] font-bold">
                <span>मराठा सेवा संघ केंद्रीय कार्यालय, महाराष्ट्र</span>
                <span>सचिव कार्यालय: {OFFICIAL_NOTICE.secretaryName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar - Hidden in Print */}
        <div className="no-print bhagwa-texture-soft px-6 py-3 border-t border-[#e9bd92] flex items-center justify-between">
          <span className="text-xs sm:text-sm text-[#5c1d05] font-medium">
            टीप: &apos;प्रिंट / PDF डाऊनलोड&apos; वर क्लिक करून संपूर्ण अर्ज एकाच A4 पानावर सेव्ह करा.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bhagwa-texture-deep hover:brightness-95 text-white rounded-md text-sm font-bold transition-all cursor-pointer border border-[#9a3412]"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
};
