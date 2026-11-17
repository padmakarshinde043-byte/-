import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import * as XLSX from 'xlsx';
import { ApplicationFormData, AdminUser } from '../types/index';
import {
  MARATHA_SEVA_SANGH_WINGS,
  MAHARASHTRA_DISTRICTS,
  EXECUTIVE_BODIES,
} from '../utils/constants';
import {
  APPLICATION_EXPORT_HEADERS,
  applicationToExportRow,
  summarizeApplications,
} from '../utils/logic';
import {
  initGoogleAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken,
  createAndPopulateGoogleSheet,
  updateExistingGoogleSheet,
  SheetSyncResult,
} from '../utils/googleSheets';
import {
  subscribeApplicationsFromFirestore,
  fetchSheetConfigFromFirestore,
  saveSheetConfigToFirestore,
} from '../utils/firestoreService';
import { FormPrintReplica } from './FormPrintReplica';
import {
  FileSpreadsheet,
  Search,
  Users,
  Eye,
  LogOut,
  Phone,
  Mail,
  ArrowLeft,
  IndianRupee,
  Building2,
  Share2,
  Check,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Sheet,
  X,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  onBackToForm: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onBackToForm,
}) => {
  const [applications, setApplications] = useState<ApplicationFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationFormData | null>(
    null
  );
  const [linkCopied, setLinkCopied] = useState(false);

  // Filters (View-only, no status/processing filters)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedWing, setSelectedWing] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Google Sheets Auth & Sync state
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [needsGoogleAuth, setNeedsGoogleAuth] = useState(true);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [sheetConfig, setSheetConfig] = useState<SheetSyncResult | null>(null);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetMessage, setSheetMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [pendingSheetAction, setPendingSheetAction] = useState<
    'create' | 'update' | null
  >(null);

  useEffect(() => {
    setLoading(true);
    setFetchError('');

    const unsubApps = subscribeApplicationsFromFirestore(
      (apps) => {
        setApplications(apps);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore list error:', err);
        setFetchError(
          'अर्ज माहिती लोड करताना अडचण आली. कृपया अधिकृत प्रशासक Google खात्याने लॉगिन केल्याची खात्री करा.'
        );
        setLoading(false);
      }
    );

    fetchSheetConfigFromFirestore()
      .then((cfg) => {
        if (cfg) setSheetConfig(cfg);
      })
      .catch(() => {
        // Ignore if no sheet config exists yet
      });

    const unsubAuth = initGoogleAuth(
      (fbUser) => {
        setGoogleUser(fbUser);
        setNeedsGoogleAuth(false);
      },
      () => {
        setGoogleUser(null);
        setNeedsGoogleAuth(true);
      }
    );

    return () => {
      unsubApps();
      unsubAuth();
    };
  }, []);

  // Filter applications
  const filteredApps = applications.filter((app) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        app.fullName?.toLowerCase().includes(q) ||
        app.mobile?.includes(q) ||
        app.id?.toLowerCase().includes(q) ||
        app.village?.toLowerCase().includes(q) ||
        app.district?.toLowerCase().includes(q) ||
        app.division?.toLowerCase().includes(q) ||
        app.targetWing?.toLowerCase().includes(q) ||
        app.targetPost?.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedDistrict !== 'all' && app.district !== selectedDistrict) {
      return false;
    }

    if (selectedWing !== 'all' && app.targetWing !== selectedWing) {
      return false;
    }

    if (selectedLevel !== 'all' && app.targetLevel !== selectedLevel) {
      return false;
    }

    return true;
  });

  const summary = summarizeApplications(applications);

  const getLevelCount = (body: string) => {
    if (body === 'राज्य कार्यकारिणी') return summary.byLevel.state;
    if (body === 'विभागीय कार्यकारिणी') return summary.byLevel.division;
    if (body === 'जिल्हा कार्यकारिणी') return summary.byLevel.district;
    if (body === 'इतर कक्ष कार्यकारिणी') return summary.byLevel.wings;
    return summary.total;
  };

  // Full Excel (.xlsx) Export containing ALL fields & family member sheet
  const handleExportExcel = () => {
    const dataToExport = applications;
    const sheetRows = [
      APPLICATION_EXPORT_HEADERS,
      ...dataToExport.map((appItem) => applicationToExportRow(appItem)),
    ];

    const workbook = XLSX.utils.book_new();
    const mainWorksheet = XLSX.utils.aoa_to_sheet(sheetRows);
    mainWorksheet['!cols'] = APPLICATION_EXPORT_HEADERS.map((header, idx) => ({
      wch: idx === 28 ? 48 : Math.max(header.length + 6, 18),
    }));
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, 'अर्ज यादी');

    const familyHeaders = [
      'नोंदणी क्र.',
      'अर्जदाराचे नाव',
      'सदस्य अ.क्र.',
      'सदस्याचे संपूर्ण नाव',
      'नाते',
      'जन्म दिनांक / वय',
      'शिक्षण',
      'व्यवसाय',
    ];
    const familyRows: (string | number)[][] = [familyHeaders];
    dataToExport.forEach((appItem) => {
      (appItem.familyMembers || []).forEach((member, idx) => {
        familyRows.push([
          appItem.id || '',
          appItem.fullName || '',
          idx + 1,
          member.fullName || '',
          member.relation || '',
          member.dob || '',
          member.education || '',
          member.occupation || '',
        ]);
      });
    });

    const familyWorksheet = XLSX.utils.aoa_to_sheet(familyRows);
    familyWorksheet['!cols'] = familyHeaders.map((h) => ({
      wch: Math.max(h.length + 6, 18),
    }));
    XLSX.utils.book_append_sheet(workbook, familyWorksheet, 'कौटुंबिक माहिती');

    XLSX.writeFile(
      workbook,
      `maratha_seva_sangh_applications_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Copy Shareable Branded Link
  const handleCopyShareLink = async () => {
    const shareUrl = `${window.location.origin}/#maratha-seva-sangh`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      // Clipboard fallback ignored
    }
  };

  // Google Sign-In for Sheets token
  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    setSheetMessage(null);
    try {
      const result = await googleSignIn();
      setGoogleUser(result.user);
      setNeedsGoogleAuth(false);
    } catch (err: any) {
      setSheetMessage({
        type: 'error',
        text: err?.message || 'Google लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.',
      });
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setNeedsGoogleAuth(true);
    setSheetMessage(null);
    onLogout();
  };

  // Execute Google Sheet Create or Update ONLY after explicit user confirmation modal
  const executeConfirmedSheetSync = async () => {
    const action = pendingSheetAction;
    if (!action) return;
    setPendingSheetAction(null);

    const token = await getAccessToken();
    if (!token) {
      setNeedsGoogleAuth(true);
      setSheetMessage({
        type: 'error',
        text: 'कृपया प्रथम Sign in with Google वर क्लिक करून Google खात्यात प्रवेश करा.',
      });
      return;
    }

    setIsSyncingSheet(true);
    setSheetMessage(null);

    try {
      let result: SheetSyncResult;
      if (action === 'update' && sheetConfig?.spreadsheetId) {
        result = await updateExistingGoogleSheet(
          token,
          sheetConfig.spreadsheetId,
          applications
        );
      } else {
        result = await createAndPopulateGoogleSheet(token, applications);
      }

      setSheetConfig(result);
      await saveSheetConfigToFirestore(result);

      setSheetMessage({
        type: 'success',
        text: `${result.syncedCount} अर्जांची संपूर्ण माहिती Google Sheet मध्ये यशस्वीरित्या सेव्ह झाली आहे.`,
      });
    } catch (err: any) {
      const msg =
        err?.message || 'Google Sheet मध्ये माहिती जमा करताना त्रुटी आली.';
      if (msg.includes('Sign in') || msg.includes('कालबाह्य')) {
        setNeedsGoogleAuth(true);
      }
      setSheetMessage({ type: 'error', text: msg });
    } finally {
      setIsSyncingSheet(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f7fc] text-slate-900 pb-16 font-noto">
      {/* Top Admin Navigation - Light Sky Blue & Classic Navy */}
      <nav className="bg-sky-50 text-[#0f294a] border-b-2 border-sky-200 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-sky-100 text-[#133b6e] border border-sky-300 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              सार्वजनिक अर्ज फॉर्मवर जा
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#0f294a] flex items-center gap-2">
                <span>मराठा सेवा संघ</span>
                <span className="text-xs bg-sky-200/80 text-[#0f294a] border border-sky-300 px-2.5 py-0.5 rounded font-bold">
                  प्रशासक माहिती कक्ष
                </span>
              </h1>
              <p className="text-xs text-[#1e4070] font-medium">
                लॉगिन: {user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              title="शेअर करण्यासाठी अर्ज लिंक कॉपी करा"
            >
              {linkCopied ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              {linkCopied ? 'लिंक कॉपी झाली!' : 'अर्ज लिंक कॉपी करा'}
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              title="सर्व माहिती Excel मध्ये डाउनलोड करा"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel डाउनलोड करा
            </button>

            <button
              type="button"
              onClick={handleGoogleLogout}
              className="inline-flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              बाहेर पडा
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ============================================================== */}
        {/* Google Sheets Sync Panel */}
        {/* ============================================================== */}
        <section
          aria-label="Google Sheet माहिती जोडणी"
          className="bg-white rounded-xl border border-sky-200 p-4 sm:p-5 shadow-2xs space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-[#0f294a] flex items-center gap-2">
                <Sheet className="w-5 h-5 text-emerald-600" />
                Google Sheet वर सर्व अर्जांची माहिती जमा करा
              </h2>
              <p className="text-xs sm:text-sm text-[#1e4070] font-medium">
                सर्व प्राप्त अर्जांची संपूर्ण माहिती थेट आपल्या Google Sheet मध्ये जतन व अद्ययावत करा.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {needsGoogleAuth || !googleUser ? (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoggingIn}
                  className="gsi-material-button inline-flex items-center justify-center bg-white hover:bg-slate-50 active:bg-slate-100 text-[#1f1f1f] border border-[#747775] rounded-md px-3.5 py-2 text-sm font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  <div className="gsi-material-button-content-wrapper flex items-center gap-2.5">
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
                    <span className="gsi-material-button-contents font-medium">
                      {isGoogleLoggingIn ? 'साइन इन सुरू आहे...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              ) : (
                <>
                  <div className="text-xs bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg text-[#0f294a] font-semibold">
                    जोडलेले खाते:{' '}
                    <span className="font-bold">
                      {googleUser.email || googleUser.displayName}
                    </span>
                  </div>

                  {sheetConfig?.spreadsheetId ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPendingSheetAction('update')}
                        disabled={isSyncingSheet}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${isSyncingSheet ? 'animate-spin' : ''}`}
                        />
                        Google Sheet अपडेट करा
                      </button>

                      <a
                        href={sheetConfig.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Google Sheet पहा
                      </a>

                      <button
                        type="button"
                        onClick={() => setPendingSheetAction('create')}
                        disabled={isSyncingSheet}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-[#133b6e] border border-sky-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                      >
                        नवीन Sheet तयार करा
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingSheetAction('create')}
                      disabled={isSyncingSheet}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Sheet className="w-4 h-4" />
                      Google Sheet तयार करा व माहिती जमा करा
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {sheetConfig?.spreadsheetUrl && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-sky-50/70 border border-sky-200 rounded-lg px-3.5 py-2 text-[#0f294a]">
              <div>
                जोडलेले Google Sheet:{' '}
                <strong className="font-bold">{sheetConfig.sheetTitle}</strong> | जमा केलेले अर्ज:{' '}
                <strong className="font-mono">{sheetConfig.syncedCount}</strong>
              </div>
              {sheetConfig.lastSyncedAt && (
                <div className="text-[#1e4070] font-medium">
                  अखेरचे अपडेट:{' '}
                  {new Date(sheetConfig.lastSyncedAt).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          )}

          {sheetMessage && (
            <div
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold border ${
                sheetMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {sheetMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{sheetMessage.text}</span>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* 4 कार्यकारिणी विभाग व एकूण अर्ज गोषवारा */}
        {/* ============================================================== */}
        <section
          aria-label="कार्यकारिणी विभागानुसार अर्ज गोषवारा"
          className="bg-white rounded-xl border border-sky-200 p-4 sm:p-5 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-sky-100">
            <h3 className="text-base sm:text-lg font-bold text-[#0f294a] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#133b6e]" />
              प्राप्त अर्जांचा गोषवारा व कार्यकारिणी विभाग निवड
            </h3>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#1e4070] font-semibold">
              <span className="inline-flex items-center gap-1 bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg">
                <Users className="w-4 h-4 text-[#133b6e]" />
                एकूण अर्ज:{' '}
                <strong className="font-mono text-[#0f294a]">
                  {summary.total}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1 bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg">
                <IndianRupee className="w-4 h-4 text-[#133b6e]" />
                मासिक संकल्प:{' '}
                <strong className="font-mono text-[#0f294a]">
                  ₹{summary.totalMonthlyPledge.toLocaleString('en-IN')}
                </strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                selectedLevel === 'all'
                  ? 'bg-[#133b6e] text-white border-[#133b6e] shadow-xs'
                  : 'bg-sky-50/60 text-[#0f294a] border-sky-200 hover:bg-sky-100/70'
              }`}
            >
              <span>सर्व कार्यकारिणी</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                  selectedLevel === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-sky-200/80 text-[#0f294a]'
                }`}
              >
                {summary.total}
              </span>
            </button>

            {EXECUTIVE_BODIES.map((body) => {
              const active = selectedLevel === body;
              return (
                <button
                  key={body}
                  type="button"
                  onClick={() => setSelectedLevel(body)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-bold transition-colors cursor-pointer text-left ${
                    active
                      ? 'bg-[#133b6e] text-white border-[#133b6e] shadow-xs'
                      : 'bg-sky-50/60 text-[#0f294a] border-sky-200 hover:bg-sky-100/70'
                  }`}
                >
                  <span className="truncate pr-1">{body}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono flex-shrink-0 ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-sky-200/80 text-[#0f294a]'
                    }`}
                  >
                    {getLevelCount(body)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-2xs space-y-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#133b6e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाव, मोबाईल, गाव, नोंदणी क्र., कक्ष किंवा पदाने शोधा..."
              className="w-full pl-9 pr-3 py-2 border border-sky-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#133b6e] focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-sky-100 text-xs">
            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">
                जिल्हा:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-sky-200 rounded-md bg-white text-xs font-medium focus:outline-none focus:border-[#133b6e]"
              >
                <option value="all">सर्व जिल्हे</option>
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">
                मराठा सेवा संघ कक्ष:
              </label>
              <select
                value={selectedWing}
                onChange={(e) => setSelectedWing(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-sky-200 rounded-md bg-white text-xs font-medium focus:outline-none focus:border-[#133b6e]"
              >
                <option value="all">सर्व 33 कक्ष</option>
                {MARATHA_SEVA_SANGH_WINGS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">
                कार्यकारिणी स्तर:
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-sky-200 rounded-md bg-white text-xs font-medium focus:outline-none focus:border-[#133b6e]"
              >
                <option value="all">सर्व कार्यकारिणी</option>
                {EXECUTIVE_BODIES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* आडव्या रांगेत सर्व अर्ज यादी (फक्त पाहण्यासाठी) */}
        {/* ============================================================== */}
        <div className="bg-white rounded-xl border border-sky-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-sky-50/80 border-b border-sky-200 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-[#0f294a] font-noto flex items-center gap-2 text-base">
              <span>प्राप्त अर्जांची यादी</span>
              <span className="text-xs bg-sky-200 text-[#0f294a] px-2.5 py-0.5 rounded-full font-mono font-bold">
                {filteredApps.length} / {summary.total}
              </span>
            </h3>

            <div className="text-xs sm:text-sm text-[#1e4070] font-medium">
              अर्जदाराच्या नावावर क्लिक करून उभ्या फॉरमॅटमध्ये संपूर्ण अर्ज पाहता येईल व प्रिंट करता येईल.
            </div>
          </div>

          {fetchError ? (
            <div className="p-8 text-center text-rose-700 font-semibold text-sm">
              {fetchError}
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-[#133b6e]">
              <div className="w-8 h-8 border-4 border-[#133b6e] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium">माहिती लोड होत आहे...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center text-slate-600">
              <p className="text-base font-bold">
                अद्याप या विभागामध्ये कोणताही अर्ज प्राप्त झालेला नाही.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                नवीन अर्ज भरताच ते येथे आपोआप दिसतील.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-sky-100/90 text-[#0f294a] font-bold border-b border-sky-200">
                    <th className="p-3 text-center whitespace-nowrap">नोंदणी क्र.</th>
                    <th className="p-3 whitespace-nowrap">अर्जदाराचे नाव</th>
                    <th className="p-3 whitespace-nowrap">मोबाईल व संपर्क</th>
                    <th className="p-3 whitespace-nowrap">जिल्हा व गाव</th>
                    <th className="p-3 whitespace-nowrap">कार्यकारिणी, कक्ष व पद</th>
                    <th className="p-3 text-right whitespace-nowrap">मासिक संकल्प</th>
                    <th className="p-3 text-center whitespace-nowrap">अर्ज पहा</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-sky-50/50 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-[#133b6e] whitespace-nowrap">
                        {app.id}
                        <span className="block text-[11px] text-slate-500 font-sans">
                          {app.submissionDate}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full border border-sky-300 bg-sky-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {app.photoUrl ? (
                              <img
                                src={app.photoUrl}
                                alt={app.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-[#133b6e]">
                                {app.fullName?.charAt(0) || 'म'}
                              </span>
                            )}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedApp(app)}
                              className="text-left font-bold text-[#0f294a] hover:text-[#133b6e] hover:underline text-sm sm:text-base cursor-pointer focus:outline-none"
                              title="उभ्या फॉरमॅटमध्ये संपूर्ण माहिती पहा"
                            >
                              {app.fullName}
                            </button>
                            <div className="text-xs text-slate-500">
                              {app.gender} • वय: {app.age || '-'} वर्षे •{' '}
                              {app.occupationType}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 space-y-0.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-slate-800 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-[#133b6e]" />
                          <span>{app.mobile}</span>
                        </div>
                        {app.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs truncate max-w-[170px]">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{app.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-900">
                          {app.district}
                        </div>
                        <div className="text-xs text-slate-500">
                          {app.village}
                          {app.taluka ? `, ता. ${app.taluka}` : ''}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-[#133b6e]">
                          {app.targetLevel}
                        </div>
                        <div className="text-xs font-semibold text-slate-700">
                          पद: {app.targetPost}
                          {app.targetLevel === 'विभागीय कार्यकारिणी' &&
                          app.division
                            ? ` • ${app.division}`
                            : app.targetLevel === 'इतर कक्ष कार्यकारिणी' &&
                              app.targetWing
                            ? ` • ${app.targetWing}`
                            : ''}
                        </div>
                      </td>

                      <td className="p-3 text-right whitespace-nowrap">
                        {app.monthlyContribution ? (
                          <>
                            <div className="font-bold font-mono text-slate-900">
                              ₹{app.monthlyContribution}/-
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {app.paymentFrequency || 'सहामाही'}
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-400 text-xs italic">
                            ऐच्छिक
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="उभ्या फॉरमॅटमध्ये संपूर्ण अर्ज पहा व प्रिंट करा"
                          aria-label={`${app.fullName} संपूर्ण अर्ज पहा`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          पहा
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory User Confirmation Modal before writing/updating Google Sheet */}
      {pendingSheetAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-sky-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-[#133b6e] flex items-center justify-center flex-shrink-0">
                  <Sheet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0f294a]">
                  Google Sheet मध्ये माहिती जमा करायची का?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPendingSheetAction(null)}
                aria-label="बंद करा"
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-sm text-[#0f294a] space-y-1.5">
              {pendingSheetAction === 'update' && sheetConfig ? (
                <p>
                  सध्याच्या जोडलेल्या Google Sheet मध्ये{' '}
                  <strong>{applications.length}</strong> अर्जांची संपूर्ण माहिती अद्ययावत केली जाईल आणि जुन्या नोंदी नव्या माहितीने बदलल्या जातील.
                </p>
              ) : (
                <p>
                  आपल्या Google खात्यात{' '}
                  <strong>मराठा सेवा संघ - पदाधिकारी अर्ज 2026</strong> नावाचे नवीन Google Sheet तयार करून त्यामध्ये{' '}
                  <strong>{applications.length}</strong> अर्जांची संपूर्ण माहिती जमा केली जाईल.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setPendingSheetAction(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={executeConfirmedSheetSync}
                className="px-4 py-2 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-lg text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                होय, माहिती सेव्ह करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Vertical Format Replica Modal */}
      {selectedApp && (
        <FormPrintReplica
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};
