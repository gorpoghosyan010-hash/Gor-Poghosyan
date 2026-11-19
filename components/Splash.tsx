'use client';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useLanguage } from './LanguageContext';
import { splash } from '../content/i18n';

export default function Splash() {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    // Ներածական էկրանը ցուցադրվում է ամեն էջ թարմացնելիս (ոչ թե սեսիայի ընթացքում մեկ անգամ)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setVisible(false), reduce ? 250 : 3200);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  const s = splash[lang];
  return (
    <div className="splash" aria-label="GARON Construction">
      <div className="splashGrid" aria-hidden="true" />
      <svg className="splashVilla" viewBox="0 0 600 300" fill="none" stroke="currentColor" aria-hidden="true">
        <g className="draw draw-1" opacity={0.55}>
          <path pathLength={1} d="M60 36 H470" />
          <path pathLength={1} d="M60 30 V42 M470 30 V42 M200 30 V42 M330 30 V42" />
        </g>
        <path pathLength={1} className="draw draw-2" d="M16 252 H584" />
        <path pathLength={1} className="draw draw-3" d="M92 252 V132 H330 V252" />
        <path pathLength={1} className="draw draw-4" d="M58 132 H372 V122 H58 Z" />
        <path pathLength={1} className="draw draw-5" d="M200 122 V70 H452 V122" />
        <path pathLength={1} className="draw draw-5" d="M186 70 H470 V62 H186 Z" />
        <path pathLength={1} className="draw draw-6" d="M330 252 V162 H520 V252" />
        <path pathLength={1} className="draw draw-7" d="M112 150 H206 V236 H112 Z M143 150 V236 M175 150 V236" />
        <path pathLength={1} className="draw draw-7" d="M236 86 H430 V112 H236 Z M301 86 V112 M366 86 V112" />
        <path pathLength={1} className="draw draw-7" d="M352 182 H500 V240 H352 Z M401 182 V240 M450 182 V240" />
        <path pathLength={1} className="draw draw-8" d="M228 132 V252 M246 132 V252" />
        <path pathLength={1} className="draw draw-8" d="M372 262 H578 M392 270 H560" opacity={0.55} />
        <g className="draw draw-9" opacity={0.4}>
          <path pathLength={1} d="M92 262 V286 M330 262 V286 M520 262 V286" />
        </g>
      </svg>
      <div className="splashLogo"><Logo light /></div>
      <p className="splashTag">{s.trade}</p>
      <span className="splashCorner">{s.est}</span>
      <span className="splashCounter" aria-hidden="true" />
    </div>
  );
}
