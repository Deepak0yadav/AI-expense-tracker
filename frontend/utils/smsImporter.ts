import { PermissionsAndroid, Platform, Alert } from 'react-native';

// Lazy require keeps iOS/web builds safe
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SmsAndroid: any = Platform.OS === 'android' ? require('react-native-get-sms-android') : null;

export type ParsedTxn = {
  amount: number; // negative for expense, positive for income
  merchant: string;
  description: string;
  date?: string; // ISO string
  mode: string; // UPI | Card | Bank
};

const HOST_DEFAULT = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || `${HOST_DEFAULT}/api/users`;

export async function importBankSms(limit = 200): Promise<ParsedTxn[]> {
  if (Platform.OS !== 'android') return [];
  if (!SmsAndroid || typeof SmsAndroid.list !== 'function') {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[smsImporter] Native SMS module not available. You must run a Dev Build (expo run:android), not Expo Go.');
    }
    Alert.alert(
      'Import from SMS',
      'Native SMS access requires a Dev Build. Please run "npx expo run:android" to install a development build and try again.'
    );
    return [];
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_SMS,
    {
      title: 'Read SMS permission',
      message: 'Allow reading bank SMS to import expenses automatically.',
      buttonPositive: 'OK',
    }
  );
  if (granted !== PermissionsAndroid.RESULTS.GRANTED) return [];

  const filter = {
    box: 'inbox',
    indexFrom: 0,
    maxCount: limit,
    // address: 'VM-ICICIB',
    // bodyRegex: '(?i)(debited|spent|purchase|txn|withdrawn|payment|pos)'
  };

  return new Promise((resolve) => {
    SmsAndroid.list(
      JSON.stringify(filter),
      (_fail: any) => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[smsImporter] SmsAndroid.list failed');
        }
        resolve([]);
      },
      (_count: number, smsList: string) => {
        try {
          const raw: Array<{ address: string; body: string; date: number }> = JSON.parse(smsList) || [];
          // First pass: strict sender + looksLikeTxn
          let parsed = raw
            .filter(m => looksLikeBankSender(m.address) && looksLikeTxn(m.body))
            .map(m => parseTransaction(m))
            .filter(Boolean) as ParsedTxn[];
          // Fallback: ignore sender filter but keep txn keyword filter
          if (parsed.length === 0) {
            parsed = raw
              .filter(m => looksLikeTxn(m.body))
              .map(m => parseTransaction(m))
              .filter(Boolean) as ParsedTxn[];
          }
          // Light debug
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log(`[smsImporter] raw=${raw.length} parsed=${parsed.length}`);
          }
          resolve(parsed);
        } catch {
          resolve([]);
        }
      }
    );
  });
}

export async function uploadTransactions(transactions: ParsedTxn[]) {
  for (const t of transactions) {
    try {
      await fetch(`${API_BASE}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
    } catch {
      // ignore individual failures
    }
  }
}

function looksLikeBankSender(addr: string) {
  const a = addr || '';
  // Common Indian sender patterns: VM-ICICIB, VK-HDFCBK, etc. Also allow numeric senders (emulator, shortcodes)
  return /[A-Z]{2,3}-[A-Z0-9]{3,12}|(ICICI|HDFC|SBI|AXIS|KOTAK|PNB|BOB|YES|IDFC|PAYTM|AMAZON|FLIPKART)/i.test(a)
    || /^[0-9]{5,15}$/.test(a);
}

function looksLikeTxn(body: string) {
  // Consider a txn if it mentions debit/credit/payment keywords; currency token optional (some test SMS may omit or have typos)
  return /(debited|credited|spent|purchase|withdrawn|payment|pos|upi|imps|neft|txn)/i.test(body);
}

function parseTransaction(m: { body: string; date: number; address: string }): ParsedTxn | null {
  const body = m.body || '';

  // Amount: prefer currency tokens, but be tolerant (allow NR/INR/RS/₹; otherwise find amount near keywords)
  const currencyMatch = body.match(/(?:i?nr|rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  let amount = currencyMatch ? Number(currencyMatch[1].replace(/,/g, '')) : undefined;
  if (!amount) {
    const nearMatch = body.match(/(?:debited|credited|spent|purchase|withdrawn|payment|pos|upi|imps|neft|txn)[^0-9]{0,20}([\d,]+(?:\.\d{1,2})?)/i);
    if (nearMatch) amount = Number(nearMatch[1].replace(/,/g, ''));
  }
  if (!amount || Number.isNaN(amount)) return null;

  const isDebit = /(debited|spent|withdrawn|payment|purchase|pos|upi)/i.test(body) && !/credited/i.test(body);
  const signedAmount = isDebit ? -amount : amount;

  const merchMatch = body.match(/(?:at|to)\s+([A-Za-z0-9 &._-]{2,40})/i);
  const merchant = merchMatch?.[1]?.trim() || (isDebit ? 'Expense' : 'Income');

  const mode = /upi/i.test(body) ? 'UPI' : /pos|card|debit card|credit card/i.test(body) ? 'Card' : 'Bank';

  return {
    amount: signedAmount,
    merchant,
    description: body.slice(0, 140),
    date: new Date(m.date).toISOString(),
    mode,
  };
}
