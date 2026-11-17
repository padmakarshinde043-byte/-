import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { generateCsvContent, generateApplicationId } from './src/utils/logic.ts';
import { ApplicationFormData } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'applications.json');
const SHEET_CONFIG_FILE = path.resolve(DATA_DIR, 'sheet-config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const INITIAL_SEED_APPLICATIONS: ApplicationFormData[] = [
  {
    id: 'MSS-2026-0001',
    createdAt: '2026-11-06T09:30:00.000Z',
    status: 'मंजूर',
    fullName: 'रणजीत प्रतापराव गायकवाड',
    gender: 'पुरुष',
    dob: '1985-05-12',
    age: 41,
    mobile: '9822114455',
    alternateMobile: '9423114455',
    email: 'ranjeet.gaikwad@example.com',
    houseNo: 'शिवनेरी निवास, प्लॉट नं. 28',
    street: 'राजमाता जिजाऊ मार्ग',
    village: 'पुणे',
    post: 'पुणे',
    taluka: 'हवेली',
    district: 'पुणे',
    pincode: '411038',
    occupationType: 'उद्योग',
    designationOrBusiness: 'कृषी उपकरणे उत्पादन व व्यापार',
    targetLevel: 'राज्य कार्यकारिणी',
    division: 'पुणे / पश्चिम महाराष्ट्र विभाग',
    targetWing: 'संभाजी ब्रिगेड',
    targetPost: 'उपाध्यक्ष',
    isLifeMember: true,
    lifeMemberSince: '2014',
    lifeMemberNo: 'LM-3482',
    isPoliticalActive: false,
    monthlyContribution: 5000,
    paymentFrequency: 'वार्षिक',
    familyMembers: [
      {
        id: 'f1',
        srNo: 1,
        fullName: 'सुप्रिया रणजीत गायकवाड',
        relation: 'पत्नी',
        dob: '1989-08-20',
        occupation: 'खाजगी सेवा (शिक्षिका)',
        education: 'M.A., B.Ed.',
      },
      {
        id: 'f2',
        srNo: 2,
        fullName: 'शिवराज रणजीत गायकवाड',
        relation: 'मुलगा',
        dob: '2012-03-15',
        occupation: 'विद्यार्थी',
        education: '8 वी',
      },
    ],
    photoUrl: '',
    signatureUrl: '',
    agreedToTerms: true,
    submissionDate: '06-11-2026',
    submissionPlace: 'पुणे',
  },
  {
    id: 'MSS-2026-0002',
    createdAt: '2026-11-08T11:15:00.000Z',
    status: 'तपासणी सुरू',
    fullName: 'अश्विनी अमोल जाधव',
    gender: 'स्त्री',
    dob: '1990-10-18',
    age: 36,
    mobile: '9403889900',
    alternateMobile: '',
    email: 'ashwini.jadhav@example.com',
    houseNo: '54/ब',
    street: 'क्रांतिसूर्य नगर',
    village: 'छत्रपती संभाजीनगर',
    post: 'छत्रपती संभाजीनगर',
    taluka: 'छत्रपती संभाजीनगर',
    district: 'छत्रपती संभाजीनगर',
    pincode: '431001',
    occupationType: 'खाजगी सेवा',
    designationOrBusiness: 'विधी सल्लागार / वकील',
    targetLevel: 'विभागीय कार्यकारिणी',
    division: 'छत्रपती संभाजीनगर / मराठवाडा विभाग',
    targetWing: 'जिजाऊ ब्रिगेड (महिला कक्ष)',
    targetPost: 'सचिव',
    isLifeMember: true,
    lifeMemberSince: '2019',
    lifeMemberNo: 'LM-5891',
    isPoliticalActive: false,
    monthlyContribution: 3000,
    paymentFrequency: 'सहामाही',
    familyMembers: [
      {
        id: 'f3',
        srNo: 1,
        fullName: 'अमोल शांताराम जाधव',
        relation: 'पती',
        dob: '1986-04-10',
        occupation: 'व्यवसाय',
        education: 'B.E. Civil',
      },
    ],
    photoUrl: '',
    signatureUrl: '',
    agreedToTerms: true,
    submissionDate: '08-11-2026',
    submissionPlace: 'छत्रपती संभाजीनगर',
  },
  {
    id: 'MSS-2026-0003',
    createdAt: '2026-11-10T14:45:00.000Z',
    status: 'प्रलंबित',
    fullName: 'तानाजी बाजीराव मोरे',
    gender: 'पुरुष',
    dob: '1982-01-25',
    age: 44,
    mobile: '9765432109',
    alternateMobile: '9860123456',
    email: 'tanaji.more@example.com',
    houseNo: 'घर क्र. 12',
    street: 'भवानी चौक, मोरे गल्ली',
    village: 'कुरुंदवाड',
    post: 'कुरुंदवाड',
    taluka: 'शिरोळ',
    district: 'कोल्हापूर',
    pincode: '416106',
    occupationType: 'शेती',
    designationOrBusiness: 'आधुनिक शेती व दुग्ध व्यवसाय',
    targetLevel: 'जिल्हा कार्यकारिणी',
    division: 'पुणे / पश्चिम महाराष्ट्र विभाग',
    targetWing: 'शेतकरी कक्ष / जिजाऊ शेतकरी परिषद',
    targetPost: 'अध्यक्ष',
    isLifeMember: false,
    isPoliticalActive: false,
    monthlyContribution: 2000,
    paymentFrequency: 'सहामाही',
    familyMembers: [
      {
        id: 'f4',
        srNo: 1,
        fullName: 'बाजीराव ज्ञानोबा मोरे',
        relation: 'वडील',
        dob: '1952-06-15',
        occupation: 'सेवा निवृत्त',
        education: 'मॅट्रिक',
      },
      {
        id: 'f5',
        srNo: 2,
        fullName: 'मंगला तानाजी मोरे',
        relation: 'पत्नी',
        dob: '1986-09-05',
        occupation: 'गृहउद्योग / शेती',
        education: 'B.A.',
      },
    ],
    photoUrl: '',
    signatureUrl: '',
    agreedToTerms: true,
    submissionDate: '10-11-2026',
    submissionPlace: 'कोल्हापूर',
  },
];

function readApplications(): ApplicationFormData[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_SEED_APPLICATIONS, null, 2), 'utf-8');
      return INITIAL_SEED_APPLICATIONS;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading applications file:', err);
    return INITIAL_SEED_APPLICATIONS;
  }
}

function writeApplications(applications: ApplicationFormData[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(applications, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing applications file:', err);
  }
}

interface SheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetTitle: string;
  syncedCount: number;
  lastSyncedAt: string;
}

function readSheetConfig(): SheetConfig | null {
  try {
    if (!fs.existsSync(SHEET_CONFIG_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(SHEET_CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as SheetConfig;
  } catch (err) {
    console.error('Error reading sheet config file:', err);
    return null;
  }
}

function writeSheetConfig(config: SheetConfig | null) {
  try {
    if (!config) {
      if (fs.existsSync(SHEET_CONFIG_FILE)) {
        fs.unlinkSync(SHEET_CONFIG_FILE);
      }
      return;
    }
    fs.writeFileSync(SHEET_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing sheet config file:', err);
  }
}

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // API Endpoints

  // 1. Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. Get all applications
  app.get('/api/applications', (req, res) => {
    const apps = readApplications();
    const { district, wing, level, search, status } = req.query;

    let filtered = [...apps];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.fullName?.toLowerCase().includes(q) ||
          a.mobile?.includes(q) ||
          a.id?.toLowerCase().includes(q) ||
          a.village?.toLowerCase().includes(q) ||
          a.district?.toLowerCase().includes(q) ||
          a.targetWing?.toLowerCase().includes(q)
      );
    }

    if (district && typeof district === 'string' && district !== 'all') {
      filtered = filtered.filter((a) => a.district === district);
    }

    if (wing && typeof wing === 'string' && wing !== 'all') {
      filtered = filtered.filter((a) => a.targetWing === wing);
    }

    if (level && typeof level === 'string' && level !== 'all') {
      filtered = filtered.filter((a) => a.targetLevel === level);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      filtered = filtered.filter((a) => a.status === status);
    }

    res.json({
      success: true,
      total: apps.length,
      filteredCount: filtered.length,
      applications: filtered,
    });
  });

  // 3. Get single application by ID
  app.get('/api/applications/:id', (req, res) => {
    const apps = readApplications();
    const appItem = apps.find((a) => a.id === req.params.id);
    if (!appItem) {
      return res.status(404).json({ success: false, message: 'अर्ज आढळला नाही.' });
    }
    res.json({ success: true, application: appItem });
  });

  // 4. Submit new application
  app.post('/api/applications', (req, res) => {
    const body = req.body as ApplicationFormData;
    if (!body || !body.fullName || !body.mobile) {
      return res.status(400).json({
        success: false,
        message: 'कृपया संपूर्ण नाव आणि मोबाईल नंबर आवश्यक आहे.',
      });
    }

    const apps = readApplications();
    const maxSeq = apps.reduce((max, a) => {
      const m = a.id?.match(/MSS-2026-(\d+)/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, apps.length);
    const newId = generateApplicationId(maxSeq + 1);

    const newApp: ApplicationFormData = {
      ...body,
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'प्रलंबित',
      submissionDate: body.submissionDate || new Date().toLocaleDateString('en-GB'),
    };

    apps.unshift(newApp);
    writeApplications(apps);

    res.status(201).json({
      success: true,
      message: 'आपला अर्ज यशस्वीपणे स्वीकारण्यात आला आहे.',
      application: newApp,
    });
  });

  // 5. Update application status
  app.patch('/api/applications/:id/status', (req, res) => {
    const { status } = req.body;
    const apps = readApplications();
    const idx = apps.findIndex((a) => a.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'अर्ज आढळला नाही.' });
    }
    apps[idx].status = status;
    writeApplications(apps);
    res.json({ success: true, application: apps[idx] });
  });

  // 6. Delete application
  app.delete('/api/applications/:id', (req, res) => {
    let apps = readApplications();
    const exists = apps.some((a) => a.id === req.params.id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'अर्ज आढळला नाही.' });
    }
    apps = apps.filter((a) => a.id !== req.params.id);
    writeApplications(apps);
    res.json({ success: true, message: 'अर्ज यशस्वीरित्या हटवला.' });
  });

  // 7. Export CSV
  app.get('/api/export/csv', (_req, res) => {
    const apps = readApplications();
    const csvData = generateCsvContent(apps);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="maratha_seva_sangh_applications_2026.csv"'
    );
    res.send(csvData);
  });

  // 8. Admin login verification
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const normalizedUser = typeof username === 'string' ? username.trim() : '';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Maratha@2026';

    const validAdmin =
      (normalizedUser === 'admin' && password === adminPassword) ||
      (normalizedUser.toLowerCase() === '123dhananjay.patil@gmail.com' &&
        password === adminPassword);

    if (validAdmin) {
      return res.json({
        success: true,
        user: {
          username: normalizedUser,
          name: 'धनंजय पाटील - केंद्रीय कार्यालयीन सचिव',
          role: 'Admin',
        },
        token: 'mss_admin_token_' + Date.now(),
      });
    }

    return res.status(401).json({
      success: false,
      message: 'अवैध वापरकर्ता नाव किंवा पासवर्ड. कृपया पुन्हा प्रयत्न करा.',
    });
  });

  // 9. Reset or reload seed data
  app.post('/api/seed', (_req, res) => {
    writeApplications(INITIAL_SEED_APPLICATIONS);
    res.json({
      success: true,
      message: 'डेमो अर्ज यशस्वीरित्या लोड केले.',
      count: INITIAL_SEED_APPLICATIONS.length,
    });
  });

  // 10. Google Sheet linked configuration persistence
  app.get('/api/sheets/config', (_req, res) => {
    const config = readSheetConfig();
    res.json({ success: true, config });
  });

  app.post('/api/sheets/config', (req, res) => {
    const body = req.body as Partial<SheetConfig>;
    if (!body?.spreadsheetId || !body?.spreadsheetUrl) {
      return res.status(400).json({
        success: false,
        message: 'Google Sheet तपशील अपूर्ण आहेत.',
      });
    }
    const config: SheetConfig = {
      spreadsheetId: String(body.spreadsheetId),
      spreadsheetUrl: String(body.spreadsheetUrl),
      sheetTitle: String(body.sheetTitle || 'अर्ज यादी'),
      syncedCount: Number(body.syncedCount || 0),
      lastSyncedAt: String(body.lastSyncedAt || new Date().toISOString()),
    };
    writeSheetConfig(config);
    res.json({ success: true, config });
  });

  app.delete('/api/sheets/config', (_req, res) => {
    writeSheetConfig(null);
    res.json({ success: true });
  });

  // Serve static assets in /public if requested directly
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Vite middleware in dev or static dist in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`मराठा सेवा संघ सर्व्हर कार्यरत आहे: http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
