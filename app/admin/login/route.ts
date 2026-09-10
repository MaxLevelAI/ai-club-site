import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  verifyAdminCode,
} from '@/app/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;

  const formData = await request.formData().catch(() => null);
  const submitted = formData?.get('code');
  const code = typeof submitted === 'string' ? submitted.trim() : '';

  const token = code ? await verifyAdminCode(code) : null;
  if (!token) {
    return NextResponse.redirect(new URL('/admin?error=1', origin), { status: 303 });
  }

  const response = NextResponse.redirect(new URL('/admin', origin), { status: 303 });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return response;
}
