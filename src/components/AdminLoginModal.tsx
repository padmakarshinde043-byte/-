import React, { useState } from 'react';
import { Lock, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../types/index';
import {
  googleSignIn,
  googleSignOut,
  isAllowedAdminEmail,
} from '../utils/googleSheets';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAdminLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await googleSignIn();
      const email = result.user.email || '';

      if (!result.user.emailVerified || !isAllowedAdminEmail(email)) {
        await googleSignOut();
        setError(
          'हे Google खाते केंद्रीय कार्यालयीन प्रशासकासाठी अधिकृत नाही. कृपया अधिकृत प्रशासक ई-मेलने लॉगिन करा.'
        );
        return;
      }

      onLoginSuccess({
        username: email,
        name:
          result.user.displayName ||
          'धनंजय पाटील - केंद्रीय कार्यालयीन सचिव',
        role: 'Admin',
      });
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setError('लॉगिन विंडो बंद झाली. कृपया पुन्हा प्रयत्न करा.');
      } else {
        setError(
          err?.message || 'Google लॉगिन होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-[#133b6e]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-sky-100 text-[#133b6e] rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner border border-sky-300">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-noto text-[#0f294a]">
            केंद्रीय कार्यालयीन प्रशासक लॉगिन
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            मराठा सेवा संघ - अधिकृत माहिती पाहणे, Excel डाउनलोड व Google Sheet व्यवस्थापन
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-start gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-[#0f294a] flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#133b6e] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              केवळ अधिकृत केंद्रीय कार्यालयीन प्रशासकांच्या Google खात्यानेच सर्व प्राप्त अर्ज पाहता येतील आणि Google Sheet व Excel मध्ये डाउनलोड करता येतील.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            disabled={isLoading}
            className="gsi-material-button w-full inline-flex items-center justify-center bg-white hover:bg-slate-50 active:bg-slate-100 text-[#1f1f1f] border border-[#747775] rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            <div className="gsi-material-button-content-wrapper flex items-center gap-3">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#133b6e] border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="gsi-material-button-icon w-5 h-5 flex items-center justify-center">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-5 h-5 block"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
              )}
              <span className="gsi-material-button-contents">
                {isLoading ? 'पडताळणी सुरू आहे...' : 'Sign in with Google'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
