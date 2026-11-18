import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ApplicationFormData } from '../types/index';
import { OFFICIAL_NOTICE } from '../utils/constants';
import { Download, X, Loader2 } from 'lucide-react';

interface FormPrintReplicaProps {
  application: ApplicationFormData;
  onClose: () => void;
}

interface ReplicaDocumentBodyProps {
  application: ApplicationFormData;
  isFixedA4?: boolean;
  id?: string;
}

const ReplicaDocumentBody: React.FC<ReplicaDocumentBodyProps> = ({
  application,
  isFixedA4 = false,
  id,
}) => {
  const bodyTitle =
    application.targetLevel === 'इतर कक्ष कार्यकारिणी'
      ? `${application.targetWing} इच्छुक पदाधिकारी माहिती`
      : `${application.targetLevel}वर इच्छुक पदाधिकारी माहिती`;

  const rowPairClass = isFixedA4
    ? 'grid grid-cols-2 divide-x divide-[#7c2d12]/50'
    : 'print-a4-grid-2 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#7c2d12]/50';

  const labelColClass = isFixedA4
    ? 'w-40 flex-shrink-0 bg-[#fff3e4] px-3.5 py-2.5 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60 flex items-center text-sm sm:text-base'
    : 'w-36 sm:w-40 flex-shrink-0 bg-[#fff3e4] px-3 py-2 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60 flex items-center text-sm sm:text-base';

  const halfLabelClass = isFixedA4
    ? 'w-40 flex-shrink-0 bg-[#fff3e4] px-3.5 py-2.5 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60 flex items-center text-sm sm:text-base'
    : 'w-36 sm:w-40 flex-shrink-0 bg-[#fff3e4] px-3 py-2 font-bold text-[#5c1d05] border-r border-[#7c2d12]/60 flex items-center text-sm sm:text-base';

  const addressGridClass = isFixedA4
    ? 'grid grid-cols-3 gap-x-3 gap-y-2 text-sm sm:text-base'
    : 'print-a4-grid-3 grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-sm sm:text-base';

  const photoSignRowClass = isFixedA4
    ? 'mt-4 pt-3.5 border-t border-[#7c2d12] flex flex-row items-end justify-between gap-4'
    : 'print-a4-row-between mt-3 pt-2.5 border-t border-[#7c2d12] flex flex-col sm:flex-row sm:items-end justify-between gap-3';

  return (
    <div
      id={id}
      style={{
        colorScheme: 'light',
        backgroundColor: '#ffffff',
        color: '#29150b',
        width: isFixedA4 ? '720px' : undefined,
        minHeight: isFixedA4 ? '1180px' : undefined,
        boxSizing: 'border-box',
      }}
      className={`bg-white ${
        isFixedA4 ? 'p-5 sm:p-6' : 'max-w-[720px] mx-auto p-3 sm:p-5'
      } border-2 border-[#7c2d12] shadow-sm text-[#29150b] text-sm sm:text-base font-['Noto_Sans_Devanagari','Mukta',sans-serif] leading-relaxed space-y-3.5`}
    >
      {/* Compact Header Ribbon */}
      <div className="bhagwa-texture-deep text-white px-4 py-2.5 rounded-xs flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm sm:text-base font-bold mb-3.5">
        <span className="whitespace-nowrap">जय जिजाऊ !</span>
        <span className="text-center">
          नोंदणी क्रमांक:{' '}
          <strong className="font-mono text-base sm:text-lg whitespace-nowrap">
            {application.id || 'MSS-2026'}
          </strong>
        </span>
        <span className="whitespace-nowrap">जय शिवराय !!</span>
      </div>

      {/* Portraits + Central Emblem + Title */}
      <div className="border-b-2 border-[#7c2d12] pb-4 mb-4 flex items-center justify-between gap-3.5">
        {/* Jijau Portrait */}
        <div className="w-20 h-24 sm:w-24 sm:h-28 border border-[#df9c5c] p-0.5 bg-[#fff5e8] rounded-xs flex-shrink-0 shadow-xs">
          <img
            src={OFFICIAL_NOTICE.jijauPortraitPath}
            alt="राजमाता जिजाऊ"
            className="w-full h-full object-cover object-top"
          />
        </div>

        <div className="text-center flex-1 min-w-0 leading-tight">
          {/* MSS Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 flex items-center justify-center rounded-full overflow-hidden bg-white border-2 border-[#df9c5c] shadow-xs">
            <img
              src={OFFICIAL_NOTICE.mssLogoPath}
              alt="मराठा सेवा संघ लोगो"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#7c2d12] font-noto tracking-wide leading-tight">
            मराठा सेवा संघ
          </h2>
          <div className="mt-2 bhagwa-texture-medium text-[#431407] border border-[#df9c5c] font-bold text-sm sm:text-base py-1.5 px-5 rounded inline-block max-w-full">
            {bodyTitle}
          </div>
          <p className="text-sm text-[#7c2d12] mt-1.5 font-semibold">
            संदर्भ पत्र: {OFFICIAL_NOTICE.letterNo} | दिनांक: {OFFICIAL_NOTICE.letterDate}
          </p>
        </div>

        {/* Shivaji Maharaj Portrait */}
        <div className="w-20 h-24 sm:w-24 sm:h-28 border border-[#df9c5c] p-0.5 bg-[#fff5e8] rounded-xs flex-shrink-0 shadow-xs">
          <img
            src={OFFICIAL_NOTICE.shivajiPortraitPath}
            alt="छत्रपती शिवाजी महाराज"
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>

      {/* Official Details Table */}
      <div className="border border-[#7c2d12] divide-y divide-[#9a3412]/50 text-sm sm:text-base mb-4">
        {/* Row 1: कार्यकारिणी व इच्छुक पद */}
        <div className="flex bg-[#fff8ef]">
          <div className={`${labelColClass} bhagwa-texture-medium text-[#431407]`}>
            कार्यकारिणी व पद
          </div>
          <div className="flex-1 min-w-0 px-3.5 py-3 flex flex-wrap gap-x-4 gap-y-1.5 items-center font-medium">
            <span>
              स्तर: <strong>{application.targetLevel}</strong>
            </span>
            {application.targetLevel === 'विभागीय कार्यकारिणी' && application.division && (
              <span>
                विभाग: <strong>{application.division}</strong>
              </span>
            )}
            {application.targetDistrict && application.targetLevel === 'जिल्हा कार्यकारिणी' && (
              <span>
                जिल्हा: <strong>{application.targetDistrict}</strong>
              </span>
            )}
            {application.targetWing && application.targetLevel === 'इतर कक्ष कार्यकारिणी' && (
              <span>
                कक्ष: <strong>{application.targetWing}</strong>
              </span>
            )}
            <span>
              08. इच्छुक पद:{' '}
              <strong className="text-[#9a3412] underline">{application.targetPost}</strong>
            </span>
          </div>
        </div>

        {/* Row 2: 01. संपूर्ण नाव */}
        <div className="flex">
          <div className={labelColClass}>01. संपूर्ण नाव</div>
          <div className="flex-1 min-w-0 px-3.5 py-3 font-bold text-[#29150b] text-base sm:text-lg break-words flex items-center">
            {application.fullName || '-'}
          </div>
        </div>

        {/* Row 3: 02. लिंग & 03. जन्म दिनांक व वय */}
        <div className={rowPairClass}>
          <div className="flex min-w-0">
            <div className={labelColClass}>02. लिंग</div>
            <div className="flex-1 min-w-0 px-3.5 py-3 flex flex-wrap gap-x-3.5 gap-y-1.5 items-center font-semibold">
              {(['पुरुष', 'स्त्री', 'इतर'] as const).map((g) => (
                <span key={g} className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span
                    className={`w-4.5 h-4.5 border border-[#7c2d12] rounded-xs inline-flex items-center justify-center text-xs font-bold ${
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
          <div className="flex min-w-0">
            <div className={halfLabelClass}>03. जन्म दिनांक / वय</div>
            <div className="flex-1 min-w-0 px-3.5 py-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
              <strong className="font-mono whitespace-nowrap text-base sm:text-lg">{application.dob || '-'}</strong>
              <span className="whitespace-nowrap">
                वय: <strong>{application.age ? `${application.age} वर्षे` : '-'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Row 4: 04. मोबाईल नं. & 05. ई मेल */}
        <div className={rowPairClass}>
          <div className="flex min-w-0">
            <div className={labelColClass}>04. मोबाईल नं.</div>
            <div className="flex-1 min-w-0 px-3.5 py-3 font-mono font-bold break-all flex items-center text-base sm:text-lg">
              {application.mobile || '-'}
              {application.alternateMobile ? ` / ${application.alternateMobile}` : ''}
            </div>
          </div>
          <div className="flex min-w-0">
            <div className={halfLabelClass}>05. ई-मेल</div>
            <div className="flex-1 min-w-0 px-3.5 py-3 font-mono break-all flex items-center text-sm sm:text-base">
              {application.email || '-'}
            </div>
          </div>
        </div>

        {/* Row 5: 06. कायमचा पत्ता */}
        <div className="flex">
          <div className={labelColClass}>06. कायमचा पत्ता</div>
          <div className={`flex-1 min-w-0 px-3.5 py-3 ${addressGridClass}`}>
            <div className="min-w-0 break-words">
              <span className="text-[#7c2d12]">घर नं: </span>
              <strong>{application.houseNo || '-'}</strong>
            </div>
            <div className={isFixedA4 ? 'col-span-2 min-w-0 break-words' : 'sm:col-span-2 min-w-0 break-words'}>
              <span className="text-[#7c2d12]">गल्ली/नगर: </span>
              <strong>{application.street || '-'}</strong>
            </div>
            <div className="min-w-0 break-words">
              <span className="text-[#7c2d12]">गाव/शहर: </span>
              <strong>{application.village || '-'}</strong>
            </div>
            <div className="min-w-0 break-words">
              <span className="text-[#7c2d12]">पोस्ट: </span>
              <span>{application.post || '-'}</span>
            </div>
            <div className="min-w-0 break-words">
              <span className="text-[#7c2d12]">तालुका: </span>
              <span>{application.taluka || '-'}</span>
            </div>
            <div className="min-w-0 break-words">
              <span className="text-[#7c2d12]">जिल्हा: </span>
              <strong>{application.district || '-'}</strong>
            </div>
            <div className="min-w-0 break-words">
              <span className="text-[#7c2d12]">पिन कोड: </span>
              <strong className="font-mono">{application.pincode || '-'}</strong>
            </div>
          </div>
        </div>

        {/* Row 6: 07. व्यवसाय */}
        <div className="flex">
          <div className={labelColClass}>07. व्यवसाय</div>
          <div className="flex-1 min-w-0 px-3.5 py-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
            <span className="bg-[#ffedd5] px-3.5 py-1.5 rounded font-bold text-[#5c1d05] border border-[#df9c5c]">
              {application.occupationType}
            </span>
            <span className="min-w-0 break-words">
              <span className="text-[#7c2d12]">पदनाम / स्वरूप: </span>
              <strong>{application.designationOrBusiness || '-'}</strong>
            </span>
          </div>
        </div>

        {/* Row 7: 09. आजीवन सभासदत्व & 10. राजकीय सक्रियता */}
        <div className={rowPairClass}>
          <div className="flex min-w-0">
            <div className={labelColClass}>09. आजीवन सभासद</div>
            <div className="flex-1 min-w-0 px-3.5 py-3 break-words flex items-center">
              <div>
                <strong>{application.isLifeMember ? 'होय' : 'नाही'}</strong>
                {application.isLifeMember && (
                  <span className="ml-1.5 text-sm sm:text-base">
                    (क्र: <strong className="font-mono">{application.lifeMemberNo || '-'}</strong>, पासून:{' '}
                    {application.lifeMemberSince || '-'})
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex min-w-0">
            <div className={halfLabelClass}>10. राजकीय सक्रियता</div>
            <div className="flex-1 min-w-0 px-3.5 py-3 break-words flex items-center">
              <div>
                <strong>{application.isPoliticalActive ? 'होय' : 'नाही'}</strong>
                {application.isPoliticalActive && (
                  <span className="ml-1.5 text-sm sm:text-base">
                    ({application.politicalParty || '-'} - {application.politicalDesignation || '-'})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 8: 11. मासिक योगदान & 12. पद्धत */}
        <div className={rowPairClass}>
          <div className="flex min-w-0">
            <div className={labelColClass}>11. मासिक योगदान</div>
            <div className="flex-1 min-w-0 px-3.5 py-3 flex items-center">
              {application.monthlyContribution ? (
                <strong className="font-mono text-[#9a3412] text-base sm:text-lg">
                  रु. {application.monthlyContribution}/-
                </strong>
              ) : (
                <span className="text-[#8c5a3c] italic">ऐच्छिक</span>
              )}
            </div>
          </div>
          <div className="flex min-w-0">
            <div className={halfLabelClass}>12. जमा पद्धत</div>
            <div className="flex-1 min-w-0 px-3.5 py-3 flex items-center">
              <strong className="text-[#5c1d05] bg-[#ffedd5] px-3.5 py-1 rounded border border-[#df9c5c]">
                {application.paymentFrequency || 'सहामाही'}
              </strong>
            </div>
          </div>
        </div>

        {/* Row 9: 13. आदर्श आचारसंहिता */}
        <div className="flex bg-[#fffaf4]">
          <div className={labelColClass}>13. आदर्श आचारसंहिता</div>
          <div className="flex-1 min-w-0 px-3.5 py-3 text-sm sm:text-base leading-relaxed flex items-center">
            <div>
              मराठा सेवा संघाच्या आदर्श आचार संहितेचे पालन करणे मजवर बंधनकारक राहील. पदाचा कालावधी 3 वर्षांचा राहील; आचारसंहिता भंग झाल्यास पदमुक्त करण्याचे अधिकार कार्यकारिणीला असतील.{' '}
              <strong className="text-[#9a3412]">[✓] हमीपत्र मान्य आहे.</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Photo, Place/Date & Signature Strip */}
      <div className={`${photoSignRowClass} mb-4`}>
        <div className="flex items-end gap-4.5">
          <div className="w-24 h-30 sm:w-28 sm:h-34 border-2 border-[#7c2d12] bg-[#fff8f0] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
            {application.photoUrl ? (
              <img
                src={application.photoUrl}
                alt="अर्जदार फोटो"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-[#8c5a3c] font-bold text-center p-1">
                फोटो
              </span>
            )}
          </div>
          <div className="text-sm sm:text-base space-y-2 text-[#431407] min-w-0">
            <div className="break-words">
              ठिकाण: <strong>{application.submissionPlace || application.village || '-'}</strong>
            </div>
            <div>
              दिनांक: <strong className="font-mono">{application.submissionDate}</strong>
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="w-52 h-24 border-b-2 border-[#7c2d12] flex items-center justify-center p-1 bg-[#fffaf4] shadow-xs">
            {application.signatureUrl ? (
              <img
                src={application.signatureUrl}
                alt="स्वाक्षरी"
                className="max-h-20 max-w-full object-contain"
              />
            ) : (
              <span className="text-sm text-[#8c5a3c]">स्वाक्षरी</span>
            )}
          </div>
          <span className="text-sm sm:text-base font-bold text-[#5c1d05] mt-2 block">
            अर्जदाराची स्वाक्षरी ({application.fullName || 'अर्जदार'})
          </span>
        </div>
      </div>

      {/* Family Members Table on the SAME A4 Page */}
      <div className="mt-4 pt-4 border-t-2 border-dashed border-[#c2410c]/70">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <h3 className="font-bold text-base sm:text-lg font-noto text-[#7c2d12]">
            ❖ कौटुंबिक माहिती ❖
          </h3>
          <span className="text-sm sm:text-base text-[#7c2d12] font-medium">
            अर्जदार: {application.fullName} | नोंदणी क्र. {application.id || 'MSS-2026'}
          </span>
        </div>

        <div className={isFixedA4 ? '' : 'overflow-x-auto'}>
          <table className="w-full text-left text-sm sm:text-base border border-[#7c2d12] border-collapse">
            <thead>
              <tr className="bhagwa-texture-medium border-b-2 border-[#7c2d12] text-[#431407] font-bold">
                <th className="px-3.5 py-2.5 text-center w-12 border-r border-[#7c2d12]/65">अ.क्र.</th>
                <th className="px-4 py-2.5 border-r border-[#7c2d12]/65">कुटुंबातील सदस्याचे संपूर्ण नाव</th>
                <th className="px-3.5 py-2.5 border-r border-[#7c2d12]/65">नाते</th>
                <th className="px-3.5 py-2.5 border-r border-[#7c2d12]/65">जन्म दिनांक / वय</th>
                <th className="px-3.5 py-2.5 border-r border-[#7c2d12]/65">व्यवसाय</th>
                <th className="px-3.5 py-2.5">शिक्षण</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7c2d12]/45 font-medium">
              {application.familyMembers && application.familyMembers.length > 0 ? (
                application.familyMembers.map((m, idx) => (
                  <tr key={m.id || idx}>
                    <td className="px-3.5 py-2.5 text-center font-bold border-r border-[#7c2d12]/50">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-[#29150b] border-r border-[#7c2d12]/50">
                      {m.fullName || '-'}
                    </td>
                    <td className="px-3.5 py-2.5 border-r border-[#7c2d12]/50">{m.relation || '-'}</td>
                    <td className="px-3.5 py-2.5 border-r border-[#7c2d12]/50">{m.dob || '-'}</td>
                    <td className="px-3.5 py-2.5 border-r border-[#7c2d12]/50">{m.occupation || '-'}</td>
                    <td className="px-3.5 py-2.5">{m.education || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-3.5 text-center text-[#8c5a3c] italic">
                    कोणतीही कौटुंबिक माहिती नोंदवलेली नाही.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base text-[#7c2d12] font-bold">
          <span>मराठा सेवा संघ केंद्रीय कार्यालय, महाराष्ट्र</span>
          <span>सचिव कार्यालय: {OFFICIAL_NOTICE.secretaryName}</span>
        </div>
      </div>
    </div>
  );
};

export const FormPrintReplica: React.FC<FormPrintReplicaProps> = ({ application, onClose }) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const a4ExportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownloadDirectPdf = async () => {
    const target = a4ExportRef.current;
    if (!target) return;

    setIsDownloadingPdf(true);
    setPdfError('');

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const imgs = Array.from(target.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );

      const dataUrl = await toPng(target, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: target.scrollWidth,
        height: target.scrollHeight,
        cacheBust: true,
        skipFonts: true,
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = dataUrl;
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

      const safeName = (application.fullName || 'अर्जदार').replace(/[^a-zA-Z0-9_\u0900-\u097F_-]/g, '_');
      const safeId = (application.id || 'MSS-2026').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Maratha_Seva_Sangh_${safeName}_${safeId}.pdf`);
    } catch (err) {
      console.error('Direct PDF generation failed:', err);
      setPdfError('PDF तयार करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="print-modal-root fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#291003]/75 backdrop-blur-sm overflow-y-auto">
      <div className="print-modal-shell relative bg-white text-[#29150b] rounded-xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden my-auto border-2 border-[#c2410c]">
        {/* Modal Top Bar - Hidden in Print */}
        <div className="no-print bhagwa-texture-medium text-[#431407] px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#e5ab75]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs sm:text-base font-noto text-[#5c1d05]">
              अधिकृत अर्ज प्रपत्र - {application.id || 'MSS-2026'}
            </span>
            <span className="text-[11px] sm:text-xs bg-white/90 px-2 py-0.5 rounded text-[#7c2d12] border border-[#df9c5c] font-mono font-bold">
              {application.targetLevel} - {application.targetPost}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadDirectPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 bhagwa-texture-deep hover:brightness-95 text-white rounded-md text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer border border-[#9a3412] disabled:opacity-60"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloadingPdf ? 'PDF तयार होत आहे...' : 'अर्ज प्रिंट करा'}
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

        {pdfError && (
          <div className="no-print px-4 py-2 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-semibold">
            {pdfError}
          </div>
        )}

        {/* Responsive Preview & Printable Paper */}
        <div className="print-scroll-area flex-1 overflow-y-auto p-2.5 sm:p-5 bg-[#fff8f0]">
          <ReplicaDocumentBody application={application} id="printable-replica-document" />
        </div>

        {/* Dedicated Off-Screen Fixed 720px Width Desktop-A4 Clone for PDF Export */}
        <div
          aria-hidden="true"
          className="no-print fixed -left-[99999px] top-0 pointer-events-none select-none bg-white"
        >
          <div ref={a4ExportRef} style={{ width: '720px', minHeight: '1180px', backgroundColor: '#ffffff' }}>
            <ReplicaDocumentBody application={application} isFixedA4 />
          </div>
        </div>

        {/* Modal Bottom Bar - Hidden in Print */}
        <div className="no-print bhagwa-texture-soft px-4 sm:px-6 py-2.5 border-t border-[#e9bd92] flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm text-[#5c1d05] font-medium">
            टीप: &apos;अर्ज प्रिंट करा&apos; वर क्लिक करताच संपूर्ण अर्ज एकाच पूर्ण A4 पानावर PDF स्वरूपात डाऊनलोड होईल.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bhagwa-texture-deep hover:brightness-95 text-white rounded-md text-xs sm:text-sm font-bold transition-all cursor-pointer border border-[#9a3412] flex-shrink-0"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
};
