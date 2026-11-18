// Նախագծերի բեռնիչ (միայն սերվերում / build-ի ժամանակ)։
// Ամեն նախագիծ՝ առանձին ֆայլ content/projects/<slug>.json (ադմին վահանակը /admin գրում է հենց այստեղ)։
// Սխալ տվյալի դեպքում build-ը կանգնում է հստակ հաղորդագրությամբ, իսկ կայքում մնում է նախորդ տարբերակը։
import fs from 'node:fs';
import path from 'node:path';
import type { Lang } from '../components/LanguageContext';
import { imageSizes } from './imageSizes';
import {
  CATEGORIES, STAGES,
  type Category, type Localized, type NextLink, type Project, type ProjectCardData, type ProjectImage, type Stage, type Status
} from './projectTypes';

const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const LANGS: Lang[] = ['hy', 'en', 'ru'];

class ProjectDataError extends Error {}

function fail(file: string, message: string): never {
  throw new ProjectDataError(`\n[content/projects/${file}] ${message}\n(Ուղղեք ֆայլը կամ նախագիծը /admin-ում և նորից հրապարակեք։)\n`);
}

const isBlank = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

function localized(file: string, field: string, value: unknown, required: boolean): Localized | null {
  if (isBlank(value)) {
    if (required) fail(file, `«${field}» դաշտը պարտադիր է (առնվազն հայերեն՝ ${field}.hy)։`);
    return null;
  }
  if (typeof value === 'string') return { hy: value.trim(), en: value.trim(), ru: value.trim() };
  if (typeof value !== 'object' || Array.isArray(value)) fail(file, `«${field}»-ը պետք է լինի {"hy": "...", "en": "...", "ru": "..."} տեսքով։`);
  const v = value as Record<string, unknown>;
  for (const l of LANGS) if (!isBlank(v[l]) && typeof v[l] !== 'string') fail(file, `«${field}.${l}»-ը պետք է լինի տեքստ։`);
  const hy = typeof v.hy === 'string' ? v.hy.trim() : '';
  if (!hy) {
    if (required || LANGS.some(l => !isBlank(v[l]))) fail(file, `«${field}.hy» (հայերեն) դաշտը դատարկ է. հայերենը պարտադիր է, en/ru-ն՝ ոչ։`);
    return null;
  }
  const pick = (l: Lang) => (typeof v[l] === 'string' && (v[l] as string).trim()) || hy; // en/ru դատարկ → հայերեն
  return { hy, en: pick('en'), ru: pick('ru') };
}

function optionalNumber(file: string, field: string, value: unknown): number | null {
  if (isBlank(value)) return null;
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) fail(file, `«${field}»-ը պետք է լինի թիվ (ստացվել է ${JSON.stringify(value)})։`);
  return n;
}

// Նկարի չափերը կարդում ենք ֆայլից (WebP / PNG / JPEG), որ layout-ը չ«ցատկի»
function readImageSize(abs: string): [number, number] | undefined {
  try {
    const b = fs.readFileSync(abs);
    if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = b.toString('ascii', 12, 16);
      if (chunk === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
      if (chunk === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
      if (chunk === 'VP8L') { const bits = b.readUInt32LE(21); return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1]; }
    }
    if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        const len = b.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
        i += 2 + len;
      }
    }
  } catch { /* չափը պարտադիր չէ */ }
  return undefined;
}

function checkImage(file: string, field: string, src: unknown): string {
  if (typeof src !== 'string' || !src.trim()) fail(file, `«${field}»-ում նկարի հասցեն դատարկ է։`);
  const s = src.trim();
  if (!s.startsWith('/')) fail(file, `«${field}» = "${s}". հասցեն պետք է սկսվի «/»-ով, օր.՝ /projects/house-02/01.webp`);
  const abs = path.join(PUBLIC_DIR, decodeURIComponent(s.split('?')[0]));
  if (!abs.startsWith(PUBLIC_DIR) || !fs.existsSync(abs)) fail(file, `«${field}» = "${s}". այդպիսի նկար չկա public/ պանակում։`);
  return s;
}

function parseProject(file: string): Project & { published: boolean } {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf8'));
  } catch (e) {
    fail(file, `ֆայլը ճիշտ JSON չէ. ${(e as Error).message}`);
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail(file, 'ֆայլը պետք է պարունակի մեկ օբյեկտ { ... }։');
  const d = raw as Record<string, unknown>;

  const slug = typeof d.slug === 'string' ? d.slug.trim() : '';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(file, `«slug»-ը պետք է լինի լատինատառ փոքրատառ, թվեր և գծիկ (օր.՝ house-02), ստացվել է ${JSON.stringify(d.slug)}։`);
  if (`${slug}.json` !== file) fail(file, `«slug» (${slug}) պետք է համընկնի ֆայլի անվան հետ (${file})։`);

  if (!CATEGORIES.includes(d.category as Category)) fail(file, `«category»-ն պետք է լինի ${CATEGORIES.join(' / ')}, ստացվել է ${JSON.stringify(d.category)}։`);
  const status = isBlank(d.status) ? null : (d.status as Status);
  if (status && status !== 'completed' && status !== 'in-progress') fail(file, `«status»-ը պետք է լինի completed կամ in-progress։`);

  if (!isBlank(d.images) && !Array.isArray(d.images)) fail(file, '«images»-ը պետք է լինի ցուցակ։');
  const images: ProjectImage[] = ((d.images as unknown[]) ?? []).map((item, i) => {
    const field = `images[${i + 1}]`;
    const it = (typeof item === 'string' ? { src: item } : item) as Record<string, unknown> | null;
    if (!it || typeof it !== 'object') fail(file, `«${field}»-ը սխալ է։`);
    const src = checkImage(file, `${field}.src`, it.src);
    const stage = isBlank(it.stage) ? null : (it.stage as Stage);
    if (stage && !STAGES.includes(stage)) fail(file, `«${field}.stage»-ը պետք է լինի start / progress / result կամ դատարկ, ստացվել է ${JSON.stringify(it.stage)}։`);
    const size = imageSizes[src] ?? readImageSize(path.join(PUBLIC_DIR, decodeURIComponent(src.split('?')[0])));
    return { src, stage, caption: localized(file, `${field}.caption`, it.caption, false), width: size?.[0], height: size?.[1] };
  });

  const heroImage = isBlank(d.heroImage) ? images[0]?.src : checkImage(file, 'heroImage', d.heroImage);
  if (!heroImage) fail(file, 'նախագիծը պետք է ունենա գլխավոր նկար («heroImage») կամ առնվազն մեկ նկար «images»-ում։');

  const f = (d.facts && typeof d.facts === 'object' ? d.facts : {}) as Record<string, unknown>;
  const created = isBlank(d.created) ? null : String(d.created);
  if (created && Number.isNaN(Date.parse(created))) fail(file, `«created»-ը պետք է լինի ամսաթիվ (YYYY-MM-DD), ստացվել է ${JSON.stringify(d.created)}։`);

  return {
    slug,
    category: d.category as Category,
    order: optionalNumber(file, 'order', d.order) ?? 100,
    created,
    published: d.published !== false,
    featured: d.featured === true,
    status,
    title: localized(file, 'title', d.title, true)!,
    subtitle: localized(file, 'subtitle', d.subtitle, false),
    summary: localized(file, 'summary', d.summary, false),
    cardText: localized(file, 'cardText', d.cardText, false),
    introTitle: localized(file, 'introTitle', d.introTitle, false),
    introTitle2: localized(file, 'introTitle2', d.introTitle2, false),
    story: localized(file, 'story', d.story, false),
    facts: {
      location: localized(file, 'facts.location', f.location, false),
      area_m2: optionalNumber(file, 'facts.area_m2', f.area_m2),
      duration: localized(file, 'facts.duration', f.duration, false),
      year: optionalNumber(file, 'facts.year', f.year)
    },
    heroImage,
    images
  };
}

let cache: Project[] | null = null;

/** Բոլոր հրապարակված նախագծերը՝ բաժինների հերթականությամբ, հետո `order`, հետո ամենանորը։ */
export function getProjects(): Project[] {
  if (cache && process.env.NODE_ENV === 'production') return cache;
  const files = fs.existsSync(PROJECTS_DIR) ? fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.json')).sort() : [];
  const all = files.map(parseProject).filter(p => p.published).map(({ published: _p, ...p }) => p);
  const time = (p: Project) => (p.created ? Date.parse(p.created) : 0);
  all.sort((a, b) =>
    CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) ||
    a.order - b.order ||
    time(b) - time(a) ||
    a.slug.localeCompare(b.slug));
  cache = all;
  return all;
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find(p => p.slug === slug);
}

export function getProjectsByCategory(category: Category): Project[] {
  return getProjects().filter(p => p.category === category);
}

/** «Հաջորդ նախագիծը»՝ նույն հերթականությամբ, վերջինից հետո՝ կապի էջ։ */
export function getNextLink(slug: string): NextLink {
  const list = getProjects();
  const next = list[list.findIndex(p => p.slug === slug) + 1];
  return next ? { href: `/projects/${next.slug}`, title: next.title, subtitle: next.subtitle, image: next.heroImage } : { href: '/contact', title: null, subtitle: null };
}

export function toCard(p: Project): ProjectCardData {
  return { slug: p.slug, category: p.category, heroImage: p.heroImage, title: p.title, meta: p.cardText ?? p.subtitle ?? p.title };
}

/** Գլխավոր էջի «Ընտրված աշխատանք»՝ featured նախագծերը (առավելագույնը 3), իսկ եթե չկան՝ առաջին 3-ը։ */
export function getFeaturedCards(limit = 3): ProjectCardData[] {
  const list = getProjects();
  const featured = list.filter(p => p.featured);
  return (featured.length ? featured : list).slice(0, limit).map(toCard);
}
