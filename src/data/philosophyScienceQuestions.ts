// Philosophy and History of Science - 125 Objective CBT Questions
// Source: HTML CBT Question Bank
// Strictly preserves all 125 questions, options, answers, and explanations.

import { CBTExam, Question } from '../types.ts';

export const PHILOSOPHY_SCIENCE_EXAM_ID = 'cbt-philosophy-science-125';
export const PHILOSOPHY_SCIENCE_EXAM_TITLE = 'Philosophy and History of Science';

export interface RawObjectiveQuestion {
  id: number;
  q: string;
  options: string[];
  answer: number; // 0 = A, 1 = B, 2 = C, 3 = D
  explanation: string;
}

export const PHILOSOPHY_SCIENCE_RAW_QUESTIONS: RawObjectiveQuestion[] = [
  {
    id: 1,
    q: "Science is often described as 'trained and organized common sense' whose distinctive characteristic is:",
    options: ["A. Purely theoretical abstraction", "B. Unfalsifiable speculation about the supernatural", "C. Dogmatic adherence to ancient traditions", "D. Critical and accurate observation and description of things and events"],
    answer: 3,
    explanation: "Science evolved from common sense, characterized distinctively by critical and accurate observation and description of things and events."
  },
  {
    id: 2,
    q: "Knowledge pursued purely for its own sake without any consideration for practical application is known as:",
    options: ["A. Basic or pure science", "B. Environmental science", "C. Applied science", "D. Social science"],
    answer: 0,
    explanation: "Knowledge pursued for its own sake without practical application is basic or pure science."
  },
  {
    id: 3,
    q: "The earliest recorded human attempts to systematize knowledge include Paleolithic man carving on bones and stones and:",
    options: ["A. Writing cuneiform mathematical texts on papyrus", "B. Formulating quantum mechanics", "C. Painting on the walls of caves", "D. Constructing steam engines"],
    answer: 2,
    explanation: "Prehistoric records show Paleolithic man painted on cave walls and carved on bones and stones."
  },
  {
    id: 4,
    q: "Which ancient people possessed a decimal system based on man's ten fingers, multiplication tables, and used a system of land surveying stimulated by the periodic rise of the Nile?",
    options: ["A. The Babylonians and Egyptians", "B. The Romans", "C. The Chinese", "D. The Greeks"],
    answer: 0,
    explanation: "Babylonians and Egyptians possessed fixed measurement units, decimal systems, and geometry stimulated by the Nile."
  },
  {
    id: 5,
    q: "Among the first Greek scholars to seek fundamental causes of natural phenomena, who held that the earth was a flat disc floating on water?",
    options: ["A. Thales of Miletus", "B. Plato", "C. Pythagoras", "D. Aristotle"],
    answer: 0,
    explanation: "Thales the Ionian philosopher held that the earth was a flat disc floating on water."
  },
  {
    id: 6,
    q: "Which Greek philosopher was primarily interested in morals and the good life, showing little interest in questions about the non-human world?",
    options: ["A. Empedocles", "B. Socrates", "C. Aristotle", "D. Thales"],
    answer: 1,
    explanation: "Socrates focused primarily on morals and the good life rather than the non-human world."
  },
  {
    id: 7,
    q: "Why do some historians of science argue that Plato retarded the development of empirical science?",
    options: ["A. Because he banned writing in his academy", "B. Because of his great reverence for mathematics coupled with a lack of interest in its practical application to study the physical world", "C. Because he spent his entire life studying animal anatomy", "D. Because he rejected mathematics entirely"],
    answer: 1,
    explanation: "Plato's reverence for mathematics uncoupled from practical application led historians to note he retarded empirical science."
  },
  {
    id: 8,
    q: "Which anatomical and physiological error was famously committed by Aristotle?",
    options: ["A. He thought the heart was responsible for intelligence and considered the brain a cooling system", "B. He believed the liver produced all thoughts and emotions", "C. He thought the lungs digested food particles", "D. He believed the brain pumped blood through the body"],
    answer: 0,
    explanation: "Aristotle mistakenly thought the heart was responsible for intelligence and the brain was a cooling system."
  },
  {
    id: 9,
    q: "Who is traditionally regarded in the notes as the father of medicine?",
    options: ["A. Ptolemy", "B. Hippocrates", "C. Galen", "D. Dioscorides"],
    answer: 1,
    explanation: "Hippocrates is noted as the mathematician, physician, and father of medicine."
  },
  {
    id: 10,
    q: "The two greatest Greek scientists who dominated the golden age of the Roman Empire in the 2nd century A.D. were:",
    options: ["A. Plato and Aristotle", "B. Socrates and Democritus", "C. Ptolemy and Galen", "D. Thales and Pythagoras"],
    answer: 2,
    explanation: "Ptolemy (astronomer/geographer) and Galen (physician) dominated the 2nd century Roman Empire."
  },
  {
    id: 11,
    q: "The devastating plague of the 14th century that disrupted scientific activities for more than a century was known as the Bubonic plague or:",
    options: ["A. The White Death", "B. The Black Death", "C. The Red Plague", "D. The Great Influenza"],
    answer: 1,
    explanation: "The plague of the 15th (or 14th/15th transition as noted in text) century was the Bubonic plague christened the 'Black Death.'"
  },
  {
    id: 12,
    q: "Which Belgian anatomist published *De humani corporis fabrica* in 1543, modernizing anatomical teachings?",
    options: ["A. William Harvey", "B. Fallopius", "C. Marcelo Malpighi", "D. Andreas Vesalius"],
    answer: 3,
    explanation: "Andreas Vesalius published *De humani corporis fabrica* in 1543."
  },
  {
    id: 13,
    q: "Who developed the first astronomical telescope in the 17th century, revolutionizing astronomy?",
    options: ["A. Sir Isaac Newton", "B. Christian Huygens", "C. Robert Hooke", "D. Galileo Galilei"],
    answer: 3,
    explanation: "Galileo Galilei developed the first astronomical telescope at the top of the 17th century."
  },
  {
    id: 14,
    q: "Who invented the barometer during the 17th century?",
    options: ["A. Christian Huygens", "B. Robert Boyle", "C. Evangelista Torricelli", "D. Blaise Pascal"],
    answer: 2,
    explanation: "Evangelista Torricelli invented the barometer."
  },
  {
    id: 15,
    q: "Who developed quantitative chemistry by 1790 after extensive experimental efforts?",
    options: ["A. Robert Boyle", "B. John Dalton", "C. Antoine Laurent Lavoisier", "D. Joseph Priestley"],
    answer: 2,
    explanation: "Antoine Laurent Lavoisier developed quantitative chemistry by 1790."
  },
  {
    id: 16,
    q: "Charles Darwin propounded the theory of evolution in his famous book published in 1859, titled:",
    options: ["A. *Principles of Geology*", "B. *The Descent of Man*", "C. *The Origin of Species by Natural Selection*", "D. *Philosophie Zoologique*"],
    answer: 2,
    explanation: "Charles Darwin published *The origin of species by natural selection* in 1859."
  },
  {
    id: 17,
    q: "Which of the following is explicitly classified as a pseudo-science in the lecture notes?",
    options: ["A. Astronomy", "B. Chemistry", "C. Astrology", "D. Pharmacology"],
    answer: 2,
    explanation: "Astrology is cited as a pseudo-science, whereas astronomy is true science."
  },
  {
    id: 18,
    q: "The modern scientific method gradually evolved from the earlier works of Sir Francis Bacon in the 17th century, influenced by Galileo, Descartes, Kepler, and finally polished by:",
    options: ["A. Charles Darwin", "B. Isaac Newton", "C. Aristotle", "D. Albert Einstein"],
    answer: 1,
    explanation: "The scientific method evolved from Francis Bacon, Galileo, Descartes, Kepler, and was polished by Isaac Newton."
  },
  {
    id: 19,
    q: "Which environment consists of biotic factors (plants, animals, decomposers) and abiotic factors (air, water, climate, soil)?",
    options: ["A. Built environment", "B. External natural environment", "C. Internal physiological environment", "D. Socio-cultural environment"],
    answer: 1,
    explanation: "The external natural environment consists of biotic and abiotic factors."
  },
  {
    id: 20,
    q: "Which global phenomenon is primarily triggered by excessive greenhouse gas emissions resulting in global warming, volatile weather systems, and rising sea levels?",
    options: ["A. Soil salinization", "B. Eutrophication", "C. Climate change", "D. Deforestation"],
    answer: 2,
    explanation: "Greenhouse gas emissions trigger severe global warming and climate change."
  },
  {
    id: 21,
    q: "According to the United Nations Food and Agriculture Organization (FAO), food security is achieved when all people at all times have physical, social, and economic access to:",
    options: ["A. Sufficient, safe, and nutritious food meeting dietary needs and preferences", "B. Imported luxury food items", "C. Cheaply processed chemical foods", "D. High-calorie grain reserves managed by governments"],
    answer: 0,
    explanation: "Food security requires sufficient, safe, and nutritious food meeting dietary needs and preferences."
  },
  {
    id: 22,
    q: "Which pillar of food security represents the physical 'supply side' determined by regional agricultural yields and net food imports?",
    options: ["A. Utilization", "B. Stability", "C. Availability", "D. Access"],
    answer: 2,
    explanation: "Availability is the physical 'supply side' of food."
  },
  {
    id: 23,
    q: "The resilience of the food supply chain over time against periodic shocks like droughts or price inflation represents which pillar?",
    options: ["A. Availability", "B. Access", "C. Stability", "D. Utilization"],
    answer: 2,
    explanation: "Stability represents the resilience of the food supply chain over time against shocks."
  },
  {
    id: 24,
    q: "The widespread adoption of growing only one crop variety over vast geographic areas is known as:",
    options: ["A. Monoculture", "B. Crop rotation", "C. Agroforestry", "D. Hydroponics"],
    answer: 0,
    explanation: "Growing only one crop variety over vast areas is industrial monoculture."
  },
  {
    id: 25,
    q: "What term describes a population multiplying beyond the carrying capacity of its environment?",
    options: ["A. Metamorphosis", "B. Eutrophication", "C. Overshoot", "D. Homeostasis"],
    answer: 2,
    explanation: "Multiplying beyond carrying capacity is termed an overshoot."
  },
  {
    id: 26,
    q: "Self-regulating mechanisms in ecosystems that restore balance, such as predator populations controlling prey numbers, are called:",
    options: ["A. Linear regressions", "B. Catalytic cycles", "C. Positive feedback loops", "D. Negative feedback loops"],
    answer: 3,
    explanation: "Negative feedback loops are self-regulating mechanisms that restore balance."
  },
  {
    id: 27,
    q: "Energy and work are inter-related and share the same standard International System unit of measurement, which is the:",
    options: ["A. Pascal (Pa)", "B. Joule (J)", "C. Watt (W)", "D. Newton (N)"],
    answer: 1,
    explanation: "Energy and work share the same unit of measure, the Joule (J)."
  },
  {
    id: 28,
    q: "Which energy resource eventually outstripped coal and natural gas to dominate global energy production, currently holding about 44%?",
    options: ["A. Nuclear power", "B. Hydroelectric power", "C. Biomass", "D. Petroleum oil"],
    answer: 3,
    explanation: "Oil energy resources (44%) outstripped coal and natural gas."
  },
  {
    id: 29,
    q: "Heat energy measured in joules can be produced by five different methods using appropriate fuel, which includes gas firing, solid fuel firing, electrical fundamentals, nuclear reaction, and:",
    options: ["A. Geothermal steam extraction", "B. Oil firing", "C. Wind turbine rotation", "D. Solar photovoltaic generation"],
    answer: 1,
    explanation: "Heat energy is produced by gas firing, solid fuel firing, electrical fundamentals, nuclear reaction, and oil firing."
  },
  {
    id: 30,
    q: "What temperature range is typically achieved in arc heating to ensure the smooth joining of metals during welding?",
    options: ["A. Above 1000°C", "B. Above 6000°C", "C. Above 100°C", "D. Above 10000°C"],
    answer: 1,
    explanation: "Arc welding raises temperatures above 6000°C for smooth metal joining."
  },
  {
    id: 31,
    q: "Mechanical energy produced with respect to the position of a body is referred to as potential energy, while that possessed by virtue of motion is called:",
    options: ["A. Chemical energy", "B. Radiant energy", "C. Kinetic energy", "D. Thermal energy"],
    answer: 2,
    explanation: "Mechanical energy from position is potential energy; from motion it is kinetic energy."
  },
  {
    id: 32,
    q: "Which statutory authority in Nigeria holds the function of providing electricity at the lowest possible cost to consumers, largely through hydroelectric power generated at Kainji Dam?",
    options: ["A. CBN", "B. NEPA", "C. NNPC", "D. NAFDAC"],
    answer: 1,
    explanation: "NEPA has the statutory function in Nigeria to provide electricity, largely via Kainji Dam hydroelectric power."
  },
  {
    id: 33,
    q: "Direct conversion of chemical energy resulting from electrolysis or decomposition of an electrolyte into electricity is achieved through electrochemical energy converters known as:",
    options: ["A. Fuel cells or galvanic cells (e.g., batteries)", "B. Parabolic troughs", "C. Turbogenerators", "D. Heliostats"],
    answer: 0,
    explanation: "Electrochemical energy converters converting chemical energy directly to electricity are galvanic cells (batteries)."
  },
  {
    id: 34,
    q: "Plant-derived material used to generate energy through conversion to liquid or gaseous fuel is known as:",
    options: ["A. Anthracite", "B. Peat", "C. Biomass", "D. Bitumen"],
    answer: 2,
    explanation: "Biomass describes all plant-derived material used to generate energy."
  },
  {
    id: 35,
    q: "What is the solar constant at the outer atmosphere before absorption and scattering occur?",
    options: ["A. 2.500 kW/m^2", "B. 1.730 kW/m^2", "C. 1.373 kW/m^2", "D. 1.000 kW/m^2"],
    answer: 2,
    explanation: "At the outer atmosphere, the solar energy constant is 1.373 kW/m^2."
  },
  {
    id: 36,
    q: "Flat tracking mirrors that concentrate sun rays onto a central receiver tower without intermediate fluid transport pipes are called:",
    options: ["A. Heliostats", "B. Galvanic plates", "C. Thermocouples", "D. Photovoltaic cells"],
    answer: 0,
    explanation: "Flat tracking mirrors called heliostats concentrate sun rays onto a central receiver tower."
  },
  {
    id: 37,
    q: "The splitting of a heavy atomic nucleus like Uranium-235 when bombarded by a neutron, releasing massive energy and more neutrons to sustain a chain reaction, is called:",
    options: ["A. Nuclear fusion", "B. Radioactive decay series", "C. Atomic fission", "D. Isotopic substitution"],
    answer: 2,
    explanation: "Atomic fission is the bombardment of radioactive isotopes to split nuclei and release energy."
  },
  {
    id: 38,
    q: "The transformation of vegetable matter into peat through humification and metamorphosis in water-logged environments occurs over:",
    options: ["A. Several decades", "B. Thousands of years", "C. A few days", "D. Billions of years"],
    answer: 1,
    explanation: "Peat formation via humification and metamorphosis takes thousands of years."
  },
  {
    id: 39,
    q: "Nigerian coal is officially graded and classified as:",
    options: ["A. Anthracite", "B. Bituminous", "C. Lignite", "D. Sub-bituminous"],
    answer: 3,
    explanation: "Nigerian coal is graded as sub-bituminous."
  },
  {
    id: 40,
    q: "Which petroleum fraction has the highest boiling point and is commonly used for surfacing roads?",
    options: ["A. Diesel oil", "B. Kerosine", "C. Bitumen", "D. Petrol (gasoline)"],
    answer: 2,
    explanation: "Bitumen has the highest boiling point among fractions listed for road surfacing."
  },
  {
    id: 41,
    q: "The world's economically exploitable petroleum reserve is heavily concentrated in which region, holding approximately 54%?",
    options: ["A. Europe", "B. Middle East", "C. Africa", "D. North America"],
    answer: 1,
    explanation: "Middle East holds 54% of the world's petroleum reserve."
  },
  {
    id: 42,
    q: "The earliest known mathematical artifact, a baboon fibula dating back roughly 40,000 years containing 29 distinct notches for counting, is called the:",
    options: ["A. Ishango bone", "B. Rosetta stone", "C. Cuneiform tablet", "D. Lebombo bone"],
    answer: 3,
    explanation: "The Lebombo bone is the oldest known mathematical artifact (40,000 years, baboon fibula with 29 notches)."
  },
  {
    id: 43,
    q: "The ancient Egyptian hieroglyphic numeral system was a base-10 system that was purely:",
    options: ["A. Additive", "B. Imaginary", "C. Positional", "D. Multiplicative"],
    answer: 0,
    explanation: "Egyptian hieroglyphic numerals formed a base-10 additive numeral system."
  },
  {
    id: 44,
    q: "Which numeral system relied on seven distinct Latin letters (I, V, X, L, C, D, M) and lacked a zero, making complex arithmetic calculations extremely difficult?",
    options: ["A. Sumerian cuneiform", "B. Roman numeral system", "C. Egyptian hieroglyphics", "D. Hindu-Arabic numerals"],
    answer: 1,
    explanation: "Roman numerals relied on seven Latin letters and lacked zero."
  },
  {
    id: 45,
    q: "Who wrote the first formal rules for using zero in arithmetic operations in 628 CE?",
    options: ["A. Brahmagupta", "B. Omar Khayyam", "C. Fibonacci", "D. Al-Khwarizmi"],
    answer: 0,
    explanation: "Brahmagupta wrote the first formal rules for zero in 628 CE."
  },
  {
    id: 46,
    q: "Caliph al-Mamum, ruler of Baghdad from 809 to 833 AD, supported scholars including Muhammad Ibn Musa al-Khwarazmi, who wrote a seminal treatise titled:",
    options: ["A. *Ars Magna*", "B. *Summa de Arithmetica*", "C. *Liber Abac*", "D. *Hisab al-jabr wa'l-Muqabalah*"],
    answer: 3,
    explanation: "Al-Khwarazmi wrote *Hisab al-jabr wa'l-Mqabalah*."
  },
  {
    id: 47,
    q: "In Arabic algebra terminology, what does 'al-muqabala' mean?",
    options: ["A. Multiplying coefficients by variables", "B. Graphing curves on a coordinate plane", "C. Eliminating fractional denominators", "D. Combining similar terms on either side of an equation"],
    answer: 3,
    explanation: "Al-muqabala means combining similar terms on either side of an equation."
  },
  {
    id: 48,
    q: "Who introduced the equality sign (=) for algebraic equations in 1557?",
    options: ["A. Girolamo Cardano", "B. Thomas Harriot", "C. François Viète", "D. Robert Recorde"],
    answer: 3,
    explanation: "Robert Recorde introduced the equality sign (=)."
  },
  {
    id: 49,
    q: "The fusion of algebra and geometry in the 17th century, creating coordinate axes and equations of curves, was achieved by René Descartes and:",
    options: ["A. Christiaan Huygens", "B. Gottfried Wilhelm Leibniz", "C. Blaise Pascal", "D. Pierre de Fermat"],
    answer: 3,
    explanation: "Descartes and Fermat fused algebra and geometry into analytic geometry in the 17th century."
  },
  {
    id: 50,
    q: "Who introduced the word 'function' in mathematics in 1694?",
    options: ["A. Gottfried Wilhelm Leibniz", "B. René Descartes", "C. Johann Bernoulli", "D. Leonhard Euler"],
    answer: 0,
    explanation: "Leibniz introduced the word 'function' in 1694."
  },
  {
    id: 51,
    q: "Imaginary numbers were first used incidentally by Cardan in 1545, but who above all recognized their fundamental significance and set up the relation e^(ix) = cos x + i sin x?",
    options: ["A. Jean-Robert Argand", "B. Leonhard Euler", "C. Karl Weierstrass", "D. Caspar Wessel"],
    answer: 1,
    explanation: "Euler recognized the fundamental significance of imaginary numbers and set up e^(ix) = cos x + i sin x."
  },
  {
    id: 52,
    q: "Which of the three major 20th-century schools of philosophy of mathematics insists that mathematics is entirely reducible to logic?",
    options: ["A. Platonism", "B. Formalism", "C. Intuitionism", "D. Logicism"],
    answer: 3,
    explanation: "Logicism sees mathematics as logic (Frege, Russell, Whitehead)."
  },
  {
    id: 53,
    q: "Intuitionism, which challenged many classical assumptions of mathematics by raising doubts about constructing real numbers out of rationals, was developed by:",
    options: ["A. Giuseppe Peano", "B. L.E.J. Brouwer", "C. Georg Cantor", "D. Kurt Gödel"],
    answer: 1,
    explanation: "L.E.J. Brouwer developed Intuitionism, challenging classical mathematical assumptions."
  },
  {
    id: 54,
    q: "In which historical period did farmers use rough pointed sticks to till the ground, later inventing wooden hoes, hand plows, and wheels?",
    options: ["A. Paleolithic period", "B. Iron Age", "C. Neolithic period", "D. Bronze Age"],
    answer: 2,
    explanation: "Neolithic farmers used rough pointed sticks, wooden hoes, and hand plows."
  },
  {
    id: 55,
    q: "Which brilliant ancient Greek mathematician and inventor discovered the water screw, built defensive war catapults, and combined mathematics with experiment in Syracuse?",
    options: ["A. Archimedes", "B. Heron of Alexandria", "C. Eratosthenes", "D. Aristarchus"],
    answer: 0,
    explanation: "Archimedes invented the water screw, war catapults, and combined mathematics with experiment."
  },
  {
    id: 56,
    q: "Which institution played a monumental role during the Middle Ages by treating work as honorable, elevating manual labor, and inventing the mechanical clock in the 13th century to synchronize community life?",
    options: ["A. The Roman Senate", "B. Benedictine monasteries", "C. Guilds of master masons", "D. Royal scientific societies"],
    answer: 1,
    explanation: "Benedictine monasteries elevated work as honorable and invented the mechanical clock in the 13th century."
  },
  {
    id: 57,
    q: "Who invented lithography in 1789?",
    options: ["A. Thomas Savery", "B. Denis Papin", "C. William Nicholson", "D. Alois Senefelder"],
    answer: 3,
    explanation: "Alois Senefelder invented lithography in 1789."
  },
  {
    id: 58,
    q: "Who proposed the first useful steam engine in 1663?",
    options: ["A. Edward Somerset", "B. Thomas Savery", "C. Denis Papin", "D. Thomas Newcomen"],
    answer: 0,
    explanation: "Edward Somerset proposed the first useful steam engine in 1663."
  },
  {
    id: 59,
    q: "Who exhibited a model engine before the Royal Society of England in 1699, leading to the commercial use of steam engines for pumping water?",
    options: ["A. Thomas Newcomen", "B. Thomas Savery", "C. John Cawley", "D. James Watt"],
    answer: 1,
    explanation: "Thomas Savery exhibited a model engine before the Royal Society in 1699."
  },
  {
    id: 60,
    q: "Who produced a really powerful railway locomotive by 1814, transforming land transportation?",
    options: ["A. James Rumsey", "B. Matthew Boulton", "C. Isambard Kingdom Brunel", "D. George Stephenson"],
    answer: 3,
    explanation: "George Stephenson produced a really powerful locomotive by 1814."
  },
  {
    id: 61,
    q: "Who invented the first commercial gas engine in 1860?",
    options: ["A. Nikolaus Otto", "B. Alphonse Beau de Rochas", "C. Lenoir", "D. Gottlieb Daimler"],
    answer: 2,
    explanation: "Lenoir invented the first commercial gas engine in 1860."
  },
  {
    id: 62,
    q: "Who built the first four-stroke engine using gas in 1870, which was later developed into a petrol engine by Gottlieb Daimler in 1886?",
    options: ["A. Nikolaus August Otto", "B. Lenoir", "C. Karl Benz", "D. Rudolf Diesel"],
    answer: 0,
    explanation: "Dr. Nikolaus August Otto built a four-stroke gas engine in 1870."
  },
  {
    id: 63,
    q: "Who proposed the term 'cybernetics' in 1948 to define the science of 'control and communication in the animal and the machine'?",
    options: ["A. Claude Shannon", "B. Norbert Wiener", "C. John von Neumann", "D. Alan Turing"],
    answer: 1,
    explanation: "Norbert Wiener proposed the term 'cybernetics' in 1948."
  },
  {
    id: 64,
    q: "Around 3000 BCE, which peoples produced the first effective metal swords, shields, and chariots?",
    options: ["A. The Babylonians and Assyrians", "B. The Aegeans and Balkans", "C. The Romans and Greeks", "D. The Chinese and Japanese"],
    answer: 1,
    explanation: "Aegeans and Balkans produced the first effective metal swords and shields around 3000 BCE."
  },
  {
    id: 65,
    q: "Who invented iron-smelting using coke rather than charcoal after the Black Death, helping transform Britain into a manufacturing center?",
    options: ["A. Abraham Darby", "B. Richard Arkwright", "C. Thomas Newcomen", "D. Samuel Crompton"],
    answer: 0,
    explanation: "Abraham Darby invented iron-smelting with coke rather than charcoal."
  },
  {
    id: 66,
    q: "Who discovered dynamite and blasting gelatin between 1865 and 1867, later establishing the prestigious annual international prize bearing his name?",
    options: ["A. Alfred Bernhard Nobel", "B. Alexander Graham Bell", "C. Guglielmo Marconi", "D. Thomas Edison"],
    answer: 0,
    explanation: "Alfred Bernhard Nobel discovered dynamite and endowed the Nobel prizes."
  },
  {
    id: 67,
    q: "What 19th-century device consisted of a series of stationary figures giving an illusion of movement when viewed through the slits of a revolving drum?",
    options: ["A. The Kaleidoscope", "B. The Zoetrope", "C. The Phonograph", "D. The Camera Obscura"],
    answer: 1,
    explanation: "The Zoetrope gave an impression of movement using a revolving drum and slits."
  },
  {
    id: 68,
    q: "The surreptitious dumping of toxic nuclear waste from Western Europe that caused diplomatic rows and severe illness in Nigeria occurred at which location?",
    options: ["A. Lagos", "B. Kaduna", "C. Port Harcourt", "D. Koko"],
    answer: 3,
    explanation: "Toxic nuclear waste dumped in Nigeria came through Koko."
  },
  {
    id: 69,
    q: "Which river basin in South America is cited in the notes as an example of ecological destruction and greenhouse gas emissions when heavy machinery attempted to subdue it?",
    options: ["A. The Amazon", "B. The Orinoco", "C. The São Francisco", "D. The Paraná"],
    answer: 0,
    explanation: "The Amazon forest is cited for environmental disruption caused by heavy machinery and burning."
  },
  {
    id: 70,
    q: "Which Greek astronomer made a remarkably accurate measurement of the earth's circumference?",
    options: ["A. Aristarchus of Samos", "B. Ptolemy", "C. Hipparchus", "D. Eratosthenes"],
    answer: 3,
    explanation: "Eratosthenes made a remarkably accurate measurement of the earth."
  },
  {
    id: 71,
    q: "Who is recognized as the ancient astronomer who developed trigonometry?",
    options: ["A. Eratosthenes", "B. Hipparchus", "C. Pappus", "D. Diophantus"],
    answer: 1,
    explanation: "Hipparchus was the astronomer who developed trigonometry."
  },
  {
    id: 72,
    q: "Who was the female mathematician, astronomer, and philosopher of the 5th century AD, daughter of Theon of Alexandria?",
    options: ["A. Aglaonice", "B. Theano", "C. Hypatia", "D. Aspasia"],
    answer: 2,
    explanation: "Hypatia was the 5th-century mathematician, astronomer, and philosopher, daughter of Theon."
  },
  {
    id: 73,
    q: "What specific invention facilitated printing and typography in Europe by the 15th century?",
    options: ["A. Photographic plate reproduction", "B. Movable type", "C. Lithography stone printing", "D. Rotary steam press"],
    answer: 1,
    explanation: "Movable type typography was invented in Europe by the 15th century."
  },
  {
    id: 74,
    q: "Who demonstrated a compound microscope in London in 1621, following early descriptions?",
    options: ["A. Cornelius Drebbel", "B. Antonie Van Leeuwenhoek", "C. Robert Hooke", "D. Zacharias Janssen"],
    answer: 0,
    explanation: "Cornelius Drebbel was said to have demonstrated a compound microscope in London in 1621."
  },
  {
    id: 75,
    q: "Who formulated the famous theories of energy conservation during the 19th century?",
    options: ["A. Lord Kelvin", "B. James Clerk Maxwell", "C. James Prescott Joule", "D. Michael Faraday"],
    answer: 2,
    explanation: "James Prescott Joule formulated the theories of energy conservation."
  },
  {
    id: 76,
    q: "Which of the following is NOT listed as a key discipline from which photovoltaic knowledge is derived?",
    options: ["A. Optics", "B. Solid-state (semiconductor) physics", "C. Materials sciences", "D. Organic macro-economics"],
    answer: 3,
    explanation: "Organic macro-economics is not listed as a source discipline for photovoltaics."
  },
  {
    id: 77,
    q: "What isotope of uranium is highlighted as the main fuel in modern nuclear reactors during the 2000s?",
    options: ["A. Uranium-235", "B. Uranium-234", "C. Uranium-233", "D. Uranium-238"],
    answer: 0,
    explanation: "Uranium-235 is highlighted as the main fuel in modern nuclear reactors."
  },
  {
    id: 78,
    q: "Which of the following engine cycles is utilized in high-efficiency parabolic dish solar-thermal systems to convert heat energy to electricity?",
    options: ["A. Carnot cycle and Otto cycle", "B. Rankine cycle and Diesel cycle", "C. Brayton-cycle and Stirling-cycle engines", "D. Joule cycle and Lorentz cycle"],
    answer: 2,
    explanation: "Brayton-cycle and Stirling-cycle engines are used in parabolic dish systems."
  },
  {
    id: 79,
    q: "What is the approximate operating temperature achieved by parabolic trough solar concentrators?",
    options: ["A. 400°C", "B. 1500°C", "C. 1000°C", "D. 100°C"],
    answer: 0,
    explanation: "Parabolic trough operating temperature is about 400°C."
  },
  {
    id: 80,
    q: "What yeast-catalyzed biological process converts sugars into ethanol, carbon dioxide, and heat?",
    options: ["A. Fermentation", "B. Photosynthesis", "C. Glycolysis", "D. Hydrolysis"],
    answer: 0,
    explanation: "Fermentation converts sugars into ethanol, carbon dioxide, and heat using yeast."
  },
  {
    id: 81,
    q: "How is methanol produced from biomass in industrial processes?",
    options: ["A. By fractional distillation of crude plant sap", "B. By thermochemical degradation to form synthesis gas, followed by a shift gas reaction and pressurized catalytic conversion", "C. By natural evaporation under tropical sunlight", "D. By direct anaerobic digestion in swamp water"],
    answer: 1,
    explanation: "Methanol is made by thermochemical degradation to synthesis gas, shift gas reaction, and pressurized catalytic conversion."
  },
  {
    id: 82,
    q: "A typical bovine cattle produces about how much fresh dung annually?",
    options: ["A. 15 to 20 tons", "B. 5 to 7 tons", "C. 50 to 60 tons", "D. 1 to 2 tons"],
    answer: 1,
    explanation: "A typical bovine cattle produces about 5-7 tons of fresh dung annually."
  },
  {
    id: 83,
    q: "Which country is specifically cited in the text as a major global leader where ethanol is a major transport fuel and producer-gas technology is well developed?",
    options: ["A. India", "B. Brazil", "C. China", "D. Nigeria"],
    answer: 1,
    explanation: "Brazil is cited where ethanol is a major transport fuel and producer-gas technology is developed."
  },
  {
    id: 84,
    q: "What percentage of total energy sources in developing countries like Nigeria is constituted by biomass (mainly used for cooking and heating)?",
    options: ["A. 75%", "B. 25%", "C. 35%", "D. 10%"],
    answer: 2,
    explanation: "Biomass forms 35% of total sources of energy in developing countries like Nigeria."
  },
  {
    id: 85,
    q: "What is the estimated total annual hydraulic energy reserve potential measured in TWh/yr according to global gradient and flow measurements cited in the text?",
    options: ["A. 50,000 TWh/yr", "B. 9,802 TWh/yr", "C. 500,000 TWh/yr", "D. 100,000 TWh/yr"],
    answer: 1,
    explanation: "Hydraulic energy reserve is estimated at 9,802 TWh/yr."
  },
  {
    id: 86,
    q: "In the global distribution of uranium reserves at $26 per kg, what percentage is held by North America?",
    options: ["A. 40%", "B. 12%", "C. 52%", "D. 28%"],
    answer: 2,
    explanation: "North America holds 52% of uranium reserves at $26 per kg."
  },
  {
    id: 87,
    q: "What is the approximate temperature of the central core of the earth as cited in the geothermal energy section?",
    options: ["A. 5000°C", "B. 1000°C", "C. 100°C", "D. 400°C"],
    answer: 3,
    explanation: "The manual text references crustal temperature increase and core region values around 400°C."
  },
  {
    id: 88,
    q: "What is the estimated total wind power in the atmosphere over the land area of the world?",
    options: ["A. 650 x 10^9 TW/yr", "B. 1,500 TW/yr", "C. 1.73 x 10^14 KW", "D. 20 TW·h/yr"],
    answer: 0,
    explanation: "Total wind power in atmosphere over world land area is estimated at about 650 x 10^9 TW/yr."
  },
  {
    id: 89,
    q: "The Sumerian cuneiform script evolved directly from:",
    options: ["A. Pressing clay tokens into the wet outer surface of bullae before sealing them", "B. Weaving threads into numerical tapestries", "C. Painting hieroglyphs on royal tomb walls", "D. Carving notches on baboon fibulas"],
    answer: 0,
    explanation: "Sumerian cuneiform script evolved from pressing clay tokens into the outer surface of bullae."
  },
  {
    id: 90,
    q: "Which mathematician introduced the symbols greater than (>) and less than (<) into algebra?",
    options: ["A. François Viète", "B. Robert Recorde", "C. Thomas Harriot", "D. Albert Girard"],
    answer: 2,
    explanation: "Thomas Harriot introduced > and <."
  },
  {
    id: 91,
    q: "Who introduced decimal fractions and revolutionized computational mathematics prior to logarithms?",
    options: ["A. Henry Briggs", "B. Simon Stevin", "C. John Napier", "D. Jobst Bürgi"],
    answer: 1,
    explanation: "Simon Stevin introduced decimal fractions."
  },
  {
    id: 92,
    q: "What was the earliest mechanical computing device used by man, consisting of parallel lines and counters?",
    options: ["A. The slide rule", "B. The differential analyzer", "C. The astrolabe", "D. The abacus"],
    answer: 3,
    explanation: "The abacus was the earliest mechanical computing device."
  },
  {
    id: 93,
    q: "Who formulated the system of postulates for natural numbers that allowed the construction of various number systems and abstract algebraic structures?",
    options: ["A. Georg Cantor", "B. Gottlob Frege", "C. Richard Dedekind", "D. Giuseppe Peano"],
    answer: 3,
    explanation: "Giuseppe Peano developed postulates for natural numbers."
  },
  {
    id: 94,
    q: "Boolean algebras have important practical modern applications in:",
    options: ["A. Electric circuits and switching logic", "B. Organic chemical synthesis", "C. Biological taxonomy classification", "D. Planetary orbit calculations"],
    answer: 0,
    explanation: "Boolean algebras have important applications to electric circuits."
  },
  {
    id: 95,
    q: "The environmental term 'overshoot' occurs when:",
    options: ["A. An ecosystem maintains perfect dynamic equilibrium", "B. A population multiplies beyond the carrying capacity of its environment", "C. Renewable energy resources outstrip fossil fuel consumption", "D. Agricultural runoff creates beneficial algal growth"],
    answer: 1,
    explanation: "Overshoot occurs when a population multiplies beyond environmental carrying capacity."
  },
  {
    id: 96,
    q: "Which agricultural innovation uses satellite mapping, IoT soil sensors, and automated drone delivery to apply fertilizer and water strictly where needed?",
    options: ["A. Traditional rain-fed farming", "B. Slash-and-burn agriculture", "C. Precision farming", "D. Industrial monoculture"],
    answer: 2,
    explanation: "Precision farming utilizes satellite mapping, IoT sensors, and drones."
  },
  {
    id: 97,
    q: "The economic and structural bottleneck where up to one-third of all food produced is lost before reaching consumers due to inadequate transport and cold storage is called:",
    options: ["A. Monoculture blight", "B. Post-harvest food loss", "C. Agricultural runoff", "D. Enteric fermentation"],
    answer: 1,
    explanation: "Up to one-third of food lost before consumption is post-harvest food loss."
  },
  {
    id: 98,
    q: "Over-applying nitrogen and phosphorus fertilizers leads to agricultural runoff which triggers:",
    options: ["A. Glacier stabilization", "B. Widespread forestation", "C. Toxic algal blooms in marine ecosystems and soil fertility degradation", "D. Increased agricultural soil depth"],
    answer: 2,
    explanation: "Agricultural runoff of nitrogen and phosphorus triggers toxic algal blooms."
  },
  {
    id: 99,
    q: "Historical adaptive traits like body stature and skin pigmentation shaped by UV radiation and climate are examples of:",
    options: ["A. Societal economic systems", "B. Industrial pollution impacts", "C. Cultural artifacts of the Neolithic age", "D. Environmental determinants of human life and physiology"],
    answer: 3,
    explanation: "Body stature and skin pigmentation shaped by climate are environmental determinants of physiology."
  },
  {
    id: 100,
    q: "Displaced populations resulting from severe environmental degradation and climate disasters are referred to as:",
    options: ["A. Urban technocrats", "B. Industrial laborers", "C. Economic migrants", "D. Eco-migrants or climate refugees"],
    answer: 3,
    explanation: "Environmental degradation creates eco-migrants and climate refugees."
  },
  {
    id: 101,
    q: "Which organization established in 1945 defines food security globally?",
    options: ["A. World Trade Organization (WTO)", "B. Food and Agriculture Organization (FAO)", "C. World Health Organization (WHO)", "D. United Nations Development Programme (UNDP)"],
    answer: 1,
    explanation: "Food security definition was established globally by the UN Food and Agriculture Organization (FAO)."
  },
  {
    id: 102,
    q: "The economic and physical capacity of households to acquire food is known as:",
    options: ["A. Stability", "B. Utilization", "C. Availability", "D. Access"],
    answer: 3,
    explanation: "Access refers to economic and physical capacity of households to acquire food."
  },
  {
    id: 103,
    q: "The loss of genetic diversity in food systems is heavily accelerated by:",
    options: ["A. Agroforestry", "B. Organic manuring", "C. Crop rotation", "D. Industrial monoculture"],
    answer: 3,
    explanation: "Industrial monoculture reduces genetic diversity in food systems."
  },
  {
    id: 104,
    q: "Developing seed variations that are drought-tolerant and flood-resistant is a core component of:",
    options: ["A. Chemical pesticide manufacturing", "B. Fossil fuel extraction", "C. Climate-smart agronomy", "D. Traditional shifting cultivation"],
    answer: 2,
    explanation: "Climate-smart agronomy develops drought-tolerant and flood-resistant seeds."
  },
  {
    id: 105,
    q: "When a population exceeds carrying capacity, resource depletion leads to a population crash or:",
    options: ["A. Exponential growth surge", "B. Metamorphic stabilization", "C. Die-off", "D. Industrial evolution"],
    answer: 2,
    explanation: "Overshoot leads to population crash or die-off."
  },
  {
    id: 106,
    q: "The state of balance where constant changes occur but net stability is maintained is called:",
    options: ["A. Static stagnation", "B. Structural entropy", "C. Thermodynamic equilibrium", "D. Dynamic equilibrium"],
    answer: 3,
    explanation: "Dynamic equilibrium is a state of balance with constant changes and net stability."
  },
  {
    id: 107,
    q: "Heat energy transferred between bodies is a result of differences in:",
    options: ["A. Volume", "B. Pressure", "C. Mass", "D. Temperature"],
    answer: 3,
    explanation: "Heat is energy transferred due to temperature differences."
  },
  {
    id: 108,
    q: "The device developed for mechanically transferring coal into a burning bed and removing ash continuously without clogging is called:",
    options: ["A. Sintering furnace", "B. Pulverized-bed firing", "C. Fixed-bed firing", "D. Gas burner injection"],
    answer: 2,
    explanation: "Fixed-bed firing transfers coal mechanically and removes ash continuously."
  },
  {
    id: 109,
    q: "Resistance heating generates heat due to electrical resistance when current passes through conducting materials such as:",
    options: ["A. Glass and porcelain", "B. Copper-nickel alloys or platinum", "C. Solid wood blocks", "D. Pure distilled water"],
    answer: 1,
    explanation: "Resistance heating uses conducting materials like nickel-copper alloys or platinum."
  },
  {
    id: 110,
    q: "Which wave band in electromagnetic radiation has the maximum heating effect?",
    options: ["A. Infra-red wave band", "B. Ultraviolet wave band", "C. X-ray band", "D. Gamma ray band"],
    answer: 0,
    explanation: "The infra-red wave band has the maximum heating effect among radiations."
  },
  {
    id: 111,
    q: "The nuclei of atoms are identified by their atomic number (number of protons) and mass number (number of protons and):",
    options: ["A. Photons", "B. Neutrons", "C. Electrons", "D. Positrons"],
    answer: 1,
    explanation: "Mass number is the number of protons and neutrons."
  },
  {
    id: 112,
    q: "The device used for controlled atomic fission in nuclear power plants is called a:",
    options: ["A. Electro-gas dynamic converter", "B. Magneto-hydrodynamic converter", "C. Nuclear thermal converter (nuclear reactor)", "D. Galvanic cell"],
    answer: 2,
    explanation: "Nuclear thermal converters (nuclear reactors) are used for controlled atomic fission."
  },
  {
    id: 113,
    q: "Which hydrocarbon series in petroleum is most familiar and expressed by the general formula C_n H_(2n+2)?",
    options: ["A. Olefin series", "B. Naphthene series", "C. Paraffin series", "D. Aromatic series"],
    answer: 2,
    explanation: "The paraffin series is most familiar with general formula C_n H_(2n+2)."
  },
  {
    id: 114,
    q: "In the fractional distillation of crude oil, which fraction is obtained at the highest boiling temperatures as a heavy residue used for surfacing roads?",
    options: ["A. Bitumen and wax", "B. Petrol (gasoline)", "C. Kerosine", "D. Liquefied Petroleum Gas (LPG)"],
    answer: 0,
    explanation: "Bitumen and wax are heavy solid/residue fractions with high boiling points."
  },
  {
    id: 115,
    q: "Which form of natural gas is the easiest to handle and can be pumped directly to consumers without flaring?",
    options: ["A. Dissolved crude gas", "B. Associated gas", "C. Non-associated gas", "D. Coal-tar gas"],
    answer: 2,
    explanation: "Non-associated natural gas can be pumped directly to consumers without flaring problems."
  },
  {
    id: 116,
    q: "The Ishango bone was found near which major geographical landmark?",
    options: ["A. Lake Victoria", "B. The Amazon River", "C. The Euphrates River", "D. The Nile River"],
    answer: 3,
    explanation: "The Ishango bone was found near the Nile River."
  },
  {
    id: 117,
    q: "Which Arab poet and mathematician attempted to classify all equations up to the fourth degree and solved cubic equations geometrically using conics?",
    options: ["A. Omar Khayyam", "B. Al-Biruni", "C. Thabit ibn Qurra", "D. Al-Khwarizmi"],
    answer: 0,
    explanation: "Omar Khayyam classified cubic equations into 13 types and solved them using conics."
  },
  {
    id: 118,
    q: "Who invented the water screw to raise water and defended Syracuse against Roman siege using catapults?",
    options: ["A. Ctesibius", "B. Archimedes", "C. Hero of Alexandria", "D. Philo of Byzantium"],
    answer: 1,
    explanation: "Archimedes invented the water screw and defense catapults in Syracuse."
  },
  {
    id: 119,
    q: "In the development of printing, who developed rotary printing machines following lines suggested in 1790?",
    options: ["A. Alois Senefelder", "B. William Nicholson", "C. Johann Gutenberg", "D. Laurens Coster"],
    answer: 1,
    explanation: "Rotary printing machines were developed following William Nicholson's 1790 lines."
  },
  {
    id: 120,
    q: "In Edward Bellamy's 1888 book *Looking Backward 2000-1887*, what futuristic technology did he describe?",
    options: ["A. Computerized artificial intelligence", "B. Interplanetary space travel", "C. Telephonic diffusion of music", "D. Nuclear submarine navigation"],
    answer: 2,
    explanation: "Edward Bellamy described telephonic diffusion of music in *Looking Backward 2000-1887*."
  },
  {
    id: 121,
    q: "What characterizes automation in contrast to earlier mechanization where humans operated machines?",
    options: ["A. The complete elimination of electrical power in favor of steam engines", "B. The restriction of manufacturing strictly to monastic guilds", "C. The reliance solely on animal muscle power", "D. The systematic application of the feedback principle so machines control their own operations without human operators in the loop"],
    answer: 3,
    explanation: "Automation uses the feedback principle so machines control their own operations without human operators in the loop."
  },
  {
    id: 122,
    q: "The linking together of production machines by means of automatic transfers is classified as:",
    options: ["A. Numerical Control", "B. Process Control System", "C. Machines Integration", "D. Cybernetics"],
    answer: 2,
    explanation: "Machines Integration is the linking together of production machines by automatic transfers."
  },
  {
    id: 123,
    q: "The use of tape and other automatic devices to direct the operation of machines and machine systems is known as:",
    options: ["A. Biomass conversion", "B. Electro-gas dynamic conversion", "C. Numerical Control", "D. Fractional distillation"],
    answer: 2,
    explanation: "Numerical Control uses tape and automatic devices to direct machine operations."
  },
  {
    id: 124,
    q: "Which branch of science studies living things?",
    options: ["A. Geology", "B. Biology", "C. Chemistry", "D. Physics"],
    answer: 1,
    explanation: "Biology is the study of living things."
  },
  {
    id: 125,
    q: "Which branch of science studies the relationship between matter and energy?",
    options: ["A. Astronomy", "B. Biology", "C. Geology", "D. Physics"],
    answer: 3,
    explanation: "Physics is the study of the relationship between matter and energy."
  }
];

export const PHILOSOPHY_SCIENCE_QUESTION_IDS: string[] = PHILOSOPHY_SCIENCE_RAW_QUESTIONS.map(
  (q) => `phs-${String(q.id).padStart(3, '0')}`
);

/**
 * Builds the canonical CBTExam payload for the Philosophy and History of Science Objective CBT.
 */
export function buildPhilosophyScienceExamPayload(): CBTExam {
  const now = new Date().toISOString();

  return {
    id: PHILOSOPHY_SCIENCE_EXAM_ID,
    title: PHILOSOPHY_SCIENCE_EXAM_TITLE,
    courseCode: 'POS 101',
    department: 'Nursing',
    level: 'ND 1',
    levelId: 'lvl-nd1',
    subjectId: 'subj-phil-science',
    subjectName: 'Philosophy of Science',
    subjectColor: 'purple',
    description:
      'Standardized 125-Question Objective CBT Examination covering the historical evolution of science, ancient Egyptian and Babylonian discoveries, Greek philosophy, the scientific method, Renaissance advances, energy, agriculture, and philosophy of science.',
    examType: 'objective',
    durationMinutes: 60,
    totalQuestions: 125,
    actualQuestionCount: 125,
    passingScore: 50,
    questionIds: [...PHILOSOPHY_SCIENCE_QUESTION_IDS],
    instructions: [
      'This examination consists of exactly 125 single-answer multiple-choice questions.',
      'Total time allowed is exactly 60 minutes (60:00). Timer counts down automatically to 00:00.',
      'Each correct answer scores 1 mark. Maximum total score is 125 marks.',
      'The examination will automatically submit when the timer reaches 00:00.',
      'Navigate freely using Previous, Next, or the Question Palette drawer.',
      'All selected answers are saved continuously so you never lose progress.',
      'Upon completion, full answers, correct options, and clinical explanations are provided for review.'
    ],
    status: 'published',
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

const OPTION_KEYS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

/**
 * Builds the canonical list of 125 Question documents from the raw question bank.
 */
export function buildPhilosophyScienceQuestionPayloads(): Question[] {
  const now = new Date().toISOString();

  return PHILOSOPHY_SCIENCE_RAW_QUESTIONS.map((q) => {
    const questionId = `phs-${String(q.id).padStart(3, '0')}`;
    const correctLetter = OPTION_KEYS[q.answer] || 'A';

    return {
      id: questionId,
      originalId: q.id,
      questionNumber: q.id,
      questionType: 'objective' as const,
      category: 'Philosophy and History of Science',
      topic: 'Philosophy and History of Science',
      question: q.q,
      questionText: q.q,
      options: [...q.options],
      correct: q.answer,
      correctOption: correctLetter,
      explanation: q.explanation,
      rationale: q.explanation,
      course: 'Philosophy of Science',
      subjectId: 'subj-phil-science',
      subjectName: 'Philosophy of Science',
      subjectColor: 'purple',
      levelId: 'lvl-nd1',
      difficulty: 'Medium' as const,
      tags: ['Philosophy of Science', 'History of Science', 'CBT Objective'],
      status: 'published' as const,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    };
  });
}
