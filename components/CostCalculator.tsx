'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { calculator } from '../content/i18n';
import { DEFAULT_PRICING, MODES, type Mode, type Pricing } from '../lib/pricing';

// Գները գալիս են ադմին էջից (/api/prices)։ Լռելյայն արժեքները՝ lib/pricing.ts-ում։
// Հարկերի հարաբերակցությունը (Ամբողջական կառուցում և Վերանորոգում)՝ հարկ 1 = 100%, հարկ 2-4 ≈ 94%, հարկ 5+ ≈ 106%
function floorFactor(floorNumber: number) {
  if (floorNumber <= 1) return 1;
  if (floorNumber <= 4) return 85 / 90;
  return 95 / 90;
}
function cumulativeRateFor(baseRate: number, floors: number) {
  let sum = 0;
  for (let f = 1; f <= floors; f++) sum += baseRate * floorFactor(f);
  return sum;
}

export type { Mode };
const ALL_MODES: Mode[] = MODES;

export default function CostCalculator({ modes = ALL_MODES }: { modes?: Mode[] }) {
  const { lang } = useLanguage();
  const t = calculator[lang];
  const [mode, setMode] = useState<Mode>(modes[0]);
  const [area, setArea] = useState('');
  const [tier, setTier] = useState(1);
  const [basement, setBasement] = useState(false);
  const [mansard, setMansard] = useState(false);
  const [flatRoof, setFlatRoof] = useState(false);
  const [floors, setFloors] = useState(1);
  const [basementArea, setBasementArea] = useState('');
  const [poolLength, setPoolLength] = useState('');
  const [poolWidth, setPoolWidth] = useState('');
  const [poolDepth, setPoolDepth] = useState('');
  const [openInfo, setOpenInfo] = useState<number | null>(null);
  const [pricing, setPricing] = useState<Pricing>(DEFAULT_PRICING);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    fetch('/api/prices').then(r => (r.ok ? r.json() : null)).then(p => { if (alive && p && Array.isArray(p.renovation)) setPricing(p); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const RENOVATION_RATES = pricing.renovation;
  const FULL_RATES = pricing.houseFinish.map(r => r + pricing.shell);
  const extras = pricing.extras.filter(x => x.modes.includes(mode));
  const tiersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (tiersRef.current && !tiersRef.current.contains(e.target as Node)) setOpenInfo(null); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const numericArea = parseFloat(area);
  const validArea = !isNaN(numericArea) && numericArea > 0;
  const numericBasementArea = parseFloat(basementArea);
  const validBasementArea = !isNaN(numericBasementArea) && numericBasementArea > 0;
  const poolL = parseFloat(poolLength), poolW = parseFloat(poolWidth), poolD = parseFloat(poolDepth);
  const validPool = [poolL, poolW, poolD].every(v => !isNaN(v) && v > 0);
  const poolSurface = validPool ? 2 * (poolL + poolW) * poolD + poolL * poolW : 0;
  const ready = mode === 'pool' ? validPool : validArea;

  const total = useMemo(() => {
    let base = 0;
    if (mode === 'pool') base = poolSurface * pricing.pool;
    else if (!validArea) return 0;
    else if (mode === 'full') {
      const modifier = 1 + (mansard ? pricing.mansardPct / 100 : 0) + (flatRoof ? pricing.flatRoofPct / 100 : 0);
      const basementCost = basement && validBasementArea ? numericBasementArea * pricing.basement : 0;
      base = numericArea * cumulativeRateFor(pricing.houseFinish[tier] + pricing.shell, floors) * modifier + basementCost;
    } else if (mode === 'monolith') {
      const basementCost = validBasementArea ? numericBasementArea * pricing.basement : 0;
      base = numericArea * pricing.monolith * floors + basementCost;
    } else base = numericArea * cumulativeRateFor(pricing.renovation[tier], floors);
    if (!base) return 0;
    // Ադմինից ավելացված հավելյալ տողերը
    const sqm = mode === 'pool' ? poolSurface : numericArea * floors;
    let add = 0;
    for (const x of extras) {
      if (!picked.includes(x.id)) continue;
      if (x.kind === 'perSqm') add += x.value * sqm;
      else if (x.kind === 'fixed') add += x.value;
      else add += base * x.value / 100;
    }
    return Math.round(base + add);
  }, [validArea, numericArea, mode, tier, basement, mansard, flatRoof, floors, validBasementArea, numericBasementArea, poolSurface, pricing, picked, extras]);

  const tiersToShow = (mode === 'renovation' ? t.renovationTiers : t.tiers) as { name: string; desc: string; detail?: string }[];
  const ratesToShow = mode === 'renovation' ? RENOVATION_RATES : FULL_RATES;

  // Հաշվարկի համառոտ նկարագրություն՝ կոնտակտի ձևը նախալրացնելու համար
  const summary = (() => {
    if (!ready) return '';
    const parts: string[] = [t.modes[mode]];
    if (mode === 'pool') {
      parts.push(`${poolL}×${poolW}×${poolD} ${t.meterUnit}`);
    } else {
      parts.push(`${t.areaLabel}: ${numericArea} ${t.areaUnit}`, `${t.floorsLabel}: ${floors === 5 ? '5+' : floors}`);
      if (mode !== 'monolith') parts.push(tiersToShow[tier].name);
      if (mode === 'full') {
        if (basement) parts.push(validBasementArea ? `${t.basement}: ${numericBasementArea} ${t.areaUnit}` : t.basement);
        if (mansard) parts.push(t.mansard);
        if (flatRoof) parts.push(t.flatRoof);
      }
      for (const x of extras) if (picked.includes(x.id)) parts.push(x.label[lang]);
      if (mode === 'monolith' && validBasementArea) parts.push(`${t.fullBasementAreaLabel}: ${numericBasementArea} ${t.areaUnit}`);
    }
    if (mode === 'pool') for (const x of extras) if (picked.includes(x.id)) parts.push(x.label[lang]);
    parts.push(`${mode === 'renovation' || mode === 'pool' || mode === 'full' ? t.startingFrom + ' ' : ''}${total.toLocaleString('en-US')} ֏`);
    return parts.join(' · ');
  })();

  const extraBoxes = extras.map(x => (
    <label className="calcOption" key={x.id}>
      <input type="checkbox" checked={picked.includes(x.id)} onChange={e => setPicked(p => e.target.checked ? [...p, x.id] : p.filter(id => id !== x.id))} />
      <span>{x.label[lang]}</span>
    </label>
  ));

  return (
    <div>
      {modes.length > 1 && (
        <div className="calcField">
          <label>{t.modeLabel}</label>
          <div className="calcModes">
            {modes.map(m => (
              <button type="button" key={m} className={`calcModeBtn ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
                {t.modes[m]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="contactColumns calcColumns">
        <div>
          {mode === 'pool' ? (
            <div className="calcDims">
              {[
                { value: poolLength, set: setPoolLength },
                { value: poolWidth, set: setPoolWidth },
                { value: poolDepth, set: setPoolDepth }
              ].map((d, i) => (
                <div className="calcField" key={i}>
                  <label>{t.poolDims[i].label}</label>
                  <div className="calcInputWrap">
                    <input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={d.value}
                      onChange={e => d.set(e.target.value)}
                      placeholder={t.poolDims[i].placeholder}
                    />
                    <span>{t.meterUnit}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="calcField">
              <label>{t.areaLabel}</label>
              <div className="calcInputWrap">
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder={t.areaPlaceholder}
                />
                <span>{t.areaUnit}</span>
              </div>
            </div>
          )}

          {mode !== 'pool' && (
            <div className="calcField">
              <label>{t.floorsLabel}</label>
              <div className="calcModes">
                {[1, 2, 3, 4, 5].map(f => (
                  <button type="button" key={f} className={`calcModeBtn ${f <= floors ? 'active' : ''}`} onClick={() => setFloors(f)}>
                    {f === 5 ? '5+' : f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'pool' ? (
            <p className="calcRateNote">{t.poolIncludesNote}</p>
          ) : mode === 'monolith' ? (
            <div className="calcField">
              <label>{t.basementAreaLabel}</label>
              <div className="calcInputWrap">
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={basementArea}
                  onChange={e => setBasementArea(e.target.value)}
                  placeholder="0"
                />
                <span>{t.areaUnit}</span>
              </div>
            </div>
          ) : (
            <div className="calcField">
              <label>{t.tierLabel}</label>
              <div className="calcTiers" ref={tiersRef}>
                {tiersToShow.map((tr, i) => (
                  <div className="calcTierWrap" key={tr.name + i}>
                    <button type="button" className={`calcTier ${i === tier ? 'active' : ''}`} onClick={() => setTier(i)}>
                      <strong>{tr.name}</strong>
                      {tr.desc && <span>{tr.desc}</span>}
                      <b>{ratesToShow[i].toLocaleString('en-US')}{(mode === 'renovation' || mode === 'full') && i === ratesToShow.length - 1 ? '+' : ''} ֏ {t.perSqm}</b>
                    </button>
                    {tr.detail && (
                      <button
                        type="button"
                        className={`calcTierInfo ${openInfo === i ? 'active' : ''}`}
                        aria-label={t.infoLabel}
                        aria-expanded={openInfo === i}
                        onClick={() => setOpenInfo(openInfo === i ? null : i)}
                      >i</button>
                    )}
                    {openInfo === i && tr.detail && <div className="calcTierPopover">{tr.detail}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'full' && (
            <div className="calcField">
              <label>{t.optionsLabel}</label>
              <div className="calcOptions">
                <label className="calcOption"><input type="checkbox" checked={basement} onChange={e => setBasement(e.target.checked)} /><span>{t.basement}</span></label>
                {basement && (
                  <div className="calcSubField">
                    <label>{t.fullBasementAreaLabel}</label>
                    <div className="calcInputWrap">
                      <input
                        type="number"
                        min="0"
                        inputMode="decimal"
                        value={basementArea}
                        onChange={e => setBasementArea(e.target.value)}
                        placeholder="0"
                      />
                      <span>{t.areaUnit}</span>
                    </div>
                  </div>
                )}
                <label className="calcOption"><input type="checkbox" checked={mansard} onChange={e => { setMansard(e.target.checked); if (e.target.checked) setFlatRoof(false); }} /><span>{t.mansard}</span></label>
                <label className="calcOption"><input type="checkbox" checked={flatRoof} onChange={e => { setFlatRoof(e.target.checked); if (e.target.checked) setMansard(false); }} /><span>{t.flatRoof}</span></label>
                {extraBoxes}
              </div>
            </div>
          )}
          {mode !== 'full' && extras.length > 0 && (
            <div className="calcField">
              <label>{t.optionsLabel}</label>
              <div className="calcOptions">{extraBoxes}</div>
            </div>
          )}
        </div>

        <div className="contactCard calcResultCard">
          {ready ? (
            <>
              <span className="calcResultLabel">{t.resultLabel}</span>
              <strong className="calcResultValue">{(mode === 'renovation' || mode === 'pool' || mode === 'full') && <em>{t.startingFrom} </em>}{total.toLocaleString('en-US')} ֏</strong>
              <p>{t.disclaimer}</p>
              <Link className="button gold" href={`/contact?estimate=${encodeURIComponent(summary)}`}>{t.cta}</Link>
            </>
          ) : (
            <p className="calcEmpty">{mode === 'pool' ? t.enterPoolDims : t.enterArea}</p>
          )}
        </div>
      </div>
    </div>
  );
}
