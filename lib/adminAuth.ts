import { createHash, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

// Ադմին էջի գաղտնաբառը՝ ADMIN_PASSWORD (կամ նախկին BOOKING_ADMIN_PASSWORD)
const password = () => process.env.ADMIN_PASSWORD || process.env.BOOKING_ADMIN_PASSWORD || '';
const h = (s: string) => createHash('sha256').update(s).digest();

export function isAdmin(req: Request) {
  const pw = password();
  return Boolean(pw) && timingSafeEqual(h(pw), h(req.headers.get('x-admin-password') || ''));
}

export const denyAdmin = () =>
  NextResponse.json({ ok: false, error: password() ? 'unauthorized' : 'no_password' }, { status: 401 });
