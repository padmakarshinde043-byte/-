import React from 'react';
import { X, ExternalLink, FileText } from 'lucide-react';
import { OFFICIAL_NOTICE } from '../utils/constants';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#291003]/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white text-[#29150b] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-[#c2410c] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bhagwa-texture-medium text-[#431407] px-6 py-4 flex items-center justify-between border-b border-[#e5ab75]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#9a3412]" />
            <div>
              <h3 className="font-bold text-lg font-noto text-[#5c1d05]">मूळ अधिकृत नमुना अर्ज</h3>
              <p className="text-xs text-[#7c2d12] font-medium">
                मराठा सेवा संघ केंद्रीय कार्यालय पत्र {OFFICIAL_NOTICE.letterNo} सोबतचा नमुना
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#7c2d12] hover:text-[#431407] p-1 rounded-lg hover:bg-[#fed7aa] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body: Scanned Image and Context */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fff8f0] flex flex-col items-center">
          <div className="bg-white p-2 rounded-xl shadow-md border border-[#e9bd92] max-w-2xl w-full">
            <img
              src={OFFICIAL_NOTICE.scannedFormPath}
              alt="मराठा सेवा संघ अधिकृत नमुना अर्ज"
              className="w-full h-auto rounded object-contain max-h-[65vh]"
            />
          </div>

          <div className="mt-4 text-xs text-[#5c1d05] text-center max-w-xl font-medium">
            वरील नमुना अर्जातील सर्व 13 मुद्दे आणि कौटुंबिक माहिती तक्ता या डिजिटल अर्जामध्ये समाविष्ट केले आहेत. माहिती भरल्यानंतर आपण याच मूळ फॉरमॅटमध्ये संपूर्ण प्रिंट काढू शकता.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bhagwa-texture-soft px-6 py-3 border-t border-[#e9bd92] flex items-center justify-between">
          <a
            href={OFFICIAL_NOTICE.scannedFormPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#9a3412] hover:text-[#5c1d05] font-bold"
          >
            <ExternalLink className="w-4 h-4" />
            नवीन टॅबमध्ये पूर्ण आकारात पहा
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bhagwa-texture-deep hover:brightness-95 text-white rounded-lg text-sm font-bold transition-all cursor-pointer border border-[#9a3412]"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
};
