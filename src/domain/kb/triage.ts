import type {
  RedFlagDef,
  SeverityGateDef,
  TriageLevelDef,
  RuleOutDef,
} from '../types';

/**
 * RED FLAGS — immediate emergency banner.
 * Each rule is a candidate awaiting veterinary validation; the wording is
 * deliberately conservative (over-triage is safer than under-triage).
 */
export const redFlags: RedFlagDef[] = [
  {
    id: 'rf-recumbent',
    allOf: ['recumbent'],
    anyOf: [],
    message:
      'Теленок не может встать. Это экстренный признак — нужна ветеринарная помощь сейчас.',
  },
  {
    id: 'rf-seizures',
    allOf: ['seizures'],
    anyOf: [],
    message: 'Судороги — экстренный признак. Обратитесь к ветеринарному специалисту немедленно.',
  },
  {
    id: 'rf-opisthotonus',
    allOf: ['opisthotonus'],
    anyOf: [],
    message:
      'Запрокидывание головы с выгибанием — экстренный признак. Нужен ветеринарный специалист немедленно.',
  },
  {
    id: 'rf-unresponsive',
    allOf: ['unresponsive'],
    anyOf: [],
    message:
      'Теленок не реагирует на звук и прикосновение. Это экстренный признак — нужен ветеринарный специалист сейчас.',
  },
  {
    id: 'rf-open-mouth-breathing',
    allOf: ['open-mouth'],
    anyOf: [],
    message:
      'Дыхание с открытым ртом / посинение слизистых — выраженная дыхательная недостаточность. Нужен ветеринарный специалист немедленно.',
  },
  {
    id: 'rf-hypothermia-measured',
    allOf: ['temp-hypothermia'],
    anyOf: [],
    message:
      'Температура 38,0 °C и ниже — выраженная гипотермия. Согрейте теленка (сухое тепло, теплое помещение) и срочно вызовите ветеринарного специалиста.',
  },
  {
    id: 'rf-hypothermia-clinical',
    allOf: ['cold-calf'],
    anyOf: [],
    message:
      'Теленок холодный на ощупь и дрожит — возможна гипотермия. Согрейте его (сухое тепло, теплое помещение) и срочно обратитесь к ветеринарному специалисту.',
  },
  {
    id: 'rf-high-fever',
    allOf: ['temp-high-fever'],
    anyOf: [],
    message:
      'Температура 40,5 °C и выше — выраженная лихорадка. Нужен ветеринарный специалист немедленно.',
  },
  {
    id: 'rf-severe-dehydration',
    allOf: ['dehydration-severe'],
    anyOf: [],
    message:
      'Признаки выраженного обезвоживания (запавшие глаза, кожная складка не расправляется). Состояние может быстро ухудшаться — нужен ветеринарный специалист немедленно.',
  },
  {
    id: 'rf-rapid-deterioration',
    allOf: ['trend-rapid'],
    anyOf: [],
    message:
      'Состояние резко ухудшается за несколько часов. Не ждите — обратитесь к ветеринарному специалисту немедленно.',
  },
  {
    id: 'rf-bloody-diarrhea-systemic',
    allOf: ['stool-blood-noticeable'],
    anyOf: ['temp-fever', 'lethargy', 'dehydration-moderate', 'dehydration-severe'],
    message:
      'Заметная кровь в кале в сочетании с лихорадкой / угнетением / обезвоживанием. Нужен ветеринарный специалист немедленно. Соблюдайте гигиену рук — часть возбудителей диарей передается человеку.',
  },
  {
    id: 'rf-umbilical-sepsis',
    allOf: ['umb-discharge-purulent'],
    anyOf: ['lethargy', 'appetite-refusing', 'appetite-refusing-long', 'temp-fever'],
    message:
      'Гнойные выделения из пупка в сочетании с вялостью / отказом от молока / лихорадкой — возможное распространение инфекции. Нужен ветеринарный специалист немедленно.',
  },
  {
    id: 'rf-refusal-neonate',
    allOf: ['appetite-refusing-long'],
    anyOf: ['lethargy'],
    ageBands: ['d0-7'],
    message:
      'Новорожденный теленок длительно отказывается от молока и вялый — угроза истощения и гипогликемии. Нужен ветеринарный специалист немедленно.',
  },
];

/**
 * SEVERITY GATES — raise the triage floor independent of diagnostic scores.
 * Gates never LOWER a level set by red flags; they only guarantee a minimum.
 */
export const severityGates: SeverityGateDef[] = [
  {
    id: 'gate-moderate-dehydration',
    allOf: [],
    anyOf: ['dehydration-moderate'],
    floor: 'urgent',
    reason: 'Умеренное обезвоживание требует осмотра ветеринарным специалистом сегодня.',
  },
  {
    id: 'gate-mild-dehydration',
    allOf: [],
    anyOf: ['dehydration-mild'],
    floor: 'prompt',
    reason: 'Начальные признаки обезвоживания — осмотр в ближайшие 24–48 часов.',
  },
  {
    id: 'gate-blood-streaks',
    allOf: [],
    anyOf: ['stool-blood-streaks'],
    floor: 'urgent',
    reason: 'Примесь крови в кале требует осмотра сегодня.',
  },
  {
    id: 'gate-blood-noticeable',
    allOf: [],
    anyOf: ['stool-blood-noticeable'],
    floor: 'urgent',
    reason: 'Заметная кровь в кале требует осмотра сегодня.',
  },
  {
    id: 'gate-fever',
    allOf: [],
    anyOf: ['temp-fever'],
    floor: 'urgent',
    reason: 'Измеренная лихорадка — осмотр ветеринарным специалистом сегодня.',
  },
  {
    id: 'gate-refusal-long',
    allOf: [],
    anyOf: ['appetite-refusing-long'],
    floor: 'urgent',
    reason: 'Длительный отказ от молока/корма — осмотр сегодня.',
  },
  {
    id: 'gate-pen-deaths',
    allOf: [],
    anyOf: ['pen-deaths-yes'],
    floor: 'urgent',
    reason: 'Падеж телят в группе — риск вспышки, нужен осмотр и консультация сегодня.',
  },
  {
    id: 'gate-swollen-joint',
    allOf: [],
    anyOf: ['joint-one', 'joint-many'],
    floor: 'urgent',
    reason: 'Припухший болезненный сустав требует осмотра сегодня (риск септического артрита).',
  },
  {
    id: 'gate-rr-severe',
    allOf: [],
    anyOf: ['rr-severe'],
    floor: 'urgent',
    reason: 'Выраженное учащение дыхания — осмотр сегодня.',
  },
  {
    id: 'gate-rr-elevated',
    allOf: [],
    anyOf: ['rr-elevated'],
    floor: 'prompt',
    reason: 'Учащенное дыхание — осмотр в ближайшие 24–48 часов.',
  },
  {
    id: 'gate-umbilical-purulent',
    allOf: [],
    anyOf: ['umb-discharge-purulent'],
    floor: 'urgent',
    reason: 'Гнойные выделения из пупка — осмотр сегодня.',
  },
  {
    id: 'gate-tenesmus',
    allOf: [],
    anyOf: ['tenesmus'],
    floor: 'prompt',
    reason: 'Частое натуживание — осмотр в ближайшие 24–48 часов.',
  },
];

/** Triage levels, ordered from most to least severe. */
export const triageLevels: TriageLevelDef[] = [
  {
    id: 'emergency',
    label: 'Экстренно — помощь нужна сейчас',
    description:
      'Есть признаки, при которых состояние может ухудшаться необратимо за часы.',
    action:
      'Немедленно свяжитесь с ветеринарным специалистом. Обеспечьте теленку тепло, покой и безопасность. Не давайте никаких лекарств без назначения ветеринара.',
  },
  {
    id: 'urgent',
    label: 'Срочно — ветеринар нужен сегодня',
    description: 'Состояние требует осмотра и решения специалиста в тот же день.',
    action:
      'Свяжитесь с ветеринарным специалистом сегодня. До осмотра обеспечьте тепло и покой, наблюдайте за дыханием и поведением.',
  },
  {
    id: 'prompt',
    label: 'Планово — осмотр в течение 24–48 часов',
    description: 'Есть клинические признаки, которые требуют ветеринарного осмотра, но без немедленной угрозы.',
    action:
      'Запланируйте осмотр ветеринарным специалистом в ближайшие 1–2 дня. Следите за динамикой: при ухудшении обратитесь раньше.',
  },
  {
    id: 'monitor',
    label: 'Наблюдение — повторная оценка через 12–24 часа',
    description: 'Тревожных признаков не отмечено.',
    action:
      'Наблюдайте за теленком и повторите оценку через 12–24 часа. При любых изменениях к худшему — к ветеринарному специалисту.',
  },
];

/**
 * Static rule-out notes: shown contextually, never scored, never ranked.
 * They reduce the risk of tunnel vision without adding pseudo-precision.
 */
export const ruleOuts: RuleOutDef[] = [
  {
    id: 'ro-dermatophytosis',
    label: 'Дерматофития (лишай)',
    note: 'Возможный зооноз: мойте руки после контакта, ограничьте контакт детей с теленком. Подтверждение и лечение — у ветеринарного специалиста.',
    whenFindings: ['skin-patches'],
  },
  {
    id: 'ro-umbilical-hernia',
    label: 'Пупочная грыжа',
    note: 'Мягкая вправляемая припухлость без покраснения и боли чаще грыжа; отличить грыжу от омфалита должен ветеринарный специалист. Не вправляйте и не давите на припухлость.',
    whenFindings: ['umbilical-swelling'],
  },
  {
    id: 'ro-birth-injury',
    label: 'Родовая травма / асфиксия',
    note: 'Отеки головы и шеи, слабость и неврологические признаки у новорожденного после тяжелых родов могут быть следствием родовой травмы — теленка должен осмотреть ветеринарный специалист.',
    whenFindings: ['subcut-edema'],
  },
  {
    id: 'ro-noninfectious-conjunctivitis',
    label: 'Неинфекционное раздражение конъюнктивы',
    note: 'Слезотечение без мутности роговицы бывает от пыли и механического раздражения. Мутность роговицы или белое пятно — повод для осмотра в тот же день.',
    whenFindings: ['eye-one'],
  },
  {
    id: 'ro-hemorrhagic-enterotoxemia',
    label: 'Геморрагическая энтеротоксемия (C. perfringens) / AEEC',
    note: 'Кровавая диарея у телят первых дней–недель требует дифференциации с C. perfringens type B (геморрагическая энтеротоксемия — острое угнетение, кровавый стул, боль в животе у внешне здоровых телят первых дней жизни) и attaching-and-effacing E. coli (дизентерия с кровью и слизью, примерно 4 дня–2 месяца). Оба состояния могут развиваться быстро — нужен срочный осмотр ветеринарного специалиста. (Источник: Merck/MSD, Diarrhea in Neonatal Ruminants.)',
    whenFindings: ['stool-blood-noticeable'],
    ageBands: ['d0-7', 'd8-21', 'd22-42'],
  },
];
