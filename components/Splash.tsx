'use client';
import { useEffect, useState } from 'react';
import Logo from './Logo';

export default function Splash() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setVisible(false), reduce ? 250 : 1850);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return (
    <div className="splash" aria-label="GARON Construction">
      <div className="splashLines"><i/><i/><i/><i/></div>
      <div className="splashLogo"><Logo light /></div>
      <p className="splashTag">BUILDING A BRIGHTER TOMORROW</p>
      <div className="splashBar"><span/></div>
      <div className="splashMeta"><span>EST. 2000</span><span>CONSTRUCTION</span><span>WELCOME</span></div>
    </div>
  );
}
