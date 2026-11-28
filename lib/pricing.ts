// Հաշվիչի գները։ Լռելյայն արժեքները այստեղ են, իսկ ադմին էջից փոխվածները պահվում են պահոցում
// և կայքը դրանք ստանում է /api/prices-ից։ Եթե պահոցը միացված չէ, աշխատում են այս արժեքները։
export type Mode = 'full' | 'monolith' | 'renovation' | 'pool';
export const MODES: Mode[] = ['full', 'monolith', 'renovation', 'pool'];

export type Lang3 = { hy: string; en: string; ru: string };
// Հավելյալ տող հաշվիչում (նշելու վանդակ)՝ ադմինից ավելացվող
//  perSqm  — գինը × մակերես (լողավազանում՝ × ներքին մակերես)
//  fixed   — ֆիքսված գումար
//  percent — ընդհանուր գնի տոկոս
export type Extra = { id: string; label: Lang3; modes: Mode[]; kind: 'perSqm' | 'fixed' | 'percent'; value: number };

export type Pricing = {
  renovation: [number, number, number];   // Վերանորոգում՝ Ստանդարտ / Կոմֆորտ / Պրեմիում (֏/մ²)
  houseFinish: [number, number, number];  // Մասնավոր տան հարդարման մասը (֏/մ²)
  shell: number;                          // Կառուցվածք՝ մոնոլիտ + երկշերտ պատեր + տանիք (֏/մ²)
  monolith: number;                       // Միայն մոնոլիտ (֏/մ² յուրաքանչյուր հարկ)
  basement: number;                       // Նկուղ (֏/մ²)
  pool: number;                           // Լողավազան (֏/մ² ներքին մակերես)
  mansardPct: number;                     // Մանսարդ (%)
  flatRoofPct: number;                    // Հարթ տանիք (%)
  extras: Extra[];
  updatedAt?: string;
};

export const DEFAULT_PRICING: Pricing = {
  renovation: [60000, 80000, 100000],
  houseFinish: [80000, 100000, 120000],
  shell: 140000,
  monolith: 95000,
  basement: 120000,
  pool: 100000,
  mansardPct: 10,
  flatRoofPct: 8,
  extras: []
};

const num = (v: unknown, def: number, max = 100_000_000) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) && n >= 0 && n <= max ? Math.round(n) : def;
};
const str = (v: unknown, n = 80) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const tri = (v: unknown, def: [number, number, number]): [number, number, number] =>
  Array.isArray(v) && v.length === 3 ? [num(v[0], def[0]), num(v[1], def[1]), num(v[2], def[2])] : def;

export function normalizePricing(raw: unknown): Pricing {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_PRICING;
  const extras: Extra[] = Array.isArray(r.extras) ? (r.extras as unknown[]).slice(0, 30).flatMap((e, i) => {
    const x = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>;
    const l = (x.label && typeof x.label === 'object' ? x.label : {}) as Record<string, unknown>;
    const hy = str(l.hy);
    if (!hy) return [];
    const modes = (Array.isArray(x.modes) ? x.modes : []).filter((m): m is Mode => MODES.includes(m as Mode));
    const kind = (['perSqm', 'fixed', 'percent'] as const).includes(x.kind as Extra['kind']) ? (x.kind as Extra['kind']) : 'perSqm';
    return [{
      id: str(x.id, 24).replace(/[^a-z0-9_-]/gi, '') || `x${i}${Date.now().toString(36)}`,
      label: { hy, en: str(l.en) || hy, ru: str(l.ru) || hy },
      modes: modes.length ? modes : ['full'],
      kind,
      value: num(x.value, 0, kind === 'percent' ? 500 : 1_000_000_000)
    }];
  }) : [];
  return {
    renovation: tri(r.renovation, d.renovation),
    houseFinish: tri(r.houseFinish, d.houseFinish),
    shell: num(r.shell, d.shell),
    monolith: num(r.monolith, d.monolith),
    basement: num(r.basement, d.basement),
    pool: num(r.pool, d.pool),
    mansardPct: num(r.mansardPct, d.mansardPct, 500),
    flatRoofPct: num(r.flatRoofPct, d.flatRoofPct, 500),
    extras,
    ...(typeof r.updatedAt === 'string' ? { updatedAt: r.updatedAt } : {})
  };
}
