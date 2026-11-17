'use client';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useLanguage } from './LanguageContext';
import { splash } from '../content/i18n';

export const SPLASH_KEY = 'garon-splash-seen';
const DURATION = 1200;

// Ներածական էկրանը՝ առավելագույնը 1.2 վ, մեկ անգամ բրաուզերի սեսիայում։
// Էջը միշտ ամբողջությամբ ռենդեր է արվում տակը (որոնողները և LCP-ն տեսնում են բովանդակությունը).
// Ցուցադրելու որոշումը կայացնում է <head>-ի փոքր script-ը (html.splashOn դասը)՝ առաջին նկարվելուց առաջ.
// prefers-reduced-motion-ի կամ արդեն տեսած լինելու դեպքում splash չկա։
export default function Splash() {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('splashOn')) { setVisible(false); return; }
    try { window.sessionStorage.setItem(SPLASH_KEY, '1'); } catch { /* private mode */ }
    const timer = window.setTimeout(() => { root.classList.remove('splashOn'); setVisible(false); }, DURATION);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  const s = splash[lang];
  return (
    <div className="splash" aria-hidden="true">
      <div className="splashGrid" />
      <svg className="splashVilla" viewBox="0 0 600 300" fill="none" stroke="currentColor">
        <path pathLength={1} className="draw draw-1" d="M16 252 H584" />
        <path pathLength={1} className="draw draw-2" d="M92 252 V132 H330 V252" />
        <path pathLength={1} className="draw draw-3" d="M58 132 H372 V122 H58 Z" />
        <path pathLength={1} className="draw draw-4" d="M200 122 V70 H452 V122" />
        <path pathLength={1} className="draw draw-4" d="M186 70 H470 V62 H186 Z" />
        <path pathLength={1} className="draw draw-5" d="M330 252 V162 H520 V252" />
        <path pathLength={1} className="draw draw-6" d="M112 150 H206 V236 H112 Z M143 150 V236 M175 150 V236" />
        <path pathLength={1} className="draw draw-6" d="M236 86 H430 V112 H236 Z M301 86 V112 M366 86 V112" />
        <path pathLength={1} className="draw draw-6" d="M352 182 H500 V240 H352 Z M401 182 V240 M450 182 V240" />
      </svg>
      <div className="splashLogo"><Logo light /></div>
      <p className="splashTag">{s.trade}</p>
    </div>
  );
}
