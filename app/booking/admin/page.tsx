import { redirect } from 'next/navigation';
// Հին հասցեն՝ այժմ ամեն ինչ /admin էջում է
export default function OldAdmin() { redirect('/admin'); }
