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
    // Never fail the public counter. Fall back to the baseline so the site
    // always shows at least the starting number instead of an error or dash.
    return NextResponse.json(
      { count: CLUB_CONFIG.preExistingRegistrationCount },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
