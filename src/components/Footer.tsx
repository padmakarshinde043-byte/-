import React from 'react';
import { OFFICIAL_NOTICE } from '../utils/constants';

interface FooterProps {
  onAdminClick: () => void;
  isAdminLoggedIn?: boolean;
  onGoToDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onAdminClick,
  isAdminLoggedIn,
  onGoToDashboard,
}) => {
  return (
    <footer className="bhagwa-texture-medium text-[#431407] border-t border-[#e5ab75] mt-8 py-4 text-xs sm:text-sm font-noto">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <p className="text-[#5c1d05] font-semibold">
          अधिकृत डिजिटल पदाधिकारी माहिती संकलन पोर्टल | अंतिम मुदत: {OFFICIAL_NOTICE.deadline}
        </p>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          {isAdminLoggedIn && onGoToDashboard ? (
            <button
              type="button"
              onClick={onGoToDashboard}
              className="text-[#7c2d12] hover:text-[#431407] underline cursor-pointer font-bold"
            >
              प्रशासक नियंत्रण कक्ष
            </button>
          ) : (
            <button
              type="button"
              onClick={onAdminClick}
              className="text-[#7c2d12] hover:text-[#431407] underline cursor-pointer font-bold"
            >
              प्रशासक लॉगिन
            </button>
          )}
          <span className="text-[#c2783e]">|</span>
          <span className="text-[#5c1d05] font-semibold">© 2026 मराठा सेवा संघ</span>
        </div>
      </div>
    </footer>
  );
};
