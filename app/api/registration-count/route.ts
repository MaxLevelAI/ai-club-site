import { NextResponse } from 'next/server';
import { countRegistrations } from '@/db/registrations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await countRegistrations();
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
