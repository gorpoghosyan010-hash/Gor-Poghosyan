'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { calculator } from '../content/i18n';

// ԿԱՐԵՎՈՐ. սրանք բոլորը մոտավոր, ցուցադրական գներ են (դրամ)։
// Փոխարինիր այս թվերը GARON-ի իրական միջին գներով։
const FULL_RATES = [250000, 350000, 480000];
const FULL_MODIFIERS = { basement: 0.15, mansard: 0.10, flatRoof: 0.08 };
// Ամեն հարկի իր գինն է մեկ մ²-ի համար, և հարկերի գները գումարվում են իրար.
// 1-ին հարկ → 90,000 ֏, 2-4-րդ հարկեր → 85,000 ֏ (յուրաքանչյուրը), 5-րդ+ հարկ → 95,000 ֏
function perFloorRate(floorNumber: number) {
  if (floorNumber <= 1) return 90000;
  if (floorNumber <= 4) return 85000;
  return 95000;
}
function cumulativeMonolithRate(floors: number) {
  let sum = 0;
  for (let f = 1; f <= floors; f++) sum += perFloorRate(f);
  return sum;
}
// Ամբողջական կառուցման և Վերանորոգման համար հարկերի ազդեցությունը հաշվում ենք
// նույն հարաբերակցությամբ, ինչ Մոնոլիտում (հարկ 1 = 100%, հարկ 2-4 = ~94%, հարկ 5+ = ~106%)։
function cumulativeRateFor(baseRate: number, floors: number) {
  let sum = 0;
  for (let f = 1; f <= floors; f++) sum += baseRate * (perFloorRate(f) / perFloorRate(1));
  return sum;
}
const RENOVATION_RATES = [80000, 120000, 180000];
// Մոնոլիտի նկուղի գինը մեկ մ²-ի համար. հաշվարկվում է առանձին մակերեսով, գինը դիտավորյալ չի ցուցադրվում UI-ում։
const MONOLITH_BASEMENT_RATE = 100000;

type Mode = 'full' | 'monolith' | 'renovation';

export default function CostCalculator() {
  const { lang } = useLanguage();
  const t = calculator[lang];
  const [mode, setMode] = useState<Mode>('full');
  const [area, setArea] = useState('');
  const [tier, setTier] = useState(1);
  const [basement, setBasement] = useState(false);
  const [mansard, setMansard] = useState(false);
  const [flatRoof, setFlatRoof] = useState(false);
  const [floors, setFloors] = useState(1);
  const [monolithBasementArea, setMonolithBasementArea] = useState('');

  const numericArea = parseFloat(area);
  const validArea = !isNaN(numericArea) && numericArea > 0;
  const numericBasementArea = parseFloat(monolithBasementArea);
  const validBasementArea = !isNaN(numericBasementArea) && numericBasementArea > 0;

  const total = useMemo(() => {
    if (!validArea) return 0;
    if (mode === 'full') {
      const modifier = 1 + (basement ? FULL_MODIFIERS.basement : 0) + (mansard ? FULL_MODIFIERS.mansard : 0) + (flatRoof ? FULL_MODIFIERS.flatRoof : 0);
      return Math.round(numericArea * cumulativeRateFor(FULL_RATES[tier], floors) * modifier);
    }
    if (mode === 'monolith') {
      const basementCost = validBasementArea ? numericBasementArea * MONOLITH_BASEMENT_RATE : 0;
      return Math.round(numericArea * cumulativeMonolithRate(floors) + basementCost);
    }
    return Math.round(numericArea * cumulativeRateFor(RENOVATION_RATES[tier], floors));
  }, [validArea, numericArea, mode, tier, basement, mansard, flatRoof, floors, validBasementArea, numericBasementArea]);

  const modeKeys: Mode[] = ['full', 'monolith', 'renovation'];
  const tiersToShow = mode === 'renovation' ? t.renovationTiers : t.tiers;
  const ratesToShow = mode === 'renovation' ? RENOVATION_RATES : FULL_RATES;

  return (
    <div>
      <div className="calcField">
        <label>{t.modeLabel}</label>
        <div className="calcModes">
          {modeKeys.map(m => (
            <button type="button" key={m} className={`calcModeBtn ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
              {t.modes[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="contactColumns calcColumns">
        <div>
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

          {mode === 'monolith' ? (
            <div className="calcField">
              <label>{t.basementAreaLabel}</label>
              <div className="calcInputWrap">
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={monolithBasementArea}
                  onChange={e => setMonolithBasementArea(e.target.value)}
                  placeholder="0"
                />
                <span>{t.areaUnit}</span>
              </div>
            </div>
          ) : (
            <div className="calcField">
              <label>{t.tierLabel}</label>
              <div className="calcTiers">
                {tiersToShow.map((tr, i) => (
                  <button type="button" key={tr.name + i} className={`calcTier ${i === tier ? 'active' : ''}`} onClick={() => setTier(i)}>
                    <strong>{tr.name}</strong>
                    <span>{tr.desc}</span>
                    <b>{ratesToShow[i].toLocaleString('en-US')} ֏ {t.perSqm}</b>
                  </button>
                ))}
              </div>
              {mode === 'renovation' && tier === 2 && <p className="calcRateNote">{t.renovationPremiumNote}</p>}
            </div>
          )}

          {mode === 'full' && (
            <div className="calcField">
              <label>{t.optionsLabel}</label>
              <div className="calcOptions">
                <label className="calcOption"><input type="checkbox" checked={basement} onChange={e => setBasement(e.target.checked)} /><span>{t.basement}</span></label>
                <label className="calcOption"><input type="checkbox" checked={mansard} onChange={e => { setMansard(e.target.checked); if (e.target.checked) setFlatRoof(false); }} /><span>{t.mansard}</span></label>
                <label className="calcOption"><input type="checkbox" checked={flatRoof} onChange={e => { setFlatRoof(e.target.checked); if (e.target.checked) setMansard(false); }} /><span>{t.flatRoof}</span></label>
              </div>
            </div>
          )}
        </div>

        <div className="contactCard calcResultCard">
          {validArea ? (
            <>
              <span className="calcResultLabel">{t.resultLabel}</span>
              <strong className="calcResultValue">{mode === 'renovation' && <em>{t.startingFrom} </em>}{total.toLocaleString('en-US')} ֏</strong>
              <p>{t.disclaimer}</p>
              <Link className="button gold" href="/contact">{t.cta}</Link>
            </>
          ) : (
            <p className="calcEmpty">{t.enterArea}</p>
          )}
        </div>
      </div>
    </div>
  );
}
