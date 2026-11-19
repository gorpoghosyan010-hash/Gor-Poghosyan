'use client';
import { useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { heroLabel } from '../content/i18n';

export default function Hero3D() {
  const { lang } = useLanguage();
  const sceneRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const object = objectRef.current;
    if (!scene || !object) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    // Անիմացիան աշխատում է միայն շարժվելիս, և կանգ է առնում, երբ արժեքները հասնում են նպատակին
    // (նախկինում անվերջ աշխատում էր՝ նաև հեռախոսի վրա, որտեղ մկնիկ չկա)
    const render = () => {
      raf = 0;
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      object.style.setProperty('--mx', `${currentX}deg`);
      object.style.setProperty('--my', `${currentY}deg`);
      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) raf = requestAnimationFrame(render);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(render); };

    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      targetX = x * 7;
      targetY = y * -5;
      kick();
    };

    const scroll = () => {
      const p = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
      object.style.setProperty('--scroll-y', `${p * 90}px`);
      object.style.setProperty('--scroll-scale', `${1 - p * 0.16}`);
      object.style.setProperty('--scroll-opacity', `${1 - p * 0.55}`);
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    scroll();
    kick();

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('scroll', scroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={sceneRef} className="hero3D" aria-hidden="true">
      <div className="hero3DGrid" />
      <div ref={objectRef} className="hero3DObject">
        <div className="building buildingBack" />
        <div className="building buildingMain">
          <div className="buildingTop" />
          <div className="buildingWindow window1" />
          <div className="buildingWindow window2" />
          <div className="buildingWindow window3" />
          <div className="buildingGold" />
        </div>
        <div className="buildingRoof" />
        <div className="hero3DLine lineA" />
        <div className="hero3DLine lineB" />
        <div className="hero3DLabel">{heroLabel[lang]}</div>
      </div>
    </div>
  );
}
