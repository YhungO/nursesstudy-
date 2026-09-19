import crypto from 'crypto';

/**
 * RFC 5322 compliant regex for robust email format validation
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Secure PBKDF2 password hashing using native Node.js crypto
 * Stored format: <salt_hex>:<hash_hex>
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain text password against a stored password.
 * Supports salted PBKDF2 hashes (salt:hash) and legacy plain text passwords (with auto-upgrade flag).
 */
export function verifyPassword(password: string, storedHash: string): { isValid: boolean; needsRehash: boolean } {
  if (!password || !storedHash) {
    return { isValid: false, needsRehash: false };
  }

  // Modern salted PBKDF2 hash
  if (storedHash.includes(':')) {
    const parts = storedHash.split(':');
    if (parts.length === 2) {
      const [salt, key] = parts;
      const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
      try {
        const isValid = crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
        return { isValid, needsRehash: false };
      } catch {
        return { isValid: false, needsRehash: false };
      }
    }
  }

  // Legacy plain text match (needs upgrade to PBKDF2)
  if (password === storedHash) {
    return { isValid: true, needsRehash: true };
  }

  return { isValid: false, needsRehash: false };
}

/**
 * NOTE FOR DEVELOPERS:
 * In production, the verification code must be sent via real email service
 * (e.g. Resend, SendGrid, or Firebase Auth). Never generate or display the code on the client side.
 *
 * Generates a 6-digit numeric reset code for password recovery
 */
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
