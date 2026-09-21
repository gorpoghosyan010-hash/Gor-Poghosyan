'use client';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useLanguage } from './LanguageContext';
import { home, splash } from '../content/i18n';

const SEEN_KEY = 'garon-splash-seen';

export default function Splash() {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    // Ներածական էկրանը ցուցադրվում է սեսիայի ընթացքում մեկ անգամ (ամեն էջի բացման վրա չի կրկնվում)
    let seen = false;
    try { seen = window.sessionStorage.getItem(SEEN_KEY) === '1'; } catch {}
    if (seen) { setVisible(false); return; }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // «Տեսել է» նշանը դրվում է ավարտին (ոչ թե սկզբում), որ dev-ի կրկնակի effect-ը չթաքցնի ներածական էկրանը
    const timer = window.setTimeout(() => {
      try { window.sessionStorage.setItem(SEEN_KEY, '1'); } catch {}
      setVisible(false);
    }, reduce ? 250 : 1850);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  const s = splash[lang];
  const h = home[lang];
  return (
    <div className="splash" aria-label="GARON Construction">
      <div className="splashLines"><i/><i/><i/><i/></div>
      <div className="splashLogo"><Logo light /></div>
      <p className="splashTag">{`${h.heroTitle1} ${h.heroTitle2}`.toUpperCase()}</p>
      <div className="splashBar"><span/></div>
      <div className="splashMeta"><span>{s.est}</span><span>{s.trade}</span><span>{s.welcome}</span></div>
    </div>
  );
}
