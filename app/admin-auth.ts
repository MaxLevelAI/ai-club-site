import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'ai-club-admin';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

// The single organizer access code. Set ADMIN_CODE as a hosted runtime value
// before publishing. When it is missing, the admin area stays locked for
// everyone.
export function getAdminCode(): string | null {
  const code = process.env.ADMIN_CODE?.trim();
  return code ? code : null;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

// The cookie stores a hash of the code, never the code itself, so the plaintext
// access code is never written to the browser.
async function cookieTokenFor(code: string): Promise<string> {
  const data = new TextEncoder().encode(`ai-club-admin::v1::${code}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function isAdminAuthorized(): Promise<boolean> {
  const code = getAdminCode();
  if (!code) return false;

  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  return constantTimeEqual(token, await cookieTokenFor(code));
}

// Returns the cookie token to store when the submitted code is correct, or null
// when it is wrong or no code is configured.
export async function verifyAdminCode(submitted: string): Promise<string | null> {
  const code = getAdminCode();
  if (!code) return null;
  if (!constantTimeEqual(submitted, code)) return null;
  return cookieTokenFor(code);
}
