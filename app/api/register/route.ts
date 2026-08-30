import { NextResponse } from 'next/server';
import { saveRegistration } from '@/db/registrations';

export const dynamic = 'force-dynamic';

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get('origin');
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return json({ error: 'Invalid request origin.' }, 403);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 2048) {
    return json({ error: 'Request is too large.' }, 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Please enter your name and try again.' }, 400);
  }

  if (!body || typeof body !== 'object') {
    return json({ error: 'Please enter your name and try again.' }, 400);
  }

  const candidate = body as { name?: unknown; sessionKey?: unknown };
  const name = typeof candidate.name === 'string'
    ? candidate.name.trim().replace(/\s+/g, ' ')
    : '';
  const sessionKey = typeof candidate.sessionKey === 'string'
    ? candidate.sessionKey
    : '';

  if (!name || name.length > 100 || /[\u0000-\u001F\u007F]/.test(name)) {
    return json({ error: 'Please enter a valid name.' }, 400);
  }

  if (!/^[A-Za-z0-9-]{20,128}$/.test(sessionKey)) {
    return json({ error: 'Please refresh the page and try again.' }, 400);
  }

  try {
    const result = await saveRegistration(name, sessionKey);
    return json({ ok: true, created: result.created }, result.created ? 201 : 200);
  } catch (error) {
    console.error('Registration save failed', error);
    return json({ error: 'Registration could not be saved. Please try again.' }, 500);
  }
}
