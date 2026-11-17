import React from 'react';
import { ApplicationFormData } from '../types/index';
import { OFFICIAL_NOTICE } from '../utils/constants';
import { buildWhatsAppShareUrl, buildEmailShareUrl } from '../utils/logic';
import { CheckCircle2, Phone, Mail, Printer, PlusCircle, X, ShieldCheck, Download } from 'lucide-react';

interface SuccessReceiptModalProps {
  application: ApplicationFormData;
  onClose: () => void;
  onViewReplica: () => void;
  onNewApplication: () => void;
}

export const SuccessReceiptModal: React.FC<SuccessReceiptModalProps> = ({
  application,
  onClose,
  onViewReplica,
  onNewApplication,
}) => {
  const whatsappUrl = buildWhatsAppShareUrl(application, OFFICIAL_NOTICE.whatsappNumber);
  const emailUrl = buildEmailShareUrl(application, OFFICIAL_NOTICE.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border-2 border-emerald-600 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            नोंदणी यशस्वी !
          </span>

          <h3 className="text-xl sm:text-2xl font-bold font-noto text-slate-900 mt-2">
            आपला अर्ज केंद्रीय कार्यालयाकडे सादर झाला आहे!
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            मराठा सेवा संघ केंद्रीय कार्यालय पत्र {OFFICIAL_NOTICE.letterNo}
          </p>
        </div>

        {/* Receipt Box */}
        <div className="mt-5 bg-sky-50/70 border border-sky-200 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-sky-200 pb-2">
            <span className="text-slate-600">अधिकृत नोंदणी क्रमांक:</span>
            <span className="font-mono font-bold text-[#0f294a] text-base bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
              {application.id}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">अर्जदाराचे नाव:</span>
            <span className="font-bold text-slate-900">{application.fullName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">मोबाईल क्रमांक:</span>
            <span className="font-mono text-slate-900 font-semibold">{application.mobile}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">कार्यकारिणी व पद:</span>
            <span className="font-semibold text-slate-900">
              {application.targetLevel} {application.division ? `- ${application.division}` : ''} - {application.targetPost}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">जिल्हा:</span>
            <span className="text-slate-900">{application.district}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">मासिक योगदान संकल्प:</span>
            <span className="font-bold text-slate-900">
              {application.monthlyContribution
                ? `रु. ${application.monthlyContribution}/- - ${application.paymentFrequency || 'सहामाही'}`
                : 'ऐच्छिक'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-semibold text-slate-700 text-center">
            पुढील पायरी: केंद्रीय कार्यालयाला व सचिवांना आपल्या अर्जाची प्रत पाठवा:
          </p>

          {/* WhatsApp Direct */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-colors"
          >
            <Phone className="w-4 h-4" />
            केंद्रीय कार्यालयाला WhatsApp वर पाठवा - 8275520397
          </a>

          {/* Email Direct */}
          <a
            href={emailUrl}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-colors"
          >
            <Mail className="w-4 h-4" />
            सचिवांना ई-मेल द्वारे पाठवा
          </a>

          {/* Print Replica */}
          <button
            type="button"
            onClick={onViewReplica}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            मूळ फॉरमॅटप्रमाणे संपूर्ण अर्ज पहा / प्रिंट करा
          </button>

          <button
            type="button"
            onClick={onNewApplication}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-sky-50 hover:bg-sky-100 text-[#0f294a] border border-sky-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            दुसरा नवा अर्ज भरा
          </button>
        </div>
      </div>
    </div>
  );
};
