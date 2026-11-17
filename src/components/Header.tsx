import React, { useState } from 'react';
import { OFFICIAL_NOTICE } from '../utils/constants';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HeaderProps {
  onOpenNoticeModal?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isAppealExpanded, setIsAppealExpanded] = useState(true);

  return (
    <header className="bg-[#fffcf8] border-b border-[#e9bd92] shadow-2xs text-[#29150b] font-noto">
      {/* Topmost Medium Textured Bhagwa info bar */}
      <div className="bhagwa-texture-medium text-[#431407] py-1.5 px-4 text-xs sm:text-sm flex justify-between items-center border-b border-[#e5ab75]">
        <div className="font-bold text-[#5c1d05]">
          मराठा सेवा संघ केंद्रीय कार्यालय, महाराष्ट्र
        </div>
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <span className="text-[#7c2d12] font-bold">
            पत्र {OFFICIAL_NOTICE.letterNo}
          </span>
        </div>
      </div>

      {/* Main Official Header */}
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
        {/* Prominent Deep Textured Bhagwa Jay Jijau / Jay Shivray Banner */}
        <div className="text-center py-2.5 mb-3.5 bhagwa-texture-deep border border-[#9a3412] rounded-lg shadow-xs">
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-wide font-noto drop-shadow-xs">
            जय जिजाऊ ! जय शिवराय !!
          </h2>
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-4 border-b border-[#edc69f] pb-3.5">
          {/* Left: Rajmata Jijau Photo */}
          <div className="flex flex-col items-center text-center w-20 sm:w-24 flex-shrink-0">
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-md border border-[#df9c5c] p-0.5 bg-[#fff5e8] shadow-2xs overflow-hidden">
              <img
                src={OFFICIAL_NOTICE.jijauPortraitPath}
                alt="राजमाता जिजाऊ माँसाहेब"
                className="w-full h-full object-cover object-top rounded-xs"
              />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#5c1d05] mt-1">
              राजमाता जिजाऊ
            </span>
          </div>

          {/* Center: Maratha Seva Sangh Official Logo & Typography */}
          <div className="text-center flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-1.5 flex items-center justify-center rounded-full overflow-hidden bg-white border-2 border-[#e09e60] shadow-2xs p-0.5">
              <img
                src={OFFICIAL_NOTICE.mssLogoPath}
                alt="मराठा सेवा संघ अधिकृत लोगो"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#7c2d12] font-noto tracking-tight">
              मराठा सेवा संघ
            </h1>
            <p className="text-[#9a3412] font-bold text-xs sm:text-sm mt-0.5">
              महाराष्ट्र राज्य केंद्रीय कार्यालय
            </p>

            <div className="mt-1.5 inline-block bhagwa-texture-medium text-[#431407] border border-[#df9c5c] font-bold text-xs sm:text-sm px-3.5 py-1 rounded-md shadow-2xs">
              राज्य, विभागीय, जिल्हा व इतर कक्ष - पदाधिकारी माहिती संकलन अर्ज 2026
            </div>
          </div>

          {/* Right: Chhatrapati Shivaji Maharaj Photo */}
          <div className="flex flex-col items-center text-center w-20 sm:w-24 flex-shrink-0">
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-md border border-[#df9c5c] p-0.5 bg-[#fff5e8] shadow-2xs overflow-hidden">
              <img
                src={OFFICIAL_NOTICE.shivajiPortraitPath}
                alt="छत्रपती शिवाजी महाराज"
                className="w-full h-full object-cover object-top rounded-xs"
              />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#5c1d05] mt-1">
              छ. शिवाजी महाराज
            </span>
          </div>
        </div>

        {/* Official Notice / Appeal Soft Textured Saffron Section */}
        <div className="mt-3.5 bhagwa-texture-soft border border-[#eac095] rounded-lg p-3.5 text-[#29150b] shadow-2xs">
          <div
            className="flex items-center justify-between cursor-pointer pb-2 border-b border-[#e8bc8e]"
            onClick={() => setIsAppealExpanded(!isAppealExpanded)}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bhagwa-texture-deep text-white text-xs font-bold px-2.5 py-0.5 rounded shadow-2xs">
                अधिकृत परिपत्रक व विनम्र आवाहन
              </span>
              <span className="text-sm font-bold text-[#5c1d05]">
                {OFFICIAL_NOTICE.letterNo} | दिनांक: {OFFICIAL_NOTICE.letterDate}
              </span>
            </div>
            <button
              type="button"
              aria-label="Toggle notice text"
              className="text-[#9a3412] hover:text-[#5c1d05] p-0.5 cursor-pointer"
            >
              {isAppealExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isAppealExpanded && (
            <div className="mt-2.5 text-base sm:text-lg leading-snug text-[#29150b] space-y-1.5 font-medium">
              <p className="text-[#9a3412] font-bold text-lg sm:text-xl">
                विनम्र आवाहन
              </p>
              <p className="text-[#29150b] font-normal text-base sm:text-lg leading-snug">
                {OFFICIAL_NOTICE.appealText}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm border-t border-[#e8bc8e] text-[#431407] font-medium">
                <div>
                  <span className="font-bold text-[#29150b]">आपला शिवांकित:</span> {OFFICIAL_NOTICE.secretaryName}, {OFFICIAL_NOTICE.secretaryTitle}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-bold text-emerald-800">WhatsApp: {OFFICIAL_NOTICE.whatsappNumber}</span>
                  <span className="font-bold text-[#9a3412]">Email: {OFFICIAL_NOTICE.email}</span>
                  <span className="font-bold text-[#5c1d05]">अंतिम मुदत: {OFFICIAL_NOTICE.deadline}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
