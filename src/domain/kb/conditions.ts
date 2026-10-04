import type { ConditionDef } from '../types';

/**
 * Differential conditions / syndromes for the MVP (18 entries).
 *
 * Safety conventions:
 * - `ageWindow` is the TYPICAL onset window used for engineering gating;
 *   boundaries are approximate and marked for veterinary validation.
 * - `prior` is a small frequency tie-breaker for candidate ORDERING only —
 *   never displayed, never a probability.
 * - Each entry carries confidence + review status; all entries must pass
 *   the veterinary review checklist before status can become
 *   `vet-approved` (see docs/VETERINARY_REVIEW_CHECKLIST.md).
 */
export const conditions: ConditionDef[] = [
  {
    id: 'neonatal-septicemia',
    name: 'Неонатальная септицемия',
    category: 'neonatal',
    description:
      'Генерализованная бактериальная инфекция у телят первых дней жизни. Часто связана с недостаточным получением молозива (пассивного иммунитета) и инфекцией пупка. Проявляется выраженной вялостью, отказом от молока, гипотермией или лихорадкой.',
    ageWindow: { min: 0, max: 10 },
    confidence: 'commonly-recognized',
    zoonotic: false,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
  {
    id: 'omphalitis',
    name: 'Омфалит / инфекция пупочных структур',
    category: 'neonatal',
    description:
      'Воспаление пупочных структур: припухлость, болезненность, выделения из пупка, локальная горячая кожа. Может осложняться распространением инфекции (септицемия, перитонит, септический артрит).',
    ageWindow: { min: 0, max: 21 },
    confidence: 'commonly-recognized',
    zoonotic: false,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
  {
    id: 'joint-ill',
    name: 'Септический полиартрит («суставная болезнь»)',
    category: 'neonatal',
    description:
      'Бактериальное воспаление сустава (одного или нескольких): припухлость, горячая болезненность, хромота, отказ от движения. Часто ассоциировано с инфекцией пупка или неонатальной септицемией.',
    ageWindow: { min: 0, max: 35 },
    confidence: 'commonly-recognized',
    zoonotic: false,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
  {
    id: 'colibacillosis',
    name: 'Колибактериоз (ЭТЭК, диарея новорожденных)',
    category: 'diarrhea',
    description:
      'Диарея первых дней жизни, вызванная энтеротоксигенными штаммами E. coli. Характерны водянистый стул, быстрое обезвоживание, вялость; обычно без лихорадки.',
    ageWindow: { min: 0, max: 7 },
    confidence: 'well-established',
    zoonotic: false,
    prior: 1,
    reviewStatus: 'pending-review',
  },
  {
    id: 'rota-corona',
    name: 'Ротавирусная / коронавирусная диарея',
    category: 'diarrhea',
    description:
      'Вирусные диареи второй недели жизни: водянистый стул, вялость, быстрое развитие обезвоживания. Рассматриваются как синдромальная группа.',
    ageWindow: { min: 3, max: 28 },
    confidence: 'well-established',
    zoonotic: false,
    prior: 1,
    reviewStatus: 'pending-review',
  },
  {
    id: 'cryptosporidiosis',
    name: 'Криптоспоридиоз',
    category: 'diarrhea',
    description:
      'Протозойная диарея второй-третьей недели жизни: длительный водянистый стул, выраженное обезвоживание, потеря веса. ВАЖНО: возбудитель передается человеку — строго соблюдайте гигиену рук.',
    ageWindow: { min: 5, max: 30 },
    confidence: 'well-established',
    zoonotic: true,
    prior: 1,
    reviewStatus: 'pending-review',
  },
  {
    id: 'salmonellosis',
    name: 'Сальмонеллез',
    category: 'diarrhea',
    description:
      'Бактериальная диарея с лихорадкой, угнетением, часто с кровью и слизью в кале, возможна септицемия. Потенциально опасное течение. ВАЖНО: возбудитель передается человеку — строго соблюдайте гигиену.',
    // Merck: «usually is not seen in calves < 14 days old»; серовары Typhimurium/Dublin у телят 2–12 недель
    ageWindow: { min: 14, max: 180 },
    confidence: 'well-established',
    zoonotic: true,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
  {
    id: 'noninfectious-diarrhea',
    name: 'Диарея неинфекционного / кормового происхождения',
    category: 'diarrhea',
    description:
      'Диарея, связанная с кормлением (перекорм, ошибки разведения ЗЦМ, резкая смена корма) и стрессом. Обычно без лихорадки, кровь в кале не характерна, общее состояние страдает меньше.',
    // Merck: неосложненная кормовая диарея «seen in calves < 3 weeks old»
    ageWindow: { min: 0, max: 21 },
    confidence: 'commonly-recognized',
    zoonotic: false,
    prior: 1,
    reviewStatus: 'pending-review',
  },
  {
    id: 'dehydration-syndrome',
    name: 'Обезвоживание и электролитные нарушения',
    category: 'metabolic',
    description:
      'Синдром, осложняющий диарею и другие потери жидкости: сухость пасти, снижение эластичности кожи, запавшие глаза, редкое мочеиспускание. Степень обезвоживания определяет срочность обращения.',
    ageWindow: { min: 0, max: 180 },
    confidence: 'well-established',
    zoonotic: false,
    prior: 1,
    reviewStatus: 'pending-review',
  },
  {
    id: 'hypoglycemia',
    name: 'Гипогликемия / энергетический дефицит новорожденного',
    category: 'neonatal',
    description:
      'Дефицит энергии у новорожденных: слабое сосание или отказ от молока, вялость, тремор, снижение температуры тела. Чаще при недостаточном молозиве/молоке и холодовой нагрузке.',
    ageWindow: { min: 0, max: 7 },
    confidence: 'commonly-recognized',
    zoonotic: false,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
  {
    id: 'hypothermia',
    name: 'Гипотермия новорожденного',
    category: 'metabolic',
    description:
      'Переохлаждение: температура тела ниже нормы, холодные уши и конечности, дрожь, вялость, слабое сосание. Риск выше у мокрых, ослабленных телят и в холодных сырых помещениях.',
    ageWindow: { min: 0, max: 30 },
    confidence: 'well-established',
    zoonotic: false,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
  {
    id: 'brd',
    name: 'Респираторный комплекс телят (BRD-подобный синдром)',
    category: 'respiratory',
    description:
      'Многофакторные респираторные болезни телят (бактериальные агенты — Mannheimia, Pasteurella, Histophilus и др. на фоне стрессов и плохой вентиляции): кашель, выделения из носа, учащенное дыхание, лихорадка, угнетение.',
    ageWindow: { min: 21, max: 180 },
    confidence: 'well-established',
    zoonotic: false,
    prior: 1,
    reviewStatus: 'pending-review',
  },
  {
    id: 'mycoplasma',
    name: 'Микоплазменная инфекция (пневмония / артрит / отит)',
    category: 'respiratory',
    description:
      'Инфекция, которая может сочетать респираторные признаки с припухшими суставами и/или опущенным ухом с наклоном головы. Подтверждается только специалистом.',
    ageWindow: { min: 21, max: 180 },
    confidence: 'commonly-recognized',
    zoonotic: false,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
  {
    id: 'ibk',
    name: 'Инфекционный кератоконъюнктивит',
    category: 'ocular',
    description:
      'Поражение глаз: слезотечение, прищуривание, мутность роговицы или белое пятно, чаще на одном глазу. Распространению способствуют мухи и скученность.',
    ageWindow: { min: 14, max: 180 },
    confidence: 'commonly-recognized',
    zoonotic: false,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
  {
    id: 'coccidiosis',
    name: 'Кокцидиоз',
    category: 'diarrhea',
    description:
      'Протозойная кишечная инфекция телят старше 3 недель: кал со слизью, часто с кровью, натуживание (тенезмы), отставание в росте. Пик в возрасте 1–6 месяцев.',
    ageWindow: { min: 21, max: 180 },
    confidence: 'well-established',
    zoonotic: false,
    prior: 1,
    reviewStatus: 'pending-review',
  },
  {
    id: 'abomasal-bloat',
    name: 'Абомазальное вздутие (у молочных телят)',
    category: 'gi',
    description:
      'Острое вздутие сычуга у молочных телят: весь живот увеличен и напряжен, резкое ухудшение за часы, беспокойство или угнетение. Состояние может быстро становиться жизнеугрожающим.',
    ageWindow: { min: 0, max: 30 },
    confidence: 'commonly-recognized',
    zoonotic: false,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
  {
    id: 'rumen-tympany',
    name: 'Тимпания рубца',
    category: 'gi',
    description:
      'Вздутие рубца у телят, получающих объемистые корма: выпирание области левого бока (голодной ямки), беспокойство. Более актуально после развития рубца.',
    ageWindow: { min: 30, max: 180 },
    confidence: 'commonly-recognized',
    zoonotic: false,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
  {
    id: 'neuro-syndrome',
    name: 'Неврологический синдром (менингит / метаболические судороги)',
    category: 'neurologic',
    description:
      'Судороги, запрокидывание головы, ступор у телят первых недель. Возможные механизмы включают неонатальный менингит (на фоне септицемии) и метаболические нарушения; причину определяет только ветеринарный специалист.',
    ageWindow: { min: 0, max: 30 },
    confidence: 'commonly-recognized',
    zoonotic: false,
    prior: 0.5,
    reviewStatus: 'pending-review',
  },
];
