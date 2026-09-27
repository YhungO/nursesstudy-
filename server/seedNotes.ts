import { StudyNote } from './db.ts';

export const SEED_STUDY_NOTES: StudyNote[] = [
  {
    id: 'note-endocrine-anatomy',
    subjectId: 'subj-anatomy',
    subjectName: 'Anatomy',
    subjectColor: 'teal',
    levelId: 'lvl-nd1',
    title: 'Endocrine Glands: Structural Organization & Hypothalamic-Pituitary Axis',
    topic: 'Endocrine System',
    summary: 'Comprehensive anatomical review of ductless glands, pituitary portal system, adenohypophysis, and neurohypophysis.',
    readingTime: 6,
    status: 'published',
    isPublished: true,
    publishedAt: '2026-01-15T08:00:00.000Z',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
    keyPoints: [
      'The endocrine system regulates slow, long-term processes such as growth, metabolic basal rates, and electrolyte homeostasis.',
      'Endocrine glands are ductless, releasing secretions straight into fenestrated capillaries.',
      'The pituitary gland rests inside the hypophyseal fossa of the sphenoid bone (sella turcica).',
      'The anterior lobe (adenohypophysis) communicates with the hypothalamus via the hypophyseal portal vascular system.',
      'The posterior lobe (neurohypophysis) stores and releases Oxytocin and Antidiuretic Hormone (ADH) synthesized by hypothalamic nuclei.'
    ],
    clinicalPearls: [
      'Accidental removal or ischemic trauma to parathyroid glands during thyroidectomy causes acute hypocalcemia with positive Chvostek and Trousseau signs.',
      'Patients with pituitary macroadenomas frequently present with bitemporal hemianopsia due to compression of the optic chiasm located immediately superior to the sella turcica.',
      'In diabetes insipidus resulting from head injury to the posterior pituitary stalk, urine output can exceed 10 to 15 liters daily with specific gravity < 1.005.'
    ],
    content: `## Structural Organization of the Endocrine System

Unlike exocrine glands that discharge their secretions via specialized epithelial ducts, endocrine glands are **ductless**. They possess rich capillary networks where synthesized chemical messengers (hormones) enter systemic circulation directly.

### The Hypothalamic-Pituitary Axis

The hypothalamus acts as the chief command center linking the nervous system to the endocrine apparatus. It regulates pituitary secretion via two distinct anatomical pathways:

1. **Hypophyseal Portal System:** Specialized venous plexus carrying hypothalamic releasing hormones (TRH, CRH, GnRH, GHRH) directly to sinusoidal capillaries of the **adenohypophysis (anterior pituitary)**.
2. **Hypothalamohypophysial Tract:** Unmyelinated neurosecretory axons originating in the supraoptic and paraventricular hypothalamic nuclei traversing the infundibulum to terminate in the **neurohypophysis (posterior pituitary)**.

### Target Organ Feedback Loops
Most endocrine pathways operate via **negative feedback**. Elevated target organ hormone levels inhibit further hypothalamic releasing hormone and anterior pituitary stimulatory hormone synthesis, thereby maintaining physiological equilibrium.`
  },
  {
    id: 'note-cardio-shock',
    subjectId: 'subj-medsurg',
    subjectName: 'Medical-Surgical Nursing',
    subjectColor: 'rose',
    levelId: 'lvl-nd1',
    title: 'Cardiovascular Hemodynamics & Shock Classification & Management',
    topic: 'Cardiovascular System',
    summary: 'Clinical framework for assessing cardiac output, systemic vascular resistance, and managing hypovolemic, cardiogenic, and distributive shock.',
    readingTime: 8,
    status: 'published',
    isPublished: true,
    publishedAt: '2026-01-16T09:00:00.000Z',
    createdAt: '2026-01-16T09:00:00.000Z',
    updatedAt: '2026-01-16T09:00:00.000Z',
    keyPoints: [
      'Mean Arterial Pressure (MAP) = [Systolic BP + (2 x Diastolic BP)] / 3. A MAP ≥ 65 mmHg is mandatory for adequate vital organ perfusion.',
      'Shock is defined fundamentally as cellular hypoxia due to an imbalance between tissue oxygen supply and demand.',
      'The four primary categories of shock are Hypovolemic, Cardiogenic, Distributive (Septic/Anaphylactic/Neurogenic), and Obstructive.',
      'Lactate levels > 2.0 mmol/L indicate anaerobic metabolism and cellular hypoperfusion.'
    ],
    clinicalPearls: [
      'In septic shock, warm flushed peripheries occur early (hyperdynamic phase) due to massive systemic vasodilation, progressing later to cool clammy extremities.',
      'Neurogenic shock features bradycardia alongside hypotension because of loss of sympathetic cardiac accelerator tone, distinguishing it from all other shock states.',
      'Aggressive fluid boluses are contraindicated in pure cardiogenic shock without invasive monitoring because left ventricular failure leads to flash pulmonary edema.'
    ],
    content: `## Pathophysiology of Shock States

Shock is characterized by a failure of the microcirculation to meet metabolic demands of peripheral tissues.

### Four Major Classifications

| Shock Type | Primary Etiology | Hemodynamic Profile | First-Line Clinical Intervention |
|---|---|---|---|
| **Hypovolemic** | Hemorrhage, dehydration, burns | Low Preload (CVP), High SVR, Tachycardia | 0.9% Normal Saline or Ringer's Lactate; Packed RBCs if hemorrhagic |
| **Cardiogenic** | Acute MI, severe arrhythmia | High Preload, Low Cardiac Index, High SVR | Inotropes (Dobutamine), revascularization, avoid fluid overload |
| **Distributive (Septic)** | Overwhelming bacteremia / endotoxins | Low SVR, High or Low Cardiac Output | 30 mL/kg crystalloid bolus, blood cultures, broad-spectrum IV antibiotics within 1 hr, vasopressors (Norepinephrine) |
| **Anaphylactic** | Type 1 IgE-mediated histamine surge | Severe vasodilation, broncho-edema | IM Epinephrine 0.3-0.5 mg (1:1000) anterolateral thigh, high-flow O2, IV fluids |

### Nursing Interventions & Monitoring
- Establish two large-bore IV cannulae (14-16 gauge).
- Insert Foley catheter with urometer: maintain hourly urine output ≥ 0.5 mL/kg/hr.
- Elevate lower extremities 30 degrees (modified Trendelenburg) in hypovolemia; never place patient in head-down steep Trendelenburg as it restricts diaphragmatic excursion.`
  },
  {
    id: 'note-pharmacology-rights',
    subjectId: 'subj-pharmacology',
    subjectName: 'Pharmacology',
    subjectColor: 'sky',
    levelId: 'lvl-nd1',
    title: 'Pharmacokinetics, Pharmacodynamics & The 10 Rights of Drug Administration',
    topic: 'Pharmacology',
    summary: 'Core principles of drug absorption, distribution, hepatic metabolism, renal excretion, and error prevention protocols.',
    readingTime: 7,
    status: 'published',
    isPublished: true,
    publishedAt: '2026-01-18T10:00:00.000Z',
    createdAt: '2026-01-18T10:00:00.000Z',
    updatedAt: '2026-01-18T10:00:00.000Z',
    keyPoints: [
      'Pharmacokinetics: what the body does to the drug (ADME: Absorption, Distribution, Metabolism, Excretion).',
      'First-pass hepatic metabolism dramatically decreases the oral bioavailability of drugs such as nitroglycerin, morphine, and propranolol.',
      'Pharmacodynamics: what the drug does to the body (receptor affinity, agonism, antagonism, and therapeutic index).',
      'The 10 Rights of Medication Administration form the cornerstone of clinical patient safety.'
    ],
    clinicalPearls: [
      'Digoxin has a narrow therapeutic window (0.5 - 2.0 ng/mL). Always check apical pulse for a full 60 seconds and hold dose if heart rate is < 60 bpm.',
      'Hypokalemia potentiates digoxin toxicity; closely monitor serum potassium before administering cardiac glycosides alongside loop diuretics.',
      'Vancomycin administered too rapidly (< 60 minutes) triggers Red Man Syndrome due to direct mast cell histamine release, not a true IgE anaphylaxis.'
    ],
    content: `## Fundamental Pharmacokinetic Principles

### The ADME Continuum
1. **Absorption:** Transfer of medication from site of administration into bloodstream. Rate is influenced by bioavailability, gastric motility, and formulation (e.g., enteric coatings must never be crushed).
2. **Distribution:** Movement throughout extracellular fluids and body tissues. Highly protein-bound drugs (e.g., Warfarin 99% bound to albumin) risk toxic free-drug spikes in hypoalbuminemic patients.
3. **Metabolism:** Primarily hepatic enzymatic biotransformation mediated by Cytochrome P450 (CYP) enzymes.
4. **Excretion:** Primarily renal clearance. Dosage adjustments are mandatory in patients with estimated GFR < 60 mL/min.

### The 10 Rights of Medication Administration
1. Right Patient (using two unique identifiers)
2. Right Medication (checked three times: at shelf, preparation, and bedside)
3. Right Dose (double-checking high-alert medication calculations)
4. Right Route (oral, IV, IM, SC, transdermal)
5. Right Time (within 30-minute institutional grace window)
6. Right Documentation (recorded immediately post-administration, never prior)
7. Right Patient Education
8. Right to Refuse
9. Right Assessment (vitals, laboratory baseline prior to administration)
10. Right Evaluation (monitoring therapeutic efficacy and adverse reactions)`
  },
  {
    id: 'note-infection-control',
    subjectId: 'subj-fundamentals',
    subjectName: 'Fundamentals of Nursing',
    subjectColor: 'emerald',
    levelId: 'lvl-nd1',
    title: 'Aseptic Technique, Standard Precautions & Surgical Hand Scrub Protocol',
    topic: 'Infection Control & Nursing Practice',
    summary: 'Chain of infection disruption, medical versus surgical asepsis, sterile field maintenance, and transmission-based precautions.',
    readingTime: 5,
    status: 'published',
    isPublished: true,
    publishedAt: '2026-01-20T08:30:00.000Z',
    createdAt: '2026-01-20T08:30:00.000Z',
    updatedAt: '2026-01-20T08:30:00.000Z',
    keyPoints: [
      'Hand hygiene is the single most effective intervention in preventing healthcare-associated infections (HAIs).',
      'Medical asepsis (clean technique) reduces pathogen numbers, whereas surgical asepsis (sterile technique) eliminates all microorganisms and spores.',
      'A 1-inch (2.5 cm) border around the perimeter of a sterile field is considered non-sterile.',
      'Sterile objects below waist level or out of direct line of sight are considered contaminated.'
    ],
    clinicalPearls: [
      'Alcohol-based hand rub is ineffective against Clostridioides difficile spores; mechanical friction with soap and water is mandatory.',
      'When donning PPE for Airborne precautions: Gown -> Mask/N95 -> Goggles/Shield -> Gloves. When doffing: Gloves -> Goggles -> Gown -> Mask (removed outside patient room).',
      'If sterile water splashes through a paper drape, strike-through contamination occurs instantly through capillary action.'
    ],
    content: `## Principles of Surgical Asepsis

### The Sterile Field Rules
- An article is either sterile or unsterile; there is no intermediate status.
- Moisture passing through a sterile drape draws microorganisms by capillary action (**strike-through**).
- Open sterile packages away from you first, then sides, and toward you last to avoid reaching over an open field.
- Never turn your back on a sterile field or drop hands below table level.

### Transmission-Based Isolation Precautions
- **Airborne (Tuberculosis, Measles, Varicella):** Negative pressure airborne infection isolation room (AIIR), N95 respirator mask.
- **Droplet (Influenza, Meningococcal meningitis, Pertussis):** Surgical mask within 3-6 feet of patient, eye protection during procedures.
- **Contact (MRSA, VRE, C. difficile):** Dedicated equipment, gown and gloves donned prior to room entry.`
  },
  {
    id: 'note-renal-electrolytes',
    subjectId: 'subj-physiology',
    subjectName: 'Physiology',
    subjectColor: 'amber',
    levelId: 'lvl-nd1',
    title: 'Renal Nephron Physiology & Fluid-Electrolyte & Acid-Base Regulation',
    topic: 'Nephrology & Renal Nursing',
    summary: 'Glomerular filtration rate, tubular reabsorption and secretion, countercurrent mechanism, and ROME arterial blood gas interpretation.',
    readingTime: 7,
    status: 'published',
    isPublished: true,
    publishedAt: '2026-01-22T11:00:00.000Z',
    createdAt: '2026-01-22T11:00:00.000Z',
    updatedAt: '2026-01-22T11:00:00.000Z',
    keyPoints: [
      'Normal Glomerular Filtration Rate (GFR) is approximately 120-125 mL/min (~180 liters filtered daily).',
      'The proximal convoluted tubule reabsorbs ~65% of filtered water, sodium, potassium, and 100% of glucose under normal thresholds (< 180 mg/dL).',
      'Aldosterone stimulates sodium reabsorption and potassium/hydrogen excretion in the distal tubule and collecting duct.',
      'Antidiuretic Hormone (Vasopressin) inserts aquaporin-2 water channels into collecting duct apical membranes to conserve free water.'
    ],
    clinicalPearls: [
      'Hyperkalemia (serum K+ > 5.5 mEq/L) causes peaked T-waves, PR prolongation, and lethal ventricular arrhythmias. Immediate stabilization requires IV Calcium Gluconate (protects myocardium) followed by regular insulin with 50% dextrose.',
      'In Metabolic Acidosis, watch for deep, rapid Kussmaul respirations as the respiratory system compensates by blowing off carbon dioxide.',
      'Rapid overcorrection of severe chronic hyponatremia (> 8-10 mEq/L in 24 hrs) can cause irreversible Osmotic Demyelination Syndrome (central pontine myelinolysis).'
    ],
    content: `## Acid-Base Equilibrium & Arterial Blood Gas (ABG)

Normal physiological ranges:
- **pH:** 7.35 - 7.45
- **PaCO2:** 35 - 45 mmHg (Respiratory parameter)
- **HCO3-:** 22 - 26 mEq/L (Metabolic parameter)

### The ROME Diagnostic Rule
- **R**espiratory **O**pposite: When pH is low and PaCO2 is high = Respiratory Acidosis (e.g. COPD, opioid overdose).
- **M**etabolic **E**qual: When pH is low and HCO3- is low = Metabolic Acidosis (e.g. DKA, lactic acidosis, renal failure).`
  },
  {
    id: 'note-primary-health-care',
    subjectId: 'subj-phc',
    subjectName: 'Primary Health Care & Community Nursing',
    subjectColor: 'teal',
    levelId: 'lvl-nd1',
    title: 'Primary Health Care & Expanded Programme on Immunization (EPI) Schedules',
    topic: 'Primary Health Care',
    summary: 'Alma-Ata declaration core elements, vaccine cold chain maintenance, and Nigerian/WHO routine childhood immunization guidelines.',
    readingTime: 6,
    status: 'published',
    isPublished: true,
    publishedAt: '2026-01-25T07:30:00.000Z',
    createdAt: '2026-01-25T07:30:00.000Z',
    updatedAt: '2026-01-25T07:30:00.000Z',
    keyPoints: [
      'Primary Health Care (Alma-Ata 1978) emphasizes essential health care based on practical, scientifically sound, and socially acceptable methods.',
      'The 8 Essential Elements of PHC include: Education, Locally endemic disease control, EPI immunization, Maternal & Child health/Family planning, Essential drugs, Nutrition & food supply, Treatment of common ailments, Safe water & basic sanitation (ELEMENTS).',
      'Vaccine cold chain must be maintained between +2°C to +8°C for heat-sensitive antigens.',
      'The Shake Test determines if freeze-sensitive vaccines (Pentavalent, Hepatitis B, Tetanus toxoid) have undergone freezing damage.'
    ],
    clinicalPearls: [
      'BCG vaccine is administered intradermally in the right upper arm at a dose of 0.05 mL for neonates, forming a characteristic 2-3 mm wheal that develops into a scar.',
      'Never freeze Pentavalent or Tetanus Toxoid vaccines; freezing precipitates aluminum adjuvants, causing loss of immunogenicity and sterile abscesses.',
      'Oral Polio Vaccine (OPV) is live attenuated and kept at -20°C in freezer storage, whereas lyophilized Measles vaccine must be discarded within 6 hours of reconstitution.'
    ],
    content: `## The Cold Chain System

The cold chain represents the unbroken chain of temperature-controlled storage and transportation from the manufacturer to the point of administration.

### Routine Childhood Immunization Schedule (WHO / National Standard)
1. **At Birth:** BCG, OPV-0, Hepatitis B birth dose.
2. **6 Weeks:** Pentavalent-1 (DPT-HepB-Hib), OPV-1, PCV-1, Rotavirus-1.
3. **10 Weeks:** Pentavalent-2, OPV-2, PCV-2, Rotavirus-2.
4. **14 Weeks:** Pentavalent-3, OPV-3, PCV-3, Inactivated Polio Vaccine (IPV).
5. **9 Months:** Measles-1, Yellow Fever, Vitamin A (100,000 IU).
6. **15 Months:** Measles-2, Meningococcal conjugate vaccine.`
  }
];
