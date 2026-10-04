import type { SymptomDef } from '../types';

/**
 * Symptom registry (MVP: 39 items).
 *
 * Conventions:
 * - Labels are observational («что видит владелец»), not diagnostic.
 * - Numeric thresholds are engineering defaults marked in `basis` as
 *   requiring veterinary validation (needs-veterinary-review).
 * - Boolean "yes" emits finding `<id>`; boolean "no" emits `<id>::no`
 *   (explicit negative — the engine counts it only when answered).
 * - Stool COLOR findings are observational only: no color→cause claims
 *   are made anywhere in explanations (uncertain / low evidence).
 */
export const symptoms: SymptomDef[] = [
  /* ---------- общие ---------- */
  {
    input: 'boolean',
    id: 'lethargy',
    system: 'general',
    label: 'Вялость, угнетение',
    hint: 'Теленок меньше реагирует на окружающее, больше лежит, чем обычно.',
  },
  {
    input: 'choice',
    id: 'appetite',
    system: 'general',
    label: 'Аппетит и сосание',
    hint: 'Оцените по последнему кормлению.',
    options: [
      { id: 'normal', label: 'Ест как обычно', findings: ['appetite-normal'] },
      { id: 'reduced', label: 'Ест хуже обычного', findings: ['appetite-reduced'] },
      { id: 'refusing', label: 'Отказывается от молока / корма', findings: ['appetite-refusing'] },
      {
        id: 'refusing-long',
        label: 'Отказ более 12–24 часов',
        findings: ['appetite-refusing-long', 'appetite-refusing'],
      },
    ],
  },
  {
    input: 'boolean',
    id: 'recumbent',
    system: 'general',
    label: 'Лежит и не может встать при побуждении',
    hint: 'Не путать с просто лежащим теленком: попробуйте побудить его подняться.',
  },
  {
    input: 'number',
    id: 'measured-temp',
    system: 'general',
    label: 'Измеренная температура тела',
    hint: 'Измеряйте ректально. Если термометра нет — пропустите и отметьте признак «холодный теленок» ниже.',
    unit: '°C',
    normalHint: 'Ориентир для телят ≈ 38,5–39,5 °C',
    ranges: [
      {
        finding: 'temp-hypothermia',
        op: 'lte',
        value: 38.0,
        describe: '38,0 °C и ниже (гипотермия)',
        basis: 'needs-veterinary-review: порог гипотермии',
      },
      {
        finding: 'temp-normal',
        op: 'gte',
        value: 38.0,
        andBelow: 39.4,
        describe: '38,0–39,4 °C (в пределах ориентира нормы)',
        basis: 'needs-veterinary-review: границы нормотермии',
      },
      {
        finding: 'temp-fever',
        op: 'gte',
        value: 39.5,
        describe: '39,5 °C и выше (лихорадка)',
        basis: 'needs-veterinary-review: порог лихорадки',
      },
      {
        finding: 'temp-high-fever',
        op: 'gte',
        value: 40.5,
        describe: '40,5 °C и выше (выраженная лихорадка)',
        basis: 'needs-veterinary-review: порог выраженной лихорадки',
      },
    ],
  },
  {
    input: 'choice',
    id: 'dehydration',
    system: 'general',
    label: 'Признаки обезвоживания',
    hint: 'Сухость пасти, эластичность кожной складки на шее, запавшие глаза, холодные конечности.',
    options: [
      { id: 'none', label: 'Не заметны', findings: ['dehydration-none'] },
      {
        id: 'mild',
        label: 'Легкие: сухость пасти, кожа расправляется чуть медленнее',
        findings: ['dehydration-mild'],
      },
      {
        id: 'moderate',
        label: 'Умеренные: складка расправляется медленно, глаза слегка запавшие',
        findings: ['dehydration-moderate'],
      },
      {
        id: 'severe',
        label: 'Выраженные: запавшие глаза, складка не расправляется, холодные конечности',
        findings: ['dehydration-severe'],
      },
    ],
  },
  {
    input: 'boolean',
    id: 'cold-calf',
    system: 'general',
    label: 'Теленок холодный на ощупь (уши, рот, конечности), дрожит',
    hint: 'Для случая, когда термометра нет.',
  },
  {
    input: 'boolean',
    id: 'tremor',
    system: 'general',
    label: 'Мышечная дрожь, тремор',
  },
  {
    input: 'boolean',
    id: 'poor-gain',
    system: 'general',
    label: 'Плохо набирает вес, отстает в росте',
    ageBands: ['d22-42', 'd43-90', 'd91-180'],
  },
  {
    input: 'choice',
    id: 'pen-deaths',
    system: 'general',
    label: 'Падеж телят в группе за последние дни',
    hint: 'Важно для оценки риска инфекционной вспышки.',
    options: [
      { id: 'none', label: 'Нет', findings: ['pen-deaths-no'] },
      { id: 'yes', label: 'Да, был падеж', findings: ['pen-deaths-yes'] },
      { id: 'unknown', label: 'Неизвестно', findings: [] },
    ],
  },

  /* ---------- желудочно-кишечный тракт ---------- */
  {
    input: 'choice',
    id: 'stool-consistency',
    system: 'gi',
    label: 'Стул: консистенция',
    options: [
      { id: 'none', label: 'Нормальный, оформленный / кашицеобразный без изменений', findings: ['diarrhea-no'] },
      { id: 'pasty', label: 'Жидковатый, мажущий', findings: ['diarrhea-pasty'] },
      { id: 'watery', label: 'Водянистый, профузный', findings: ['diarrhea-watery'] },
    ],
  },
  {
    input: 'choice',
    id: 'stool-frequency',
    system: 'gi',
    label: 'Частота стула',
    options: [
      { id: 'normal', label: 'Обычная', findings: ['stool-freq-normal'] },
      { id: 'elevated', label: 'Учащенная (2–4 раза чаще обычного)', findings: ['stool-freq-elevated'] },
      { id: 'high', label: 'Очень частая (5 и более раз за сутки)', findings: ['stool-freq-high'] },
    ],
  },
  {
    input: 'choice',
    id: 'stool-blood',
    system: 'gi',
    label: 'Кровь в кале',
    options: [
      { id: 'none', label: 'Нет', findings: ['stool-blood-no'] },
      { id: 'streaks', label: 'Прожилки крови', findings: ['stool-blood-streaks'] },
      {
        id: 'noticeable',
        label: 'Заметная кровь / дегтеобразный стул',
        findings: ['stool-blood-noticeable'],
      },
    ],
  },
  {
    input: 'boolean',
    id: 'stool-mucus',
    system: 'gi',
    label: 'Слизь в кале',
  },
  {
    input: 'choice',
    id: 'stool-color',
    system: 'gi',
    label: 'Цвет кала',
    hint: 'Наблюдение для сводки ветеринару: надежной привязки цвета к возбудителю нет.',
    options: [
      { id: 'normal', label: 'Обычный желто-коричневый', findings: ['stool-color-normal'] },
      { id: 'pale', label: 'Белесый / светло-желтый', findings: ['stool-color-pale'] },
      { id: 'green', label: 'Зеленоватый', findings: ['stool-color-green'] },
      { id: 'dark', label: 'Темный / черноватый', findings: ['stool-color-dark'] },
    ],
  },
  {
    input: 'choice',
    id: 'abdominal-distension',
    system: 'gi',
    label: 'Вздутие живота',
    options: [
      { id: 'none', label: 'Живот не вздут', findings: ['distension-no'] },
      { id: 'left', label: 'Выпирает область левого бока (голодная ямка)', findings: ['distension-left'] },
      { id: 'whole', label: 'Весь живот увеличен, напряжён', findings: ['distension-whole'] },
    ],
  },
  {
    input: 'boolean',
    id: 'tenesmus',
    system: 'gi',
    label: 'Частое натуживание почти без результата (тенезмы)',
  },
  {
    input: 'boolean',
    id: 'regurgitation',
    system: 'gi',
    label: 'Срыгивание, рвотные движения',
    hint: 'Настоящая рвота у телят бывает редко — отметьте, если наблюдали.',
  },

  /* ---------- респираторная система ---------- */
  {
    input: 'choice',
    id: 'cough',
    system: 'resp',
    label: 'Кашель',
    options: [
      { id: 'none', label: 'Нет', findings: ['cough-no'] },
      { id: 'rare', label: 'Редкий', findings: ['cough-rare'] },
      { id: 'frequent', label: 'Частый, повторяющийся', findings: ['cough-frequent'] },
    ],
  },
  {
    input: 'number',
    id: 'resp-rate',
    system: 'resp',
    label: 'Частота дыхания в покое',
    hint: 'Считайте подъемы грудной клетки за минуту, когда теленок спокоен.',
    unit: 'дых/мин',
    normalHint: 'Ориентир нормы для телят ≈ 30–60 дых/мин',
    ranges: [
      {
        finding: 'rr-elevated',
        op: 'gte',
        value: 80,
        describe: '80 дых/мин и выше (учащенное дыхание)',
        basis: 'needs-veterinary-review: порог тахипноэ',
      },
      {
        finding: 'rr-severe',
        op: 'gte',
        value: 120,
        describe: '120 дых/мин и выше (выраженное учащение дыхания)',
        basis: 'needs-veterinary-review: порог выраженного тахипноэ',
      },
    ],
  },
  {
    input: 'boolean',
    id: 'open-mouth',
    system: 'resp',
    label: 'Дыхание с открытым ртом, синюшные слизистые, выраженная одышка',
    hint: 'Крупный рогатый скот почти не дышит ртом, если дыхание не сильно затруднено.',
  },
  {
    input: 'choice',
    id: 'nasal-discharge',
    system: 'resp',
    label: 'Выделения из носа',
    options: [
      { id: 'none', label: 'Нет', findings: ['nasal-no'] },
      { id: 'serous', label: 'Прозрачные, водянистые', findings: ['nasal-serous'] },
      { id: 'purulent', label: 'Гнойные, желто-зеленые, густые', findings: ['nasal-purulent'] },
    ],
  },
  {
    input: 'boolean',
    id: 'loud-breathing',
    system: 'resp',
    label: 'Шумное, свистящее или хрипящее дыхание, слышимое без стетоскопа',
  },
  {
    input: 'boolean',
    id: 'droopy-ear',
    system: 'resp',
    label: 'Опущено ухо, трясет головой',
    hint: 'Может указывать на воспаление среднего уха — требует осмотра.',
  },

  /* ---------- глаза и слизистые ---------- */
  {
    input: 'choice',
    id: 'eye-lesion',
    system: 'ocular',
    label: 'Глаза: слезотечение, прищуривание, изменения роговицы',
    options: [
      { id: 'none', label: 'Глаза чистые, без изменений', findings: ['eye-no'] },
      { id: 'one', label: 'Слезотечение / прищур одного глаза', findings: ['eye-one'] },
      {
        id: 'both',
        label: 'Оба глаза: слезотечение, мутность роговицы или белое пятно',
        findings: ['eye-both'],
      },
    ],
  },
  {
    input: 'boolean',
    id: 'pale-membranes',
    system: 'ocular',
    label: 'Бледные слизистые оболочки (десны, конъюнктива)',
  },
  {
    input: 'boolean',
    id: 'jaundice',
    system: 'ocular',
    label: 'Желтушность слизистых оболочек',
    hint: 'У телят встречается редко; отмечайте только при явной желтизне.',
  },

  /* ---------- нервная система ---------- */
  {
    input: 'boolean',
    id: 'seizures',
    system: 'neuro',
    label: 'Судороги, приступы',
  },
  {
    input: 'boolean',
    id: 'opisthotonus',
    system: 'neuro',
    label: 'Голова запрокинута назад, выгибание тела',
  },
  {
    input: 'boolean',
    id: 'ataxia',
    system: 'neuro',
    label: 'Шаткая походка, нарушение координации',
  },
  {
    input: 'boolean',
    id: 'unresponsive',
    system: 'neuro',
    label: 'Ступор: не реагирует на звук и прикосновение',
  },

  /* ---------- опорно-двигательный аппарат ---------- */
  {
    input: 'boolean',
    id: 'limping',
    system: 'musculo',
    label: 'Хромота',
  },
  {
    input: 'choice',
    id: 'swollen-joint',
    system: 'musculo',
    label: 'Сустав припухший, горячий, болезненный',
    hint: 'Сравните с парным суставом на другой конечности.',
    options: [
      { id: 'none', label: 'Суставы без изменений', findings: ['joint-no'] },
      { id: 'one', label: 'Один сустав припухший / болезненный', findings: ['joint-one'] },
      { id: 'many', label: 'Несколько суставов', findings: ['joint-many'] },
    ],
  },
  {
    input: 'boolean',
    id: 'stiff-rising',
    system: 'musculo',
    label: 'Скованность, болезненность при вставании',
  },

  /* ---------- пупочная область ---------- */
  {
    input: 'boolean',
    id: 'umbilical-swelling',
    system: 'umbilical',
    label: 'Припухлость или уплотнение в области пупка (возможно, грыжа)',
    hint: 'Мягкая вправляемая припухлость чаще грыжа; плотная и горячая — воспаление.',
  },
  {
    input: 'choice',
    id: 'umbilical-discharge',
    system: 'umbilical',
    label: 'Выделения из пупка',
    options: [
      { id: 'none', label: 'Пупок сухой, чистый', findings: ['umb-discharge-no'] },
      { id: 'moist', label: 'Мокнутие, влажность', findings: ['umb-discharge-moist'] },
      {
        id: 'purulent',
        label: 'Гнойные или зловонные выделения',
        findings: ['umb-discharge-purulent'],
      },
    ],
  },
  {
    input: 'boolean',
    id: 'umbilical-hot',
    system: 'umbilical',
    label: 'Кожа над пупком горячая и болезненная',
  },

  /* ---------- кожа ---------- */
  {
    input: 'boolean',
    id: 'skin-patches',
    system: 'skin',
    label: 'Круглые участки без шерсти с корочками',
    hint: 'Возможен лишай — зооноз: мойте руки после контакта.',
  },
  {
    input: 'boolean',
    id: 'subcut-edema',
    system: 'skin',
    label: 'Подкожные отеки (голова, шея, конечности)',
    hint: 'У новорожденных после тяжелых родов может быть следствием родовой травмы.',
  },

  /* ---------- мочевыделение ---------- */
  {
    input: 'choice',
    id: 'urine-output',
    system: 'urinary',
    label: 'Мочеиспускание',
    hint: 'Оценить сложно; отмечайте только если наблюдали.',
    options: [
      { id: 'normal', label: 'Обычное', findings: ['urine-normal'] },
      { id: 'rare', label: 'Заметно реже обычного', findings: ['urine-rare'] },
      {
        id: 'none',
        label: 'Не наблюдал мочеиспускания более 12 часов',
        findings: ['urine-none'],
      },
    ],
  },
];
