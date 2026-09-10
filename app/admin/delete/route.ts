import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/app/admin-auth';
import { deleteRegistration } from '@/db/registrations';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;

  // Only an authorized organizer (valid access-code cookie) may delete.
  if (!(await isAdminAuthorized())) {
    return NextResponse.redirect(new URL('/admin', origin), { status: 303 });
  }

  const formData = await request.formData().catch(() => null);
  const rawId = formData?.get('id');
  const id = typeof rawId === 'string' ? Number.parseInt(rawId, 10) : NaN;

  if (Number.isInteger(id) && id > 0) {
    try {
      await deleteRegistration(id);
    } catch (error) {
      console.error('Delete registration failed', error);
    }
  }

  return NextResponse.redirect(new URL('/admin', origin), { status: 303 });
}
