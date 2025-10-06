import * as moment from 'moment';
import * as crypto from 'crypto';

/**
 * Escape unsafe characters.
 */
export function escapeRegexSpecialCharacters(string: string): string {
  return string.replace(/[<>*()?+%]/g, '\\$&');
}

/**
 * Generate a random numeric string.
 */
export function generateRandomNumericString(length = 6): string {
  if (isNaN(length)) {
    throw new TypeError('Length must be a number');
  }
  if (length < 1) {
    throw new RangeError('Length must be at least 1');
  }
  const possible = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return code;
}

/**
 * Add min to current time.
 */
export function addMinutesToCurrentTime(): string {
  const currentTime = new Date();
  const date = moment(currentTime).add(15, 'minutes').toISOString();
  return date;
}

/**
 * Generate a random 4-digit OTP.
 */
export function generateOTP(): string {
  return Math.floor(Math.random() * (9999 - 999 + 1) + 999).toString();
}

/**
 * Convert bigint values in a JSON to string.
 */
export function parseBigInt(obj: any): any {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj;
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      result[key] = typeof value === 'bigint' ? value.toString() : value;
    }
  }
  return result;
}

/**
 * transform string location
 */
export function transformLocation({ value }: { value: string }) {
  if (typeof value === 'string') {
    const [lng, lat] = value.split(',').map((coord) => parseFloat(coord.trim()));
    return { type: 'Point', coordinates: [lng, lat] };
  }
  return value;
}

/**
 * Utility function to get the start of today
 */
export function startOfToday(): Date {
  const now = new Date();
  const startOfTodayDate = new Date(now.setHours(0, 0, 0, 0));
  return startOfTodayDate;
}

/**
 * Utility function to get the end of today
 */
export function endOfToday(): Date {
  const now = new Date();
  const endOfTodayDate = new Date(now.setHours(23, 59, 59, 999));
  return endOfTodayDate;
}

/**
 * Utility function to remove unwanted fields from object
 */
export function omitFields<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const newObj = { ...obj };
  keys.forEach((key) => {
    delete newObj[key];
  });
  return newObj;
}

export function encryptToken(token: string, encryption_Key: string) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update(encryption_Key).digest();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedToken: string, encryption_Key: string) {
  const algorithm = 'aes-256-cbc';

  const [ivHex, encrypted] = encryptedToken.split(':');
  if (!ivHex || !encrypted) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.createHash('sha256').update(encryption_Key).digest();

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function generateRandomEmail(domain: string = 'example.com'): string {
  const randomString = Math.random().toString(36).substring(2, 11);
  return `${randomString}@${domain}`;
}

/**
 *  Utility function to check if the payment details' month and year are before or equal to the current month and year
 */
export function isCardExpired(month: string, year: string): boolean {
  const cardMonth = parseInt(month, 10);
  const cardYear = parseInt(year, 10);

  // Get the current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Compare the year first
  if (cardYear < currentYear) {
    return true; // Card year is before the current year
  } else if (cardYear === currentYear) {
    // If the year is the same, compare the month
    if (cardMonth <= currentMonth) {
      return true; // Card month is before or equal to the current month
    }
  }

  return false;
}
