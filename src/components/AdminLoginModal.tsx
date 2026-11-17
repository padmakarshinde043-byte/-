import React, { useState } from 'react';
import { Lock, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AdminUser } from '../types/index';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

const ADMIN_PASSCODE = 'Maratha@2026';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.trim() === ADMIN_PASSCODE) {
      setPassword('');
      onLoginSuccess({
        username: 'admin',
        name: 'केंद्रीय कार्यालयीन प्रशासक',
        role: 'Admin',
      });
      onClose();
    } else {
      setError('चुकीचा पासवर्ड. कृपया योग्य प्रशासक पासवर्ड प्रविष्ट करा.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#291003]/65 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white text-[#29150b] rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-[#c2410c]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-[#8c5a3c] hover:text-[#431407] p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bhagwa-texture-medium text-[#7c2d12] rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner border border-[#df9c5c]">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-noto text-[#5c1d05]">
            प्रशासक लॉगिन
          </h3>
          <p className="text-xs text-[#7c2d12] mt-1 font-medium">
            मराठा सेवा संघ - प्राप्त अर्ज पाहणे व Excel डाउनलोड
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-start gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="admin-password-input"
              className="block text-sm font-bold text-[#5c1d05] mb-1.5"
            >
              पासवर्ड प्रविष्ट करा
            </label>
            <div className="relative">
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="प्रशासक पासवर्ड टाका..."
                autoFocus
                required
                className="w-full px-3.5 py-2.5 pr-10 border border-[#df9c5c] rounded-xl text-sm text-[#29150b] focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-orange-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'पासवर्ड लपवा' : 'पासवर्ड पहा'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c5a3c] hover:text-[#9a3412] p-1 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bhagwa-texture-deep hover:brightness-95 text-white rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer border border-[#9a3412]"
          >
            प्रशासक लॉगिन करा
          </button>
        </form>
      </div>
    </div>
  );
};
