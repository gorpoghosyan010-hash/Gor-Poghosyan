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
    processEyebrow: 'ԳՈՐԾԸՆԹԱՑ',
    ctaEyebrow: 'ՏԵՍԵՔ ԱՇԽԱՏԱՆՔԸ',
    ctaTitle1: 'Իրական նախագծերը', ctaTitle2: 'ավելի լավ են պատմում։',
    ctaButton: 'Դիտել նախագծերը ↗'
  },
  en: {
    eyebrow: 'GARON / SERVICES',
    approachEyebrow: 'OUR APPROACH',
    processEyebrow: 'PROCESS',
    ctaEyebrow: 'SEE THE WORK',
    ctaTitle1: 'Real projects', ctaTitle2: 'tell a better story.',
    ctaButton: 'View Projects ↗'
  },
  ru: {
    eyebrow: 'GARON / УСЛУГИ',
    approachEyebrow: 'НАШ ПОДХОД',
    processEyebrow: 'ПРОЦЕСС',
    ctaEyebrow: 'СМОТРЕТЬ РАБОТЫ',
    ctaTitle1: 'Реальные проекты', ctaTitle2: 'рассказывают лучше.',
    ctaButton: 'Смотреть проекты ↗'
  }
};

export const serviceDetailPages = {
  pools: {
    hy: {
      title: 'Լողավազանների կառուցում', lead: 'Լողավազաններ՝ գաղափարից մինչև պատրաստ արդյունք։',
      approachTitle1: 'Ջուրը փոխում է', approachTitle2: 'տարածքի բնավորությունը։',
      approachText1: 'Մենք ստեղծում ենք լողավազաններ, որոնք դառնում են տան և ամբողջ բակի գլխավոր շեշտադրումը՝ համադրելով ճարտարապետությունը, ժամանակակից դիզայնը և շինարարական բարձր որակը։',
      approachText2: 'Յուրաքանչյուր նախագիծ անհատական է․ մենք հաշվի ենք առնում տարածքի առանձնահատկությունները, տան ոճը և պատվիրատուի նախասիրությունները՝ ստեղծելով լուծում, որը գեղեցիկ է այսօր և արդիական է տարիներ անց։',
      approachText3: 'Մտածված դիզայն։ Ճշգրիտ իրականացում։ Լողավազան, որը դառնում է ձեր տան մի մասը։',
      steps: [
        { t: 'ԳԱՂԱՓԱՐ ԵՎ ԴԻԶԱՅՆ', d: 'Հասկանում ենք ձեր նախասիրությունները և տարածքի առանձնահատկությունները՝ ձևավորելով լողավազանի անհատական լուծումը։' },
        { t: 'ՆԱԽԱՊԱՏՐԱՍՏՈՒՄ', d: 'Հստակեցնում ենք չափերը, կառուցվածքը, նյութերը, ինժեներական և ջրի մաքրման համակարգերը։' },
        { t: 'ԿԱՌՈՒՑՈՒՄ', d: 'Իրականացնում ենք կառուցվածքային աշխատանքները, ջրամեկուսացումը, ինժեներական համակարգերի տեղադրումն ու հարդարումը։' },
        { t: 'ՎԵՐՋՆԱԿԱՆ ԱՐԴՅՈՒՆՔ', d: 'Ստուգում ենք բոլոր համակարգերն ու մանրուքները և հանձնում պատրաստ լողավազան՝ լիարժեք օգտագործման համար։' }
      ]
    },
    en: {
      title: 'Swimming Pool Construction', lead: 'Pools — from concept to finished result.',
      approachTitle1: 'Water changes', approachTitle2: 'the character of a space.',
      approachText1: 'We create pools that become the main accent of the house and the entire yard — combining architecture, modern design and high construction quality.',
      approachText2: "Every project is individual; we take into account the features of the site, the style of the house and the client's preferences, creating a solution that is beautiful today and still relevant years from now.",
      approachText3: 'Thoughtful design. Precise execution. A pool that becomes part of your home.',
      steps: [
        { t: 'IDEA & DESIGN', d: 'We understand your preferences and the features of the site, shaping an individual pool solution.' },
        { t: 'PREPARATION', d: 'We define the dimensions, the structure, the materials, and the engineering and water purification systems.' },
        { t: 'CONSTRUCTION', d: 'We carry out the structural works, waterproofing, installation of the engineering systems and finishing.' },
        { t: 'FINAL RESULT', d: 'We check all systems and details and hand over a ready pool for full use.' }
      ]
    },
    ru: {
      title: 'Строительство бассейнов', lead: 'Бассейны — от идеи до готового результата.',
      approachTitle1: 'Вода меняет', approachTitle2: 'характер пространства.',
      approachText1: 'Мы создаём бассейны, которые становятся главным акцентом дома и всего двора, сочетая архитектуру, современный дизайн и высокое качество строительства.',
      approachText2: 'Каждый проект индивидуален: мы учитываем особенности участка, стиль дома и предпочтения заказчика, создавая решение, которое красиво сегодня и остаётся актуальным спустя годы.',
      approachText3: 'Продуманный дизайн. Точное исполнение. Бассейн, который становится частью вашего дома.',
      steps: [
        { t: 'ИДЕЯ И ДИЗАЙН', d: 'Понимаем ваши предпочтения и особенности участка, формируя индивидуальное решение для бассейна.' },
        { t: 'ПОДГОТОВКА', d: 'Определяем размеры, конструкцию, материалы, инженерные системы и системы очистки воды.' },
        { t: 'СТРОИТЕЛЬСТВО', d: 'Выполняем конструкционные работы, гидроизоляцию, монтаж инженерных систем и отделку.' },
        { t: 'ИТОГОВЫЙ РЕЗУЛЬТАТ', d: 'Проверяем все системы и детали и сдаём готовый бассейн для полноценного использования.' }
      ]
    }
  },
  residential: {
    hy: {
      title: 'Բնակելի տների կառուցում', lead: 'Անհատական բնակելի տներ՝ կառուցված հստակ պլանավորմամբ և վերահսկմամբ։',
      approachTitle1: 'Լավ տունը սկսվում է', approachTitle2: 'ճիշտ մտածված գաղափարից։',
      approachText1: 'Մենք յուրաքանչյուր բնակելի տուն դիտարկում ենք որպես ամբողջական նախագիծ՝ որտեղ ճարտարապետությունը, կառուցվածքը, ինժեներական լուծումները և հարդարումը պետք է աշխատեն մեկ ամբողջության մեջ։',
      approachText2: 'Մեր թիմը կառավարում է շինարարության ամբողջ ընթացքը՝ առաջին գծագրից մինչև պատրաստի տան հանձնում։ Մենք ուշադրություն ենք դարձնում ոչ միայն արտաքին տեսքին, այլև այն ամենին, ինչը ձևավորում է տան իրական որակը՝ ամրություն, հարմարավետություն, ֆունկցիոնալություն և մանրուքների նկատմամբ ճշգրտություն։',
      approachText3: 'Ձեր գաղափարը՝ մեր փորձը, մեկ ամբողջական արդյունք։',
      steps: [
        { t: 'ԳԱՂԱՓԱՐ ԵՎ ՆԱԽԱԳԻԾ', d: 'Ուսումնասիրում ենք տարածքը, հասկանում ձեր պատկերացումները և ձևավորում տան ճարտարապետական ու ֆունկցիոնալ լուծումը։' },
        { t: 'ՊԼԱՆԱՎՈՐՈՒՄ', d: 'Հստակեցնում ենք աշխատանքների փուլերը, նյութերը, տեխնիկական լուծումները և շինարարության ամբողջ ընթացքը։' },
        { t: 'ԿԱՌՈՒՑՈՒՄ', d: 'Իրականացնում ենք շինարարական աշխատանքները՝ հիմքից մինչև հարդարում՝ վերահսկելով յուրաքանչյուր փուլի որակն ու ճշգրտությունը։' },
        { t: 'ՁԵՐ ՏՈՒՆԸ ՊԱՏՐԱՍՏ Է', d: 'Վերջնական ստուգումներից հետո հանձնում ենք ամբողջական և պատրաստ տուն՝ նախատեսված է ձեր հարմարավետ կյանքի համար։' }
      ]
    },
    en: {
      title: 'Residential Construction', lead: 'Custom homes built with precise planning and supervision.',
      approachTitle1: 'A good home starts', approachTitle2: 'with a well-thought-out idea.',
      approachText1: 'We see every residential house as one complete project — where architecture, structure, engineering solutions and finishing must work together as a whole.',
      approachText2: 'Our team manages the entire construction process — from the first drawing to the handover of the finished home. We pay attention not only to the exterior, but to everything that shapes the true quality of a home: durability, comfort, functionality and precision in the details.',
      approachText3: 'Your idea, our experience, one complete result.',
      steps: [
        { t: 'IDEA & DESIGN', d: 'We study the site, understand your vision and shape the architectural and functional solution of the house.' },
        { t: 'PLANNING', d: 'We define the stages of work, the materials, the technical solutions and the entire course of construction.' },
        { t: 'CONSTRUCTION', d: 'We carry out the construction works — from the foundation to finishing — controlling the quality and precision of every stage.' },
        { t: 'YOUR HOME IS READY', d: 'After the final inspections, we hand over a complete, ready home designed for your comfortable life.' }
      ]
    },
    ru: {
      title: 'Строительство жилых домов', lead: 'Индивидуальные жилые дома, построенные с чётким планированием и контролем.',
      approachTitle1: 'Хороший дом начинается', approachTitle2: 'с продуманной идеи.',
      approachText1: 'Мы рассматриваем каждый жилой дом как целостный проект, где архитектура, конструкция, инженерные решения и отделка должны работать как единое целое.',
      approachText2: 'Наша команда управляет всем ходом строительства — от первого чертежа до сдачи готового дома. Мы уделяем внимание не только внешнему виду, но и всему, что формирует настоящее качество дома: прочности, комфорту, функциональности и точности в деталях.',
      approachText3: 'Ваша идея, наш опыт — один целостный результат.',
      steps: [
        { t: 'ИДЕЯ И ПРОЕКТ', d: 'Изучаем участок, понимаем ваши представления и формируем архитектурное и функциональное решение дома.' },
        { t: 'ПЛАНИРОВАНИЕ', d: 'Определяем этапы работ, материалы, технические решения и весь ход строительства.' },
        { t: 'СТРОИТЕЛЬСТВО', d: 'Выполняем строительные работы — от фундамента до отделки — контролируя качество и точность каждого этапа.' },
        { t: 'ВАШ ДОМ ГОТОВ', d: 'После финальных проверок сдаём цельный, готовый дом, созданный для вашей комфортной жизни.' }
      ]
    }
  },
  renovation: {
    hy: {
      title: 'Վերանորոգում և վերակառուցում', lead: 'Գոյություն ունեցող տարածքների վերափոխում, ամրացում և արդիականացում։',
      approachTitle1: 'Յուրաքանչյուր տարածք', approachTitle2: 'ունի իր ներուժը։',
      approachText1: 'Մենք օգնում ենք այն բացահայտել և վերածել ժամանակակից, հարմարավետ ու ամբողջական միջավայրի։',
      approachText2: 'Վերանորոգման և վերակառուցման ընթացքում համադրում ենք ճարտարապետական, ինժեներական և ինտերիերի լուծումները՝ սկսած տարածքի վերափոխումից մինչև վերջին դետալը։',
      approachText3: 'Փոխում ենք տարածքը՝ պահպանելով դրա լավագույնը և ստեղծելով նորը։',
      steps: [
        { t: 'ԳՆԱՀԱՏՈՒՄ ԵՎ ԳԱՂԱՓԱՐ', d: 'Ուսումնասիրում ենք տարածքը, հասկանում ձեր պահանջներն ու որոշում, թե ինչպես կարելի է առավել արդյունավետ օգտագործել դրա ներուժը։' },
        { t: 'ՆԱԽԱԳԾՈՒՄ', d: 'Ձևավորում ենք նոր հատակագծային, ճարտարապետական և ինտերիերի լուծումները՝ տարածքը համապատասխանեցնելով ձեր ապրելակերպին։' },
        { t: 'ՎԵՐԱՓՈԽՈՒՄ', d: 'Իրականացնում ենք վերակառուցման, ինժեներական, շինարարական և հարդարման աշխատանքները՝ վերահսկելով ամբողջ գործընթացը։' },
        { t: 'ՆՈՐ ՏԱՐԱԾՔ', d: 'Վերջնական ստուգումներից հետո հանձնում ենք ամբողջությամբ վերափոխված տարածք՝ պատրաստ օգտագործման և նոր կյանքին համապատասխան։' }
      ]
    },
    en: {
      title: 'Renovation & Reconstruction', lead: 'Transformation, reinforcement and modernization of existing spaces.',
      approachTitle1: 'Every space', approachTitle2: 'has its potential.',
      approachText1: 'We help reveal it and turn it into a modern, comfortable and complete environment.',
      approachText2: 'During renovation and reconstruction, we combine architectural, engineering and interior solutions — from the transformation of the space to the very last detail.',
      approachText3: 'We change the space — keeping the best of it and creating something new.',
      steps: [
        { t: 'ASSESSMENT & IDEA', d: 'We study the space, understand your requirements and decide how its potential can be used most effectively.' },
        { t: 'DESIGN', d: 'We develop new layout, architectural and interior solutions, adapting the space to your way of life.' },
        { t: 'TRANSFORMATION', d: 'We carry out the reconstruction, engineering, construction and finishing works, supervising the entire process.' },
        { t: 'A NEW SPACE', d: 'After the final inspections, we hand over a fully transformed space — ready for use and suited to its new life.' }
      ]
    },
    ru: {
      title: 'Ремонт и реконструкция', lead: 'Преобразование, укрепление и модернизация существующих пространств.',
      approachTitle1: 'У каждого пространства', approachTitle2: 'есть свой потенциал.',
      approachText1: 'Мы помогаем раскрыть его и превратить в современную, комфортную и целостную среду.',
      approachText2: 'В ходе ремонта и реконструкции мы сочетаем архитектурные, инженерные и интерьерные решения — от преобразования пространства до мельчайшей детали.',
      approachText3: 'Мы меняем пространство, сохраняя в нём лучшее и создавая новое.',
      steps: [
        { t: 'ОЦЕНКА И ИДЕЯ', d: 'Изучаем пространство, понимаем ваши требования и определяем, как наиболее эффективно использовать его потенциал.' },
        { t: 'ПРОЕКТИРОВАНИЕ', d: 'Формируем новые планировочные, архитектурные и интерьерные решения, приводя пространство в соответствие с вашим образом жизни.' },
        { t: 'ПРЕОБРАЗОВАНИЕ', d: 'Выполняем работы по реконструкции, инженерные, строительные и отделочные работы, контролируя весь процесс.' },
        { t: 'НОВОЕ ПРОСТРАНСТВО', d: 'После финальных проверок сдаём полностью преобразованное пространство — готовое к использованию и отвечающее новой жизни.' }
      ]
    }
  },
  'public-works': {
    hy: {
      title: 'Հասարակական կառույցներ', lead: 'Կազմակերպված շինարարական գործընթացներ՝ տարբեր նշանակության օբյեկտների համար։',
      approachTitle1: 'Մեծ նախագծերը պահանջում են', approachTitle2: 'մեծ պատասխանատվություն։',
      approachText1: 'Հասարակական օբյեկտների կառուցումը պահանջում է ոչ միայն բարձր որակ, այլև հստակ կազմակերպված աշխատանք, պատասխանատվություն և մեծածավալ նախագծերի կառավարման փորձ։',
      approachText2: 'Մենք իրականացնում ենք հասարակական և կոմերցիոն նշանակության օբյեկտների կառուցում՝ նախագծային լուծումների իրականացումից մինչև վերջնական հանձնում։ Յուրաքանչյուր փուլ կազմակերպվում է միասնական համակարգով՝ հաշվի առնելով օբյեկտի նշանակությունը, ֆունկցիոնալ պահանջները և պատվիրատուի նպատակները։',
      approachText3: 'Մեր թիմը համակարգում է շինարարական, ինժեներական և հարդարման աշխատանքները՝ վերահսկելով որակը, աշխատանքների հաջորդականությունն ու նախագծային լուծումների ճիշտ իրականացումը։',
      approachText4: 'Մեր նպատակն է յուրաքանչյուր օբյեկտ հանձնել պատրաստ, ամբողջական և իր գործառույթին համապատասխան՝ պահպանելով աշխատանքի նկատմամբ նույն բարձր չափանիշը՝ անկախ նախագծի մասշտաբից։',
      approachText5: 'Մենք պատրաստ ենք ստանձնել այն ամբողջությամբ։',
      steps: [
        { t: 'ՆԱԽԱԳԻԾ ԵՎ ՊԼԱՆԱՎՈՐՈՒՄ', d: 'Ուսումնասիրում ենք օբյեկտի առանձնահատկությունները, հստակեցնում նախագծային և տեխնիկական պահանջները և ձևավորում աշխատանքների ամբողջական պլանը։' },
        { t: 'ԿԱԶՄԱԿԵՐՊՈՒՄ', d: 'Համակարգում ենք մասնագետների, նյութերի և աշխատանքների փուլերը՝ ապահովելով շինարարության սահուն և վերահսկելի ընթացքը։' },
        { t: 'ՇԻՆԱՐԱՐՈՒԹՅՈՒՆ', d: 'Իրականացնում ենք շինարարական, ինժեներական և հարդարման աշխատանքները՝ պահպանելով նախագծային լուծումները, որակի չափանիշներն ու համաձայնեցված ժամկետները։' },
        { t: 'ՀԱՆՁՆՈՒՄ', d: 'Կատարում ենք վերջնական ստուգումները, ապահովում անհրաժեշտ աշխատանքների ավարտը և օբյեկտը հանձնում պատվիրատուին՝ պատրաստ շահագործման։' }
      ]
    },
    en: {
      title: 'Public Buildings', lead: 'Organized construction processes for facilities of various purposes.',
      approachTitle1: 'Big projects require', approachTitle2: 'great responsibility.',
      approachText1: 'Building public facilities requires not only high quality, but also clearly organized work, responsibility and experience in managing large-scale projects.',
      approachText2: "We carry out the construction of public and commercial facilities — from implementing the design solutions to final handover. Every stage is organized within a unified system, taking into account the purpose of the facility, its functional requirements and the client's goals.",
      approachText3: 'Our team coordinates the construction, engineering and finishing works, controlling quality, the sequence of works and the correct implementation of the design solutions.',
      approachText4: 'Our goal is to hand over every facility ready, complete and suited to its function — maintaining the same high standard of work regardless of the scale of the project.',
      approachText5: 'We are ready to take it on in full.',
      steps: [
        { t: 'DESIGN & PLANNING', d: 'We study the features of the facility, define the design and technical requirements and shape a complete plan of works.' },
        { t: 'ORGANIZATION', d: 'We coordinate the specialists, materials and stages of work, ensuring a smooth and controllable course of construction.' },
        { t: 'CONSTRUCTION', d: 'We carry out the construction, engineering and finishing works, adhering to the design solutions, the quality standards and the agreed deadlines.' },
        { t: 'HANDOVER', d: 'We perform the final inspections, ensure the completion of all necessary works and hand the facility over to the client, ready for operation.' }
      ]
    },
    ru: {
      title: 'Общественные здания', lead: 'Организованные строительные процессы для объектов различного назначения.',
      approachTitle1: 'Большие проекты требуют', approachTitle2: 'большой ответственности.',
      approachText1: 'Строительство общественных объектов требует не только высокого качества, но и чётко организованной работы, ответственности и опыта управления масштабными проектами.',
      approachText2: 'Мы осуществляем строительство объектов общественного и коммерческого назначения — от реализации проектных решений до финальной сдачи. Каждый этап организуется по единой системе с учётом назначения объекта, функциональных требований и целей заказчика.',
      approachText3: 'Наша команда координирует строительные, инженерные и отделочные работы, контролируя качество, последовательность работ и правильную реализацию проектных решений.',
      approachText4: 'Наша цель — сдавать каждый объект готовым, завершённым и соответствующим своему назначению, сохраняя один и тот же высокий стандарт работы независимо от масштаба проекта.',
      approachText5: 'Мы готовы взять её на себя полностью.',
      steps: [
        { t: 'ПРОЕКТ И ПЛАНИРОВАНИЕ', d: 'Изучаем особенности объекта, уточняем проектные и технические требования и формируем полный план работ.' },
        { t: 'ОРГАНИЗАЦИЯ', d: 'Координируем специалистов, материалы и этапы работ, обеспечивая плавный и управляемый ход строительства.' },
        { t: 'СТРОИТЕЛЬСТВО', d: 'Выполняем строительные, инженерные и отделочные работы, соблюдая проектные решения, стандарты качества и согласованные сроки.' },
        { t: 'СДАЧА', d: 'Проводим финальные проверки, обеспечиваем завершение всех необходимых работ и сдаём объект заказчику готовым к эксплуатации.' }
      ]
    }
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
    modes: { full: 'Ամբողջական կառուցում', monolith: 'Միայն մոնոլիտ', renovation: 'Վերանորոգում', pool: 'Լողավազան' },
    areaLabel: 'Մակերեսը', areaUnit: 'մ²', areaPlaceholder: 'օր.՝ 150',
    poolDims: [
      { label: 'Երկարություն', placeholder: '8' },
      { label: 'Լայնություն', placeholder: '4' },
      { label: 'Խորություն', placeholder: '1.5' }
    ],
    meterUnit: 'մ',
    poolFinishLabel: 'Հարդարման տեսակը',
    poolFinishes: [
      { name: 'ՊԼՅՈՆԿԱ', desc: 'Ֆիլտրման համակարգով' },
      { name: 'ՄՈԶԱԻԿԱ', desc: 'Ֆիլտրման համակարգով' }
    ],
    enterPoolDims: 'Մուտքագրեք լողավազանի չափերը՝ հաշվարկը տեսնելու համար',
    service: {
      pool: { title1: 'Հաշվեք լողավազանի', title2: 'մոտավոր արժեքը։', lead: 'Նշեք լողավազանի երկարությունը, լայնությունը և խորությունը, ընտրեք հարդարման տեսակը և տեսեք մոտավոր արժեքը։' },
      residential: { title1: 'Հաշվեք տան', title2: 'մոտավոր արժեքը։', lead: 'Ընտրեք՝ ամբողջական կառուցում է, թե միայն մոնոլիտ, նշեք մակերեսը և հարկերի քանակը։' },
      renovation: { title1: 'Հաշվեք վերանորոգման', title2: 'մոտավոր արժեքը։', lead: 'Նշեք մակերեսը, ընտրեք վերանորոգման մակարդակը և տեսեք մոտավոր արժեքը։' }
    },
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
    basementAreaLabel: 'Նկուղի մակերեսը (եթե կա)', fullBasementAreaLabel: 'Նկուղի մակերեսը',
    floorUnit: 'ՀԱՐԿ', floorAdds: 'Այս հարկի արժեքը', floorTotal: 'Ընդամենը',
    renovationPremiumNote: 'Ընտրելով Պրեմիում փաթեթը՝ ինտերիերի դիզայնը ստացեք 50% զեղչով։',
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
    modes: { full: 'Full Construction', monolith: 'Monolith Only', renovation: 'Renovation', pool: 'Swimming Pool' },
    areaLabel: 'Area', areaUnit: 'm²', areaPlaceholder: 'e.g. 150',
    poolDims: [
      { label: 'Length', placeholder: '8' },
      { label: 'Width', placeholder: '4' },
      { label: 'Depth', placeholder: '1.5' }
    ],
    meterUnit: 'm',
    poolFinishLabel: 'Finish Type',
    poolFinishes: [
      { name: 'PVC FILM', desc: 'With filtration system' },
      { name: 'MOSAIC', desc: 'With filtration system' }
    ],
    enterPoolDims: 'Enter the pool dimensions to see the calculation',
    service: {
      pool: { title1: "Estimate Your Pool's", title2: 'Approximate Cost.', lead: 'Enter the pool length, width and depth, choose the finish type and see the approximate cost.' },
      residential: { title1: "Estimate Your Home's", title2: 'Approximate Cost.', lead: 'Choose full construction or monolith only, then enter the area and number of floors.' },
      renovation: { title1: "Estimate Your Renovation's", title2: 'Approximate Cost.', lead: 'Enter the area, choose the renovation level and see the approximate cost.' }
    },
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
    basementAreaLabel: 'Basement Area (if any)', fullBasementAreaLabel: 'Basement Area',
    floorUnit: 'FLOOR', floorAdds: 'This floor adds', floorTotal: 'Total',
    renovationPremiumNote: 'Choose the Premium package and get the interior design at 50% off.',
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
    modes: { full: 'Полное строительство', monolith: 'Только монолит', renovation: 'Ремонт', pool: 'Бассейн' },
    areaLabel: 'Площадь', areaUnit: 'м²', areaPlaceholder: 'напр. 150',
    poolDims: [
      { label: 'Длина', placeholder: '8' },
      { label: 'Ширина', placeholder: '4' },
      { label: 'Глубина', placeholder: '1.5' }
    ],
    meterUnit: 'м',
    poolFinishLabel: 'Тип отделки',
    poolFinishes: [
      { name: 'ПЛЁНКА ПВХ', desc: 'С системой фильтрации' },
      { name: 'МОЗАИКА', desc: 'С системой фильтрации' }
    ],
    enterPoolDims: 'Введите размеры бассейна, чтобы увидеть расчёт',
    service: {
      pool: { title1: 'Рассчитайте примерную', title2: 'стоимость бассейна.', lead: 'Укажите длину, ширину и глубину бассейна, выберите тип отделки и узнайте примерную стоимость.' },
      residential: { title1: 'Рассчитайте примерную', title2: 'стоимость дома.', lead: 'Выберите полное строительство или только монолит, укажите площадь и количество этажей.' },
      renovation: { title1: 'Рассчитайте примерную', title2: 'стоимость ремонта.', lead: 'Укажите площадь, выберите уровень ремонта и узнайте примерную стоимость.' }
    },
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
    basementAreaLabel: 'Площадь цоколя (если есть)', fullBasementAreaLabel: 'Площадь цоколя',
    floorUnit: 'ЭТАЖ', floorAdds: 'Этот этаж добавляет', floorTotal: 'Итого',
    renovationPremiumNote: 'Выбрав пакет Премиум, получите дизайн интерьера со скидкой 50%.',
    resultLabel: 'Примерная стоимость',
    perSqm: '/ м²',
    startingFrom: 'от',
    disclaimer: 'Это только ориентировочный расчёт. Итоговая цена зависит от участка, проекта, материалов и других факторов. Свяжитесь с нами для точной сметы.',
    cta: 'Получить точную смету ↗',
    enterArea: 'Введите площадь, чтобы увидеть расчёт'
  }
};

export const serviceProjects = {
  hy: {
    pool: { title1: 'Մեր կառուցած', title2: 'լողավազանները։' },
    residential: { title1: 'Մեր կառուցած', title2: 'տները։' }
  },
  en: {
    pool: { title1: 'Pools', title2: 'We Have Built.' },
    residential: { title1: 'Homes', title2: 'We Have Built.' }
  },
  ru: {
    pool: { title1: 'Бассейны,', title2: 'которые мы построили.' },
    residential: { title1: 'Дома,', title2: 'которые мы построили.' }
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
