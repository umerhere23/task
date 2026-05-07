import crypto from 'crypto';

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = 'sha256';

function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashPassword(password: string, salt: string = generateSalt()): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  return computedHash === hash;
}

export function encodePassword(password: string): string {
  const { hash, salt } = hashPassword(password);
  return `${salt}:${hash}`;
}

export function decodeAndVerifyPassword(password: string, encoded: string): boolean {
  const [salt, hash] = encoded.split(':');
  return verifyPassword(password, hash, salt);
}
