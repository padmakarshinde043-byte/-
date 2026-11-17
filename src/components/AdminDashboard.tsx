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
  fetchApplicationsFromFirestore,
  getStoredSheetConfig,
  saveStoredSheetConfig,
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationFormData | null>(
    null
  );
  const [linkCopied, setLinkCopied] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedWing, setSelectedWing] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [needsGoogleAuth, setNeedsGoogleAuth] = useState(true);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [sheetConfig, setSheetConfig] = useState<SheetSyncResult | null>(() =>
    getStoredSheetConfig()
  );
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetMessage, setSheetMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [pendingSheetAction, setPendingSheetAction] = useState<
    'create' | 'update' | null
  >(null);

  const loadApplications = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setFetchError('');
    try {
      const result = await fetchApplicationsFromFirestore(forceRefresh);
      setApplications(result.apps);
      setLastFetchedAt(result.fetchedAt);
    } catch (err) {
      console.error('Firestore list error:', err);
      setFetchError(
        'अर्ज माहिती लोड करताना अडचण आली. कृपया इंटरनेट कनेक्शन तपासून पुन्हा प्रयत्न करा.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadApplications(false);

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
      unsubAuth();
    };
  }, []);

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
      saveStoredSheetConfig(result);

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
    <div className="min-h-screen bhagwa-canvas text-[#29150b] pb-16 font-noto">
      {/* Top Admin Navigation */}
      <nav className="no-print bhagwa-texture-medium text-[#431407] border-b-2 border-[#e5ab75] px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#fff4e6] text-[#7c2d12] border border-[#df9c5c] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              सार्वजनिक अर्ज फॉर्मवर जा
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#5c1d05] flex items-center gap-2">
                <span>मराठा सेवा संघ</span>
                <span className="text-xs bhagwa-texture-deep text-white border border-[#9a3412] px-2.5 py-0.5 rounded font-bold">
                  प्रशासक माहिती कक्ष
                </span>
              </h1>
              <p className="text-xs text-[#7c2d12] font-semibold">
                {user.name || 'केंद्रीय कार्यालयीन प्रशासक कक्ष'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 bhagwa-texture-deep hover:brightness-95 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer border border-[#9a3412]"
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

      <div className="no-print max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Google Sheets Sync Panel */}
        <section
          aria-label="Google Sheet माहिती जोडणी"
          className="bg-white rounded-xl border border-[#e9bd92] p-4 sm:p-5 shadow-2xs space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-[#5c1d05] flex items-center gap-2">
                <Sheet className="w-5 h-5 text-emerald-600" />
                Google Sheet वर सर्व अर्जांची माहिती जमा करा
              </h2>
              <p className="text-xs sm:text-sm text-[#7c2d12] font-medium">
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
                  <div className="text-xs bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-800 font-semibold">
                    Google Sheet जोडणी सज्ज
                  </div>

                  {sheetConfig?.spreadsheetId ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPendingSheetAction('update')}
                        disabled={isSyncingSheet}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bhagwa-texture-deep hover:brightness-95 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 border border-[#9a3412]"
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
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#fff4e6] hover:bg-[#ffe8cf] text-[#7c2d12] border border-[#df9c5c] rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                      >
                        नवीन Sheet तयार करा
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingSheetAction('create')}
                      disabled={isSyncingSheet}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bhagwa-texture-deep hover:brightness-95 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 border border-[#9a3412]"
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
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs bhagwa-texture-soft border border-[#e9bd92] rounded-lg px-3.5 py-2 text-[#5c1d05]">
              <div>
                जोडलेले Google Sheet:{' '}
                <strong className="font-bold">{sheetConfig.sheetTitle}</strong> | जमा केलेले अर्ज:{' '}
                <strong className="font-mono">{sheetConfig.syncedCount}</strong>
              </div>
              {sheetConfig.lastSyncedAt && (
                <div className="text-[#7c2d12] font-medium">
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

        {/* 4 कार्यकारिणी विभाग व एकूण अर्ज गोषवारा */}
        <section
          aria-label="कार्यकारिणी विभागानुसार अर्ज गोषवारा"
          className="bg-white rounded-xl border border-[#e9bd92] p-4 sm:p-5 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[#f3d4b4]">
            <h3 className="text-base sm:text-lg font-bold text-[#5c1d05] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#c2410c]" />
              प्राप्त अर्जांचा गोषवारा व कार्यकारिणी विभाग निवड
            </h3>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#7c2d12] font-semibold">
              <span className="inline-flex items-center gap-1 bhagwa-texture-soft border border-[#e9bd92] px-3 py-1 rounded-lg">
                <Users className="w-4 h-4 text-[#c2410c]" />
                एकूण अर्ज:{' '}
                <strong className="font-mono text-[#5c1d05]">
                  {summary.total}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1 bhagwa-texture-soft border border-[#e9bd92] px-3 py-1 rounded-lg">
                <IndianRupee className="w-4 h-4 text-[#c2410c]" />
                मासिक संकल्प:{' '}
                <strong className="font-mono text-[#5c1d05]">
                  ₹{summary.totalMonthlyPledge.toLocaleString('en-IN')}
                </strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedLevel === 'all'
                  ? 'bhagwa-texture-deep text-white border-[#9a3412] shadow-xs'
                  : 'bhagwa-texture-soft text-[#5c1d05] border-[#e9bd92] hover:brightness-97'
              }`}
            >
              <span>सर्व कार्यकारिणी</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                  selectedLevel === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#fed7aa] text-[#5c1d05]'
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-bold transition-all cursor-pointer text-left ${
                    active
                      ? 'bhagwa-texture-deep text-white border-[#9a3412] shadow-xs'
                      : 'bhagwa-texture-soft text-[#5c1d05] border-[#e9bd92] hover:brightness-97'
                  }`}
                >
                  <span className="truncate pr-1">{body}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono flex-shrink-0 ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-[#fed7aa] text-[#5c1d05]'
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
        <div className="bg-white p-4 rounded-xl border border-[#e9bd92] shadow-2xs space-y-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#c2410c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाव, मोबाईल, गाव, नोंदणी क्र., कक्ष किंवा पदाने शोधा..."
              className="w-full pl-9 pr-3 py-2 border border-[#e7b587] rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#f3d4b4] text-xs">
            <div>
              <label className="text-[11px] text-[#7c2d12] font-semibold block mb-0.5">
                जिल्हा:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#e7b587] rounded-md bg-white text-xs font-medium focus:outline-none focus:border-[#c2410c]"
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
              <label className="text-[11px] text-[#7c2d12] font-semibold block mb-0.5">
                मराठा सेवा संघ कक्ष:
              </label>
              <select
                value={selectedWing}
                onChange={(e) => setSelectedWing(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#e7b587] rounded-md bg-white text-xs font-medium focus:outline-none focus:border-[#c2410c]"
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
              <label className="text-[11px] text-[#7c2d12] font-semibold block mb-0.5">
                कार्यकारिणी स्तर:
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#e7b587] rounded-md bg-white text-xs font-medium focus:outline-none focus:border-[#c2410c]"
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

        {/* Applications Table */}
        <div className="bg-white rounded-xl border border-[#e9bd92] shadow-2xs overflow-hidden">
          <div className="p-4 bhagwa-texture-soft border-b border-[#e5ab75] flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-[#5c1d05] font-noto flex items-center gap-2 text-base">
                <span>प्राप्त अर्जांची यादी</span>
                <span className="text-xs bg-[#fed7aa] text-[#5c1d05] px-2.5 py-0.5 rounded-full font-mono font-bold border border-[#df9c5c]">
                  {filteredApps.length} / {summary.total}
                </span>
              </h3>
              <p className="text-xs text-[#7c2d12] font-medium mt-0.5">
                अर्जदाराच्या नावावर क्लिक करून उभ्या फॉरमॅटमध्ये संपूर्ण अर्ज पाहता येईल व प्रिंट करता येईल.
                {lastFetchedAt && (
                  <span className="ml-2 text-[#5c1d05]">
                    (अखेरचे लोड: {new Date(lastFetchedAt).toLocaleTimeString('en-IN')})
                  </span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadApplications(true)}
              disabled={isRefreshing || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bhagwa-texture-deep hover:brightness-95 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 border border-[#9a3412]"
              title="नवीन आलेले अर्ज लोड करा"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'तपासत आहे...' : 'नवीन अर्ज पहा'}
            </button>
          </div>

          {fetchError ? (
            <div className="p-8 text-center text-rose-700 font-semibold text-sm">
              {fetchError}
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-[#c2410c]">
              <div className="w-8 h-8 border-4 border-[#c2410c] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium">माहिती लोड होत आहे...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center text-[#5c1d05]">
              <p className="text-base font-bold">
                अद्याप या विभागामध्ये कोणताही अर्ज प्राप्त झालेला नाही.
              </p>
              <p className="text-xs sm:text-sm text-[#8c5a3c] mt-1">
                नवीन अर्ज भरताच ते येथे आपोआप दिसतील.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bhagwa-texture-medium text-[#431407] font-bold border-b border-[#df9c5c]">
                    <th className="p-3 text-center whitespace-nowrap">नोंदणी क्र.</th>
                    <th className="p-3 whitespace-nowrap">अर्जदाराचे नाव</th>
                    <th className="p-3 whitespace-nowrap">मोबाईल व संपर्क</th>
                    <th className="p-3 whitespace-nowrap">जिल्हा व गाव</th>
                    <th className="p-3 whitespace-nowrap">कार्यकारिणी, कक्ष व पद</th>
                    <th className="p-3 text-right whitespace-nowrap">मासिक संकल्प</th>
                    <th className="p-3 text-center whitespace-nowrap">अर्ज पहा</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3d4b4]">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-[#fff7ed] transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-[#9a3412] whitespace-nowrap">
                        {app.id}
                        <span className="block text-[11px] text-[#8c5a3c] font-sans">
                          {app.submissionDate}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full border border-[#df9c5c] bg-[#fff5e8] overflow-hidden flex items-center justify-center flex-shrink-0">
                            {app.photoUrl ? (
                              <img
                                src={app.photoUrl}
                                alt={app.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-[#9a3412]">
                                {app.fullName?.charAt(0) || 'म'}
                              </span>
                            )}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedApp(app)}
                              className="text-left font-bold text-[#431407] hover:text-[#c2410c] hover:underline text-sm sm:text-base cursor-pointer focus:outline-none"
                              title="उभ्या फॉरमॅटमध्ये संपूर्ण माहिती पहा"
                            >
                              {app.fullName}
                            </button>
                            <div className="text-xs text-[#8c5a3c]">
                              {app.gender} • वय: {app.age || '-'} वर्षे •{' '}
                              {app.occupationType}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 space-y-0.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[#29150b] font-semibold">
                          <Phone className="w-3.5 h-3.5 text-[#c2410c]" />
                          <span>{app.mobile}</span>
                        </div>
                        {app.email && (
                          <div className="flex items-center gap-1.5 text-[#7c2d12] text-xs truncate max-w-[170px]">
                            <Mail className="w-3.5 h-3.5 text-[#c2783e]" />
                            <span>{app.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-[#29150b]">
                          {app.district}
                        </div>
                        <div className="text-xs text-[#7c2d12]">
                          {app.village}
                          {app.taluka ? `, ता. ${app.taluka}` : ''}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-[#9a3412]">
                          {app.targetLevel}
                        </div>
                        <div className="text-xs font-semibold text-[#431407]">
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
                            <div className="font-bold font-mono text-[#29150b]">
                              ₹{app.monthlyContribution}/-
                            </div>
                            <div className="text-[11px] text-[#7c2d12]">
                              {app.paymentFrequency || 'सहामाही'}
                            </div>
                          </>
                        ) : (
                          <div className="text-[#a1785a] text-xs italic">
                            ऐच्छिक
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bhagwa-texture-deep hover:brightness-95 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer border border-[#9a3412]"
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

      {/* Confirmation Modal */}
      {pendingSheetAction && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#291003]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border-2 border-[#c2410c] shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bhagwa-texture-medium text-[#7c2d12] flex items-center justify-center flex-shrink-0 border border-[#df9c5c]">
                  <Sheet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#5c1d05]">
                  Google Sheet मध्ये माहिती जमा करायची का?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPendingSheetAction(null)}
                aria-label="बंद करा"
                className="text-[#8c5a3c] hover:text-[#431407] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bhagwa-texture-soft border border-[#e9bd92] rounded-xl p-3.5 text-sm text-[#431407] space-y-1.5">
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
                className="px-4 py-2 bg-[#fff4e6] hover:bg-[#ffe8cf] text-[#5c1d05] rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={executeConfirmedSheetSync}
                className="px-4 py-2 bhagwa-texture-deep hover:brightness-95 text-white rounded-lg text-sm font-bold shadow-xs transition-all cursor-pointer border border-[#9a3412]"
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
