// GARON-ի նախագծերը։ Նոր նախագիծ ավելացնելու համար պատճենեք մեկ օբյեկտ, փոխեք slug-ը,
// տեքստերը և նկարների ուղիները (public/media/projects/<պանակ>/)։
// `location` դաշտերը ժամանակավոր են («Հայաստան»)՝ ճշգրիտ վայրերը հայտնի լինելուց հետո փոխեք։
// `concept: true` նշանակում է, որ պատկերները վիզուալիզացիա են, ոչ թե ավարտված օբյեկտի լուսանկար։
import type { Locale } from '@/lib/i18n';

export type L = Record<Locale, string>;
export type CategoryKey = 'houses' | 'pools' | 'renovation' | 'architecture';
export type ChapterKey = 'concept' | 'architecture' | 'materials' | 'construction' | 'interior' | 'result';

export type Chapter = {
  key: ChapterKey;
  text: L;
  images: string[];
  /** Line-drawing overlay that dissolves into the first image. */
  lines?: string;
  /** CSS object-position for the chapter images (crop focus). */
  focus?: string;
};

export type Project = {
  slug: string;
  category: CategoryKey;
  concept?: boolean;
  title: L;
  location: L;
  type: L;
  summary: L;
  cover: string;
  coverPosition?: string;
  chapters: Chapter[];
  beforeAfter?: { video: string; frames: [string, string, string] };
};

export const categoryOrder: CategoryKey[] = ['houses', 'pools', 'renovation', 'architecture'];

const armenia: L = { hy: 'Հայաստան', en: 'Armenia', ru: 'Армения' };
const house = (n: string) => `/media/projects/house-01/${n}.webp`;
const pool = (p: string, n: string) => `/media/projects/${p}/${n}.webp`;

export const projects: Project[] = [
  {
    slug: 'private-residence',
    category: 'houses',
    title: { hy: 'Առանձնատուն', en: 'Private Residence', ru: 'Частная резиденция' },
    location: armenia,
    type: { hy: 'Առանձնատուն · նախագծում և կառուցում', en: 'Private house · design & build', ru: 'Частный дом · проект и строительство' },
    summary: {
      hy: 'Զրոյական վիճակից մինչև պատրաստ տուն ամբողջ ճանապարհը՝ մեկ նախագծի մեջ։',
      en: 'The whole path from bare land to a finished home — in one project.',
      ru: 'Весь путь от пустого участка до готового дома — в одном проекте.'
    },
    cover: house('12'),
    coverPosition: '50% 40%',
    chapters: [
      {
        key: 'concept',
        text: {
          hy: 'Ամեն ինչ սկսվեց դատարկ, քարքարոտ հողամասից։ Խնդիրն էր՝ տեղանքը վերածել ժամանակակից ընտանեկան տան՝ բաց տեռասներով և լողավազանով։',
          en: 'It began with an empty, rocky plot. The task: turn the terrain into a contemporary family home with open terraces and a pool.',
          ru: 'Всё началось с пустого каменистого участка. Задача — превратить рельеф в современный семейный дом с открытыми террасами и бассейном.'
        },
        images: [house('01'), house('02'), house('03')]
      },
      {
        key: 'architecture',
        text: {
          hy: 'Հստակ ծավալներ, խոր ստվերներ և մեծ ապակեպատ բացվածքներ. տունը բացվում է դեպի լույսն ու տեսարանը։',
          en: 'Clean volumes, deep shadows and large glazed openings — the house opens towards the light and the view.',
          ru: 'Чистые объёмы, глубокие тени и большие остеклённые проёмы — дом раскрывается к свету и виду.'
        },
        images: [house('11')],
        lines: '/media/lines/house-lines.webp'
      },
      {
        key: 'construction',
        text: {
          hy: 'Հիմքից մինչև կմախք՝ ամրանավորում, բետոնում և շարվածք։ Յուրաքանչյուր փուլ վերահսկվել է տեղում։',
          en: 'From foundation to frame: reinforcement, concrete pours and masonry, with every stage checked on site.',
          ru: 'От фундамента до каркаса: армирование, бетонирование и кладка, каждый этап проверялся на объекте.'
        },
        images: [house('04'), house('05'), house('06'), house('07'), house('08'), house('09'), house('10')]
      },
      {
        key: 'materials',
        text: {
          hy: 'Ճակատը երեսպատված է բնական տուֆով՝ հայկական ճարտարապետության ամենաճանաչելի նյութով, որը տարիների ընթացքում միայն ավելի գեղեցիկ է դառնում։',
          en: 'The facade is clad in natural tuff — the most recognisable material of Armenian architecture, and one that only grows more beautiful with time.',
          ru: 'Фасад облицован натуральным туфом — самым узнаваемым материалом армянской архитектуры, который со временем становится только красивее.'
        },
        images: [house('11')],
        focus: '70% 25%'
      },
      {
        key: 'result',
        text: {
          hy: 'Երեկոյան լույսի ներքո տունը ցույց է տալիս այն, ինչի համար կառուցվել է. հանգիստ, ամուր և պատրաստ ապրելու։',
          en: 'In the evening light the house shows what it was built for: calm, solid and ready to be lived in.',
          ru: 'В вечернем свете дом показывает, ради чего он построен: спокойный, прочный и готовый к жизни.'
        },
        images: [house('12')]
      }
    ]
  },
  {
    slug: 'mosaic-pool-spa',
    category: 'pools',
    title: { hy: 'Խճանկարային լողավազան և սպա', en: 'Mosaic Pool & Spa', ru: 'Мозаичный бассейн и спа' },
    location: armenia,
    type: { hy: 'Լողավազան · ջակուզի', en: 'Swimming pool · jacuzzi', ru: 'Бассейн · джакузи' },
    summary: {
      hy: 'Կոր գծերով լողավազան՝ կլոր ջակուզիով և ձեռքով շարված խճանկարով։',
      en: 'A curved pool with a round jacuzzi and hand-laid mosaic.',
      ru: 'Бассейн плавных форм с круглым джакузи и мозаикой ручной укладки.'
    },
    cover: pool('pool-01', '06'),
    chapters: [
      {
        key: 'concept',
        text: {
          hy: 'Ազատ ձևի լողավազան, որի մեջ ջակուզին ոչ թե առանձին տարր է, այլ նույն կոմպոզիցիայի մասը։',
          en: 'A free-form pool where the jacuzzi is not an add-on but part of the same composition.',
          ru: 'Бассейн свободной формы, в котором джакузи — не дополнение, а часть единой композиции.'
        },
        images: [pool('pool-01', '04')]
      },
      {
        key: 'construction',
        text: {
          hy: 'Երկաթբետոնե կմախքը ձևավորում է կորերը, աստիճանները և ջակուզու օղակը՝ նախքան հիդրոմեկուսացումը։',
          en: 'The reinforced concrete shell shapes the curves, the steps and the jacuzzi ring before waterproofing.',
          ru: 'Железобетонная чаша формирует изгибы, ступени и кольцо джакузи ещё до гидроизоляции.'
        },
        images: [pool('pool-01', '07'), pool('pool-01', '01'), pool('pool-01', '02'), pool('pool-01', '03'), pool('pool-01', '08')]
      },
      {
        key: 'materials',
        text: {
          hy: 'Կապույտ երանգների խճանկարը շարվում է ձեռքով՝ կորերի վրա ևս պահպանելով հավասար կարերը։',
          en: 'Mosaic in shades of blue is laid by hand, keeping the joints even across every curve.',
          ru: 'Мозаика в оттенках синего укладывается вручную, сохраняя ровные швы на каждом изгибе.'
        },
        images: [pool('pool-01', '05')]
      },
      {
        key: 'result',
        text: {
          hy: 'Պատրաստ լողավազան, որտեղ ջուրը, քարը և խճանկարը դառնում են մեկ ամբողջություն։',
          en: 'A finished pool where water, stone and mosaic read as one.',
          ru: 'Готовый бассейн, где вода, камень и мозаика воспринимаются как единое целое.'
        },
        images: [pool('pool-01', '06')]
      }
    ]
  },
  {
    slug: 'family-pool',
    category: 'pools',
    title: { hy: 'Ընտանեկան լողավազան', en: 'Family Pool', ru: 'Семейный бассейн' },
    location: armenia,
    type: { hy: 'Լողավազան · ամբողջական կառուցում', en: 'Swimming pool · full build', ru: 'Бассейн · полный цикл' },
    summary: {
      hy: 'Ուղղանկյուն լողավազան՝ ամրանից մինչև ջուր, բոլոր փուլերով։',
      en: 'A rectangular pool, from rebar to water — every stage.',
      ru: 'Прямоугольный бассейн от арматуры до воды — все этапы.'
    },
    cover: pool('pool-02', '07'),
    chapters: [
      {
        key: 'construction',
        text: {
          hy: 'Ամրանային կարկասը և բետոնե պատերը կառուցվում են նույն ճշգրտությամբ, ինչ տան հիմքը։',
          en: 'The rebar cage and concrete walls are built with the same precision as a house foundation.',
          ru: 'Арматурный каркас и бетонные стены возводятся с той же точностью, что и фундамент дома.'
        },
        images: [pool('pool-02', '01'), pool('pool-02', '02'), pool('pool-02', '05')]
      },
      {
        key: 'result',
        text: {
          hy: 'Մաքուր գծեր, պարզ ձև և ջուր, որը պատրաստ է ամառվան։',
          en: 'Clean lines, a simple form and water ready for summer.',
          ru: 'Чистые линии, простая форма и вода, готовая к лету.'
        },
        images: [pool('pool-02', '07')]
      }
    ]
  },
  {
    slug: 'mountain-view-pool',
    category: 'pools',
    title: { hy: 'Լողավազան լեռների տեսարանով', en: 'Mountain View Pool', ru: 'Бассейн с видом на горы' },
    location: armenia,
    type: { hy: 'Լողավազան · ջակուզի', en: 'Swimming pool · jacuzzi', ru: 'Бассейн · джакузи' },
    summary: {
      hy: 'Լողավազան և ջակուզի, որոնք բացվում են դեպի լեռները։',
      en: 'A pool and jacuzzi opening onto the mountains.',
      ru: 'Бассейн и джакузи, открытые к горам.'
    },
    cover: pool('pool-04', '01'),
    chapters: [
      {
        key: 'result',
        text: {
          hy: 'Տեղանքի բնական թեքությունն օգտագործված է այնպես, որ ջրից տեսարանը մնա բաց։',
          en: 'The natural slope of the site is used so that the view from the water stays open.',
          ru: 'Естественный уклон участка использован так, чтобы вид из воды оставался открытым.'
        },
        images: [pool('pool-04', '01')]
      }
    ]
  },
  {
    slug: 'garden-pool',
    category: 'pools',
    title: { hy: 'Այգու լողավազան', en: 'Garden Pool', ru: 'Бассейн в саду' },
    location: armenia,
    type: { hy: 'Լողավազան', en: 'Swimming pool', ru: 'Бассейн' },
    summary: {
      hy: 'Երկար լողավազան՝ կանաչ սիզամարգի և պարտեզի պատի միջև։',
      en: 'A long pool set between lawn and garden wall.',
      ru: 'Длинный бассейн между газоном и садовой стеной.'
    },
    cover: pool('pool-05', '01'),
    chapters: [
      {
        key: 'result',
        text: {
          hy: 'Պարզ երկրաչափություն, որը հանգիստ տեղավորվում է այգու մեջ։',
          en: 'Simple geometry that sits quietly within the garden.',
          ru: 'Простая геометрия, спокойно вписанная в сад.'
        },
        images: [pool('pool-05', '01')],
        lines: '/media/lines/pool-lines.webp'
      }
    ]
  },
  {
    slug: 'apartment-transformation',
    category: 'renovation',
    concept: true,
    title: { hy: 'Բնակարանի վերափոխում', en: 'Apartment Transformation', ru: 'Преображение квартиры' },
    location: { hy: 'Երևան', en: 'Yerevan', ru: 'Ереван' },
    type: { hy: 'Վերանորոգում · ինտերիեր', en: 'Renovation · interior', ru: 'Ремонт · интерьер' },
    summary: {
      hy: 'Մերկ բետոնից մինչև լույսով լի ինտերիեր։',
      en: 'From bare concrete to a light-filled interior.',
      ru: 'От голого бетона до наполненного светом интерьера.'
    },
    cover: '/media/services/renovation-panorama-2.webp',
    chapters: [
      {
        key: 'concept',
        text: {
          hy: 'Բաց պլանավորում, որտեղ հյուրասենյակը, խոհանոցն ու ճաշասենյակը դառնում են մեկ լուսավոր տարածք։',
          en: 'An open plan where living, kitchen and dining become one bright space.',
          ru: 'Открытая планировка, в которой гостиная, кухня и столовая становятся одним светлым пространством.'
        },
        images: ['/media/frames/renovation-before.webp']
      },
      {
        key: 'construction',
        text: {
          hy: 'Քանդում, նոր ինժեներական ցանցեր, հարթեցում և պատրաստում հարդարման համար։',
          en: 'Demolition, new engineering systems, levelling and preparation for finishing.',
          ru: 'Демонтаж, новые инженерные системы, выравнивание и подготовка к отделке.'
        },
        images: ['/media/services/renovation.webp', '/media/frames/renovation-construction.webp']
      },
      {
        key: 'interior',
        text: {
          hy: 'Տաք փայտ, բաց երանգներ և թաքնված լուսավորություն. ինտերիերը հանգիստ է և ամբողջական։',
          en: 'Warm wood, light tones and hidden lighting — the interior is calm and complete.',
          ru: 'Тёплое дерево, светлые тона и скрытая подсветка — интерьер спокойный и цельный.'
        },
        images: ['/media/frames/renovation-after.webp'],
        lines: '/media/lines/interior-lines.webp'
      },
      {
        key: 'result',
        text: {
          hy: 'Նույն պատերը, բոլորովին այլ կյանք։',
          en: 'The same walls, an entirely different life.',
          ru: 'Те же стены — совсем другая жизнь.'
        },
        images: ['/media/services/renovation-panorama-2.webp']
      }
    ],
    beforeAfter: {
      video: '/media/video/renovation.mp4',
      frames: ['/media/frames/renovation-before.webp', '/media/frames/renovation-construction.webp', '/media/frames/renovation-after.webp']
    }
  },
  {
    slug: 'villa-concept',
    category: 'architecture',
    concept: true,
    title: { hy: 'Վիլլա լողավազանով', en: 'Villa with Pool', ru: 'Вилла с бассейном' },
    location: armenia,
    type: { hy: 'Ճարտարապետական կոնցեպտ', en: 'Architectural concept', ru: 'Архитектурная концепция' },
    summary: {
      hy: 'Մեկ հարկանի վիլլա՝ ծածկած տեռասով, բացօթյա խոհանոցով և լողավազանով։',
      en: 'A single-storey villa with a covered terrace, outdoor kitchen and pool.',
      ru: 'Одноэтажная вилла с крытой террасой, летней кухней и бассейном.'
    },
    cover: '/media/services/residential-hero.webp',
    chapters: [
      {
        key: 'concept',
        text: {
          hy: 'Տուն, որտեղ ներսն ու դուրսը միաձուլվում են մեկ ամառային տարածքի մեջ՝ տեռաս, խոհանոց և ջուր մեկ առանցքի վրա։',
          en: 'A house where inside and outside merge into one summer space — terrace, kitchen and water on a single axis.',
          ru: 'Дом, где внутреннее и внешнее сливаются в одно летнее пространство — терраса, кухня и вода на одной оси.'
        },
        images: ['/media/lines/villa-lines.webp']
      },
      {
        key: 'architecture',
        text: {
          hy: 'Լայն կախված տանիքը ստվեր է տալիս տեռասին, իսկ բնական քարով սյուները կազմում են տան ռիթմը։',
          en: 'A deep overhanging roof shades the terrace, while stone-clad piers set the rhythm of the house.',
          ru: 'Глубокий свес кровли затеняет террасу, а облицованные камнем пилоны задают ритм дома.'
        },
        images: ['/media/services/residential-hero.webp'],
        lines: '/media/lines/villa-lines.webp'
      },
      {
        key: 'materials',
        text: {
          hy: 'Բաց երանգի քար, մուգ ալյումինե շրջանակներ և կերամիկական սալիկներով տանիք՝ զուսպ և երկարակյաց համադրություն։',
          en: 'Light stone, dark aluminium frames and a tiled roof — a restrained and long-lasting palette.',
          ru: 'Светлый камень, тёмные алюминиевые рамы и черепичная кровля — сдержанная и долговечная палитра.'
        },
        images: ['/media/services/residential-hero.webp'],
        focus: '72% 45%'
      }
    ]
  },
  {
    slug: 'residential-quarter',
    category: 'architecture',
    concept: true,
    title: { hy: 'Բնակելի թաղամաս', en: 'Residential Quarter', ru: 'Жилой квартал' },
    location: { hy: 'Երևան', en: 'Yerevan', ru: 'Ереван' },
    type: { hy: 'Ճարտարապետություն · ինժեներիա', en: 'Architecture · engineering', ru: 'Архитектура · инженерия' },
    summary: {
      hy: 'Բազմաբնակարան շենքեր՝ պողպատե և բետոնե կմախքից մինչև ավարտված թաղամաս։',
      en: 'Apartment buildings — from steel and concrete frame to a finished quarter.',
      ru: 'Многоквартирные дома — от стального и бетонного каркаса до готового квартала.'
    },
    cover: '/media/frames/city-end.webp',
    chapters: [
      {
        key: 'concept',
        text: {
          hy: 'Թաղամաս, որտեղ շենքերը, բակերը և փողոցները նախագծվում են որպես մեկ համակարգ։',
          en: 'A quarter where buildings, courtyards and streets are designed as one system.',
          ru: 'Квартал, в котором здания, дворы и улицы проектируются как единая система.'
        },
        images: ['/media/frames/city-start.webp']
      },
      {
        key: 'architecture',
        text: {
          hy: 'Ռիթմիկ ճակատներ, պատշգամբներ և կանաչ բակեր՝ մարդու մասշտաբով։',
          en: 'Rhythmic facades, balconies and green courtyards at a human scale.',
          ru: 'Ритмичные фасады, балконы и зелёные дворы в человеческом масштабе.'
        },
        images: ['/media/services/residential.webp']
      },
      {
        key: 'construction',
        text: {
          hy: 'Կմախքը հաշվարկվում և կառուցվում է հարկ առ հարկ՝ ինժեներական ցանցերի հետ համաժամ։',
          en: 'The frame is calculated and built floor by floor, in step with the engineering networks.',
          ru: 'Каркас рассчитывается и возводится этаж за этажом, синхронно с инженерными сетями.'
        },
        images: ['/media/services/public-works.webp'],
        lines: '/media/lines/frame-lines.webp'
      },
      {
        key: 'result',
        text: {
          hy: 'Ավարտված թաղամաս՝ պատրաստ բնակիչների համար։',
          en: 'A finished quarter, ready for its residents.',
          ru: 'Готовый квартал, ожидающий своих жителей.'
        },
        images: ['/media/frames/city-end.webp'],
        lines: '/media/lines/city-lines.webp'
      }
    ]
  }
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const projectsByCategory = (key: CategoryKey) => projects.filter((p) => p.category === key);
export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
