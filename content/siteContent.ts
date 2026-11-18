// GARON V5 CONTENT
// Փոխիր այստեղի տեքստերը կամ նկարների անունները՝ կայքի բովանդակությունը կառավարելու համար։
// Նկարները պահվում են public/projects/<project-folder>/ պանակներում։
import type { Lang } from '../components/LanguageContext';

export type ProjectText = {
  eyebrow: string;
  title: string;
  titleSecond: string;
  description: string;
  facts: { label: string; value: string }[];
  introEyebrow: string;
  introTitle: string;
  introTitleSecond: string;
  introText: string;
  nextTitle: string;
  nextTitleSecond: string;
  nextEyebrow: string;
};

export type Project = {
  slug: string;
  number: string;
  category: string;
  heroImage: string;
  images: string[];
  nextHref: string;
  content: Record<Lang, ProjectText>;
};

export const projects: Record<string, Project> = {
  'pool-01': {
    slug: 'pool-01', number: '01', category: 'POOL',
    heroImage: '/projects/pool-01/06.webp',
    images: ['07','08','01','02','03','04','05','06'].map(n=>`/projects/pool-01/${n}.webp`),
    nextHref: '/projects/pool-02',
    content: {
      hy: {
        eyebrow: 'ՆԱԽԱԳԻԾ · ԼՈՂԱՎԱԶԱՆ', title: 'Լողավազան', titleSecond: 'Ամբողջական գործընթաց',
        description: 'Լողավազանի կառուցում՝ կառուցվածքից մինչև ավարտված տեսք։',
        facts: [{label:'ՏԵՍԱԿ',value:'Լողավազան'},{label:'ԿԱՐԳԱՎԻՃԱԿ',value:'Ավարտված'},{label:'ԾԱՎԱԼ',value:'Շինարարություն'}],
        introEyebrow:'ԳՈՐԾԸՆԹԱՑԸ', introTitle:'Սկիզբից մինչև', introTitleSecond:'վերջնական արդյունք։',
        introText:'Այս նախագծի պատկերները ցույց են տալիս աշխատանքի տարբեր փուլերը՝ նախնական կառուցվածքից մինչև հարդարված և պատրաստ լողավազան։',
        nextTitle:'Լողավազան', nextTitleSecond:'Ամեն փուլ', nextEyebrow:'ՀԱՋՈՐԴ ՆԱԽԱԳԻԾԸ'
      },
      en: {
        eyebrow: 'PROJECT · POOL', title: 'Swimming Pool', titleSecond: 'Full Process',
        description: 'Pool construction — from structure to finished look.',
        facts: [{label:'TYPE',value:'Swimming Pool'},{label:'STATUS',value:'Completed'},{label:'SCOPE',value:'Construction'}],
        introEyebrow:'THE PROCESS', introTitle:'From Start', introTitleSecond:'to Final Result.',
        introText:'The images from this project show the different stages of the work — from the initial structure to the finished, ready pool.',
        nextTitle:'Swimming Pool', nextTitleSecond:'Every Stage', nextEyebrow:'NEXT PROJECT'
      },
      ru: {
        eyebrow: 'ПРОЕКТ · БАССЕЙН', title: 'Бассейн', titleSecond: 'Полный процесс',
        description: 'Строительство бассейна — от конструкции до готового вида.',
        facts: [{label:'ТИП',value:'Бассейн'},{label:'СТАТУС',value:'Завершён'},{label:'ОБЪЁМ',value:'Строительство'}],
        introEyebrow:'ПРОЦЕСС', introTitle:'От начала', introTitleSecond:'до финального результата.',
        introText:'Фотографии этого проекта показывают разные этапы работы — от первоначальной конструкции до отделанного, готового бассейна.',
        nextTitle:'Бассейн', nextTitleSecond:'Каждый этап', nextEyebrow:'СЛЕДУЮЩИЙ ПРОЕКТ'
      }
    }
  },
  'pool-02': {
    slug:'pool-02', number:'02', category:'POOL',
    heroImage:'/projects/pool-02/04.webp',
    images: ['03','01','02','06','05','04'].map(n=>`/projects/pool-02/${n}.webp`),
    nextHref:'/projects/house-01',
    content: {
      hy: {
        eyebrow:'ՆԱԽԱԳԻԾ · ԼՈՂԱՎԱԶԱՆ', title:'Լողավազան', titleSecond:'Ամեն փուլ',
        description:'Կառուցման փուլերից մինչև պատրաստ կառուցվածք՝ մեկ ամբողջական պատմություն։',
        facts:[{label:'ՏԵՍԱԿ',value:'Լողավազան'},{label:'ԿԱՐԳԱՎԻՃԱԿ',value:'Ավարտված'},{label:'ԾԱՎԱԼ',value:'Շինարարություն'}],
        introEyebrow:'ԳՈՐԾԸՆԹԱՑԸ', introTitle:'Յուրաքանչյուր փուլ', introTitleSecond:'տեսանելի է։',
        introText:'Այստեղ հավաքված են նույն նախագծի կառուցման փուլերը՝ հիմքից և ամրանավորումից մինչև կառուցվածքի ավարտ և վերջնական տեսք։',
        nextTitle:'Տուն', nextTitleSecond:'Ամբողջ ճանապարհը', nextEyebrow:'ՀԱՋՈՐԴ ՆԱԽԱԳԻԾԸ'
      },
      en: {
        eyebrow:'PROJECT · POOL', title:'Swimming Pool', titleSecond:'Every Stage',
        description:'From construction stages to the finished structure — one complete story.',
        facts:[{label:'TYPE',value:'Swimming Pool'},{label:'STATUS',value:'Completed'},{label:'SCOPE',value:'Construction'}],
        introEyebrow:'THE PROCESS', introTitle:'Every Stage', introTitleSecond:'is visible.',
        introText:'Gathered here are the construction stages of the same project — from foundation and reinforcement to the completed structure and final look.',
        nextTitle:'House', nextTitleSecond:'Full Journey', nextEyebrow:'NEXT PROJECT'
      },
      ru: {
        eyebrow:'ПРОЕКТ · БАССЕЙН', title:'Бассейн', titleSecond:'Каждый этап',
        description:'От этапов строительства до готовой конструкции — одна цельная история.',
        facts:[{label:'ТИП',value:'Бассейн'},{label:'СТАТУС',value:'Завершён'},{label:'ОБЪЁМ',value:'Строительство'}],
        introEyebrow:'ПРОЦЕСС', introTitle:'Каждый этап', introTitleSecond:'виден.',
        introText:'Здесь собраны этапы строительства одного и того же проекта — от фундамента и армирования до завершения конструкции и финального вида.',
        nextTitle:'Дом', nextTitleSecond:'Весь путь', nextEyebrow:'СЛЕДУЮЩИЙ ПРОЕКТ'
      }
    }
  },
  'pool-03': {
    slug:'pool-03', number:'03', category:'POOL',
    heroImage:'/projects/pool-03/03.webp',
    images: ['01','02','03'].map(n=>`/projects/pool-03/${n}.webp`),
    nextHref:'/projects/pool-04',
    content: {
      hy: {
        eyebrow:'ՆԱԽԱԳԻԾ · ԼՈՂԱՎԱԶԱՆ', title:'Լողավազան', titleSecond:'Իրական գործընթաց',
        description:'Իրական շինարարական ընթացք՝ կառուցվածքից մինչև ավարտված ջրային տարածք։',
        facts:[{label:'ՏԵՍԱԿ',value:'Լողավազան'},{label:'ԿԱՐԳԱՎԻՃԱԿ',value:'Ավարտված'},{label:'ՄԵԴԻԱ',value:'3 փուլ'}],
        introEyebrow:'ՊԱՏՄՈՒԹՅՈՒՆԸ', introTitle:'Կառուցվածք,', introTitleSecond:'մանրուք, արդյունք։',
        introText:'Նախագիծը ներկայացված է երեք առանցքային պահով՝ կառուցվածքային փուլ, հարդարման դետալ և վերջնական արդյունք։',
        nextTitle:'Լողավազան', nextTitleSecond:'Վերջնական արդյունք', nextEyebrow:'ՀԱՋՈՐԴ ՆԱԽԱԳԻԾԸ'
      },
      en: {
        eyebrow:'PROJECT · POOL', title:'Swimming Pool', titleSecond:'Real Process',
        description:'A real construction process — from structure to a finished water feature.',
        facts:[{label:'TYPE',value:'Swimming Pool'},{label:'STATUS',value:'Completed'},{label:'MEDIA',value:'3 stages'}],
        introEyebrow:'THE STORY', introTitle:'Structure,', introTitleSecond:'Detail, Result.',
        introText:'The project is presented through three key moments — the structural stage, a finishing detail, and the final result.',
        nextTitle:'Swimming Pool', nextTitleSecond:'Final Result', nextEyebrow:'NEXT PROJECT'
      },
      ru: {
        eyebrow:'ПРОЕКТ · БАССЕЙН', title:'Бассейн', titleSecond:'Реальный процесс',
        description:'Реальный процесс строительства — от конструкции до готового водного пространства.',
        facts:[{label:'ТИП',value:'Бассейн'},{label:'СТАТУС',value:'Завершён'},{label:'МЕДИА',value:'3 этапа'}],
        introEyebrow:'ИСТОРИЯ', introTitle:'Конструкция,', introTitleSecond:'деталь, результат.',
        introText:'Проект представлен тремя ключевыми моментами — этапом конструкции, деталью отделки и финальным результатом.',
        nextTitle:'Бассейн', nextTitleSecond:'Финальный результат', nextEyebrow:'СЛЕДУЮЩИЙ ПРОЕКТ'
      }
    }
  },
  'pool-04': {
    slug:'pool-04', number:'04', category:'POOL',
    heroImage:'/projects/pool-04/01.webp',
    images: ['01'].map(n=>`/projects/pool-04/${n}.webp`),
    nextHref:'/projects/pool-05',
    content: {
      hy: {
        eyebrow:'ՆԱԽԱԳԻԾ · ԼՈՂԱՎԱԶԱՆ', title:'Լողավազան', titleSecond:'Վերջնական արդյունք',
        description:'Ավարտված լողավազան՝ որպես ամբողջական արդյունք։',
        facts:[{label:'ՏԵՍԱԿ',value:'Լողավազան'},{label:'ԿԱՐԳԱՎԻՃԱԿ',value:'Ավարտված'},{label:'ՄԵԴԻԱ',value:'Վերջնական արդյունք'}],
        introEyebrow:'ՆԱԽԱԳԻԾ', introTitle:'Ավարտված', introTitleSecond:'արդյունք։',
        introText:'Իրականացված նախագծի վերջնական տեսքը՝ առանց ավելորդությունների։',
        nextTitle:'Լողավազան', nextTitleSecond:'Մաքուր գծեր', nextEyebrow:'ՀԱՋՈՐԴ ՆԱԽԱԳԻԾԸ'
      },
      en: {
        eyebrow:'PROJECT · POOL', title:'Swimming Pool', titleSecond:'Final Result',
        description:'A completed pool as a finished result.',
        facts:[{label:'TYPE',value:'Swimming Pool'},{label:'STATUS',value:'Completed'},{label:'MEDIA',value:'Final result'}],
        introEyebrow:'PROJECT', introTitle:'Finished', introTitleSecond:'Result.',
        introText:'The final look of the completed project — without excess.',
        nextTitle:'Swimming Pool', nextTitleSecond:'Clean Lines', nextEyebrow:'NEXT PROJECT'
      },
      ru: {
        eyebrow:'ПРОЕКТ · БАССЕЙН', title:'Бассейн', titleSecond:'Финальный результат',
        description:'Завершённый бассейн как целостный результат.',
        facts:[{label:'ТИП',value:'Бассейн'},{label:'СТАТУС',value:'Завершён'},{label:'МЕДИА',value:'Финальный результат'}],
        introEyebrow:'ПРОЕКТ', introTitle:'Готовый', introTitleSecond:'результат.',
        introText:'Финальный вид реализованного проекта — без излишеств.',
        nextTitle:'Бассейн', nextTitleSecond:'Чистые линии', nextEyebrow:'СЛЕДУЮЩИЙ ПРОЕКТ'
      }
    }
  },
  'pool-05': {
    slug:'pool-05', number:'05', category:'POOL',
    heroImage:'/projects/pool-05/01.webp',
    images: ['01'].map(n=>`/projects/pool-05/${n}.webp`),
    nextHref:'/contact',
    content: {
      hy: {
        eyebrow:'ՆԱԽԱԳԻԾ · ԼՈՂԱՎԱԶԱՆ', title:'Լողավազան', titleSecond:'Մաքուր գծեր',
        description:'Մաքուր գծերով ավարտված նախագիծ՝ իրական արդյունքով։',
        facts:[{label:'ՏԵՍԱԿ',value:'Լողավազան'},{label:'ԿԱՐԳԱՎԻՃԱԿ',value:'Ավարտված'},{label:'ՄԵԴԻԱ',value:'Վերջնական արդյունք'}],
        introEyebrow:'ՆԱԽԱԳԻԾ', introTitle:'Մաքուր գծեր,', introTitleSecond:'իրական արդյունք։',
        introText:'Ավարտված լողավազանի վերջնական արդյունքը։',
        nextTitle:'Ձեր գաղափարը', nextTitleSecond:'հաջորդը կարող է լինել։', nextEyebrow:'ՍԿՍԵՔ ՁԵՐ ՆԱԽԱԳԻԾԸ'
      },
      en: {
        eyebrow:'PROJECT · POOL', title:'Swimming Pool', titleSecond:'Clean Lines',
        description:'A completed project with clean lines and a real result.',
        facts:[{label:'TYPE',value:'Swimming Pool'},{label:'STATUS',value:'Completed'},{label:'MEDIA',value:'Final result'}],
        introEyebrow:'PROJECT', introTitle:'Clean Lines,', introTitleSecond:'Real Result.',
        introText:'The final result of the completed pool.',
        nextTitle:'Your Idea', nextTitleSecond:'could be next.', nextEyebrow:'START YOUR PROJECT'
      },
      ru: {
        eyebrow:'ПРОЕКТ · БАССЕЙН', title:'Бассейн', titleSecond:'Чистые линии',
        description:'Завершённый проект с чистыми линиями и реальным результатом.',
        facts:[{label:'ТИП',value:'Бассейн'},{label:'СТАТУС',value:'Завершён'},{label:'МЕДИА',value:'Финальный результат'}],
        introEyebrow:'ПРОЕКТ', introTitle:'Чистые линии,', introTitleSecond:'реальный результат.',
        introText:'Финальный результат завершённого бассейна.',
        nextTitle:'Ваша идея', nextTitleSecond:'может быть следующей.', nextEyebrow:'НАЧНИТЕ СВОЙ ПРОЕКТ'
      }
    }
  },
  'house-01': {
    slug:'house-01', number:'03', category:'RESIDENTIAL',
    heroImage:'/projects/house-01/12.webp',
    images: Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')).map(n=>`/projects/house-01/${n}.webp`),
    nextHref:'/contact',
    content: {
      hy: {
        eyebrow:'ՆԱԽԱԳԻԾ · ԲՆԱԿԵԼԻ', title:'Տուն', titleSecond:'Ամբողջ ճանապարհը',
        description:'Բնակելի տան կառուցում՝ շինհրապարակից մինչև ավարտված արդյունք։',
        facts:[{label:'ՏԵՍԱԿ',value:'Բնակելի'},{label:'ԿԱՐԳԱՎԻՃԱԿ',value:'Ավարտված'},{label:'ԾԱՎԱԼ',value:'Շինարարություն'}],
        introEyebrow:'ԳՈՐԾԸՆԹԱՑԸ', introTitle:'Կառուցման ամբողջ', introTitleSecond:'ճանապարհը։',
        introText:'Նախնական տարածքից և հիմքից մինչև կառուցված տուն և վերջնական լուսավորությամբ ավարտված տեսք՝ այս gallery-ն ներկայացնում է նույն նախագծի իրական ընթացքը՝ փուլ առ փուլ։',
        nextTitle:'Ձեր գաղափարը', nextTitleSecond:'հաջորդը կարող է լինել։', nextEyebrow:'ՍԿՍԵՔ ՁԵՐ ՆԱԽԱԳԻԾԸ'
      },
      en: {
        eyebrow:'PROJECT · RESIDENTIAL', title:'House', titleSecond:'Full Journey',
        description:'Residential home construction — from the building site to the finished result.',
        facts:[{label:'TYPE',value:'Residential'},{label:'STATUS',value:'Completed'},{label:'SCOPE',value:'Construction'}],
        introEyebrow:'THE PROCESS', introTitle:'The Entire', introTitleSecond:'Construction Journey.',
        introText:'From the initial site and foundation to the built house and its finished look with final lighting — this gallery presents the real progress of the same project, stage by stage.',
        nextTitle:'Your Idea', nextTitleSecond:'could be next.', nextEyebrow:'START YOUR PROJECT'
      },
      ru: {
        eyebrow:'ПРОЕКТ · ЖИЛОЙ ДОМ', title:'Дом', titleSecond:'Весь путь',
        description:'Строительство жилого дома — от стройплощадки до готового результата.',
        facts:[{label:'ТИП',value:'Жилой'},{label:'СТАТУС',value:'Завершён'},{label:'ОБЪЁМ',value:'Строительство'}],
        introEyebrow:'ПРОЦЕСС', introTitle:'Весь путь', introTitleSecond:'строительства.',
        introText:'От изначального участка и фундамента до построенного дома с финальным освещением — эта галерея показывает реальный ход одного и того же проекта, этап за этапом.',
        nextTitle:'Ваша идея', nextTitleSecond:'может быть следующей.', nextEyebrow:'НАЧНИТЕ СВОЙ ПРОЕКТ'
      }
    }
  }
};

export const poolCardsByLang: Record<Lang, readonly (readonly [string,string,string,string,string])[]> = {
  hy: [
    ['pool-01','ԼՈՂԱՎԱԶԱՆ','Լողավազան','Կառուցման ամբողջ ընթացք','/projects/pool-01/06.webp'],
    ['pool-02','ԼՈՂԱՎԱԶԱՆ','Լողավազան','Կառուցման ամբողջ ընթացք','/projects/pool-02/07.webp'],
    ['pool-03','ԼՈՂԱՎԱԶԱՆ','Լողավազան','Կառուցվածք → հարդարում → արդյունք','/projects/pool-03/03.webp'],
    ['pool-04','ԼՈՂԱՎԱԶԱՆ','Լողավազան','Ավարտված նախագիծ','/projects/pool-04/01.webp'],
    ['pool-05','ԼՈՂԱՎԱԶԱՆ','Լողավազան','Ավարտված նախագիծ','/projects/pool-05/01.webp']
  ],
  en: [
    ['pool-01','POOL','Swimming Pool','Full Construction Process','/projects/pool-01/06.webp'],
    ['pool-02','POOL','Swimming Pool','Full Construction Process','/projects/pool-02/07.webp'],
    ['pool-03','POOL','Swimming Pool','Structure → Finishing → Result','/projects/pool-03/03.webp'],
    ['pool-04','POOL','Swimming Pool','Completed Project','/projects/pool-04/01.webp'],
    ['pool-05','POOL','Swimming Pool','Completed Project','/projects/pool-05/01.webp']
  ],
  ru: [
    ['pool-01','БАССЕЙН','Бассейн','Полный процесс строительства','/projects/pool-01/06.webp'],
    ['pool-02','БАССЕЙН','Бассейн','Полный процесс строительства','/projects/pool-02/07.webp'],
    ['pool-03','БАССЕЙН','Бассейн','Конструкция → отделка → результат','/projects/pool-03/03.webp'],
    ['pool-04','БАССЕЙН','Бассейн','Завершённый проект','/projects/pool-04/01.webp'],
    ['pool-05','БАССЕЙН','Бассейн','Завершённый проект','/projects/pool-05/01.webp']
  ]
};
