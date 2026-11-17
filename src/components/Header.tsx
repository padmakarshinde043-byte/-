import React, { useState } from 'react';
import { OFFICIAL_NOTICE } from '../utils/constants';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HeaderProps {
  onOpenNoticeModal?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isAppealExpanded, setIsAppealExpanded] = useState(true);

  return (
    <header className="bg-white border-b border-sky-200 shadow-2xs text-slate-900 font-noto">
      {/* Topmost light sky info bar */}
      <div className="bg-sky-100/80 text-[#0f294a] py-1.5 px-4 text-xs sm:text-sm flex justify-between items-center border-b border-sky-200">
        <div className="font-semibold text-[#133b6e]">
          मराठा सेवा संघ केंद्रीय कार्यालय, महाराष्ट्र
        </div>
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <span className="text-[#133b6e] font-medium">
            पत्र {OFFICIAL_NOTICE.letterNo}
          </span>
        </div>
      </div>

      {/* Main Official Header with compact spacing */}
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
        {/* Prominent Bold Navy/Sky Jay Jijau / Jay Shivray Banner */}
        <div className="text-center py-2 mb-3 bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 border border-sky-200 rounded-md">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#133b6e] tracking-wide font-noto">
            जय जिजाऊ ! जय शिवराय !!
          </h2>
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-4 border-b border-sky-200 pb-3">
          {/* Left: Rajmata Jijau Photo */}
          <div className="flex flex-col items-center text-center w-20 sm:w-24 flex-shrink-0">
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded border border-sky-300 p-0.5 bg-sky-50/60 shadow-2xs overflow-hidden">
              <img
                src={OFFICIAL_NOTICE.jijauPortraitPath}
                alt="राजमाता जिजाऊ माँसाहेब"
                className="w-full h-full object-cover object-top rounded-sm"
              />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#0f294a] mt-1">
              राजमाता जिजाऊ
            </span>
          </div>

          {/* Center: Maratha Seva Sangh Official Logo & Typography */}
          <div className="text-center flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-1.5 flex items-center justify-center rounded-full overflow-hidden bg-white border border-sky-200 shadow-2xs p-0.5">
              <img
                src={OFFICIAL_NOTICE.mssLogoPath}
                alt="मराठा सेवा संघ अधिकृत लोगो"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0f294a] font-noto tracking-tight">
              मराठा सेवा संघ
            </h1>
            <p className="text-[#1e4070] font-semibold text-xs sm:text-sm mt-0.5">
              महाराष्ट्र राज्य केंद्रीय कार्यालय
            </p>

            <div className="mt-1.5 inline-block bg-sky-100 text-[#0f294a] border border-sky-300 font-bold text-xs sm:text-sm px-3.5 py-1 rounded shadow-2xs">
              राज्य, विभागीय, जिल्हा व इतर कक्ष - पदाधिकारी माहिती संकलन अर्ज 2026
            </div>
          </div>

          {/* Right: Chhatrapati Shivaji Maharaj Photo */}
          <div className="flex flex-col items-center text-center w-20 sm:w-24 flex-shrink-0">
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded border border-sky-300 p-0.5 bg-sky-50/60 shadow-2xs overflow-hidden">
              <img
                src={OFFICIAL_NOTICE.shivajiPortraitPath}
                alt="छत्रपती शिवाजी महाराज"
                className="w-full h-full object-cover object-top rounded-sm"
              />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#0f294a] mt-1">
              छ. शिवाजी महाराज
            </span>
          </div>
        </div>

        {/* Official Notice / Appeal Full Unabridged Section */}
        <div className="mt-3 bg-sky-50/70 border border-sky-200 rounded-md p-3.5 text-slate-800 shadow-2xs">
          <div
            className="flex items-center justify-between cursor-pointer pb-2 border-b border-sky-200/80"
            onClick={() => setIsAppealExpanded(!isAppealExpanded)}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#133b6e] text-white text-xs font-bold px-2.5 py-0.5 rounded">
                अधिकृत परिपत्रक व विनम्र आवाहन
              </span>
              <span className="text-sm font-bold text-[#0f294a]">
                {OFFICIAL_NOTICE.letterNo} | दिनांक: {OFFICIAL_NOTICE.letterDate}
              </span>
            </div>
            <button
              type="button"
              aria-label="Toggle notice text"
              className="text-[#133b6e] hover:text-[#091e3a] p-0.5 cursor-pointer"
            >
              {isAppealExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isAppealExpanded && (
            <div className="mt-2.5 text-base sm:text-lg leading-snug text-slate-800 space-y-1.5 font-medium">
              <p className="text-[#133b6e] font-bold text-lg sm:text-xl">
                विनम्र आवाहन
              </p>
              <p className="text-slate-800 font-normal text-base sm:text-lg leading-snug">
                {OFFICIAL_NOTICE.appealText}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm border-t border-sky-200/80 text-slate-700 font-medium">
                <div>
                  <span className="font-bold text-slate-900">आपला शिवांकित:</span> {OFFICIAL_NOTICE.secretaryName}, {OFFICIAL_NOTICE.secretaryTitle}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-bold text-emerald-800">WhatsApp: {OFFICIAL_NOTICE.whatsappNumber}</span>
                  <span className="font-bold text-[#133b6e]">Email: {OFFICIAL_NOTICE.email}</span>
                  <span className="font-bold text-sky-900">अंतिम मुदत: {OFFICIAL_NOTICE.deadline}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
