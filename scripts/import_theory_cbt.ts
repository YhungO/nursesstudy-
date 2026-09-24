import fs from 'fs';
import path from 'path';

export const theoryQuestionsBank = [
  {
    category: "General Characteristics",
    question: "Define the integumentary system and list the major organs and structures that comprise it.",
    modelAnswer: "The integumentary system is a system that covers, shields, and protects internal tissues/organs. It consists of the skin (cutaneous membrane), hair, nails, subcutaneous tissue, and various glands."
  },
  {
    category: "General Characteristics",
    question: "State the key statistics regarding the skin's surface area, weight percentage relative to total body mass, and thickness range.",
    modelAnswer: "The skin covers approximately 2 square meters, weighs about 16% of total body mass, and varies in thickness from 1.5 to 6.0 mm."
  },
  {
    category: "General Characteristics",
    question: "Explain why the skin is categorized clinically as an organ system rather than a single standalone tissue.",
    modelAnswer: "The skin is an organ system because it is composed of multiple tissue types working together (epithelial, connective, muscle, nervous tissue) to perform complex coordinated physiological functions."
  },
  {
    category: "General Characteristics",
    question: "Describe how structural variations in skin thickness across different body sites relate to mechanical protection.",
    modelAnswer: "Thinner skin is found on eyelids or areas requiring high flexibility, whereas thicker skin (up to 6.0 mm) is found on high-friction areas like the palms and soles to withstand mechanical stress."
  },
  {
    category: "General Characteristics",
    question: "Discuss the clinical significance of maintaining integumentary system integrity for systemic homeostasis.",
    modelAnswer: "Skin integrity prevents fluid loss, blocks pathogen invasion, and regulates internal temperature, making its breach catastrophic for overall systemic homeostasis."
  },
  {
    category: "Functions - Protection",
    question: "Describe the physical barrier function of the integumentary system, including cell types and biochemical components involved.",
    modelAnswer: "The physical barrier is provided by cell continuity and hard keratinized cells. Glycolipids between cells block diffusion of water and water-soluble substances."
  },
  {
    category: "Functions - Protection",
    question: "Detail the chemical barrier components of the skin and explain how they suppress bacterial proliferation.",
    modelAnswer: "Chemical barriers include melanin (blocks UV), sebum, and the acid mantle. Their acidic pH and antimicrobial properties retard or kill bacterial growth."
  },
  {
    category: "Functions - Protection",
    question: "Explain the biological barrier role of Langerhans' cells and dermal macrophages during pathogen invasion.",
    modelAnswer: "Langerhans' cells (epidermis) and macrophages (dermis) act as antigen-presenting cells that phagocytize invaders and activate the adaptive immune system."
  },
  {
    category: "Functions - Temperature Regulation",
    question: "Explain the physiological mechanisms of cutaneous vasodilation and sweating during hyperthermia (heat).",
    modelAnswer: "When hot, dermal blood vessels dilate to radiate core heat outward, and sweat glands produce sweat, which cools the body via evaporation."
  },
  {
    category: "Functions - Temperature Regulation",
    question: "Explain the physiological mechanism of cutaneous vasoconstriction during hypothermia (cold stress).",
    modelAnswer: "When cold, dermal blood vessels constrict, shunting warm blood away from the skin surface and keeping it concentrated near the vital body core."
  },
  {
    category: "Functions - Sensory & Excretion",
    question: "Outline how the millions of sensory receptors embedded in the skin facilitate interaction with the external environment.",
    modelAnswer: "Receptors detect external stimuli including touch, pressure, pain, and temperature changes, transmitting sensory data to the central nervous system."
  },
  {
    category: "Functions - Excretion & Absorption",
    question: "Identify the excretory products eliminated through skin secretions and describe its role in water balance regulation.",
    modelAnswer: "The skin eliminates nitrogenous wastes like urea and uric acid through sweat while regulating insensible and sensible water loss."
  },
  {
    category: "Metabolic Functions",
    question: "Describe the biochemical pathway through which exposure to ultraviolet light enables skin synthesis of Vitamin D.",
    modelAnswer: "UV light converts epidermal cholesterol precursors into cholecalciferol (Vitamin D3), which is further processed by the liver and kidneys into active calcitriol."
  },
  {
    category: "Metabolic Functions",
    question: "Explain why Vitamin D is essential for calcium absorption and list the pathological consequence of deficiency.",
    modelAnswer: "Vitamin D is required for intestinal calcium absorption. Deficiency results in Rickets in children (soft bones) and osteomalacia in adults."
  },
  {
    category: "Metabolic Functions",
    question: "Discuss how aging or geographic location affects cutaneous Vitamin D synthesis capacity.",
    modelAnswer: "Aging reduces precursor production in the epidermis, and high latitudes/limited sunlight reduce UV exposure, increasing deficiency risk."
  },
  {
    category: "Metabolic Functions",
    question: "Identify other metabolic transformations performed by skin cells, such as conversion of certain chemicals into carcinogens or hormones.",
    modelAnswer: "Skin cells possess enzymes (like keratinocyte cytochromes) that can metabolize steroid hormones and transform certain topical carcinogens."
  },
  {
    category: "Body Membranes",
    question: "Compare and contrast serous membranes and mucous membranes regarding anatomical location and fluid secretion.",
    modelAnswer: "Serous membranes line closed internal cavities and secrete watery serous fluid. Mucous membranes line cavities/tubes opening to the exterior and secrete mucus."
  },
  {
    category: "Body Membranes",
    question: "Describe the specific anatomical location and functional purpose of synovial membranes.",
    modelAnswer: "Synovial membranes form the inner lining of joint capsule cavities and secrete viscous synovial fluid to lubricate and nourish articular cartilage."
  },
  {
    category: "Body Membranes",
    question: "Define the cutaneous membrane and explain why it is structurally unique compared to other membrane types.",
    modelAnswer: "The cutaneous membrane is the skin; it is unique because it is a dry, keratinized stratified squamous epithelium anchored to a thick connective tissue dermis."
  },
  {
    category: "Body Membranes",
    question: "Explain clinical implications when any of the four body membranes become inflamed or infected.",
    modelAnswer: "Membrane inflammation causes pain, aberrant fluid secretion (e.g., effusions in serous/synovial cavities), and disruption of protective barriers."
  },
  {
    category: "Epidermis Structure",
    question: "List the four distinct cell types found in the epidermis and state their relative proportions.",
    modelAnswer: "Keratinocytes (90%), Melanocytes (8%), Langerhans cells (immune sentinels), and Merkel cells (touch receptors)."
  },
  {
    category: "Epidermis Structure",
    question: "Detail the structure and functions of Keratinocytes and Melanocytes.",
    modelAnswer: "Keratinocytes produce tough keratin for waterproofing/protection. Melanocytes synthesize pigment melanin to shield nuclear DNA from UV radiation."
  },
  {
    category: "Epidermis Structure",
    question: "Name and describe the five strata of the epidermis in order from deep to superficial.",
    modelAnswer: "1. Stratum Basale, 2. Stratum Spinosum, 3. Stratum Granulosum, 4. Stratum Lucidum (thick skin only), 5. Stratum Corneum."
  },
  {
    category: "Epidermis Structure",
    question: "Describe the cellular events occurring within the Stratum Basale (Germinativum).",
    modelAnswer: "Continuous mitotic cell division occurs here, producing new keratinocytes that push upward toward the surface."
  },
  {
    category: "Epidermis Structure",
    question: "Explain the significance of apoptosis as cells transition through the Stratum Granulosum.",
    modelAnswer: "Cells undergo programmed cell death (apoptosis) and accumulate keratohyalin granules, marking the shift to dead, hardened surface layers."
  },
  {
    category: "Epidermis Structure",
    question: "Where is the Stratum Lucidum located, and what microscopic appearance does it present?",
    modelAnswer: "Present only in thick skin (palms and soles); appears as a clear, translucent, flat band of dead keratinocytes."
  },
  {
    category: "Epidermis Structure",
    question: "Describe the composition and continuous shedding process of the outermost Stratum Corneum.",
    modelAnswer: "Composed of 25-30 layers of dead, flat, keratin-filled envelope cells (cornified cells) that continuously slough off (desquamation)."
  },
  {
    category: "Dermis & Hypodermis",
    question: "Describe the primary fibrous connective tissue composition of the dermis.",
    modelAnswer: "Composed of 70% collagen fibers for tensile toughness and elastin fibers for stretch resilience and recoil."
  },
  {
    category: "Dermis & Hypodermis",
    question: "Compare the papillary layer and reticular layer of the dermis regarding structure and contents.",
    modelAnswer: "Papillary layer (superficial) has dermal papillae forming fingerprints and touch receptors. Reticular layer (deep) contains hair follicles, glands, and thick collagen networks."
  },
  {
    category: "Dermis & Hypodermis",
    question: "Explain why dermal papillae are responsible for unique individual fingerprints.",
    modelAnswer: "Dermal papillae project into the epidermis, creating distinct friction ridges on the overlying epidermis that remain unique throughout life."
  },
  {
    category: "Dermis & Hypodermis",
    question: "Define the hypodermis (subcutaneous layer) and explain its relationship to the skin proper.",
    modelAnswer: "Technically not part of the skin proper; composed of adipose and loose connective tissue anchoring skin to deep muscle/bone."
  },
  {
    category: "Dermis & Hypodermis",
    question: "Discuss the physiological importance of subcutaneous adipose tissue for thermal insulation across age groups.",
    modelAnswer: "Provides insulation against heat loss. Infants and the elderly possess thinner subcutaneous fat layers, rendering them more sensitive to cold stress."
  },
  {
    category: "Skin Types & Appendages",
    question: "Contrast thick skin and thin skin across thickness, location, layers, and gland distribution.",
    modelAnswer: "Thin skin: 1-2mm, covers most body, has hair/sebaceous glands, lacks stratum lucidum. Thick skin: up to 6mm, palms/soles, hairless, has stratum lucidum."
  },
  {
    category: "Skin Types & Appendages",
    question: "Describe the anatomical parts of a hair (pili): shaft, root, and bulb.",
    modelAnswer: "Shaft is the visible part above skin; root is embedded below surface; bulb is the expanded base containing matrix cells for growth."
  },
  {
    category: "Skin Types & Appendages",
    question: "Outline the three distinct phases of the hair growth cycle.",
    modelAnswer: "1. Anagen (active growth, 2-6 years), 2. Catagen (transitional shrinkage, 1-2 weeks), 3. Telogen (resting phase, hair sheds)."
  },
  {
    category: "Skin Types & Appendages",
    question: "Explain the anatomical mechanism of the arrector pili muscle and physiological cause of 'goosebumps'.",
    modelAnswer: "Arrector pili are smooth muscle bundles attached to hair follicles; sympathetic stimulation contracts them, pulling hair upright ('goosebumps')."
  },
  {
    category: "Skin Types & Appendages",
    question: "Compare Eccrine and Apocrine sweat glands in secretion method and developmental onset.",
    modelAnswer: "Eccrine are widespread, secrete watery cooling sweat from birth. Apocrine secrete into hair follicles during stress, activating at puberty."
  },
  {
    category: "Skin Types & Appendages",
    question: "Describe the function of Sebaceous (oil) glands and their hormonal activation during puberty.",
    modelAnswer: "Secrete sebum to lubricate skin/hair and inhibit bacteria; stimulated by increased androgens at puberty, linking them to acne."
  },
  {
    category: "Skin Types & Appendages",
    question: "Locate Ceruminous glands and state the protective role of their secretion.",
    modelAnswer: "Located in the external ear canal; secrete cerumen (earwax) to trap foreign debris and protect the tympanic membrane."
  },
  {
    category: "Skin Types & Appendages",
    question: "Describe the anatomical structure of nails and identify where nail growth originates.",
    modelAnswer: "Nails are hard, keratinized epidermal plates. Growth originates from the proliferative cells in the underlying nail matrix."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "Interpret cyanosis (blue skin coloration) from a nursing and cardiopulmonary perspective.",
    modelAnswer: "Cyanosis indicates severe oxygen depletion in hemoglobin due to respiratory or cardiac compromise."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "Explain the pathophysiological cause of jaundice (yellow skin/sclera) in liver dysfunction.",
    modelAnswer: "Caused by the accumulation of the yellow bile pigment bilirubin in body tissues due to hepatic processing failure or biliary obstruction."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "Differentiate between erythema and pallor as clinical indicators of systemic or local disturbance.",
    modelAnswer: "Erythema (redness) indicates inflammation, fever, or infection. Pallor (paleness) indicates anemia, shock, or reduced peripheral perfusion."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "Classify first-degree and second-degree burns regarding depth of tissue damage and physical signs.",
    modelAnswer: "1st degree: Epidermis only, red and painful (sunburn). 2nd degree: Extends into dermis, forms fluid-filled blisters."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "Describe third-degree and fourth-degree burns regarding severity, pain profile, and systemic risk.",
    modelAnswer: "3rd degree: Full-thickness damage, destroys skin nerve endings, high infection/fluid loss risk. 4th degree: Involves underlying muscle and bone."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "Apply the 'Rule of Nines' to calculate total body surface area (TBSA) burned for an adult.",
    modelAnswer: "Head = 9%, each arm = 9%, anterior torso = 18%, posterior torso = 18%, each leg = 18%, perineum = 1%."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "Calculate TBSA burned using the Rule of Nines for a patient with burns on their entire left arm and front torso.",
    modelAnswer: "Left arm = 9% (front + back), front of torso = 18%. Total TBSA burned = 9% + 18% = 27%."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "Identify Basal Cell Carcinoma and Squamous Cell Carcinoma regarding malignancy and origin.",
    modelAnswer: "BCC: Arises from stratum basale, most common, least malignant (99% cure rate). SCC: Arises from stratum spinosum, grows faster if untreated."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "Discuss Malignant Melanoma as the most lethal skin cancer and explain its cellular origin.",
    modelAnswer: "Malignant melanoma is cancer of melanocytes; highly metastatic and deadly, making early detection via ABCDE criteria crucial."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "Summarize the nurse's role in integumentary assessment, pressure ulcer prevention, and patient education.",
    modelAnswer: "Nurses perform regular skin inspections, reposition immobile patients to prevent pressure injuries, and educate patients on sun safety and self-exams."
  }
];

export const EXAM_ID = "integumentary-system-theory-cbt";

export function importTheoryBank() {
  console.log(`Starting Safe Import for Exam ID: ${EXAM_ID}...`);

  if (theoryQuestionsBank.length !== 50) {
    throw new Error(`Expected exactly 50 questions, found ${theoryQuestionsBank.length}`);
  }

  // Strict validation of each question
  theoryQuestionsBank.forEach((q, idx) => {
    const qNum = idx + 1;
    if (!q.category?.trim()) throw new Error(`Question ${qNum} has empty category`);
    if (!q.question?.trim()) throw new Error(`Question ${qNum} has empty question text`);
    if (!q.modelAnswer?.trim()) throw new Error(`Question ${qNum} has empty model answer`);
  });

  const dbPath = path.resolve(process.cwd(), 'data/database.json');
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file not found at ${dbPath}`);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  if (!db.exams) db.exams = [];
  if (!db.questions) db.questions = [];

  const stableQuestionIds: string[] = [];

  // Map to existing question schema with stable unique IDs
  const mappedQuestions = theoryQuestionsBank.map((q, idx) => {
    const questionNumber = idx + 1;
    const stableId = `integumentary-theory-${String(questionNumber).padStart(3, '0')}`;
    stableQuestionIds.push(stableId);

    return {
      id: stableId,
      examId: EXAM_ID,
      questionType: "theory",
      questionNumber: questionNumber,
      category: q.category,
      question: q.question,
      questionText: q.question,
      modelAnswer: q.modelAnswer,
      explanation: q.modelAnswer,
      rationale: q.modelAnswer,
      options: [],
      course: "Anatomy",
      subjectName: "Anatomy",
      subjectId: "subj-anatomy",
      levelId: "lvl-nd1",
      topic: q.category,
      difficulty: "Medium",
      isPublished: true,
      published: true,
      createdAt: "2026-09-24T12:00:00.000Z"
    };
  });

  // Duplicate protection: filter out any prior items with matching stable IDs or prior legacy IDs
  db.questions = db.questions.filter((q: any) => {
    if (q.id && String(q.id).startsWith('integumentary-theory-')) return false;
    if (q.id && String(q.id).startsWith('theory-integ-')) return false;
    return true;
  });

  // Append validated theory questions
  db.questions.push(...mappedQuestions);

  // Duplicate protection for exam record
  const examIndex = db.exams.findIndex((e: any) => e.id === EXAM_ID || e.id === 'cbt-theory-integumentary-50');

  const examPayload = {
    id: EXAM_ID,
    title: "Integumentary System – Theory CBT",
    subjectName: "Anatomy",
    course: "Anatomy",
    description: "50 comprehensive theory questions covering the integumentary system.",
    subjectId: "subj-anatomy",
    levelId: "lvl-nd1",
    durationMinutes: 60,
    totalQuestions: 50,
    actualQuestionCount: 50,
    passingScore: 50,
    examType: "theory",
    questionType: "theory",
    mode: "Theory CBT",
    isPublished: true,
    published: true,
    questionIds: stableQuestionIds,
    instructions: [
      "Answer all 50 comprehensive theoretical questions covering the integumentary system.",
      "You may type your answer directly or utilize voice recording/dictation tools.",
      "Submit your examination when complete to compare against standardized council model answers."
    ],
    createdAt: "2026-09-24T12:00:00.000Z",
    updatedAt: new Date().toISOString()
  };

  if (examIndex >= 0) {
    console.log(`Updating existing exam record at index ${examIndex} (ID: ${EXAM_ID})`);
    db.exams[examIndex] = examPayload;
  } else {
    console.log(`Inserting new exam record for ID: ${EXAM_ID}`);
    db.exams.push(examPayload);
  }

  // Ensure no duplicate IDs in db.exams
  const seenExamIds = new Set<string>();
  db.exams = db.exams.filter((e: any) => {
    if (seenExamIds.has(e.id)) return false;
    seenExamIds.add(e.id);
    return true;
  });

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Safe import successful! Total exams: ${db.exams.length}, Total questions: ${db.questions.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  importTheoryBank();
}
