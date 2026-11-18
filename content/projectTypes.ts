// Նախագծերի տիպերը (առանց fs-ի՝ կարելի է օգտագործել նաև բրաուզերում աշխատող կոմպոնենտներում)։
// Տվյալները՝ content/projects/<slug>.json, բեռնիչը՝ content/projects.ts։
import type { Lang } from '../components/LanguageContext';

export const CATEGORIES = ['pools', 'houses', 'renovation', 'public'] as const;
export type Category = (typeof CATEGORIES)[number];

export const STAGES = ['start', 'progress', 'result'] as const;
export type Stage = (typeof STAGES)[number];

export type Status = 'completed' | 'in-progress';

/** Բոլոր երեք լեզուներով լրացված տեքստ (en/ru դատարկ լինելու դեպքում՝ հայերենը)։ */
export type Localized = Record<Lang, string>;

export type ProjectImage = {
  src: string;
  stage: Stage | null;
  caption: Localized | null;
  width?: number;
  height?: number;
};

export type ProjectFacts = {
  location: Localized | null;
  area_m2: number | null;
  duration: Localized | null;
  year: number | null;
};

export type Project = {
  slug: string;
  category: Category;
  order: number;
  created: string | null;
  featured: boolean;
  status: Status | null;
  title: Localized;
  subtitle: Localized | null;
  summary: Localized | null;
  cardText: Localized | null;
  introTitle: Localized | null;
  introTitle2: Localized | null;
  story: Localized | null;
  facts: ProjectFacts;
  heroImage: string;
  images: ProjectImage[];
};

/** Քարտի համար բավարար տվյալներ (փոքր՝ էջին փոխանցելու համար)։ */
export type ProjectCardData = {
  slug: string;
  category: Category;
  heroImage: string;
  title: Localized;
  meta: Localized;
};

export type NextLink = { href: string; title: Localized | null; subtitle: Localized | null; image?: string };
