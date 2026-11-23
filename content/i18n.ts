import type { Lang } from '../components/LanguageContext';

export const languageNames: Record<Lang, string> = { hy: 'Հայերեն', en: 'English', ru: 'Русский' };

export const common = {
  hy: { viewProject: 'Դիտել նախագիծը', contactCta: 'Կապվել GARON-ի հետ', nextProjectCta: 'Հաջորդ նախագիծը', poolTag: 'ԼՈՂԱՎԱԶԱՆ', residentialTag: 'ԲՆԱԿԵԼԻ', completedTitle: 'Ավարտված նախագծեր', completedMeta: 'Ավարտված նախագիծ' },
  en: { viewProject: 'View Project', contactCta: 'Contact GARON', nextProjectCta: 'Next Project', poolTag: 'POOL', residentialTag: 'RESIDENTIAL', completedTitle: 'Completed projects', completedMeta: 'Completed project' },
  ru: { viewProject: 'Смотреть проект', contactCta: 'Связаться с GARON', nextProjectCta: 'Следующий проект', poolTag: 'БАССЕЙН', residentialTag: 'ЖИЛОЙ ДОМ', completedTitle: 'Завершённые проекты', completedMeta: 'Завершённый проект' }
};

export const nav = {
  hy: { about: 'Մեր մասին', services: 'Ծառայություններ', projects: 'Նախագծեր', calculator: 'Հաշվիչ', contact: 'Կապ', booking: 'Գրանցում', cta: 'Սկսել նախագիծը', menu: 'Բացել մենյուն', close: 'Փակել մենյուն', home: 'Գլխավոր' },
  en: { about: 'About', services: 'Services', projects: 'Projects', calculator: 'Calculator', contact: 'Contact', booking: 'Book a visit', cta: 'Start a Project', menu: 'Open menu', close: 'Close menu', home: 'Home' },
  ru: { about: 'О нас', services: 'Услуги', projects: 'Проекты', calculator: 'Калькулятор', contact: 'Контакты', booking: 'Запись', cta: 'Начать проект', menu: 'Открыть меню', close: 'Закрыть меню', home: 'Главная' }
};

export const footer = {
  hy: { followUs: 'ՀԵՏԵՎԵՔ ՄԵԶ', rights: '© 2026 GARON Construction. Բոլոր իրավունքները պաշտպանված են։' },
  en: { followUs: 'FOLLOW US', rights: '© 2026 GARON Construction. All rights reserved.' },
  ru: { followUs: 'СЛЕДИТЕ ЗА НАМИ', rights: '© 2026 GARON Construction. Все права защищены.' }
};

export const home = {
  hy: {
    heroEyebrow: 'GARON CONSTRUCTION',
    heroTitle1: 'Կառուցում ենք', heroTitle2: 'ամուր հիմքեր, երկար կյանք։',
    heroLead: 'Ժամանակակից, հուսալի և երկարատև շինարարական լուծումներ՝ նախագծումից մինչև ամբողջական իրականացում։',
    viewWork: 'Դիտել աշխատանքները', startProject: 'Սկսել նախագիծը',
    heroSig1: 'ԳԱՂԱՓԱՐՆԵՐ / ԿԱՌՈՒՅՑՆԵՐ / ԻՐԱԿԱՆ ԱՐԴՅՈՒՆՔ', heroSig2: 'ԵՐԵՎԱՆ · ՀԱՅԱՍՏԱՆ',
    philosophyEyebrow: 'GARON / ՓԻԼԻՍՈՓԱՅՈՒԹՅՈՒՆ',
    philosophyTitle1: 'Շինարարությունը', philosophyTitle2: 'միայն պատեր չեն։',
    philosophyText: 'Մենք կառուցում ենք այնպիսի արդյունք, որը պետք է լավ տեսք ունենա այսօր և ճիշտ ծառայի տարիներ անց։ Այդ պատճառով յուրաքանչյուր նախագիծ դիտարկում ենք որպես ամբողջական համակարգ՝ նյութերից ու կառուցվածքից մինչև մանրուքներ և վերջնական միջավայր։',
    philosophyLink: 'Բացահայտել GARON-ը',
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
    openArchive: 'Բացել ամբողջ արխիվը',
    card1Title: 'Լողավազան', card2Title: 'Լողավազան', card3Title: 'Տուն',
    card1Meta: 'Լողավազան · ավարտված', card2Meta: 'Լողավազան · կառուցման փուլեր', card3Meta: 'Բնակելի տուն · ավարտված',
    statementEyebrow: 'ՄԱՐԴԻԿ · ՆԱԽԱԳԾԵՐ · ԱՌԱՋԸՆԹԱՑ',
    statementTitle1: 'Լավ կառուցված', statementTitle2: 'արդյունքը զգացվում է։',
    statementCta: 'Խոսենք ձեր նախագծի մասին',
    calcTeaserEyebrow: 'GARON / ՀԱՇՎԻՉ',
    calcTeaserTitle1: 'Ցանկանու՞մ եք իմանալ', calcTeaserTitle2: 'մոտավոր գինը։',
    calcTeaserLead: 'Ընտրեք նախագծի տեսակը, նշեք մակերեսը և րոպեների ընթացքում տեսեք մոտավոր արժեքը։',
    calcTeaserCta: 'Բացել հաշվիչը'
  },
  en: {
    heroEyebrow: 'GARON CONSTRUCTION',
    heroTitle1: 'We Build', heroTitle2: 'solid foundations, lasting life.',
    heroLead: 'Modern, reliable and durable construction solutions — from design to full completion.',
    viewWork: 'View Our Work', startProject: 'Start a Project',
    heroSig1: 'IDEAS / STRUCTURES / REAL IMPACT', heroSig2: 'YEREVAN · ARMENIA',
    philosophyEyebrow: 'GARON / PHILOSOPHY',
    philosophyTitle1: 'Construction is', philosophyTitle2: 'more than just walls.',
    philosophyText: 'We build results that need to look good today and serve their purpose correctly for years to come. That is why we treat every project as a complete system — from materials and structure to the smallest details and the final environment.',
    philosophyLink: 'Discover GARON',
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
    openArchive: 'View Full Archive',
    card1Title: 'Swimming Pool', card2Title: 'Swimming Pool', card3Title: 'House',
    card1Meta: 'Swimming Pool · Completed', card2Meta: 'Swimming Pool · Under Construction', card3Meta: 'Residential Home · Completed',
    statementEyebrow: 'PEOPLE · PROJECTS · PROGRESS',
    statementTitle1: 'Good construction', statementTitle2: 'can be felt in the result.',
    statementCta: "Let's Talk About Your Project",
    calcTeaserEyebrow: 'GARON / CALCULATOR',
    calcTeaserTitle1: 'Want to know the', calcTeaserTitle2: 'approximate price?',
    calcTeaserLead: 'Choose the project type, enter the area, and see the approximate cost in minutes.',
    calcTeaserCta: 'Open the Calculator'
  },
  ru: {
    heroEyebrow: 'GARON CONSTRUCTION',
    heroTitle1: 'Мы строим', heroTitle2: 'прочный фундамент, долгую жизнь.',
    heroLead: 'Современные, надёжные и долговечные строительные решения — от проектирования до полной сдачи объекта.',
    viewWork: 'Смотреть работы', startProject: 'Начать проект',
    heroSig1: 'ИДЕИ / КОНСТРУКЦИИ / РЕАЛЬНЫЙ РЕЗУЛЬТАТ', heroSig2: 'ЕРЕВАН · АРМЕНИЯ',
    philosophyEyebrow: 'GARON / ФИЛОСОФИЯ',
    philosophyTitle1: 'Строительство —', philosophyTitle2: 'это не только стены.',
    philosophyText: 'Мы создаём результат, который должен хорошо выглядеть сегодня и правильно служить долгие годы. Поэтому каждый проект мы рассматриваем как единую систему — от материалов и конструкции до мелких деталей и итоговой среды.',
    philosophyLink: 'Узнать больше о GARON',
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
    openArchive: 'Открыть весь архив',
    card1Title: 'Бассейн', card2Title: 'Бассейн', card3Title: 'Дом',
    card1Meta: 'Бассейн · завершён', card2Meta: 'Бассейн · в процессе строительства', card3Meta: 'Жилой дом · завершён',
    statementEyebrow: 'ЛЮДИ · ПРОЕКТЫ · ПРОГРЕСС',
    statementTitle1: 'Хорошо построенный', statementTitle2: 'результат — это то, что чувствуется.',
    statementCta: 'Обсудим ваш проект',
    calcTeaserEyebrow: 'GARON / КАЛЬКУЛЯТОР',
    calcTeaserTitle1: 'Хотите узнать', calcTeaserTitle2: 'примерную цену?',
    calcTeaserLead: 'Выберите тип проекта, укажите площадь и за пару минут узнайте примерную стоимость.',
    calcTeaserCta: 'Открыть калькулятор'
  }
};

export const about = {
  hy: {
    eyebrow: 'GARON-Ի ՄԱՍԻՆ',
    title1: 'Կառուցում ենք', title2: 'վստահություն։',
    lead: 'Նախագծից մինչև բանալիների հանձնում՝ մեկ թիմ, մեկ պատասխանատու և հստակ պայմանավորվածություններ։',
    sub: 'Կառուցում ենք լողավազաններ, մասնավոր տներ և հասարակական շենքեր, իրականացնում ենք բնակարանների և տների վերանորոգում։',
    pathEyebrow: 'ՄԵՐ ՄՈՏԵՑՈՒՄԸ',
    pathTitle1: 'Ամբողջ գործընթացը', pathTitle2: 'մեկ ձեռքում։',
    pathText1: 'Աշխատանքը սկսում ենք անվճար այցելությունից և չափագրումից։ Ուսումնասիրում ենք տարածքը, քննարկում ձեր պահանջներն ու սպասելիքները, ապա կազմում մանրամասն նախահաշիվ՝ ըստ առանձին աշխատանքների և նյութերի։ Պայմանագրում ամրագրում ենք աշխատանքների ծավալը, փուլերը և ժամկետները, որպեսզի յուրաքանչյուր քայլ նախապես հստակ լինի երկու կողմերի համար։',
    pathText2: 'Շինարարության ընթացքում ամբողջ գործընթացի համար պատասխանատու է մեկ մարդ, որը համակարգում է բոլոր մասնագետների աշխատանքը և նյութերի մատակարարումը։ Ավարտին կատարում ենք մանրամասն ստուգում և միայն դրանից հետո հանձնում օբյեկտը։ Ձեր ցանկությամբ կարող ենք նախագիծն իրականացնել «բանալին ձեռքին» սկզբունքով՝ ամբողջությամբ համաձայն դիզայն-նախագծի, առանց ձեր անմիջական մասնակցության անհրաժեշտության։',
    stepsEyebrow: 'ԻՆՉՊԵՍ ԵՆՔ ԱՇԽԱՏՈՒՄ',
    stepsTitle1: 'Հինգ քայլ՝', stepsTitle2: 'գաղափարից մինչև բանալի։',
    steps: [
      { t: 'Խորհրդատվություն և այց', d: 'Լսում ենք ձեր խնդիրը, անվճար այցելում ենք օբյեկտ և գնահատում տարածքի վիճակը, հաղորդակցուղիները և աշխատանքների իրական ծավալը։' },
      { t: 'Նախագիծ և նախահաշիվ', d: 'Աշխատում ենք ձեր դիզայն-նախագծով, իսկ եթե այն դեռ չունեք՝ ուղղորդում ենք և օգնում ընտրել լուծումները։ Կազմում ենք անվճար նախահաշիվ, որտեղ աշխատանքներն ու նյութերը ներկայացված են առանձին տողերով։' },
      { t: 'Պայմանագիր', d: 'Ամրագրում ենք աշխատանքների ծավալը, փուլերը, ժամկետները և ձեզ հետ համաձայնեցված վճարման կարգը։ Համաձայնեցված ծավալի գինը չի փոխվում, իսկ լրացուցիչ աշխատանքը կատարվում է միայն ձեր գրավոր համաձայնությամբ։' },
      { t: 'Շինարարություն և վերահսկում', d: 'Ամբողջ ընթացքում ունեք մեկ պատասխանատու ղեկավար։ Պարբերաբար ուղարկում ենք լուսանկարներ և տեսանյութեր՝ ձեզ հարմար ցանկացած ծրագրով, ինչը հարմար է նաև արտերկրում բնակվող պատվիրատուների համար։' },
      { t: 'Ստուգում և հանձնում', d: 'Ձեզ հետ միասին մանրամասն ստուգում ենք կատարված աշխատանքները և օբյեկտը հանձնում միայն բոլոր դիտողությունները վերացնելուց հետո։' }
    ],
    getEyebrow: 'ԻՆՉ ԵՔ ՍՏԱՆՈՒՄ',
    getTitle1: 'Հստակություն', getTitle2: 'յուրաքանչյուր փուլում։',
    gets: [
      { t: 'Մեկ պատասխանատու', d: 'Բոլոր հարցերով դիմում եք մեկ մարդու, որը տիրապետում է նախագծի բոլոր մանրամասներին։' },
      { t: 'Թափանցիկ բյուջե', d: 'Նախահաշիվը կազմված է ըստ առանձին աշխատանքների և նյութերի, իսկ ցանկացած փոփոխություն նախապես համաձայնեցվում է ձեզ հետ։' },
      { t: 'Թաքնված աշխատանքների ստուգում', d: 'Էլեկտրական, ջրամատակարարման և հիդրոմեկուսացման աշխատանքները ստուգում և լուսանկարում ենք, նախքան դրանք կփակվեն երեսպատմամբ։' },
      { t: '«Բանալին ձեռքին»', d: 'Կարող եք ամբողջությամբ վստահել աշխատանքը մեզ՝ արդյունքը կհամապատասխանի դիզայն-նախագծին առանց ձեր ամենօրյա մասնակցության։' }
    ],
    valuesEyebrow: 'ՄԵՐ ԱՐԺԵՔՆԵՐԸ',
    values: [
      { t: 'ՃՇԳՐՏՈՒԹՅՈՒՆ', d: 'Յուրաքանչյուր հանգույց կատարում ենք ըստ նախագծի և տեխնոլոգիայի՝ առանց մոտավոր լուծումների։' },
      { t: 'ՈՐԱԿ', d: 'Ընտրում ենք ստուգված նյութեր և վերահսկում յուրաքանչյուր փուլ, այդ թվում՝ այն, ինչը հետո տեսանելի չի լինի։' },
      { t: 'ՎՍՏԱՀՈՒԹՅՈՒՆ', d: 'Կատարում ենք պայմանագրով ստանձնած պարտավորությունները և ցանկացած հարց քննարկում ենք բաց ու ժամանակին։' },
      { t: 'ԱՐԴՅՈՒՆՔ', d: 'Հանձնում ենք ավարտուն օբյեկտ, որը համապատասխանում է համաձայնեցված նախագծին և պատրաստ է օգտագործման։' }
    ],
    nextEyebrow: 'ՀԱՋՈՐԴԸ',
    nextTitle1: 'Պատրա՞ստ եք', nextTitle2: 'սկսել։',
    nextCta: 'Դիտել նախագծերը', nextCta2: 'Պատվիրել այցելություն և չափագրում'
  },
  en: {
    eyebrow: 'ABOUT GARON',
    title1: 'We build', title2: 'trust.',
    lead: 'From design to handing over the keys — one team, one person in charge and clear agreements.',
    sub: 'We build pools, private houses and public buildings, and renovate apartments and homes.',
    pathEyebrow: 'OUR APPROACH',
    pathTitle1: 'The whole process', pathTitle2: 'in one pair of hands.',
    pathText1: 'We start with a free visit and measurement. We assess the property, discuss your requirements and prepare a detailed estimate, itemised by works and materials. The contract fixes the scope, stages and deadlines, so every step is clear to both sides from the start.',
    pathText2: 'During construction one person is responsible for the entire process, coordinating all specialists and material supply. At the end we carry out a detailed inspection and only then hand over the property. If you wish, we deliver the project turnkey — fully in line with the design project, without the need for your day-to-day involvement.',
    stepsEyebrow: 'HOW WE WORK',
    stepsTitle1: 'Five steps', stepsTitle2: 'from idea to keys.',
    steps: [
      { t: 'Consultation and site visit', d: 'We listen to your brief, visit the site free of charge and assess its condition, utilities and the real scope of work.' },
      { t: 'Design and estimate', d: 'We work to your design project — and if you don’t have one yet, we guide you and help choose the solutions. We prepare a free estimate with works and materials listed line by line.' },
      { t: 'Contract', d: 'The contract fixes scope, stages, timeline and the payment schedule agreed with you. The price for the agreed scope does not change, and any extra work is done only with your written approval.' },
      { t: 'Construction and oversight', d: 'One responsible manager throughout. We send regular photo and video updates through whichever app suits you — convenient for clients living abroad as well.' },
      { t: 'Inspection and handover', d: 'We inspect the completed work with you in detail and hand over only after every remark has been resolved.' }
    ],
    getEyebrow: 'WHAT YOU GET',
    getTitle1: 'Clarity', getTitle2: 'at every stage.',
    gets: [
      { t: 'One point of responsibility', d: 'One person handles all your questions and knows every detail of the project.' },
      { t: 'Transparent budget', d: 'The estimate is itemised by works and materials, and any change is agreed with you in advance.' },
      { t: 'Hidden works checked', d: 'Electrical, plumbing and waterproofing works are inspected and photographed before they are closed up.' },
      { t: 'Turnkey option', d: 'Hand the project over to us entirely and get a result that matches the design, without daily involvement.' }
    ],
    valuesEyebrow: 'OUR VALUES',
    values: [
      { t: 'PRECISION', d: 'Every detail is executed to the drawings and the technology, with no approximations.' },
      { t: 'QUALITY', d: 'We use proven materials and control every stage, including what will later be out of sight.' },
      { t: 'TRUST', d: 'We honour our contractual commitments and raise any issue openly and on time.' },
      { t: 'RESULT', d: 'We hand over a finished property that matches the agreed design and is ready to use.' }
    ],
    nextEyebrow: 'NEXT',
    nextTitle1: 'Ready to', nextTitle2: 'start?',
    nextCta: 'View Projects', nextCta2: 'Book a Visit & Measurement'
  },
  ru: {
    eyebrow: 'О GARON',
    title1: 'Мы строим', title2: 'доверие.',
    lead: 'От проекта до передачи ключей — одна команда, один ответственный и чёткие договорённости.',
    sub: 'Строим бассейны, частные дома и общественные здания, выполняем ремонт квартир и домов.',
    pathEyebrow: 'НАШ ПОДХОД',
    pathTitle1: 'Весь процесс', pathTitle2: 'в одних руках.',
    pathText1: 'Работа начинается с бесплатного выезда и замера. Мы изучаем участок или помещение, обсуждаем ваши требования и составляем подробную смету с разбивкой по работам и материалам. В договоре фиксируются объём, этапы и сроки, чтобы каждый шаг был заранее понятен обеим сторонам.',
    pathText2: 'На время строительства за весь процесс отвечает один человек: он координирует всех специалистов и поставку материалов. В конце мы проводим детальную проверку и только после этого сдаём объект. По вашему желанию реализуем проект «под ключ» — полностью по дизайн-проекту, без необходимости вашего постоянного участия.',
    stepsEyebrow: 'КАК МЫ РАБОТАЕМ',
    stepsTitle1: 'Пять шагов', stepsTitle2: 'от идеи до ключей.',
    steps: [
      { t: 'Консультация и выезд', d: 'Выслушиваем задачу, бесплатно выезжаем на объект и оцениваем его состояние, коммуникации и реальный объём работ.' },
      { t: 'Проект и смета', d: 'Работаем по вашему дизайн-проекту, а если его пока нет — направляем и помогаем выбрать решения. Составляем бесплатную смету, где работы и материалы указаны отдельными строками.' },
      { t: 'Договор', d: 'Фиксируем объём, этапы, сроки и согласованный с вами порядок оплаты. Цена согласованного объёма не меняется, дополнительные работы выполняются только с вашего письменного согласия.' },
      { t: 'Строительство и контроль', d: 'Весь срок у вас один ответственный руководитель. Регулярно присылаем фото- и видеоотчёты в любом удобном вам приложении — это удобно и для заказчиков, живущих за рубежом.' },
      { t: 'Проверка и сдача', d: 'Вместе с вами детально проверяем выполненные работы и сдаём объект только после устранения всех замечаний.' }
    ],
    getEyebrow: 'ЧТО ВЫ ПОЛУЧАЕТЕ',
    getTitle1: 'Ясность', getTitle2: 'на каждом этапе.',
    gets: [
      { t: 'Один ответственный', d: 'По всем вопросам вы обращаетесь к одному человеку, который знает проект до деталей.' },
      { t: 'Прозрачный бюджет', d: 'Смета разбита по работам и материалам, любые изменения заранее согласуются с вами.' },
      { t: 'Контроль скрытых работ', d: 'Электрика, водопровод и гидроизоляция проверяются и фотографируются до того, как их закроют отделкой.' },
      { t: 'Вариант «под ключ»', d: 'Доверьте нам объект полностью и получите результат в точности по дизайн-проекту, без ежедневного участия.' }
    ],
    valuesEyebrow: 'НАШИ ЦЕННОСТИ',
    values: [
      { t: 'ТОЧНОСТЬ', d: 'Каждый узел выполняем строго по проекту и технологии, без приблизительных решений.' },
      { t: 'КАЧЕСТВО', d: 'Используем проверенные материалы и контролируем каждый этап, включая то, что потом не будет видно.' },
      { t: 'ДОВЕРИЕ', d: 'Выполняем договорные обязательства и открыто, своевременно обсуждаем любые вопросы.' },
      { t: 'РЕЗУЛЬТАТ', d: 'Сдаём завершённый объект, который соответствует согласованному проекту и готов к использованию.' }
    ],
    nextEyebrow: 'ДАЛЕЕ',
    nextTitle1: 'Готовы', nextTitle2: 'начать?',
    nextCta: 'Смотреть проекты', nextCta2: 'Заказать выезд и замер'
  }
};

export const servicesIndex = {
  hy: { eyebrow: 'ԾԱՌԱՅՈՒԹՅՈՒՆՆԵՐ', title1: 'Մեկ թիմ՝', title2: 'չորս ուղղություն։', lead: 'Լողավազաններ, բնակելի տներ, վերանորոգում և հասարակական կառույցներ՝ գաղափարից մինչև պատրաստ արդյունք։', whatWeDo: 'ԻՆՉ ԵՆՔ ԱՆՈՒՄ', open: 'Բացել' },
  en: { eyebrow: 'SERVICES', title1: 'One team,', title2: 'four directions.', lead: 'Pools, homes, renovation and public buildings — from idea to finished result.', whatWeDo: 'WHAT WE DO', open: 'Open' },
  ru: { eyebrow: 'УСЛУГИ', title1: 'Одна команда —', title2: 'четыре направления.', lead: 'Бассейны, жилые дома, ремонт и общественные здания — от идеи до готового результата.', whatWeDo: 'ЧЕМ МЫ ЗАНИМАЕМСЯ', open: 'Открыть' }
};

export const serviceDetailShared = {
  hy: {
    eyebrow: 'GARON / ԾԱՌԱՅՈՒԹՅՈՒՆՆԵՐ',
    approachEyebrow: 'ՄԵՐ ՄՈՏԵՑՈՒՄԸ',
    processEyebrow: 'ԳՈՐԾԸՆԹԱՑ',
    ctaEyebrow: 'ՏԵՍԵՔ ԱՇԽԱՏԱՆՔԸ',
    ctaTitle1: 'Իրական նախագծերը', ctaTitle2: 'ավելի լավ են պատմում։',
    ctaButton: 'Դիտել նախագծերը'
  },
  en: {
    eyebrow: 'GARON / SERVICES',
    approachEyebrow: 'OUR APPROACH',
    processEyebrow: 'PROCESS',
    ctaEyebrow: 'SEE THE WORK',
    ctaTitle1: 'Real projects', ctaTitle2: 'tell a better story.',
    ctaButton: 'View Projects'
  },
  ru: {
    eyebrow: 'GARON / УСЛУГИ',
    approachEyebrow: 'НАШ ПОДХОД',
    processEyebrow: 'ПРОЦЕСС',
    ctaEyebrow: 'СМОТРЕТЬ РАБОТЫ',
    ctaTitle1: 'Реальные проекты', ctaTitle2: 'рассказывают лучше.',
    ctaButton: 'Смотреть проекты'
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
    lead: 'Ուղարկեք ձեր հարցը, և մենք կկապվենք ձեզ հետ՝ հաջորդ քայլը քննարկելու համար։',
    leadWithPhone: 'Ուղարկեք ձեր հարցը կամ զանգահարեք մեզ՝ հաջորդ քայլը քննարկելու համար։',
    getInTouch: 'ԿԱՊՎԵՔ ՄԵԶ ՀԵՏ',
    bookingLabel: 'ԱՆՎՃԱՐ ԱՅՑԵԼՈՒԹՅՈՒՆ ԵՎ ՉԱՓԱԳՐՈՒՄ', bookingCta: 'Ընտրել օրը և ժամը',
    title3: 'Սկսենք', title4: 'զրույցից։',
    phoneLabel: 'ՀԵՌԱԽՈՍ', emailLabel: 'EMAIL', socialLabel: 'ՍՈՑՑԱՆՑԵՐ',
    cardText: 'Պատմեք՝ ինչ եք ուզում կառուցել, ինչ փուլում է նախագիծը և ինչ ժամկետ եք պատկերացնում։',
    send: 'Ուղարկել հարցում',
    formName: 'Անուն', formEmail: 'Email', formPhone: 'Հեռախոս', formType: 'Նախագծի տեսակը', formMessage: 'Հաղորդագրություն',
    types: ['Լողավազան', 'Բնակելի տուն', 'Վերանորոգում', 'Հասարակական կառույց', 'Այլ'],
    required: 'Լրացրեք այս դաշտը',
    contactRequired: 'Նշեք առնվազն մեկը՝ email կամ հեռախոս',
    hint: 'Կբացվի ձեր էլ. փոստի ծրագիրը՝ պատրաստի նամակով։',
    sentNote: 'Եթե նամակը չբացվեց, գրեք ուղղակի՝',
    estimateLine: 'Հաշվիչի արդյունքը'
  },
  en: {
    eyebrow: 'CONTACT GARON',
    title1: "Let's Build", title2: 'your idea.',
    lead: 'Send us your inquiry and we will get back to you to discuss the next step.',
    leadWithPhone: 'Send us your inquiry or call us to discuss the next step.',
    getInTouch: 'GET IN TOUCH',
    bookingLabel: 'FREE VISIT & MEASUREMENT', bookingCta: 'Choose a day and time',
    title3: "Let's Start", title4: 'the Conversation.',
    phoneLabel: 'PHONE', emailLabel: 'EMAIL', socialLabel: 'SOCIAL',
    cardText: 'Tell us what you want to build, what stage the project is at, and what timeline you have in mind.',
    send: 'Send Inquiry',
    formName: 'Name', formEmail: 'Email', formPhone: 'Phone', formType: 'Project type', formMessage: 'Message',
    types: ['Swimming pool', 'Residential house', 'Renovation', 'Public building', 'Other'],
    required: 'Please fill in this field',
    contactRequired: 'Enter at least one: email or phone',
    hint: 'Your email app will open with a ready-to-send message.',
    sentNote: 'If nothing opened, write to us directly:',
    estimateLine: 'Calculator estimate'
  },
  ru: {
    eyebrow: 'СВЯЗАТЬСЯ С GARON',
    title1: 'Давайте построим', title2: 'вашу идею.',
    lead: 'Отправьте нам запрос, и мы свяжемся с вами, чтобы обсудить следующий шаг.',
    leadWithPhone: 'Отправьте нам запрос или позвоните нам, чтобы обсудить следующий шаг.',
    getInTouch: 'СВЯЖИТЕСЬ С НАМИ',
    bookingLabel: 'БЕСПЛАТНЫЙ ВЫЕЗД И ЗАМЕР', bookingCta: 'Выбрать день и время',
    title3: 'Начнём', title4: 'разговор.',
    phoneLabel: 'ТЕЛЕФОН', emailLabel: 'EMAIL', socialLabel: 'СОЦСЕТИ',
    cardText: 'Расскажите, что вы хотите построить, на каком этапе находится проект и какие сроки вы предполагаете.',
    send: 'Отправить запрос',
    formName: 'Имя', formEmail: 'Email', formPhone: 'Телефон', formType: 'Тип проекта', formMessage: 'Сообщение',
    types: ['Бассейн', 'Жилой дом', 'Ремонт', 'Общественное здание', 'Другое'],
    required: 'Заполните это поле',
    contactRequired: 'Укажите хотя бы одно: email или телефон',
    hint: 'Откроется ваша почтовая программа с готовым письмом.',
    sentNote: 'Если письмо не открылось, напишите нам напрямую:',
    estimateLine: 'Расчёт из калькулятора'
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
    poolIncludesNote: 'Ներառում է կառուցվածքը, հարդարումը և ֆիլտրման համակարգը',
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
      { name: 'ՍՏԱՆԴԱՐՏ', desc: 'Միայն աշխատանքի արժեքը, նյութերը՝ պատվիրատուի կողմից', detail: 'GARON ընկերությունը կապահովի վերանորոգման որակյալ իրականացումը՝ ներգրավելով փորձառու մասնագետների, որոնք ձեր տունը կդարձնեն ավելի հարմարավետ, գեղեցիկ և ֆունկցիոնալ։' },
      { name: 'ԿՈՄՖՈՐՏ', desc: '', detail: 'Գինը ներառում է վերանորոգման բոլոր աշխատանքները և նախապատրաստական աշխատանքների համար որակյալ նյութերը, որոնք ապահովում է GARON ընկերությունը, իսկ վերջնական հարդարման նյութերն ընտրվում և ձեռք են բերվում պատվիրատուի կողմից։' },
      { name: 'ՊՐԵՄԻՈՒՄ', desc: '', detail: 'Հաշվարկված արժեքը ներառում է վերանորոգման աշխատանքների ամբողջ ծավալը և նախապատրաստական փուլերի համար անհրաժեշտ որակյալ նյութերը՝ GARON ընկերության ապահովմամբ։ Վերջնական հարդարման նյութերի ընտրության և ձեռքբերման հարցում GARON-ը կտրամադրի մասնագիտական աջակցություն՝ օգնելով գտնել լավագույն լուծումները՝ ըստ ձեր նախասիրությունների, նախագծի առանձնահատկությունների և նախատեսված բյուջեի։' }
    ],
    infoLabel: 'Ինչ է մտնում այս գնի մեջ',
    optionsLabel: 'Հավելյալ առանձնահատկություններ',
    basement: 'Նկուղային հարկ', mansard: 'Մանսարդ հարկ', flatRoof: 'Հարթ տանիք',
    floorsLabel: 'Հարկերի քանակը',
    basementAreaLabel: 'Նկուղի մակերեսը (եթե կա)', fullBasementAreaLabel: 'Նկուղի մակերեսը',
    floorUnit: 'ՀԱՐԿ', floorAdds: 'Այս հարկի արժեքը', floorTotal: 'Ընդամենը',
    resultLabel: 'Մոտավոր արժեքը',
    perSqm: '/ մ²',
    startingFrom: 'սկսած',
    disclaimer: 'Սա միայն կողմնորոշիչ հաշվարկ է։ Վերջնական գինը կախված է հողատարածքից, նախագծից, նյութերից և այլ գործոններից։ Ճշգրիտ նախահաշվի համար կապվեք մեզ հետ։',
    cta: 'Ստանալ ճշգրիտ նախահաշիվ',
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
    poolIncludesNote: 'Includes the structure, finishing and filtration system',
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
      { name: 'STANDARD', desc: 'Labor only — materials provided by the client', detail: 'GARON ensures high-quality renovation work, bringing in experienced specialists who will make your home more comfortable, beautiful and functional.' },
      { name: 'COMFORT', desc: '', detail: 'The price includes all renovation work and quality materials for the preparatory work, supplied by GARON; final finishing materials are chosen and purchased by the client.' },
      { name: 'PREMIUM', desc: '', detail: 'The estimate covers the full scope of renovation work and the quality materials needed for the preparatory stages, supplied by GARON. For final finishing materials, GARON provides professional guidance, helping you find the best solutions for your taste, the specifics of the project and your planned budget.' }
    ],
    infoLabel: "What's included in this price",
    optionsLabel: 'Additional Features',
    basement: 'Basement Floor', mansard: 'Mansard Floor', flatRoof: 'Flat Roof',
    floorsLabel: 'Number of Floors',
    basementAreaLabel: 'Basement Area (if any)', fullBasementAreaLabel: 'Basement Area',
    floorUnit: 'FLOOR', floorAdds: 'This floor adds', floorTotal: 'Total',
    resultLabel: 'Approximate Cost',
    perSqm: '/ m²',
    startingFrom: 'starting from',
    disclaimer: 'This is only an indicative estimate. The final price depends on the site, design, materials and other factors. Contact us for an accurate quote.',
    cta: 'Get an Accurate Quote',
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
    poolIncludesNote: 'Включает конструкцию, отделку и систему фильтрации',
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
      { name: 'СТАНДАРТ', desc: 'Только стоимость работ — материалы предоставляет заказчик', detail: 'GARON обеспечит качественное выполнение ремонта, привлекая опытных специалистов, которые сделают ваш дом более удобным, красивым и функциональным.' },
      { name: 'КОМФОРТ', desc: '', detail: 'Цена включает все ремонтные работы и качественные материалы для подготовительных работ, которые предоставляет GARON, а чистовые отделочные материалы выбирает и приобретает заказчик.' },
      { name: 'ПРЕМИУМ', desc: '', detail: 'Расчётная стоимость включает весь объём ремонтных работ и качественные материалы, необходимые для подготовительных этапов, которые предоставляет GARON. При выборе и покупке чистовых отделочных материалов GARON окажет профессиональную помощь и поможет найти лучшие решения с учётом ваших предпочтений, особенностей проекта и запланированного бюджета.' }
    ],
    infoLabel: 'Что входит в эту цену',
    optionsLabel: 'Дополнительные особенности',
    basement: 'Цокольный этаж', mansard: 'Мансардный этаж', flatRoof: 'Плоская крыша',
    floorsLabel: 'Количество этажей',
    basementAreaLabel: 'Площадь цоколя (если есть)', fullBasementAreaLabel: 'Площадь цоколя',
    floorUnit: 'ЭТАЖ', floorAdds: 'Этот этаж добавляет', floorTotal: 'Итого',
    resultLabel: 'Примерная стоимость',
    perSqm: '/ м²',
    startingFrom: 'от',
    disclaimer: 'Это только ориентировочный расчёт. Итоговая цена зависит от участка, проекта, материалов и других факторов. Свяжитесь с нами для точной сметы.',
    cta: 'Получить точную смету',
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
    openHouse: 'Բացել Տունը', houseCardTitle: 'Տուն', houseCardMeta: 'Բնակելի առանձնատուն · ավարտված',
    nextEyebrow: 'ՀԱՋՈՐԴԸ', nextTitle1: 'Ձեր նախագիծը', nextTitle2: 'կարող է լինել այստեղ։', nextCta: 'Սկսել նախագիծը'
  },
  en: {
    eyebrow: 'GARON / PROJECT ARCHIVE', title1: 'Real Work.', title2: 'Real Results.',
    lead: 'Our projects are presented not only with a final photo, but — wherever possible — with the full construction story.',
    poolsEyebrow: '01 / SWIMMING POOLS', poolsTitle1: 'Swimming Pools', poolsTitle2: 'Real Examples',
    poolsText: 'Each pool is a separate project. Open it and see the real stages — from structure to final look.',
    residentialEyebrow: '02 / RESIDENTIAL', residentialTitle1: 'Residential', residentialTitle2: 'Homes',
    residentialText: 'The house shows the entire journey from ground zero to a finished home, on a single project page.',
    openHouse: 'Open the House', houseCardTitle: 'House', houseCardMeta: 'Residential Home · Completed',
    nextEyebrow: 'NEXT', nextTitle1: 'Your project', nextTitle2: 'could be here.', nextCta: 'Start a Project'
  },
  ru: {
    eyebrow: 'GARON / АРХИВ ПРОЕКТОВ', title1: 'Реальная работа.', title2: 'Реальные результаты.',
    lead: 'Наши проекты представлены не только итоговым фото, но, где это возможно, — всей историей строительства.',
    poolsEyebrow: '01 / БАССЕЙНЫ', poolsTitle1: 'Бассейны', poolsTitle2: 'Реальные примеры',
    poolsText: 'Каждый бассейн — отдельный проект. Откройте его и посмотрите реальные этапы — от конструкции до финального вида.',
    residentialEyebrow: '02 / ЖИЛЫЕ ДОМА', residentialTitle1: 'Жилые', residentialTitle2: 'дома',
    residentialText: 'Дом показывает весь путь от нуля до готового дома на одной странице проекта.',
    openHouse: 'Открыть дом', houseCardTitle: 'Дом', houseCardMeta: 'Жилой дом · завершён',
    nextEyebrow: 'ДАЛЕЕ', nextTitle1: 'Ваш проект', nextTitle2: 'может быть здесь.', nextCta: 'Начать проект'
  }
};

export const splash = {
  hy: { trade: 'ՇԻՆԱՐԱՐՈՒԹՅՈՒՆ', welcome: 'ԲԱՐԻ ԳԱԼՈՒՍՏ' },
  en: { trade: 'CONSTRUCTION', welcome: 'WELCOME' },
  ru: { trade: 'СТРОИТЕЛЬСТВО', welcome: 'ДОБРО ПОЖАЛОВАТЬ' }
};

export const heroLabel = {
  hy: 'GARON / 3D ՆԱԽԱԳԻԾ',
  en: 'GARON / 3D STUDY',
  ru: 'GARON / 3D-ЭТЮД'
};

export const notFound = {
  hy: { eyebrow: '404', title: 'Էջը չի գտնվել', text: 'Հնարավոր է՝ հղումը հնացել է կամ էջը տեղափոխվել է։', home: 'Վերադառնալ գլխավոր էջ', projects: 'Դիտել նախագծերը' },
  en: { eyebrow: '404', title: 'Page not found', text: 'The link may be outdated or the page may have moved.', home: 'Back to Home', projects: 'View Projects' },
  ru: { eyebrow: '404', title: 'Страница не найдена', text: 'Возможно, ссылка устарела или страница была перемещена.', home: 'На главную', projects: 'Смотреть проекты' }
};
export const booking = {
  hy: {
    cancelSave: 'Եթե պետք լինի չեղարկել գրանցումը, պահեք այս հղումը կամ զանգահարեք մեզ։', cancelLinkText: 'Չեղարկման հղում', copy: 'Պատճենել', copied: 'Պատճենված է',
    cEyebrow: 'ԳՐԱՆՑՄԱՆ ՉԵՂԱՐԿՈՒՄ', cTitle1: 'Չեղարկե՞լ', cTitle2: 'գրանցումը։', cLoading: 'Բեռնվում է…', cNotFound: 'Գրանցումը չի գտնվել։ Հնարավոր է՝ հղումը սխալ է։', cAsk: 'Ձեր գրանցումը', cButton: 'Չեղարկել գրանցումը', cKeep: 'Ոչ, թողնել', cDone: 'Գրանցումը չեղարկված է։ Ժամն ազատվել է։', cAlready: 'Այս գրանցումն արդեն չեղարկված է։', cError: 'Չհաջողվեց չեղարկել։ Խնդրում ենք փորձել կրկին կամ գրել մեզ', cNew: 'Գրանցվել նոր ժամի',
    eyebrow: 'ԳՐԱՆՑՈՒՄ',
    title1: 'Պատվիրեք այցելություն', title2: 'և չափագրում։',
    lead: 'Ընտրեք ձեզ հարմար օրը և ժամը։ Մենք կկապվենք ձեզ հետ՝ հաստատելու այցը։ Այցելությունն ու չափագրումն անվճար են։',
    stepDate: 'Ընտրեք օրը', stepTime: 'Ընտրեք ժամը', stepInfo: 'Ձեր տվյալները',
    name: 'Անուն', phone: 'Հեռախոս', email: 'Էլ. փոստ (ըստ ցանկության)', address: 'Օբյեկտի հասցեն', note: 'Կարճ նկարագրեք աշխատանքը (ըստ ցանկության)',
    required: 'Պարտադիր դաշտ', pickDate: 'Ընտրեք օրը', pickTime: 'Ընտրեք ժամը',
    submit: 'Գրանցվել', sending: 'Ուղարկվում է…',
    summary: 'Ձեր ընտրությունը',
    doneTitle: 'Շնորհակալություն։', doneText: 'Ձեր հայտը ստացվել է։ Շուտով կկապվենք ձեզ հետ՝ հաստատելու այցի օրը և ժամը։', again: 'Նոր գրանցում',
    failText: 'Չհաջողվեց ուղարկել։ Խնդրում ենք փորձել կրկին կամ գրել մեզ',
    note2: 'Մոխրագույն ժամերն արդեն զբաղված են։ Ժամը նախնական է. վերջնականը համաձայնեցնում ենք զանգով։',
    busy: 'Զբաղված է', takenText: 'Այս ժամն արդեն զբաղված է։ Խնդրում ենք ընտրել մեկ այլ ժամ։',
    weekdays: ['Կիր', 'Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շբթ'],
    months: ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'],
    monthsShort: ['հնվ', 'փտվ', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սպտ', 'հկտ', 'նյմ', 'դկտ']
  },
  en: {
    cancelSave: 'If you need to cancel, keep this link or call us.', cancelLinkText: 'Cancellation link', copy: 'Copy', copied: 'Copied',
    cEyebrow: 'CANCEL BOOKING', cTitle1: 'Cancel your', cTitle2: 'booking?', cLoading: 'Loading…', cNotFound: 'Booking not found. The link may be incorrect.', cAsk: 'Your booking', cButton: 'Cancel booking', cKeep: 'No, keep it', cDone: 'Your booking has been cancelled. The time slot is free again.', cAlready: 'This booking has already been cancelled.', cError: 'Cancellation failed. Please try again or write to us at', cNew: 'Book another time',
    eyebrow: 'BOOKING',
    title1: 'Book a visit', title2: 'and measurement.',
    lead: 'Choose a day and time that suit you. We will contact you to confirm the visit. The visit and measurement are free.',
    stepDate: 'Choose a day', stepTime: 'Choose a time', stepInfo: 'Your details',
    name: 'Name', phone: 'Phone', email: 'Email (optional)', address: 'Property address', note: 'Briefly describe the work (optional)',
    required: 'Required field', pickDate: 'Please choose a day', pickTime: 'Please choose a time',
    submit: 'Book', sending: 'Sending…',
    summary: 'Your choice',
    doneTitle: 'Thank you!', doneText: 'Your request has been received. We will contact you shortly to confirm the day and time of the visit.', again: 'New booking',
    failText: 'Sending failed. Please try again or write to us at',
    note2: 'Greyed-out times are already taken. The time is provisional; we confirm the final time by phone.',
    busy: 'Taken', takenText: 'This time has just been taken. Please choose another time.',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  ru: {
    cancelSave: 'Если понадобится отменить запись, сохраните эту ссылку или позвоните нам.', cancelLinkText: 'Ссылка для отмены', copy: 'Копировать', copied: 'Скопировано',
    cEyebrow: 'ОТМЕНА ЗАПИСИ', cTitle1: 'Отменить', cTitle2: 'запись?', cLoading: 'Загрузка…', cNotFound: 'Запись не найдена. Возможно, ссылка неверна.', cAsk: 'Ваша запись', cButton: 'Отменить запись', cKeep: 'Нет, оставить', cDone: 'Запись отменена. Время снова свободно.', cAlready: 'Эта запись уже отменена.', cError: 'Не удалось отменить. Попробуйте ещё раз или напишите нам на', cNew: 'Записаться на другое время',
    eyebrow: 'ЗАПИСЬ',
    title1: 'Запишитесь на выезд', title2: 'и замер.',
    lead: 'Выберите удобный день и время. Мы свяжемся с вами, чтобы подтвердить визит. Выезд и замер бесплатные.',
    stepDate: 'Выберите день', stepTime: 'Выберите время', stepInfo: 'Ваши данные',
    name: 'Имя', phone: 'Телефон', email: 'Email (по желанию)', address: 'Адрес объекта', note: 'Кратко опишите работу (по желанию)',
    required: 'Обязательное поле', pickDate: 'Выберите день', pickTime: 'Выберите время',
    submit: 'Записаться', sending: 'Отправка…',
    summary: 'Ваш выбор',
    doneTitle: 'Спасибо!', doneText: 'Ваша заявка получена. Мы скоро свяжемся с вами, чтобы подтвердить день и время визита.', again: 'Новая запись',
    failText: 'Не удалось отправить. Попробуйте ещё раз или напишите нам на',
    note2: 'Серые часы уже заняты. Время предварительное, окончательное согласуем по телефону.',
    busy: 'Занято', takenText: 'Это время уже занято. Пожалуйста, выберите другое.',
    weekdays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    monthsShort: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  }
};
