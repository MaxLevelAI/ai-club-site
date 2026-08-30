import { NextResponse } from 'next/server';
import { CLUB_CONFIG } from '@/app/config';
import { countRegistrations } from '@/db/registrations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count =
      (await countRegistrations()) + CLUB_CONFIG.preExistingRegistrationCount;
    return NextResponse.json(
      { count },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Registration count failed', error);
    return NextResponse.json(
      { error: 'Registration count is unavailable.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
