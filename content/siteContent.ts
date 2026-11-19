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
    images: ['07','01','02','03','04','05','06'].map(n=>`/projects/pool-01/${n}.webp`),
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
    heroImage:'/projects/pool-02/08.webp',
    images: ['01','02','09','08'].map(n=>`/projects/pool-02/${n}.webp`),
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
  'house-01': {
    slug:'house-01', number:'03', category:'RESIDENTIAL',
    heroImage:'/projects/house-01/12.webp',
    images: ['01','02','03','04','05','06','07','08','09','10','13','12'].map(n=>`/projects/house-01/${n}.webp`),
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

// Լողավազաններ, որոնց համար կան կառուցման փուլերի լուսանկարներ (առանձին էջով)
export const poolCardsByLang: Record<Lang, readonly (readonly [string,string,string,string,string])[]> = {
  hy: [
    ['pool-01','ԼՈՂԱՎԱԶԱՆ','Լողավազան','Կառուցման ամբողջ ընթացք','/projects/pool-01/06.webp'],
    ['pool-02','ԼՈՂԱՎԱԶԱՆ','Լողավազան','Կառուցման ամբողջ ընթացք','/projects/pool-02/08.webp']
  ],
  en: [
    ['pool-01','POOL','Swimming Pool','Full Construction Process','/projects/pool-01/06.webp'],
    ['pool-02','POOL','Swimming Pool','Full Construction Process','/projects/pool-02/08.webp']
  ],
  ru: [
    ['pool-01','БАССЕЙН','Бассейн','Полный процесс строительства','/projects/pool-01/06.webp'],
    ['pool-02','БАССЕЙН','Бассейн','Полный процесс строительства','/projects/pool-02/08.webp']
  ]
};

// Ավարտված լողավազաններ առանց կառուցման փուլերի լուսանկարների. ցույց են տրվում միայն որպես նկար, առանց առանձին էջի
export const completedPools: readonly string[] = ['/projects/pool-03/03.webp','/projects/pool-04/02.webp','/projects/pool-05/01.webp'];
