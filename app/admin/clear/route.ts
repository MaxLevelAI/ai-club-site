import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/app/admin-auth';
import { deleteAllRegistrations } from '@/db/registrations';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;

  if (request.headers.get('origin') !== origin) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!(await isAdminAuthorized())) {
    return NextResponse.redirect(new URL('/admin', origin), { status: 303 });
  }

  try {
    await deleteAllRegistrations();
  } catch (error) {
    console.error('Clear registrations failed', error);
    return new NextResponse('Unable to clear registrations. Please return to the admin page and try again.', { status: 500 });
  }

  return NextResponse.redirect(new URL('/admin', origin), { status: 303 });
}
