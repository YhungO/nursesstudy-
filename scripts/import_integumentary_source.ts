import fs from 'fs';
import path from 'path';

// Source data extracted directly from the attached HTML file
const sourceQuestions = [
  // Section 1: Definition and General Characteristics (Q1-Q5)
  {
    category: "General Characteristics",
    question: "1. Define the integumentary system and list the major organs and structures that comprise it.",
    modelAnswer: "The integumentary system is a system that covers, shields, and protects internal tissues/organs. It consists of the skin (cutaneous membrane), hair, nails, subcutaneous tissue, and various glands."
  },
  {
    category: "General Characteristics",
    question: "2. State the key statistics regarding the skin's surface area, weight percentage relative to total body mass, and thickness range.",
    modelAnswer: "The skin covers approximately 2 square meters, weighs about 16% of total body mass, and varies in thickness from 1.5 to 6.0 mm."
  },
  {
    category: "General Characteristics",
    question: "3. Explain why the skin is categorized clinically as an organ system rather than a single standalone tissue.",
    modelAnswer: "The skin is an organ system because it is composed of multiple tissue types working together (epithelial, connective, muscle, nervous tissue) to perform complex coordinated physiological functions."
  },
  {
    category: "General Characteristics",
    question: "4. Describe how structural variations in skin thickness across different body sites relate to mechanical protection.",
    modelAnswer: "Thinner skin is found on eyelids or areas requiring high flexibility, whereas thicker skin (up to 6.0 mm) is found on high-friction areas like the palms and soles to withstand mechanical stress."
  },
  {
    category: "General Characteristics",
    question: "5. Discuss the clinical significance of maintaining integumentary system integrity for systemic homeostasis.",
    modelAnswer: "Skin integrity prevents fluid loss, blocks pathogen invasion, and regulates internal temperature, making its breach catastrophic for overall systemic homeostasis."
  },

  // Section 2: Functions of the Integumentary System - Protection & Barriers (Q6-Q12)
  {
    category: "Functions - Protection",
    question: "6. Describe the physical barrier function of the integumentary system, including cell types and biochemical components involved.",
    modelAnswer: "The physical barrier is provided by cell continuity and hard keratinized cells. Glycolipids between cells block diffusion of water and water-soluble substances."
  },
  {
    category: "Functions - Protection",
    question: "7. Detail the chemical barrier components of the skin and explain how they suppress bacterial proliferation.",
    modelAnswer: "Chemical barriers include melanin (blocks UV), sebum, and the acid mantle. Their acidic pH and antimicrobial properties retard or kill bacterial growth."
  },
  {
    category: "Functions - Protection",
    question: "8. Explain the biological barrier role of Langerhans' cells and dermal macrophages during pathogen invasion.",
    modelAnswer: "Langerhans' cells (epidermis) and macrophages (dermis) act as antigen-presenting cells that phagocytize invaders and activate the adaptive immune system."
  },
  {
    category: "Functions - Temperature Regulation",
    question: "9. Explain the physiological mechanisms of cutaneous vasodilation and sweating during hyperthermia (heat).",
    modelAnswer: "When hot, dermal blood vessels dilate to radiate core heat outward, and sweat glands produce sweat, which cools the body via evaporation."
  },
  {
    category: "Functions - Temperature Regulation",
    question: "10. Explain the physiological mechanism of cutaneous vasoconstriction during hypothermia (cold stress).",
    modelAnswer: "When cold, dermal blood vessels constrict, shunting warm blood away from the skin surface and keeping it concentrated near the vital body core."
  },
  {
    category: "Functions - Sensory & Excretion",
    question: "11. Outline how the millions of sensory receptors embedded in the skin facilitate interaction with the external environment.",
    modelAnswer: "Receptors detect external stimuli including touch, pressure, pain, and temperature changes, transmitting sensory data to the central nervous system."
  },
  {
    category: "Functions - Excretion & Absorption",
    question: "12. Identify the excretory products eliminated through skin secretions and describe its role in water balance regulation.",
    modelAnswer: "The skin eliminates nitrogenous wastes like urea and uric acid through sweat while regulating insensible and sensible water loss."
  },

  // Section 3: Metabolic Functions & Vitamin D (Q13-Q16)
  {
    category: "Metabolic Functions",
    question: "13. Describe the biochemical pathway through which exposure to ultraviolet light enables skin synthesis of Vitamin D.",
    modelAnswer: "UV light converts epidermal cholesterol precursors into cholecalciferol (Vitamin D3), which is further processed by the liver and kidneys into active calcitriol."
  },
  {
    category: "Metabolic Functions",
    question: "14. Explain why Vitamin D is essential for calcium absorption and list the pathological consequence of deficiency.",
    modelAnswer: "Vitamin D is required for intestinal calcium absorption. Deficiency results in Rickets in children (soft bones) and osteomalacia in adults."
  },
  {
    category: "Metabolic Functions",
    question: "15. Discuss how aging or geographic location affects cutaneous Vitamin D synthesis capacity.",
    modelAnswer: "Aging reduces precursor production in the epidermis, and high latitudes/limited sunlight reduce UV exposure, increasing deficiency risk."
  },
  {
    category: "Metabolic Functions",
    question: "16. Identify other metabolic transformations performed by skin cells, such as conversion of certain chemicals into carcinogens or hormones.",
    modelAnswer: "Skin cells possess enzymes (like keratinocyte cytochromes) that can metabolize steroid hormones and transform certain topical carcinogens."
  },

  // Section 4: Body Membranes (Q17-Q20)
  {
    category: "Body Membranes",
    question: "17. Compare and contrast serous membranes and mucous membranes regarding anatomical location and fluid secretion.",
    modelAnswer: "Serous membranes line closed internal cavities and secrete watery serous fluid. Mucous membranes line cavities/tubes opening to the exterior and secrete mucus."
  },
  {
    category: "Body Membranes",
    question: "18. Describe the specific anatomical location and functional purpose of synovial membranes.",
    modelAnswer: "Synovial membranes form the inner lining of joint capsule cavities and secrete viscous synovial fluid to lubricate and nourish articular cartilage."
  },
  {
    category: "Body Membranes",
    question: "19. Define the cutaneous membrane and explain why it is structurally unique compared to other membrane types.",
    modelAnswer: "The cutaneous membrane is the skin; it is unique because it is a dry, keratinized stratified squamous epithelium anchored to a thick connective tissue dermis."
  },
  {
    category: "Body Membranes",
    question: "20. Explain clinical implications when any of the four body membranes become inflamed or infected.",
    modelAnswer: "Membrane inflammation causes pain, aberrant fluid secretion (e.g., effusions in serous/synovial cavities), and disruption of protective barriers."
  },

  // Section 5: Detailed Structure - Epidermis (Q21-Q27)
  {
    category: "Epidermis Structure",
    question: "21. List the four distinct cell types found in the epidermis and state their relative proportions.",
    modelAnswer: "Keratinocytes (90%), Melanocytes (8%), Langerhans cells (immune sentinels), and Merkel cells (touch receptors)."
  },
  {
    category: "Epidermis Structure",
    question: "22. Detail the structure and functions of Keratinocytes and Melanocytes.",
    modelAnswer: "Keratinocytes produce tough keratin for waterproofing/protection. Melanocytes synthesize pigment melanin to shield nuclear DNA from UV radiation."
  },
  {
    category: "Epidermis Structure",
    question: "23. Name and describe the five strata of the epidermis in order from deep to superficial.",
    modelAnswer: "1. Stratum Basale, 2. Stratum Spinosum, 3. Stratum Granulosum, 4. Stratum Lucidum (thick skin only), 5. Stratum Corneum."
  },
  {
    category: "Epidermis Structure",
    question: "24. Describe the cellular events occurring within the Stratum Basale (Germinativum).",
    modelAnswer: "Continuous mitotic cell division occurs here, producing new keratinocytes that push upward toward the surface."
  },
  {
    category: "Epidermis Structure",
    question: "25. Explain the significance of apoptosis as cells transition through the Stratum Granulosum.",
    modelAnswer: "Cells undergo programmed cell death (apoptosis) and accumulate keratohyalin granules, marking the shift to dead, hardened surface layers."
  },
  {
    category: "Epidermis Structure",
    question: "26. Where is the Stratum Lucidum located, and what microscopic appearance does it present?",
    modelAnswer: "Present only in thick skin (palms and soles); appears as a clear, translucent, flat band of dead keratinocytes."
  },
  {
    category: "Epidermis Structure",
    question: "27. Describe the composition and continuous shedding process of the outermost Stratum Corneum.",
    modelAnswer: "Composed of 25-30 layers of dead, flat, keratin-filled envelope cells (cornified cells) that continuously slough off (desquamation)."
  },

  // Section 6: Detailed Structure - Dermis & Hypodermis (Q28-Q32)
  {
    category: "Dermis & Hypodermis",
    question: "28. Describe the primary fibrous connective tissue composition of the dermis.",
    modelAnswer: "Composed of 70% collagen fibers for tensile toughness and elastin fibers for stretch resilience and recoil."
  },
  {
    category: "Dermis & Hypodermis",
    question: "29. Compare the papillary layer and reticular layer of the dermis regarding structure and contents.",
    modelAnswer: "Papillary layer (superficial) has dermal papillae forming fingerprints and touch receptors. Reticular layer (deep) contains hair follicles, glands, and thick collagen networks."
  },
  {
    category: "Dermis & Hypodermis",
    question: "30. Explain why dermal papillae are responsible for unique individual fingerprints.",
    modelAnswer: "Dermal papillae project into the epidermis, creating distinct friction ridges on the overlying epidermis that remain unique throughout life."
  },
  {
    category: "Dermis & Hypodermis",
    question: "31. Define the hypodermis (subcutaneous layer) and explain its relationship to the skin proper.",
    modelAnswer: "Technically not part of the skin proper; composed of adipose and loose connective tissue anchoring skin to deep muscle/bone."
  },
  {
    category: "Dermis & Hypodermis",
    question: "32. Discuss the physiological importance of subcutaneous adipose tissue for thermal insulation across age groups.",
    modelAnswer: "Provides insulation against heat loss. Infants and the elderly possess thinner subcutaneous fat layers, rendering them more sensitive to cold stress."
  },

  // Section 7: Thick vs. Thin Skin & Appendages (Hair & Nails) (Q33-Q40)
  {
    category: "Skin Types & Appendages",
    question: "33. Contrast thick skin and thin skin across thickness, location, layers, and gland distribution.",
    modelAnswer: "Thin skin: 1-2mm, covers most body, has hair/sebaceous glands, lacks stratum lucidum. Thick skin: up to 6mm, palms/soles, hairless, has stratum lucidum."
  },
  {
    category: "Skin Types & Appendages",
    question: "34. Describe the anatomical parts of a hair (pili): shaft, root, and bulb.",
    modelAnswer: "Shaft is the visible part above skin; root is embedded below surface; bulb is the expanded base containing matrix cells for growth."
  },
  {
    category: "Skin Types & Appendages",
    question: "35. Outline the three distinct phases of the hair growth cycle.",
    modelAnswer: "1. Anagen (active growth, 2-6 years), 2. Catagen (transitional shrinkage, 1-2 weeks), 3. Telogen (resting phase, hair sheds)."
  },
  {
    category: "Skin Types & Appendages",
    question: "36. Explain the anatomical mechanism of the arrector pili muscle and physiological cause of 'goosebumps'.",
    modelAnswer: "Arrector pili are smooth muscle bundles attached to hair follicles; sympathetic stimulation contracts them, pulling hair upright ('goosebumps')."
  },
  {
    category: "Skin Types & Appendages",
    question: "37. Compare Eccrine and Apocrine sweat glands in secretion method and developmental onset.",
    modelAnswer: "Eccrine are widespread, secrete watery cooling sweat from birth. Apocrine secrete into hair follicles during stress, activating at puberty."
  },
  {
    category: "Skin Types & Appendages",
    question: "38. Describe the function of Sebaceous (oil) glands and their hormonal activation during puberty.",
    modelAnswer: "Secrete sebum to lubricate skin/hair and inhibit bacteria; stimulated by increased androgens at puberty, linking them to acne."
  },
  {
    category: "Skin Types & Appendages",
    question: "39. Locate Ceruminous glands and state the protective role of their secretion.",
    modelAnswer: "Located in the external ear canal; secrete cerumen (earwax) to trap foreign debris and protect the tympanic membrane."
  },
  {
    category: "Skin Types & Appendages",
    question: "40. Describe the anatomical structure of nails and identify where nail growth originates.",
    modelAnswer: "Nails are hard, keratinized epidermal plates. Growth originates from the proliferative cells in the underlying nail matrix."
  },

  // Section 8: Clinical Diagnostics & Pathologies (Q41-Q50)
  {
    category: "Clinical Diagnostics & Burns",
    question: "41. Interpret cyanosis (blue skin coloration) from a nursing and cardiopulmonary perspective.",
    modelAnswer: "Cyanosis indicates severe oxygen depletion in hemoglobin due to respiratory or cardiac compromise."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "42. Explain the pathophysiological cause of jaundice (yellow skin/sclera) in liver dysfunction.",
    modelAnswer: "Caused by the accumulation of the yellow bile pigment bilirubin in body tissues due to hepatic processing failure or biliary obstruction."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "43. Differentiate between erythema and pallor as clinical indicators of systemic or local disturbance.",
    modelAnswer: "Erythema (redness) indicates inflammation, fever, or infection. Pallor (paleness) indicates anemia, shock, or reduced peripheral perfusion."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "44. Classify first-degree and second-degree burns regarding depth of tissue damage and physical signs.",
    modelAnswer: "1st degree: Epidermis only, red and painful (sunburn). 2nd degree: Extends into dermis, forms fluid-filled blisters."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "45. Describe third-degree and fourth-degree burns regarding severity, pain profile, and systemic risk.",
    modelAnswer: "3rd degree: Full-thickness damage, destroys skin nerve endings, high infection/fluid loss risk. 4th degree: Involves underlying muscle and bone."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "46. Apply the 'Rule of Nines' to calculate total body surface area (TBSA) burned for an adult.",
    modelAnswer: "Head = 9%, each arm = 9%, anterior torso = 18%, posterior torso = 18%, each leg = 18%, perineum = 1%."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "47. Calculate TBSA burned using the Rule of Nines for a patient with burns on their entire left arm and front torso.",
    modelAnswer: "Left arm = 9% (front + back), front of torso = 18%. Total TBSA burned = 9% + 18% = 27%."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "48. Identify Basal Cell Carcinoma and Squamous Cell Carcinoma regarding malignancy and origin.",
    modelAnswer: "BCC: Arises from stratum basale, most common, least malignant (99% cure rate). SCC: Arises from stratum spinosum, grows faster if untreated."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "49. Discuss Malignant Melanoma as the most lethal skin cancer and explain its cellular origin.",
    modelAnswer: "Malignant melanoma is cancer of melanocytes; highly metastatic and deadly, making early detection via ABCDE criteria crucial."
  },
  {
    category: "Clinical Diagnostics & Burns",
    question: "50. Summarize the nurse's role in integumentary assessment, pressure ulcer prevention, and patient education.",
    modelAnswer: "Nurses perform regular skin inspections, reposition immobile patients to prevent pressure injuries, and educate patients on sun safety and self-exams."
  }
];

const EXAM_ID = "integumentary-system-theory-cbt";

function runImport() {
  console.log(`Starting import for Exam ID: ${EXAM_ID}...`);
  console.log(`Verifying source questions count: ${sourceQuestions.length}`);

  if (sourceQuestions.length !== 50) {
    throw new Error(`Expected 50 questions, found ${sourceQuestions.length}`);
  }

  // Validate each question
  sourceQuestions.forEach((q, idx) => {
    const qNum = idx + 1;
    if (!q.category || !q.category.trim()) {
      throw new Error(`Question ${qNum} has missing category!`);
    }
    if (!q.question || !q.question.trim()) {
      throw new Error(`Question ${qNum} has missing question text!`);
    }
    if (!q.modelAnswer || !q.modelAnswer.trim()) {
      throw new Error(`Question ${qNum} has missing modelAnswer!`);
    }
  });

  const dbPath = path.resolve(process.cwd(), 'data/database.json');
  if (!fs.existsSync(dbPath)) {
    throw new Error(`database.json not found at ${dbPath}`);
  }

  const dbRaw = fs.readFileSync(dbPath, 'utf8');
  const database = JSON.parse(dbRaw);

  if (!database.exams) database.exams = [];
  if (!database.questions) database.questions = [];

  // Build standardized theory question objects with stable IDs: integumentary-theory-001 ... integumentary-theory-050
  const mappedQuestions = sourceQuestions.map((sq, idx) => {
    const questionNumber = idx + 1;
    const stableId = `integumentary-theory-${String(questionNumber).padStart(3, '0')}`;

    return {
      id: stableId,
      examId: EXAM_ID,
      questionType: "theory",
      questionNumber: questionNumber,
      category: sq.category,
      question: sq.question,
      questionText: sq.question,
      modelAnswer: sq.modelAnswer,
      explanation: sq.modelAnswer,
      rationale: sq.modelAnswer,
      options: [],
      course: "Anatomy",
      subjectName: "Anatomy",
      subjectId: "subj-anatomy",
      levelId: "lvl-nd1",
      topic: sq.category,
      difficulty: "Medium",
      isPublished: true,
      published: true,
      createdAt: "2026-09-24T12:00:00.000Z"
    };
  });

  const questionIds = mappedQuestions.map(q => q.id);

  // Remove any obsolete test questions from earlier phase
  database.questions = database.questions.filter((q: any) => {
    if (q.id && String(q.id).startsWith('theory-integ-')) return false;
    if (q.id && String(q.id).startsWith('integumentary-theory-')) return false;
    return true;
  });

  // Append new stable theory questions
  database.questions.push(...mappedQuestions);

  // Check if exam already exists
  const existingExamIndex = database.exams.findIndex((e: any) => e.id === EXAM_ID || e.id === 'cbt-theory-integumentary-50');

  const examRecord = {
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
    questionIds: questionIds,
    instructions: [
      "Answer all 50 comprehensive theoretical questions covering the integumentary system.",
      "You may type your answer directly or utilize voice recording/dictation tools.",
      "Submit your examination when complete to compare against standardized council model answers."
    ],
    createdAt: "2026-09-24T12:00:00.000Z",
    updatedAt: "2026-09-24T12:00:00.000Z"
  };

  if (existingExamIndex >= 0) {
    console.log(`Updating existing exam record at index ${existingExamIndex}...`);
    database.exams[existingExamIndex] = examRecord;
  } else {
    console.log(`Adding new exam record for ${EXAM_ID}...`);
    database.exams.push(examRecord);
  }

  // Also remove any remaining duplicate exam references if any
  const seenIds = new Set<string>();
  database.exams = database.exams.filter((e: any) => {
    if (seenIds.has(e.id)) return false;
    seenIds.add(e.id);
    return true;
  });

  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
  console.log(`Database successfully updated! Total exams: ${database.exams.length}, Total questions: ${database.questions.length}`);
}

runImport();
