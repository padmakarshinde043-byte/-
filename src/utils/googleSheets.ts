import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import { ApplicationFormData } from '../types/index';
import { APPLICATION_EXPORT_HEADERS, applicationToExportRow } from './logic';

export const GOOGLE_SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];

export const AUTHORIZED_ADMIN_EMAILS = [
  'padmakarshinde043@gmail.com',
  '123dhananjay.patil@gmail.com',
];

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

const provider = new GoogleAuthProvider();
GOOGLE_SHEETS_SCOPES.forEach((scope) => provider.addScope(scope));

// Keep OAuth access token strictly in memory (never in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface SheetSyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetTitle: string;
  syncedCount: number;
  lastSyncedAt: string;
}

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess?.(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure?.();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google खात्याचा प्रवेश टोकन प्राप्त होऊ शकला नाही.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

function buildSheetValues(
  applications: ApplicationFormData[]
): (string | number)[][] {
  return [
    APPLICATION_EXPORT_HEADERS,
    ...applications.map((appItem) => applicationToExportRow(appItem)),
  ];
}

async function formatHeaderRow(
  accessToken: string,
  spreadsheetId: string,
  sheetId: number
) {
  try {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.075, green: 0.231, blue: 0.431 },
                    textFormat: {
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                      bold: true,
                    },
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)',
              },
            },
          ],
        }),
      }
    );
  } catch {
    // Non-critical styling failure can be safely ignored
  }
}

export async function createAndPopulateGoogleSheet(
  accessToken: string,
  applications: ApplicationFormData[]
): Promise<SheetSyncResult> {
  const createRes = await fetch(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: 'मराठा सेवा संघ - पदाधिकारी अर्ज 2026',
        },
        sheets: [
          {
            properties: {
              title: 'अर्ज यादी',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        ],
      }),
    }
  );

  if (!createRes.ok) {
    const errBody = await createRes.json().catch(() => ({}));
    throw new Error(
      errBody?.error?.message || 'नवीन Google Sheet तयार करताना त्रुटी आली.'
    );
  }

  const created = await createRes.json();
  const spreadsheetId: string = created.spreadsheetId;
  const spreadsheetUrl: string =
    created.spreadsheetUrl ||
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  const firstSheet = created.sheets?.[0]?.properties;
  const sheetTitle: string = firstSheet?.title || 'अर्ज यादी';
  const sheetId: number = firstSheet?.sheetId ?? 0;

  const values = buildSheetValues(applications);
  const range = `${sheetTitle}!A1`;

  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!writeRes.ok) {
    const errBody = await writeRes.json().catch(() => ({}));
    throw new Error(
      errBody?.error?.message || 'Google Sheet मध्ये माहिती लिहिताना त्रुटी आली.'
    );
  }

  await formatHeaderRow(accessToken, spreadsheetId, sheetId);

  return {
    spreadsheetId,
    spreadsheetUrl,
    sheetTitle,
    syncedCount: applications.length,
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function updateExistingGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  applications: ApplicationFormData[]
): Promise<SheetSyncResult> {
  // Always read spreadsheet metadata first to determine the actual first tab title
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,spreadsheetUrl,sheets.properties`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!metaRes.ok) {
    const errBody = await metaRes.json().catch(() => ({}));
    const status = metaRes.status;
    if (status === 404) {
      throw new Error(
        'लिंक केलेली Google Sheet सापडली नाही. कृपया नवीन Sheet तयार करा.'
      );
    }
    if (status === 401 || status === 403) {
      cachedAccessToken = null;
      throw new Error(
        'Google प्रवेश कालबाह्य झाला आहे किंवा परवानगी नाही. कृपया पुन्हा Sign in करा.'
      );
    }
    throw new Error(
      errBody?.error?.message || 'Google Sheet तपासताना त्रुटी आली.'
    );
  }

  const meta = await metaRes.json();
  const firstSheet = meta.sheets?.[0]?.properties;
  if (!firstSheet?.title) {
    throw new Error('Google Sheet मधील टॅबची माहिती मिळाली नाही.');
  }

  const sheetTitle: string = firstSheet.title;
  const spreadsheetUrl: string =
    meta.spreadsheetUrl ||
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  const clearRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      sheetTitle
    )}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!clearRes.ok) {
    const errBody = await clearRes.json().catch(() => ({}));
    throw new Error(
      errBody?.error?.message || 'Google Sheet साफ करताना त्रुटी आली.'
    );
  }

  const values = buildSheetValues(applications);
  const range = `${sheetTitle}!A1`;

  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!writeRes.ok) {
    const errBody = await writeRes.json().catch(() => ({}));
    throw new Error(
      errBody?.error?.message || 'Google Sheet अपडेट करताना त्रुटी आली.'
    );
  }

  if (typeof firstSheet.sheetId === 'number') {
    await formatHeaderRow(accessToken, spreadsheetId, firstSheet.sheetId);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    sheetTitle,
    syncedCount: applications.length,
    lastSyncedAt: new Date().toISOString(),
  };
}
