import type { AssociationDef, InteractionDef } from '../types';

/**
 * Associations: finding → condition with weight (1 weak … 5 strong) and
 * direction. Weights are EXPERT ESTIMATES for a deterministic engine —
 * they are not probabilities and are not displayed as such.
 *
 * Conventions:
 * - `against` associations fire only on EXPLICIT negative answers
 *   (`::no` findings and «нет» options) — never on unanswered questions.
 * - `ageMultipliers` (where present) scale supporting weights per age band;
 *   hard age gating is done by the condition's ageWindow, not here.
 * - `note` is for veterinary reviewers only.
 */
export const associations: AssociationDef[] = [
  /* ---------- neonatal septicemia (0–10 d) ---------- */
  { conditionId: 'neonatal-septicemia', finding: 'lethargy', direction: 'supporting', weight: 3 },
  { conditionId: 'neonatal-septicemia', finding: 'appetite-refusing', direction: 'supporting', weight: 2 },
  { conditionId: 'neonatal-septicemia', finding: 'appetite-refusing-long', direction: 'supporting', weight: 3 },
  { conditionId: 'neonatal-septicemia', finding: 'temp-hypothermia', direction: 'supporting', weight: 3 },
  { conditionId: 'neonatal-septicemia', finding: 'cold-calf', direction: 'supporting', weight: 2 },
  { conditionId: 'neonatal-septicemia', finding: 'temp-fever', direction: 'supporting', weight: 3 },
  { conditionId: 'neonatal-septicemia', finding: 'tremor', direction: 'supporting', weight: 2 },
  { conditionId: 'neonatal-septicemia', finding: 'seizures', direction: 'supporting', weight: 2 },
  { conditionId: 'neonatal-septicemia', finding: 'unresponsive', direction: 'supporting', weight: 3 },
  {
    conditionId: 'neonatal-septicemia',
    finding: 'umb-discharge-purulent',
    direction: 'supporting',
    weight: 3,
    note: 'омфалогенный путь септицемии',
  },
  { conditionId: 'neonatal-septicemia', finding: 'umbilical-swelling', direction: 'supporting', weight: 1 },
  { conditionId: 'neonatal-septicemia', finding: 'joint-one', direction: 'supporting', weight: 2 },
  { conditionId: 'neonatal-septicemia', finding: 'joint-many', direction: 'supporting', weight: 3 },
  {
    conditionId: 'neonatal-septicemia',
    finding: 'colostrum-none',
    direction: 'supporting',
    weight: 3,
    note: 'провал пассивного иммунитета — ключевой фактор риска',
  },
  { conditionId: 'neonatal-septicemia', finding: 'colostrum-uncertain', direction: 'supporting', weight: 2 },
  { conditionId: 'neonatal-septicemia', finding: 'dehydration-severe', direction: 'supporting', weight: 2 },

  /* ---------- omphalitis (0–21 d) ---------- */
  { conditionId: 'omphalitis', finding: 'umbilical-swelling', direction: 'supporting', weight: 4 },
  { conditionId: 'omphalitis', finding: 'umb-discharge-moist', direction: 'supporting', weight: 3 },
  { conditionId: 'omphalitis', finding: 'umb-discharge-purulent', direction: 'supporting', weight: 4 },
  { conditionId: 'omphalitis', finding: 'umbilical-hot', direction: 'supporting', weight: 4 },
  { conditionId: 'omphalitis', finding: 'lethargy', direction: 'supporting', weight: 1 },
  {
    conditionId: 'omphalitis',
    finding: 'umb-discharge-no',
    direction: 'against',
    weight: 3,
    note: 'явно чистый пупок против инфекционного омфалита',
  },

  /* ---------- joint ill (0–35 d) ---------- */
  { conditionId: 'joint-ill', finding: 'joint-one', direction: 'supporting', weight: 5 },
  { conditionId: 'joint-ill', finding: 'joint-many', direction: 'supporting', weight: 5 },
  { conditionId: 'joint-ill', finding: 'limping', direction: 'supporting', weight: 3 },
  { conditionId: 'joint-ill', finding: 'stiff-rising', direction: 'supporting', weight: 2 },
  { conditionId: 'joint-ill', finding: 'temp-fever', direction: 'supporting', weight: 2 },
  { conditionId: 'joint-ill', finding: 'lethargy', direction: 'supporting', weight: 1 },
  {
    conditionId: 'joint-ill',
    finding: 'umb-discharge-purulent',
    direction: 'supporting',
    weight: 2,
    note: 'ассоциация с пупочной инфекцией',
  },
  { conditionId: 'joint-ill', finding: 'joint-no', direction: 'against', weight: 4 },

  /* ---------- colibacillosis ETEC (0–7 d) ---------- */
  { conditionId: 'colibacillosis', finding: 'diarrhea-watery', direction: 'supporting', weight: 4 },
  { conditionId: 'colibacillosis', finding: 'diarrhea-pasty', direction: 'supporting', weight: 1 },
  { conditionId: 'colibacillosis', finding: 'stool-freq-elevated', direction: 'supporting', weight: 2 },
  { conditionId: 'colibacillosis', finding: 'stool-freq-high', direction: 'supporting', weight: 3 },
  { conditionId: 'colibacillosis', finding: 'lethargy', direction: 'supporting', weight: 2 },
  { conditionId: 'colibacillosis', finding: 'dehydration-mild', direction: 'supporting', weight: 3 },
  { conditionId: 'colibacillosis', finding: 'dehydration-moderate', direction: 'supporting', weight: 3 },
  { conditionId: 'colibacillosis', finding: 'dehydration-severe', direction: 'supporting', weight: 2 },
  { conditionId: 'colibacillosis', finding: 'appetite-refusing', direction: 'supporting', weight: 1 },
  { conditionId: 'colibacillosis', finding: 'temp-hypothermia', direction: 'supporting', weight: 1 },
  { conditionId: 'colibacillosis', finding: 'colostrum-none', direction: 'supporting', weight: 2 },
  { conditionId: 'colibacillosis', finding: 'colostrum-uncertain', direction: 'supporting', weight: 1 },
  { conditionId: 'colibacillosis', finding: 'diarrhea-no', direction: 'against', weight: 4 },
  {
    conditionId: 'colibacillosis',
    finding: 'stool-blood-noticeable',
    direction: 'against',
    weight: 2,
    note: 'кровь менее характерна для ЭТЭК',
  },
  {
    conditionId: 'colibacillosis',
    finding: 'temp-fever',
    direction: 'against',
    weight: 1,
    note: 'ЭТЭК обычно протекает без лихорадки',
  },

  /* ---------- rota / corona (3–28 d) ---------- */
  { conditionId: 'rota-corona', finding: 'diarrhea-watery', direction: 'supporting', weight: 4 },
  { conditionId: 'rota-corona', finding: 'stool-freq-elevated', direction: 'supporting', weight: 2 },
  { conditionId: 'rota-corona', finding: 'stool-freq-high', direction: 'supporting', weight: 3 },
  { conditionId: 'rota-corona', finding: 'lethargy', direction: 'supporting', weight: 2 },
  { conditionId: 'rota-corona', finding: 'dehydration-mild', direction: 'supporting', weight: 3 },
  { conditionId: 'rota-corona', finding: 'dehydration-moderate', direction: 'supporting', weight: 3 },
  { conditionId: 'rota-corona', finding: 'dehydration-severe', direction: 'supporting', weight: 2 },
  { conditionId: 'rota-corona', finding: 'appetite-reduced', direction: 'supporting', weight: 1 },
  {
    conditionId: 'rota-corona',
    finding: 'stool-mucus',
    direction: 'supporting',
    weight: 1,
    note: 'Merck: фекалии при ротавирусной диарее часто содержат много слизи',
  },
  { conditionId: 'rota-corona', finding: 'appetite-refusing', direction: 'supporting', weight: 1 },
  { conditionId: 'rota-corona', finding: 'colostrum-uncertain', direction: 'supporting', weight: 1 },
  { conditionId: 'rota-corona', finding: 'diarrhea-no', direction: 'against', weight: 4 },
  { conditionId: 'rota-corona', finding: 'stool-blood-noticeable', direction: 'against', weight: 1 },

  /* ---------- cryptosporidiosis (5–30 d) ---------- */
  {
    conditionId: 'cryptosporidiosis',
    finding: 'diarrhea-watery',
    direction: 'supporting',
    weight: 4,
    ageMultipliers: { 'd8-21': 1.25 },
  },
  { conditionId: 'cryptosporidiosis', finding: 'stool-freq-high', direction: 'supporting', weight: 3 },
  { conditionId: 'cryptosporidiosis', finding: 'stool-freq-elevated', direction: 'supporting', weight: 2 },
  { conditionId: 'cryptosporidiosis', finding: 'lethargy', direction: 'supporting', weight: 2 },
  { conditionId: 'cryptosporidiosis', finding: 'dehydration-mild', direction: 'supporting', weight: 2 },
  { conditionId: 'cryptosporidiosis', finding: 'dehydration-moderate', direction: 'supporting', weight: 3 },
  {
    conditionId: 'cryptosporidiosis',
    finding: 'dehydration-severe',
    direction: 'supporting',
    weight: 3,
    note: 'криптоспоридиоз часто дает выраженное обезвоживание',
  },
  { conditionId: 'cryptosporidiosis', finding: 'stool-mucus', direction: 'supporting', weight: 1 },
  { conditionId: 'cryptosporidiosis', finding: 'duration-3-7d', direction: 'supporting', weight: 1 },
  {
    conditionId: 'cryptosporidiosis',
    finding: 'duration-gt7d',
    direction: 'supporting',
    weight: 1,
    note: 'длительная персистирующая диарея',
  },
  { conditionId: 'cryptosporidiosis', finding: 'poor-gain', direction: 'supporting', weight: 1 },
  { conditionId: 'cryptosporidiosis', finding: 'contact-sick-yes', direction: 'supporting', weight: 1 },
  { conditionId: 'cryptosporidiosis', finding: 'housing-group', direction: 'supporting', weight: 1 },
  { conditionId: 'cryptosporidiosis', finding: 'diarrhea-no', direction: 'against', weight: 4 },
  { conditionId: 'cryptosporidiosis', finding: 'temp-high-fever', direction: 'against', weight: 1 },

  /* ---------- salmonellosis (3–180 d) ---------- */
  { conditionId: 'salmonellosis', finding: 'temp-fever', direction: 'supporting', weight: 4 },
  { conditionId: 'salmonellosis', finding: 'temp-high-fever', direction: 'supporting', weight: 1 },
  {
    conditionId: 'salmonellosis',
    finding: 'stool-blood-noticeable',
    direction: 'supporting',
    weight: 4,
  },
  { conditionId: 'salmonellosis', finding: 'stool-blood-streaks', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'diarrhea-watery', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'diarrhea-pasty', direction: 'supporting', weight: 1 },
  { conditionId: 'salmonellosis', finding: 'stool-mucus', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'stool-freq-elevated', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'stool-freq-high', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'lethargy', direction: 'supporting', weight: 3 },
  { conditionId: 'salmonellosis', finding: 'dehydration-moderate', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'dehydration-severe', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'trend-rapid', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'contact-sick-yes', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'pen-deaths-yes', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'appetite-refusing', direction: 'supporting', weight: 2 },
  { conditionId: 'salmonellosis', finding: 'diarrhea-no', direction: 'against', weight: 3 },
  { conditionId: 'salmonellosis', finding: 'temp-normal', direction: 'against', weight: 2 },

  /* ---------- noninfectious / dietary diarrhea (0–90 d) ---------- */
  { conditionId: 'noninfectious-diarrhea', finding: 'diarrhea-watery', direction: 'supporting', weight: 3 },
  { conditionId: 'noninfectious-diarrhea', finding: 'diarrhea-pasty', direction: 'supporting', weight: 2 },
  { conditionId: 'noninfectious-diarrhea', finding: 'stool-freq-elevated', direction: 'supporting', weight: 2 },
  { conditionId: 'noninfectious-diarrhea', finding: 'feeding-milk-replacer', direction: 'supporting', weight: 2 },
  { conditionId: 'noninfectious-diarrhea', finding: 'feeding-whole-milk', direction: 'supporting', weight: 1 },
  { conditionId: 'noninfectious-diarrhea', finding: 'appetite-reduced', direction: 'supporting', weight: 1 },
  {
    conditionId: 'noninfectious-diarrhea',
    finding: 'lethargy',
    direction: 'against',
    weight: 1,
    note: 'Merck: при неосложненной кормовой диарее телята изначально активны (needs-veterinary-review)',
  },
  { conditionId: 'noninfectious-diarrhea', finding: 'dehydration-mild', direction: 'supporting', weight: 1 },
  {
    conditionId: 'noninfectious-diarrhea',
    finding: 'temp-fever',
    direction: 'against',
    weight: 3,
    note: 'лихорадка указывает на инфекционную причину',
  },
  {
    conditionId: 'noninfectious-diarrhea',
    finding: 'stool-blood-noticeable',
    direction: 'against',
    weight: 3,
  },
  { conditionId: 'noninfectious-diarrhea', finding: 'stool-blood-streaks', direction: 'against', weight: 2 },
  { conditionId: 'noninfectious-diarrhea', finding: 'stool-mucus', direction: 'against', weight: 1 },
  {
    conditionId: 'noninfectious-diarrhea',
    finding: 'dehydration-severe',
    direction: 'against',
    weight: 2,
    note: 'выраженное обезвоживание характернее для инфекционных диарей',
  },

  /* ---------- dehydration syndrome (0–180 d) ---------- */
  { conditionId: 'dehydration-syndrome', finding: 'dehydration-mild', direction: 'supporting', weight: 4 },
  { conditionId: 'dehydration-syndrome', finding: 'dehydration-moderate', direction: 'supporting', weight: 5 },
  { conditionId: 'dehydration-syndrome', finding: 'dehydration-severe', direction: 'supporting', weight: 5 },
  { conditionId: 'dehydration-syndrome', finding: 'diarrhea-watery', direction: 'supporting', weight: 2 },
  { conditionId: 'dehydration-syndrome', finding: 'diarrhea-pasty', direction: 'supporting', weight: 1 },
  { conditionId: 'dehydration-syndrome', finding: 'stool-freq-elevated', direction: 'supporting', weight: 1 },
  { conditionId: 'dehydration-syndrome', finding: 'stool-freq-high', direction: 'supporting', weight: 2 },
  { conditionId: 'dehydration-syndrome', finding: 'urine-rare', direction: 'supporting', weight: 2 },
  { conditionId: 'dehydration-syndrome', finding: 'urine-none', direction: 'supporting', weight: 3 },
  { conditionId: 'dehydration-syndrome', finding: 'appetite-refusing', direction: 'supporting', weight: 2 },
  { conditionId: 'dehydration-syndrome', finding: 'lethargy', direction: 'supporting', weight: 2 },
  { conditionId: 'dehydration-syndrome', finding: 'dehydration-none', direction: 'against', weight: 3 },

  /* ---------- hypoglycemia / energy deficit (0–7 d) ---------- */
  { conditionId: 'hypoglycemia', finding: 'appetite-refusing', direction: 'supporting', weight: 3 },
  { conditionId: 'hypoglycemia', finding: 'appetite-refusing-long', direction: 'supporting', weight: 2 },
  { conditionId: 'hypoglycemia', finding: 'lethargy', direction: 'supporting', weight: 3 },
  { conditionId: 'hypoglycemia', finding: 'tremor', direction: 'supporting', weight: 3 },
  { conditionId: 'hypoglycemia', finding: 'cold-calf', direction: 'supporting', weight: 2 },
  { conditionId: 'hypoglycemia', finding: 'temp-hypothermia', direction: 'supporting', weight: 2 },
  { conditionId: 'hypoglycemia', finding: 'seizures', direction: 'supporting', weight: 2 },
  { conditionId: 'hypoglycemia', finding: 'recumbent', direction: 'supporting', weight: 1 },
  { conditionId: 'hypoglycemia', finding: 'colostrum-none', direction: 'supporting', weight: 2 },
  { conditionId: 'hypoglycemia', finding: 'appetite-normal', direction: 'against', weight: 2 },

  /* ---------- hypothermia (0–30 d) ---------- */
  { conditionId: 'hypothermia', finding: 'temp-hypothermia', direction: 'supporting', weight: 5 },
  { conditionId: 'hypothermia', finding: 'cold-calf', direction: 'supporting', weight: 4 },
  { conditionId: 'hypothermia', finding: 'tremor', direction: 'supporting', weight: 2 },
  { conditionId: 'hypothermia', finding: 'lethargy', direction: 'supporting', weight: 2 },
  { conditionId: 'hypothermia', finding: 'appetite-refusing', direction: 'supporting', weight: 1 },
  { conditionId: 'hypothermia', finding: 'recumbent', direction: 'supporting', weight: 1 },
  { conditionId: 'hypothermia', finding: 'bedding-wet', direction: 'supporting', weight: 1 },
  { conditionId: 'hypothermia', finding: 'temp-normal', direction: 'against', weight: 2 },

  /* ---------- BRD complex (21–180 d) ---------- */
  { conditionId: 'brd', finding: 'cough-frequent', direction: 'supporting', weight: 4 },
  { conditionId: 'brd', finding: 'cough-rare', direction: 'supporting', weight: 2 },
  { conditionId: 'brd', finding: 'nasal-purulent', direction: 'supporting', weight: 4 },
  { conditionId: 'brd', finding: 'nasal-serous', direction: 'supporting', weight: 2 },
  { conditionId: 'brd', finding: 'rr-elevated', direction: 'supporting', weight: 4 },
  { conditionId: 'brd', finding: 'rr-severe', direction: 'supporting', weight: 2 },
  { conditionId: 'brd', finding: 'temp-fever', direction: 'supporting', weight: 3 },
  { conditionId: 'brd', finding: 'temp-high-fever', direction: 'supporting', weight: 1 },
  { conditionId: 'brd', finding: 'loud-breathing', direction: 'supporting', weight: 3 },
  { conditionId: 'brd', finding: 'open-mouth', direction: 'supporting', weight: 2 },
  { conditionId: 'brd', finding: 'lethargy', direction: 'supporting', weight: 2 },
  { conditionId: 'brd', finding: 'appetite-reduced', direction: 'supporting', weight: 2 },
  { conditionId: 'brd', finding: 'appetite-refusing', direction: 'supporting', weight: 2 },
  { conditionId: 'brd', finding: 'ventilation-poor', direction: 'supporting', weight: 1 },
  { conditionId: 'brd', finding: 'housing-group', direction: 'supporting', weight: 1 },
  { conditionId: 'brd', finding: 'contact-sick-yes', direction: 'supporting', weight: 2 },
  { conditionId: 'brd', finding: 'duration-3-7d', direction: 'supporting', weight: 1 },
  { conditionId: 'brd', finding: 'cough-no', direction: 'against', weight: 3 },
  { conditionId: 'brd', finding: 'nasal-no', direction: 'against', weight: 2 },
  { conditionId: 'brd', finding: 'temp-normal', direction: 'against', weight: 1 },

  /* ---------- mycoplasma (21–180 d) ---------- */
  {
    conditionId: 'mycoplasma',
    finding: 'droopy-ear',
    direction: 'supporting',
    weight: 4,
    note: 'отит-паттерн Mycoplasma bovis',
  },
  { conditionId: 'mycoplasma', finding: 'joint-one', direction: 'supporting', weight: 3 },
  { conditionId: 'mycoplasma', finding: 'joint-many', direction: 'supporting', weight: 3 },
  { conditionId: 'mycoplasma', finding: 'cough-frequent', direction: 'supporting', weight: 2 },
  { conditionId: 'mycoplasma', finding: 'cough-rare', direction: 'supporting', weight: 1 },
  { conditionId: 'mycoplasma', finding: 'nasal-purulent', direction: 'supporting', weight: 3 },
  { conditionId: 'mycoplasma', finding: 'temp-fever', direction: 'supporting', weight: 2 },
  { conditionId: 'mycoplasma', finding: 'rr-elevated', direction: 'supporting', weight: 2 },
  { conditionId: 'mycoplasma', finding: 'lethargy', direction: 'supporting', weight: 1 },
  { conditionId: 'mycoplasma', finding: 'joint-no', direction: 'against', weight: 2 },
  { conditionId: 'mycoplasma', finding: 'nasal-no', direction: 'against', weight: 1 },

  /* ---------- IBK (14–180 d) ---------- */
  { conditionId: 'ibk', finding: 'eye-one', direction: 'supporting', weight: 4 },
  { conditionId: 'ibk', finding: 'eye-both', direction: 'supporting', weight: 5 },
  { conditionId: 'ibk', finding: 'eye-no', direction: 'against', weight: 4 },

  /* ---------- coccidiosis (21–180 d) ---------- */
  {
    conditionId: 'coccidiosis',
    finding: 'tenesmus',
    direction: 'supporting',
    weight: 4,
    note: 'тенезмы — характерный признак кокцидиоза',
  },
  { conditionId: 'coccidiosis', finding: 'stool-blood-noticeable', direction: 'supporting', weight: 3 },
  { conditionId: 'coccidiosis', finding: 'stool-blood-streaks', direction: 'supporting', weight: 2 },
  { conditionId: 'coccidiosis', finding: 'stool-mucus', direction: 'supporting', weight: 3 },
  { conditionId: 'coccidiosis', finding: 'stool-freq-elevated', direction: 'supporting', weight: 2 },
  { conditionId: 'coccidiosis', finding: 'lethargy', direction: 'supporting', weight: 2 },
  { conditionId: 'coccidiosis', finding: 'poor-gain', direction: 'supporting', weight: 2 },
  { conditionId: 'coccidiosis', finding: 'dehydration-mild', direction: 'supporting', weight: 2 },
  { conditionId: 'coccidiosis', finding: 'dehydration-moderate', direction: 'supporting', weight: 1 },
  { conditionId: 'coccidiosis', finding: 'housing-group', direction: 'supporting', weight: 1 },
  { conditionId: 'coccidiosis', finding: 'duration-gt7d', direction: 'supporting', weight: 1 },
  { conditionId: 'coccidiosis', finding: 'diarrhea-no', direction: 'against', weight: 3 },

  /* ---------- abomasal bloat (0–30 d) ---------- */
  {
    conditionId: 'abomasal-bloat',
    finding: 'distension-whole',
    direction: 'supporting',
    weight: 4,
  },
  { conditionId: 'abomasal-bloat', finding: 'distension-left', direction: 'supporting', weight: 1 },
  { conditionId: 'abomasal-bloat', finding: 'feeding-milk-replacer', direction: 'supporting', weight: 2 },
  { conditionId: 'abomasal-bloat', finding: 'feeding-whole-milk', direction: 'supporting', weight: 1 },
  { conditionId: 'abomasal-bloat', finding: 'regurgitation', direction: 'supporting', weight: 2 },
  { conditionId: 'abomasal-bloat', finding: 'lethargy', direction: 'supporting', weight: 1 },
  { conditionId: 'abomasal-bloat', finding: 'appetite-refusing', direction: 'supporting', weight: 2 },
  { conditionId: 'abomasal-bloat', finding: 'trend-rapid', direction: 'supporting', weight: 2 },
  { conditionId: 'abomasal-bloat', finding: 'distension-no', direction: 'against', weight: 4 },

  /* ---------- rumen tympany (30–180 d) ---------- */
  {
    conditionId: 'rumen-tympany',
    finding: 'distension-left',
    direction: 'supporting',
    weight: 5,
    note: 'выпирание голодной ямки — классический признак тимпании рубца',
  },
  { conditionId: 'rumen-tympany', finding: 'feeding-hay', direction: 'supporting', weight: 2 },
  { conditionId: 'rumen-tympany', finding: 'feeding-starter', direction: 'supporting', weight: 1 },
  { conditionId: 'rumen-tympany', finding: 'lethargy', direction: 'supporting', weight: 1 },
  { conditionId: 'rumen-tympany', finding: 'appetite-reduced', direction: 'supporting', weight: 1 },
  { conditionId: 'rumen-tympany', finding: 'distension-no', direction: 'against', weight: 4 },

  /* ---------- neurologic syndrome (0–30 d) ---------- */
  { conditionId: 'neuro-syndrome', finding: 'seizures', direction: 'supporting', weight: 4 },
  { conditionId: 'neuro-syndrome', finding: 'opisthotonus', direction: 'supporting', weight: 4 },
  { conditionId: 'neuro-syndrome', finding: 'unresponsive', direction: 'supporting', weight: 4 },
  { conditionId: 'neuro-syndrome', finding: 'ataxia', direction: 'supporting', weight: 3 },
  { conditionId: 'neuro-syndrome', finding: 'tremor', direction: 'supporting', weight: 2 },
  { conditionId: 'neuro-syndrome', finding: 'temp-fever', direction: 'supporting', weight: 2 },
  {
    conditionId: 'neuro-syndrome',
    finding: 'umb-discharge-purulent',
    direction: 'supporting',
    weight: 2,
    note: 'менингит на фоне омфалогенного сепсиса',
  },
  { conditionId: 'neuro-syndrome', finding: 'colostrum-none', direction: 'supporting', weight: 2 },
  { conditionId: 'neuro-syndrome', finding: 'lethargy', direction: 'supporting', weight: 1 },
];

/**
 * Additive interaction rules: all findings present → bonus to the condition.
 * Kept few and clinically meaningful; each carries a note for reviewers.
 */
export const interactions: InteractionDef[] = [
  {
    id: 'int-salmonella-triad',
    conditionId: 'salmonellosis',
    allOf: ['temp-fever', 'stool-blood-noticeable', 'lethargy'],
    bonus: 3,
    note: 'лихорадка + кровавый стул + угнетение — типичная картина сальмонеллеза',
  },
  {
    id: 'int-crypto-outbreak',
    conditionId: 'cryptosporidiosis',
    allOf: ['diarrhea-watery', 'housing-group', 'contact-sick-yes'],
    bonus: 2,
    note: 'групповая диарея с контактом — вспышечный паттерн (требует проверки)',
  },
  {
    id: 'int-brd-classic',
    conditionId: 'brd',
    allOf: ['cough-frequent', 'nasal-purulent', 'temp-fever'],
    bonus: 2,
    note: 'кашель + гнойные выделения + лихорадка',
  },
  {
    id: 'int-mycoplasma-triad',
    conditionId: 'mycoplasma',
    allOf: ['droopy-ear', 'joint-one', 'nasal-purulent'],
    bonus: 3,
    note: 'отит + артрит + респираторные признаки (требует проверки)',
  },
  {
    id: 'int-sepsis-umbilical',
    conditionId: 'neonatal-septicemia',
    allOf: ['umb-discharge-purulent', 'lethargy'],
    bonus: 2,
    note: 'пупочная инфекция с системными признаками',
  },
  {
    id: 'int-hypoglycemia-neonate',
    conditionId: 'hypoglycemia',
    allOf: ['appetite-refusing', 'tremor'],
    bonus: 2,
    note: 'отказ от молока + тремор у новорожденного',
  },
  {
    id: 'int-coccidia-tenesmus',
    conditionId: 'coccidiosis',
    allOf: ['tenesmus', 'stool-mucus'],
    bonus: 2,
    note: 'тенезмы + слизь',
  },
];
