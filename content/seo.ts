import type { Metadata } from 'next';
import type { Lang } from '../components/LanguageContext';

export const SITE_NAME = 'GARON Construction';

// Հրապարակված հասցեն՝ NEXT_PUBLIC_SITE_URL փոփոխականով (Vercel-ում՝ ավտոմատ)
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

type M = { title: string; description: string };

export const pageMeta: Record<string, Record<Lang, M>> = {
  '/': {
    hy: { title: 'GARON Construction — շինարարություն և լողավազաններ', description: 'Ժամանակակից շինարարական լուծումներ՝ նախագծումից մինչև ամբողջական իրականացում։ Լողավազաններ, բնակելի տներ, վերանորոգում և հասարակական կառույցներ։ Երևան, Հայաստան։' },
    en: { title: 'GARON Construction — construction and swimming pools', description: 'Modern construction solutions from design to full completion: swimming pools, residential houses, renovation and public buildings. Yerevan, Armenia.' },
    ru: { title: 'GARON Construction — строительство и бассейны', description: 'Современные строительные решения от проектирования до полной сдачи: бассейны, жилые дома, ремонт и общественные здания. Ереван, Армения.' }
  },
  '/about': {
    hy: { title: 'Մեր մասին', description: 'GARON Construction-ի փորձը, արժեքներն ու մոտեցումը շինարարության մեջ։' },
    en: { title: 'About', description: 'The experience, values and approach of GARON Construction.' },
    ru: { title: 'О нас', description: 'Опыт, ценности и подход GARON Construction к строительству.' }
  },
  '/services': {
    hy: { title: 'Ծառայություններ', description: 'Լողավազանների կառուցում, բնակելի տներ, վերանորոգում և հասարակական կառույցներ՝ մեկ թիմից։' },
    en: { title: 'Services', description: 'Swimming pools, residential houses, renovation and public buildings from one team.' },
    ru: { title: 'Услуги', description: 'Бассейны, жилые дома, ремонт и общественные здания — от одной команды.' }
  },
  '/services/pools': {
    hy: { title: 'Լողավազանների կառուցում', description: 'Լողավազանների կառուցում՝ գաղափարից մինչև պատրաստ արդյունք։ Պլյոնկա կամ մոզաիկա, ֆիլտրման համակարգով։ Հաշվեք մոտավոր արժեքը։' },
    en: { title: 'Swimming Pool Construction', description: 'Swimming pool construction from concept to finished result. PVC film or mosaic, with a filtration system. Estimate the approximate cost.' },
    ru: { title: 'Строительство бассейнов', description: 'Строительство бассейнов от идеи до готового результата. Плёнка ПВХ или мозаика, с системой фильтрации. Рассчитайте примерную стоимость.' }
  },
  '/services/residential': {
    hy: { title: 'Բնակելի տների կառուցում', description: 'Անհատական բնակելի տների կառուցում՝ հիմքից մինչև հանձնում։ Ամբողջական կառուցում կամ միայն մոնոլիտ։ Հաշվեք մոտավոր արժեքը։' },
    en: { title: 'Residential Construction', description: 'Custom home construction from foundation to handover. Full construction or monolith works only. Estimate the approximate cost.' },
    ru: { title: 'Строительство жилых домов', description: 'Строительство индивидуальных домов от фундамента до сдачи. Полное строительство или только монолит. Рассчитайте примерную стоимость.' }
  },
  '/services/renovation': {
    hy: { title: 'Վերանորոգում և վերակառուցում', description: 'Տարածքների վերանորոգում և վերակառուցում՝ կոսմետիկից մինչև կապիտալ, ինտերիերի դիզայնով։ Հաշվեք մոտավոր արժեքը։' },
    en: { title: 'Renovation & Reconstruction', description: 'Renovation and reconstruction, from cosmetic to capital, with interior design. Estimate the approximate cost.' },
    ru: { title: 'Ремонт и реконструкция', description: 'Ремонт и реконструкция помещений — от косметического до капитального, с дизайном интерьера. Рассчитайте примерную стоимость.' }
  },
  '/services/public-works': {
    hy: { title: 'Հասարակական կառույցներ', description: 'Հասարակական և կոմերցիոն օբյեկտների կառուցում՝ ժամկետների և որակի վերահսկմամբ։' },
    en: { title: 'Public Buildings', description: 'Construction of public and commercial facilities with strict control of deadlines and quality.' },
    ru: { title: 'Общественные здания', description: 'Строительство общественных и коммерческих объектов с контролем сроков и качества.' }
  },
  '/projects': {
    hy: { title: 'Նախագծեր', description: 'GARON-ի իրականացրած լողավազանները և բնակելի տունը՝ շինարարական ամբողջ պատմությամբ։' },
    en: { title: 'Projects', description: 'Swimming pools and a residential house built by GARON, with the full construction story.' },
    ru: { title: 'Проекты', description: 'Бассейны и жилой дом, построенные GARON, — с полной историей строительства.' }
  },
  '/projects/pool': {
    hy: { title: 'Լողավազանի նախագիծ', description: 'Լողավազանի շինարարության նախագիծ GARON-ից՝ փուլ առ փուլ։' },
    en: { title: 'Swimming Pool Project', description: 'A swimming pool construction project by GARON, stage by stage.' },
    ru: { title: 'Проект бассейна', description: 'Проект строительства бассейна от GARON — этап за этапом.' }
  },
  '/projects/house': {
    hy: { title: 'Բնակելի տան նախագիծ', description: 'Բնակելի տան շինարարության նախագիծ GARON-ից՝ հիմքից մինչև հանձնում։' },
    en: { title: 'Residential House Project', description: 'A residential house construction project by GARON, from foundation to handover.' },
    ru: { title: 'Проект жилого дома', description: 'Проект строительства жилого дома от GARON — от фундамента до сдачи.' }
  },
  '/calculator': {
    hy: { title: 'Շինարարության հաշվիչ', description: 'Հաշվեք լողավազանի, բնակելի տան կամ վերանորոգման մոտավոր արժեքը րոպեների ընթացքում։' },
    en: { title: 'Construction Cost Calculator', description: 'Estimate the approximate cost of a swimming pool, a house or a renovation in minutes.' },
    ru: { title: 'Калькулятор стоимости строительства', description: 'Рассчитайте примерную стоимость бассейна, дома или ремонта за несколько минут.' }
  },
  '/contact': {
    hy: { title: 'Կապ', description: 'Կապվեք GARON Construction-ի հետ՝ ձեր նախագիծը քննարկելու համար։' },
    en: { title: 'Contact', description: 'Contact GARON Construction to discuss your project.' },
    ru: { title: 'Контакты', description: 'Свяжитесь с GARON Construction, чтобы обсудить ваш проект.' }
  }
};

export function pageKey(pathname: string): string | undefined {
  if (pathname.startsWith('/projects/pool')) return '/projects/pool';
  if (pathname.startsWith('/projects/house')) return '/projects/house';
  return pageMeta[pathname] ? pathname : undefined;
}

const OG_IMAGE = '/opengraph-image.jpg';

export function metaFor(path: string): Metadata {
  const m = pageMeta[pageKey(path) ?? '/'].hy;
  const title = `${m.title} | ${SITE_NAME}`;
  return {
    // absolute՝ որպեսզի խորը էջերի վերնագրից չկորչի « | GARON Construction» վերջավորությունը
    title: { absolute: title },
    description: m.description,
    alternates: { canonical: path },
    openGraph: { title, description: m.description, url: path, siteName: SITE_NAME, type: 'website', locale: 'hy_AM', images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title, description: m.description, images: [OG_IMAGE] }
  };
}
