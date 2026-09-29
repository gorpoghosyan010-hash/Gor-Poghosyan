# AI նկարների ցուցակ (prompts)

Կայքն արդեն աշխատում է քո իրական լուսանկարներով և տեսանյութերով։ Ստորև բերված են այն տեղերը, որտեղ
բարձր որակի գեներացված նկարը կկատարելագործի արդյունքը։ Գեներացրու, պահիր **նույն անունով և նույն
կողմերի հարաբերությամբ** (aspect ratio), և փոխարինիր ֆայլը։ Կոդը փոխելու կարիք չկա։

Ընդհանուր ոճ (ավելացրու ամեն prompt-ի վերջում):

> professional architectural photography, shot on a full-frame camera with a 24mm tilt-shift lens, straight verticals,
> natural light, realistic materials, no people, no text, no watermark, photorealistic, editorial, 8k

Խուսափել (negative prompt):

> distorted architecture, bent lines, impossible structures, melted windows, duplicated objects, warped furniture,
> extra columns, cartoon, CGI look, oversaturated, fisheye, people, text, logo, watermark

| # | Ֆայլ | Չափ | Prompt |
|---|---|---|---|
| 1 | `public/media/services/residential-hero.webp` (hero) | 2400×1600 (3:2) | Single-storey modern luxury villa in Armenia at blue hour, light travertine walls, deep flat overhanging roof, floor-to-ceiling glazing glowing warm, long rectangular swimming pool in the foreground reflecting the house, Mount Ararat faint on the horizon |
| 2 | `public/media/services/residential.webp` | 1200×1400 (6:7) | Contemporary four-storey residential building, Yerevan, pink and cream tuff stone facade with bronze metal balconies, street trees, late afternoon light |
| 3 | `public/media/services/public-works.webp` | 1200×1450 (5:6) | Reinforced concrete and steel frame of a residential building under construction, rebar, formwork, tower crane, clear sky, construction site photography |
| 4 | `public/media/services/renovation-panorama-2.webp` | 2000×667 (3:1) | Wide panorama of a finished luxury open-plan apartment in Yerevan, oak floors, warm hidden lighting, beige stone, panoramic windows at sunset |
| 5 | `public/media/services/renovation.webp` | 1200×800 (3:2) | Apartment under renovation: bare concrete walls, new electrical conduits, levelled screed floor, tools, daylight from a large window |
| 6 | `public/media/og.jpg` (Facebook/Telegram preview) | 1200×630 | Aerial drone view at dusk of a modern villa with an illuminated pool, geometric roofs, landscaped garden |

Նոր նյութերի գաղափարներ (կարող ենք ավելացնել որպես նոր բաժիններ).

- Նյութերի մոտիկ կադրեր. հայկական տուֆ, խճանկար լողավազանում, ճեղքված տրավերտին, բրոնզե պրոֆիլներ (macro, shallow depth of field)։
- Օդից (aerial) տեսարաններ՝ վիլլա և լողավազան, երեկոյան լույս։
- Կառուցման սցենաներ՝ կաղապարածածկ, ամրան, բետոնի լցում (documentary style)։

Եթե փոխարինես #1-ը, նորից ստեղծիր `public/media/lines/villa-lines.webp` գծագիրը (հրամանը՝ README.md-ում)։
