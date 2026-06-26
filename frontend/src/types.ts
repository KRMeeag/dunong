export type Scores = { accuracy: number; confidence: number; clarity: number };
export type Session = { scores: Scores; feedback: string; date?: string };
export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };
export type ResourceType = "text" | "image" | "pdf" | "url";
export type Source = { id: string; type: ResourceType; label: string; content: string };
export type Flashcard = { q: string; a: string };
export type QuizItem = { question: string; choices: string[]; answer: number };
export type OralMode = "read-aloud" | "paraphrase" | "quiz-bee" | "recitation";
export type OralPhase = "select" | "setup" | "pick" | "practice" | "card-result" | "results";
export type OralCard = { id: string; content: string; hint?: string };
export type OralScore = { score: number; label: string; feedback: string; transcript: string };
export type Notebook = {
  id: string;
  title: string;
  sources: Source[];
  chatMessages: ChatMessage[];
  flashcards: Flashcard[];
  quiz: QuizItem[];
  createdAt: string;
};

export function offlineChat(message: string, lang: string): string {
  const msg = message.toLowerCase();
  const fil = lang === "FIL";

  // Greetings
  if (/hello|hi\b|kumusta|kamusta|hey|good morning|magandang/.test(msg))
    return fil
      ? "Kumusta! Offline mode kami ngayon pero nandito pa rin ako. Kaya kong mag-explain ng Math, Science, Filipino, History, at English kahit walang internet. Ano ang gusto mong pag-aralan?"
      : "Hello! I'm in offline mode but still here. I can explain Math, Science, Filipino, History, and English even without internet. What would you like to study?";

  if (/salamat|thank/.test(msg))
    return fil ? "Walang anuman! Kaya mo yan!" : "You're welcome! You've got this!";

  if (/motivat|encourage|pangamba|takot|nerbiyos|nervous|kaya ko ba/.test(msg))
    return fil
      ? "Kaya mo yan! Normal ang maging kinabahan — kahit ang pinakamagagaling na estudyante ay natatakot din. Ang laging sumusubok ang nagpapalakas ng kumpiyansa, hindi ang pagiging perpekto."
      : "You've got this! Feeling nervous is completely normal. What builds confidence is showing up repeatedly, not being perfect.";

  // ── MATHEMATICS ──────────────────────────────────────────────────────────
  if (/algebra|equation|variable|polynomial|factor|quadratic|linear equation|solve for|isolate x/.test(msg))
    return fil
      ? "Sa algebra, ang layunin ay hanapin ang value ng unknown variable. Para sa linear equation (hal. 2x + 3 = 7): ilipat ang constants sa isang side → 2x = 4 → x = 2. Para sa quadratic (ax² + bx + c = 0): gamitin ang quadratic formula x = (−b ± √(b²−4ac)) / 2a."
      : "In algebra, the goal is to find the unknown variable. For a linear equation (e.g. 2x + 3 = 7): move constants to one side → 2x = 4 → x = 2. For quadratics (ax² + bx + c = 0): use the quadratic formula x = (−b ± √(b²−4ac)) / 2a.";

  if (/geometry|area|perimeter|volume|circle|triangle|rectangle|pythagor|hypotenuse|polygon|angle/.test(msg))
    return fil
      ? "Mahahalagang formula sa Geometry — Area: rectangle = l×w, triangle = ½bh, circle = πr². Perimeter: rectangle = 2(l+w), circle = 2πr. Volume: prism = l×w×h, cylinder = πr²h. Pythagorean theorem: a² + b² = c² (para sa right triangle, c = hypotenuse)."
      : "Key Geometry formulas — Area: rectangle = l×w, triangle = ½bh, circle = πr². Perimeter: rectangle = 2(l+w), circle = 2πr. Volume: prism = l×w×h, cylinder = πr²h. Pythagorean theorem: a² + b² = c² (c = hypotenuse of a right triangle).";

  if (/trigon|sine|cosine|tangent|\bsin\b|\bcos\b|\btan\b|sohcahtoa|radian/.test(msg))
    return fil
      ? "Tandaan ang SOHCAHTOA: Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent. Special angles: sin 30°=½, cos 60°=½, tan 45°=1. I-convert degrees sa radians: i-multiply ng π/180."
      : "Remember SOHCAHTOA: Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent. Special angles: sin 30°=½, cos 60°=½, tan 45°=1. Convert degrees to radians: multiply by π/180.";

  if (/fraction|decimal|percent|ratio|proportion|numerator|denominator/.test(msg))
    return fil
      ? "Para mag-add/subtract ng fractions: kailangan ng common denominator. Para mag-multiply: i-multiply ang numerator at denominator nang direkta. Para mag-divide: i-flip ang pangalawang fraction (reciprocal) tapos i-multiply. Convert sa percent: i-multiply ng 100. Hal.: ¾ = 0.75 = 75%."
      : "To add/subtract fractions: find a common denominator. To multiply: multiply numerators and denominators directly. To divide: flip the second fraction (reciprocal) then multiply. Convert to percent: multiply by 100. E.g.: ¾ = 0.75 = 75%.";

  if (/statistic|probabilit|mean|median|mode|average|range|data/.test(msg))
    return fil
      ? "Sa statistics — Mean: kabuuan ÷ bilang ng data. Median: gitnang value kapag naayos na (odd) o average ng dalawang gitna (even). Mode: pinaka-madalas na value. Range: pinakamataas − pinakamababa. Probability = (favorable outcomes) ÷ (total outcomes)."
      : "Statistics — Mean: sum ÷ count. Median: middle value when sorted (odd) or average of two middle values (even). Mode: most frequent value. Range: highest − lowest. Probability = (favorable outcomes) ÷ (total outcomes).";

  if (/math|calculus|exponent|logarithm|function|slope|derivative|integer|prime number/.test(msg))
    return fil
      ? "Alin sa mga paksa ang gusto mong talakayin? Kaya kong mag-explain ng Algebra (equations), Geometry (shapes at formulas), Trigonometry (SOHCAHTOA), o Statistics (mean, median, mode, probability). Sabihin mo lang!"
      : "Which math topic would you like? I can explain Algebra (equations), Geometry (shapes and formulas), Trigonometry (SOHCAHTOA), or Statistics (mean, median, mode, probability). Just say which one!";

  // ── SCIENCE – BIOLOGY ────────────────────────────────────────────────────
  if (/\bcell\b|nucleus|membrane|mitochondria|organelle|prokaryote|eukaryote|ribosome/.test(msg))
    return fil
      ? "Ang cell ay pinakamaliit na yunit ng buhay. Plant cells ay may cell wall, chloroplast, at central vacuole — wala ito sa animal cells. Ang mitochondria ang 'powerhouse' na gumagawa ng ATP. Ang nucleus ang nagtatago ng DNA at nagko-control ng lahat ng cell functions."
      : "The cell is the smallest unit of life. Plant cells have a cell wall, chloroplasts, and a large central vacuole — animal cells do not. Mitochondria is the 'powerhouse' producing ATP energy. The nucleus stores DNA and controls all cell functions.";

  if (/photosynthesis|chlorophyll|chloroplast|glucose|respiration|atp/.test(msg))
    return fil
      ? "Photosynthesis (sa chloroplast): 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Gumagamit ang plants ng sunlight para gumawa ng glucose. Cellular Respiration (sa mitochondria): C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP energy. Ito ang kabaligtaran ng photosynthesis."
      : "Photosynthesis (in chloroplasts): 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Plants use sunlight to make glucose. Cellular Respiration (in mitochondria): C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP. This is the reverse of photosynthesis.";

  if (/genetic|heredity|dominant|recessive|allele|mendel|dna|rna|mutation|inherit|chromosome/.test(msg))
    return fil
      ? "Sa genetics ni Mendel: Dominant alleles (malaking letra, hal. A) ay nagtatago ng recessive (maliit, a). Sa Punnett square, Aa × Aa ay nagbibigay ng 3:1 ratio. Ang DNA ay double helix — A pairs sa T, C pairs sa G. Ang RNA naman ay single-stranded at ginagamit para gumawa ng proteins."
      : "Mendel's genetics: Dominant alleles (capital, e.g. A) mask recessive ones (lowercase, a). In a Punnett square, Aa × Aa gives a 3:1 ratio. DNA is a double helix — A pairs with T, C pairs with G. RNA is single-stranded and used to make proteins.";

  if (/ecosystem|food chain|food web|producer|consumer|decomposer|biome|ecology|population/.test(msg))
    return fil
      ? "Food chain: Producer (plants) → Primary consumer (herbivore) → Secondary consumer (carnivore) → Tertiary consumer. Sa bawat trophic level, ~10% lang ng energy ang nailipat (10% rule). Ang decomposers (bacteria, fungi) ay nagbabalik ng nutrients sa lupa para sa cycle na magtuloy."
      : "Food chain: Producer (plants) → Primary consumer (herbivore) → Secondary consumer (carnivore) → Tertiary consumer. At each trophic level, only ~10% of energy is transferred (10% rule). Decomposers (bacteria, fungi) return nutrients to the soil to continue the cycle.";

  // ── SCIENCE – CHEMISTRY ──────────────────────────────────────────────────
  if (/atom|element|periodic table|proton|neutron|electron|atomic number|valence|ion|isotope/.test(msg))
    return fil
      ? "Ang atom ay may 3 subatomic particles: proton (+, nasa nucleus), neutron (neutral, nasa nucleus), electron (−, sa shells). Atomic number = bilang ng protons. Mass number = protons + neutrons. Ang valence electrons (outermost shell) ang nagde-determine ng reactivity ng element."
      : "An atom has 3 subatomic particles: proton (+, in nucleus), neutron (neutral, in nucleus), electron (−, in shells). Atomic number = number of protons. Mass number = protons + neutrons. Valence electrons (outermost shell) determine an element's reactivity.";

  if (/chemical bond|ionic|covalent|acid|base|\bph\b|neutraliz|oxidation|reduction|reaction|compound|molecule/.test(msg))
    return fil
      ? "Chemical bonding: Ionic bonds ay nagaganap sa pagitan ng metal at non-metal (electron transfer). Covalent bonds ay sa dalawang non-metals (electron sharing). Acids: pH < 7, maraming H⁺. Bases: pH > 7, maraming OH⁻. Neutral = pH 7. Neutralization: acid + base → salt + water."
      : "Chemical bonding: Ionic bonds form between a metal and non-metal (electron transfer). Covalent bonds form between two non-metals (electron sharing). Acids: pH < 7, high H⁺. Bases: pH > 7, high OH⁻. Neutral = pH 7. Neutralization: acid + base → salt + water.";

  // ── SCIENCE – PHYSICS ────────────────────────────────────────────────────
  if (/newton|force|motion|velocity|acceleration|speed|momentum|inertia|friction|gravity|weight/.test(msg))
    return fil
      ? "Newton's 3 Laws: (1) Inertia — ang object ay nananatili sa rest o motion maliban kung may external force. (2) F = ma (Force = mass × acceleration). (3) Bawat action ay may equal at opposite na reaction. Weight = mass × 9.8 m/s². Velocity = displacement ÷ time."
      : "Newton's 3 Laws: (1) Inertia — an object stays at rest or in motion unless acted on by external force. (2) F = ma (Force = mass × acceleration). (3) Every action has an equal and opposite reaction. Weight = mass × 9.8 m/s². Velocity = displacement ÷ time.";

  if (/energy|work|power|kinetic|potential|joule|watt|wave|frequency|wavelength|sound|light|conservation/.test(msg))
    return fil
      ? "Work = Force × distance (Joules). Power = Work ÷ time (Watts). Kinetic Energy = ½mv². Potential Energy = mgh. Law of Conservation of Energy: ang energy ay hindi malilikha o masisirain — nagbabago lang ng form. Wave speed = frequency × wavelength."
      : "Work = Force × distance (Joules). Power = Work ÷ time (Watts). Kinetic Energy = ½mv². Potential Energy = mgh. Law of Conservation of Energy: energy cannot be created or destroyed — only converted. Wave speed = frequency × wavelength.";

  if (/electric|current|voltage|resistance|ohm|circuit|series|parallel|conductor|insulator/.test(msg))
    return fil
      ? "Ohm's Law: V = IR (Voltage = Current × Resistance). Series circuit: Rtotal = R₁ + R₂ + ... (same current sa lahat). Parallel circuit: 1/Rtotal = 1/R₁ + 1/R₂ + ... (same voltage sa bawat branch). Conductors (metal, copper) ay madaling dumaan ang kuryente; insulators (rubber, plastic) ay hindi."
      : "Ohm's Law: V = IR (Voltage = Current × Resistance). Series circuit: Rtotal = R₁ + R₂ + ... (same current throughout). Parallel circuit: 1/Rtotal = 1/R₁ + 1/R₂ + ... (same voltage per branch). Conductors (metal, copper) allow electricity to flow; insulators (rubber, plastic) do not.";

  if (/earth science|volcano|earthquake|plate tectonic|rock|mineral|water cycle|weather|climate|solar system|planet/.test(msg))
    return fil
      ? "Ang Earth ay may 4 layers: crust, mantle, outer core (liquid), inner core (solid). Plate tectonics ang nagpapaliwanag ng earthquakes at volcanoes. Water cycle: evaporation → condensation → precipitation → collection. Solar system: 8 planets — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
      : "Earth has 4 layers: crust, mantle, outer core (liquid), inner core (solid). Plate tectonics explains earthquakes and volcanoes. Water cycle: evaporation → condensation → precipitation → collection. Solar system: 8 planets — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.";

  if (/science|biology|chemistry|physics|scientific method|hypothesis|experiment/.test(msg))
    return fil
      ? "Scientific Method: (1) Obserbahan ang problema, (2) Gumawa ng hypothesis, (3) Mag-eksperimento (kontrolin ang variables), (4) I-analyze ang data, (5) Gumawa ng conclusion. Alin ang gusto mong talakayin — Biology, Chemistry, o Physics?"
      : "Scientific Method: (1) Observe a problem, (2) Form a hypothesis, (3) Experiment (control variables), (4) Analyze data, (5) Draw a conclusion. Which would you like — Biology, Chemistry, or Physics?";

  // ── HISTORY / ARALING PANLIPUNAN ─────────────────────────────────────────
  if (/rizal|noli|fili|bonifacio|katipunan|aguinaldo|edsa|marcos|aquino|philippine history|kasaysayan|revolution|kalayaan/.test(msg))
    return fil
      ? "Mahahalagang events sa kasaysayan ng Pilipinas: Si Rizal ay sumulat ng Noli Me Tangere at El Filibusterismo bilang kritika sa kolonyalismo. Itinatag ni Andres Bonifacio ang Katipunan noong 1892. Ang kalayaan ay idineklara noong Hunyo 12, 1898. Ang EDSA Revolution (1986) ay nagwakas sa diktadura ni Marcos."
      : "Key Philippine history: Rizal wrote Noli Me Tangere and El Filibusterismo to critique colonialism. Andres Bonifacio founded the Katipunan in 1892. Independence was declared on June 12, 1898. The EDSA Revolution (1986) ended the Marcos dictatorship.";

  // ── ENGLISH / FILIPINO GRAMMAR ───────────────────────────────────────────
  if (/grammar|pangngalan|pandiwa|pang-uri|pang-abay|noun|verb|adjective|adverb|pronoun|sentence|essay|paragraph/.test(msg))
    return fil
      ? "Parts of speech: Pangngalan/Noun (tao, lugar, bagay), Pandiwa/Verb (kilos o estado), Pang-uri/Adjective (naglalarawan ng noun), Pang-abay/Adverb (nagpapaliwanag ng verb). Key rule sa English: subject-verb agreement — singular subject = singular verb (She runs), plural = plural (They run)."
      : "Parts of speech: Noun (person, place, thing, idea), Verb (action or state), Adjective (describes a noun), Adverb (modifies a verb). Key rule: subject-verb agreement — singular subject needs singular verb (She runs), plural subject needs plural verb (They run).";

  // ── STUDY HELP ───────────────────────────────────────────────────────────
  if (/memorize|memorya|tandain|study tip|paano mag-aral/.test(msg))
    return fil
      ? "Pinaka-epektibong study techniques: (1) Active recall — subukan mong isulat ang natutunan nang walang tinitingnan. (2) Spaced repetition — mag-review ulit pagkatapos ng 1 araw, 3 araw, 1 linggo. (3) Feynman technique — ipaliwanag ang konsepto sa simpleng salita parang nagtuturo ka. (4) Practice testing — gumawa ng sariling quiz."
      : "Most effective study techniques: (1) Active recall — write what you learned without looking. (2) Spaced repetition — review after 1 day, 3 days, 1 week. (3) Feynman technique — explain the concept in simple words as if teaching. (4) Practice testing — make your own quiz.";

  if (/practice|pagsasanay|recite|recitation/.test(msg))
    return fil
      ? "Gamitin ang Recitation tab para sa structured practice. Mayroon itong 4 na levels: Read-Aloud (+10 XP), Paraphrase (+20 XP), Cold Call (+35 XP), at Stand & Deliver (+50 XP). I-scan ang iyong module tapos piliin ang mode."
      : "Use the Recitation tab for structured practice. It has 4 levels: Read-Aloud (+10 XP), Paraphrase (+20 XP), Cold Call (+35 XP), and Stand & Deliver (+50 XP). Scan your module then choose a mode.";

  if (/help|tulong|confused|nalito|hindi ko maintindihan|di ko gets/.test(msg))
    return fil
      ? "Nandito ako para tumulong! Sa offline mode, kaya kong mag-explain ng Math (Algebra, Geometry, Trigonometry, Statistics), Science (Biology, Chemistry, Physics, Earth Science), Philippine History, at Grammar. Sabihin mo ang paksa!"
      : "I'm here to help! In offline mode I can explain Math (Algebra, Geometry, Trig, Stats), Science (Biology, Chemistry, Physics, Earth Science), Philippine History, and Grammar. Just tell me the topic!";

  // Default
  return fil
    ? "Nasa offline mode kami ngayon. Kaya kong mag-explain ng Math, Science (Biology, Chemistry, Physics), Philippine History, at Grammar kahit walang internet. Subukan mong i-type ang paksa — hal. 'Ipaliwanag ang photosynthesis' o 'Ano ang quadratic formula?'"
    : "I'm in offline mode right now. I can still explain Math, Science (Biology, Chemistry, Physics), Philippine History, and Grammar without internet. Try typing your topic — e.g. 'Explain photosynthesis' or 'What is the quadratic formula?'";
}
