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
    <footer className="bg-sky-100/70 text-[#0f294a] border-t border-sky-200 mt-8 py-4 text-xs sm:text-sm font-noto">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <p className="text-[#133b6e] font-medium">
          अधिकृत डिजिटल पदाधिकारी माहिती संकलन पोर्टल | अंतिम मुदत: {OFFICIAL_NOTICE.deadline}
        </p>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          {isAdminLoggedIn && onGoToDashboard ? (
            <button
              type="button"
              onClick={onGoToDashboard}
              className="text-[#133b6e] hover:text-[#091e3a] underline cursor-pointer font-medium"
            >
              प्रशासक नियंत्रण कक्ष
            </button>
          ) : (
            <button
              type="button"
              onClick={onAdminClick}
              className="text-[#133b6e] hover:text-[#091e3a] underline cursor-pointer font-medium"
            >
              प्रशासक लॉगिन
            </button>
          )}
          <span className="text-sky-300">|</span>
          <span className="text-[#1e4070]">© 2026 मराठा सेवा संघ</span>
        </div>
      </div>
    </footer>
  );
};
