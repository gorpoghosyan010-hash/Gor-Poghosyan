import type { Lang } from '../components/LanguageContext';

export const languageNames: Record<Lang, string> = { hy: 'Հայերեն', en: 'English', ru: 'Русский' };

export const common = {
  hy: { viewProject: 'Դիտել նախագիծը ↗', contactCta: 'Կապվել GARON-ի հետ ↗', nextProjectCta: 'Հաջորդ նախագիծը ↗', poolTag: 'ԼՈՂԱՎԱԶԱՆ', residentialTag: 'ԲՆԱԿԵԼԻ' },
  en: { viewProject: 'View Project ↗', contactCta: 'Contact GARON ↗', nextProjectCta: 'Next Project ↗', poolTag: 'POOL', residentialTag: 'RESIDENTIAL' },
  ru: { viewProject: 'Смотреть проект ↗', contactCta: 'Связаться с GARON ↗', nextProjectCta: 'Следующий проект ↗', poolTag: 'БАССЕЙН', residentialTag: 'ЖИЛОЙ ДОМ' }
};

export const nav = {
  hy: { about: 'Մեր մասին', services: 'Ծառայություններ', projects: 'Նախագծեր', calculator: 'Հաշվիչ', contact: 'Կապ', cta: 'Սկսել նախագիծը' },
  en: { about: 'About', services: 'Services', projects: 'Projects', calculator: 'Calculator', contact: 'Contact', cta: 'Start a Project' },
  ru: { about: 'О нас', services: 'Услуги', projects: 'Проекты', calculator: 'Калькулятор', contact: 'Контакты', cta: 'Начать проект' }
};

export const footer = {
  hy: { followUs: 'ՀԵՏԵՎԵՔ ՄԵԶ', rights: '© 2026 GARON Construction. Բոլոր իրավունքները պաշտպանված են։' },
  en: { followUs: 'FOLLOW US', rights: '© 2026 GARON Construction. All rights reserved.' },
  ru: { followUs: 'СЛЕДИТЕ ЗА НАМИ', rights: '© 2026 GARON Construction. Все права защищены.' }
};

export const home = {
  hy: {
    heroEyebrow: 'GARON CONSTRUCTION · 25+ ՏԱՐԻ',
    heroTitle1: 'Կառուցում ենք', heroTitle2: 'ամուր հիմքեր, երկար կյանք։',
    heroLead: 'Ժամանակակից, հուսալի և երկարատև շինարարական լուծումներ՝ նախագծումից մինչև ամբողջական իրականացում։',
    viewWork: 'Դիտել աշխատանքները ↗', startProject: 'Սկսել նախագիծը →',
    heroSig1: 'ԳԱՂԱՓԱՐՆԵՐ / ԿԱՌՈՒՅՑՆԵՐ / ԻՐԱԿԱՆ ԱՐԴՅՈՒՆՔ', heroSig2: 'ԵՐԵՎԱՆ · ՀԱՅԱՍՏԱՆ',
    trust1Label: 'տարի փորձ', trust2Label: 'լողավազանների նախագիծ', trust3Label: 'բնակելի տուն',
    philosophyEyebrow: 'GARON / ՓԻԼԻՍՈՓԱՅՈՒԹՅՈՒՆ',
    philosophyTitle1: 'Շինարարությունը', philosophyTitle2: 'միայն պատեր չէ։',
    philosophyText: 'Մենք կառուցում ենք այնպիսի արդյունք, որը պետք է լավ տեսք ունենա այսօր և ճիշտ ծառայի տարիներ անց։ Այդ պատճառով յուրաքանչյուր նախագիծ դիտարկում ենք որպես ամբողջական համակարգ՝ նյութերից ու կառուցվածքից մինչև մանրուքներ և վերջնական միջավայր։',
    philosophyLink: 'Բացահայտել GARON-ը →',
    capabilitiesEyebrow: 'ՀՆԱՐԱՎՈՐՈՒԹՅՈՒՆՆԵՐ',
    capabilitiesTitle1: 'Մեկ թիմ։', capabilitiesTitle2: 'Չորս ուղղություն։',
    capabilitiesLead: 'Լողավազաններ, բնակելի շինարարություն, վերանորոգում և հասարակական կառույցներ՝ մեկ պատասխանատու թիմի ներքո։',
    services: [
      { t: 'Լողավազանների կառուցում', d: 'Կառուցվածք, ինժեներական աշխատանքներ, հարդարում և վերջնական արդյունք։' },
      { t: 'Բնակելի տների կառուցում', d: 'Անհատական տուն՝ գաղափարից և հիմքից մինչև ամբողջական հանձնում։' },
      { t: 'Վերանորոգում և վերակառուցում', d: 'Տարածքի ամբողջական վերափոխում՝ առանց որակի փոխզիջումների։' },
      { t: 'Հասարակական կառույցներ', d: 'Կազմակերպված շինարարություն՝ ժամկետների և տեխնիկական պահանջների վերահսկմամբ։' }
    ],
    selectedWorkEyebrow: 'ԸՆՏՐՎԱԾ ԱՇԽԱՏԱՆՔ',
    selectedWorkTitle1: 'Աշխատանքը', selectedWorkTitle2: 'խոսում է ինքն իր մասին։',
    openArchive: 'Բացել ամբողջ արխիվը →',
    card1Title: 'Լողավազան', card2Title: 'Լողավազան', card3Title: 'Տուն',
    card1Meta: 'Լողավազան · ավարտված', card2Meta: 'Լողավազան · կառուցման փուլեր', card3Meta: 'Բնակելի տուն · ավարտված',
    statementEyebrow: 'ՄԱՐԴԻԿ · ՆԱԽԱԳԾԵՐ · ԱՌԱՋԸՆԹԱՑ',
    statementTitle1: 'Լավ կառուցված', statementTitle2: 'արդյունքը զգացվում է։',
    statementCta: 'Խոսենք ձեր նախագծի մասին ↗',
    calcTeaserEyebrow: 'GARON / ՀԱՇՎԻՉ',
    calcTeaserTitle1: 'Ցանկանու՞մ եք իմանալ', calcTeaserTitle2: 'մոտավոր գինը։',
    calcTeaserLead: 'Ընտրեք նախագծի տեսակը, նշեք մակերեսը և րոպեների ընթացքում տեսեք մոտավոր արժեքը։',
    calcTeaserCta: 'Բացել հաշվիչը ↗'
  },
  en: {
    heroEyebrow: 'GARON CONSTRUCTION · 25+ YEARS',
    heroTitle1: 'We Build', heroTitle2: 'solid foundations, lasting life.',
    heroLead: 'Modern, reliable and durable construction solutions — from design to full completion.',
    viewWork: 'View Our Work ↗', startProject: 'Start a Project →',
    heroSig1: 'IDEAS / STRUCTURES / REAL IMPACT', heroSig2: 'YEREVAN · ARMENIA',
    trust1Label: 'years of experience', trust2Label: 'pool projects', trust3Label: 'residential homes',
    philosophyEyebrow: 'GARON / PHILOSOPHY',
    philosophyTitle1: 'Construction is', philosophyTitle2: 'more than just walls.',
    philosophyText: 'We build results that need to look good today and serve their purpose correctly for years to come. That is why we treat every project as a complete system — from materials and structure to the smallest details and the final environment.',
    philosophyLink: 'Discover GARON →',
    capabilitiesEyebrow: 'CAPABILITIES',
    capabilitiesTitle1: 'One Team.', capabilitiesTitle2: 'Four Directions.',
    capabilitiesLead: 'Pools, residential construction, renovation and public buildings — all under one accountable team.',
    services: [
      { t: 'Swimming Pool Construction', d: 'Structure, engineering works, finishing and the final result.' },
      { t: 'Residential Construction', d: 'A custom home — from concept and foundation to full handover.' },
      { t: 'Renovation & Reconstruction', d: 'A complete transformation of the space, without compromising quality.' },
      { t: 'Public Buildings', d: 'Organized construction with strict control of deadlines and technical requirements.' }
    ],
    selectedWorkEyebrow: 'SELECTED WORK',
    selectedWorkTitle1: 'The Work', selectedWorkTitle2: 'speaks for itself.',
    openArchive: 'View Full Archive →',
    card1Title: 'Swimming Pool', card2Title: 'Swimming Pool', card3Title: 'House',
    card1Meta: 'Swimming Pool · Completed', card2Meta: 'Swimming Pool · Under Construction', card3Meta: 'Residential Home · Completed',
    statementEyebrow: 'PEOPLE · PROJECTS · PROGRESS',
    statementTitle1: 'Good construction', statementTitle2: 'can be felt in the result.',
    statementCta: "Let's Talk About Your Project ↗",
    calcTeaserEyebrow: 'GARON / CALCULATOR',
    calcTeaserTitle1: 'Want to know the', calcTeaserTitle2: 'approximate price?',
    calcTeaserLead: 'Choose the project type, enter the area, and see the approximate cost in minutes.',
    calcTeaserCta: 'Open the Calculator ↗'
  },
  ru: {
    heroEyebrow: 'GARON CONSTRUCTION · 25+ ЛЕТ',
    heroTitle1: 'Мы строим', heroTitle2: 'прочный фундамент, долгую жизнь.',
    heroLead: 'Современные, надёжные и долговечные строительные решения — от проектирования до полной сдачи объекта.',
    viewWork: 'Смотреть работы ↗', startProject: 'Начать проект →',
    heroSig1: 'ИДЕИ / КОНСТРУКЦИИ / РЕАЛЬНЫЙ РЕЗУЛЬТАТ', heroSig2: 'ЕРЕВАН · АРМЕНИЯ',
    trust1Label: 'лет опыта', trust2Label: 'проектов бассейнов', trust3Label: 'жилых домов',
    philosophyEyebrow: 'GARON / ФИЛОСОФИЯ',
    philosophyTitle1: 'Строительство —', philosophyTitle2: 'это не только стены.',
    philosophyText: 'Мы создаём результат, который должен хорошо выглядеть сегодня и правильно служить долгие годы. Поэтому каждый проект мы рассматриваем как единую систему — от материалов и конструкции до мелких деталей и итоговой среды.',
    philosophyLink: 'Узнать больше о GARON →',
    capabilitiesEyebrow: 'ВОЗМОЖНОСТИ',
    capabilitiesTitle1: 'Одна команда.', capabilitiesTitle2: 'Четыре направления.',
    capabilitiesLead: 'Бассейны, жилищное строительство, ремонт и общественные здания — под руководством одной ответственной команды.',
    services: [
      { t: 'Строительство бассейнов', d: 'Конструкция, инженерные работы, отделка и готовый результат.' },
      { t: 'Строительство жилых домов', d: 'Индивидуальный дом — от идеи и фундамента до полной сдачи.' },
      { t: 'Ремонт и реконструкция', d: 'Полная трансформация пространства без компромиссов в качестве.' },
      { t: 'Общественные здания', d: 'Организованное строительство с контролем сроков и технических требований.' }
    ],
    selectedWorkEyebrow: 'ИЗБРАННЫЕ РАБОТЫ',
    selectedWorkTitle1: 'Работа', selectedWorkTitle2: 'говорит сама за себя.',
    openArchive: 'Открыть весь архив →',
    card1Title: 'Бассейн', card2Title: 'Бассейн', card3Title: 'Дом',
    card1Meta: 'Бассейн · завершён', card2Meta: 'Бассейн · в процессе строительства', card3Meta: 'Жилой дом · завершён',
    statementEyebrow: 'ЛЮДИ · ПРОЕКТЫ · ПРОГРЕСС',
    statementTitle1: 'Хорошо построенный', statementTitle2: 'результат — это то, что чувствуется.',
    statementCta: 'Обсудим ваш проект ↗',
    calcTeaserEyebrow: 'GARON / КАЛЬКУЛЯТОР',
    calcTeaserTitle1: 'Хотите узнать', calcTeaserTitle2: 'примерную цену?',
    calcTeaserLead: 'Выберите тип проекта, укажите площадь и за пару минут узнайте примерную стоимость.',
    calcTeaserCta: 'Открыть калькулятор ↗'
  }
};

export const about = {
  hy: {
    eyebrow: 'GARON-Ի ՄԱՍԻՆ',
    title1: '25+ տարի', title2: 'կառուցում ենք վստահություն։',
    lead: 'GARON Construction-ի ճանապարհը սկսվել է լողավազանների կառուցումից և տարիների ընթացքում վերածվել է բազմաոլորտ շինարարական փորձի։',
    pathEyebrow: 'ՄԵՐ ՃԱՆԱՊԱՐՀԸ',
    pathTitle1: 'Փորձը մեզ համար', pathTitle2: 'գործիք է, ոչ թե թիվ։',
    pathText1: 'Մենք հավատում ենք, որ լավ շինարարությունը միայն նյութերի և տեխնոլոգիաների մասին չէ։ Այն սկսվում է պատասխանատվությունից, շարունակվում է ճիշտ կազմակերպմամբ և ավարտվում է մանրուքների նկատմամբ ուշադրությամբ։',
    pathText2: 'Լողավազանների ոլորտում կուտակած խոր փորձը մեզ տվել է այն գործնական մտածողությունը, որը այսօր կիրառում ենք նաև բնակելի, վերանորոգման, վերակառուցման և հասարակական նախագծերում։',
    valuesEyebrow: 'ՄԵՐ ԱՐԺԵՔՆԵՐԸ',
    values: [
      { t: 'ՃՇԳՐՏՈՒԹՅՈՒՆ', d: 'Պլանավորումից մինչև վերջնական հանձնում՝ յուրաքանչյուր փուլ վերահսկելի է։' },
      { t: 'ՈՐԱԿ', d: 'Նյութերը, աշխատանքը և վերջնական արդյունքը գնահատում ենք երկարաժամկետ տեսանկյունից։' },
      { t: 'ՎՍՏԱՀՈՒԹՅՈՒՆ', d: 'Պատվիրատուի հետ բաց և պատասխանատու հաղորդակցությունը գործընթացի հիմքում է։' },
      { t: 'ԱՐԴՅՈՒՆՔ', d: 'Մեր լավագույն ներկայացումը ավարտված աշխատանքն է։' }
    ],
    nextEyebrow: 'ՀԱՋՈՐԴԸ',
    nextTitle1: 'Տեսեք մեր', nextTitle2: 'նախագծերը։',
    nextCta: 'Դիտել աշխատանքները ↗'
  },
  en: {
    eyebrow: 'ABOUT GARON',
    title1: '25+ Years', title2: 'building trust.',
    lead: "GARON Construction's journey began with swimming pool construction and has grown over the years into multi-sector construction expertise.",
    pathEyebrow: 'OUR PATH',
    pathTitle1: 'For us, experience', pathTitle2: 'is a tool, not a number.',
    pathText1: 'We believe good construction is not only about materials and technology. It begins with responsibility, continues with proper organization, and ends with attention to detail.',
    pathText2: 'The deep experience we gained in swimming pool construction gave us the practical mindset we now apply to residential, renovation, reconstruction and public projects as well.',
    valuesEyebrow: 'OUR VALUES',
    values: [
      { t: 'PRECISION', d: 'From planning to final handover, every stage is under control.' },
      { t: 'QUALITY', d: 'We evaluate materials, workmanship and the final result from a long-term perspective.' },
      { t: 'TRUST', d: 'Open and responsible communication with the client is at the foundation of the process.' },
      { t: 'RESULT', d: 'Our best presentation is the finished work itself.' }
    ],
    nextEyebrow: 'NEXT',
    nextTitle1: 'See Our', nextTitle2: 'Projects.',
    nextCta: 'View Our Work ↗'
  },
  ru: {
    eyebrow: 'О GARON',
    title1: '25+ лет', title2: 'мы строим доверие.',
    lead: 'Путь GARON Construction начался со строительства бассейнов и за годы работы превратился в многопрофильный строительный опыт.',
    pathEyebrow: 'НАШ ПУТЬ',
    pathTitle1: 'Опыт для нас', pathTitle2: 'это инструмент, а не цифра.',
    pathText1: 'Мы верим, что хорошее строительство — это не только материалы и технологии. Оно начинается с ответственности, продолжается правильной организацией и завершается вниманием к деталям.',
    pathText2: 'Глубокий опыт, накопленный в сфере строительства бассейнов, дал нам практическое мышление, которое мы сегодня применяем также в жилых, ремонтных, реконструкционных и общественных проектах.',
    valuesEyebrow: 'НАШИ ЦЕННОСТИ',
    values: [
      { t: 'ТОЧНОСТЬ', d: 'От планирования до финальной сдачи — каждый этап под контролем.' },
      { t: 'КАЧЕСТВО', d: 'Материалы, работу и итоговый результат мы оцениваем с точки зрения долгосрочной перспективы.' },
      { t: 'ДОВЕРИЕ', d: 'Открытое и ответственное общение с заказчиком лежит в основе процесса.' },
      { t: 'РЕЗУЛЬТАТ', d: 'Наша лучшая презентация — это завершённая работа.' }
    ],
    nextEyebrow: 'ДАЛЕЕ',
    nextTitle1: 'Смотрите наши', nextTitle2: 'проекты.',
    nextCta: 'Смотреть работы ↗'
  }
};

export const servicesIndex = {
  hy: { eyebrow: 'ԾԱՌԱՅՈՒԹՅՈՒՆՆԵՐ', title1: 'Կառուցման', title2: 'մասնագիտություն։', lead: 'Ընտրեք ուղղությունը և տեսեք՝ ինչ ենք առաջարկում տվյալ ոլորտում։', whatWeDo: 'ԻՆՉ ԵՆՔ ԱՆՈՒՄ', open: 'Բացել ↗' },
  en: { eyebrow: 'SERVICES', title1: 'Construction', title2: 'expertise.', lead: 'Choose a direction and see what we offer in that field.', whatWeDo: 'WHAT WE DO', open: 'Open ↗' },
  ru: { eyebrow: 'УСЛУГИ', title1: 'Строительная', title2: 'экспертиза.', lead: 'Выберите направление и узнайте, что мы предлагаем в этой сфере.', whatWeDo: 'ЧЕМ МЫ ЗАНИМАЕМСЯ', open: 'Открыть ↗' }
};

export const serviceDetailShared = {
  hy: {
    eyebrow: 'GARON / ԾԱՌԱՅՈՒԹՅՈՒՆՆԵՐ',
    approachEyebrow: 'ՄԵՐ ՄՈՏԵՑՈՒՄԸ',
    approachTitle1: 'Մեկ գործընկեր՝', approachTitle2: 'ամբողջ գործընթացի համար։',
    approachText1: 'Մենք աշխատում ենք փուլային և հասկանալի գործընթացով՝ նախապատրաստում, կազմակերպում, իրականացում և վերջնական արդյունք։ Նախագծի բնույթից կախված՝ յուրաքանչյուր փուլը հարմարեցվում է պատվիրատուի պահանջներին։',
    approachText2: 'Մեր նպատակը ոչ միայն կառուցելն է, այլ կառուցել այնպես, որ արդյունքը լինի ամուր, գործնական և տեսքով ամբողջական։',
    processEyebrow: 'ԳՈՐԾԸՆԹԱՑ',
    steps: [
      { t: 'ՊԼԱՆԱՎՈՐՈՒՄ', d: 'Խնդիրների և պահանջների հստակեցում։' },
      { t: 'ՆԱԽԱՊԱՏՐԱՍՏՈՒՄ', d: 'Կազմակերպում և աշխատանքի փուլավորում։' },
      { t: 'ԻՐԱԿԱՆԱՑՈՒՄ', d: 'Շինարարական աշխատանքների կատարում և վերահսկում։' },
      { t: 'ԱՐԴՅՈՒՆՔ', d: 'Վերջնական հանձնում և մանրուքների ավարտում։' }
    ],
    ctaEyebrow: 'ՏԵՍԵՔ ԱՇԽԱՏԱՆՔԸ',
    ctaTitle1: 'Իրական նախագծերը', ctaTitle2: 'ավելի լավ են պատմում։',
    ctaButton: 'Դիտել նախագծերը ↗'
  },
  en: {
    eyebrow: 'GARON / SERVICES',
    approachEyebrow: 'OUR APPROACH',
    approachTitle1: 'One partner', approachTitle2: 'for the entire process.',
    approachText1: "We work through a staged, transparent process — preparation, organization, execution and final result. Depending on the nature of the project, every stage is adapted to the client's requirements.",
    approachText2: 'Our goal is not just to build, but to build so the result is solid, practical and visually complete.',
    processEyebrow: 'PROCESS',
    steps: [
      { t: 'PLANNING', d: 'Clarifying tasks and requirements.' },
      { t: 'PREPARATION', d: 'Organization and staging of the work.' },
      { t: 'EXECUTION', d: 'Carrying out and supervising construction works.' },
      { t: 'RESULT', d: 'Final handover and completion of details.' }
    ],
    ctaEyebrow: 'SEE THE WORK',
    ctaTitle1: 'Real projects', ctaTitle2: 'tell a better story.',
    ctaButton: 'View Projects ↗'
  },
  ru: {
    eyebrow: 'GARON / УСЛУГИ',
    approachEyebrow: 'НАШ ПОДХОД',
    approachTitle1: 'Один партнёр', approachTitle2: 'для всего процесса.',
    approachText1: 'Мы работаем по поэтапному и понятному процессу — подготовка, организация, реализация и итоговый результат. В зависимости от характера проекта каждый этап адаптируется под требования заказчика.',
    approachText2: 'Наша цель — не просто строить, а строить так, чтобы результат был прочным, практичным и завершённым внешне.',
    processEyebrow: 'ПРОЦЕСС',
    steps: [
      { t: 'ПЛАНИРОВАНИЕ', d: 'Уточнение задач и требований.' },
      { t: 'ПОДГОТОВКА', d: 'Организация и разбивка работ на этапы.' },
      { t: 'РЕАЛИЗАЦИЯ', d: 'Выполнение и контроль строительных работ.' },
      { t: 'РЕЗУЛЬТАТ', d: 'Финальная сдача и завершение деталей.' }
    ],
    ctaEyebrow: 'СМОТРЕТЬ РАБОТЫ',
    ctaTitle1: 'Реальные проекты', ctaTitle2: 'рассказывают лучше.',
    ctaButton: 'Смотреть проекты ↗'
  }
};

export const serviceDetailPages = {
  pools: {
    hy: { title: 'Լողավազանների կառուցում', lead: 'Լողավազաններ՝ գաղափարից մինչև պատրաստ արդյունք։' },
    en: { title: 'Swimming Pool Construction', lead: 'Pools — from concept to finished result.' },
    ru: { title: 'Строительство бассейнов', lead: 'Бассейны — от идеи до готового результата.' }
  },
  residential: {
    hy: { title: 'Բնակելի տների կառուցում', lead: 'Անհատական բնակելի տներ՝ կառուցված հստակ պլանավորմամբ և վերահսկմամբ։' },
    en: { title: 'Residential Construction', lead: 'Custom homes built with precise planning and supervision.' },
    ru: { title: 'Строительство жилых домов', lead: 'Индивидуальные жилые дома, построенные с чётким планированием и контролем.' }
  },
  renovation: {
    hy: { title: 'Վերանորոգում և վերակառուցում', lead: 'Գոյություն ունեցող տարածքների վերափոխում, ամրացում և արդիականացում։' },
    en: { title: 'Renovation & Reconstruction', lead: 'Transformation, reinforcement and modernization of existing spaces.' },
    ru: { title: 'Ремонт и реконструкция', lead: 'Преобразование, укрепление и модернизация существующих пространств.' }
  },
  'public-works': {
    hy: { title: 'Հասարակական կառույցներ', lead: 'Կազմակերպված շինարարական գործընթացներ՝ տարբեր նշանակության օբյեկտների համար։' },
    en: { title: 'Public Buildings', lead: 'Organized construction processes for facilities of various purposes.' },
    ru: { title: 'Общественные здания', lead: 'Организованные строительные процессы для объектов различного назначения.' }
  }
};

export const contact = {
  hy: {
    eyebrow: 'ԿԱՊ GARON-Ի ՀԵՏ',
    title1: 'Եկեք կառուցենք', title2: 'ձեր գաղափարը։',
    lead: 'Ուղարկեք ձեր հարցը կամ զանգահարեք մեզ՝ հաջորդ քայլը քննարկելու համար։',
    getInTouch: 'ԿԱՊՎԵՔ ՄԵԶ ՀԵՏ',
    title3: 'Սկսենք', title4: 'զրույցից։',
    phoneLabel: 'ՀԵՌԱԽՈՍ', emailLabel: 'EMAIL', socialLabel: 'ՍՈՑՑԱՆՑԵՐ',
    cardText: 'Պատմեք՝ ինչ եք ուզում կառուցել, ինչ փուլում է նախագիծը և ինչ ժամկետ եք պատկերացնում։',
    send: 'Ուղարկել հարցում ↗',
    note: 'Կայքում կապի տվյալները հիմա placeholder են և հեշտ կփոխարինենք ձեր իրական համարով, email-ով և սոցցանցերի հղումներով։'
  },
  en: {
    eyebrow: 'CONTACT GARON',
    title1: "Let's Build", title2: 'your idea.',
    lead: 'Send us your inquiry or call us to discuss the next step.',
    getInTouch: 'GET IN TOUCH',
    title3: "Let's Start", title4: 'the Conversation.',
    phoneLabel: 'PHONE', emailLabel: 'EMAIL', socialLabel: 'SOCIAL',
    cardText: 'Tell us what you want to build, what stage the project is at, and what timeline you have in mind.',
    send: 'Send Inquiry ↗',
    note: "The contact details on the site are currently placeholders and will be easily replaced with your real phone number, email and social links."
  },
  ru: {
    eyebrow: 'СВЯЗАТЬСЯ С GARON',
    title1: 'Давайте построим', title2: 'вашу идею.',
    lead: 'Отправьте нам запрос или позвоните нам, чтобы обсудить следующий шаг.',
    getInTouch: 'СВЯЖИТЕСЬ С НАМИ',
    title3: 'Начнём', title4: 'разговор.',
    phoneLabel: 'ТЕЛЕФОН', emailLabel: 'EMAIL', socialLabel: 'СОЦСЕТИ',
    cardText: 'Расскажите, что вы хотите построить, на каком этапе находится проект и какие сроки вы предполагаете.',
    send: 'Отправить запрос ↗',
    note: 'Контактные данные на сайте сейчас являются заглушкой и будут легко заменены вашим реальным номером, email и ссылками на соцсети.'
  }
};

export const calculator = {
  hy: {
    eyebrow: 'GARON / ՀԱՇՎԻՉ',
    title1: 'Հաշվեք ձեր', title2: 'նախագծի մոտավոր արժեքը։',
    lead: 'Ընտրեք նախագծի տեսակը, նշեք մակերեսը և տեսեք մոտավոր արժեքը։',
    modeLabel: 'Նախագծի տեսակը',
    modes: { full: 'Ամբողջական կառուցում', monolith: 'Միայն մոնոլիտ', renovation: 'Վերանորոգում' },
    areaLabel: 'Մակերեսը', areaUnit: 'մ²', areaPlaceholder: 'օր.՝ 150',
    tierLabel: 'Հարդարման մակարդակ',
    tiers: [
      { name: 'ՍՏԱՆԴԱՐՏ', desc: 'Հիմնական շինարարություն, կոպիտ հարդարում' },
      { name: 'ԿՈՄՖՈՐՏ', desc: 'Միջին կարգի նյութեր և հարդարում' },
      { name: 'ՊՐԵՄԻՈՒՄ', desc: 'Բարձրորակ նյութեր և ամբողջական հարդարում' }
    ],
    renovationTiers: [
      { name: 'ՍՏԱՆԴԱՐՏ', desc: 'Կոսմետիկ վերանորոգում' },
      { name: 'ԿՈՄՖՈՐՏ', desc: 'Միջին կարգի վերանորոգում' },
      { name: 'ՊՐԵՄԻՈՒՄ', desc: 'Կապիտալ վերանորոգում' }
    ],
    optionsLabel: 'Հավելյալ առանձնահատկություններ',
    basement: 'Նկուղային հարկ', mansard: 'Մանսարդ հարկ', flatRoof: 'Հարթ տանիք',
    floorsLabel: 'Հարկերի քանակը',
    basementAreaLabel: 'Նկուղի մակերեսը (եթե կա)',
    floorUnit: 'ՀԱՐԿ', floorAdds: 'Այս հարկի արժեքը', floorTotal: 'Ընդամենը',
    renovationPremiumNote: 'Ընտրելով Պրեմիում փաթեթը՝ տան դիզայնը անվճար է։',
    resultLabel: 'Մոտավոր արժեքը',
    perSqm: '/ մ²',
    startingFrom: 'սկսած',
    disclaimer: 'Սա միայն կողմնորոշիչ հաշվարկ է։ Վերջնական գինը կախված է հողատարածքից, նախագծից, նյութերից և այլ գործոններից։ Ճշգրիտ նախահաշվի համար կապվեք մեզ հետ։',
    cta: 'Ստանալ ճշգրիտ նախահաշիվ ↗',
    enterArea: 'Մուտքագրեք մակերեսը՝ հաշվարկը տեսնելու համար'
  },
  en: {
    eyebrow: 'GARON / CALCULATOR',
    title1: 'Estimate Your', title2: "Project's Approximate Cost.",
    lead: 'Choose the project type, enter the area, and see the approximate cost.',
    modeLabel: 'Project Type',
    modes: { full: 'Full Construction', monolith: 'Monolith Only', renovation: 'Renovation' },
    areaLabel: 'Area', areaUnit: 'm²', areaPlaceholder: 'e.g. 150',
    tierLabel: 'Finish Level',
    tiers: [
      { name: 'STANDARD', desc: 'Basic construction, rough finishing' },
      { name: 'COMFORT', desc: 'Mid-range materials and finishing' },
      { name: 'PREMIUM', desc: 'High-end materials and full finishing' }
    ],
    renovationTiers: [
      { name: 'STANDARD', desc: 'Cosmetic renovation' },
      { name: 'COMFORT', desc: 'Mid-range renovation' },
      { name: 'PREMIUM', desc: 'Capital renovation' }
    ],
    optionsLabel: 'Additional Features',
    basement: 'Basement Floor', mansard: 'Mansard Floor', flatRoof: 'Flat Roof',
    floorsLabel: 'Number of Floors',
    basementAreaLabel: 'Basement Area (if any)',
    floorUnit: 'FLOOR', floorAdds: 'This floor adds', floorTotal: 'Total',
    renovationPremiumNote: 'Choosing the Premium package includes free house design.',
    resultLabel: 'Approximate Cost',
    perSqm: '/ m²',
    startingFrom: 'starting from',
    disclaimer: 'This is only an indicative estimate. The final price depends on the site, design, materials and other factors. Contact us for an accurate quote.',
    cta: 'Get an Accurate Quote ↗',
    enterArea: 'Enter the area to see the calculation'
  },
  ru: {
    eyebrow: 'GARON / КАЛЬКУЛЯТОР',
    title1: 'Рассчитайте примерную', title2: 'стоимость вашего проекта.',
    lead: 'Выберите тип проекта, укажите площадь и узнайте примерную стоимость.',
    modeLabel: 'Тип проекта',
    modes: { full: 'Полное строительство', monolith: 'Только монолит', renovation: 'Ремонт' },
    areaLabel: 'Площадь', areaUnit: 'м²', areaPlaceholder: 'напр. 150',
    tierLabel: 'Уровень отделки',
    tiers: [
      { name: 'СТАНДАРТ', desc: 'Базовое строительство, черновая отделка' },
      { name: 'КОМФОРТ', desc: 'Материалы и отделка среднего класса' },
      { name: 'ПРЕМИУМ', desc: 'Материалы высокого класса и полная отделка' }
    ],
    renovationTiers: [
      { name: 'СТАНДАРТ', desc: 'Косметический ремонт' },
      { name: 'КОМФОРТ', desc: 'Ремонт среднего уровня' },
      { name: 'ПРЕМИУМ', desc: 'Капитальный ремонт' }
    ],
    optionsLabel: 'Дополнительные особенности',
    basement: 'Цокольный этаж', mansard: 'Мансардный этаж', flatRoof: 'Плоская крыша',
    floorsLabel: 'Количество этажей',
    basementAreaLabel: 'Площадь цоколя (если есть)',
    floorUnit: 'ЭТАЖ', floorAdds: 'Этот этаж добавляет', floorTotal: 'Итого',
    renovationPremiumNote: 'При выборе пакета Премиум дизайн дома — бесплатно.',
    resultLabel: 'Примерная стоимость',
    perSqm: '/ м²',
    startingFrom: 'от',
    disclaimer: 'Это только ориентировочный расчёт. Итоговая цена зависит от участка, проекта, материалов и других факторов. Свяжитесь с нами для точной сметы.',
    cta: 'Получить точную смету ↗',
    enterArea: 'Введите площадь, чтобы увидеть расчёт'
  }
};

export const projectsArchive = {
  hy: {
    eyebrow: 'GARON / ԱՐԽԻՎ', title1: 'Իրական աշխատանքներ։', title2: 'Իրական արդյունքներ։',
    lead: 'Մեր նախագծերը ներկայացված են ոչ միայն վերջնական լուսանկարով, այլ այնտեղ, որտեղ հնարավոր է՝ ամբողջ շինարարական պատմությամբ։',
    poolsEyebrow: '01 / ԼՈՂԱՎԱԶԱՆՆԵՐ', poolsTitle1: 'Լողավազաններ', poolsTitle2: 'Իրական օրինակներ',
    poolsText: 'Յուրաքանչյուր լողավազան առանձին նախագիծ է։ Բացիր այն և տես իրական փուլերը՝ կառուցվածքից մինչև վերջնական տեսքը։',
    residentialEyebrow: '02 / ԲՆԱԿԵԼԻ', residentialTitle1: 'Բնակելի', residentialTitle2: 'առանձնատներ',
    residentialText: 'Տունը ներկայացնում է զրոյական վիճակից մինչև պատրաստ տուն ամբողջ ճանապարհը՝ մեկ նախագծի էջում։',
    openHouse: 'Բացել Տունը →', houseCardTitle: 'Տուն', houseCardMeta: 'Բնակելի առանձնատուն · ավարտված',
    nextEyebrow: 'ՀԱՋՈՐԴԸ', nextTitle1: 'Ձեր նախագիծը', nextTitle2: 'կարող է լինել այստեղ։', nextCta: 'Սկսել նախագիծը ↗'
  },
  en: {
    eyebrow: 'GARON / PROJECT ARCHIVE', title1: 'Real Work.', title2: 'Real Results.',
    lead: 'Our projects are presented not only with a final photo, but — wherever possible — with the full construction story.',
    poolsEyebrow: '01 / SWIMMING POOLS', poolsTitle1: 'Swimming Pools', poolsTitle2: 'Real Examples',
    poolsText: 'Each pool is a separate project. Open it and see the real stages — from structure to final look.',
    residentialEyebrow: '02 / RESIDENTIAL', residentialTitle1: 'Residential', residentialTitle2: 'Homes',
    residentialText: 'The house shows the entire journey from ground zero to a finished home, on a single project page.',
    openHouse: 'Open the House →', houseCardTitle: 'House', houseCardMeta: 'Residential Home · Completed',
    nextEyebrow: 'NEXT', nextTitle1: 'Your project', nextTitle2: 'could be here.', nextCta: 'Start a Project ↗'
  },
  ru: {
    eyebrow: 'GARON / АРХИВ ПРОЕКТОВ', title1: 'Реальная работа.', title2: 'Реальные результаты.',
    lead: 'Наши проекты представлены не только итоговым фото, но, где это возможно, — всей историей строительства.',
    poolsEyebrow: '01 / БАССЕЙНЫ', poolsTitle1: 'Бассейны', poolsTitle2: 'Реальные примеры',
    poolsText: 'Каждый бассейн — отдельный проект. Откройте его и посмотрите реальные этапы — от конструкции до финального вида.',
    residentialEyebrow: '02 / ЖИЛЫЕ ДОМА', residentialTitle1: 'Жилые', residentialTitle2: 'дома',
    residentialText: 'Дом показывает весь путь от нуля до готового дома на одной странице проекта.',
    openHouse: 'Открыть дом →', houseCardTitle: 'Дом', houseCardMeta: 'Жилой дом · завершён',
    nextEyebrow: 'ДАЛЕЕ', nextTitle1: 'Ваш проект', nextTitle2: 'может быть здесь.', nextCta: 'Начать проект ↗'
  }
};
