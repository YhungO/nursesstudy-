// Endocrine System 100 Questions - Anatomy
// Exact structure requested: { id, question, options, correct, rationale }

export interface RawEndocrineQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  rationale: string;
}

export const ENDOCRINE_QUESTIONS_RAW: RawEndocrineQuestion[] = [
  {
    id: 1,
    question: "What is the primary physiological function of the endocrine system compared to the autonomic nervous system?",
    options: [
      "Handles rapid, immediate reflex changes",
      "Manages slower, more precise, and long-lasting adjustments",
      "Regulates purely voluntary muscular contractions",
      "Controls localized short-lived thermal sensations"
    ],
    correct: 1,
    rationale: "The endocrine system is responsible for controlling slow, long-term processes like growth, metabolism, and chemical balance, whereas the autonomic nervous system handles rapid immediate changes."
  },
  {
    id: 2,
    question: "Why are endocrine glands frequently referred to as 'ductless glands'?",
    options: [
      "They secrete hormones directly into extensive capillary networks without tubes",
      "They possess specialized excretory ducts emptying into the skin surface",
      "They release their chemical messengers exclusively into lymphatic vessels",
      "They lack any blood supply and rely on interstitial diffusion alone"
    ],
    correct: 0,
    rationale: "Endocrine glands are surrounded by extensive capillary networks and secrete hormones directly into the bloodstream rather than traveling through tubes or ducts."
  },
  {
    id: 3,
    question: "Which of the following describes the anatomical position and composition of the pituitary gland?",
    options: [
      "Sits in the sella turcica of the frontal bone and consists of three distinct lobes",
      "Located in the hypophyseal fossa of the sphenoid bone, weighing ~500 mg with anterior and posterior lobes",
      "Attached to the brainstem by a thick fibrous stalk weighing approximately 15 grams",
      "Embedded directly within the thyroid isthmus in front of the laryngeal cartilages"
    ],
    correct: 1,
    rationale: "The pituitary gland sits in the hypophyseal fossa of the sphenoid bone, weighs around 500 mg, and consists of anterior and posterior lobes originating from different tissues."
  },
  {
    id: 4,
    question: "What unique vascular network transports hypothalamic releasing and inhibiting hormones straight to the anterior pituitary?",
    options: [
      "Circle of Willis",
      "Hepatic portal system",
      "Pituitary portal system",
      "Carotid sinus network"
    ],
    correct: 2,
    rationale: "The pituitary portal system is a unique network of vessels transporting blood straight from the hypothalamus into tiny sinusoids in contact with anterior pituitary secretory cells."
  },
  {
    id: 5,
    question: "How does the hypothalamus control the release of hormones from the posterior pituitary?",
    options: [
      "Via specialized portal vein blood neurosecretory transport",
      "Through direct nerve impulses triggering axon terminals in the posterior lobe",
      "By systemic arterial blood pressure fluctuations",
      "Through local paracrine prostaglandin diffusion across the dura mater"
    ],
    correct: 1,
    rationale: "Specialized neurons in the hypothalamus manufacture ADH and oxytocin, transport them down axons within the stalk, and release them directly via nerve impulses into posterior pituitary capillaries."
  },
  {
    id: 6,
    question: "Which anterior pituitary hormone is secreted in the highest amounts and drives rapid body growth during childhood?",
    options: [
      "Prolactin (PRL)",
      "Thyroid-Stimulating Hormone (TSH)",
      "Growth Hormone (GH)",
      "Adrenocorticotrophic Hormone (ACTH)"
    ],
    correct: 2,
    rationale: "Growth hormone (GH) is the most abundant anterior pituitary hormone, stimulating the growth and division of bones and skeletal muscles during childhood and adolescence."
  },
  {
    id: 7,
    question: "What is the primary stimulus for Growth Hormone (GH) secretion during daily physiological cycles?",
    options: [
      "High postprandial blood glucose levels",
      "Deep sleep, hypoglycemia, exercise, and stress",
      "Elevated plasma concentrations of cortisol",
      "Continuous exposure to high ambient temperatures"
    ],
    correct: 1,
    rationale: "GH secretion rises during deep sleep and is stimulated by hypoglycemia, exercise, anxiety, starvation, and trauma."
  },
  {
    id: 8,
    question: "What is the primary target and action of Prolactin (PRL) postnatally?",
    options: [
      "Uterine smooth muscle contraction during labor",
      "Stimulation of breast milk production and preparation during pregnancy",
      "Metabolic regulation of basal metabolic rate in skeletal muscle",
      "Inhibition of gonadotrophin-releasing hormone in the hypothalamus"
    ],
    correct: 1,
    rationale: "Prolactin is secreted during pregnancy and postpartum to prepare and maintain breast milk production for lactation."
  },
  {
    id: 9,
    question: "Which hypothalamic hormone controls the release of Thyroid-Stimulating Hormone (TSH)?",
    options: [
      "Corticotrophin-releasing hormone (CRH)",
      "Thyrotrophin-releasing hormone (TRH)",
      "Growth hormone-inhibiting hormone (GHIH)",
      "Prolactin-inhibiting hormone (PIH)"
    ],
    correct: 1,
    rationale: "TRH (thyrotrophin-releasing hormone) prompts the anterior pituitary to release TSH, which targets the thyroid gland."
  },
  {
    id: 10,
    question: "What environmental factor acts as a powerful physiological stimulus for TSH secretion to boost metabolic heat production?",
    options: [
      "Exposure to cold ambient temperatures",
      "High altitude atmospheric hypoxia",
      "Intense physical sunlight exposure",
      "Prolonged periods of deep sleep"
    ],
    correct: 0,
    rationale: "Exposure to cold is a powerful stimulant for TSH secretion, leading to increased thyroid hormone output to boost metabolic rate and maintain core body temperature."
  },
  {
    id: 11,
    question: "At what time of day do Adrenocorticotrophic Hormone (ACTH) and cortisol levels typically reach their peak in healthy circadian rhythms?",
    options: [
      "Midnight",
      "6:00 PM",
      "8:00 AM",
      "Noon"
    ],
    correct: 2,
    rationale: "ACTH and cortisol levels fluctuate daily, reaching their peak around 8:00 AM and lowest points around midnight and 6:00 PM."
  },
  {
    id: 12,
    question: "What inhibitory neurotransmitter/hormone keeps prolactin release in check during non-pregnant states?",
    options: [
      "Somatostatin",
      "Dopamine (Prolactin-inhibiting hormone, PIH)",
      "Oxytocin",
      "Melatonin"
    ],
    correct: 1,
    rationale: "Prolactin release from the anterior pituitary is kept in check by prolactin-inhibiting hormone (PIH), which is dopamine."
  },
  {
    id: 13,
    question: "What is the primary function of Follicle-Stimulating Hormone (FSH) in males?",
    options: [
      "Stimulates testosterone synthesis in interstitial cells",
      "Stimulates production of spermatozoa in the testes",
      "Induces secondary sexual hair growth",
      "Regulates scrotal temperature homeostasis"
    ],
    correct: 1,
    rationale: "FSH stimulates the production of gametes—spermatozoa in the male testis—while LH stimulates testosterone secretion."
  },
  {
    id: 14,
    question: "Which hormone is responsible for stimulating ovulation and corpus luteum progesterone secretion in females?",
    options: [
      "Prolactin",
      "Oxytocin",
      "Luteinising Hormone (LH)",
      "Thyroxine"
    ],
    correct: 2,
    rationale: "LH controls oestrogen and progesterone secretion during the reproductive cycle, with a surge triggering ovulation and subsequent progesterone synthesis by the corpus luteum."
  },
  {
    id: 15,
    question: "What physiological mechanism characterizes the action of oxytocin during childbirth?",
    options: [
      "Negative feedback loop halting uterine contractions",
      "Positive feedback loop amplifying cervical stretching and contraction force",
      "Endocrine downregulation via hypothalamic receptor desensitization",
      "Paracrine inhibition mediated by local prostaglandins"
    ],
    correct: 1,
    rationale: "Oxytocin operates via a positive feedback mechanism where cervical stretch triggers more oxytocin release, increasing contraction force until delivery occurs."
  },
  {
    id: 16,
    question: "What are the primary target tissues for oxytocin during and after childbirth?",
    options: [
      "Renal distal convoluted tubules and collecting ducts",
      "Uterine smooth muscle and myoepithelial cells of lactating breasts",
      "Adrenal cortex zona fasciculata and glomerulosa",
      "Pancreatic alpha and beta islet cells"
    ],
    correct: 1,
    rationale: "Oxytocin targets uterine smooth muscle during labor and myoepithelial cells surrounding milk glands for milk ejection during suckling."
  },
  {
    id: 17,
    question: "Where are Antidiuretic Hormone (ADH) and oxytocin synthesized before being transported to the posterior pituitary?",
    options: [
      "Anterior pituitary glandular cells",
      "Hypothalamic supraoptic and paraventricular nuclei",
      "Posterior pituitary pituicytes",
      "Adrenal medullary chromaffin cells"
    ],
    correct: 1,
    rationale: "Posterior pituitary hormones are synthesized in cell bodies of the hypothalamus (supraoptic and paraventricular nuclei) and transported down axons."
  },
  {
    id: 18,
    question: "What is the primary renal effect of Antidiuretic Hormone (ADH) when blood osmotic pressure rises?",
    options: [
      "Increases sodium excretion in the proximal tubules",
      "Increases water reabsorption in distal convoluted tubules and collecting ducts",
      "Dilates renal afferent arterioles to increase glomerular filtration rate",
      "Stimulates renin release from juxtaglomerular cells"
    ],
    correct: 1,
    rationale: "ADH acts on distal convoluted tubules and collecting ducts, increasing water permeability so more water is reabsorbed, reducing urine volume."
  },
  {
    id: 19,
    question: "What alternative pharmacological name is given to Antidiuretic Hormone when released in high concentrations during severe blood loss?",
    options: [
      "Vasopressin",
      "Aldosterone",
      "Angiotensinogen",
      "Epinephrine"
    ],
    correct: 0,
    rationale: "In high concentrations, ADH causes vasoconstriction in small arteries, raising systemic blood pressure, which earned it the name vasopressin."
  },
  {
    id: 20,
    question: "What condition results from hyposecretion of Antidiuretic Hormone (ADH) due to hypothalamic damage?",
    options: [
      "Diabetes mellitus type 1",
      "Diabetes insipidus",
      "Conn's syndrome",
      "Addison's disease"
    ],
    correct: 1,
    rationale: "Diabetes insipidus involves ADH hyposecretion, causing excretion of massive volumes of dilute urine (polyuria) and extreme thirst (polydipsia)."
  },
  {
    id: 21,
    question: "What is the characteristic anatomical shape and location of the thyroid gland?",
    options: [
      "Kidney-shaped gland situated above the renal fascia",
      "Butterfly-shaped gland with two lobes and an isthmus in front of the larynx and trachea",
      "Pea-sized structure embedded in the sphenoid bone hypophyseal fossa",
      "Lobulated structure overlying the superior mediastinum behind the sternum"
    ],
    correct: 1,
    rationale: "The thyroid gland is butterfly-shaped, consisting of two lobes joined by an isthmus in front of the trachea at cervical vertebrae levels."
  },
  {
    id: 22,
    question: "What specialized cells within the thyroid follicles secrete the glycoprotein thyroglobulin?",
    options: [
      "Parafollicular C-cells",
      "Follicular epithelial cells",
      "Pituicytes",
      "Chromaffin cells"
    ],
    correct: 1,
    rationale: "Thyroid follicles are walled by cuboidal follicular cells that secrete colloid containing thyroglobulin precursor molecules."
  },
  {
    id: 23,
    question: "Which dietary element is absolutely essential for the synthesis of thyroid hormones T₃ and T₄?",
    options: [
      "Calcium",
      "Iodine",
      "Iron",
      "Potassium"
    ],
    correct: 1,
    rationale: "Iodine is essential for thyroid hormone synthesis, and the thyroid gland selectively takes it up via iodine trapping."
  },
  {
    id: 24,
    question: "Between tri-iodothyronine (T₃) and thyroxine (T₄), which hormone is more physiologically potent at target cellular receptors?",
    options: [
      "Thyroxine (T₄) because it has four iodine atoms",
      "Tri-iodothyronine (T₃) because most T₄ is converted into T₃ inside cells",
      "Both possess identical biological potency",
      "Neither; they require parathyroid hormone co-activation"
    ],
    correct: 1,
    rationale: "Although T₄ is more abundant, T₃ is much more physiologically important and potent because most T₄ is converted to T₃ intracellularly."
  },
  {
    id: 25,
    question: "What clinical condition results from severe dietary iodine deficiency leading to chronic TSH hypersecretion and thyroid enlargement?",
    options: [
      "Exophthalmos",
      "Goitre",
      "Acromegaly",
      "Tetany"
    ],
    correct: 1,
    rationale: "Iodine deficiency increases TSH secretion, causing cell proliferation and physical enlargement of the gland known as goitre."
  },
  {
    id: 26,
    question: "What metabolic changes are characteristically observed in a patient suffering from hyperthyroidism (Graves' disease)?",
    options: [
      "Decreased basal metabolic rate, weight gain, and cold intolerance",
      "Increased basal metabolic rate, weight loss with good appetite, heat intolerance, and anxiety",
      "Severe bradycardia, dry cold skin, mental slowness, and constipation",
      "Myxoedema swelling of facial subcutaneous tissues and brittle hair"
    ],
    correct: 1,
    rationale: "Hyperthyroidism causes elevated basal metabolic rate, weight loss despite good appetite, heat intolerance, sweating, anxiety, and tachycardia."
  },
  {
    id: 27,
    question: "What autoimmune mechanism causes Graves' disease?",
    options: [
      "Destruction of thyroid follicular cells by cytotoxic T-cells",
      "Production of autoantibodies that mimic TSH and stimulate excessive T₃/T₄ secretion",
      "Blockade of hypothalamic TRH receptors by circulating globulins",
      "Suppression of anterior pituitary lactotroph cell proliferation"
    ],
    correct: 1,
    rationale: "Graves' disease is an autoimmune disorder where antibodies mimic TSH, triggering unregulated overproduction of thyroid hormones."
  },
  {
    id: 28,
    question: "What prominent ocular sign is frequently associated with Graves' disease due to retro-orbital tissue buildup?",
    options: [
      "Cataract opacity",
      "Exophthalmos",
      "Glaucomatous cupping",
      "Retinal detachment"
    ],
    correct: 1,
    rationale: "Exophthalmos is the protrusion of the eyeballs creating a staring appearance, caused by excess fat and fibrous tissue accumulation behind the eyes."
  },
  {
    id: 29,
    question: "What pathological feature characterizes Hashimoto's thyroiditis leading to hypothyroidism?",
    options: [
      "Autoantibody destruction of thyroglobulin synthesis and thyroid cells",
      "Hypersecretion of pituitary TSH due to pituitary adenoma",
      "Ectopic production of thyroid hormones by bronchial tumors",
      "Excessive dietary iodine supplementation"
    ],
    correct: 0,
    rationale: "Hashimoto's disease involves autoantibodies reacting against thyroglobulin and thyroid cells, blocking hormone synthesis and causing acquired hypothyroidism."
  },
  {
    id: 30,
    question: "What physical and developmental consequences occur in congenital hypothyroidism (cretinism) if untreated early in life?",
    options: [
      "Tall stature with accelerated epiphyseal plate fusion",
      "Profound cognitive impairment, short disproportionate limbs, and large protruding tongue",
      "Rapid weight loss and hyperactive neuromuscular reflexes",
      "Permanent hypocalcaemic tetany and seizure disorders"
    ],
    correct: 1,
    rationale: "Untreated congenital hypothyroidism leads to permanent cognitive impairment, stunted growth with short limbs, coarse dry skin, and a large protruding tongue."
  },
  {
    id: 31,
    question: "How many parathyroid glands are typically embedded in the posterior surface of the thyroid lobes?",
    options: [
      "Two",
      "Four",
      "Six",
      "Eight"
    ],
    correct: 1,
    rationale: "There are four parathyroid glands, each weighing around 50 mg, embedded two on each posterior lobe of the thyroid gland."
  },
  {
    id: 32,
    question: "What is the primary function of Parathyroid Hormone (PTH)?",
    options: [
      "Lowers blood calcium levels by stimulating osteoblasts",
      "Raises blood calcium levels by stimulating osteoclasts and renal tubular calcium reabsorption",
      "Increases urinary calcium excretion to prevent hypercalcaemia",
      "Promotes intestinal calcium binding protein destruction"
    ],
    correct: 1,
    rationale: "PTH increases blood calcium levels by stimulating bone-resorbing osteoclasts and increasing renal tubular calcium reabsorption."
  },
  {
    id: 33,
    question: "Which thyroid cells secrete calcitonin, and what is its effect on plasma calcium?",
    options: [
      "Follicular cells; raises blood calcium via bone resorption",
      "Parafollicular C-cells; lowers blood calcium by promoting osteoblast activity",
      "Pituicytes; has no effect on mineral metabolism",
      "Chromaffin cells; stimulates renal sodium excretion"
    ],
    correct: 1,
    rationale: "Calcitonin is secreted by parafollicular C-cells and lowers blood calcium levels by promoting osteoblast calcium uptake and bone storage."
  },
  {
    id: 34,
    question: "What clinical syndrome results from hypocalcaemia-induced peripheral nerve hyper-excitability causing painful muscle spasms?",
    options: [
      "Myxoedema",
      "Tetany",
      "Addisonian crisis",
      "Cushing's syndrome"
    ],
    correct: 1,
    rationale: "Tetany is caused by hypocalcaemia increasing nerve excitability, leading to severe spasms of skeletal muscles and inward bending of hands/feet."
  },
  {
    id: 35,
    question: "What is the most common cause of clinical hypocalcaemia and secondary hyperparathyroidism?",
    options: [
      "Chronic kidney disease impairing renal calcium handling",
      "Acute myocardial infarction",
      "Benign parathyroid adenoma secretion",
      "Autoimmune destruction of pancreatic beta cells"
    ],
    correct: 0,
    rationale: "Chronic kidney disease is the commonest cause of hypocalcaemia because failing kidneys fail to retain calcium and excrete large quantities."
  },
  {
    id: 36,
    question: "What is the anatomical structure and zonation of the adrenal glands?",
    options: [
      "Single uniform gland situated anterior to the pancreas",
      "Pyramid-shaped glands on kidney poles consisting of an outer cortex and inner medulla",
      "Bilateral retroperitoneal organs composed entirely of nervous tissue",
      "Endocrine structures attached directly to the hepatic portal vein"
    ],
    correct: 1,
    rationale: "Adrenal glands sit on the upper pole of each kidney and are composed of two distinct parts: an outer cortex and an inner medulla."
  },
  {
    id: 37,
    question: "Which portion of the adrenal gland is essential for life?",
    options: [
      "Adrenal medulla",
      "Adrenal cortex",
      "Both cortex and medulla equally",
      "Neither is essential for survival"
    ],
    correct: 1,
    rationale: "The adrenal cortex is essential to life due to its production of vital glucocorticoids and mineralocorticoids, whereas the medulla is not."
  },
  {
    id: 38,
    question: "What hormones are secreted by the adrenal medulla when stimulated by the sympathetic nervous system?",
    options: [
      "Cortisol and aldosterone",
      "Adrenaline (epinephrine) and noradrenaline (norepinephrine)",
      "Insulin and glucagon",
      "Thyroxine and calcitonin"
    ],
    correct: 1,
    rationale: "The adrenal medulla releases adrenaline (80%) and noradrenaline (20%) directly into the bloodstream to augment the fight-or-flight response."
  },
  {
    id: 39,
    question: "What physiological changes are produced by adrenal medullary hormones during acute stress?",
    options: [
      "Decreased heart rate, pupil constriction, and enhanced digestive motility",
      "Increased heart rate, blood pressure, blood glucose, pupil dilation, and visceral vasoconstriction",
      "Hypoglycaemia, peripheral vasodilation, and bronchial constriction",
      "Reduced metabolic rate and increased glycogen storage in the liver"
    ],
    correct: 1,
    rationale: "Medullary catecholamines increase heart rate, blood pressure, blood glucose, dilate pupils, and divert blood to essential organs."
  },
  {
    id: 40,
    question: "What primary glucocorticoid is secreted by the adrenal cortex to manage stress, metabolism, and inflammation?",
    options: [
      "Aldosterone",
      "Cortisol (hydrocortisone)",
      "Androstenedione",
      "Epinephrine"
    ],
    correct: 1,
    rationale: "Cortisol is the primary glucocorticoid, vital for survival through its management of metabolism, immune regulation, and stress adaptation."
  },
  {
    id: 41,
    question: "What metabolic effect does excess cortisol produce on blood glucose and protein stores?",
    options: [
      "Hypoglycaemia and enhanced protein synthesis",
      "Hyperglycaemia via gluconeogenesis, protein catabolism, and muscle wasting",
      "Hypoglycaemia via glycogenesis and peripheral glucose uptake",
      "Normoglycaemia with accelerated lipogenesis"
    ],
    correct: 1,
    rationale: "Glucocorticoids drive catabolism, breaking down proteins and fats and triggering gluconeogenesis, resulting in hyperglycaemia."
  },
  {
    id: 42,
    question: "What mineralocorticoid regulates electrolyte and water balance by promoting renal sodium reabsorption and potassium excretion?",
    options: [
      "Cortisol",
      "Aldosterone",
      "Renin",
      "Angiotensin II"
    ],
    correct: 1,
    rationale: "Aldosterone, the primary mineralocorticoid, acts on renal tubules to encourage sodium reabsorption and potassium excretion."
  },
  {
    id: 43,
    question: "What enzymatic cascade is triggered by low renal blood flow or low sodium to stimulate aldosterone release?",
    options: [
      "Renin-Angiotensin-Aldosterone System (RAAS)",
      "Hypothalamic-pituitary-adrenal axis",
      "Cyclic AMP protein kinase pathway",
      "Sympathetic adrenergic feedback loop"
    ],
    correct: 0,
    rationale: "Low renal blood flow causes kidneys to release renin, converting angiotensinogen to Angiotensin I, which ACE converts to Angiotensin II, stimulating aldosterone."
  },
  {
    id: 44,
    question: "What clinical syndrome results from chronic hypersecretion of glucocorticoids (e.g., due to pituitary adenoma or corticosteroid therapy)?",
    options: [
      "Addison's disease",
      "Cushing's syndrome",
      "Conn's syndrome",
      "Phaeochromocytoma"
    ],
    correct: 1,
    rationale: "Cushing's syndrome results from glucocorticoid excess, causing moon face, truncal adiposity, muscle wasting, osteoporosis, and hyperglycaemia."
  },
  {
    id: 45,
    question: "What physical features are typically characteristic of Cushing's syndrome?",
    options: [
      "Generalized muscle hypertrophy and severe weight loss",
      "Adiposity of the face ('moon face'), neck, and abdomen, with thin limbs and muscle wasting",
      "Permanent hypotension and profound hyponatraemia",
      "Exophthalmos and bilateral thyroid gland hyperplasia"
    ],
    correct: 1,
    rationale: "Cushing's features include moon face, buffalo hump, abdominal obesity, thin skin, muscle wasting in limbs, and purple striae."
  },
  {
    id: 46,
    question: "What pathological condition is caused by destruction of the adrenal cortex leading to combined glucocorticoid and mineralocorticoid deficiency?",
    options: [
      "Cushing's disease",
      "Addison's disease",
      "Conn's syndrome",
      "Acromegaly"
    ],
    correct: 1,
    rationale: "Addison's disease involves destruction of the adrenal cortex, causing hyposecretion of glucocorticoids and mineralocorticoids."
  },
  {
    id: 47,
    question: "What clinical signs are distinctive of Addison's disease?",
    options: [
      "Hypertension, hypernatraemia, and rapid weight gain",
      "Muscle weakness, hypotension, hyperpigmentation, hyponatraemia, and hyperkalaemia",
      "Exophthalmos, tachycardia, and heat intolerance",
      "Moon face, hyperglycemia, and truncal obesity"
    ],
    correct: 1,
    rationale: "Addison's disease causes muscle weakness, weight loss, increased skin pigmentation, low blood pressure, hyponatraemia, and hyperkalaemia."
  },
  {
    id: 48,
    question: "What life-threatening medical emergency can occur when a patient with Addison's disease encounters acute stress like infection?",
    options: [
      "Addisonian crisis",
      "Thyroid storm",
      "Diabetic ketoacidosis",
      "Hypoglycaemic coma"
    ],
    correct: 0,
    rationale: "Addisonian crisis is a medical emergency featuring severe vomiting, diarrhea, hypotension, and circulatory collapse triggered by acute stress."
  },
  {
    id: 49,
    question: "Primary hyperaldosteronism caused by an aldosterone-secreting adrenal tumor is known as:",
    options: [
      "Conn's syndrome",
      "Sheehan's syndrome",
      "Hashimoto's disease",
      "Graves' disease"
    ],
    correct: 0,
    rationale: "Conn's syndrome is primary hyperaldosteronism caused by an adrenal tumor, leading to sodium/water retention, hypertension, and hypokalaemia."
  },
  {
    id: 50,
    question: "What tumor of the adrenal medulla causes paroxysmal hypertension, severe headache, sweating, and hyperglycaemia?",
    options: [
      "Phaeochromocytoma",
      "Pituitary microadenoma",
      "Thyroid follicular carcinoma",
      "Islet cell adenoma"
    ],
    correct: 0,
    rationale: "Phaeochromocytoma is a catecholamine-secreting tumor of the adrenal medulla causing severe hypertension, sweating, headache, and flushing."
  },
  {
    id: 51,
    question: "What percentage of pancreatic tissue possesses endocrine function in the form of pancreatic islets (islets of Langerhans)?",
    options: [
      "2%",
      "25%",
      "75%",
      "98%"
    ],
    correct: 0,
    rationale: "Only 2% of pancreatic tissue has an endocrine function, consisting of clusters called pancreatic islets that secrete hormones directly into blood."
  },
  {
    id: 52,
    question: "Which cells within the pancreatic islets secrete insulin, and what is their approximate proportion?",
    options: [
      "Alpha cells; ~20%",
      "Beta cells; ~75%",
      "Delta cells; ~5%",
      "PP cells; ~50%"
    ],
    correct: 1,
    rationale: "Beta cells account for about 75% of islet cells and secrete insulin, while alpha cells secrete glucagon and delta cells secrete somatostatin."
  },
  {
    id: 53,
    question: "What is the normal physiological range for fasting blood glucose in humans?",
    options: [
      "1.0 to 2.5 mmol/L",
      "3.5 to 8.0 mmol/L (63–144 mg/100 mL)",
      "10.0 to 15.5 mmol/L",
      "20.0 to 30.0 mmol/L"
    ],
    correct: 1,
    rationale: "Normal blood glucose is regulated between 3.5 and 8 mmol/L by the opposing actions of glucagon and insulin."
  },
  {
    id: 54,
    question: "What primary anabolic effect does insulin exert on cellular metabolism?",
    options: [
      "Stimulates glycogenolysis and hepatic glucose output",
      "Promotes cellular glucose uptake, glycogenesis, lipogenesis, and protein synthesis",
      "Triggers gluconeogenesis from amino acid breakdown",
      "Inhibits potassium uptake across muscle cell membranes"
    ],
    correct: 1,
    rationale: "Insulin promotes nutrient storage by driving cellular glucose uptake, glycogen synthesis, fatty acid synthesis, and amino acid uptake."
  },
  {
    id: 55,
    question: "What is the primary physiological action of glucagon?",
    options: [
      "Lowers blood glucose by driving cellular glucose entry",
      "Raises blood glucose by stimulating glycogenolysis and gluconeogenesis in the liver",
      "Inhibits both insulin and growth hormone secretion",
      "Stimulates renal tubular sodium reabsorption"
    ],
    correct: 1,
    rationale: "Glucagon opposes insulin by driving up blood glucose through liver glycogen breakdown (glycogenolysis) and gluconeogenesis."
  },
  {
    id: 56,
    question: "What role does somatostatin secreted by pancreatic delta cells play?",
    options: [
      "Potent stimulator of insulin and glucagon release",
      "Acts as a brake, inhibiting the secretion of both insulin and glucagon",
      "Increases gastrointestinal motility and acid secretion",
      "Directly stimulates anterior pituitary GH synthesis"
    ],
    correct: 1,
    rationale: "Somatostatin acts as a brake by inhibiting the secretion of both insulin and glucagon, as well as slowing anterior pituitary growth hormone."
  },
  {
    id: 57,
    question: "What is the primary difference in age of onset and etiology between Type 1 and Type 2 Diabetes Mellitus?",
    options: [
      "Type 1 is autoimmune/childhood onset with absolute insulin deficiency; Type 2 is adult onset linked to obesity and insulin resistance",
      "Type 1 affects older adults due to diet; Type 2 affects infants due to genetic mutations",
      "Type 1 is caused by anterior pituitary tumors; Type 2 is caused by posterior pituitary failure",
      "There are no etiological differences; both are purely viral infections"
    ],
    correct: 0,
    rationale: "Type 1 diabetes is autoimmune with childhood onset destroying beta cells requiring insulin; Type 2 is adult onset linked to obesity and insulin resistance."
  },
  {
    id: 58,
    question: "Why does glycosuria and polyuria occur in uncontrolled diabetes mellitus?",
    options: [
      "Renal tubular reabsorption capacity for glucose is overwhelmed, creating high filtrate osmotic pressure that prevents water reabsorption",
      "Posterior pituitary over-secretes ADH in response to high blood sugar",
      "Glomerular filtration rate drops to zero, causing urinary bladder overflow",
      "Renal threshold for glucose drops to 1 mmol/L"
    ],
    correct: 0,
    rationale: "When glucose in filtrate exceeds renal threshold, leftover glucose increases osmotic pressure, reducing water reabsorption and causing polyuria."
  },
  {
    id: 59,
    question: "What metabolic byproduct causes the characteristic 'pear drops' or acetone breath odor in diabetic ketoacidosis?",
    options: [
      "Lactic acid",
      "Ketones (acetone and butyrate)",
      "Uric acid crystals",
      "Bicarbonate ions"
    ],
    correct: 1,
    rationale: "When cells cannot use glucose, fat breakdown increases, releasing ketones (acetone and butyrate) which are excreted in breath and urine."
  },
  {
    id: 60,
    question: "What neurological and systemic danger occurs when plasma glucose drops below 4 mmol/L (70 mg/dL) due to excess insulin?",
    options: [
      "Diabetic ketoacidosis coma",
      "Hypoglycaemic coma and irreversible brain neuronal damage",
      "Hypertensive encephalopathy",
      "Hyperosmolar non-ketotic syndrome"
    ],
    correct: 1,
    rationale: "Brain neurons depend heavily on glucose; severe hypoglycaemia causes confusion, sweating, trembling, and can progress to coma and brain damage."
  },
  {
    id: 61,
    question: "What constitutes the leading cause of death in approximately 80% of diabetes mellitus patients?",
    options: [
      "Diabetic macroangiopathy and cardiovascular complications (myocardial infarction, stroke)",
      "Acute renal papillary necrosis",
      "Severe pulmonary tuberculosis infection",
      "Malignant thyroid anaplastic carcinoma"
    ],
    correct: 0,
    rationale: "Cardiovascular disturbances from macroangiopathy (atheroma and calcification) account for about 80% of deaths in diabetes mellitus."
  },
  {
    id: 62,
    question: "Diabetic microangiopathy is characterized pathologically by:",
    options: [
      "Dilation of large elastic arteries",
      "Thickening of the epithelial basement membrane of arterioles, capillaries, and venules",
      "Complete disappearance of all venous valves in lower limbs",
      "Fibrosis of the cardiac conduction system"
    ],
    correct: 1,
    rationale: "Microangiopathy affects small blood vessels, causing thickening of the epithelial basement membrane of arterioles and capillaries."
  },
  {
    id: 63,
    question: "Why are diabetic patients particularly susceptible to foot ulcers, gangrene, and amputation?",
    options: [
      "Combination of peripheral neuropathy (loss of sensation), impaired blood supply (micro/macroangiopathy), and slower healing",
      "Excessive physical exercise and footwear friction",
      "Autoimmune destruction of foot skin epithelial cells",
      "Complete absence of sweat glands in distal extremities"
    ],
    correct: 0,
    rationale: "Diabetic foot results from impaired blood supply, peripheral neuropathy masking small injuries, slow healing, and high infection susceptibility."
  },
  {
    id: 64,
    question: "Where is the pineal gland located, and what hormone does it secrete?",
    options: [
      "Attached to the roof of the third ventricle; secretes melatonin",
      "Embedded in the renal cortex; secretes erythropoietin",
      "Located within the anterior mediastinum; secretes thymosin",
      "Attached to the posterior pituitary stalk; secretes oxytocin"
    ],
    correct: 0,
    rationale: "The pineal gland is a tiny body attached to the third ventricle roof that secretes melatonin in response to darkness."
  },
  {
    id: 65,
    question: "How is melatonin secretion regulated across a 24-hour circadian rhythm?",
    options: [
      "Daylight suppresses it while darkness triggers peak night levels",
      "Constant steady secretion throughout day and night",
      "Triggered exclusively by high blood glucose levels after meals",
      "Stimulated by anterior pituitary TSH surges"
    ],
    correct: 0,
    rationale: "Melatonin release is governed by light: daylight suppresses it, while darkness triggers peak levels at night, coordinating circadian rhythms."
  },
  {
    id: 66,
    question: "Which organ with a secondary endocrine function secretes erythropoietin to stimulate red blood cell production?",
    options: [
      "Heart (Atria)",
      "Kidney",
      "Stomach gastric mucosa",
      "Adipose tissue"
    ],
    correct: 1,
    rationale: "The kidneys secrete erythropoietin, which targets red bone marrow to stimulate erythrocyte production."
  },
  {
    id: 67,
    question: "What hormone is secreted by atrial heart muscle cells to decrease renal sodium and water reabsorption?",
    options: [
      "Angiotensin II",
      "Atrial Natriuretic Peptide (ANP)",
      "Thymosin",
      "Leptin"
    ],
    correct: 1,
    rationale: "The heart atria secrete atrial natriuretic peptide (ANP), targeting kidney tubules to decrease sodium and water reabsorption."
  },
  {
    id: 68,
    question: "What is the function of leptin produced by adipose tissue?",
    options: [
      "Stimulates appetite and decreases energy expenditure",
      "Provides a feeling of satiety after eating and regulates energy balance",
      "Increases blood pressure via potent vasoconstriction",
      "Stimulates follicle-stimulating hormone secretion"
    ],
    correct: 1,
    rationale: "Adipose tissue secretes leptin, which targets the hypothalamus to provide a feeling of fullness (satiety) after eating."
  },
  {
    id: 69,
    question: "What is the endocrine role of the placenta during pregnancy?",
    options: [
      "Secretes human chorionic gonadotrophin (hCG) to maintain oestrogen and progesterone",
      "Produces insulin to regulate maternal blood glucose",
      "Releases antidiuretic hormone to prevent fetal dehydration",
      "Secretes calcitonin to protect maternal bone density"
    ],
    correct: 0,
    rationale: "The placenta secretes hCG, which targets the ovary to stimulate oestrogen and progesterone secretion during pregnancy."
  },
  {
    id: 70,
    question: "What are local hormones or paracrine substances like prostaglandins characterized by?",
    options: [
      "Long-lasting systemic blood circulation across distant organs",
      "Short-lived local action on neighboring cells, being rapidly metabolized",
      "Synthesis exclusively within anterior pituitary somatotroph cells",
      "Storage in large glandular vesicles for months"
    ],
    correct: 1,
    rationale: "Prostaglandins are lipid-based substances acting on neighboring cells with short-lived actions because they are quickly metabolized."
  },
  {
    id: 71,
    question: "What physiological roles are mediated by prostaglandins?",
    options: [
      "Inflammatory responses, pain potentiation, fever, blood clotting, and labor contractions",
      "Exclusively regulation of renal glomerular filtration rate",
      "Inhibition of gastric mucus production and acid neutralization",
      "Permanent depression of basal metabolic rate"
    ],
    correct: 0,
    rationale: "Prostaglandins play potent roles in inflammation, pain, gastric mucus protection, fever, blood pressure regulation, clotting, and labor."
  },
  {
    id: 72,
    question: "Histamine is synthesized and stored primarily by which cells in tissues and blood?",
    options: [
      "Mast cells in tissues and basophils in blood",
      "Erythrocytes and platelets",
      "Osteoclasts and chondrocytes",
      "Thyroid follicular epithelial cells"
    ],
    correct: 0,
    rationale: "Histamine is synthesized and stored by mast cells in tissues and basophils in blood, acting as an inflammatory mediator."
  },
  {
    id: 73,
    question: "How does aging generally affect overall endocrine system function?",
    options: [
      "Endocrine function often declines, though some hormone levels remain steady",
      "All endocrine glands undergo complete hypertrophy and hypersecretion",
      "Endocrine activity ceases entirely by age 40",
      "Hormone receptors multiply exponentially to compensate for aging"
    ],
    correct: 0,
    rationale: "Endocrine function often declines with age, though some hormone levels remain steady well into old age."
  },
  {
    id: 74,
    question: "What age-related change in the pancreatic islets increases the risk of Type 2 diabetes mellitus in older adults?",
    options: [
      "Hypertrophy of alpha cells producing excess insulin",
      "Decline in beta-cell function combined with weight gain",
      "Complete calcification of the pancreatic duct",
      "Autoimmune destruction by juvenile antibodies"
    ],
    correct: 1,
    rationale: "Within the pancreas, beta-cell function declines with age, which combined with weight gain significantly increases Type 2 diabetes risk."
  },
  {
    id: 75,
    question: "Which hormone level paradoxically rises with age, contributing to age-related osteoporosis?",
    options: [
      "Parathyroid Hormone (PTH)",
      "Growth Hormone (GH)",
      "Insulin",
      "Calcitonin"
    ],
    correct: 0,
    rationale: "PTH levels rise as people age, which can contribute to osteoporosis (weakening of the bones)."
  },
  {
    id: 76,
    question: "What condition is caused by prolonged hypersecretion of Growth Hormone in children before epiphyseal plate closure?",
    options: [
      "Acromegaly",
      "Gigantism",
      "Pituitary dwarfism",
      "Cushing's syndrome"
    ],
    correct: 1,
    rationale: "Gigantism occurs when GH levels are excessive in pre-pubescent children whose epiphyseal cartilages are still growing."
  },
  {
    id: 77,
    question: "What clinical features characterize acromegaly in adults?",
    options: [
      "Stunted overall skeletal growth with proportionate miniature stature",
      "Thickening of soft tissues and bones, coarse facial features, enlarged lower jaw, tongue, hands, and feet",
      "Severe bilateral exophthalmos and thyroid goitre",
      "Complete absence of pubertal secondary sexual characteristics"
    ],
    correct: 1,
    rationale: "Acromegaly occurs in adults after bone ossification is complete, causing thickened bones, coarse facial features, and enlarged jaw/hands/feet."
  },
  {
    id: 78,
    question: "What is panhypopituitarism?",
    options: [
      "Complete absence or deficiency of all anterior pituitary hormones",
      "Isolated deficiency of growth hormone alone",
      "Over-secretion of all posterior pituitary hormones",
      "Malignant tumor of the adrenal cortex"
    ],
    correct: 0,
    rationale: "Panhypopituitarism refers to the complete absence or deficiency of all anterior pituitary hormones resulting from physical damage or tumors."
  },
  {
    id: 79,
    question: "Sheehan's syndrome (postpartum necrosis of the anterior pituitary) is typically triggered by:",
    options: [
      "Severe hemorrhage and hypotensive shock during or after childbirth",
      "Gestational diabetes mellitus complications",
      "Autoimmune thyroiditis crossing the placenta",
      "Excessive oxytocin administration during labor"
    ],
    correct: 0,
    rationale: "Sheehan's syndrome occurs following hypotensive shock from severe hemorrhage during childbirth, causing ischemic necrosis of the vulnerable anterior pituitary."
  },
  {
    id: 80,
    question: "What is the primary cause of pituitary dwarfism during childhood?",
    options: [
      "Growth hormone (GH) deficiency due to genetic abnormality or tumor",
      "Excessive somatostatin secretion from pancreatic islets",
      "Primary hypothyroidism and iodine starvation",
      "Congenital adrenal hyperplasia"
    ],
    correct: 0,
    rationale: "Pituitary dwarfism is caused by GH deficiency during childhood, resulting in small stature with normal proportions and normal cognitive development."
  },
  {
    id: 81,
    question: "What is the principal clinical feature of diabetes insipidus?",
    options: [
      "High blood glucose and glycosuria",
      "Excretion of massive volumes of dilute urine (>10 liters/day) and extreme thirst",
      "Severe weight gain and myxoedema swelling",
      "Hypertension and hypokalaemic alkalosis"
    ],
    correct: 1,
    rationale: "Diabetes insipidus involves ADH hyposecretion, leading to massive excretion of dilute urine (>10 liters daily), dehydration, and extreme thirst."
  },
  {
    id: 82,
    question: "Hyperthyroidism is also clinically known by what term?",
    options: [
      "Myxoedema",
      "Thyrotoxicosis",
      "Cretinism",
      "Tetany"
    ],
    correct: 1,
    rationale: "Hyperthyroidism is also known as thyrotoxicosis, occurring when body tissues are exposed to excessive T₃ and T₄ levels."
  },
  {
    id: 83,
    question: "Why is cardiac failure a frequent and serious consequence of hyperthyroidism in older adults?",
    options: [
      "Aging heart struggles harder to pump blood to hyperactive body cells with high metabolic demand",
      "Direct autoimmune destruction of myocardial muscle fibers",
      "Complete blockage of the coronary sinus by parathyroid adenomas",
      "Massive sodium and water retention induced by aldosterone excess"
    ],
    correct: 0,
    rationale: "In older adults with hyperthyroidism, cardiac failure is common because the aging heart struggles to supply hyperactive body cells."
  },
  {
    id: 84,
    question: "Simple goitre without hyperthyroidism is primarily caused by:",
    options: [
      "Relative lack of T₃ and T₄ stimulating pituitary TSH hypersecretion and glandular hyperplasia",
      "Autonomic nerve stimulation from the adrenal medulla",
      "Metastatic calcification of parathyroid tissue",
      "Excess dietary iodine supplementation"
    ],
    correct: 0,
    rationale: "Simple goitre stems from a relative lack of T₃/T₄, where low plasma levels stimulate pituitary TSH to trigger gland hyperplasia and enlargement."
  },
  {
    id: 85,
    question: "Hyperparathyroidism is characterized clinically by:",
    options: [
      "Hypocalcaemia and muscle tetany",
      "Hypercalcaemia, renal calculi, polyuria, polydipsia, and bone demineralisation",
      "Severe hypoglycaemia and hypoglycaemic coma",
      "Hypokalemia and metabolic alkalosis"
    ],
    correct: 1,
    rationale: "Hyperparathyroidism features high blood calcium (hypercalcaemia) due to tumor PTH secretion, leading to renal stones, bone calcium loss, and fatigue."
  },
  {
    id: 86,
    question: "What is the commonest cause of chronic hypocalcaemia?",
    options: [
      "Chronic kidney disease",
      "Benign thyroid adenoma",
      "Primary aldosteronism",
      "Pheochromocytoma"
    ],
    correct: 0,
    rationale: "Chronic kidney disease is the commonest cause of hypocalcaemia because failing kidneys fail to retain calcium."
  },
  {
    id: 87,
    question: "Ectopic secretion of ACTH by a non-pituitary tumor (such as in the bronchus) can result in:",
    options: [
      "Addison's disease",
      "Cushing's syndrome",
      "Diabetes insipidus",
      "Conn's syndrome"
    ],
    correct: 1,
    rationale: "Cushing's syndrome can be caused by ectopic ACTH secretion from non-pituitary tumors like bronchial carcinomas, stimulating excess cortisol."
  },
  {
    id: 88,
    question: "What secondary effect does excess cortisol in Cushing's syndrome have on bone tissue?",
    options: [
      "Osteoporosis, kyphosis, and pathological fractures due to calcium loss",
      "Extreme osteoblast proliferation and bone lengthening",
      "Calcification of articular cartilage and joint fusion",
      "Complete ossification of all skeletal muscle tendons"
    ],
    correct: 0,
    rationale: "Cushing's syndrome causes osteoporosis, kyphosis, and pathological fractures from calcium loss and diminished protein synthesis in bones."
  },
  {
    id: 89,
    question: "What percentage of the adrenal cortex must typically be destroyed before Addison's disease symptoms become clinically severe?",
    options: [
      "More than 10%",
      "More than 50%",
      "More than 90%",
      "100% immediate collapse"
    ],
    correct: 2,
    rationale: "Because of considerable tissue reserve, Addison's disease is not usually severely debilitating until more than 90% of the adrenal cortex is destroyed."
  },
  {
    id: 90,
    question: "Primary hyperaldosteronism (Conn's syndrome) differs from secondary hyperaldosteronism because:",
    options: [
      "Primary is independent of the RAAS, usually due to an adrenal tumor; secondary is a physiological response to low renal perfusion",
      "Primary is caused by pituitary TSH excess; secondary is autoimmune",
      "Primary causes profound hypokalemia; secondary causes severe hyperkalemia",
      "There is no physiological difference between the two"
    ],
    correct: 0,
    rationale: "Primary hyperaldosteronism occurs independently of the RAAS (tumor), whereas secondary hyperaldosteronism is a response to low renal blood flow raising renin."
  },
  {
    id: 91,
    question: "What is the worldwide impact of diabetes mellitus as estimated by the International Diabetes Federation?",
    options: [
      "Affects 463 million adults (10% of adults aged 20-79), with high global complications",
      "Rarer than pituitary dwarfism, affecting under 1,000 people globally",
      "Limited exclusively to industrialized Northern European nations",
      "Completely eradicated due to modern oral hypoglycaemic drugs"
    ],
    correct: 0,
    rationale: "IDF estimated 463 million adults (10% of 20-79 demographic) live with diabetes globally, making it a major cause of blindness and renal failure."
  },
  {
    id: 92,
    question: "Gestational diabetes mellitus develops during pregnancy and is associated with:",
    options: [
      "Permanent cure in 100% of cases with zero future recurrence",
      "Higher risk of heavier-than-normal babies, stillbirths, and recurrence later in life",
      "Absolute lifelong requirement for high-dose intravenous glucocorticoids",
      "Complete atrophy of the maternal pancreas"
    ],
    correct: 1,
    rationale: "Gestational diabetes develops during pregnancy, may resolve after delivery, but recurs later and risks larger babies and stillbirths."
  },
  {
    id: 93,
    question: "What pathophysiological mechanism explains weight loss in Type 1 diabetes mellitus versus weight gain in Type 2?",
    options: [
      "Type 1 cells are starved of glucose and catabolize body fat and protein; Type 2 is linked to obesity and insulin resistance",
      "Type 1 patients consume excess dietary protein; Type 2 patients starve themselves",
      "Type 1 involves excessive thyroid hormone secretion; Type 2 involves myxoedema",
      "There is no difference in weight presentation between the two types"
    ],
    correct: 0,
    rationale: "In Type 1, cells are starved of glucose without insulin, triggering muscle wasting and fat catabolism, whereas Type 2 patients are typically obese."
  },
  {
    id: 94,
    question: "What triggers diabetic ketoacidosis (DKA) as a life-threatening emergency?",
    options: [
      "Severe insulin deficiency compounded by stressors like infection, causing profound acidosis and buffer exhaustion",
      "Excessive ingestion of dietary calcium tablets",
      "Sudden exposure to cold environmental temperatures",
      "Overdose of oral antihypertensive medications"
    ],
    correct: 0,
    rationale: "Ketoacidosis is a life-threatening emergency caused by severe insulin deficiency, dropping blood pH when ketone buffers are overwhelmed."
  },
  {
    id: 95,
    question: "What visual impairment represents the most common cause of blindness in adults aged 30–65 in developed countries?",
    options: [
      "Diabetic retinopathy",
      "Senile nuclear cataract",
      "Acute angle-closure glaucoma",
      "Retinoblastoma"
    ],
    correct: 0,
    rationale: "Diabetic retinopathy resulting from chronic microvascular damage is the commonest cause of blindness in working-age adults in developed countries."
  },
  {
    id: 96,
    question: "What is the function of thymosin secreted by the thymus gland?",
    options: [
      "Targets white blood cells (T-lymphocytes) to aid in their development and immune maturation",
      "Stimulates red blood cell production in bone marrow",
      "Regulates basal metabolic rate alongside thyroxine",
      "Controls water reabsorption in renal distal tubules"
    ],
    correct: 0,
    rationale: "The thymus secretes thymosin, which targets white blood cells (T-lymphocytes) to aid in their development and immune function."
  },
  {
    id: 97,
    question: "What local hormone group includes thromboxane A2, a potent aggregator of platelets?",
    options: [
      "Prostaglandins and related eicosanoids",
      "Catecholamines",
      "Steroid hormones",
      "Glycoprotein gonadotrophins"
    ],
    correct: 0,
    rationale: "Thromboxanes (like thromboxane A2) and leukotrienes are chemically similar compounds involved in clotting and inflammation."
  },
  {
    id: 98,
    question: "What role does serotonin (5-hydroxytryptamine) play in haemostasis?",
    options: [
      "Present in platelets and plays an active role in blood clotting",
      "Acts as a potent vasodilator lowering blood pressure instantly",
      "Stimulates hydrochloric acid secretion in gastric mucosa",
      "Inhibits aldosterone synthesis in the adrenal cortex"
    ],
    correct: 0,
    rationale: "Serotonin is present in platelets and plays an important role in haemostasis (blood clotting)."
  },
  {
    id: 99,
    question: "What is the primary consequence of reduced aldosterone and renin secretion in elderly individuals?",
    options: [
      "Postural hypotension and increased loss of sodium and water",
      "Severe hypertension and hypernatraemic oedema",
      "Permanent hypokalaemic tetany",
      "Polycythaemia vera"
    ],
    correct: 0,
    rationale: "Reduced aldosterone and renin secretion with age contributes to age-related postural hypotension and increased loss of sodium and water."
  },
  {
    id: 100,
    question: "Which gland's secretions are controlled directly by nervous tissue connection rather than portal blood releasing factors?",
    options: [
      "Posterior pituitary",
      "Anterior pituitary",
      "Thyroid gland",
      "Adrenal cortex"
    ],
    correct: 0,
    rationale: "The posterior pituitary is formed from nervous tissue, receiving hormones via axons of hypothalamic neurons rather than portal blood."
  }
];

const OPTION_KEYS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

// Convert to full Question models compatible with both the exact user structure and standard app models
export const ENDOCRINE_QUESTIONS = ENDOCRINE_QUESTIONS_RAW.map((q) => {
  const correctLetter = OPTION_KEYS[q.correct] || 'A';
  return {
    // Exact requested structure fields
    id: q.id,
    question: q.question,
    options: q.options,
    correct: q.correct,
    rationale: q.rationale,

    // App ecosystem & Course/Topic metadata
    course: 'Anatomy',
    subjectId: 'subj-anatomy',
    subjectName: 'Anatomy',
    subjectColor: 'teal',
    topic: 'Endocrine System',
    levelId: 'lvl-nd1',
    questionText: q.question,
    optionsStructured: q.options.map((optText, idx) => ({
      id: OPTION_KEYS[idx],
      text: optText,
    })),
    correctOption: correctLetter,
    explanation: q.rationale,
    difficulty: 'Medium' as const,
    tags: ['Anatomy', 'Endocrine System', 'Hormones'],
    createdAt: '2026-09-18T00:00:00.000Z',
  };
});
