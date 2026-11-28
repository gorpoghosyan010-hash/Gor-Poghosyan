'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Յուրաքանչյուր էջի բացումը ուղարկում է /api/track (առանց cookie-ների)
export default function Tracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith('/admin') || path.startsWith('/booking/admin')) return;
    try {
      const q = new URLSearchParams(window.location.search);
      const body = JSON.stringify({ p: path, r: document.referrer || '', s: q.get('utm_source') || q.get('ref') || '' });
      if (!navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'text/plain' }))) {
        fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {});
      }
    } catch { /* ignore */ }
  }, [path]);
  return null;
}
