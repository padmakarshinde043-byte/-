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
            प्रशासक लॉगिन
          </h3>
          <p className="text-xs text-slate-600 mt-1">
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
              className="block text-sm font-bold text-[#0f294a] mb-1.5"
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
                className="w-full px-3.5 py-2.5 pr-10 border border-sky-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#133b6e] focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'पासवर्ड लपवा' : 'पासवर्ड पहा'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#133b6e] p-1 cursor-pointer"
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
            className="w-full py-2.5 px-4 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
          >
            प्रशासक लॉगिन करा
          </button>
        </form>
      </div>
    </div>
  );
};
